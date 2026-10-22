import type {MetadataRoute} from 'next';
export default function manifest():MetadataRoute.Manifest{return {
 name:'Ecos del Alma',short_name:'Ecos',description:'Una colección de canciones que permanecen contigo.',
 start_url:'/',scope:'/',display:'standalone',background_color:'#f5f5f5',theme_color:'#f5f5f5',
 lang:'es-MX',orientation:'any',
 icons:[{src:'/icon-192.svg',sizes:'192x192',type:'image/svg+xml',purpose:'any'},{src:'/icon-512.svg',sizes:'512x512',type:'image/svg+xml',purpose:'any'}]
}}
