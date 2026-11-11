/* Version policy is independent of chat backups and never clears user data. */
(function(root){
 const CURRENT=33, LAYOUTS={latest:'index.html',v31:'layout31.html',v30:'layout30.html'};
 const releases=[{version:33,date:'2026-11-11',notes:['聊天小工具新增修改头像和信息，背景入口仅修改背景']},{version:32,date:'2026-11-11',notes:['聊天操作移到长按菜单，去除重复按钮','三页API设置与三组聊天API切换','真实主动语音、系统字体与键盘避让']},{version:31,date:'2026-11-11',notes:['修正安卓顶部安全区与首页高度','信封图标；检查更新与旧版布局切换','修正识图测试输出上限与 DeepSeek 思考参数']},{version:30,date:'2026-11-10',notes:['安卓独立安装包；系统文件导出与一键搬家']}];
 const validVersion=n=>Number.isSafeInteger(n)&&n>0&&n<=1000000;
 function history(list,first){return list.filter(r=>r.version>=first).sort((a,b)=>b.version-a.version)}
 function mode(first,saved){return saved==='latest'?'latest':saved==='v30'&&first<=30?'v30':saved==='v31'&&first<=31?'v31':first<=30?'v30':first<=31?'v31':'latest'}
 function downloadURL(value,version){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash&&((u.hostname==='anqi52338-dev.github.io'&&u.pathname===`/meigui-/downloads/rose-phone-android-v${version}.apk`)||(u.hostname==='rose-palais-phone.anqi52338.chatgpt.site'&&u.pathname===`/downloads/rose-phone-android-v${version}.apk`))?u.href:null}catch{return null}}
 function manifest(data){
  if(!data||data.schema!==1||!validVersion(data.latest)||!Array.isArray(data.releases)||data.releases.length>1000)throw Error('更新信息格式无效');
  const seen=new Set(),rows=data.releases.map(r=>{if(!validVersion(r.version)||seen.has(r.version)||typeof r.date!=='string'||r.date.length>20||!Array.isArray(r.notes)||r.notes.length>30||r.notes.some(n=>typeof n!=='string'||n.length>500))throw Error('更新记录格式无效');seen.add(r.version);return {version:r.version,date:r.date,notes:r.notes.slice()}});
  const url=downloadURL(data.apk?.url,data.latest);if(!seen.has(data.latest)||!url||!/^\w{64}$/.test(data.apk?.sha256||'')||!/^[a-f0-9]+$/i.test(data.apk.sha256))throw Error('安装包信息无效');
  return {latest:data.latest,releases:rows,apk:{url,sha256:data.apk.sha256}};
 }
 const api={CURRENT,LAYOUTS,releases,validVersion,history,mode,downloadURL,manifest};root.Update31=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
