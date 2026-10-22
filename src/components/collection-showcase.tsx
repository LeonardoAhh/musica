'use client';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {collections,tracksFor} from '@/data/collections';
import {useCatalog} from '@/components/catalog-provider';
export default function CollectionShowcase(){const {songs}=useCatalog();return <section className="collections shell" id="colecciones"><div className="section-top"><div><p className="eyebrow">04 / ESCUCHA A TU MANERA</p><h2>Elige una <em>emoción.</em></h2></div><p className="section-desc">No siempre sabes qué canción buscas. A veces solo sabes cómo te quieres sentir.</p></div><div className="collection-grid">{collections.map(c=><Link href={`/e/${c.slug}`} className={`collection-card collection-${c.tone}`} key={c.slug}><span className="label">ECOS DEL ALMA / {String(tracksFor(c,songs).length).padStart(2,'0')} JOYAS</span><div className="collection-bottom"><div><h3>{c.name}</h3><p>{c.tagline}</p></div><ArrowUpRight size={24} strokeWidth={1.4}/></div></Link>)}</div></section>}
