const A=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('dist/update21.js','utf8'),core=src.slice(src.indexOf('function limit21'),src.indexOf('const api21'));
let saved=null;const c={Date,PalaisCore:{dateKey:()=> '2026-11-03'},localSave:(k,v)=>{saved=v}};vm.createContext(c);vm.runInContext(core+"\nlet auto21={attempts:{},last:0};"+src.slice(src.indexOf('function claim21'),src.indexOf('const proactive21')),c);
A.equal(vm.runInContext('limit21(99,20)',c),20);A.equal(vm.runInContext('limit21(-1,5)',c),0);
A.equal(vm.runInContext("claim21('feed','a',0)",c),false);for(let i=0;i<5;i++)A.equal(vm.runInContext("claim21('feed','a',5)",c),true);A.equal(vm.runInContext("claim21('feed','a',5)",c),false);A.equal(vm.runInContext("claim21('feed','b',5)",c),true);
c.localSave=()=>{throw Error('quota')};A.throws(()=>vm.runInContext("claim21('message','all',20)",c));A.equal(vm.runInContext("auto21.attempts['2026-11-03:message:all']",c),undefined);
console.log('Update21: capped quotas, zero disabled, per-role isolation and storage failure retain state passed');
