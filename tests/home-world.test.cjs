const assert=require('node:assert/strict'),W=require('../dist/home-world.js'),H=require('../dist/home-engine.js');
const t=new Date(2026,9,16,12).getTime();let old=H.create(t);old.points=300;old.owned=['rose','mint'];old.pet={kind:'cat',name:'奶糖',food:65,clean:65,joy:65,updated:t,xp:40,last:{}};old.partner='rose';
let s=H.normalize(old,t);assert.equal(s.points,300);assert.equal(s.pet.xp,40);assert.equal(s.pet.partner,'rose');assert.equal(s.avatar.look,0);assert.equal(s.location.room,'garden');
let next=H.apply(s,{type:'partner',id:'lune'},t).state;assert.equal(next.partner,'lune');assert.equal(next.pet.partner,'lune');assert.equal(s.partner,'rose');
assert.throws(()=>H.apply(H.create(t),{type:'adopt',kind:'cat'},t));const adopted=H.apply(H.create(t),{type:'adopt',kind:'bunny',partner:'rose'},t).state;assert.equal(adopted.partner,'rose');assert.equal(adopted.pet.partner,'rose');
const a={...s.avatar,look:2,tint:'cocoa',blush:'peach',detail:'freckles',shape:'tall',outfit:'gold'};
const previous=JSON.stringify(s);assert.throws(()=>H.apply(s,{type:'customize',avatar:a},t));assert.equal(JSON.stringify(s),previous);next=H.apply(s,{type:'customize',avatar:a,buy:true},t).state;assert.equal(next.points,140);assert.ok(next.owned.includes('gold'));assert.equal(H.apply(next,{type:'customize',avatar:a,buy:true},t).state.points,140);assert.equal(next.avatar.look,2);
assert.throws(()=>H.apply(next,{type:'customize',avatar:{...a,look:9}},t));assert.throws(()=>H.apply(next,{type:'wear',id:'constructor'},t));
for(const room of ['garden','inside']){const m=W.maps[room],path=W.path(room,m.spawn,m.door);assert.ok(path.length);assert.ok(path.every(p=>W.valid(room,p)));assert.ok(Math.hypot(path.at(-1).x-m.door.x,path.at(-1).y-m.door.y)<25);const obstacle=m.blocks[0];assert.equal(W.valid(room,{x:obstacle.x+30,y:obstacle.y+30}),false);assert.ok(W.path(room,m.spawn,{x:obstacle.x+30,y:obstacle.y+30}).every(p=>W.valid(room,p)));for(const target of [{x:-999,y:-999},{x:9999,y:9999}]){const p=W.path(room,m.spawn,target);assert.ok(p.length&&p.every(x=>W.valid(room,x)))}const camera=W.camera(room,m.spawn,376,730);assert.ok(camera.x>=0&&camera.y>=0);}
const startPos={x:535,y:410},blocked=W.move('garden',startPos,0,-90);assert.equal(blocked.y,startPos.y);assert.deepEqual(W.safeLocation({room:'inside',x:NaN,y:9999}),{room:'inside',...W.maps.inside.spawn});
console.log('Home world: v7 migration, co-ownership, dress purchase/rollback, navigation, boundaries and collisions passed');

const {readFileSync}=require('node:fs'),{runInNewContext}=require('node:vm');
const ui=readFileSync('dist/homeland.js','utf8'),start=ui.indexOf('function homeRelationshipPrompt('),end=ui.indexOf('function homeStore(');
const memory=runInNewContext(ui.slice(start,end)+';homeRelationshipPrompt;',{homeland:{partner:'rose',pet:{name:'奶糖'},log:[{text:'一起喂食'}]}});
assert.equal(memory('lune'),'');assert.match(memory('rose'),/奶糖/);assert.match(memory('rose'),/一起喂食/);
