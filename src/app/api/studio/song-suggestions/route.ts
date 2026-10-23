import {FieldValue,Timestamp} from 'firebase-admin/firestore';
import {NextResponse} from 'next/server';
import {adminDb,isEditorRequest} from '@/lib/firebase/admin';
import type {SongSuggestion} from '@/data/song-suggestion';

export const runtime='nodejs';
const PAGE_SIZE=3;
const validId=/^[0-9a-z]{9}-[0-9a-f]{12}$/;

function present(id:string,data:FirebaseFirestore.DocumentData):SongSuggestion{
 return {
  id,
  title:typeof data.title==='string'?data.title:'',
  status:data.status==='added'?'added':'pending',
  createdAt:data.createdAt instanceof Timestamp?data.createdAt.toDate().toISOString():'',
  addedAt:data.addedAt instanceof Timestamp?data.addedAt.toDate().toISOString():null
 };
}

export async function GET(request:Request){
 if(!await isEditorRequest(request))return NextResponse.json({error:'Acceso restringido.'},{status:403});
 const cursor=new URL(request.url).searchParams.get('cursor');
 if(cursor&&!validId.test(cursor))return NextResponse.json({error:'Página inválida.'},{status:400});
 try{
  const suggestions=adminDb().collection('songSuggestions');
  let query=suggestions.orderBy('createdAt','desc').limit(PAGE_SIZE+1);
  if(cursor){
   const last=await suggestions.doc(cursor).get();
   if(!last.exists)return NextResponse.json({error:'Página no disponible.'},{status:400});
   query=query.startAfter(last);
  }
  const snapshot=await query.get();
  const page=snapshot.docs.slice(0,PAGE_SIZE);
  return NextResponse.json({items:page.map(doc=>present(doc.id,doc.data())),nextCursor:snapshot.docs.length>PAGE_SIZE?page.at(-1)?.id:null},{headers:{'Cache-Control':'no-store'}});
 }catch(error){
  console.error('No se pudieron consultar las sugerencias de Studio:',error instanceof Error?error.message:'Error desconocido');
  return NextResponse.json({error:'No pudimos cargar las sugerencias.'},{status:503});
 }
}

export async function PATCH(request:Request){
 if(!await isEditorRequest(request))return NextResponse.json({error:'Acceso restringido.'},{status:403});
 if(Number(request.headers.get('content-length')??0)>512)return NextResponse.json({error:'Solicitud inválida.'},{status:413});
 let input:unknown;
 try{input=await request.json()}catch{return NextResponse.json({error:'Solicitud inválida.'},{status:400})}
 const data=input&&typeof input==='object'?input as Record<string,unknown>:{};
 if(typeof data.id!=='string'||!validId.test(data.id)||data.status!=='added')return NextResponse.json({error:'Solicitud inválida.'},{status:400});
 try{
  const reference=adminDb().collection('songSuggestions').doc(data.id);
  const snapshot=await reference.get();
  if(!snapshot.exists)return NextResponse.json({error:'Sugerencia no encontrada.'},{status:404});
  if(snapshot.data()?.status!=='added')await reference.update({status:'added',addedAt:FieldValue.serverTimestamp()});
  return NextResponse.json({status:'added'},{headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'No pudimos actualizar la sugerencia.'},{status:503})}
}
