import {songs} from './songs';
export const artistSlug=(name:string)=>name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' y ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export const artists=Array.from(new Set(songs.map(song=>song.artist)));
export function findArtist(slug:string){return artists.find(name=>artistSlug(name)===slug)}
