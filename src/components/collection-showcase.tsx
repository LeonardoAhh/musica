'use client';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {collections,tracksFor} from '@/data/collections';
import {useCatalog} from '@/components/catalog-provider';
export default function CollectionShowcase(){
 const {songs}=useCatalog();

 return <section className="collections shell" id="colecciones" aria-labelledby="collections-heading">
  <div className="section-top">
   <div><p className="eyebrow">04 / ESCUCHA A TU MANERA</p><h2 id="collections-heading">Elige una <em>emoción.</em></h2></div>
   <p className="section-desc">No siempre sabes qué canción buscas. A veces solo sabes cómo te quieres sentir.</p>
  </div>
  <div className="collection-grid">{collections.map(collection=>{
   const count=tracksFor(collection,songs).length;
   return <Link href={`/e/${collection.slug}`} className={`collection-card collection-${collection.tone}`} key={collection.slug}>
    <span className="label">{count} {count===1?'canción':'canciones'}</span>
    <div className="collection-bottom"><div><h3>{collection.name}</h3><p>{collection.tagline}</p></div><ArrowUpRight size={24} strokeWidth={1.4} aria-hidden="true"/></div>
   </Link>;
  })}</div>
 </section>;
}
