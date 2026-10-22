import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowLeft,ArrowUpRight} from 'lucide-react';
import {collections,tracksFor} from '@/data/collections';
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return collections.map(({slug})=>({slug}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{const {slug}=await params;const col=collections.find(c=>c.slug===slug);return col?{title:`${col.name} | Ecos del Alma`,description:col.description,alternates:{canonical:`/e/${slug}`},openGraph:{title:`${col.name} — Ecos del Alma`,description:col.description}}:{}}
export default async function CollectionPage({params}:Props){const {slug}=await params;const col=collections.find(c=>c.slug===slug);if(!col)notFound();const tracks=tracksFor(col);
return <main className="shell detail-page"><Link className="back-link" href="/"><ArrowLeft size={16}/> Volver al archivo</Link><div className={`collection-hero collection-${col.tone}`}><p className="eyebrow">ECOS DEL ALMA / COLECCIÓN</p><h1>{col.name}</h1><p className="detail-lead">{col.description}</p><span className="collection-count">{tracks.length} canciones · {col.tagline}</span></div><div className="artist-song-list">{tracks.map((song,index)=><Link key={song.id} href={`/c/${song.id}`}><span className="collection-index">{String(index+1).padStart(2,'0')}</span><span className="collection-title"><strong>{song.title}</strong><small>{song.artist} · {song.score??'—'}/10</small></span><ArrowUpRight size={20}/></Link>)}</div><p className="detail-lead" style={{marginTop:50}}>Una selección editorial. ¿Quieres explorar otra emoción? <Link href="/#colecciones"><u>Ver todas las colecciones</u></Link>.</p></main>}
