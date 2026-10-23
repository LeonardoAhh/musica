'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowUpRight} from 'lucide-react';
import {firebaseConfigured} from '@/lib/firebase/config';
import {spotifySearch,type Song} from '@/data/songs';
import {artistSlug} from '@/data/paths';
import SongSleeve from '@/components/song-sleeve';
import StarRating from '@/components/star-rating';
import {DetailSkeleton} from '@/components/section-skeletons';
import DetailBreadcrumb from '@/components/detail-breadcrumb';

export default function RemoteSongPage({id}:{id:string}){
 const [song,setSong]=useState<Song|null>(null);
 const [status,setStatus]=useState<'loading'|'ready'|'missing'|'error'>('loading');
 useEffect(()=>{
  let active=true;
  if(!firebaseConfigured){setStatus('missing');return}
  import('@/lib/firebase/public-catalog').then(api=>api.fetchPublicSong(id)).then(item=>{
   if(!active)return;
   setSong(item);setStatus(item?'ready':'missing');
  }).catch(()=>{if(active)setStatus('error')});
  return()=>{active=false};
 },[id]);
 if(status==='loading')return <DetailSkeleton variant="song"/>;
 if(!song)return <main id="inicio" tabIndex={-1} className="shell detail-page"><p className="eyebrow">ECOS DEL ALMA</p><h1>Esta canción no está disponible.</h1><p className="detail-lead">{status==='error'?'No pudimos consultar el archivo.':'Explora otras canciones en nuestra colección.'}</p><Link className="back-link" href="/"><ArrowLeft size={16} aria-hidden="true"/> Volver al inicio</Link></main>;
 return <main id="inicio" tabIndex={-1} className="shell detail-page"><DetailBreadcrumb title={song.title}/><div className="detail-layout">
 <SongSleeve song={song}/>
 <article><p className="eyebrow">{song.genre} / {song.mood} · {song.score??'—'}/10</p><h1>{song.title}</h1><p className="detail-lead">{song.note}</p><StarRating songId={song.id}/><p><Link className="artist-link" href={`/a/${artistSlug(song.artist)}`}><span>{song.artist}</span><ArrowUpRight size={16} aria-hidden="true"/></Link></p><div className="detail-actions"><a className="ink-button" href={spotifySearch(song)} target="_blank" rel="noopener noreferrer">Buscar en Spotify <ArrowUpRight size={17} aria-hidden="true"/></a><Link className="outline-button" href="/">Ver catálogo</Link></div></article></div></main>;
}
