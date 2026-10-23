import {createHash,randomBytes} from 'node:crypto';
import {FieldValue} from 'firebase-admin/firestore';
import {NextResponse} from 'next/server';
import {validateSongSuggestionTitle} from '@/data/song-suggestion';
import {adminDb} from '@/lib/firebase/admin';

export const runtime='nodejs';

const MAX_BODY_BYTES=1024;
const MAX_PER_DAY=5;
const DAY=24*60*60*1000;

async function readSmallBody(request:Request){
 const reader=request.body?.getReader();
 if(!reader)return '';
 const chunks:Uint8Array[]=[];
 let total=0;
 while(true){
  const {done,value}=await reader.read();
  if(done)break;
  total+=value.byteLength;
  if(total>MAX_BODY_BYTES){await reader.cancel();throw Error('too-large')}
  chunks.push(value);
 }
 return Buffer.concat(chunks).toString('utf8');
}

function visitorKey(request:Request){
 const address=(request.headers.get('x-forwarded-for')?.split(',')[0]??request.headers.get('x-real-ip')??'').trim();
 if(!address||address.length>45||!/^[\da-fA-F:.]+$/.test(address))return null;
 return createHash('sha256').update(`${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID??''}:${address}`).digest('hex');
}

export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(request.headers.get('sec-fetch-site')==='cross-site'||origin&&origin!==new URL(request.url).origin)return NextResponse.json({error:'Solicitud no permitida.'},{status:403});
 if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json')return NextResponse.json({error:'Formato no permitido.'},{status:415});
 if(Number(request.headers.get('content-length')??0)>MAX_BODY_BYTES)return NextResponse.json({error:'La solicitud es demasiado grande.'},{status:413});

 let body:unknown;
 try{body=JSON.parse(await readSmallBody(request))}
 catch(error){return NextResponse.json({error:error instanceof Error&&error.message==='too-large'?'La solicitud es demasiado grande.':'Solicitud inválida.'},{status:error instanceof Error&&error.message==='too-large'?413:400})}
 const titleResult=validateSongSuggestionTitle(body&&typeof body==='object'?(body as Record<string,unknown>).title:undefined);
 if(!titleResult.title)return NextResponse.json({error:titleResult.error},{status:400});
 const title=titleResult.title;

 try{
  const db=adminDb();
  const now=Date.now();
  const id=`${now.toString(36).padStart(9,'0')}-${randomBytes(6).toString('hex')}`;
  const titleKey=createHash('sha256').update(title.toLocaleLowerCase('es')).digest('hex');
  const suggestion=db.collection('songSuggestions').doc(id);
  const duplicate=db.collection('songSuggestionKeys').doc(titleKey);
  const visitor=visitorKey(request);
  const rate=visitor?db.collection('songSuggestionRates').doc(visitor):null;
  const outcome=await db.runTransaction(async transaction=>{
   const [existing,rateSnapshot]=await Promise.all([transaction.get(duplicate),rate?transaction.get(rate):Promise.resolve(null)]);
   if(existing.exists)return 'duplicate';
   const previous=rateSnapshot?.data();
   const active=typeof previous?.windowStartMs==='number'&&now-previous.windowStartMs<DAY;
   const count=active&&typeof previous?.count==='number'?previous.count:0;
   if(count>=MAX_PER_DAY)return 'limited';
   transaction.create(suggestion,{title,status:'pending',createdAt:FieldValue.serverTimestamp(),addedAt:null});
   transaction.create(duplicate,{suggestionId:id,createdAt:FieldValue.serverTimestamp()});
   if(rate)transaction.set(rate,{count:count+1,windowStartMs:active?previous.windowStartMs:now});
   return 'created';
  });
  if(outcome==='limited')return NextResponse.json({error:'Has enviado varias sugerencias. Intenta mañana.'},{status:429});
  return NextResponse.json({message:'Revisaré esa canción para el archivo.'},{status:outcome==='created'?201:200});
 }catch{
  return NextResponse.json({error:'No pudimos recibir tu sugerencia. Inténtalo más tarde.'},{status:503});
 }
}
