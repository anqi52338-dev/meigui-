const assert=require('node:assert/strict'),C=require('../dist/wx18-core.js');
const r=[{id:'a',name:'Alice'},{id:'b',name:'Bob'}],prefs={a:{remark:'朋友'},b:{pinned:true}};
assert.equal(C.label(r[0],prefs),'朋友');assert.deepEqual(C.sort(r,prefs,{a:[{createdAt:9}],b:[{createdAt:1}]}).map(x=>x.id),['b','a']);assert.equal(r[0].id,'a');
assert.equal(C.unread('a',[{type:'chat',conversationId:'a',read:false},{type:'reply',read:false},{type:'chat',conversationId:'b',read:false}]).length,1);
const m={id:'x',role:'user',content:'hello',createdAt:100,audience:['a']};const recalled=C.recall(m,200);assert.equal(recalled.content,'你撤回了一条消息');assert.equal(recalled.reedit,'hello');assert.equal(m.content,'hello');assert.throws(()=>C.recall({...m,card:{}},200));assert.throws(()=>C.recall(m,120101));assert.equal(C.canRecall({...m,role:'assistant'},200),false);
assert.equal(C.entry({date:'2026-11-03',title:' 日记 ',text:'正文'},'d',1).title,'日记');assert.throws(()=>C.entry({date:'2026-02-30',title:'bad'},'d',1));assert.throws(()=>C.entry({date:'2026-11-03',title:'',text:''},'d',1));assert.throws(()=>C.entry({date:'2026-11-03',title:'a',text:'x'.repeat(20001)},'d',1));assert.equal(C.holiday('2026-10-01'),'国庆节');assert.equal(C.seconds(61000),'01:01');
console.log('WX18: independent prefs, pinned sort, unread scoping, recall money/time guards and diary validation passed');
