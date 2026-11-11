const bookView34=renderBook;renderBook=function(){bookView34();const b=document.createElement('button');b.className='secondary full';b.textContent='导入世界书文件';b.onclick=importBook34;screen.querySelector('.book-scope-tabs').before(b)};
function importBook34(){
 const d=panel(`<h2>导入世界书</h2><p class="api-note">支持JSON世界书（entries、角色卡中的character_book、条目数组）与TXT文本，最多2MB、500条。TXT长文会拆成条目。导入只追加，重复条目跳过；高级触发条件不能完整转换的条目默认停用。</p><input id="bookFile34" type="file" accept=".json,.txt,application/json,text/plain"><label>导入范围<select id="bookScope34"><option value="global">全局 · 所有角色</option><option value="local">局部 · 指定角色或群聊</option></select></label><label id="bookTargetLabel34">生效对象<select id="bookTarget34"><option value="">请选择</option>${roles.map(r=>`<option value="role:${escapeHtml(r.id)}">角色 · ${escapeHtml(r.name)}</option>`).join('')}${groups.map(g=>`<option value="group:${escapeHtml(g.id)}">群聊 · ${escapeHtml(g.name)}</option>`).join('')}</select></label><div id="bookPreview34" role="status">请先选择文件，预览后再确认导入。</div><button class="primary full" id="bookCommit34" disabled>确认追加导入</button><button class="secondary full" id="bookCancel34">取消</button>`);
 let rows=null,ticket=0;const scope=d.querySelector('#bookScope34'),target=d.querySelector('#bookTarget34'),commit=d.querySelector('#bookCommit34'),preview=d.querySelector('#bookPreview34');scope.value=bookScope;
 const change=()=>{d.querySelector('#bookTargetLabel34').hidden=scope.value!=='local';commit.disabled=!rows||scope.value==='local'&&!target.value};scope.onchange=change;target.onchange=change;change();
 d.querySelector('#bookCancel34').onclick=()=>d.close();
 d.querySelector('#bookFile34').onchange=async e=>{const version=++ticket;rows=null;change();try{const f=e.target.files[0];if(!f)return;if(f.size>Book34.MAX)throw Error('单个文件最多2MB');if(!/\.(json|txt)$/i.test(f.name))throw Error('请选择JSON或TXT文件');const buffer=await f.arrayBuffer();let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(buffer)}catch{text=new TextDecoder('gb18030',{fatal:true}).decode(buffer)}const parsed=Book34.parse(text,f.name);if(version!==ticket||!d.open)return;rows=parsed;preview.replaceChildren();const p=document.createElement('p');p.textContent='共'+rows.length+'条；'+rows.filter(r=>r.advanced).length+'条含高级条件，将停用待检查。';preview.append(p);for(const row of rows.slice(0,8)){const item=document.createElement('p');item.textContent=row.name+'：'+row.content.slice(0,100);preview.append(item)}change()}catch(err){if(version!==ticket)return;rows=null;preview.textContent=err.message;change()}};
 commit.onclick=()=>{if(!rows)return;if(busy||memoryBusy||socialBusy||task22)return toast('请先完成当前生成或搬家操作');try{if(scope.value==='local'&&!([...roles.map(r=>'role:'+r.id),...groups.map(g=>'group:'+g.id)].includes(target.value)))throw Error('请选择仍然存在的局部对象');const result=Book34.merge(worldbook,rows,scope.value,target.value,()=>crypto.randomUUID());const previous=worldbook;worldbook=result.next;try{saveBook()}catch(e){worldbook=previous;throw e}bookScope=scope.value;d.close();renderBook();toast('已导入'+result.added+'条，跳过重复'+result.skipped+'条')}catch(e){toast('导入未完成：'+e.message)}};
}
const chatView34=renderConversation;renderConversation=function(){
 chatView34();const r=findConversation(current);if(!r)return;
 const history=(histories[r.id]||[]).filter(m=>m.kind!=='pat');
 screen.querySelectorAll('#messages .msg').forEach((el,i)=>{
  const m=history[i];if(!m||!Book34.separate(m))return;const original=el.querySelector('.bubble');if(!original)return;
  original.querySelectorAll('.sticker-message').forEach(node=>node.remove());
  original.querySelectorAll('small').forEach(node=>{if(node.textContent==='表情图片暂不可用')node.remove()});
  const hasText=original.textContent.trim()||original.querySelector('img,button,audio,.kin-offer');
  const sticker=hasText?document.createElement('div'):original;
  sticker.classList.add('bubble','sticker-only34');sticker.innerHTML=stickerHTML(m);
  if(hasText)original.after(sticker);
  if(hasText)wx19Long(sticker,()=>wxMessageMenu(r,m));sticker.oncontextmenu=e=>{e.preventDefault();e.stopPropagation();wxMessageMenu(r,m)};
 });
 const list=$('#messages');if(list)list.scrollTop=list.scrollHeight;
};
const style34=document.createElement('style');style34.textContent='.message-body>.sticker-only34{display:block!important;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;margin-top:7px;width:fit-content;max-width:150px}.msg.user .message-body>.sticker-only34{margin-left:auto}.sticker-only34 .sticker-message{margin:0!important}.sticker-only34:before,.sticker-only34:after{display:none!important}';document.head.append(style34);
