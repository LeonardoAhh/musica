'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowUpRight,Disc3,LogIn,LogOut,Plus,RefreshCw,Search,ShieldCheck,Save} from 'lucide-react';
import {onAuthStateChanged,GoogleAuthProvider,getIdTokenResult,signInWithPopup,signOut,type User} from 'firebase/auth';
import {firebaseConfigured} from '@/lib/firebase/config';
import {getFirebaseServices} from '@/lib/firebase/client';
import {importStarterCatalog,saveSong,subscribeEditorSongs} from '@/lib/firebase/catalog';
import {makeSongId,moodsForEditor,genres,palettes,validateDraft,type SongDraft,type SongRecord} from '@/data/song-schema';

const empty:SongDraft={title:'',artist:'',genre:'Salsa',mood:'Romance',note:'',palette:'peach',score:10,featured:false,favorite:false,status:'draft'};
export default function StudioClient(){
 const [user,setUser]=useState<User|null>(null);
 const [verified,setVerified]=useState(false);
 const [checking,setChecking]=useState(true);
 const [songs,setSongs]=useState<SongRecord[]>([]);
 const [listError,setListError]=useState('');
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 const [search,setSearch]=useState('');
 const [selected,setSelected]=useState<string|null>(null);
 const [slug,setSlug]=useState('');
 const [draft,setDraft]=useState<SongDraft>(empty);
 const services=useMemo(()=>getFirebaseServices(),[]);
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
  if(!verified)return;
  return subscribeEditorSongs(items=>{setSongs(items);setListError('')},error=>setListError(error.message));
 },[verified]);
 const visible=songs.filter(song=>(song.title+' '+song.artist).toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es')));
 function update<K extends keyof SongDraft>(key:K,value:SongDraft[K]){setDraft(current=>({...current,[key]:value}))}
 function open(song:SongRecord){const {id,updatedAt,...fields}=song;setDraft(fields);setSelected(id);setSlug(id);setMessage('')}
 function startNew(){setSelected(null);setDraft({...empty});setSlug('');setMessage('')}
 async function authenticate(){
  if(!services)return;
  setBusy(true);setMessage('');
  try{await signInWithPopup(services.auth,new GoogleAuthProvider())}
  catch(err){setMessage(err instanceof Error?err.message:'No se pudo iniciar sesión.')}
  finally{setBusy(false)}
 }
 async function save(){
  const id=selected??slug.trim();
  const reason=validateDraft(draft);
  if(reason){setMessage(reason);return}
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||id.length>80){setMessage('La URL debe usar letras minúsculas, números y guiones.');return}
  if(!selected&&songs.some(song=>song.id===id)){setMessage('Ya existe esa URL. Elige otra.');return}
  setBusy(true);setMessage('');
  try{await saveSong(id,draft);setSelected(id);setSlug(id);setMessage(draft.status==='published'?'Canción publicada.':'Borrador guardado.')}
  catch(err){setMessage(err instanceof Error?err.message:'No se pudo guardar.')}
  finally{setBusy(false)}
 }
 async function importSongs(){
  if(!window.confirm('¿Importar las canciones que todavía no existen en Firestore?'))return;
  setBusy(true);setMessage('');
  try{const count=await importStarterCatalog();setMessage(count?count+' canciones importadas.':'El catálogo ya está importado.')}
  catch(err){setMessage(err instanceof Error?err.message:'Error al importar.')}
  finally{setBusy(false)}
 }
 return <main className="shell studio-page">
 <nav className="studio-nav" aria-label="Navegación Studio"><Link href="/" className="back-link"><ArrowLeft size={17}/> Ecos del Alma</Link><span><Disc3 size={19}/> ECOS STUDIO</span></nav>
 <header className="studio-intro"><div><p className="eyebrow">GESTIÓN EDITORIAL</p><h1>Ecos <em>Studio.</em></h1><p>Tu catálogo, en un solo lugar.</p></div>{verified&&<button type="button" className="outline-button" onClick={()=>services&&void signOut(services.auth)}><LogOut size={16}/> Salir</button>}</header>
 {!firebaseConfigured?<div className="studio-state" role="status"><ShieldCheck size={28}/><h2>Conecta Firebase</h2><p>Agrega las variables a .env.local para activar Studio.</p></div>
 :checking?<div className="studio-state" role="status"><p>Comprobando acceso…</p></div>
 :!user?<div className="studio-state"><ShieldCheck size={29}/><h2>Acceso privado</h2><p>Entra con tu cuenta de administrador.</p><button type="button" className="ink-button" disabled={busy} onClick={()=>void authenticate()}><LogIn size={17}/> Entrar con Google</button>{message&&<p role="alert" className="studio-notice">{message}</p>}</div>
 :!verified?<div className="studio-state"><ShieldCheck size={29}/><h2>Acceso restringido</h2><p>Tu cuenta no tiene permiso de editor. Un administrador debe asignarte el rol.</p><button type="button" className="outline-button" onClick={()=>services&&void signOut(services.auth)}>Cambiar de cuenta</button></div>
 :<div className="studio-layout"><section aria-label="Canciones del catálogo" className="studio-list">
  <div className="studio-list-head"><h2>Canciones <small>{songs.length}</small></h2><button className="studio-add" type="button" onClick={startNew}><Plus size={18}/> Nueva</button></div>
  <label className="studio-search"><Search size={18}/><input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Buscar canciones" aria-label="Buscar canciones"/></label>
  {listError&&<p className="studio-notice" role="alert">{listError}</p>}
  <div className="studio-items">{visible.map(song=><button type="button" className={`studio-item ${selected===song.id?'active':''}`} key={song.id} onClick={()=>open(song)} aria-pressed={selected===song.id}><span><strong>{song.title}</strong><small>{song.artist}</small></span><span className="studio-status">{song.status==='published'?'Pública':'Borrador'}</span></button>)}</div>
  {!songs.length&&<p className="studio-list-empty">Aún no hay canciones en Firestore.</p>}
  <button className="studio-import" type="button" disabled={busy} onClick={()=>void importSongs()}><RefreshCw size={16}/> Importar catálogo inicial</button>
 </section>
 <section className="studio-editor" aria-labelledby="editor-heading">
  <div className="studio-editor-header"><div><p className="eyebrow">EDITOR MUSICAL</p><h2 id="editor-heading">{selected?'Editar canción':'Nueva canción'}</h2></div>{selected&&<Link className="studio-visit" href={`/c/${selected}`} target="_blank" rel="noopener noreferrer">Vista pública <ArrowUpRight size={16}/></Link>}</div>
  <form onSubmit={event=>{event.preventDefault();void save()}}>
   <div className="studio-field-pair">
    <label>Título<input required maxLength={120} value={draft.title} onChange={event=>{update('title',event.target.value);if(!selected)setSlug(makeSongId(event.target.value,draft.artist))}}/></label>
    <label>Artista<input required maxLength={120} value={draft.artist} onChange={event=>update('artist',event.target.value)}/></label>
   </div>
   <label>URL corta<input required maxLength={80} value={slug} disabled={Boolean(selected)} onChange={event=>setSlug(event.target.value.toLowerCase())} spellCheck={false}/><span className="studio-field-hint">/c/{slug||'nombre-cancion'}</span></label>
   <div className="studio-field-pair">
    <label>Género<select value={draft.genre} onChange={event=>update('genre',event.target.value as SongDraft['genre'])}>{genres.map(option=><option value={option} key={option}>{option}</option>)}</select></label>
    <label>Emoción<select value={draft.mood} onChange={event=>update('mood',event.target.value as SongDraft['mood'])}>{moodsForEditor.map(option=><option value={option} key={option}>{option}</option>)}</select></label>
   </div>
   <label>Descripción<textarea required rows={3} maxLength={500} value={draft.note} onChange={event=>update('note',event.target.value)}/></label>
   <div className="studio-field-pair">
    <label>Nota editorial (1–10)<input type="number" min="1" max="10" step="1" value={draft.score??''} onChange={event=>update('score',event.target.value===''?undefined:Number(event.target.value))}/></label>
    <label>Paleta<select value={draft.palette} onChange={event=>update('palette',event.target.value)}>{palettes.map(option=><option value={option} key={option}>{option}</option>)}</select></label>
   </div>
   <div className="studio-options"><label><input type="checkbox" checked={draft.featured===true} onChange={event=>update('featured',event.target.checked)}/> Destacada</label><label><input type="checkbox" checked={draft.favorite===true} onChange={event=>update('favorite',event.target.checked)}/> Favorita editorial</label></div>
   <label>Publicación<select value={draft.status} onChange={event=>update('status',event.target.value as SongDraft['status'])}><option value="draft">Borrador</option><option value="published">Publicada</option></select></label>
   {message&&<p className="studio-notice" role="status">{message}</p>}
   <button type="submit" className="ink-button" disabled={busy}><Save size={17}/>{busy?'Guardando…':'Guardar canción'}</button>
  </form>
 </section></div>}
 </main>;
}
