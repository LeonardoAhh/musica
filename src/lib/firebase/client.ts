import {getApp,getApps,initializeApp} from 'firebase/app';
import {getAuth,signInAnonymously} from 'firebase/auth';
import {deleteDoc,doc,getDoc,getFirestore,setDoc} from 'firebase/firestore';

import {firebaseConfig,firebaseConfigured} from './config';
export function getFirebaseServices(){
 if(!firebaseConfigured||typeof window==='undefined')return null;
 const app=getApps().length?getApp():initializeApp(firebaseConfig);
 return {auth:getAuth(app),db:getFirestore(app)};
}
// Reading never creates an anonymous account; visitors can browse privately.
export async function readPersonalRating(songId:string):Promise<number|null>{
 const svc=getFirebaseServices();if(!svc)return null;
 await svc.auth.authStateReady();
 const user=svc.auth.currentUser;if(!user)return null;
 const snapshot=await getDoc(doc(svc.db,'users',user.uid,'ratings',songId));
 const value=snapshot.data()?.score;
 return Number.isInteger(value)&&value>=1&&value<=5?value:null;
}
export async function writePersonalRating(songId:string,score:number|null):Promise<boolean>{
 const svc=getFirebaseServices();if(!svc)return false;
 if(score!==null&&(!Number.isInteger(score)||score<1||score>5))throw new Error('Calificación inválida');
 await svc.auth.authStateReady();
 const user=svc.auth.currentUser??(await signInAnonymously(svc.auth)).user;
 const ref=doc(svc.db,'users',user.uid,'ratings',songId);
 if(score===null)await deleteDoc(ref);
 else await setDoc(ref,{score,updatedAt:Date.now()});
 return true;
}
