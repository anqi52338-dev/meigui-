const A=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),I=require('../dist/install29-core.js');
for(const [ua,browser]of [['Android MQQBrowser/14','qq'],['Android Quark/7','quark'],['Android UCBrowser/15','uc'],['Android Chrome/130 EdgA/130','edge'],['Android MicroMessenger/8','embedded']]){const d=I.device(ua);A.equal(d.browser,browser);A.equal(d.os,'android');A.equal(I.view(d,false,false).canPrompt,false)}
A.equal(I.view(I.device('Android MQQBrowser'),true,false).canPrompt,true);
A.equal(I.view(I.device('Android Chrome'),true,true).canPrompt,false);
A.equal(I.view(I.device('Android Chrome'),true,false,false).canPrompt,false);
A.equal(I.device('Macintosh Safari',5).os,'ios');A.equal(I.view(I.device('iPhone Safari'),true,false).canPrompt,false);
const scope='https://example.test/meigui-/',prefix='rose-phone:'+scope+':',listeners={},store=new Map();let networkCalls=0,networkFails=false,failStyle=true,deleted=[],unregistered=false;
const key=x=>new URL(typeof x==='string'?x:x.url,scope).href;
const caches={keys:async()=>[...store.keys()],delete:async n=>{deleted.push(n);return store.delete(n)},open:async n=>{if(!store.has(n))store.set(n,new Map);const data=store.get(n);return {match:async x=>data.get(key(x))?.clone(),put:async(x,r)=>data.set(key(x),r.clone())}}};
const sw={registration:{scope},clients:{claim:async()=>{}},addEventListener:(k,f)=>listeners[k]=f,skipWaiting:()=>{}};
const ctx={self:sw,caches,URL,Request,Response,AbortController,setTimeout,clearTimeout,Promise,Set,fetch:async(req)=>{networkCalls++;if(networkFails||failStyle&&key(req).includes('style.css'))throw Error('network down');return new Response('interface:'+key(req))}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/sw27.js','utf8'),ctx);
(async()=>{
 const c=await caches.open(prefix+'v29');let install;listeners.install({waitUntil:p=>install=p});await install;A.ok(await c.match('index.html'));A.equal(await c.match('style.css?v=29'),undefined);
 let intercepted=false;for(const request of [new Request(scope+'api',{method:'POST'}),new Request('https://api.other.test/'),new Request('https://example.test/other/index.html')])listeners.fetch({request,respondWith:()=>intercepted=true});A.equal(intercepted,false);
 await c.put('core.js',new Response('cached interface'));const before=networkCalls;let result;listeners.fetch({request:new Request(scope+'core.js'),respondWith:p=>result=p});A.equal(await(await result).text(),'cached interface');A.equal(networkCalls,before);
 networkFails=true;const req={url:scope+'?app=1',method:'GET',mode:'navigate'};listeners.fetch({request:req,respondWith:p=>result=p});A.match(await(await result).text(),/interface:/);
 const oldName=prefix+'v28';await caches.open(oldName);let warming;const notices=[];
 listeners.message({data:{type:'WARM29'},source:{postMessage:m=>notices.push(m)},waitUntil:p=>warming=p});await warming;A.equal(notices.at(-1).complete,false);A.equal(deleted.includes(oldName),false);
 networkFails=false;failStyle=false;listeners.message({data:{type:'WARM29'},source:{postMessage:m=>notices.push(m)},waitUntil:p=>warming=p});await warming;A.equal(notices.at(-1).complete,true);A.equal(deleted.includes(oldName),true);
 const originalFetch=ctx.fetch;let aborted=false;ctx.setTimeout=fn=>{queueMicrotask(fn);return 0};ctx.clearTimeout=()=>{};ctx.fetch=async(req,opts)=>new Promise((ok,no)=>opts.signal.addEventListener('abort',()=>{aborted=true;no(Error('timeout'))}));listeners.fetch({request:req,respondWith:p=>result=p});A.match(await(await result).text(),/interface:/);A.equal(aborted,true);ctx.fetch=originalFetch;
 // An individual precache failure is tolerated; only this app's caches are removed on repair.
 await caches.open('other-app-cache');await caches.open('rose-phone:https://example.test/another/:v1');
 await I.reset(scope,{scope,unregister:async()=>unregistered=true},caches);A.equal(unregistered,true);A.ok(deleted.includes(prefix+'v29'));A.equal(deleted.includes('other-app-cache'),false);A.equal(deleted.some(n=>n.includes('/another/')),false);
 const count=deleted.length;await A.rejects(I.reset(scope,{scope:'https://example.test/other/'},caches),/不匹配/);A.equal(deleted.length,count);
 console.log('v29: browser/OS guidance, truthful prompt gating, partial precache tolerance, cache-first interface, offline navigation fallback, API bypass and scope-isolated repair passed');
})().catch(e=>{console.error(e);process.exitCode=1});
