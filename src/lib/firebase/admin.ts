import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

function adminApp(){
 return getApps()[0]??initializeApp({credential:applicationDefault(),projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID});
}

export function adminDb(){return getFirestore(adminApp())}

export async function isEditorRequest(request:Request){
 const bearer=request.headers.get('authorization')?.match(/^Bearer (\S+)$/);
 if(!bearer)return false;
 try{return (await getAuth(adminApp()).verifyIdToken(bearer[1])).admin===true}
 catch{return false}
}
