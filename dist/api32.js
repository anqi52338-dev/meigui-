/* Three explicit profiles; editing an inactive profile never switches live credentials. */
const rawSlots32=localRead('apiSlots32',null);
let slots32={active:Number.isInteger(rawSlots32?.active)&&rawSlots32.active>=0&&rawSlots32.active<3?rawSlots32.active:0,slots:Array.from({length:3},(_,i)=>{const s=rawSlots32?.slots?.[i]||(i===0?config:{});return {base:String(s.base||''),model:String(s.model||''),remember:s.remember===true,key:s.remember===true?String(s.key||''):''}})};
let slotKeys32=slots32.slots.map(s=>s.key),editSlot32=slots32.active,apiPage32=0;
if(!rawSlots32)slotKeys32[0]=key;
else{const s=slots32.slots[slots32.active];if(config.base&&config.model&&(s.base!==config.base||s.model!==config.model||s.remember!==config.remember||s.remember&&s.key!==config.key)){slots32.slots[slots32.active]={...config,key:config.remember?key:''};slotKeys32[slots32.active]=key;try{localSave('apiSlots32',slots32)}catch{}}else if(s.base===config.base&&s.model===config.model&&key)slotKeys32[slots32.active]=key;config={...slots32.slots[slots32.active]};key=slotKeys32[slots32.active]}
function commitSlots32(next,keys){
 const previous=localStorage.getItem('palais.apiSlots32'),oldConfig=localStorage.getItem('palais.config'),s=next.slots[next.active];
 try{localSave('apiSlots32',next);localStorage.setItem('palais.config',JSON.stringify({...s,key:s.remember?keys[next.active]:''}))}
 catch(e){try{previous===null?localStorage.removeItem('palais.apiSlots32'):localStorage.setItem('palais.apiSlots32',previous);oldConfig===null?localStorage.removeItem('palais.config'):localStorage.setItem('palais.config',oldConfig)}catch{}throw e}
 slots32=next;slotKeys32=keys;config={...s};key=keys[next.active];
}
function apiBusy32(){return installationBusy29()||visionChecking||voiceRunning32||!!wxCall||!!wxRecording||$('#testApi')?.disabled||$('#loadModels')?.disabled}
function activateSlot32(index){if(apiBusy32())throw Error('请等当前请求或通话结束');const s=slots32.slots[index];if(!s?.base||!s.model||!slotKeys32[index])throw Error('请先编辑并保存这组API，未记住的密钥需重新填写');PalaisCore.apiURL(s.base,'chat/completions');commitSlots32({...slots32,active:index},slotKeys32.slice());editSlot32=index}
function clearSlotKeys32(){cancelVoice32();const next={...slots32,slots:slots32.slots.map(s=>({...s,key:'',remember:false}))};commitSlots32(next,['','',''])}
saveConfig=function(f){const c=formConfig(f);PalaisCore.apiURL(c.base,'chat/completions');const next={...slots32,slots:slots32.slots.map((s,i)=>i===editSlot32?{...c,key:c.remember?c.key:''}:s)},keys=slotKeys32.slice();keys[editSlot32]=c.key;commitSlots32(next,keys)};
function slotCards32(){
 const box=document.createElement('div');box.className='api-slots32';
 slots32.slots.forEach((s,i)=>{const card=document.createElement('div');card.className='api-slot32'+(slots32.active===i?' active':'');const use=document.createElement('button');use.type='button';use.textContent='API '+(i+1)+(slots32.active===i?' · 使用中':'');use.onclick=()=>{
  if(apiBusy32())return toast('请等当前请求或通话结束');
  if(!s.base||!s.model||!slotKeys32[i]){editSlot32=i;renderApi();toast('先填写并保存这组API，再点选使用');return}
  const d=wxPanel(`<h3>使用 API ${i+1} 对话？</h3><p>模型：${escapeHtml(s.model)}</p><div class="actions"><button class="secondary" id="noAPI32">否，保留原API</button><button class="primary" id="yesAPI32">是，切换</button></div>`);
  d.querySelector('#noAPI32').onclick=()=>d.close();d.querySelector('#yesAPI32').onclick=()=>{try{activateSlot32(i);d.close();renderApi();toast('已切换到 API '+(i+1))}catch(e){toast(e.message)}};
 };const info=document.createElement('small');info.textContent=s.model||'尚未配置';const edit=document.createElement('button');edit.type='button';edit.className='text-button';edit.textContent='编辑';edit.onclick=()=>{if(apiBusy32())return toast('请等当前请求结束');editSlot32=i;renderApi()};card.append(use,info,edit);box.append(card)});return box;
}
const baseApi32=renderApi;renderApi=function(){
 const actual=config,actualKey=key;try{config={...slots32.slots[editSlot32]};key=slotKeys32[editSlot32];baseApi32()}finally{config=actual;key=actualKey}
 const view=screen.querySelector('.view');if(!view)return;
 const original=[...view.children],head=original.shift(),tabs=document.createElement('nav');tabs.className='api-tabs32';tabs.setAttribute('aria-label','API设置分页');
 const pages=[0,1,2].map(()=>{const s=document.createElement('section');s.className='api-page32';return s});
 for(const node of original){if(node.id==='voiceAPISection')pages[1].append(node);else if(node.querySelector('#auto21Form,#style26,#outputForm28'))pages[2].append(node);else pages[0].append(node)}
 const cards=slotCards32();pages[0].querySelector('#apiForm')?.before(cards);const hint=document.createElement('p');hint.className='api-note';hint.textContent='正在编辑 API '+(editSlot32+1)+'；当前对话使用 API '+(slots32.active+1)+'。保存仅更新此配置，切换需点选上方API并确认。';cards.after(hint);
 if($('#visionStatus'))$('#visionStatus').textContent=visionStatus();
 const voice=pages[1].querySelector('#voiceAPISection');if(voice){const auto=voice.querySelector('[name="autoPlay"]');if(auto){auto.checked=false;auto.closest('label').hidden=true}voice.querySelector('.api-note').textContent='兼容 /audio/transcriptions 与 /audio/speech。主动语音必须填写真实语音合成模型；服务商需允许跨域请求。不会使用浏览器朗读冒充角色语音。';voice.append(voiceQuotaForm32())}
 const third=document.createElement('div');third.className='api-section-title';third.innerHTML='<span>03</span><h3>互动与回复</h3><p>角色互动次数、微信回复方式与输出长度</p>';pages[2].prepend(third);
 ['01 聊天API','02 语音API','03 互动与回复'].forEach((name,i)=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.onclick=()=>{apiPage32=i;show()};tabs.append(b)});
 function show(){pages.forEach((p,i)=>p.hidden=i!==apiPage32);[...tabs.children].forEach((b,i)=>b.setAttribute('aria-current',i===apiPage32?'page':'false'))}
 view.replaceChildren(head,tabs,...pages);show();
};
