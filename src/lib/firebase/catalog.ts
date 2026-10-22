import {collection,doc,getDocs,onSnapshot,query,setDoc,where,writeBatch,type Unsubscribe} from 'firebase/firestore';
import {getFirebaseServices} from '@/lib/firebase/client';
import {parseSong,toSongDocument,type SongDraft,type SongRecord} from '@/data/song-schema';
import {songs} from '@/data/songs';

export function subscribePublishedSongs(onChange:(items:SongRecord[])=>void,onError:(error:Error)=>void):Unsubscribe{
 const svc=getFirebaseServices();
 if(!svc)return ()=>{};
 return onSnapshot(query(collection(svc.db,'songs'),where('status','==','published')),snapshot=>{
  onChange(snapshot.docs.flatMap(item=>{const song=parseSong(item.id,item.data());return song&&song.status==='published'?[song]:[]}));
 },onError);
}
export function subscribeEditorSongs(onChange:(items:SongRecord[])=>void,onError:(error:Error)=>void):Unsubscribe{
 const svc=getFirebaseServices();if(!svc)return ()=>{};
 return onSnapshot(collection(svc.db,'songs'),snapshot=>{
  onChange(snapshot.docs.flatMap(item=>{const song=parseSong(item.id,item.data());return song?[song]:[]}).sort((a,b)=>a.title.localeCompare(b.title,'es')));
 },onError);
}
export async function saveSong(id:string,draft:SongDraft){
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||id.length>80)throw Error('Usa una URL corta con letras, números y guiones.');
 const svc=getFirebaseServices();if(!svc)throw Error('Configura Firebase antes de guardar.');
 await setDoc(doc(svc.db,'songs',id),toSongDocument(draft));
}
export async function importStarterCatalog(){
 const svc=getFirebaseServices();if(!svc)throw Error('Configura Firebase antes de importar.');
 const existing=await getDocs(collection(svc.db,'songs'));
 const ids=new Set(existing.docs.map(item=>item.id));
 const missing=songs.filter(song=>!ids.has(song.id));
 if(!missing.length)return 0;
 const batch=writeBatch(svc.db);
 for(const song of missing){
  const {id,...draft}=song;
  batch.set(doc(svc.db,'songs',id),toSongDocument({...draft,status:'published'}));
 }
 await batch.commit();
 return missing.length;
}
