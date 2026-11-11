/* User-supplied DOCX illustrations, imported lazily into the normal custom library. */
let pack27Promise=null;
async function ensurePack27(){
 if(localRead('pack27Imported',false))return;
 if(pack27Promise)return pack27Promise;
 if(task22)throw Error('请等待当前搬家或数据操作完成');task22=true;
 pack27Promise=(async()=>{
  const files=await Promise.all(stickerPack27.filter(s=>!customStickers.some(x=>x.id===s.id)).map(async s=>{const response=await fetch(s.src);if(!response.ok)throw Error('呆猫表情包暂未下载完整，请联网后重试');const blob=await response.blob();const data=await new Promise((ok,no)=>{const reader=new FileReader;reader.onload=()=>ok(reader.result);reader.onerror=()=>no(Error('表情图片读取失败'));reader.readAsDataURL(blob)});return [s,data]}));
  if(phoneLocked)throw Error('请完成搬家后再加载表情');
  const db=await mediaDB,old=customStickers,keys=files.map(([s])=>'sticker:'+s.id);
  try{await new Promise((ok,no)=>{const tx=db.transaction('images','readwrite'),store=tx.objectStore('images');for(const[s,data]of files)store.put(data,'sticker:'+s.id);tx.oncomplete=ok;tx.onabort=tx.onerror=()=>no(Error('表情包保存失败，请检查存储空间'))});
   const next=[...customStickers,...files.map(([s])=>({id:s.id,name:s.name,mood:s.mood,enabled:true}))];localSave('stickers',next);localSave('pack27Imported',true);customStickers=next;for(const[s,data]of files)mediaCache.set('sticker:'+s.id,data);
  }catch(e){customStickers=old;try{localSave('stickers',old);await new Promise((ok,no)=>{const tx=db.transaction('images','readwrite');for(const k of keys)tx.objectStore('images').delete(k);tx.oncomplete=ok;tx.onerror=no})}catch{}throw e}
 })();try{await pack27Promise}finally{pack27Promise=null;task22=false}
}
function chooseCustom27(r,s){
 if(!visionEnabled())return toast('当前 API 尚未通过识图检测。可以先添加表情，到 API 设置检测通过后再发送。');
 if(!mediaCache.has('sticker:'+s.id))return toast('图片尚未准备好，请稍后重试');
 const input=$('#composer textarea'),text=input?.value||'';staged26.set(r.id,{...s,custom:true});wx19.panel=null;wx19.custom27=false;renderConversation();if($('#composer textarea')){$('#composer textarea').value=text;$('#composer textarea').dispatchEvent(new Event('input'))}
}
async function uploadSticker27(r){
 const d=wxPanel('<form id="upload27"><h3>添加自定义表情</h3><input type="file" accept="image/png,image/jpeg,image/webp,image/gif" id="uploadFile27" required><div id="uploadPreview27"></div><label>表情名字<input name="label" required maxlength="30" placeholder="例如：委屈小猫"></label><label>这个表情是什么意思<textarea name="meaning" required maxlength="300" rows="3" placeholder="例如：想念对方、委屈，想被安慰。角色会按这个含义选择表情。"></textarea></label><button class="primary full" id="saveUpload27">保存到爱心表情</button></form>');let data=null,processing=false;
 $('#uploadFile27').onchange=async e=>{processing=true;$('#saveUpload27').disabled=true;try{data=await prepareSticker(e.target.files[0]);$('#uploadPreview27').replaceChildren();const img=document.createElement('img');img.src=data;img.alt='表情预览';img.className='sticker-preview-image';$('#uploadPreview27').append(img)}catch(e){data=null;toast(e.message)}finally{processing=false;$('#saveUpload27').disabled=false}};
 $('#upload27').onsubmit=async e=>{e.preventDefault();if(processing||!data)return toast('请先选择一张表情图片');const f=e.target,name=f.label.value.trim(),mood=f.meaning.value.trim();if(!name||!mood)return toast('请填写名字和表情含义');if(customStickers.length>=225)return toast('自定义图库已满，请先移除不需要的表情');const id='custom-'+crypto.randomUUID(),button=$('#saveUpload27');button.disabled=true;try{await mediaWrite('sticker:'+id,data);const next=[...customStickers,{id,name,mood,enabled:true}];localSave('stickers',next);customStickers=next;d.close();wx19.panel='emoji';wx19.custom27=true;if(current===r.id&&isChatView())renderConversation();toast('已添加，可和文字一起发送')}catch(e){try{await mediaWrite('sticker:'+id,null)}catch{}toast(e.message)}finally{button.disabled=false}}
}
wx19StickerGrid=async function(r,panel){
 wx19.custom27=true;const grid=panel.querySelector('.emo-grid');if(!grid)return;grid.classList.add('custom-gallery27');grid.innerHTML='<button class="add-sticker27" aria-label="添加自定义表情">＋</button><small>正在加载呆猫表情…</small>';grid.firstChild.onclick=()=>uploadSticker27(r);
 let error='';try{await ensurePack27()}catch(e){error=e.message}
 if(!panel.isConnected||!wx19.custom27)return;
 const custom=customStickers.filter(s=>s.enabled!==false);grid.replaceChildren();const add=document.createElement('button');add.className='add-sticker27';add.setAttribute('aria-label','添加自定义表情');add.textContent='＋';add.onclick=()=>uploadSticker27(r);grid.append(add);
 for(const s of custom){const b=document.createElement('button');b.title=s.name+'：'+s.mood;const img=document.createElement('img');img.src=mediaCache.get('sticker:'+s.id)||'';img.alt=s.name;b.append(img);b.onclick=()=>chooseCustom27(r,s);grid.append(b)}
 panel.querySelector('.custom-note27')?.remove();const note=document.createElement('div');note.className='custom-note27';note.textContent=error||(!visionEnabled()?'可添加和管理；发送上传图片前，请先在 API 设置通过识图检测。':'选中后可随文字发送，也可不输入文字单独发送。');panel.append(note);
 if(error){const retry=document.createElement('button');retry.textContent='重新加载';retry.onclick=()=>wx19StickerGrid(r,panel);note.append(retry)}
};
const drawer27Prior=wx19DrawPanel;wx19DrawPanel=function(r){drawer27Prior(r);const panel=$('#wx19Panel');if(!panel||wx19.panel!=='emoji')return;const tab=$('#wx19StickerTab');if(tab){tab.textContent='♡';tab.setAttribute('aria-label','自定义表情');tab.title='自定义表情';tab.onclick=()=>wx19StickerGrid(r,panel)}const emojis=$('#wx19EmojiTab');if(emojis)emojis.onclick=()=>{wx19.custom27=false;wx19DrawPanel(r)};if(wx19.custom27)wx19StickerGrid(r,panel)};
const library27Prior=renderStickers;renderStickers=function(){library27Prior();if(!localRead('pack27Imported',false)){const b=document.createElement('button');b.className='secondary full';b.textContent='载入呆猫表情包 · 25张';b.onclick=async()=>{b.disabled=true;try{await ensurePack27();if(tab==='stickers')renderStickers()}catch(e){toast(e.message);b.disabled=false}};screen.querySelector('.view')?.prepend(b)}};
