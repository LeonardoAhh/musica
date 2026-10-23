'use client';
import {useEffect,useMemo,useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {onAuthStateChanged,GoogleAuthProvider,getIdTokenResult,signInWithPopup,signOut,type User} from 'firebase/auth';
import {BadgeCheck,Check,CheckCheck,LogOut,RotateCcw} from 'lucide-react';
import {firebaseConfigured} from '@/lib/firebase/config';
import {getFirebaseServices} from '@/lib/firebase/client';
import type {SongSuggestion} from '@/data/song-suggestion';
import {SkeletonLine} from '@/components/section-skeletons';
import {UiToaster,notify} from '@/components/ui/toast';
import {StudioAccessScreen,StudioAccessSkeleton} from '@/components/studio/studio-access-screen';
import {studioSignInError} from '@/lib/firebase/auth-errors';

const PAGE_SIZE=3;

export default function StudioSuggestionsClient(){
 const services=useMemo(()=>getFirebaseServices(),[]);
 const [user,setUser]=useState<User|null>(null);
 const [checking,setChecking]=useState(true);
 const [verified,setVerified]=useState(false);
 const [authError,setAuthError]=useState('');
 const [authBusy,setAuthBusy]=useState(false);
 const [items,setItems]=useState<SongSuggestion[]>([]);
 const [loading,setLoading]=useState(true);
 const [listError,setListError]=useState('');
 const [busyId,setBusyId]=useState('');
 const [page,setPage]=useState(0);
 const [cursors,setCursors]=useState<string[]>(['']);
 const [nextCursor,setNextCursor]=useState<string|null>(null);
 const [retry,setRetry]=useState(0);

 useEffect(()=>{
  if(!services){setChecking(false);return}
  let active=true;
  const unsubscribe=onAuthStateChanged(services.auth,async next=>{
   if(!active)return;
   setChecking(true);setUser(next);setVerified(false);
   if(next){
    try{const token=await getIdTokenResult(next,true);if(active)setVerified(token.claims.admin===true)}
    catch{if(active)setVerified(false)}
   }
   if(active)setChecking(false);
  },()=>{if(active){setChecking(false);setVerified(false)}});
  return()=>{active=false;unsubscribe()};
 },[services]);

 useEffect(()=>{
  if(!verified||!user)return;
  let active=true;
  setLoading(true);setListError('');
  const cursor=cursors[page];
  const url=`/api/studio/song-suggestions${cursor?`?cursor=${encodeURIComponent(cursor)}`:''}`;
  user.getIdToken().then(token=>fetch(url,{headers:{Authorization:`Bearer ${token}`},cache:'no-store'})).then(async response=>{
   const data=await response.json() as {items?:SongSuggestion[];nextCursor?:string|null;error?:string};
   if(!response.ok)throw Error(data.error||'No pudimos cargar las sugerencias.');
   if(active){setItems(data.items??[]);setNextCursor(data.nextCursor??null);setLoading(false)}
  }).catch(error=>{if(active){setItems([]);setNextCursor(null);setListError(error instanceof Error?error.message:'No pudimos cargar las sugerencias.');setLoading(false)}});
  return()=>{active=false};
 },[verified,user,page,cursors,retry]);

 async function authenticate(){
  if(!services)return;
  setAuthBusy(true);setAuthError('');
  try{await signInWithPopup(services.auth,new GoogleAuthProvider())}
  catch(error){setAuthError(studioSignInError(error))}
  finally{setAuthBusy(false)}
 }

 async function markAdded(id:string){
  if(!user||busyId)return;
  setBusyId(id);
  try{
   const response=await fetch('/api/studio/song-suggestions',{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${await user.getIdToken()}`},body:JSON.stringify({id,status:'added'})});
   const data=await response.json() as {error?:string};
   if(!response.ok)throw Error(data.error||'No pudimos actualizar la sugerencia.');
   setItems(current=>current.map(item=>item.id===id?{...item,status:'added',addedAt:new Date().toISOString()}:item));
   notify.success('Canción marcada como agregada.');
  }catch(error){notify.error(error instanceof Error?error.message:'No pudimos actualizar la sugerencia.')}
  finally{setBusyId('')}
 }

 function nextPage(){if(!nextCursor)return;setCursors(current=>[...current.slice(0,page+1),nextCursor]);setPage(current=>current+1)}

 return <main id="inicio" tabIndex={-1} className={`shell studio-page studio-suggestions-page${verified?'':' studio-page-access'}`}>
  <UiToaster/>
  <header className="studio-nav">
   <Link className="studio-brand" href="/studio"><Image src="/icon.svg" alt="" width={36} height={36} unoptimized/><span>Ecos Studio</span></Link>
   <div className="studio-nav-right">{verified&&<button type="button" className="studio-signout" onClick={()=>services&&void signOut(services.auth)}><LogOut size={16} aria-hidden="true"/> Salir</button>}</div>
  </header>
  {!firebaseConfigured?<StudioAccessScreen mode="unavailable"/>
  :checking?<StudioAccessSkeleton/>
  :!user||user.isAnonymous?<StudioAccessScreen mode="login" busy={authBusy} error={authError} onSignIn={()=>void authenticate()}/>
  :!verified?<StudioAccessScreen mode="restricted" onChangeAccount={()=>services&&void signOut(services.auth)}/>
  :<section className="studio-suggestions" aria-labelledby="studio-suggestions-heading">
    <div className="studio-suggestions-heading"><div><p className="eyebrow">SOLICITUDES DEL ARCHIVO</p><h1 id="studio-suggestions-heading">Canciones sugeridas</h1></div><p>Revisa los títulos que comparte la comunidad y marca los que ya incorporaste.</p></div>
    <div className="studio-suggestions-grid" aria-busy={loading}>
     {loading?Array.from({length:PAGE_SIZE},(_,index)=><div className="studio-suggestion-card studio-suggestion-skeleton" key={index} aria-hidden="true"><SkeletonLine width="85px" height="12px"/><SkeletonLine width="75%" height="30px"/><SkeletonLine width="120px" height="13px"/></div>)
     :items.map(item=><article className="studio-suggestion-card" data-status={item.status} key={item.id}>
       <div className="studio-suggestion-top"><span className="studio-status" data-status={item.status}>{item.status==='added'&&<BadgeCheck size={15} aria-hidden="true"/>}{item.status==='added'?'Agregada':'Pendiente'}</span>{item.createdAt&&<time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString('es-MX',{dateStyle:'medium'})}</time>}</div>
       <h2>{item.title}</h2>
       {item.status==='pending'?<button type="button" className="outline-button" disabled={Boolean(busyId)} onClick={()=>void markAdded(item.id)}><Check size={17} aria-hidden="true"/>{busyId===item.id?'Guardando…':'Marcar como agregada'}</button>:<p className="studio-suggestion-done"><CheckCheck size={17} aria-hidden="true"/> Ya está en el archivo</p>}
      </article>)}
     {!loading&&listError&&<div className="studio-suggestions-empty studio-suggestions-failure" role="alert"><h2>Sugerencias no disponibles.</h2><p>{listError}</p><button type="button" className="outline-button" onClick={()=>setRetry(current=>current+1)}><RotateCcw size={16} aria-hidden="true"/> Reintentar</button></div>}
     {!loading&&!listError&&!items.length&&<div className="studio-suggestions-empty"><h2>Sin sugerencias todavía.</h2><p>Las solicitudes nuevas aparecerán aquí.</p></div>}
    </div>
    {!listError&&<nav className="studio-pagination" aria-label="Páginas de sugerencias"><button type="button" className="outline-button" onClick={()=>setPage(current=>Math.max(0,current-1))} disabled={page===0||loading}>Anterior</button><span aria-live="polite">Página {page+1}</span><button type="button" className="outline-button" onClick={nextPage} disabled={!nextCursor||loading}>Siguiente</button></nav>}
   </section>}
 </main>;
}
