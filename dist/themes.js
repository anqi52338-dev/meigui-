const PalaisTheme={
  storageKey:'palais.theme',
  mascotKey:'palais.mascot',
  fallback:'macaron',
  // 新主题：在这里登记一项，并在 themes.css 写一段 :root[data-theme="id"] 覆盖样式；token:true 的主题只需定义 --t-* 配色令牌
  list:[
    {id:'macaron',name:'马卡龙金粉',en:'MACARON',note:'草莓粉 · 薄荷绿 · 柠檬黄 · 香槟金',swatches:['#ffc9d7','#d6f2e5','#fff2c6','#e6c47e'],meta:'#ffe9ef'},
    {id:'ins',name:'INS 奶油风',en:'CREAM INS',note:'奶油白 · 燕麦色 · 墨黑 · 拍立得',swatches:['#f8f4ee','#e5ddd2','#a8916f','#2e2a26'],meta:'#f8f4ee',token:true},
    {id:'night',name:'月夜星河',en:'MOONLIT',note:'深夜蓝 · 薰衣草 · 星光金',swatches:['#1f1d3a','#3d3575','#c7b4ff','#e8cf8f'],meta:'#1f1d3a',token:true,dark:true},
    {id:'soda',name:'薄荷汽水',en:'MINT SODA',note:'薄荷绿 · 汽水蓝 · 气泡白',swatches:['#f4fffc','#7ad9c9','#6cc4f0','#ff9fb5'],meta:'#e3fbf5',token:true},
    {id:'classic',name:'初版浅玫瑰',en:'CLASSIC',note:'浅玫瑰 · 奶油白 · 香槟金',swatches:['#edc8cf','#ffffff','#cbb38b'],meta:'#f4d8dc'}
  ],
  mascots:[{id:'cat',name:'布偶猫'},{id:'bunny',name:'奶白兔'},{id:'dog',name:'小柴犬'}],
  find(id){return this.list.find(t=>t.id===id)||null},
  current(store){try{const id=(store||localStorage).getItem(this.storageKey);return this.find(id)?id:this.fallback}catch{return this.fallback}},
  apply(id,doc){const t=this.find(id)||this.find(this.fallback);if(!doc)return t.id;const root=doc.documentElement;root.dataset.theme=t.id;root.classList.toggle('tk',!!t.token);root.classList.toggle('tk-dark',!!t.dark);const meta=doc.querySelector('meta[name="theme-color"]');if(meta)meta.content=t.meta;const p=doc.querySelector('.intro .palette');if(p){p.querySelectorAll('i').forEach((i,n)=>{i.style.background=t.swatches[n]||''});const s=p.querySelector('span');if(s)s.textContent=t.note}return t.id},
  save(id,store){if(!this.find(id))return false;try{(store||localStorage).setItem(this.storageKey,id);return true}catch{return false}},
  mascot(store){try{const id=(store||localStorage).getItem(this.mascotKey);return this.mascots.some(m=>m.id===id)?id:'cat'}catch{return 'cat'}},
  setMascot(id,doc,store){if(!this.mascots.some(m=>m.id===id))return false;if(doc)doc.documentElement.dataset.mascot=id;try{(store||localStorage).setItem(this.mascotKey,id);return true}catch{return false}},
  nextMascot(id){const i=this.mascots.findIndex(m=>m.id===id);return this.mascots[(i+1)%this.mascots.length].id}
};
if(typeof document!=='undefined'){const boot=()=>{PalaisTheme.apply(PalaisTheme.current(),document);document.documentElement.dataset.mascot=PalaisTheme.mascot()};boot();document.addEventListener('DOMContentLoaded',boot);document.addEventListener('click',e=>{if(!e.target.closest?.('.home-v3 .clock'))return;const next=PalaisTheme.nextMascot(PalaisTheme.mascot());PalaisTheme.setMascot(next,document);if(typeof toast==='function')toast('桌面萌宠换成了'+PalaisTheme.mascots.find(m=>m.id===next).name)})}
function themeName(){return PalaisTheme.find(PalaisTheme.current()).name}
function openThemePicker(after){const now=PalaisTheme.current(),pet=PalaisTheme.mascot(),d=panel(`<div class="eyebrow">PALACE WARDROBE</div><h2>主题配色</h2><p class="api-note">整套界面配色即时切换，只保存在当前浏览器，不影响聊天与家园数据。</p><div class="theme-list">${PalaisTheme.list.map(t=>`<button class="theme-option${t.id===now?' selected':''}" data-theme-id="${t.id}"><span class="theme-swatches">${t.swatches.map(c=>`<i style="background:${c}"></i>`).join('')}</span><span><strong>${escapeHtml(t.name)}</strong><small>${t.en} · ${escapeHtml(t.note)}</small></span><b>${t.id===now?'使用中':'换上'}</b></button>`).join('')}</div><h3 class="sticker-heading">桌面萌宠 · 也可以点桌面时钟切换</h3><div class="mascot-list">${PalaisTheme.mascots.map(m=>`<button class="mascot-option${m.id===pet?' selected':''}" data-mascot-id="${m.id}"><img alt="" src="${PalaisPets[m.id]}"><small>${m.name}</small></button>`).join('')}</div><button class="secondary full" id="closeTheme">完成</button>`);d.querySelectorAll('[data-theme-id]').forEach(b=>b.onclick=()=>{const id=b.dataset.themeId;PalaisTheme.apply(id,document);if(!PalaisTheme.save(id))toast('主题已切换，但浏览器存储不可用，刷新后会恢复默认');d.close();if(after)after();openThemePicker(after)});d.querySelectorAll('[data-mascot-id]').forEach(b=>b.onclick=()=>{if(!PalaisTheme.setMascot(b.dataset.mascotId,document))toast('萌宠已切换，但浏览器存储不可用');d.close();openThemePicker(after)});$('#closeTheme').onclick=()=>d.close()}
