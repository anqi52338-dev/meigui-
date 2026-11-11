/* Bundled APK adapter: storage stays app-private; exports use Android's save dialog. */
(function(){
 if(location.hostname!=='appassets.androidplatform.net'||!window.NativeRose)return;
 if(typeof AbortSignal!=='undefined'&&!AbortSignal.timeout)AbortSignal.timeout=ms=>{const c=new AbortController;setTimeout(()=>c.abort(new DOMException('请求超时','TimeoutError')),ms);return c.signal};
 if(typeof AbortSignal!=='undefined'&&!AbortSignal.any)AbortSignal.any=signals=>{const c=new AbortController,handlers=[];const stop=s=>{c.abort(s.reason);for(const[x,f]of handlers)x.removeEventListener('abort',f)};for(const s of signals){if(s.aborted){stop(s);break}const f=()=>stop(s);handlers.push([s,f]);s.addEventListener('abort',f,{once:true})}return c.signal};
 const pending=new Map();
 window.saveNativeBlob30=(blob,name)=>new Promise((resolve,reject)=>{const token=NativeRose.beginSave(name,blob.type||'application/octet-stream');if(!token)return reject(Error('请先完成当前文件保存'));pending.set(token,{blob,resolve,reject})});
 window.nativeSaveReady30=async(token,ok)=>{
  const job=pending.get(token);if(!job)return;pending.delete(token);if(!ok){job.reject(Error('已取消保存，文件尚未导出'));return}
  try{
   for(let start=0;start<job.blob.size;start+=65536){const part=job.blob.slice(start,start+65536),data=await new Promise((resolve,reject)=>{const r=new FileReader;r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(Error('文件读取失败'));r.readAsDataURL(part)});if(!NativeRose.writeChunk(token,data))throw Error('文件写入未完成，请检查保存位置和空间')}
   if(!NativeRose.finishSave(token))throw Error('文件保存失败');job.resolve(true);
  }catch(e){NativeRose.cancelSave(token);job.reject(e)}
 };
 download=async function(name,data){return saveNativeBlob30(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),name)};
 const anchorClick=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.download&&/^blob:|^data:/.test(this.href)){fetch(this.href).then(r=>r.blob()).then(b=>saveNativeBlob30(b,this.download)).catch(e=>toast(e.message));return}return anchorClick.call(this)};
 registerShell29=async()=>null;
 install27=function(){if(typeof updatePanel31==='function')return updatePanel31();wxPanel('<h3>已安装安卓应用 v32</h3><p>更新请覆盖安装同签名版本，不要先卸载。</p>')};
 document.documentElement.classList.add('native30');
 const style=document.createElement('style');style.textContent=':root.native30 .intro,:root.native30 .phone>.status{display:none!important}:root.native30 body{margin:0;padding:0;background:#fff8fb}:root.native30 .page{display:block!important;padding:0!important;max-width:none!important;width:100%}:root.native30 .phone{border:0!important;border-radius:0!important;box-shadow:none!important;width:100%!important;max-width:none!important;height:100vh!important;height:100dvh!important;max-height:none!important;margin:0!important}';document.head.append(style);
 // The WebView bounds already exclude Android system bars and keyboard.
 // Do not apply CSS safe-area padding a second time.
 style.textContent+=':root.native30[data-theme] .phone,:root.native30 .phone{height:var(--native-height31,100dvh)!important;min-height:0!important;padding-top:0!important;padding-bottom:0!important}:root.native30 body{overflow:hidden}:root.native30 #screen{flex:1;min-height:0}:root.native30 .desktop-page[aria-label="第 1 页 日常"]{justify-content:space-between;gap:10px!important}:root.native30 .desktop-page[aria-label="第 1 页 日常"]>*{flex-shrink:0}:root.native30 .homebar{flex-shrink:0}';
 const resize31=()=>document.documentElement.style.setProperty('--native-height31',window.innerHeight+'px');resize31();window.addEventListener('resize',resize31);window.visualViewport?.addEventListener('resize',resize31);
 window.addEventListener('DOMContentLoaded',()=>{if(localRead('nativeWelcome30',false))return;const d=wxPanel('<h3>欢迎使用安卓版</h3><p>这是独立安装的安卓应用。原浏览器里的角色和聊天不会自动迁移，请先在浏览器导出“一键搬家”文件，再在这里导入。</p><button class="primary full" id="nativeImport30">打开一键搬家</button><button class="secondary full" id="nativeFresh30">先开始使用</button>');$('#nativeImport30').onclick=()=>{d.close();go('move22')};$('#nativeFresh30').onclick=()=>d.close();d.addEventListener('close',()=>{try{localSave('nativeWelcome30',true)}catch{}},{once:true})});
})();
