// Privileged local CLI only. Never import from client code or expose service credentials.
import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';

const uid=process.argv[2];
const projectId=process.env.GOOGLE_CLOUD_PROJECT||process.env.GCLOUD_PROJECT;
if(!uid||!projectId||!process.env.GOOGLE_APPLICATION_CREDENTIALS){
 console.error('Uso: configurar GOOGLE_APPLICATION_CREDENTIALS y GOOGLE_CLOUD_PROJECT, luego npm run studio:grant-admin -- <UID>');
 process.exit(1);
}
if(!/^[A-Za-z0-9_-]{5,128}$/.test(uid)){
 console.error('UID inválido.');
 process.exit(1);
}
try{
 const app=getApps()[0]||initializeApp({credential:applicationDefault(),projectId});
 const user=await getAuth(app).getUser(uid);
 await getAuth(app).setCustomUserClaims(uid,{...user.customClaims,admin:true});
 console.log('Rol editor asignado. Cierra sesión y vuelve a entrar en /studio para actualizar el token.');
}catch(error){
 console.error('No se pudo configurar el rol:',error instanceof Error?error.message:String(error));
 process.exitCode=1;
}
