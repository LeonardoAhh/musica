export type SongSuggestionStatus='pending'|'added';

export type SongSuggestion={
 id:string;
 title:string;
 status:SongSuggestionStatus;
 createdAt:string;
 addedAt:string|null;
};

const allowedTitle=/^[\p{L}\p{M}\p{N}\p{Zs}\p{Pd}.,!?¡¿'’"“”()&/+:;%…]+$/u;

export function validateSongSuggestionTitle(input:unknown):{title:string;error?:never}|{title?:never;error:string}{
 if(typeof input!=='string')return {error:'Escribe el nombre de la canción.'};
 const title=input.normalize('NFKC').replace(/\s+/g,' ').trim();
 const length=[...title].length;
 if(length<2)return {error:'Escribe al menos dos caracteres.'};
 if(length>100)return {error:'El nombre no puede superar 100 caracteres.'};
 if(!allowedTitle.test(title)||/\b(?:https?:\/\/|www\.)/i.test(title))return {error:'Usa solo el nombre de la canción, sin enlaces ni símbolos especiales.'};
 return {title};
}
