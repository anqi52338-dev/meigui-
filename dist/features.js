let worldbook = (() => { try { return JSON.parse(localStorage.getItem('palais.worldbook')) || [] } catch { return [] } })();
let profile = (() => { try { return JSON.parse(localStorage.getItem('palais.profile')) || {name:'小宫殿的主人'} } catch { return {name:'小宫殿的主人'} } })();
const mediaCache = new Map();
let roleAvatarDraft = null, bookEditing = null;
const mediaDB = new Promise((resolve, reject) => {
  const request = indexedDB.open('palais-media', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('images');
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(Error('浏览器无法保存图片，请检查存储权限'));
});
async function mediaWrite(id, image) {
  const db = await mediaDB;
  await new Promise((resolve, reject) => {
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images');
    if (image) store.put(image, id); else store.delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(Error('图片保存失败，浏览器空间可能不足'));
    tx.onabort = () => reject(Error('图片保存失败，请重试'));
  });
  if (image) mediaCache.set(id, image); else mediaCache.delete(id);
}
function avatarHTML(id, fallback, extra = '') {
  const src = mediaCache.get(id);
  return `<span class="avatar ${extra}">${src ? `<img src="${src}" alt="头像">` : escapeHtml(fallback)}</span>`;
}
async function prepareImage(file, size = 512) {
  if (!file || !['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)) throw Error('请选择 JPG、PNG、WebP 或 GIF 图片');
  if (file.size > 15 * 1024 * 1024) throw Error('请选择小于 15 MB 的图片');
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.src = url; await img.decode();
    const ratio = Math.min(1, size / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(img.naturalWidth * ratio)); canvas.height = Math.max(1, Math.round(img.naturalHeight * ratio));
    const ctx = canvas.getContext('2d'); ctx.fillStyle='#fffaf5'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/jpeg', .85);
  } finally { URL.revokeObjectURL(url) }
}
function fileInput(id) {return `<input class="file-input" id="${id}" type="file" accept="image/jpeg,image/png,image/webp,image/gif">`}
function openAppearance(r) {
  const dialog = document.querySelector('#appearance');
  dialog.innerHTML = `<div class="eyebrow">YOUR CHAT, YOUR STYLE</div><h2>聊天装扮</h2><p class="api-note">为${escapeHtml(r.name)}的聊天单独设置背景。</p><div id="backgroundPreview" class="background-preview">${mediaCache.has('background:'+r.id)?'<span>当前聊天背景</span>':'还没有设置背景'}</div>${fileInput('backgroundFile')}<div class="actions"><button class="secondary" id="removeBackground">恢复默认</button><button class="primary" id="chooseBackground">上传背景</button></div><button class="menu-button" id="appearanceRole">编辑角色与头像 <span>›</span></button><button class="menu-button" id="appearanceBook">编辑世界书 <span>›</span></button><button class="secondary close-dialog" id="closeAppearance">完成</button>`;
  const image = mediaCache.get('background:'+r.id); if(image) document.querySelector('#backgroundPreview').style.backgroundImage=`url("${image}")`;
  document.querySelector('#chooseBackground').onclick=()=>document.querySelector('#backgroundFile').click();
  document.querySelector('#backgroundFile').onchange=async e=>{const button=document.querySelector('#chooseBackground');button.disabled=true;try{const image=await prepareImage(e.target.files[0],1440);await mediaWrite('background:'+r.id,image);document.querySelector('#backgroundPreview').style.backgroundImage=`url("${image}")`;document.querySelector('#backgroundPreview').textContent='';renderConversation();toast('聊天背景已保存')}catch(err){toast(err.message)}finally{button.disabled=false;e.target.value=''}};
  document.querySelector('#removeBackground').onclick=async()=>{try{await mediaWrite('background:'+r.id,null);document.querySelector('#backgroundPreview').style.backgroundImage='';document.querySelector('#backgroundPreview').textContent='默认浅粉背景';renderConversation();toast('已恢复默认背景')}catch(err){toast(err.message)}};
  document.querySelector('#appearanceRole').onclick=()=>{dialog.close();r.members?editGroup(r.id):editRole(r.id)};
  document.querySelector('#appearanceBook').onclick=()=>{dialog.close();go('book')};
  document.querySelector('#closeAppearance').onclick=()=>dialog.close();dialog.showModal();
}
function renderBook() {
  screen.innerHTML = `<section class="view">${title('世界书','THE STORIES BEHIND YOUR WORLD','<button class="round" id="newEntry" aria-label="新建世界书条目">+</button>')}<div class="notice">收藏世界观、人物关系和背景规则。启用的条目会按生效范围，在聊天时自动交给模型。</div><div class="book-summary">${worldbook.filter(e=>e.enabled).length} 个启用条目 · ${worldbook.length} 个条目</div><div id="entries"></div><p class="section-note">常驻：每次聊天都带入。<br>关键词触发：最近 6 条消息包含任一关键词时带入。<br>世界书保存在此浏览器，内容会发送给你配置的 API。</p><button class="secondary full" id="backBook">返回桌面</button></section>`;
  const list=document.querySelector('#entries');
  if(!worldbook.length) list.innerHTML='<div class="book-empty"><span>♧</span><p>你的世界，等你来书写。</p><small>点右上角 ＋，添加第一条背景设定。</small></div>';
  worldbook.forEach(e=>{const card=document.createElement('article');card.className='book-card';const role=roles.find(r=>r.id===e.roleId);card.innerHTML=`<div class="book-card-top"><strong>${escapeHtml(e.name)}</strong><label class="switch-label"><input type="checkbox" ${e.enabled?'checked':''} aria-label="启用 ${escapeHtml(e.name)}">启用</label></div><div class="book-tags"><span>${e.mode==='always'?'常驻':'关键词触发'}</span><span>${escapeHtml(e.roleId?(role?.name||'角色已不存在'):'全部角色')}</span></div><p>${escapeHtml(e.content)}</p><button class="text-button">编辑条目 ↗</button>`;card.querySelector('input').onchange=ev=>{const old=e.enabled;e.enabled=ev.target.checked;try{saveBook();renderBook()}catch(err){e.enabled=old;ev.target.checked=old;toast('保存失败，浏览器空间可能不足')}};card.querySelector('button').onclick=()=>editEntry(e.id);list.append(card)});
  document.querySelector('#newEntry').onclick=()=>editEntry();document.querySelector('#backBook').onclick=()=>go('home');
}
function saveBook(){localStorage.setItem('palais.worldbook',JSON.stringify(worldbook))}
function editEntry(id=null){
  bookEditing=id;const e=worldbook.find(e=>e.id===id),d=document.querySelector('#bookEditor');
  d.innerHTML=`<form id="bookForm"><div class="eyebrow">WORLDBOOK ENTRY</div><h2>${e?'编辑':'新建'}世界书条目</h2><label>条目名称<input name="entryName" required maxlength="60" placeholder="例如：玫瑰王国的规则" value="${escapeHtml(e?.name||'')}"></label><label>生效范围<select name="roleId"><option value="">全部角色</option>${roles.map(r=>`<option value="${escapeHtml(r.id)}" ${e?.roleId===r.id?'selected':''}>${escapeHtml(r.name)}</option>`).join('')}</select></label><label>触发方式<select name="mode"><option value="always" ${e?.mode==='always'?'selected':''}>常驻 · 每次聊天带入</option><option value="keywords" ${e?.mode==='keywords'?'selected':''}>关键词触发</option></select></label><label id="keywordsLabel">关键词 · 逗号或换行分隔<textarea name="keys" rows="2" maxlength="500" placeholder="玫瑰王国，王都，宫殿">${escapeHtml(e?.keys||'')}</textarea></label><label>背景内容<textarea name="content" required rows="5" maxlength="8000" placeholder="写下需要角色记住的世界观、人物关系或规则…">${escapeHtml(e?.content||'')}</textarea></label><label class="check"><input type="checkbox" name="enabled" ${e?.enabled!==false?'checked':''}>启用此条目</label><div class="actions"><button type="button" class="secondary" id="cancelEntry">取消</button><button class="primary">保存条目</button></div>${e?'<button type="button" class="text-button danger" id="deleteEntry">删除这个条目</button>':''}</form>`;
  const f=document.querySelector('#bookForm');const updateMode=()=>{document.querySelector('#keywordsLabel').hidden=f.mode.value!=='keywords';f.keys.required=f.mode.value==='keywords'};f.mode.onchange=updateMode;updateMode();
  document.querySelector('#cancelEntry').onclick=()=>d.close();
  f.onsubmit=ev=>{ev.preventDefault();const entry={id:bookEditing||crypto.randomUUID(),name:f.entryName.value.trim(),roleId:f.roleId.value,mode:f.mode.value,keys:f.keys.value.trim(),content:f.content.value.trim(),enabled:f.enabled.checked};if(!entry.name||!entry.content||entry.mode==='keywords'&&!entry.keys.split(/[,，;；\n]/).some(k=>k.trim())){toast('请填写条目名称、内容和有效关键词');return}const previous=worldbook;worldbook=bookEditing?worldbook.map(x=>x.id===bookEditing?entry:x):[...worldbook,entry];try{saveBook();d.close();renderBook();toast('世界书条目已保存')}catch(err){worldbook=previous;toast('保存失败，浏览器空间可能不足')}};
  if(e)document.querySelector('#deleteEntry').onclick=()=>{const previous=worldbook;worldbook=worldbook.filter(x=>x.id!==id);try{saveBook();d.close();renderBook();toast('条目已删除')}catch(err){worldbook=previous;toast('删除失败，请重试')}};
  d.showModal();
}
function renderProfile(){
  const d=document.querySelector('#profileEditor');d.innerHTML=`<div class="eyebrow">A LITTLE PORTRAIT OF YOU</div><h2>我的人物设置</h2><div id="profilePreview" class="upload-avatar">${avatarHTML('profile','🎀')}</div>${fileInput('profileFile')}<div class="actions"><button class="secondary" id="clearProfileAvatar">恢复默认头像</button><button class="primary" id="chooseProfileAvatar">上传头像</button></div><form id="profileForm"><label>你的名字<input name="displayName" maxlength="30" required value="${escapeHtml(profile.name)}"></label><div class="actions"><button type="button" class="secondary" id="cancelProfile">关闭</button><button class="primary">保存名字</button></div></form>`;
  document.querySelector('#chooseProfileAvatar').onclick=()=>document.querySelector('#profileFile').click();
  document.querySelector('#profileFile').onchange=async e=>{const b=document.querySelector('#chooseProfileAvatar');b.disabled=true;try{await mediaWrite('profile',await prepareImage(e.target.files[0]));document.querySelector('#profilePreview').innerHTML=avatarHTML('profile','🎀');renderMe();toast('个人头像已保存')}catch(err){toast(err.message)}finally{b.disabled=false;e.target.value=''}};
  document.querySelector('#clearProfileAvatar').onclick=async()=>{try{await mediaWrite('profile',null);document.querySelector('#profilePreview').innerHTML=avatarHTML('profile','🎀');renderMe();toast('已恢复默认头像')}catch(err){toast(err.message)}};
  document.querySelector('#cancelProfile').onclick=()=>d.close();document.querySelector('#profileForm').onsubmit=e=>{e.preventDefault();const name=e.target.displayName.value.trim();if(!name)return;try{localStorage.setItem('palais.profile',JSON.stringify({name}));profile={name};d.close();renderMe();toast('人物设置已保存')}catch(err){toast('保存失败，请检查浏览器存储空间')}};d.showModal();
}
async function loadModels(f){
  const base=f.base.value.trim(),apiKey=f.key.value.trim();if(!base||!apiKey){toast('先填写 API 地址和密钥，再获取模型');return}if(!f.base.reportValidity()||!f.key.reportValidity())return;
  const btn=document.querySelector('#loadModels'),status=document.querySelector('#connection');btn.disabled=true;status.textContent='正在获取此密钥可见的模型…';
  try{const res=await fetch(PalaisCore.apiURL(base,'models'),{headers:{Authorization:'Bearer '+apiKey},signal:AbortSignal.timeout(30000)});let data;try{data=await res.json()}catch{throw Error('模型接口没有返回 JSON，可使用手动输入')}if(!res.ok)throw Error('HTTP '+res.status+' · '+(data.error?.message||'无法获取模型'));const ids=PalaisCore.modelIds(data);if(f.base.value.trim()!==base||f.key.value.trim()!==apiKey)return;const select=document.querySelector('#modelSelect');select.replaceChildren();const placeholder=new Option('请选择模型','');select.add(placeholder);ids.forEach(id=>select.add(new Option(id,id)));select.value=ids.includes(f.model.value.trim())?f.model.value.trim():'';select.hidden=false;document.querySelector('#modelManual').hidden=true;f.model.type='hidden';document.querySelector('#manualModel').hidden=false;status.textContent='✓ 已获取 '+ids.length+' 个模型，请选择。列表代表密钥可见模型，能否聊天请再测试连接。';
  }catch(err){status.textContent='获取失败：'+friendly(err)+'。可以切换手动输入。'}finally{btn.disabled=false}
}
window.addEventListener('DOMContentLoaded',async()=>{
  try{const db=await mediaDB;await new Promise((resolve,reject)=>{const tx=db.transaction('images','readonly');const cursor=tx.objectStore('images').openCursor();cursor.onsuccess=()=>{const c=cursor.result;if(c){mediaCache.set(c.key,c.value);c.continue()}};tx.oncomplete=resolve;tx.onerror=reject});render()}catch{toast('图片存储不可用，文字聊天仍可使用')}
});
