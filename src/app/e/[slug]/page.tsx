import type {Metadata} from 'next';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowLeft} from 'lucide-react';
import {collections} from '@/data/collections';
import CollectionTrackList from '@/components/collection-track-list';
type Props={params:Promise<{slug:string}>};
export function generateStaticParams(){return collections.map(({slug})=>({slug}))}
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params;const col=collections.find(item=>item.slug===slug);
 return col?{title:`${col.name} | Ecos del Alma`,description:col.description,alternates:{canonical:`/e/${slug}`}}:{}
}
export default async function CollectionPage({params}:Props){
 const {slug}=await params;const col=collections.find(item=>item.slug===slug);
 if(!col)notFound();
 return <main className="shell detail-page"><Link className="back-link" href="/"><ArrowLeft size={16}/> Volver al archivo</Link>
 <div className={`collection-hero collection-${col.tone}`}><p className="eyebrow">ECOS DEL ALMA / COLECCIÓN</p><h1>{col.name}</h1><p className="detail-lead">{col.description}</p></div>
 <CollectionTrackList collection={col}/>
 <p className="detail-lead" style={{marginTop:50}}>¿Otra emoción? <Link href="/#colecciones"><u>Ver colecciones</u></Link>.</p></main>;
}
