import {getApp,getApps,initializeApp} from 'firebase/app';
import {getAuth,signInAnonymously} from 'firebase/auth';
import {deleteDoc,doc,getDoc,getFirestore,setDoc} from 'firebase/firestore';

const config={
 apiKey:process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
 authDomain:process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
 projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
 storageBucket:process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
 messagingSenderId:process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
 appId:process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
export const firebaseConfigured=Boolean(config.apiKey&&config.authDomain&&config.projectId&&config.appId);
function services(){
 if(!firebaseConfigured||typeof window==='undefined')return null;
 const app=getApps().length?getApp():initializeApp(config);
 return {auth:getAuth(app),db:getFirestore(app)};
}
// Reading never creates an anonymous account; visitors can browse privately.
export async function readPersonalRating(songId:string):Promise<number|null>{
 const svc=services();if(!svc)return null;
 await svc.auth.authStateReady();
 const user=svc.auth.currentUser;if(!user)return null;
 const snapshot=await getDoc(doc(svc.db,'users',user.uid,'ratings',songId));
 const value=snapshot.data()?.score;
 return Number.isInteger(value)&&value>=1&&value<=5?value:null;
}
export async function writePersonalRating(songId:string,score:number|null):Promise<boolean>{
 const svc=services();if(!svc)return false;
 if(score!==null&&(!Number.isInteger(score)||score<1||score>5))throw new Error('Calificación inválida');
 await svc.auth.authStateReady();
 const user=svc.auth.currentUser??(await signInAnonymously(svc.auth)).user;
 const ref=doc(svc.db,'users',user.uid,'ratings',songId);
 if(score===null)await deleteDoc(ref);
 else await setDoc(ref,{score,updatedAt:Date.now()});
 return true;
}
