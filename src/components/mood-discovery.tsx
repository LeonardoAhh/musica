'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {motion,useReducedMotion} from 'motion/react';
import {ArrowRight,ArrowUpRight,Heart,Music2,RefreshCw} from 'lucide-react';
import {spotifySearch,type Song,type Mood} from '@/data/songs';
import {useCatalog} from '@/components/catalog-provider';

const moments:{id:string;label:string;subtitle:string;moods:Mood[];tone:string}[]=[
{id:'dedicar',label:'Quiero dedicar',subtitle:'Un mensaje hecho canción',moods:['Romance'],tone:'peach'},
{id:'desahogar',label:'Necesito desahogarme',subtitle:'Un coro que diga lo que siento',moods:['Despecho','Nostalgia'],tone:'rose'},
{id:'bailar',label:'Hoy quiero bailar',subtitle:'Ritmo, metales y mucho sabor',moods:['Salsa brava','Cumbia'],tone:'mint'},
{id:'recordar',label:'Ando nostálgico',subtitle:'Volver a sentirlo todo',moods:['Nostalgia','Romance'],tone:'lavender'}
];
function orderFor(id:string,songs:Song[]){return [...songs].sort((a,b)=>{
const aa=(a.id+id).split('').reduce((n,ch)=>n+ch.charCodeAt(0),0);
const bb=(b.id+id).split('').reduce((n,ch)=>n+ch.charCodeAt(0),0);
return aa-bb||a.id.localeCompare(b.id)
})}
export default function MoodDiscovery(){
const {songs}=useCatalog();
const [moment,setMoment]=useState<string|null>(null);
const [round,setRound]=useState(0);
const reduced=useReducedMotion();
const current=moments.find(m=>m.id===moment);
const picks=useMemo(()=>{if(!current)return [];const matches=orderFor(current.id,songs).filter(song=>current.moods.includes(song.mood));const offset=round%Math.max(1,matches.length);return [...matches.slice(offset),...matches.slice(0,offset)].slice(0,3)},[current,round,songs]);
return <section className="mood-discovery" id="descubrir" aria-labelledby="mood-heading"><div className="shell">
<div className="section-top"><div><p className="eyebrow">05 / TU MOMENTO MUSICAL</p><h2 id="mood-heading">¿Cómo suena <em>tu día?</em></h2></div><p className="section-desc">Elige lo que sientes. Nosotros ponemos las canciones. Sin registros ni algoritmos que te persigan.</p></div>
<div className="mood-choices" role="group" aria-label="Elegir un estado de ánimo">{moments.map(m=><button key={m.id} type="button" data-cuelume-select className={`mood-choice mood-${m.tone} ${moment===m.id?'is-active':''}`} aria-pressed={moment===m.id} onClick={()=>{setMoment(m.id);setRound(0)}}><span className="mood-choice-symbol">{m.id==='dedicar'?<Heart size={21} aria-hidden="true"/>:<Music2 size={21} aria-hidden="true"/>}</span><strong>{m.label}</strong><small>{m.subtitle}</small><ArrowUpRight className="mood-choice-arrow" size={21} aria-hidden="true"/></button>)}</div>
{current&&<motion.div key={current.id} className="mood-results" initial={reduced?false:{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.35}} aria-live="polite"><div className="mood-results-heading"><div><p className="eyebrow">HECHAS PARA ESTE MOMENTO</p><h3>{current.label}.</h3></div><button type="button" className="outline-button" data-cuelume-tap onClick={()=>setRound(r=>r+1)}><RefreshCw size={16} aria-hidden="true"/> Otras joyas</button></div><div className="mood-picks">{picks.map((song:Song,index:number)=><article className="mood-pick" key={song.id}><span className="mood-pick-index">0{index+1}</span><div><span className="mood-pick-category">{song.genre} · {song.mood}</span><h4>{song.title}</h4><p>{song.artist}</p></div><div className="mood-pick-actions"><Link href={`/c/${song.id}`} aria-label={`Ver ficha de ${song.title}`}><ArrowRight size={19} aria-hidden="true"/></Link><a href={spotifySearch(song)} target="_blank" rel="noopener noreferrer" aria-label={`Buscar ${song.title} en Spotify`}><ArrowUpRight size={19} aria-hidden="true"/></a></div></article>)}</div><p className="mood-hint">Recomendaciones editoriales basadas en nuestra colección; no recopilamos tu estado de ánimo.</p></motion.div>}
</div></section>
}
