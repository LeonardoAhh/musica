/* Ecos del Alma — offline navigation fallback; no third-party media caching. */
const VERSION='eda-offline-v2';
const OFFLINE='/offline.html';
const SHELL=[OFFLINE,'/icon-192.svg','/icon-512.svg'];
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(SHELL)));
 self.skipWaiting();
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('eda-')&&key!==VERSION).map(key=>caches.delete(key)))));
 self.clients.claim();
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||request.mode!=='navigate'||new URL(request.url).origin!==self.location.origin)return;
 event.respondWith(fetch(request).catch(async()=>await caches.match(OFFLINE)||new Response('Sin conexión',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})));
});
