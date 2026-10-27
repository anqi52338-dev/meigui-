const PalaisTheme={
  storageKey:'palais.theme',
  fallback:'gold-rose',
  // 新主题：在这里登记一项，并在 themes.css 写一段 :root[data-theme="id"] 覆盖样式
  list:[
    {id:'gold-rose',name:'金粉宫廷',en:'GOLD ROSE',note:'玫瑰粉 · 奶油白 · 香槟金箔',swatches:['#e39aae','#fff8ef','#c9a050'],meta:'#f3d3da'},
    {id:'classic',name:'初版浅玫瑰',en:'CLASSIC',note:'浅玫瑰 · 奶油白 · 香槟金',swatches:['#edc8cf','#ffffff','#cbb38b'],meta:'#f4d8dc'}
  ],
  find(id){return this.list.find(t=>t.id===id)||null},
  current(store){try{const id=(store||localStorage).getItem(this.storageKey);return this.find(id)?id:this.fallback}catch{return this.fallback}},
  apply(id,doc){const t=this.find(id)||this.find(this.fallback);if(!doc)return t.id;doc.documentElement.dataset.theme=t.id;const meta=doc.querySelector('meta[name="theme-color"]');if(meta)meta.content=t.meta;const p=doc.querySelector('.intro .palette');if(p){p.querySelectorAll('i').forEach((i,n)=>{i.style.background=t.swatches[n]||''});const s=p.querySelector('span');if(s)s.textContent=t.note}return t.id},
  save(id,store){if(!this.find(id))return false;try{(store||localStorage).setItem(this.storageKey,id);return true}catch{return false}}
};
if(typeof document!=='undefined'){PalaisTheme.apply(PalaisTheme.current(),document);document.addEventListener('DOMContentLoaded',()=>PalaisTheme.apply(PalaisTheme.current(),document))}
function themeName(){return PalaisTheme.find(PalaisTheme.current()).name}
function openThemePicker(after){const now=PalaisTheme.current(),d=panel(`<div class="eyebrow">PALACE WARDROBE</div><h2>主题配色</h2><p class="api-note">整套界面配色即时切换，只保存在当前浏览器，不影响聊天与家园数据。</p><div class="theme-list">${PalaisTheme.list.map(t=>`<button class="theme-option${t.id===now?' selected':''}" data-theme-id="${t.id}"><span class="theme-swatches">${t.swatches.map(c=>`<i style="background:${c}"></i>`).join('')}</span><span><strong>${escapeHtml(t.name)}</strong><small>${t.en} · ${escapeHtml(t.note)}</small></span><b>${t.id===now?'使用中':'换上'}</b></button>`).join('')}</div><p class="section-note">更多主题会陆续加入这里。</p><button class="secondary full" id="closeTheme">完成</button>`);d.querySelectorAll('[data-theme-id]').forEach(b=>b.onclick=()=>{const id=b.dataset.themeId;PalaisTheme.apply(id,document);if(!PalaisTheme.save(id))toast('主题已切换，但浏览器存储不可用，刷新后会恢复默认');d.close();if(after)after();openThemePicker(after)});$('#closeTheme').onclick=()=>d.close()}
