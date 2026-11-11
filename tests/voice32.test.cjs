const A=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),C=require('../dist/chat32-core.js');
let daily=2,usage={},fetches=0,fail=false,hold=null,writes=[],saves=0;
const role={id:'r'},room={id:'r'},history=[];
const c={Chat32:C,localRead:(k,f)=>k==='voicePolicy32'?{daily}:k==='voiceUsage32'?usage:f,localSave:(k,v)=>{if(k==='voiceUsage32')usage=v},PalaisCore:{dateKey:()=> '2026-11-11',apiURL:()=> 'https://voice.test/audio/speech'},voiceReady:()=>true,voiceSettings:{tts:'speech-model',voice:'v'},buildChatMessages:async s=>s,prepareLivingReply:text=>({content:text}),histories:{r:history},roles:[role],phoneLocked:false,AbortController,AbortSignal,Blob,AudioContext:class{async decodeAudioData(){return {duration:6.35}}async close(){}},effectiveVoiceConfig:()=>({base:'https://voice.test',key:'not-real'}),persist:()=>saves++,data22:async()=> 'data:audio/mpeg;base64,REAL',mediaWrite:async(k,v)=>writes.push([k,v]),isChatView:()=>false,incomingMessage:()=>{},wx19VoiceBubble:()=>{},playSpeech:async()=>{},toast:()=>{},fetch:async()=>{fetches++;if(hold)await hold;return {ok:!fail,status:503,blob:async()=>new Blob(['actual-audio'],{type:'audio/mpeg'})}}};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('dist/voice32.js','utf8'),c);
const message=id=>({id,role:'assistant',content:'你好，今天还好吗',voiceRequested32:true});
const drain=async()=>{for(let i=0;i<100;i++){if(!vm.runInContext('voiceRunning32',c))return;await new Promise(setImmediate)}throw Error('voice job did not finish')};
(async()=>{
 let m=message('one');history.push(m);c.incomingMessage(room,role,m);await drain();A.equal(m.media.duration,6.35);A.equal(m.transcript,m.content);A.equal(usage.count,1);A.equal(fetches,1);A.equal(writes.length,1);A.ok(saves>=2);
 c.incomingMessage(room,role,m);await drain();A.equal(fetches,1);
 fail=true;m=message('two');history.push(m);c.incomingMessage(room,role,m);await drain();A.equal(usage.count,2);A.equal(m.media,undefined);A.equal(m.content,'你好，今天还好吗');fail=false;
 m=message('three');history.push(m);c.incomingMessage(room,role,m);await drain();A.equal(fetches,2);A.equal(m.media,undefined);
 usage={day:'2026-11-11',count:0};let release;hold=new Promise(r=>release=r);m=message('late');history.push(m);c.incomingMessage(room,role,m);await new Promise(setImmediate);history.splice(history.indexOf(m),1);release();await drain();hold=null;A.equal(m.media,undefined);A.equal(writes.length,1);
 vm.runInContext('voicePolicy32={daily:0}',c);m=message('off');history.push(m);const n=fetches;c.incomingMessage(room,role,m);await drain();A.equal(fetches,n);
 A.equal(c.prepareLivingReply('[[语音]]你好').content,'你好');A.equal(c.prepareLivingReply('[[语音]]你好').voiceRequested32,true);
 console.log('v32 voice: real duration, stored audio/transcript, no duplicate delivery, attempt quota, text fallback, deleted-message cancellation and zero-off passed');
})().catch(e=>{console.error(e);process.exitCode=1});
