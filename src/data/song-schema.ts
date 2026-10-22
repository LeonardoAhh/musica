import type {Mood,Song} from '@/data/songs';

export type Publication='draft'|'published';
export type SongDraft=Omit<Song,'id'> & {status:Publication};
export type SongRecord=Song & {status:Publication;updatedAt:number};
export const genres=['Salsa','Cumbia'] as const;
export const moodsForEditor=['Despecho','Romance','Salsa brava','Cumbia','Nostalgia'] as const satisfies readonly Mood[];
export const palettes=['rose','peach','mint','lavender','sky'] as const;
export const statuses=['draft','published'] as const;

export function slugify(value:string){
 return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,72).replace(/-$/,'');
}
export function makeSongId(title:string,artist:string){
 return slugify(title) || slugify(title+'-'+artist);
}
export function validateDraft(draft:SongDraft):string|null{
 if(!draft.title.trim()||draft.title.trim().length>120)return 'Escribe un título de hasta 120 caracteres.';
 if(!draft.artist.trim()||draft.artist.trim().length>120)return 'Escribe un artista de hasta 120 caracteres.';
 if(!draft.note.trim()||draft.note.trim().length>500)return 'La descripción debe tener entre 1 y 500 caracteres.';
 if(!genres.includes(draft.genre))return 'Género inválido.';
 if(!moodsForEditor.includes(draft.mood))return 'Emoción inválida.';
 if(!palettes.includes(draft.palette as typeof palettes[number]))return 'Color inválido.';
 if(!statuses.includes(draft.status))return 'Estado inválido.';
 if(draft.score!==undefined&&(!Number.isInteger(draft.score)||draft.score<1||draft.score>10))return 'La nota editorial debe estar entre 1 y 10.';
 return null;
}
export function parseSong(id:string,raw:unknown):SongRecord|null{
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||id.length>80||raw===null||typeof raw!=='object')return null;
 const value=raw as Record<string,unknown>;
 if(typeof value.title!=='string'||typeof value.artist!=='string'||typeof value.note!=='string')return null;
 const candidate:SongDraft={
  title:value.title.trim(),artist:value.artist.trim(),note:value.note.trim(),
  genre:value.genre as SongDraft['genre'],mood:value.mood as Mood,
  palette:value.palette as string,featured:value.featured===true,favorite:value.favorite===true,
  score:typeof value.score==='number'?value.score:undefined,
  status:value.status as Publication
 };
 if(validateDraft(candidate))return null;
 return {...candidate,id,updatedAt:typeof value.updatedAt==='number'?value.updatedAt:0};
}
export function toSongDocument(draft:SongDraft){
 return {
  title:draft.title.trim(),artist:draft.artist.trim(),note:draft.note.trim(),
  genre:draft.genre,mood:draft.mood,palette:draft.palette,
  score:draft.score??null,featured:draft.featured===true,favorite:draft.favorite===true,
  status:draft.status,updatedAt:Date.now()
 };
}
