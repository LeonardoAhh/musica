import {applicationDefault,getApps,initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {NextResponse} from 'next/server';
import {genres,moodsForEditor} from '@/data/song-schema';

export const runtime='nodejs';
const MAX_IMAGE_BYTES=4*1024*1024;
const allowedTypes=new Set(['image/jpeg','image/png','image/webp']);
const models=['gemini-3.5-flash-lite','gemini-3.1-flash-lite'] as const;

function clean(value:unknown,max:number){return typeof value==='string'?value.trim().slice(0,max):''}

export async function POST(request:Request){
 const key=process.env.GEMINI_API_KEY;
 if(!key)return NextResponse.json({error:'La lectura de imágenes no está configurada.'},{status:503});
 const bearer=request.headers.get('authorization')?.match(/^Bearer (.+)$/);
 if(!bearer)return NextResponse.json({error:'Inicia sesión como editor.'},{status:401});
 try{
  const app=getApps()[0]??initializeApp({credential:applicationDefault(),projectId:process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID});
  const token=await getAuth(app).verifyIdToken(bearer[1]);
  if(token.admin!==true)return NextResponse.json({error:'Acceso restringido.'},{status:403});
 }catch{return NextResponse.json({error:'No se pudo verificar el acceso del editor.'},{status:401})}
 if(Number(request.headers.get('content-length')??0)>6*1024*1024)return NextResponse.json({error:'La imagen es demasiado grande.'},{status:413});
 let body:unknown;
 try{body=await request.json()}catch{return NextResponse.json({error:'Solicitud inválida.'},{status:400})}
 const input=body&&typeof body==='object'?body as Record<string,unknown>:{};
 const mimeType=input.mimeType;
 const data=input.data;
 if(typeof mimeType!=='string'||!allowedTypes.has(mimeType)||typeof data!=='string'||data.length>Math.ceil(MAX_IMAGE_BYTES*4/3)+4||!/^[-A-Za-z0-9+/]*={0,2}$/.test(data))return NextResponse.json({error:'Usa una imagen JPG, PNG o WebP de hasta 4 MB.'},{status:400});
 const image=Buffer.from(data,'base64');
 if(!image.length||image.length>MAX_IMAGE_BYTES)return NextResponse.json({error:'La imagen es demasiado grande.'},{status:413});
 const prompt='Lee esta imagen para ayudar a capturar una canción en un archivo musical. Devuelve solo JSON con title, artist, note, genre y mood. Copia title y artist solo si son legibles; si faltan devuelve cadena vacía. Para note, copia una descripción visible si existe. Si no existe pero se leen título y artista, redacta una descripción editorial breve usando únicamente esos datos y elementos visuales verificables de la portada; si la portada no aporta más, usa la forma «Título», de Artista. No atribuyas sonido, letra, historia, intención, fecha ni otros hechos no visibles. genre solo puede ser Salsa o Cumbia si está explícito. mood solo puede ser Despecho, Romance, Salsa brava, Cumbia o Nostalgia si está explícito. Nunca deduzcas la nota editorial ni el estado de publicación.';
 try{
  const payload=JSON.stringify({contents:[{parts:[{text:prompt},{inlineData:{mimeType,data}}]}],generationConfig:{maxOutputTokens:700,responseMimeType:'application/json',responseSchema:{type:'OBJECT',properties:{title:{type:'STRING'},artist:{type:'STRING'},note:{type:'STRING'},genre:{type:'STRING'},mood:{type:'STRING'}},required:['title','artist','note','genre','mood']}}});
  let response:Response|undefined;
  for(const model of models){
   response=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{
    method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},signal:AbortSignal.timeout(20000),body:payload
   });
   if(response.status!==404)break;
  }
  if(!response)throw Error('No se seleccionó un modelo de Gemini.');
  if(!response.ok){
   const failure=await response.json().catch(()=>null);
   const providerStatus=typeof failure?.error?.status==='string'&&/^[A-Z_]+$/.test(failure.error.status)?failure.error.status:'';
   const reason=response.status===400?'Gemini rechazó la solicitud.':response.status===401||response.status===403?'La clave de Gemini no tiene acceso al modelo.':response.status===404?'Ningún modelo de lectura de imágenes está disponible para esta clave.':response.status===429?'Se alcanzó el límite gratuito del modelo.':response.status>=500?'Gemini no está disponible en este momento.':'No se pudo analizar la imagen.';
   return NextResponse.json({error:`${reason} (${response.status}${providerStatus?' '+providerStatus:''})`},{status:502});
  }
  const result=await response.json();
  const text=result?.candidates?.[0]?.content?.parts?.find((part:{text?:string})=>typeof part.text==='string')?.text;
  if(typeof text!=='string')return NextResponse.json({error:'Gemini no devolvió datos legibles de la imagen.'},{status:502});
  const raw=JSON.parse(text) as Record<string,unknown>;
  const title=clean(raw.title,120),artist=clean(raw.artist,120);
  const note=clean(raw.note,500)||(title&&artist?`«${title}», de ${artist}.`:'');
  const genre=clean(raw.genre,30),mood=clean(raw.mood,30);
  return NextResponse.json({title,artist,note,genre:genres.includes(genre as typeof genres[number])?genre:'',mood:moodsForEditor.includes(mood as typeof moodsForEditor[number])?mood:''},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return NextResponse.json({error:error instanceof Error&&error.name==='TimeoutError'?'La conexión con Gemini tardó demasiado.':'No se pudo completar la lectura de la imagen.'},{status:502})}
}
