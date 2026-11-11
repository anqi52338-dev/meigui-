const A=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),U=require('../dist/update31-core.js');
const releases=[1,2,3,4,5,6].map(version=>({version,notes:[],date:'2026-11-11'}));
A.deepEqual(U.history(releases,5).map(r=>r.version),[6,5]);A.deepEqual(U.history(releases,3).map(r=>r.version),[6,5,4,3]);
A.equal(U.mode(30,null),'v30');A.equal(U.mode(31,'v30'),'v31');A.equal(U.mode(31,'v31'),'v31');A.equal(U.mode(32,'v31'),'latest');A.equal(U.mode(30,'latest'),'latest');
const good={schema:1,latest:31,releases:U.releases,apk:{url:'https://anqi52338-dev.github.io/meigui-/downloads/rose-phone-android-v31.apk',sha256:'a'.repeat(64)}};
A.equal(U.manifest(good).latest,31);
for(const url of ['javascript:alert(1)','https://evil.test/downloads/rose-phone-android-v31.apk','https://anqi52338-dev.github.io/meigui-/downloads/rose-phone-android-v31.apk?redirect=evil','https://user@anqi52338-dev.github.io/meigui-/downloads/rose-phone-android-v31.apk'])A.throws(()=>U.manifest({...good,apk:{...good.apk,url}}));
A.throws(()=>U.manifest({...good,releases:[U.releases[0],U.releases[0]]}));
function boot(entries={},native=null,path='index.html'){
 const store={...entries};Object.defineProperties(store,{getItem:{value:k=>store[k]??null},setItem:{value:(k,v)=>store[k]=v}});
 let redirected='';const location=new URL('https://example.test/meigui-/'+path+'?app=1');location.replace=s=>redirected=s;
 const c={Update31:U,localStorage:store,location,URL,Object,NativeRose:native?{getAppInfo31:()=>JSON.stringify(native)}:undefined};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync('dist/boot31.js','utf8'),c);return {c,store,redirected};
}
A.equal(boot().c.roseBuild31.firstVersion,U.CURRENT);A.equal(boot({'palais.roles':'saved'}).redirected,'https://example.test/meigui-/layout30.html?app=1');
const updated=boot({'palais.firstVersion31':'3'},{firstVersion:30,currentVersion:31});A.equal(updated.c.roseBuild31.firstVersion,30);A.equal(updated.store['palais.roles'],undefined);
const latest=boot({'palais.uiMode31':'latest','palais.roles':'unchanged'},{firstVersion:30,currentVersion:31},'layout30.html');A.match(latest.redirected,/index.html\?app=1$/);A.equal(latest.store['palais.roles'],'unchanged');
for(const page of ['index.html','layout30.html','layout31.html']){const s=fs.readFileSync('dist/'+page,'utf8');for(const m of s.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g))A.ok(fs.existsSync('dist/'+m[1]),page+' missing '+m[1]);A.ok(s.indexOf('boot31.js')<s.indexOf('core.js"></script>'))}
const java=fs.readFileSync('android/MainActivity.java','utf8');A.ok(java.includes('frame.setOnApplyWindowInsetsListener'));A.ok(!java.includes('web.setOnApplyWindowInsetsListener'));A.ok(java.includes('Math.max(bars.bottom,ime.bottom)'));A.ok(java.includes('p.contains("firstVersion")'));
console.log('v31: version-history boundaries, manifest/download validation, real layout routing, native baseline precedence, unchanged storage and asset integrity passed');
