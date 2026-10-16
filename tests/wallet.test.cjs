const {readFileSync}=require('node:fs'),{runInNewContext}=require('node:vm'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const walletSource=readFileSync('dist/wallet.js','utf8');
const w=runInNewContext(walletSource+'\nPalaisWallet;',{localRead:()=>null,Date});
let account=w.initial();assert.equal(account.balance,1000000);
account=w.apply(account,{messageId:'out-1',conversationId:'rose',amount:'52.00',direction:'out',type:'redpacket'});assert.equal(account.balance,994800);assert.equal(account.ledger.length,1);
assert.equal(w.apply(account,{messageId:'out-1',amount:'52.00',direction:'out'}),account);
account=w.apply(account,{messageId:'in-1',conversationId:'rose',amount:'52.00',direction:'in',type:'redpacket'});assert.equal(account.balance,1000000);
assert.equal(w.apply(account,{messageId:'in-1',amount:'52.00',direction:'in'}),account);
assert.equal(w.cents('0.01'),1);assert.equal(w.cents('52.5'),5250);assert.throws(()=>w.cents('1.001'));assert.throws(()=>w.cents('-1'));assert.throws(()=>w.cents('0'));assert.throws(()=>w.cents('NaN'));
assert.throws(()=>w.apply(account,{messageId:'too-large',amount:'10000.01',direction:'out'}),/不足/);assert.equal(account.balance,1000000);
const core=runInNewContext(readFileSync('dist/core.js','utf8')+'\nPalaisCore;',{URL,Date,TextEncoder,crypto:webcrypto});
// Exercise the actual message transaction with storage/API failures, including the order of debit and persistence.
const app=readFileSync('dist/app.js','utf8'),send=app.slice(app.indexOf('async function sendMessage('),app.indexOf('\nfunction download('));
async function scenario(mode,amount='52.00'){
  const notice=[];let uuid=0;
  const harness=runInNewContext(walletSource+`\nlet histories={},busy=false,phoneLocked=false,controller=null,tab='wechat',current='rose',config={base:'https://chat.example/v1',model:'chat'},key='test',profile={name:'主人'},roles=[{id:'rose',name:'玫瑰小姐',prompt:'角色',emoji:'🌷'}],worldbook=[],voiceMode=false,voiceSettings={autoPlay:false};\n`+send+`\n({send:()=>sendMessage(roles[0],'测试',{type:'redpacket',amount:'${amount}',status:'sent',note:'测试'}),get:()=>({wallet,histories})});`,{
    localRead:()=>null,Date,PalaisCore:core,DOMException,AbortController,setTimeout,clearTimeout,crypto:{randomUUID:()=>String(++uuid)},
    requireAPI:()=>true,persist:()=>{if(mode==='storage-fail')throw Error('mock storage failure')},render:()=>{},renderConversation:()=>{},consolidate:async()=>{},memoryPrompt:()=>'',msgForAPI:m=>({role:m.role,content:m.content}),memoryTick:()=>{},isChatView:()=>false,sharedContext:()=>'',relationshipPrompt:()=>'',homeRelationshipPrompt:()=>'',buildChatMessages:async(system,hist)=>[{role:'system',content:system},...hist.map(m=>({role:m.role,content:m.content}))],parseChatReply:text=>core.cardReply(text),incomingMessage:()=>{},reportVisionFailure:()=>{},
    request:async()=>{if(mode==='api-fail')throw Error('mock API failure');return '回复'},friendly:e=>e.message,toast:s=>notice.push(s)
  });
  return {harness,notice};
}
(async()=>{
  const failed=await scenario('api-fail');assert.equal(await failed.harness.send(),false);const snap=failed.harness.get();assert.equal(snap.wallet.balance,994800);assert.equal(snap.wallet.ledger.length,1);assert.equal(snap.histories.rose.length,1);
  const insufficient=await scenario('ok','10000.01');assert.equal(await insufficient.harness.send(),false);assert.equal(insufficient.harness.get().wallet.balance,1000000);assert.equal(insufficient.harness.get().histories.rose.length,0);
  const okay=await scenario('ok');assert.equal(await okay.harness.send(),true);assert.equal(okay.harness.get().wallet.balance,994800);assert.equal(okay.harness.get().histories.rose.length,2);
  const storageFail=await scenario('storage-fail');assert.equal(await storageFail.harness.send(),false);assert.equal(storageFail.harness.get().wallet.balance,1000000);assert.equal(storageFail.harness.get().histories.rose.length,0);
  const voice=readFileSync('dist/voice.js','utf8');const helpers=voice.slice(voice.indexOf('function effectiveVoiceConfig'),voice.indexOf('function renderVoiceSettings'));
  const v=runInNewContext(`let voiceConfig={sameAsChat:false,base:'https://voice.example/v1'},voiceKey='voice-key',config={base:'https://chat.example/v1'},key='chat-key';\n`+helpers+'\n({get:effectiveVoiceConfig,shared:()=>{voiceConfig.sameAsChat=true;return effectiveVoiceConfig()}});');
  assert.equal(v.get().base,'https://voice.example/v1');assert.equal(v.get().key,'voice-key');assert.equal(v.shared().base,'https://chat.example/v1');assert.equal(v.shared().key,'chat-key');
  console.log('Wallet: initial balance, exact cents, debit/credit, duplicate prevention, insufficient funds, API failure retention; separate voice credentials passed.');
})().catch(e=>{console.error(e);process.exit(1)});
