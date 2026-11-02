const assert=require('node:assert/strict'),UI=require('../dist/chat-ui.js');
assert.equal(UI.stamp({content:'旧消息'}),null);assert.equal(UI.stamp({createdAt:'invalid'}),null);
const at=new Date(2026,9,27,11,52),s=UI.stamp({createdAt:at.getTime()});assert.equal(s.iso,at.toISOString());assert.match(s.date,/10.*27/);assert.equal(s.time,'11:52');assert.deepEqual(UI.stamp({createdAt:at.toISOString()}),s);
console.log('Chat UI: real timestamps, ISO timestamps, missing/invalid legacy dates passed');
