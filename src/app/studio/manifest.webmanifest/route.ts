import {NextResponse} from 'next/server';
import type {MetadataRoute} from 'next';

export function GET(){
 const manifest:MetadataRoute.Manifest={
  id:'/studio/',
  name:'Ecos Studio — Administración',
  short_name:'Ecos Studio',
  description:'Panel de administración de Ecos del Alma.',
  start_url:'/studio/',
  scope:'/studio/',
  display:'standalone',
  background_color:'#f5f5f5',
  theme_color:'#0c0a09',
  lang:'es-MX',
  icons:[
   {src:'/studio-icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'}
  ]
 };
 return NextResponse.json(manifest,{headers:{'Content-Type':'application/manifest+json; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
