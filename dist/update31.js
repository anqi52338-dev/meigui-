/* The update and compatibility controls are shared by current and frozen UI. */
function updatePanel31(){
 const info=window.roseBuild31||{firstVersion:Update31.CURRENT,currentVersion:Update31.CURRENT,mode:'latest'},esc=escapeHtml;
 const d=wxPanel(`<h3>检查更新</h3><p>应用版本 v${info.currentVersion} · 当前布局 ${info.mode==='latest'?'v32 新版':info.mode+' 旧版'}</p><p class="api-note">首次使用 v${info.firstVersion}；只展示该版本及之后的更新。检查更新不会切换布局或清理数据。安卓更新请覆盖安装，不要先卸载。</p><button class="primary full" id="checkUpdate31">检查更新</button><p id="updateState31" role="status">以下是安装包内的更新记录，尚未联网检查。</p><div id="updateDownload31"></div><label>布局和操作方式<select id="layoutMode31"><option value="latest">使用 v32 新版布局与操作</option>${info.firstVersion<=31?'<option value="v31">保留 v31 布局与操作</option>':''}${info.firstVersion<=30?'<option value="v30">保留 v30 旧版布局与操作</option>':''}</select></label><button class="secondary full" id="applyLayout31">应用所选模式</button><p class="api-note">各布局模式共用角色和存档；旧模式也包含安全区、备份与识图修复。切换会重新打开界面，请先完成当前操作。</p><div id="updateHistory31"></div>`);
 const draw=list=>{d.querySelector('#updateHistory31').innerHTML=Update31.history(list,info.firstVersion).map(r=>`<section><h4>v${r.version} · ${esc(r.date)}</h4><ul>${r.notes.map(n=>'<li>'+esc(n)+'</li>').join('')}</ul></section>`).join('')||'<p>当前没有可显示的更新记录。</p>'};draw(Update31.releases);
 d.querySelector('#layoutMode31').value=info.mode;
 d.querySelector('#applyLayout31').onclick=()=>{if(installationBusy29()||visionChecking||wxCall||wxRecording||(typeof voiceRunning32!=='undefined'&&voiceRunning32)){toast('请先完成当前聊天、通话、文件或识图操作');return}try{const mode=d.querySelector('#layoutMode31').value;if(!Object.prototype.hasOwnProperty.call(Update31.LAYOUTS,mode))return;localStorage.setItem('palais.uiMode31',mode);location.replace(new URL(Update31.LAYOUTS[mode]+location.search,location.href).href)}catch{toast('无法保存模式，请检查存储空间')}};
 d.querySelector('#checkUpdate31').onclick=async()=>{
  const button=d.querySelector('#checkUpdate31'),status=d.querySelector('#updateState31');button.disabled=true;status.textContent='正在检查更新…';let result=null;
  try{
   for(const base of ['https://anqi52338-dev.github.io/meigui-/','https://rose-palais-phone.anqi52338.chatgpt.site/']){
    const ctl=new AbortController,timer=setTimeout(()=>ctl.abort(),8000);
    try{const res=await fetch(base+'app-updates.json?t='+Date.now(),{cache:'no-store',signal:ctl.signal,credentials:'omit'});if(!res.ok)throw Error('HTTP '+res.status);result=Update31.manifest(await res.json());break}catch{}finally{clearTimeout(timer)}
   }
   if(!result)throw Error('暂时无法取得更新信息，请检查网络后重试。当前仅显示本机记录。');
   draw(result.releases);status.textContent=result.latest>info.currentVersion?`发现新版 v${result.latest}，下载安装后仍可在这里选择保留旧布局。`:`已检查：当前是最新版本 v${info.currentVersion}。`;
   if(result.latest>info.currentVersion){const box=d.querySelector('#updateDownload31');box.replaceChildren();const a=document.createElement('a');a.className='primary full';a.textContent='下载新版安卓安装包';a.href=result.apk.url;a.target='_blank';a.rel='noopener';box.append(a);const p=document.createElement('p');p.className='api-note';p.textContent='SHA-256：'+result.apk.sha256;box.append(p)}
   if(!info.native){const reg=await navigator.serviceWorker?.getRegistration?.();await reg?.update();status.textContent+=' 网页资源更新后重新打开即可。'}
  }catch(e){status.textContent=e.message}finally{button.disabled=false}
 };
}
function updateButton31(){if(screen.querySelector('[data-update31]'))return;const container=screen.querySelector('.view,.wx-body')||screen;const b=document.createElement('button');b.className='menu-button';b.dataset.update31='1';b.textContent='检查更新 · 布局与版本 ›';b.onclick=updatePanel31;container.append(b)}
const me31=renderMe;renderMe=function(){me31();updateButton31()};
const wxMe31=renderWxMe;renderWxMe=function(){wxMe31();updateButton31()};
const settings31=wxSettings;wxSettings=function(){settings31();updateButton31()};
const installBase31=install27;install27=function(){const result=installBase31();document.querySelectorAll('a[href*="downloads/rose-phone-android-v30.apk"],a[href*="downloads/rose-phone-android-v31.apk"]').forEach(a=>{a.href=new URL('downloads/rose-phone-android-v34.apk',location.href).href;a.download='rose-phone-android-v34.apk'});return result};
