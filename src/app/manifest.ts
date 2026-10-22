import type {MetadataRoute} from 'next';
import {site} from '@/data/site';

export default function manifest():MetadataRoute.Manifest{
 return {
  id:'/',
  name:site.name,
  short_name:site.shortName,
  description:site.description,
  start_url:'/',
  scope:'/',
  display:'standalone',
  background_color:site.colors.canvas,
  theme_color:site.colors.canvas,
  lang:'es-MX',
  icons:[
   {src:'/icon-192.svg',sizes:'192x192',type:'image/svg+xml',purpose:'any'},
   {src:'/icon-512.svg',sizes:'512x512',type:'image/svg+xml',purpose:'any'}
  ]
 };
}
