'use client';
import {useEffect,useState} from 'react';
import {Download,Share2,SquarePlus,X} from 'lucide-react';
import {site} from '@/data/site';

type InstallPromptEvent=Event&{
 prompt:()=>Promise<void>;
 userChoice:Promise<{outcome:'accepted'|'dismissed'}>;
};
const KEY='eda-install-dismiss-until';
const DAY=24*60*60*1000;
function isStandalone(){return window.matchMedia('(display-mode: standalone)').matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone)}
function isAppleMobile(){return /iPhone|iPad|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1)}
function wasDismissed(){try{return Number(localStorage.getItem(KEY)||0)>Date.now()}catch{return false}}
function saveDismissal(days:number){try{localStorage.setItem(KEY,String(Date.now()+days*DAY))}catch{}}

export default function InstallBanner(){
 const [ios,setIOS]=useState(false);
 const [event,setEvent]=useState<InstallPromptEvent|null>(null);
 const [engaged,setEngaged]=useState(false);
 const [dismissed,setDismissed]=useState(true);
 const [installed,setInstalled]=useState(false);
 const [instructions,setInstructions]=useState(false);
 const [busy,setBusy]=useState(false);
 const [editing,setEditing]=useState(false);

 useEffect(()=>{
  if('serviceWorker' in navigator&&window.isSecureContext&&process.env.NODE_ENV==='production'){
   navigator.serviceWorker.register('/sw.js').catch(()=>{});
  }
  setInstalled(isStandalone());
  setIOS(isAppleMobile());
  setDismissed(wasDismissed());
  const onScroll=()=>{if(window.scrollY>Math.min(window.innerHeight*.65,480))setEngaged(true)};
  const onInstallPrompt=(incoming:Event)=>{incoming.preventDefault();setEvent(incoming as InstallPromptEvent)};
  const onInstalled=()=>{setInstalled(true);setEvent(null)};
  const onFocus=(incoming:Event)=>{const target=incoming.target;setEditing(target instanceof HTMLElement&&Boolean(target.closest('input,textarea,select,[contenteditable="true"]')))};
  const onBlur=()=>setEditing(false);
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('beforeinstallprompt',onInstallPrompt);
  window.addEventListener('appinstalled',onInstalled);
  document.addEventListener('focusin',onFocus);
  document.addEventListener('focusout',onBlur);
  onScroll();
  return()=>{
   window.removeEventListener('scroll',onScroll);
   window.removeEventListener('beforeinstallprompt',onInstallPrompt);
   window.removeEventListener('appinstalled',onInstalled);
   document.removeEventListener('focusin',onFocus);
   document.removeEventListener('focusout',onBlur);
  };
 },[]);

 const dismiss=()=>{setDismissed(true);saveDismissal(site.install.dismissDays)};
 const install=async()=>{
  if(ios){setInstructions(current=>!current);return}
  if(!event||busy)return;
  setBusy(true);
  try{
   await event.prompt();
   const result=await event.userChoice;
   if(result.outcome==='accepted'){setInstalled(true)}
   else{dismiss()}
   setEvent(null);
  }catch{setEvent(null)}
  finally{setBusy(false)}
 };
 if(!engaged||dismissed||installed||editing||(!ios&&!event))return null;
 return <aside className="install-banner" aria-label="Instalar Ecos del Alma">
  <div className="install-banner-copy"><Download size={19} aria-hidden="true"/><div><strong>Instala {site.name}</strong><p>Tu colección, a un toque.</p></div></div>
  <div className="install-banner-actions">
   <button type="button" className="ink-button install-action" onClick={install} disabled={busy} aria-expanded={ios?instructions:undefined} aria-controls={ios?'eda-install-help':undefined}>{ios?'Instalar':'Instalar'}</button>
   <button type="button" className="install-dismiss" onClick={dismiss} aria-label="No mostrar instalación por ahora"><X size={18} aria-hidden="true"/></button>
  </div>
  {ios&&instructions&&<p id="eda-install-help" className="install-help">Abre <span className="install-help-step"><Share2 size={16} aria-hidden="true"/> Compartir</span> y elige <span className="install-help-step"><SquarePlus size={16} aria-hidden="true"/> «Agregar a inicio»</span>.</p>}
 </aside>;
}
