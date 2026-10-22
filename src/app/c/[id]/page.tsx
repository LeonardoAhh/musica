import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowLeft,ArrowUpRight} from 'lucide-react';
import {songs,spotifySearch} from '@/data/songs';
import {artistSlug} from '@/data/paths';
import StarRating from '@/components/star-rating';
type Props={params:Promise<{id:string}>};
export function generateStaticParams(){return songs.map(({id})=>({id}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {id}=await params;const song=songs.find(s=>s.id===id);if(!song)return {};return {title:`${song.title} — ${song.artist} | Ecos del Alma`,description:song.note,alternates:{canonical:`/c/${id}`}}}
export default async function SongPage({params}:Props){
 const {id}=await params;const song=songs.find(s=>s.id===id);if(!song)notFound();
 const related=songs.filter(s=>s.id!==song.id&&(s.artist===song.artist||s.mood===song.mood)).slice(0,3);
 return <main className="shell detail-page"><Link className="back-link" href="/"><ArrowLeft size={16}/> Explorar archivo</Link><div className="detail-layout">
 <div className={`sleeve sleeve-${song.palette}`} aria-label={`Arte tipográfico de ${song.title}`}><div className="sleeve-sun"/><div className="sleeve-lines"/><div className="sleeve-inner"><span className="sleeve-kicker">ECOS DEL ALMA / ARCHIVO SONORO</span><strong className="sleeve-title">{song.title}</strong><span className="sleeve-artist">{song.artist}</span></div><span className="vinyl"/></div>
 <article><p className="eyebrow">{song.genre} / {song.mood} · {song.score??'—'}/10</p><h1>{song.title}</h1><p className="detail-lead">{song.note}</p><StarRating songId={song.id}/><p><Link href={`/a/${artistSlug(song.artist)}`}>{song.artist} <ArrowUpRight size={16} aria-hidden="true"/></Link></p><div className="detail-actions"><a className="ink-button" href={spotifySearch(song)} target="_blank" rel="noopener noreferrer">Buscar en Spotify <ArrowUpRight size={17}/></a><Link className="outline-button" href="/">Volver a la colección</Link></div></article></div>
 {related.length>0&&<section className="catalog"><p className="eyebrow">OTRAS JOYAS</p><h2 style={{fontFamily:'var(--font-editorial),serif',fontWeight:300,fontSize:'clamp(40px,6vw,68px)'}}>Sigue escuchando.</h2><div className="related-grid">{related.map(s=><Link className="related-link" key={s.id} href={`/c/${s.id}`}><b>{s.title}</b><span>{s.artist}</span><span>{s.mood} · {s.score??'—'}/10 <ArrowUpRight size={13} aria-hidden="true"/></span></Link>)}</div></section>}</main>
}
