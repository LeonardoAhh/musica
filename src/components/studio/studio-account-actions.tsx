'use client';

import {useEffect,useRef,useState} from 'react';
import {ChevronDown,LogOut,RefreshCw} from 'lucide-react';

type StudioAccountActionsProps={
 onSignOut:()=>void;
 onRefresh:()=>void;
 refreshing?:boolean;
};

/** Shared, keyboard-accessible account menu for both Studio views. */
export function StudioAccountActions({onSignOut,onRefresh,refreshing=false}:StudioAccountActionsProps){
 const [open,setOpen]=useState(false);
 const rootRef=useRef<HTMLDivElement>(null);
 const triggerRef=useRef<HTMLButtonElement>(null);
 const signOutRef=useRef<HTMLButtonElement>(null);

 useEffect(()=>{
  if(!open)return;
  function onPointerDown(event:PointerEvent){
   if(event.target instanceof Node&&!rootRef.current?.contains(event.target))setOpen(false);
  }
  function onKeyDown(event:KeyboardEvent){
   if(event.key==='Escape'){setOpen(false);triggerRef.current?.focus()}
  }
  document.addEventListener('pointerdown',onPointerDown);
  document.addEventListener('keydown',onKeyDown);
  return()=>{
   document.removeEventListener('pointerdown',onPointerDown);
   document.removeEventListener('keydown',onKeyDown);
  };
 },[open]);

 return <div className="studio-account-actions">
  <button type="button" className="studio-nav-action" onClick={onRefresh} disabled={refreshing} aria-label="Actualizar contenido" title="Actualizar contenido">
   <RefreshCw size={18} aria-hidden="true" className={refreshing?'studio-refreshing':''}/>
   <span>Actualizar</span>
  </button>
  <div className="studio-account-menu" ref={rootRef}>
   <button ref={triggerRef} type="button" className="studio-nav-action" aria-expanded={open} aria-controls="studio-account-menu-panel" aria-haspopup="true" onClick={()=>setOpen(current=>!current)} onKeyDown={event=>{
    if(event.key==='ArrowDown'){event.preventDefault();setOpen(true);requestAnimationFrame(()=>signOutRef.current?.focus())}
   }}>
    <span>Cuenta</span><ChevronDown size={16} aria-hidden="true"/>
   </button>
   {open&&<div id="studio-account-menu-panel" className="studio-account-menu-panel">
    <button ref={signOutRef} type="button" onClick={()=>{setOpen(false);onSignOut()}}><LogOut size={17} aria-hidden="true"/>Cerrar sesión</button>
   </div>}
  </div>
 </div>;
}
