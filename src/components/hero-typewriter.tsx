'use client';

import {useEffect,useState} from 'react';
import {motion,useReducedMotion} from 'motion/react';

const lines=['Hay canciones','que se bailan.','Otras se quedan contigo.'] as const;
const totalLetters=lines.reduce((total,line)=>total+line.length,0);
const fullTitle='Hay canciones que se bailan. Otras se quedan contigo.';

export default function HeroTypewriter(){
 const reduceMotion=useReducedMotion();
 const [visible,setVisible]=useState(0);
 const [phase,setPhase]=useState<'writing'|'pause'|'erasing'>('writing');

 useEffect(()=>{
  if(reduceMotion)return;
  const delay=phase==='pause'?1900:phase==='erasing'?35:72;
  const timer=window.setTimeout(()=>{
   if(phase==='writing'){
    if(visible<totalLetters)setVisible(visible+1);
    else setPhase('pause');
   }else if(phase==='pause')setPhase('erasing');
   else if(visible>0)setVisible(visible-1);
   else setPhase('writing');
  },delay);
  return()=>window.clearTimeout(timer);
 },[phase,reduceMotion,visible]);

 const count=reduceMotion?totalLetters:visible;
 const activeLine=count<=lines[0].length?0:count<=lines[0].length+lines[1].length?1:2;

 return <h1 className="hero-typewriter" aria-label={fullTitle}>
  {lines.map((line,index)=>{
   const previous=lines.slice(0,index).reduce((total,text)=>total+text.length,0);
   const written=line.slice(0,Math.max(0,Math.min(line.length,count-previous)));
   const caret=!reduceMotion&&index===activeLine&&<motion.span className="hero-typewriter-caret" animate={{opacity:[1,1,0,0]}} transition={{duration:.9,times:[0,.45,.46,1],repeat:Infinity,ease:'linear'}}/>;
   return <span className="hero-typewriter-line" aria-hidden="true" key={line}>
    <span className="hero-typewriter-reserve">{index===2?<em>{line}</em>:line}</span>
    <span className="hero-typewriter-written">{index===2?<em>{written}</em>:written}{caret}</span>
   </span>;
  })}
 </h1>;
}
