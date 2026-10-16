const assert=require('node:assert/strict'),H=require('../dist/home-engine.js');
const now=new Date(2026,9,16,12).getTime();let s=H.create(now);
function act(a,t=now){s=H.apply(s,a,t).state}
const original=JSON.stringify(s);assert.throws(()=>H.apply(s,{type:'wear',id:'gold'},now));assert.equal(JSON.stringify(s),original);
act({type:'claim',id:'visit'});assert.equal(s.points,50);assert.throws(()=>act({type:'claim',id:'visit'}));
act({type:'plant',index:0,crop:'radish'});assert.equal(s.points,48);assert.throws(()=>act({type:'plant',index:0,crop:'radish'}));assert.throws(()=>act({type:'harvest',index:0},now+60000));
act({type:'water',index:0});assert.throws(()=>act({type:'water',index:0}));assert.throws(()=>act({type:'harvest',index:0},now+59999));act({type:'harvest',index:0},now+60000);assert.equal(s.points,62);assert.equal(s.plots[0],null);assert.throws(()=>act({type:'harvest',index:0},now+60000));
act({type:'wear',id:'mint'});assert.equal(s.points,2);act({type:'wear',id:'mint'});assert.equal(s.points,2);assert.ok(s.owned.includes('mint'));
act({type:'adopt',kind:'cat',name:'奶糖',partner:'rose'});assert.throws(()=>act({type:'adopt',kind:'dog'}));act({type:'care',kind:'food'});assert.equal(s.pet.xp,10);assert.throws(()=>act({type:'care',kind:'food'},now+1000));act({type:'care',kind:'clean',actor:'玫瑰小姐'});assert.equal(s.pet.xp,20);assert.ok(H.needs(s.pet,now+3600000).food<95);
for(const id of ['a','b','c'])act({type:'steal',id});assert.equal(s.points,26);assert.throws(()=>act({type:'steal',id:'a'}));assert.throws(()=>act({type:'steal',id:'d'}));
act({type:'claim',id:'visit'},now+86400000);assert.equal(s.points,36);assert.deepEqual(s.daily.stolen,[]);assert.deepEqual(JSON.parse(JSON.stringify(s)),s);
console.log('Home: atomic transitions, growth, offline crops, cooldown, inventory and daily reward checks passed');
