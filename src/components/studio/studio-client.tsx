'use client';
import {useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight,ChevronLeft,ImagePlus,Inbox,Plus,Search,Save,Sparkles} from 'lucide-react';
import {onAuthStateChanged,GoogleAuthProvider,getIdTokenResult,signInWithPopup,signOut,type User} from 'firebase/auth';
import type {DocumentSnapshot} from 'firebase/firestore';
import {firebaseConfigured} from '@/lib/firebase/config';
import {getFirebaseServices} from '@/lib/firebase/client';
import {getEditorSongsPage,saveSong,songIdExists} from '@/lib/firebase/catalog';
import {makeSongId,moodsForEditor,genres,palettes,validateDraft,type SongDraft,type SongRecord} from '@/data/song-schema';
import {UiSelect,type SelectOption} from '@/components/ui/select';
import {UiToaster,notify} from '@/components/ui/toast';
import {ConfirmDialog} from '@/components/ui/confirm-dialog';
import {ResponsiveDialog} from '@/components/ui/responsive-dialog';
import {SkeletonLine} from '@/components/section-skeletons';
import {StudioAccessScreen,StudioAccessSkeleton} from '@/components/studio/studio-access-screen';
import {studioSignInError} from '@/lib/firebase/auth-errors';
import {StudioAccountActions} from '@/components/studio/studio-account-actions';

const empty:SongDraft={title:'',artist:'',genre:'Salsa',mood:'Romance',note:'',palette:'peach',score:10,featured:false,favorite:false,status:'draft'};
const genreOptions:SelectOption[]=genres.map(value=>({label:value,value}));
const moodOptions:SelectOption[]=moodsForEditor.map(value=>({label:value,value}));
const paletteNames:Record<string,string>={rose:'Rosa',peach:'Durazno',mint:'Menta',lavender:'Lavanda',sky:'Cielo'};
const paletteOptions:SelectOption[]=palettes.map(value=>({label:paletteNames[value],value}));
const statusOptions:SelectOption[]=[{value:'draft',label:'Borrador'},{value:'published',label:'Publicada'}];
const filterOptions:SelectOption[]=[{value:'all',label:'Todas'},{value:'published',label:'Publicadas'},{value:'draft',label:'Borradores'}];
type ImageSuggestion={title:string;artist:string;note:string;genre:string;mood:string};

function FormSection({id,index,title,hint,children}:{id:string;index:string;title:string;hint?:string;children:ReactNode}){
 return <section className="studio-form-card" aria-labelledby={id}>
  <div className="studio-card-heading"><span className="studio-card-index" aria-hidden="true">{index}</span><div><h3 id={id}>{title}</h3>{hint&&<p>{hint}</p>}</div></div>
  <div className="studio-form-content">{children}</div>
 </section>;
}

function StudioSongsSkeleton(){return <div className="studio-skeleton-grid" role="status" aria-label="Cargando canciones">{Array.from({length:3},(_,index)=><div className="studio-song-card studio-song-skeleton" aria-hidden="true" key={index}><SkeletonLine width="75px" height="24px"/><SkeletonLine width="80%" height="29px"/><SkeletonLine width="55%" height="13px"/><SkeletonLine width="65%" height="12px"/></div>)}</div>}

type Pending={kind:'new'}|{kind:'open';id:string}|{kind:'close'};

export default function StudioClient(){
 const [user,setUser]=useState<User|null>(null);
 const [verified,setVerified]=useState(false);
 const [checking,setChecking]=useState(true);
 const [songs,setSongs]=useState<SongRecord[]>([]);
 const [page,setPage]=useState(0);
 const [cursors,setCursors]=useState<(DocumentSnapshot|null)[]>([null]);
 const [lastCursor,setLastCursor]=useState<DocumentSnapshot|null>(null);
 const [hasMore,setHasMore]=useState(false);
 const [loadingSongs,setLoadingSongs]=useState(true);
 const [refreshSongs,setRefreshSongs]=useState(0);
 const [listError,setListError]=useState('');
 const [authError,setAuthError]=useState('');
 const [busy,setBusy]=useState(false);
 const [search,setSearch]=useState('');
 const [statusFilter,setStatusFilter]=useState('all');
 const [selected,setSelected]=useState<string|null>(null);
 const [slug,setSlug]=useState('');
 const [draft,setDraft]=useState<SongDraft>({...empty});
 const [imageData,setImageData]=useState('');
 const [imageMime,setImageMime]=useState('');
 const [imageName,setImageName]=useState('');
 const [imageSuggestion,setImageSuggestion]=useState<ImageSuggestion|null>(null);
 const [analyzingImage,setAnalyzingImage]=useState(false);
 const [baseline,setBaseline]=useState(JSON.stringify(['',empty]));
 const [editorOpen,setEditorOpen]=useState(false);
 const [editorStep,setEditorStep]=useState(0);
 const [identityMode,setIdentityMode]=useState<'fields'|'image'>('fields');
 const stepPanelRef=useRef<HTMLDivElement>(null);
 const discardConfirmed=useRef(false);
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
  let active=true;
  setLoadingSongs(true);
  setSongs([]);setHasMore(false);
  getEditorSongsPage(statusFilter,cursors[page]??null).then(result=>{
   if(!active)return;
   setSongs(result.items);setLastCursor(result.last);setHasMore(result.hasMore);setListError('');setLoadingSongs(false);
  }).catch(error=>{if(active){setListError(error instanceof Error?error.message:'No pudimos cargar las canciones.');setLoadingSongs(false)}});
  return()=>{active=false};
 },[verified,statusFilter,page,cursors,refreshSongs]);
 useEffect(()=>{if(listError)notify.error('No pudimos actualizar el catálogo.')},[listError]);

 const visible=songs.filter(song=>(song.title+' '+song.artist).toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es')));
 function changeFilter(value:string){setStatusFilter(value);setPage(0);setCursors([null]);setSearch('')}
 function nextPage(){if(!hasMore||!lastCursor)return;setCursors(current=>[...current.slice(0,page+1),lastCursor]);setPage(current=>current+1);setSearch('')}
 function previousPage(){if(!page)return;setPage(current=>current-1);setSearch('')}
 function update<K extends keyof SongDraft>(key:K,value:SongDraft[K]){setDraft(current=>({...current,[key]:value}))}
 function open(song:SongRecord){
  const {id,updatedAt,...fields}=song;
  setImageData('');setImageSuggestion(null);
  setDraft(fields);setSelected(id);setSlug(id);setBaseline(JSON.stringify([id,fields]));setEditorStep(0);setIdentityMode('fields');setEditorOpen(true);
 }
 function startNew(){
  const next={...empty};
  setImageData('');setImageSuggestion(null);
  setSelected(null);setDraft(next);setSlug('');setBaseline(JSON.stringify(['',next]));setEditorStep(0);setIdentityMode('fields');setEditorOpen(true);
 }
 function request(action:Pending){
  if(dirty){setPending(action);if(action.kind==='close')setEditorOpen(false);return}
  run(action);
 }
 function run(action:Pending){
  if(action.kind==='new'){startNew();return}
  if(action.kind==='close'){setEditorOpen(false);return}
  const song=songs.find(item=>item.id===action.id);
  if(song)open(song);
 }
 function confirmDiscard(){discardConfirmed.current=true;if(pending)run(pending);setPending(null)}
 function cancelDiscard(){if(discardConfirmed.current){discardConfirmed.current=false;setPending(null);return}const closing=pending?.kind==='close';setPending(null);if(closing)setEditorOpen(true)}
 function advanceStep(){
  const panel=stepPanelRef.current;
  if(panel&&!panel.querySelector(':invalid')){setEditorStep(current=>Math.min(current+1,3));return}
  const invalid=panel?.querySelector<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>(':invalid');
  invalid?.focus();
  invalid?.reportValidity();
 }
 function selectImage(file?:File){
  if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>4*1024*1024){notify.error('Usa una imagen JPG, PNG o WebP de hasta 4 MB.');return}
  setImageSuggestion(null);setImageName(file.name);setImageMime(file.type);
  const reader=new FileReader();
  reader.onload=()=>{if(typeof reader.result==='string')setImageData(reader.result)};
  reader.onerror=()=>notify.error('No se pudo leer la imagen.');
  reader.readAsDataURL(file);
 }
 async function analyzeImage(){
  if(!imageData||!user)return;
  setAnalyzingImage(true);setImageSuggestion(null);
  try{
   const response=await fetch('/api/studio/extract-song',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${await user.getIdToken()}`},body:JSON.stringify({mimeType:imageMime,data:imageData.split(',')[1]})});
   const result=await response.json();
   if(!response.ok)throw Error(result.error||'No se pudo analizar la imagen.');
   setImageSuggestion(result as ImageSuggestion);
  }catch(error){notify.error(error instanceof Error?error.message:'No se pudo analizar la imagen.')}
  finally{setAnalyzingImage(false)}
 }
 function applyImageSuggestion(){
  if(!imageSuggestion)return;
  setDraft(current=>({...current,...(imageSuggestion.title?{title:imageSuggestion.title}:{}),...(imageSuggestion.artist?{artist:imageSuggestion.artist}:{}),...(imageSuggestion.note?{note:imageSuggestion.note}:{}),...(imageSuggestion.genre?{genre:imageSuggestion.genre as SongDraft['genre']}:{}),...(imageSuggestion.mood?{mood:imageSuggestion.mood as SongDraft['mood']}:{}),}));
  if(!selected&&imageSuggestion.title)setSlug(makeSongId(imageSuggestion.title,imageSuggestion.artist||draft.artist));
  setImageSuggestion(null);setIdentityMode('fields');notify.success('Sugerencias aplicadas. Revisa los campos antes de guardar.');
 }

 async function authenticate(){
  if(!services)return;
  setBusy(true);setAuthError('');
  try{await signInWithPopup(services.auth,new GoogleAuthProvider())}
  catch(error){setAuthError(studioSignInError(error))}
  finally{setBusy(false)}
 }
 async function save(){
  const id=selected??slug.trim();
  const reason=validateDraft(draft);
  if(reason){notify.error(reason);return}
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||id.length>80){notify.error('La URL debe usar letras, números y guiones.');return}
  setBusy(true);
  try{
   if(!selected&&await songIdExists(id)){notify.error('Esa URL ya existe.');return}
   await saveSong(id,draft);
   setSelected(id);setSlug(id);setBaseline(JSON.stringify([id,draft]));
   notify.success(draft.status==='published'?'Canción publicada.':'Borrador guardado.');
   setEditorOpen(false);
   setRefreshSongs(current=>current+1);
  }catch{notify.error('No se pudo guardar. Revisa tu conexión y permisos.')}
  finally{setBusy(false)}
 }
 return <main id="inicio" tabIndex={-1} className={`shell studio-page${verified?'':' studio-page-access'}`}>
  <UiToaster/>
  <header className="studio-nav">
   <span className="studio-brand"><Image src="/icon.svg" alt="" width={36} height={36} unoptimized/><span>Ecos Studio</span></span>
   <div className="studio-nav-right">
    {verified&&<Link className="studio-suggestions-link" href="/studio/suggestions" aria-label="Ver sugerencias de canciones"><Inbox size={17} aria-hidden="true"/><span>Sugerencias</span></Link>}
    {verified&&<StudioAccountActions onSignOut={()=>services&&void signOut(services.auth)} onRefresh={()=>{setRefreshSongs(current=>current+1)}} refreshing={loadingSongs}/> }
   </div>
  </header>
  {!firebaseConfigured?<StudioAccessScreen mode="unavailable"/>
  :checking?<StudioAccessSkeleton/>
  :!user||user.isAnonymous?<StudioAccessScreen mode="login" busy={busy} error={authError} onSignIn={()=>void authenticate()}/>
  :!verified?<StudioAccessScreen mode="restricted" onChangeAccount={()=>services&&void signOut(services.auth)}/>
  :<>
   <div className="studio-layout">
    <section id="studio-catalog" aria-label="Canciones del catálogo" className="studio-list">
     <div className="studio-list-head"><div><h2>Canciones</h2></div>
      <button className="studio-add" type="button" aria-label="Nueva canción" onClick={()=>request({kind:'new'})}><Plus size={17} aria-hidden="true"/> Nueva</button>
     </div>
     <label className="studio-search"><Search size={18} aria-hidden="true"/><input type="search" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Busca en esta página" aria-label="Buscar por título o artista en esta página"/></label>
     <div className="studio-list-tools"><label className="sr-only" htmlFor="studio-status-filter">Estado</label><UiSelect id="studio-status-filter" value={statusFilter} onValueChange={changeFilter} options={filterOptions}/><span>{visible.length} en esta página</span></div>
     {listError&&<p className="studio-notice" role="alert">No pudimos actualizar las canciones.</p>}
     <div className="studio-items" aria-label="Canciones guardadas">
      {visible.map(song=><article className="studio-song-card" key={song.id}>
       <button type="button" onClick={()=>request({kind:'open',id:song.id})} aria-label={`Editar ${song.title} de ${song.artist}`}>
        <span className="studio-song-card-top"><span className="studio-status" data-status={song.status}>{song.status==='published'?'Pública':'Borrador'}</span><span className="studio-song-card-action">Editar <ArrowRight size={15} aria-hidden="true"/></span></span>
        <strong>{song.title}</strong><span className="studio-song-artist">{song.artist}</span>
        <span className="studio-song-meta">{song.genre} · {song.mood}</span>
       </button>
      </article>)}
      {loadingSongs&&<StudioSongsSkeleton/>}
      {!loadingSongs&&!listError&&!visible.length&&<p className="studio-list-empty">{search?'No hay coincidencias en esta página.':'No hay canciones en esta página.'}</p>}
     </div>
     <nav className="studio-pagination" aria-label="Páginas de canciones"><button type="button" className="outline-button" onClick={previousPage} disabled={page===0||loadingSongs}>Anterior</button><span aria-live="polite">Página {page+1}</span><button type="button" className="outline-button" onClick={nextPage} disabled={!hasMore||loadingSongs}>Siguiente</button></nav>
     </section>
   </div>
   <ResponsiveDialog open={editorOpen} onOpenChange={open=>{if(open)setEditorOpen(true);else request({kind:'close'})}} titleId="studio-editor-heading" headerLabel="ECOS STUDIO / CANCIONES" closeLabel="Cerrar editor" className="studio-editor-dialog">
    <form className="studio-wizard" onSubmit={event=>{event.preventDefault();if(editorStep===3)void save();else advanceStep()}}>
     <div className="studio-wizard-header"><h2 id="studio-editor-heading" tabIndex={-1} data-dialog-initial-focus>{selected?'Editar canción':'Nueva canción'}</h2><p>Completa los pasos de la ficha musical.</p></div>
     <nav className="studio-wizard-steps" aria-label="Pasos de la canción">
      {['Identidad','Historia','Clasificación','Publicación'].map((title,index)=><button key={title} type="button" className={editorStep===index?'is-current':''} aria-label={`${title}, paso ${index+1} de 4`} aria-current={editorStep===index?'step':undefined} disabled={index>editorStep} onClick={()=>index<editorStep&&setEditorStep(index)}><span>{`0${index+1}`}</span><span className="studio-step-title">{title}</span></button>)}
     </nav>
     <div className="studio-wizard-body" ref={stepPanelRef}>
      {editorStep===0&&<>
       <div className="studio-identity-modes" role="group" aria-label="Forma de completar la identidad"><button type="button" className={identityMode==='fields'?'is-current':''} aria-pressed={identityMode==='fields'} onClick={()=>setIdentityMode('fields')}>Completar campos</button><button type="button" className={identityMode==='image'?'is-current':''} aria-pressed={identityMode==='image'} onClick={()=>setIdentityMode('image')}><ImagePlus size={16} aria-hidden="true"/> Desde una imagen</button></div>
       {identityMode==='image'?<>
       <section className="studio-image-assist" aria-labelledby="studio-image-assist-title">
        <div><h3 id="studio-image-assist-title"><ImagePlus size={18} aria-hidden="true"/> Completar desde una imagen</h3><p>Sube una captura o portada con datos visibles. Revisarás las sugerencias antes de aplicarlas.</p></div>
        {imageSuggestion?<div className="studio-image-suggestion" role="region" aria-label="Datos sugeridos"><div><strong>Datos detectados</strong><dl>{([['Título',imageSuggestion.title],['Artista',imageSuggestion.artist],['Descripción',imageSuggestion.note],['Género',imageSuggestion.genre],['Emoción',imageSuggestion.mood]] as const).filter(([,value])=>Boolean(value)).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{!imageSuggestion.note&&<p>La imagen no aportó datos suficientes para sugerir una descripción; puedes escribirla en Historia.</p>}{![imageSuggestion.title,imageSuggestion.artist,imageSuggestion.note,imageSuggestion.genre,imageSuggestion.mood].some(Boolean)&&<p>No se encontraron datos legibles.</p>}</div><div className="studio-image-suggestion-actions"><button type="button" className="outline-button" onClick={()=>setImageSuggestion(null)}>Otra imagen</button>{[imageSuggestion.title,imageSuggestion.artist,imageSuggestion.note,imageSuggestion.genre,imageSuggestion.mood].some(Boolean)&&<button type="button" className="ink-button" onClick={applyImageSuggestion}>Aplicar a la ficha</button>}</div></div>:<><label className="studio-image-picker">Seleccionar imagen<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event=>{selectImage(event.target.files?.[0]);event.target.value=''}}/></label>
        {imageData&&<div className="studio-image-preview"><Image src={imageData} alt="Imagen seleccionada para extraer datos" width={76} height={76} unoptimized/><div><strong title={imageName}>{imageName}</strong><small>Se envía a Gemini para analizarla; no se guarda en la canción.</small></div><button type="button" className="outline-button" disabled={analyzingImage} onClick={()=>void analyzeImage()}><Sparkles size={16} aria-hidden="true"/> Analizar</button></div>}
        {analyzingImage&&<div className="studio-image-result-skeleton" role="status" aria-label="Analizando imagen"><SkeletonLine width="60%" height="15px"/><SkeletonLine width="85%" height="13px"/></div>}</>}
       </section></>:<>
       <FormSection id="studio-identity" index="01" title="Identidad" hint="Lo esencial de cada canción.">
       <div className="studio-field-pair">
        <div className="studio-field"><label htmlFor="song-title">Título</label><input id="song-title" required maxLength={120} value={draft.title} onChange={event=>{update('title',event.target.value);if(!selected)setSlug(makeSongId(event.target.value,draft.artist))}}/></div>
        <div className="studio-field"><label htmlFor="song-artist">Artista</label><input id="song-artist" required maxLength={120} value={draft.artist} onChange={event=>update('artist',event.target.value)}/></div>
       </div>
       <div className="studio-field"><label htmlFor="song-slug">URL corta</label><input id="song-slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={80} value={slug} disabled={Boolean(selected)} onChange={event=>setSlug(event.target.value.toLowerCase())} spellCheck={false}/><small className="studio-field-hint">/c/{slug||'nombre-cancion'}</small></div>
       </FormSection></>}</>}
      {editorStep===1&&<FormSection id="studio-story" index="02" title="Historia" hint="Una descripción breve y memorable.">
       <div className="studio-field"><label htmlFor="song-note">Descripción</label><textarea id="song-note" required rows={5} maxLength={500} value={draft.note} onChange={event=>update('note',event.target.value)}/><small className="studio-field-hint">{draft.note.length}/500 caracteres</small></div>
      </FormSection>}
      {editorStep===2&&<>
       <FormSection id="studio-classification" index="03" title="Clasificación" hint="Ubica la canción en el archivo editorial.">
        <div className="studio-field-pair">
         <div className="studio-field"><label htmlFor="song-genre">Género</label><UiSelect id="song-genre" value={draft.genre} onValueChange={value=>update('genre',value as SongDraft['genre'])} options={genreOptions}/></div>
         <div className="studio-field"><label htmlFor="song-mood">Emoción</label><UiSelect id="song-mood" value={draft.mood} onValueChange={value=>update('mood',value as SongDraft['mood'])} options={moodOptions}/></div>
         <div className="studio-field"><label htmlFor="song-score">Nota editorial (1–10)</label><input id="song-score" type="number" min={1} max={10} step={1} value={draft.score??''} onChange={event=>update('score',event.target.value===''?undefined:Number(event.target.value))}/></div>
         <div className="studio-field"><label htmlFor="song-palette">Paleta</label><UiSelect id="song-palette" value={draft.palette} onValueChange={value=>update('palette',value)} options={paletteOptions}/></div>
        </div>
       </FormSection></>}
      {editorStep===3&&<>
       <FormSection id="studio-publication" index="04" title="Publicación" hint="Controla qué aparece en el archivo.">
        <div className="studio-field studio-status-field"><label htmlFor="song-publication">Estado</label><UiSelect id="song-publication" value={draft.status} onValueChange={value=>update('status',value as SongDraft['status'])} options={statusOptions}/></div>
        <div className="studio-options"><label><input type="checkbox" checked={draft.featured===true} onChange={event=>update('featured',event.target.checked)}/> Destacada</label><label><input type="checkbox" checked={draft.favorite===true} onChange={event=>update('favorite',event.target.checked)}/> Favorita editorial</label></div>
       </FormSection>
      </>}
     </div>
     <footer className="studio-wizard-footer">
      {editorStep>0?<button type="button" className="outline-button" onClick={()=>setEditorStep(current=>current-1)}><ChevronLeft size={17} aria-hidden="true"/> Anterior</button>:<span className="studio-save-state" aria-live="polite">{dirty?'Cambios sin guardar':selected?'Edición guardada':'Paso 1 de 4'}</span>}
      {editorStep===0&&identityMode==='image'?<button type="button" className="ink-button" onClick={()=>setIdentityMode('fields')}>Revisar campos <ArrowRight size={17} aria-hidden="true"/></button>:editorStep<3?<button type="submit" className="ink-button">Continuar <ArrowRight size={17} aria-hidden="true"/></button>:<button type="submit" className="ink-button" disabled={busy}><Save size={17} aria-hidden="true"/>{busy?'Guardando…':'Guardar canción'}</button>}
     </footer>
    </form>
   </ResponsiveDialog>
   <ConfirmDialog open={pending!==null} onOpenChange={open=>{if(!open)cancelDiscard()}} title="¿Descartar cambios?" description="Tienes cambios sin guardar. Si continúas, se perderán." confirmLabel="Descartar cambios" onConfirm={confirmDiscard}/>
  </>}
 </main>;
}
