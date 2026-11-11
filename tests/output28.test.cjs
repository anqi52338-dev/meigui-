const A=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),O=require('../dist/output28-core.js');
A.equal(O.stored(null),2080);A.equal(O.stored('broken'),2080);A.equal(O.validate('9999'),9999);
for(const n of ['',0,-1,10000,1.5,'abc',Infinity])A.throws(()=>O.validate(n));
A.equal(O.budget(null,400),2080);A.equal(O.budget(9999,4096),9999);A.equal(O.budget(2080,64),64);A.equal(O.budget(2080,100),100);
let saved=null,fail=false;
const c={Output28:O,renderApi:()=>{},localRead:()=>saved,localSave:(k,v)=>{if(fail)throw Error('quota');saved=v},read:(k,f)=>f,Map,AbortSignal,AbortController,endpoint:b=>b};
vm.createContext(c);vm.runInContext(fs.readFileSync('dist/output28.js','utf8'),c);
const requestSource=fs.readFileSync('dist/chat26.js','utf8').split('function stylePrompt26')[0];vm.runInContext(requestSource,c);c.Chat26={output:d=>d.choices[0].message.content};
(async()=>{
 const budgets=[];c.fetch=async(_,opts)=>{budgets.push(JSON.parse(opts.body));return {ok:true,json:async()=>({choices:[{message:{content:'ok'}}]})}};
 await c.request({base:'example',model:'m',key:'test'},[],400);await c.request({base:'example',model:'m',key:'test'},[],4096);A.deepEqual(budgets.map(b=>b.max_tokens),[2080,2080]);
 c.saveOutput28(9999);await c.request({},[],400);A.equal(budgets.at(-1).max_tokens,9999);
 fail=true;A.throws(()=>c.saveOutput28(2048),/quota/);A.equal(c.outputBudget28(400),9999);fail=false;
 c.saveOutput28(2080);let calls=0;c.fetch=async(_,opts)=>{const body=JSON.parse(opts.body);if(++calls===1)return {ok:false,status:400,json:async()=>({error:{message:'max_tokens unsupported; use max_completion_tokens'}})};A.equal(body.max_completion_tokens,2080);A.equal(body.max_tokens,undefined);return {ok:true,json:async()=>({choices:[{message:{content:'ok'}}]})}};await c.request({},[],400);A.equal(calls,2);
 console.log('v28: default 2080, shared chat/Moments request budgets, 9999 cap, probe budgets, invalid input, save failure and compatible token parameter passed');
})().catch(e=>{console.error(e);process.exitCode=1});
