'use client';
import {useEffect,useMemo,useState,type ReactNode} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowUpRight,Disc3,LogIn,LogOut,Plus,RefreshCw,Search,ShieldCheck,Save,LibraryBig} from 'lucide-react';
import {onAuthStateChanged,GoogleAuthProvider,getIdTokenResult,signInWithPopup,signOut,type User} from 'firebase/auth';
import {firebaseConfigured} from '@/lib/firebase/config';
import {getFirebaseServices} from '@/lib/firebase/client';
import {importStarterCatalog,saveSong,subscribeEditorSongs} from '@/lib/firebase/catalog';
import {makeSongId,moodsForEditor,genres,palettes,validateDraft,type SongDraft,type SongRecord} from '@/data/song-schema';
import {UiSelect,type SelectOption} from '@/components/ui/select';
import {UiToaster,notify} from '@/components/ui/toast';
import {ConfirmDialog} from '@/components/ui/confirm-dialog';

const empty:SongDraft={title:'',artist:'',genre:'Salsa',mood:'Romance',note:'',palette:'peach',score:10,featured:false,favorite:false,status:'draft'};
const genreOptions:SelectOption[]=genres.map(value=>({label:value,value}));
const moodOptions:SelectOption[]=moodsForEditor.map(value=>({label:value,value}));
const paletteNames:Record<string,string>={rose:'Rosa',peach:'Durazno',mint:'Menta',lavender:'Lavanda',sky:'Cielo'};
const paletteOptions:SelectOption[]=palettes.map(value=>({label:paletteNames[value],value}));
const statusOptions:SelectOption[]=[{value:'draft',label:'Borrador'},{value:'published',label:'Publicada'}];
const filterOptions:SelectOption[]=[{value:'all',label:'Todas'},{value:'published',label:'Publicadas'},{value:'draft',label:'Borradores'}];

function FormSection({id,index,title,hint,children}:{id:string;index:string;title:string;hint?:string;children:ReactNode}){
 return <section className="studio-form-card" aria-labelledby={id}>
  <div className="studio-card-heading"><span className="studio-card-index" aria-hidden="true">{index}</span><div><h3 id={id}>{title}</h3>{hint&&<p>{hint}</p>}</div></div>
  <div className="studio-form-content">{children}</div>
 </section>;
}

type Pending={kind:'new'}|{kind:'open';id:string};

export default function StudioClient(){
 const [user,setUser]=useState<User|null>(null);
 const [verified,setVerified]=useState(false);
 const [checking,setChecking]=useState(true);
 const [songs,setSongs]=useState<SongRecord[]>([]);
 const [listError,setListError]=useState('');
 const [authError,setAuthError]=useState('');
 const [busy,setBusy]=useState(false);
 const [search,setSearch]=useState('');
 const [statusFilter,setStatusFilter]=useState('all');
 const [selected,setSelected]=useState<string|null>(null);
 const [slug,setSlug]=useState('');
 const [draft,setDraft]=useState<SongDraft>({...empty});
 const [baseline,setBaseline]=useState(JSON.stringify(['',empty]));
 const [mobilePane,setMobilePane]=useState<'catalog'|'editor'>('catalog');
 const [importConfirm,setImportConfirm]=useState(false);
 const [pending,setPending]=useState<Pending|null>(null);
 const services=useMemo(()=>getFirebaseServices(),[]);
 const dirty=JSON.stringify([slug,draft])!==baseline;

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
 useEffect(()=>{if(listError)notify.error('No pudimos actualizar el catálogo.')},[listError]);

 const visible=songs.filter(song=>
  (statusFilter==='all'||song.status===statusFilter)
  && (song.title+' '+song.artist).toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es'))
 );
 function update<K extends keyof SongDraft>(key:K,value:SongDraft[K]){setDraft(current=>({...current,[key]:value}))}
 function open(song:SongRecord){
  const {id,updatedAt,...fields}=song;
  setDraft(fields);setSelected(id);setSlug(id);setBaseline(JSON.stringify([id,fields]));setMobilePane('editor');
 }
 function startNew(){
  const next={...empty};
  setSelected(null);setDraft(next);setSlug('');setBaseline(JSON.stringify(['',next]));setMobilePane('editor');
 }
 function request(action:Pending){
  if(dirty){setPending(action);return}
  run(action);
 }
 function run(action:Pending){
  if(action.kind==='new'){startNew();return}
  const song=songs.find(item=>item.id===action.id);
  if(song)open(song);
 }
 function confirmDiscard(){if(pending)run(pending);setPending(null)}

 async function authenticate(){
  if(!services)return;
  setBusy(true);setAuthError('');
  try{await signInWithPopup(services.auth,new GoogleAuthProvider())}
  catch(err){
   const message=err instanceof Error?err.message:'No se pudo iniciar sesión.';
   setAuthError(message);notify.error('No se pudo iniciar sesión.');
  }finally{setBusy(false)}
 }
 async function save(){
  const id=selected??slug.trim();
  const reason=validateDraft(draft);
  if(reason){notify.error(reason);return}
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||id.length>80){notify.error('La URL debe usar letras, números y guiones.');return}
  if(!selected&&songs.some(song=>song.id===id)){notify.error('Esa URL ya existe.');return}
  setBusy(true);
  try{
   await saveSong(id,draft);
   setSelected(id);setSlug(id);setBaseline(JSON.stringify([id,draft]));
   notify.success(draft.status==='published'?'Canción publicada.':'Borrador guardado.');
  }catch{notify.error('No se pudo guardar. Revisa tu conexión y permisos.')}
  finally{setBusy(false)}
 }
 async function importSongs(){
  setImportConfirm(false);setBusy(true);
  try{
   const count=await importStarterCatalog();
   notify.success(count?count+' canciones importadas.':'El catálogo está actualizado.');
  }catch{notify.error('No se pudo importar el catálogo.')}
  finally{setBusy(false)}
 }

 return <main className="shell studio-page">
  <UiToaster/>
  <nav className="studio-nav" aria-label="Navegación de Studio">
   <Link href="/" className="studio-back"><ArrowLeft size={18} aria-hidden="true"/><span>Ecos del Alma</span></Link>
   <div className="studio-nav-right"><span className="studio-wordmark"><Disc3 size={18} strokeWidth={1.5} aria-hidden="true"/> ECOS STUDIO</span>
    {verified&&<button type="button" className="studio-signout" onClick={()=>services&&void signOut(services.auth)}><LogOut size={16} aria-hidden="true"/> Salir</button>}
   </div>
  </nav>
  <header className="studio-intro"><div><p className="eyebrow">GESTIÓN EDITORIAL</p><h1>Ecos <em>Studio.</em></h1><p>Tu archivo musical, a tu manera.</p></div></header>

  {!firebaseConfigured?<section className="studio-state" role="status"><ShieldCheck size={28}/><h2>Conecta Firebase</h2><p>Configura el archivo .env.local para entrar a Studio.</p></section>
  :checking?<section className="studio-state" role="status"><p>Comprobando acceso…</p></section>
  :!user?<section className="studio-state"><ShieldCheck size={29}/><h2>Acceso privado</h2><p>Inicia sesión con tu cuenta de editor.</p><button type="button" className="ink-button" disabled={busy} onClick={()=>void authenticate()}><LogIn size={17}/> Entrar con Google</button>{authError&&<p role="alert" className="studio-notice">{authError}</p>}</section>
  :!verified?<section className="studio-state"><ShieldCheck size={29}/><h2>Acceso restringido</h2><p>Esta cuenta no tiene permiso de editor.</p><button type="button" className="outline-button" onClick={()=>services&&void signOut(services.auth)}>Cambiar de cuenta</button></section>
  :<>
   <div className="studio-mobile-tabs" role="tablist" aria-label="Secciones del editor">
    <button id="studio-tab-catalog" type="button" role="tab" aria-selected={mobilePane==='catalog'} aria-controls="studio-catalog" tabIndex={mobilePane==='catalog'?0:-1} onClick={()=>setMobilePane('catalog')}>Catálogo <span>{songs.length}</span></button>
    <button id="studio-tab-editor" type="button" role="tab" aria-selected={mobilePane==='editor'} aria-controls="studio-editor" tabIndex={mobilePane==='editor'?0:-1} onClick={()=>setMobilePane('editor')}>Editor {dirty&&<span aria-label="Cambios pendientes">·</span>}</button>
   </div>
   <div className="studio-layout" data-active-pane={mobilePane}>
    <section id="studio-catalog" role="tabpanel" aria-labelledby="studio-tab-catalog" className="studio-list">
     <div className="studio-list-head"><div><h2>Canciones</h2><span className="studio-count" aria-label={songs.length+' canciones'}>{songs.length}</span></div>
      <button className="studio-add" type="button" onClick={()=>request({kind:'new'})}><Plus size={17} aria-hidden="true"/> Nueva</button>
     </div>
     <label className="studio-search"><Search size={18} aria-hidden="true"/><input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Busca por título o artista" aria-label="Buscar canciones"/></label>
     <div className="studio-list-tools"><label className="sr-only" htmlFor="studio-status-filter">Estado</label><UiSelect id="studio-status-filter" value={statusFilter} onValueChange={setStatusFilter} options={filterOptions}/><span>{visible.length} resultados</span></div>
     {listError&&<p className="studio-notice" role="alert">No pudimos actualizar las canciones.</p>}
     <div className="studio-items" role="group" aria-label="Seleccionar canción">
      {visible.map(song=><button type="button" className={`studio-item ${selected===song.id?'active':''}`} key={song.id} onClick={()=>request({kind:'open',id:song.id})} aria-pressed={selected===song.id} title={song.title+' · '+song.artist}>
       <span className="studio-item-info"><strong>{song.title}</strong><small>{song.artist}</small></span>
       <span className="studio-status" data-status={song.status}>{song.status==='published'?'Pública':'Borrador'}</span>
      </button>)}
      {!visible.length&&<p className="studio-list-empty">{songs.length?'No hay coincidencias.':'Aún no hay canciones.'}</p>}
     </div>
     <button className="studio-import" type="button" disabled={busy} onClick={()=>setImportConfirm(true)}><RefreshCw size={16} aria-hidden="true"/> Importar catálogo inicial</button>
    </section>
    <section id="studio-editor" role="tabpanel" aria-labelledby="studio-tab-editor" className="studio-editor">
     <header className="studio-editor-header"><div><p className="eyebrow">EDITOR MUSICAL</p><h2 id="editor-heading">{selected?'Editar canción':'Nueva canción'}</h2></div>
      {selected&&<Link className="studio-visit" href={`/c/${selected}`} target="_blank" rel="noopener noreferrer">Vista pública <ArrowUpRight size={16} aria-hidden="true"/></Link>}
     </header>
     <form onSubmit={event=>{event.preventDefault();void save()}}>
      <FormSection id="studio-identity" index="01" title="Identidad" hint="Lo esencial de cada canción.">
       <div className="studio-field-pair">
        <div className="studio-field"><label htmlFor="song-title">Título</label><input id="song-title" required maxLength={120} value={draft.title} onChange={event=>{update('title',event.target.value);if(!selected)setSlug(makeSongId(event.target.value,draft.artist))}}/></div>
        <div className="studio-field"><label htmlFor="song-artist">Artista</label><input id="song-artist" required maxLength={120} value={draft.artist} onChange={event=>update('artist',event.target.value)}/></div>
       </div>
       <div className="studio-field"><label htmlFor="song-slug">URL corta</label><input id="song-slug" required maxLength={80} value={slug} disabled={Boolean(selected)} onChange={event=>setSlug(event.target.value.toLowerCase())} spellCheck={false}/><small className="studio-field-hint">/c/{slug||'nombre-cancion'}</small></div>
      </FormSection>
      <FormSection id="studio-story" index="02" title="Historia" hint="Una descripción breve y memorable.">
       <div className="studio-field"><label htmlFor="song-note">Descripción</label><textarea id="song-note" required rows={4} maxLength={500} value={draft.note} onChange={event=>update('note',event.target.value)}/><small className="studio-field-hint">{draft.note.length}/500 caracteres</small></div>
      </FormSection>
      <FormSection id="studio-classification" index="03" title="Clasificación">
       <div className="studio-field-pair">
        <div className="studio-field"><label htmlFor="song-genre">Género</label><UiSelect id="song-genre" value={draft.genre} onValueChange={value=>update('genre',value as SongDraft['genre'])} options={genreOptions}/></div>
        <div className="studio-field"><label htmlFor="song-mood">Emoción</label><UiSelect id="song-mood" value={draft.mood} onValueChange={value=>update('mood',value as SongDraft['mood'])} options={moodOptions}/></div>
        <div className="studio-field"><label htmlFor="song-score">Nota editorial (1–10)</label><input id="song-score" type="number" min={1} max={10} step={1} value={draft.score??''} onChange={event=>update('score',event.target.value===''?undefined:Number(event.target.value))}/></div>
        <div className="studio-field"><label htmlFor="song-palette">Paleta</label><UiSelect id="song-palette" value={draft.palette} onValueChange={value=>update('palette',value)} options={paletteOptions}/></div>
       </div>
      </FormSection>
      <FormSection id="studio-publication" index="04" title="Publicación" hint="Controla qué aparece en el archivo.">
       <div className="studio-field studio-status-field"><label htmlFor="song-publication">Estado</label><UiSelect id="song-publication" value={draft.status} onValueChange={value=>update('status',value as SongDraft['status'])} options={statusOptions}/></div>
       <div className="studio-options"><label><input type="checkbox" checked={draft.featured===true} onChange={event=>update('featured',event.target.checked)}/> Destacada</label><label><input type="checkbox" checked={draft.favorite===true} onChange={event=>update('favorite',event.target.checked)}/> Favorita editorial</label></div>
      </FormSection>
      <div className="studio-savebar">
       <span className="studio-save-state" aria-live="polite">{dirty?'Cambios sin guardar':selected?'Edición guardada':'Lista para guardar'}</span>
       <button type="submit" className="ink-button" disabled={busy}><Save size={17} aria-hidden="true"/>{busy?'Guardando…':'Guardar canción'}</button>
      </div>
     </form>
    </section>
   </div>
   <ConfirmDialog open={importConfirm} onOpenChange={setImportConfirm} title="Importar catálogo" description="Se añadirán las canciones iniciales que aún no existan en Firestore. Las actuales se conservarán." confirmLabel="Importar canciones" onConfirm={()=>void importSongs()} busy={busy}/>
   <ConfirmDialog open={pending!==null} onOpenChange={open=>{if(!open)setPending(null)}} title="¿Descartar cambios?" description="Tienes cambios sin guardar. Si continúas, se perderán." confirmLabel="Descartar cambios" onConfirm={confirmDiscard}/>
  </>}
 </main>;
}
