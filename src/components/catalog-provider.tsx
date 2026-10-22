'use client';
import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {songs,type Song} from '@/data/songs';
import {firebaseConfigured} from '@/lib/firebase/config';

type Catalog={songs:Song[];source:'local'|'firestore'|'mixed';error:boolean};
const Context=createContext<Catalog>({songs,source:'local',error:false});
const firestoreOnly=process.env.NEXT_PUBLIC_CATALOG_MODE==='firestore';
export function CatalogProvider({children}:{children:ReactNode}){
 const [remote,setRemote]=useState<Song[]|null>(null);
 const [error,setError]=useState(false);
 useEffect(()=>{
  if(!firebaseConfigured)return;
  let unsubscribe=()=>{};let mounted=true;
  import('@/lib/firebase/catalog').then(({subscribePublishedSongs})=>{
   if(!mounted)return;
   unsubscribe=subscribePublishedSongs(items=>{if(mounted){setRemote(items);setError(false)}},()=>{if(mounted)setError(true)});
  }).catch(()=>{if(mounted)setError(true)});
  return()=>{mounted=false;unsubscribe()};
 },[]);
 const value=useMemo<Catalog>(()=>{
  if(remote===null)return {songs,source:'local',error};
  if(firestoreOnly)return {songs:remote,source:'firestore',error};
  const merged=new Map<string,Song>(songs.map(song=>[song.id,song]));
  for(const song of remote)merged.set(song.id,song);
  return {songs:Array.from(merged.values()),source:'mixed',error};
 },[remote,error]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useCatalog=()=>useContext(Context);
