'use client';
import {useEffect,useState} from 'react';
import {Download,Share2,X,PlusSquare} from 'lucide-react';
type InstallEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:'accepted'|'dismissed'}>};
const DISMISS='eda-pwa-dismissed';
function standalone(){return window.matchMedia('(display-mode: standalone)').matches||Boolean((navigator as Navigator&{standalone?:boolean}).standalone)}
export default function InstallBanner(){
 const [installEvent,setInstallEvent]=useState<InstallEvent|null>(null);
 const [ios,setIOS]=useState(false);
 const [visible,setVisible]=useState(false);
 const [instructions,setInstructions]=useState(false);
 useEffect(()=>{
  if('serviceWorker' in navigator&&window.isSecureContext){navigator.serviceWorker.register('/sw.js').catch(()=>{})}
  if(standalone()||sessionStorage.getItem(DISMISS)==='1')return;
  const apple=/iPhone|iPad|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
  setIOS(apple);setVisible(apple);
  const onPrompt=(event:Event)=>{event.preventDefault();setInstallEvent(event as InstallEvent);setVisible(true)};
  const onInstalled=()=>{setVisible(false);setInstallEvent(null)};
  window.addEventListener('beforeinstallprompt',onPrompt);
  window.addEventListener('appinstalled',onInstalled);
  return()=>{window.removeEventListener('beforeinstallprompt',onPrompt);window.removeEventListener('appinstalled',onInstalled)};
 },[]);
 const dismiss=()=>{setVisible(false);try{sessionStorage.setItem(DISMISS,'1')}catch{}};
 const install=async()=>{if(installEvent){await installEvent.prompt();const choice=await installEvent.userChoice;if(choice.outcome==='accepted')setVisible(false);setInstallEvent(null)}else if(ios){setInstructions(v=>!v)}};
 if(!visible||(!ios&&!installEvent))return null;
 return <aside className="install-banner" aria-label="Instalar Ecos del Alma">
  <div className="install-banner-copy"><Download size={19} aria-hidden="true"/><div><strong>Instala Ecos del Alma</strong><p>Tu música favorita, a un toque.</p></div></div>
  <div className="install-banner-actions"><button type="button" className="ink-button install-action" onClick={install} aria-expanded={ios?instructions:undefined}>{ios?'Cómo instalar':'Instalar'}</button><button type="button" className="install-dismiss" onClick={dismiss} aria-label="Cerrar sugerencia de instalación"><X size={18}/></button></div>
  {ios&&instructions&&<p className="install-help"><Share2 size={16} aria-hidden="true"/> Abre Compartir y elige <PlusSquare size={16} aria-hidden="true"/> «Agregar a inicio».</p>}
 </aside>
}
