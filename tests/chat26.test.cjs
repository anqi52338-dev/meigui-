const A=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const C=require('../dist/chat26-core.js');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('dist/living-core.js','utf8'),context);const L=context.window.PalaisLiving;
A.equal(C.output({choices:[{message:{content:[{type:'text',text:'你好'},{type:'text',text:'呀'}]}}]}),'你好呀');
A.equal(C.output({output:[{type:'message',content:[{type:'output_text',text:'兼容正文'}]}]}),'兼容正文');
A.throws(()=>C.output({choices:[{message:{content:null,reasoning_content:'hidden'},finish_reason:'length'}]}),/思考/);
A.throws(()=>C.output({choices:[{finish_reason:'content_filter',message:{}}]}),/过滤/);
A.throws(()=>C.output({error:{message:'model unavailable'}}),/model unavailable/);
A.throws(()=>C.output(null),/没有可显示/);
A.deepEqual(C.bubbles('[月光先生] （微笑）你好[[气泡]]还好吗','月光先生'),['你好','还好吗']);
A.deepEqual(C.bubbles('[月光先生]（微笑）你好','月光先生',true),['（微笑）你好']);
A.equal(C.bubbles(Array(15).fill('你好').join('[[气泡]]'),'x').length,10);
A.deepEqual(C.bubbles('（微笑）','x'),[]);
A.deepEqual(C.rotate(['a','b','c','new'],3),['new','a','b','c']);
function base(){return {balance:100000,ledger:[],accounts:{a:{balance:100000,ledger:[]}},roleTransfers:[]}}
function userTransfer(){const w=base();w.balance-=1234;w.roleTransfers.push({id:'u',sender:'a',status:'reserved-user',cents:1234});return w}
const user={id:'u',role:'user',card:{type:'transfer',recipient:'a',amount:'12.34',status:'sent'}};
let w=C.settle(userTransfer(),user,true,L,1).wallet;A.equal(w.balance,98766);A.equal(w.accounts.a.balance,101234);A.equal(C.settle(w,user,true,L,2).changed,false);
w=C.settle(userTransfer(),user,false,L,1).wallet;A.equal(w.balance,100000);A.equal(w.accounts.a.balance,100000);
const incoming={id:'i',role:'assistant',sender:'a',card:{type:'transfer',amount:'12.34',status:'pending'}};
w=L.send(base(),{id:'i',peerId:'a',type:'transfer',direction:'role'},1234);const reserved=w;
w=C.settle(w,incoming,true,L,1).wallet;A.equal(w.balance,101234);A.equal(w.accounts.a.balance,98766);A.equal(C.settle(w,incoming,false,L,2).changed,false);
w=C.settle(reserved,incoming,false,L,1).wallet;A.equal(w.balance,100000);A.equal(w.accounts.a.balance,100000);
// Legacy already-credited user transfers: returning reverses both accounts exactly once.
w=L.send(base(),{id:'u',peerId:'a',type:'transfer',direction:'user'},1234);w=C.settle(w,user,false,L,1).wallet;A.equal(w.balance,100000);A.equal(w.accounts.a.balance,100000);
const bad=userTransfer();bad.roleTransfers[0].cents++;A.throws(()=>C.settle(bad,user,true,L,1),/不一致/);A.equal(bad.accounts.a.balance,100000);
const source=fs.readFileSync('dist/chat26.js','utf8');
const c={Chat26:C,PalaisLiving:L,AbortSignal,AbortController,DOMException,Date,Map,crypto:require('node:crypto').webcrypto,setTimeout,clearTimeout,
 read:(k,f)=>f,endpoint:b=>b,fetch:null,render:()=>{},renderConversation:()=>{},renderApi:()=>{},renderMe:()=>{},renderWxMe:()=>{},renderMoments:()=>{},notificationDots:()=>{},wx19MoneyBubble:()=>{},receiveGift:()=>{},outgoingMoney:()=>{},
 apiReady:()=>true,phoneLocked:false,busy:false,controller:null,wxTypingId:null,key:'test',config:{base:'https://example.test',model:'m'},histories:{},wallet:base(),roles:[{id:'a',name:'A'},{id:'b',name:'B'}],profile:{name:'我'},worldbook:{},
 consolidate:async()=>{},PalaisCore:{systemPrompt:r=>r.name},groupSeen:r=>c.histories[r.id],groupMemory:()=>'',memoryPrompt:()=>'',sharedContext:()=>'',relationshipPrompt:()=>'',homeRelationshipPrompt:()=>'',musicPrompt:()=>'',moneyPrompt:()=>'',
 buildChatMessages:async(s,h)=>[{role:'system',content:s},...h],prepareLivingReply:content=>({content}),reserveRoleMoney:()=>c.wallet,incomingMessage:()=>{},persist:()=>{},toast:()=>{},friendly:e=>e.message,reportVisionFailure:()=>{},isChatView:()=>false,memoryTick:()=>{},saveSocial:()=>{},current:null,
 document:{querySelector:()=>null},localStorage:{setItem:()=>{}},customAvailable:()=>[]};vm.createContext(c);vm.runInContext(source,c);
(async()=>{
 let calls=0;c.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:[{text:'test'}]}}]})});A.equal(await vm.runInContext("request(config,[],100)",c),'test');
 c.fetch=async()=>++calls===1?{ok:false,status:400,json:async()=>({error:{message:'max_tokens unsupported use max_completion_tokens'}})}:{ok:true,json:async()=>({choices:[{message:{content:'ok'}}]})};A.equal(await vm.runInContext('request(config,[],64)',c),'ok');A.equal(calls,2);
 const g={id:'g',name:'group',members:['a','b']};c.fetch=async(_,opts)=>{const b=JSON.parse(opts.body);if(b.messages[0].content.startsWith('A'))return {ok:true,json:async()=>({choices:[{message:{content:null}}]})};return {ok:true,json:async()=>({choices:[{message:{content:'你好[[气泡]]今天好吗'}}]})}};
 await c.send26(g,'hi');A.equal(c.histories.g.filter(m=>m.role==='user').length,1);A.equal(c.histories.g.filter(m=>m.sender==='b').length,2);A.match(c.histories.g[0].errors26.a,/正文/);A.equal(c.busy,false);
 c.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:'重试成功'}}]})});await c.reply26(g,c.histories.g[0],null,true);A.equal(c.histories.g.filter(m=>m.role==='user').length,1);A.equal(c.histories.g.filter(m=>m.sender==='b').length,2);A.equal(c.histories.g.filter(m=>m.sender==='a').length,1);
 const old=c.histories.g.filter(m=>m.sender==='b');c.fetch=async()=>({ok:false,status:503,json:async()=>({error:{message:'down'}})});await c.reply26(g,c.histories.g[0],'b',true);A.ok(old.every(m=>c.histories.g.includes(m)));
 // Withdrawing while fetch is in flight aborts the signal and discards even a late provider result.
 c.persist=()=>{};c.mutating27=false;let resolveLate,seenSignal,fetchStarted;const started=new Promise(r=>fetchStarted=r);
 c.fetch=async(_,opts)=>{seenSignal=opts.signal;fetchStarted();return await new Promise(r=>resolveLate=r)};
 const withdrawal=fs.readFileSync('dist/chat27.js','utf8').split('withdraw26=function')[1].split('function editMessage27')[0];
 vm.runInContext('let mutating27=false;withdraw26=function'+withdrawal,c);
 const inFlight=c.send26(g,'发错了');await started;const wrong=c.histories.g.at(-1);A.equal(c.withdraw26(g,wrong),true);A.equal(seenSignal.aborted,true);
 resolveLate({ok:true,json:async()=>({choices:[{message:{content:'不应保存的迟到回复'}}]})});await inFlight;
 A.equal(c.histories.g.at(-1).kind,'recall');A.equal(c.histories.g.some(m=>m.content==='不应保存的迟到回复'),false);A.equal(c.busy,false);
 // Persist failure must restore the pending card and both balances, with no orphan receipt.
 c.histories.x=[JSON.parse(JSON.stringify(user))];c.wallet=userTransfer();c.persist=()=>{throw Error('quota')};A.throws(()=>c.settle26({id:'x'},c.histories.x[0],true),/quota/);A.equal(c.histories.x.length,1);A.equal(c.histories.x[0].card.status,'sent');A.equal(c.wallet.accounts.a.balance,100000);
 console.log('v26: response formats/errors, split replies, isolated group failures/retries, transfer conservation/idempotency and storage rollback passed');
})().catch(e=>{console.error(e);process.exitCode=1});
