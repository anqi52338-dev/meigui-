const A=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const source=fs.readFileSync('android/native30.js','utf8'),part=source.slice(source.indexOf(' const pending='),source.indexOf(' const anchorClick='));
let id=0,active='',chunks=[],fail=false,finished=0,cancelled=0;
const c={Map,Blob,FileReader:class{readAsDataURL(blob){blob.arrayBuffer().then(b=>{this.result='data:application/octet-stream;base64,'+Buffer.from(b).toString('base64');this.onload()}).catch(()=>this.onerror())}},NativeRose:{beginSave:()=>active?'':active=String(++id),writeChunk:(t,s)=>{A.equal(t,active);if(fail)return false;chunks.push(Buffer.from(s,'base64'));return true},finishSave:t=>{A.equal(t,active);active='';finished++;return true},cancelSave:t=>{A.equal(t,active);active='';cancelled++}}};c.window=c;vm.createContext(c);vm.runInContext(part,c);
(async()=>{
 const text='你好，搬家备份😊'.repeat(12000),data=new Blob([text]);let settled=false;const saving=c.saveNativeBlob30(data,'backup.json').then(()=>settled=true);A.equal(settled,false);await c.nativeSaveReady30(active,true);await saving;A.equal(Buffer.concat(chunks).toString('utf8'),text);A.ok(chunks.length>1);A.equal(finished,1);
 chunks=[];fail=true;const broken=c.saveNativeBlob30(data,'backup.json');const rejected=A.rejects(broken,/写入/);await c.nativeSaveReady30(active,true);await rejected;A.equal(cancelled,1);A.equal(finished,1);
 fail=false;const cancel=c.saveNativeBlob30(data,'backup.json');const denied=A.rejects(cancel,/取消/);const token=active;active='';await c.nativeSaveReady30(token,false);await denied;A.equal(finished,1);
 const apk=fs.readFileSync('dist/downloads/rose-phone-android-v30.apk'),digest=fs.readFileSync('dist/downloads/rose-phone-android-v30.apk.sha256','utf8').split(/\s/)[0];A.equal(crypto.createHash('sha256').update(apk).digest('hex'),digest);A.equal(apk.subarray(0,2).toString(),'PK');
 console.log('Native30: chunked UTF-8 exports, save/cancel/failure completion, public APK checksum and archive signature header passed');
})().catch(e=>{console.error(e);process.exitCode=1});
