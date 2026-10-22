/* Ecos del Alma: conservative offline home fallback; never cache third-party audio. */
const CACHE='eda-shell-v1';const ASSETS=['/','/icon-192.svg','/icon-512.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim()});
self.addEventListener('fetch',event=>{const request=event.request;if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin||request.mode!=='navigate')return;event.respondWith(fetch(request).catch(async()=>{const cached=await caches.match('/');return cached||Response.error()}))});
