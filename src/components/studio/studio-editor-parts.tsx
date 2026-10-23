import type {ReactNode} from 'react';
import {SkeletonLine} from '@/components/section-skeletons';

export function FormSection({id,index,title,hint,children}:{id:string;index:string;title:string;hint?:string;children:ReactNode}){
 return <section className="studio-form-card" aria-labelledby={id}>
  <div className="studio-card-heading"><span className="studio-card-index" aria-hidden="true">{index}</span><div><h3 id={id}>{title}</h3>{hint&&<p>{hint}</p>}</div></div>
  <div className="studio-form-content">{children}</div>
 </section>;
}

export function StudioSongsSkeleton(){return <div className="studio-skeleton-grid" role="status" aria-label="Cargando canciones">{Array.from({length:3},(_,index)=><div className="studio-song-card studio-song-skeleton" aria-hidden="true" key={index}><SkeletonLine width="75px" height="24px"/><SkeletonLine width="80%" height="29px"/><SkeletonLine width="55%" height="13px"/><SkeletonLine width="65%" height="12px"/></div>)}</div>}

