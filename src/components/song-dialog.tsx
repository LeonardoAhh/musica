'use client';
import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {AnimatePresence,motion,useReducedMotion} from 'motion/react';
import {ArrowUpRight,Bookmark,CircleCheck} from 'lucide-react';
import {artistSlug} from '@/data/paths';
import {spotifySearch,type Song} from '@/data/songs';
import SongSleeve from '@/components/song-sleeve';
import StarRating from '@/components/star-rating';
import {DialogHeader} from '@/components/ui/dialog-header';

type Props={song:Song|null;saved:boolean;onSave:(id:string)=>void;onClose:()=>void};
export default function SongDialog(props:Props){
 return <AnimatePresence>
  {props.song&&<SongDialogContent key="song-detail" song={props.song} saved={props.saved} onSave={props.onSave} onClose={props.onClose}/>}
 </AnimatePresence>;
}

function SongDialogContent({song,saved,onSave,onClose}:Omit<Props,'song'>&{song:Song}){
 const reduced=useReducedMotion();
 const [mobile,setMobile]=useState(false);
 const closeRef=useRef<HTMLButtonElement>(null);
 useEffect(()=>{
  const mq=window.matchMedia('(max-width: 767px)');
  const update=()=>setMobile(mq.matches);
  update();mq.addEventListener('change',update);
  return()=>mq.removeEventListener('change',update);
 },[]);
 useLayoutEffect(()=>{
  const body=document.body;
  const focused=document.activeElement instanceof HTMLElement?document.activeElement:null;
  const previousOverflow=body.style.overflow;
  const previousPosition=body.style.position;
  const previousTop=body.style.top;
  const previousLeft=body.style.left;
  const previousRight=body.style.right;
  const previousWidth=body.style.width;
  const previousPaddingRight=body.style.paddingRight;
  const scrollY=window.scrollY;
  const scrollbarWidth=window.innerWidth-document.documentElement.clientWidth;
  body.style.position='fixed';
  body.style.top=`-${scrollY}px`;
  body.style.left='0';
  body.style.right='0';
  body.style.width='100%';
  body.style.overflow='hidden';
  if(scrollbarWidth>0){
   const paddingRight=parseFloat(getComputedStyle(body).paddingRight)||0;
   body.style.paddingRight=`${paddingRight+scrollbarWidth}px`;
  }
  closeRef.current?.focus({preventScroll:true});
  return()=>{
   body.style.overflow=previousOverflow;
   body.style.position=previousPosition;
   body.style.top=previousTop;
   body.style.left=previousLeft;
   body.style.right=previousRight;
   body.style.width=previousWidth;
   body.style.paddingRight=previousPaddingRight;
   const root=document.documentElement;
   const previousScrollBehavior=root.style.scrollBehavior;
   root.style.scrollBehavior='auto';
   window.scrollTo(0,scrollY);
   root.style.scrollBehavior=previousScrollBehavior;
   focused?.focus({preventScroll:true});
  };
 },[]);
 return <motion.div className="modal-backdrop" role="presentation" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?0:.2}} onMouseDown={onClose}>
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
    <DialogHeader label={`ARCHIVO SONORO / ${song.genre.toUpperCase()}`} closeLabel="Cerrar detalles" onClose={onClose} closeButtonRef={closeRef}/>
    <div className="detail-cover"><SongSleeve song={song}/></div>
    <div className="detail-copy">
     <h2 id="dialog-title" className="sr-only">{song.title} — {song.artist}</h2>
     <p id="dialog-description" className="detail-note">{song.note}</p>
     <div className="detail-tags"><span>{song.mood}</span><span>{song.score??'—'}/10 editorial</span></div>
     <StarRating songId={song.id}/>
     <div className="detail-page-links"><Link href={`/c/${song.id}`}>Página de canción <ArrowUpRight size={14} aria-hidden="true"/></Link><Link href={`/a/${artistSlug(song.artist)}`}>Artista <ArrowUpRight size={14} aria-hidden="true"/></Link></div>
     <div className="detail-actions"><a className="ink-button" href={spotifySearch(song)} target="_blank" rel="noopener noreferrer">Buscar en Spotify <ArrowUpRight size={17} aria-hidden="true"/></a><button className="outline-button" data-cuelume-toggle type="button" onClick={()=>onSave(song.id)}>{saved?<CircleCheck size={17} aria-hidden="true"/>:<Bookmark size={17} aria-hidden="true"/>} {saved?'Guardada':'Guardar'}</button></div>
     <p className="detail-disclaimer">El enlace abre Spotify. No alojamos audio.</p>
    </div>
  </motion.section>
 </motion.div>;
}
