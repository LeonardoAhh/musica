'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {ArrowUpRight,Bookmark,CircleCheck,X} from 'lucide-react';
import {artistSlug} from '@/data/paths';
import {spotifySearch,type Song} from '@/data/songs';
import SongSleeve from '@/components/song-sleeve';
import StarRating from '@/components/star-rating';

type Props={song:Song|null;saved:boolean;onSave:(id:string)=>void;onClose:()=>void};
export default function SongDialog({song,saved,onSave,onClose}:Props){
 const reduced=useReducedMotion();
 const [mobile,setMobile]=useState(false);
 const closeRef=useRef<HTMLButtonElement>(null);
 const touchY=useRef<number|null>(null);
 const active=Boolean(song);
 useEffect(()=>{
  const mq=window.matchMedia('(max-width: 767px)');
  const update=()=>setMobile(mq.matches);
  update();mq.addEventListener('change',update);
  return()=>mq.removeEventListener('change',update);
 },[]);
 useEffect(()=>{
  if(!active)return;
  const focused=document.activeElement instanceof HTMLElement?document.activeElement:null;
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  closeRef.current?.focus({preventScroll:true});
  return()=>{document.body.style.overflow=previous;focused?.focus({preventScroll:true})};
 },[active]);
 return <AnimatePresence>
 {song&&<motion.div className="modal-backdrop" role="presentation" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?0:.2}} onMouseDown={onClose}>
  <motion.section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description"
   initial={reduced?false:{opacity:0,y:mobile?'100%':14,scale:mobile?1:.985}}
   animate={{opacity:1,y:0,scale:1}}
   exit={reduced?{opacity:0}:{opacity:0,y:mobile?'100%':12,scale:mobile?1:.985}}
   transition={{duration:reduced?0:mobile?.32:.25,ease:[.22,1,.36,1]}}
   onMouseDown={event=>event.stopPropagation()}
   onKeyDown={event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onClose();return}
    if(event.key!=='Tab')return;
    const controls=Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(element=>element.getClientRects().length>0);
    if(!controls.length)return;
    const first=controls[0],last=controls[controls.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus({preventScroll:true})}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus({preventScroll:true})}
   }}>
    <button type="button" className="sheet-handle" aria-label="Cerrar detalles" onClick={onClose}
      onTouchStart={event=>{touchY.current=event.touches[0]?.clientY??null}}
      onTouchEnd={event=>{const end=event.changedTouches[0]?.clientY;if(touchY.current!==null&&end!==undefined&&end-touchY.current>80)onClose();touchY.current=null}}>
      <span aria-hidden="true"/>
    </button>
    <button ref={closeRef} data-cuelume-close type="button" className="modal-close" onClick={onClose} aria-label="Cerrar detalles"><X size={20}/></button>
    <div className="detail-cover"><SongSleeve song={song} large/></div>
    <div className="detail-copy">
     <span className="eyebrow">ARCHIVO SONORO / {song.genre.toUpperCase()}</span>
     <h2 id="dialog-title">{song.title}</h2>
     <p className="detail-artist">{song.artist}</p>
     <p id="dialog-description" className="detail-note">{song.note}</p>
     <div className="detail-tags"><span>{song.mood}</span><span>{song.score??'—'}/10 editorial</span></div>
     <StarRating songId={song.id}/>
     <div className="detail-page-links"><Link href={`/c/${song.id}`}>Página de canción <ArrowUpRight size={14} aria-hidden="true"/></Link><Link href={`/a/${artistSlug(song.artist)}`}>Artista <ArrowUpRight size={14} aria-hidden="true"/></Link></div>
     <div className="detail-actions"><a className="ink-button" href={spotifySearch(song)} target="_blank" rel="noopener noreferrer">Buscar en Spotify <ArrowUpRight size={17}/></a><button className="outline-button" data-cuelume-toggle type="button" onClick={()=>onSave(song.id)}>{saved?<CircleCheck size={17}/>:<Bookmark size={17}/>} {saved?'Guardada':'Guardar'}</button></div>
     <p className="detail-disclaimer">El enlace abre Spotify. No alojamos audio.</p>
    </div>
  </motion.section>
 </motion.div>}
 </AnimatePresence>;
}
