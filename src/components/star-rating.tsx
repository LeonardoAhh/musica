'use client';
import {useEffect,useId,useState} from 'react';
import {Star,X} from 'lucide-react';
import {firebaseConfigured} from '@/lib/firebase/config';

type Props={songId:string;compact?:boolean};
const ratingKey=(id:string)=>'eda-stars-v1:'+id;
const EVENT='eda-stars-change';
const options=[1,2,3,4,5] as const;
function parseStored(value:string|null){const number=Number(value);return value!==null&&Number.isInteger(number)&&number>=1&&number<=5?number:null}

export default function StarRating({songId,compact=false}:Props){
 const id=useId();
 const [score,setScore]=useState<number|null>(null);
 useEffect(()=>{
  let active=true;
  try{setScore(parseStored(localStorage.getItem(ratingKey(songId))))}catch{}
  const sync=(event:Event)=>{const changed=(event as CustomEvent<{songId:string;score:number|null}>).detail;if(changed.songId===songId)setScore(changed.score)};
  window.addEventListener(EVENT,sync);
  // Existing anonymous accounts can restore their own rating if local data is missing.
  if(firebaseConfigured)import('@/lib/firebase/client').then(({readPersonalRating})=>readPersonalRating(songId)).then(value=>{
   if(!active||value===null)return;
   let stored:null|number=null;try{stored=parseStored(localStorage.getItem(ratingKey(songId)))}catch{}
   if(stored===null){setScore(value);try{localStorage.setItem(ratingKey(songId),String(value))}catch{}}
  }).catch(()=>{});
  return()=>{active=false;window.removeEventListener(EVENT,sync)};
 },[songId]);
 async function rate(value:number|null){
  setScore(value);
  try{
   if(value===null)localStorage.removeItem(ratingKey(songId));
   else localStorage.setItem(ratingKey(songId),String(value));
  }catch{}
  window.dispatchEvent(new CustomEvent(EVENT,{detail:{songId,score:value}}));
  if(!firebaseConfigured)return;
  try{
   const {writePersonalRating}=await import('@/lib/firebase/client');
   const cloud=await writePersonalRating(songId,value);
   void cloud;
  }catch{}
 }
 return <fieldset className={`star-rating ${compact?'star-rating-compact':''}`}>
  <legend>Tu calificación</legend>
  <div className="star-rating-row" role="group" aria-label="Califica la canción de una a cinco estrellas">
   {options.map(value=><span className="star-choice" key={value}>
    <input className="star-input" type="radio" name={id} id={id+'-'+value} value={value} checked={score===value} onChange={()=>void rate(value)}/>
    <label htmlFor={id+'-'+value} data-cuelume-select title={value+' '+(value===1?'estrella':'estrellas')}>
     <Star size={compact?19:23} strokeWidth={1.6} fill={score!==null&&value<=score?'currentColor':'none'} aria-hidden="true"/>
     <span className="sr-only">{value} {value===1?'estrella':'estrellas'}</span>
    </label>
   </span>)}
   {score!==null&&<button type="button" className="rating-clear" onClick={()=>void rate(null)} aria-label="Eliminar mi calificación" title="Eliminar calificación"><X size={16} aria-hidden="true"/></button>}
  </div>
  <p className="rating-status" aria-live="polite">{score===null?'Sin calificar':score+' de 5 estrellas'}</p>
 </fieldset>;
}
