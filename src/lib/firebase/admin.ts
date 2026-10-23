import {applicationDefault,cert,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

/**
 * Vercel uses explicit service-account credentials; local development can
 * continue using Application Default Credentials when these are absent.
 * Never expose these variables through NEXT_PUBLIC_.
 */
function adminApp(){
 const existing=getApps()[0];
 if(existing)return existing;

 const projectId=process.env.FIREBASE_ADMIN_PROJECT_ID||process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
 const clientEmail=process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
 const privateKey=process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g,'\n');

 if(Boolean(clientEmail)!==Boolean(privateKey)){
  throw new Error('Firebase Admin: configura FIREBASE_ADMIN_CLIENT_EMAIL y FIREBASE_ADMIN_PRIVATE_KEY juntas.');
 }

 const credential=clientEmail&&privateKey
  ?cert({projectId,clientEmail,privateKey})
  :applicationDefault();

 return initializeApp({credential,projectId});
}

export function adminAuth(){return getAuth(adminApp())}
export function adminDb(){return getFirestore(adminApp())}

export async function isEditorRequest(request:Request){
 const bearer=request.headers.get('authorization')?.match(/^Bearer (\S+)$/);
 if(!bearer)return false;
 try{return (await adminAuth().verifyIdToken(bearer[1])).admin===true}
 catch{return false}
}
