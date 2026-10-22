'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowUpRight} from 'lucide-react';
import {firebaseConfigured} from '@/lib/firebase/config';
import {artistSlug} from '@/data/paths';
import type {Song} from '@/data/songs';
export default function RemoteArtistPage({slug}:{slug:string}){
 const [songs,setSongs]=useState<Song[]|null>(null);
 useEffect(()=>{
  let active=true;
  if(!firebaseConfigured){setSongs([]);return}
  import('@/lib/firebase/public-catalog').then(api=>api.fetchPublicSongs()).then(items=>{if(active)setSongs(items.filter(item=>artistSlug(item.artist)===slug))}).catch(()=>{if(active)setSongs([])});
  return()=>{active=false};
 },[slug]);
 const name=songs?.[0]?.artist;
 return <main className="shell detail-page"><Link className="back-link" href="/"><ArrowLeft size={16}/> Archivo musical</Link>{songs===null?<p className="detail-lead">Buscando artista…</p>:name?<><p className="eyebrow" style={{marginTop:70}}>ARTISTA / ECOS DEL ALMA</p><h1>{name}</h1><div className="artist-song-list">{songs.map(song=><Link href={`/c/${song.id}`} key={song.id}><span>{song.title}</span><ArrowUpRight size={19}/></Link>)}</div></>:<><h1>Artista no disponible.</h1><p className="detail-lead">Explora nuestra colección.</p></>}</main>;
}
