import {collection,doc,documentId,getDoc,getDocs,limit,onSnapshot,orderBy,query,setDoc,startAfter,where,type DocumentSnapshot,type Unsubscribe} from 'firebase/firestore';
import {getFirebaseServices} from '@/lib/firebase/client';
import {parseSong,toSongDocument,type SongDraft,type SongRecord} from '@/data/song-schema';

export function subscribePublishedSongs(onChange:(items:SongRecord[])=>void,onError:(error:Error)=>void):Unsubscribe{
 const svc=getFirebaseServices();
 if(!svc)return ()=>{};
 return onSnapshot(query(collection(svc.db,'songs'),where('status','==','published')),snapshot=>{
  onChange(snapshot.docs.flatMap(item=>{const song=parseSong(item.id,item.data());return song&&song.status==='published'?[song]:[]}));
 },onError);
}
export const STUDIO_PAGE_SIZE=12;
export async function getEditorSongsPage(status:string,cursor:DocumentSnapshot|null){
 const svc=getFirebaseServices();if(!svc)throw Error('Configura Firebase antes de cargar canciones.');
 const constraints=[...(status==='all'?[]:[where('status','==',status)]),orderBy(documentId()),...(cursor?[startAfter(cursor)]:[]),limit(STUDIO_PAGE_SIZE+1)];
 const snapshot=await getDocs(query(collection(svc.db,'songs'),...constraints));
 const page=snapshot.docs.slice(0,STUDIO_PAGE_SIZE);
 return {items:page.flatMap(item=>{const song=parseSong(item.id,item.data());return song?[song]:[]}),last:page.at(-1)??null,hasMore:snapshot.docs.length>STUDIO_PAGE_SIZE};
}
export async function songIdExists(id:string){
 const svc=getFirebaseServices();if(!svc)throw Error('Configura Firebase antes de guardar.');
 return (await getDoc(doc(svc.db,'songs',id))).exists();
}
export async function saveSong(id:string,draft:SongDraft){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||id.length>80)throw Error('Usa una URL corta con letras, números y guiones.');
 const svc=getFirebaseServices();if(!svc)throw Error('Configura Firebase antes de guardar.');
 await setDoc(doc(svc.db,'songs',id),toSongDocument(draft));
}
