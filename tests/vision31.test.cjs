const A=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),O=require('../dist/output28-core.js'),Chat26=require('../dist/chat26-core.js');
let cap=2080,calls=[],responses=[];
const c={AbortController,AbortSignal,Chat26,PalaisSticker:{},visionPanelHTML:()=>'',outputBudget28:n=>O.budget(cap,n),active26:null,endpoint:b=>b,
 fetch:async(_,opts)=>{calls.push(JSON.parse(opts.body));return responses.shift()||{ok:true,json:async()=>({choices:[{message:{content:'["红","绿","蓝","黄","紫","橙"]'}}]})}},
 visionChecking:false,apiReady:()=>true,config:{model:'deepseek-flash',base:'https://api.deepseek.com'},key:'fake-not-a-secret',visionCapability:null,
 visionSignature:()=>c.config.model,visionChallenge:()=>({image:'data:image/png;base64,TEST',expected:['红','绿','蓝','黄','紫','橙']}),localSave:()=>{},toast:()=>{},friendly:e=>e.message,$:()=>null,tab:'home'};
vm.createContext(c);vm.runInContext(fs.readFileSync('dist/vision31.js','utf8'),c);
(async()=>{
 A.equal(await c.checkVision(),true);A.equal(calls.length,2);for(const b of calls){A.equal(b.max_tokens,2080);A.equal(b.thinking.type,'disabled');A.equal(b.messages[0].content[1].type,'image_url')}
 cap=100000;await c.checkVision();A.equal(calls.at(-1).max_tokens,100000);
 A.equal(c.PalaisSticker.probeAnswer('["红色","green","蓝"]',['红','绿','蓝']),true);A.equal(c.PalaisSticker.probeAnswer('["绿","红"]',['红','绿']),false);
 cap=2080;calls=[];responses=[{ok:false,status:400,json:async()=>({error:{message:'thinking unsupported'}})}];await c.request(c.config,[],2080,undefined,{disableThinking:true});A.equal(calls.length,2);A.equal(calls[1].thinking,undefined);
 calls=[];responses=[{ok:false,status:400,json:async()=>({error:{message:'max_tokens unsupported; use max_completion_tokens'}})}];await c.request(c.config,[],2080);A.equal(calls[1].max_completion_tokens,2080);
 calls=[];await c.request({model:'other-model',base:'example'},[],64);A.equal(calls[0].thinking,undefined);A.equal(calls[0].max_tokens,64);
 responses=[{ok:true,json:async()=>({choices:[{message:{reasoning_content:'private reasoning'},finish_reason:'length'}]})}];await A.rejects(c.request(c.config,[],2080),e=>/不是账户余额不足/.test(e.message)&&!e.message.includes('private reasoning'));
 c.visionCapability=null;responses=[{ok:true,json:async()=>({choices:[{message:{content:'["绿","红"]'}}]})}];A.equal(await c.checkVision(),false);A.equal(c.visionCapability.passed,false);
 c.visionCapability={signature:c.config.model,passed:true};responses=[{ok:false,status:429,json:async()=>({error:{message:'rate limit'}})}];A.equal(await c.checkVision(),false);A.equal(c.visionCapability.passed,true);
 console.log('v31 vision: 2080/configured budgets, actual image payload, DeepSeek thinking opt-out, bounded compatibility fallback, color-order proof and transient errors passed');
})().catch(e=>{console.error(e);process.exitCode=1});
