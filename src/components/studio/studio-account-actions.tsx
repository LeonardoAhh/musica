'use client';

import {ChevronDown,LogOut,RefreshCw} from 'lucide-react';

type StudioAccountActionsProps={
 onSignOut:()=>void;
 refreshing?:boolean;
 onRefresh?:()=>void;
};

export function StudioAccountActions({onSignOut,refreshing=false,onRefresh}:StudioAccountActionsProps){
 function refresh(){
  if(onRefresh){onRefresh();return}
  // Reload the standalone PWA document as well as the browser version.
  window.location.reload();
 }

 return <div className="studio-account-actions">
  <button type="button" className="studio-nav-action" onClick={refresh} disabled={refreshing} aria-label="Actualizar contenido" title="Actualizar contenido">
   <RefreshCw size={18} aria-hidden="true" className={refreshing?'studio-refreshing':''}/>
   <span>Actualizar</span>
  </button>
  <details className="studio-account-menu">
   <summary className="studio-nav-action" aria-label="Abrir menú de cuenta"><span>Cuenta</span><ChevronDown size={16} aria-hidden="true"/></summary>
   <div className="studio-account-menu-panel">
    <button type="button" onClick={onSignOut}><LogOut size={17} aria-hidden="true"/>Cerrar sesión</button>
   </div>
  </details>
 </div>;
}
