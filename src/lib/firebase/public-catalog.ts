import {collection,doc,getDoc,getDocs,query,where} from 'firebase/firestore';
import {getFirebaseServices} from './client';
import {parseSong,type SongRecord} from '@/data/song-schema';
export async function fetchPublicSong(id:string):Promise<SongRecord|null>{
 const svc=getFirebaseServices();if(!svc)return null;
 const snapshot=await getDoc(doc(svc.db,'songs',id));
 if(!snapshot.exists())return null;
 const song=parseSong(snapshot.id,snapshot.data());
 return song?.status==='published'?song:null;
}
export async function fetchPublicSongs():Promise<SongRecord[]>{
 const svc=getFirebaseServices();if(!svc)return [];
 const snapshot=await getDocs(query(collection(svc.db,'songs'),where('status','==','published')));
 return snapshot.docs.flatMap(doc=>{const parsed=parseSong(doc.id,doc.data());return parsed?.status==='published'?[parsed]:[]});
}
