import type {MetadataRoute} from 'next';
import {songs} from '@/data/songs';
import {artists,artistSlug} from '@/data/paths';

const base='https://musica-tau-livid.vercel.app';

export default function sitemap():MetadataRoute.Sitemap{
 return [
  {url:base+'/',changeFrequency:'weekly',priority:1},
  ...songs.map(song=>({url:base+'/c/'+song.id,changeFrequency:'monthly' as const,priority:0.8})),
  ...artists.map(artist=>({url:base+'/a/'+artistSlug(artist),changeFrequency:'monthly' as const,priority:0.7})),
 ];
}
