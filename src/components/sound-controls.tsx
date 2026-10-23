'use client';
import {useEffect,useState} from 'react';
import {Volume2,VolumeX} from 'lucide-react';
import {bind,setEnabled,setVolume,unlock} from 'cuelume';
export default function SoundControls(){
 const [enabled,setActive]=useState(false);
 useEffect(()=>{
  setEnabled(false);setVolume(.28);
  const unbind=bind();
  const mobile=window.matchMedia('(max-width:767px)');
  const disableOnMobile=()=>{if(mobile.matches){setEnabled(false);setActive(false)}};
  mobile.addEventListener('change',disableOnMobile);
  disableOnMobile();
  return ()=>{mobile.removeEventListener('change',disableOnMobile);unbind();setEnabled(false)};
 },[]);
 const toggle=async()=>{
  const next=!enabled;
  setEnabled(next);
  setActive(next);
  if(next)await unlock();
 };
 return <button type="button" onClick={toggle} aria-label={enabled?'Desactivar sonidos de interfaz':'Activar sonidos de interfaz'} aria-pressed={enabled} className="nav-icon sound-toggle" title={enabled?'Silenciar interfaz':'Activar sonidos'}>
  {enabled?<Volume2 size={19}/>:<VolumeX size={19}/>}
 </button>;
}
