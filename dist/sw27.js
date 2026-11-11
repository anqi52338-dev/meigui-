/* Scoped interface cache: never intercept API calls or store user data. */
const PREFIX='rose-phone:'+self.registration.scope+':',CACHE=PREFIX+'v30';
const ASSETS=["./", "index.html", "offline29.html", "style.css?v=29", "advanced.css", "wechat.css", "v6.css", "homeland.css", "themes.css?v=29", "desktop.css", "clear.css", "daily.css", "studio.css", "living.css?v=20", "home-renovation.css?v=16.2", "doll-v17.css?v=17", "pets-art.js", "themes.js", "wx18.css?v=18", "wx19.css?v=19", "update21.css?v=21", "upgrade22.css?v=22", "tidy23.css?v=23", "fresh24.css?v=24", "fix25.css?v=25", "chat26.css?v=26", "chat27.css?v=27", "manifest.webmanifest", "app-icon27-192.png", "core.js", "features.js?v=25", "worldbook.js", "life.js", "connections.js?v=27", "notifications.js?v=27", "stickers.js?v=27", "wallet.js", "wechat.js", "social.js", "threaded-feed.js", "voice.js", "security.js", "home-engine.js", "home-world.js", "home-art.js", "homeland.js?v=16.2", "desktop-core.js", "desktop.js?v=22", "chat-ui.js", "daily-core.js", "daily.js", "studio-core.js", "studio.js", "living-core.js?v=20", "living.js?v=22", "living-home.js?v=22", "home-cash.js", "reference-characters.js", "doll-layers.js?v=16.2", "doll-v17-data.js?v=17", "doll-v17.js?v=17.3.1", "home-renovation.js", "furniture-data.js?v=17", "home-flat.js?v=17", "wx18-core.js", "app.js?v=27", "wx18.js?v=27", "wx19-core.js", "wx19-icons.js", "wx19.js?v=27", "update21.js?v=27", "upgrade22-core.js?v=22", "upgrade22.js?v=22", "tidy23.js?v=23", "fresh24-core.js?v=24", "fresh24.js?v=24", "fix25-core.js?v=25", "fix25.js?v=27", "chat26-core.js?v=26", "chat26.js?v=28", "chat27-core.js?v=27", "sticker-pack27.js?v=27", "chat27.js?v=29", "sticker-gallery27.js?v=27", "output28-core.js?v=29", "output28.js?v=29", "install29-core.js?v=29", "install29.js?v=30"];
const allowed=new Set(ASSETS.map(x=>new URL(x,self.registration.scope).pathname));
const critical=ASSETS.filter(x=>/^(index\.html|offline29\.html|manifest\.webmanifest|app-icon27-|install29|output28|chat27\.js|style\.css|themes\.css)/.test(x));
let warming=null;
async function network29(req,ms=4000){const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),ms);try{return await fetch(req,{signal:ctl.signal})}finally{clearTimeout(timer)}}
async function oldMatch29(req){for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE){const hit=await(await caches.open(name)).match(req);if(hit)return hit}}
async function put29(cache,key,response){if(response.ok&&!response.redirected)try{await cache.put(key,response.clone())}catch{}}
async function cacheOne29(cache,path){try{if(await cache.match(path))return;const res=await network29(new Request(new URL(path,self.registration.scope)),8000);await put29(cache,path,res)}catch{}}
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await Promise.all(critical.map(p=>cacheOne29(cache,p)))})()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
async function warm29(client){
 if(warming)return warming;
 warming=(async()=>{const cache=await caches.open(CACHE);for(let i=0;i<ASSETS.length;i+=6)await Promise.all(ASSETS.slice(i,i+6).map(p=>cacheOne29(cache,p)));let cached=0;for(const p of ASSETS)if(await cache.match(p))cached++;const complete=cached===ASSETS.length;client?.postMessage({type:'CACHE_STATUS29',cached,total:ASSETS.length,complete});if(complete)for(const k of await caches.keys())if(k.startsWith(PREFIX)&&k!==CACHE)await caches.delete(k)})().finally(()=>warming=null);return warming;
}
self.addEventListener('message',event=>{if(event.data==='ACTIVATE27'||event.data==='ACTIVATE29')self.skipWaiting();else if(event.data?.type==='WARM29')event.waitUntil(warm29(event.source))});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url),scope=new URL(self.registration.scope);
 if(req.method!=='GET'||url.origin!==scope.origin||!url.pathname.startsWith(scope.pathname))return;
 const nav=req.mode==='navigate'&&(url.pathname===scope.pathname||url.pathname===new URL('index.html',scope).pathname);
 if(!nav&&!allowed.has(url.pathname))return;
 event.respondWith((async()=>{const cache=await caches.open(CACHE),key=nav?'index.html':req;const hit=await cache.match(key)||await oldMatch29(key);if(!nav&&hit)return hit;try{const res=await network29(req);if(!res.ok&&hit)return hit;await put29(cache,key,res);return res}catch{if(hit)return hit;return nav&&await cache.match('offline29.html')||new Response('<meta charset="utf-8"><p>界面尚未缓存完整，请联网后重新打开玫瑰小手机。</p>',{status:503,headers:{'Content-Type':'text/html; charset=utf-8'}})}})());
});
