'use client';
import Link from 'next/link';
import {ArrowUpRight} from 'lucide-react';
import {useCatalog} from '@/components/catalog-provider';
import {tracksFor,type Collection} from '@/data/collections';
export default function CollectionTrackList({collection}:{collection:Collection}){
 const {songs}=useCatalog();
 const tracks=tracksFor(collection,songs);
 return <><p className="collection-count">{tracks.length} canciones · {collection.tagline}</p><div className="artist-song-list">{tracks.map((song,index)=><Link key={song.id} href={`/c/${song.id}`}><span className="collection-index">{String(index+1).padStart(2,'0')}</span><span className="collection-title"><strong>{song.title}</strong><small>{song.artist} · {song.score??'—'}/10</small></span><ArrowUpRight size={20}/></Link>)}</div></>;
}
