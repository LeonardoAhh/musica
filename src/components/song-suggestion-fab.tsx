'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {usePathname} from 'next/navigation';
import {Music2,Send} from 'lucide-react';
import {ResponsiveDialog} from '@/components/ui/responsive-dialog';
import {validateSongSuggestionTitle} from '@/data/song-suggestion';

export default function SongSuggestionFab(){
 const pathname=usePathname();
 const [open,setOpen]=useState(false);
 const [title,setTitle]=useState('');
 const [busy,setBusy]=useState(false);
 const [sent,setSent]=useState(false);
 const [message,setMessage]=useState('');
 const titleRef=useRef<HTMLHeadingElement>(null);

 useEffect(()=>{if(open&&sent)titleRef.current?.focus({preventScroll:true})},[open,sent]);

 function show(){setMessage('');setSent(false);setOpen(true)}
 function close(){if(busy)return;setOpen(false);if(sent)setTitle('')}
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(busy)return;
  const result=validateSongSuggestionTitle(title);
  if(result.error){setMessage(result.error);return}
  setBusy(true);setMessage('');
  try{
   const response=await fetch('/api/song-suggestions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:result.title})});
   const data=await response.json() as {message?:string;error?:string};
   if(!response.ok)throw Error(data.error||'No pudimos enviar la sugerencia.');
   setSent(true);setMessage(data.message||'Revisaré esa canción para el archivo.');
  }catch(error){setMessage(error instanceof Error?error.message:'No pudimos enviar la sugerencia.')}
  finally{setBusy(false)}
 }

 if(pathname.startsWith('/studio')||pathname==='/not-found')return null;
 return <>
  <button type="button" className="song-suggestion-fab" onClick={show} aria-haspopup="dialog" aria-label="Solicitar agregar una canción">
   <Music2 size={21} aria-hidden="true"/><span>Sugiere una canción</span>
  </button>
  <ResponsiveDialog open={open} onOpenChange={value=>{if(!value)close()}} titleId="song-suggestion-title" headerLabel={sent?'SUGERENCIA RECIBIDA':'TU MÚSICA EN EL ARCHIVO'} closeLabel="Cerrar sugerencia" className="song-suggestion-dialog">
   <div className={`song-suggestion-content${sent?' song-suggestion-content--success':''}`}>
    <h2 id="song-suggestion-title" ref={titleRef} className={sent?undefined:'song-suggestion-question'} tabIndex={-1} data-dialog-initial-focus>{sent?'Gracias por compartirla.':'¿Qué canción falta?'}</h2>
    {sent?<div className="song-suggestion-success"><p role="status">{message}</p><button type="button" className="ink-button" onClick={close}>Listo</button></div>
    :<form onSubmit={event=>void submit(event)}>
      <p>Escribe solo el título. Revisaré la canción y buscaré la versión correcta antes de agregarla.</p>
      <label htmlFor="suggestion-song-title">Nombre de la canción</label>
      <input id="suggestion-song-title" name="title" type="text" value={title} onChange={event=>{setTitle(event.target.value);setMessage('')}} minLength={2} maxLength={100} required autoComplete="off" placeholder="Por ejemplo: Plástico" aria-describedby="suggestion-song-help" aria-invalid={Boolean(message&&validateSongSuggestionTitle(title).error)}/>
      <span id="suggestion-song-help" className="song-suggestion-hint">Entre 2 y 100 caracteres. No necesitas indicar artista.</span>
      {message&&<p className="song-suggestion-error" role="alert">{message}</p>}
      <button type="submit" className="ink-button" disabled={busy}><Send size={16} aria-hidden="true"/>{busy?'Enviando…':'Enviar sugerencia'}</button>
     </form>}
   </div>
  </ResponsiveDialog>
 </>;
}
