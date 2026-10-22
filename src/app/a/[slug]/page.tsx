import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowLeft,ArrowUpRight} from 'lucide-react';
import {songs} from '@/data/songs';
import {artists,artistSlug,findArtist} from '@/data/paths';
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return artists.map(name=>({slug:artistSlug(name)}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params;const name=findArtist(slug);return name?{title:`${name} | Ecos del Alma`,description:`Descubre canciones de ${name} en Ecos del Alma.`,alternates:{canonical:`/a/${slug}`}}:{}}
export default async function ArtistPage({params}:Props){
 const {slug}=await params;const name=findArtist(slug);if(!name)notFound();const tracks=songs.filter(s=>s.artist===name);
 return <main className="shell detail-page"><Link className="back-link" href="/"><ArrowLeft size={16}/> Archivo musical</Link><p className="eyebrow" style={{marginTop:70}}>ARTISTA / ECOS DEL ALMA</p><h1>{name}</h1><p className="detail-lead">Canciones de {name} que forman parte de nuestra colección editorial. Seleccionadas por la melodía, el sentimiento y el ritmo.</p><div className="artist-song-list">{tracks.map(s=><Link href={`/c/${s.id}`} key={s.id}><span>{s.title} <small style={{color:'var(--muted)'}}> · {s.mood} · {s.score??'—'}/10</small></span><ArrowUpRight size={20}/></Link>)}</div></main>
}
