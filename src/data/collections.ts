import {songs} from './songs';
export const collections=[
 {slug:'despecho',name:'Puro despecho',tagline:'Para cantar lo que duele.',description:'Despedidas, amores imposibles y coros para cantar a todo pulmón.',moods:['Despecho'],tone:'rose'},
 {slug:'romantica',name:'Salsa romántica',tagline:'Bailar también es sentir.',description:'Melodías que se quedan contigo, aunque termine la canción.',moods:['Romance'],tone:'peach'},
 {slug:'brava',name:'Salsa brava',tagline:'Que hablen los metales.',description:'Percusión, energía y sabor para una pista sin descanso.',moods:['Salsa brava'],tone:'mint'},
 {slug:'cumbia',name:'Cumbia del alma',tagline:'Pa’ mover los pies.',description:'Sentimiento sonidero y cumbias para volver a escuchar.',moods:['Cumbia'],tone:'lavender'},
 {slug:'nostalgia',name:'Nostalgia bonita',tagline:'Recuerdos con ritmo.',description:'Canciones que hacen regresar a ese momento.',moods:['Nostalgia'],tone:'sky'},
] as const;
export type Collection=(typeof collections)[number];
export function tracksFor(collection:Collection,items=songs){return items.filter(song=>(collection.moods as readonly string[]).includes(song.mood))}
