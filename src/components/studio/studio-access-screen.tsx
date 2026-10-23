'use client';

import {LogIn} from 'lucide-react';
import {SkeletonLine} from '@/components/section-skeletons';

type AccessMode='login'|'restricted'|'unavailable';

type Props={
 mode:AccessMode;
 onSignIn?:()=>void;
 onChangeAccount?:()=>void;
 busy?:boolean;
 error?:string;
};

const content={
 login:{eyebrow:'ACCESO EDITORIAL',title:'Acceso a Studio',description:'Inicia sesión con tu cuenta de editor.'},
 restricted:{eyebrow:'CUENTA SIN ACCESO',title:'Acceso restringido',description:'Esta cuenta no tiene permiso para editar el archivo musical.'},
 unavailable:{eyebrow:'SERVICIO NO DISPONIBLE',title:'Studio no está listo',description:'No se pudo conectar con el archivo editorial en este momento.'}
} as const;

export function StudioAccessScreen({mode,onSignIn,onChangeAccount,busy=false,error=''}:Props){
 const view=content[mode];
 return <section className="studio-access-stage" aria-labelledby="studio-access-title">
  <div className="studio-access-card" aria-busy={busy}>
   <p className="eyebrow studio-access-eyebrow">{view.eyebrow}</p>
   <h1 id="studio-access-title">{view.title}</h1>
   <p className="studio-access-copy">{view.description}</p>
   {mode==='login'&&onSignIn&&<div className="studio-access-actions">
    <button type="button" className="ink-button" disabled={busy} onClick={onSignIn}><LogIn size={18} aria-hidden="true"/>{busy?'Abriendo Google…':'Continuar con Google'}</button>
   </div>}
   {mode==='restricted'&&onChangeAccount&&<div className="studio-access-actions"><button type="button" className="outline-button" onClick={onChangeAccount}>Cambiar de cuenta</button></div>}
   {error&&<p className="studio-access-error" role="alert">{error}</p>}
  </div>
 </section>;
}

export function StudioAccessSkeleton(){
 return <section className="studio-access-stage" role="status" aria-label="Comprobando acceso">
  <div className="studio-access-card studio-access-skeleton" aria-hidden="true">
   <SkeletonLine width="135px" height="11px"/>
   <SkeletonLine width="min(100%,310px)" height="50px"/>
   <SkeletonLine width="min(100%,380px)" height="44px"/>
   <SkeletonLine width="100%" height="48px"/>
  </div>
 </section>;
}
