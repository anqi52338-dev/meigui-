const A=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('../dist/chat27-core.js'),C26=require('../dist/chat26-core.js');
function library(fail=false){
 const storage=new Map(),images=new Map([['sticker:mine','original']]);let fetches=0;
 const ctx={Map,Blob,queueMicrotask,customStickers:[{id:'mine',name:'自己的表情',mood:'保留原描述'}],stickerPack27:[{id:'pack-a',name:'猫',mood:'开心',src:'a.png'}],task22:false,phoneLocked:false,mediaCache:new Map(images),
  localRead:(k,f)=>storage.has(k)?JSON.parse(storage.get(k)):f,localSave:(k,v)=>{if(fail&&k==='pack27Imported')throw Error('quota');storage.set(k,JSON.stringify(v))},
  fetch:async()=>{fetches++;return {ok:true,blob:async()=>new Blob(['img'])}},FileReader:class{readAsDataURL(){this.result='data:image/png;base64,aW1n';queueMicrotask(()=>this.onload())}},
  mediaDB:Promise.resolve({transaction:()=>{const ops=[],tx={objectStore:()=>({put:(v,k)=>ops.push(['put',k,v]),delete:k=>ops.push(['delete',k])})};queueMicrotask(()=>{for(const[op,k,v]of ops)if(op==='put')images.set(k,v);else images.delete(k);tx.oncomplete?.()});return tx}})};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('dist/sticker-gallery27.js','utf8').split('function chooseCustom27')[0],ctx);return {ctx,images,storage,fetches:()=>fetches};
}
(async()=>{
 const ok=library();await Promise.all([ok.ctx.ensurePack27(),ok.ctx.ensurePack27()]);A.equal(ok.fetches(),1);A.equal(ok.ctx.customStickers.length,2);A.equal(ok.ctx.customStickers[0].mood,'保留原描述');A.equal(ok.images.get('sticker:mine'),'original');A.equal(ok.ctx.task22,false);await ok.ctx.ensurePack27();A.equal(ok.fetches(),1);
 const failed=library(true);await A.rejects(failed.ctx.ensurePack27(),/quota/);A.equal(failed.ctx.customStickers.length,1);A.equal(failed.images.size,1);A.equal(failed.images.get('sticker:mine'),'original');A.equal(failed.ctx.task22,false);
 // Deletion rolls back all affected state and the avatar if a later storage write fails.
 const lc={window:{}};vm.createContext(lc);vm.runInContext(fs.readFileSync('dist/living-core.js','utf8'),lc);
 const c={Chat27:core,Chat26:C26,PalaisLiving:lc.window.PalaisLiving,Date,Map,busy:false,socialBusy:false,memoryBusy:false,livingChatBusy:false,auto21Busy:false,task22:false,mutating27:false,
  roles:[{id:'a'},{id:'b'}],histories:{a:[],b:[]},wallet:{balance:10000,ledger:[],accounts:{},roleTransfers:[]},groups:[],memories:{a:{summary:'记忆'}},living:{guests:[],avatars:{},events:[],jobs:[]},relations:[],moments:[],feedEvents:[],notices:[],wx18:{prefs:{},drafts:{}},worldbook:[{roleId:'a'}],dissolved25:{},mediaCache:new Map([['role:a','avatar']]),staged26:new Map(),
  mediaWrite:async(k,v)=>{if(v)c.mediaCache.set(k,v);else c.mediaCache.delete(k)},localStorage:{getItem:()=>null,setItem:()=>{},removeItem:()=>{}},persist:()=>{},saveSocial:()=>{throw Error('quota')},localSave:()=>{}};
 const src=fs.readFileSync('dist/chat27.js','utf8');vm.createContext(c);vm.runInContext(src.slice(src.indexOf('async function purgeRole27'),src.indexOf('PalaisSocial.canSee=')),c);await A.rejects(c.purgeRole27('a'),/quota/);A.equal(c.roles.length,2);A.equal(c.memories.a.summary,'记忆');A.equal(c.worldbook.length,1);A.equal(c.mediaCache.get('role:a'),'avatar');A.equal(c.busy,false);A.equal(c.mutating27,false);
 // An API failure consumes one friend-request attempt and does not loop on the same removal.
 const f={roles:[{id:'a',name:'A',friend27:'removed',request27:{epoch:'e',status:'waiting',due:0}}],histories:{},busy:false,memoryBusy:false,socialBusy:false,auto21Busy:false,livingChatBusy:false,phoneLocked:false,document:{hidden:false},apiReady:()=>true,auto21:{messages:0},limit21:n=>n,claim21:()=>true,roleSave27:next=>f.roles=next,request:async()=>{f.calls++;throw Error('down')},calls:0,PalaisCore:{systemPrompt:()=>''},worldbook:[],memoryPrompt:()=>'',friendPrompt27:()=>'',config:{},key:'',AbortSignal,Date,isChatView:()=>false,toast:()=>{},friendly:e=>e.message};vm.createContext(f);vm.runInContext(src.slice(src.indexOf('async function friendTick27'),src.indexOf('setInterval(()=>friendTick27')),f);await f.friendTick27();A.equal(f.calls,0);f.auto21.messages=3;await f.friendTick27();await f.friendTick27();A.equal(f.calls,1);A.equal(f.roles[0].request27.status,'failed');A.equal(f.busy,false);
 console.log('v27 gallery/friends: coalesced import, existing-image preservation, quota rollback, role/portrait rollback and bounded zero-aware friend requests passed');
})().catch(e=>{console.error(e);process.exitCode=1});
