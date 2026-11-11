/* Message controls live only in the long-press menu. */
const recallBase32=withdraw26;withdraw26=function(r,m){const changed=recallBase32(r,m);if(changed)cancelMessageVoice32(r,m);return changed};
const regenerateBase32=regen26;regen26=function(r,m){if(busy)return;cancelMessageVoice32(r,m);return regenerateBase32(r,m)};
wxMessageMenu=function(r,m){
 const labels={recall:'撤回',edit:'重新编辑',copy:'复制',quote:'引用',delete:'删除',favorite:'收藏',regenerate:'重新生成',transcribe:'语音转文字'},actions=Chat32.menu(m);if(!actions.length)return;
 const d=wxPanel('<h3>消息操作</h3><div class="wx18-menu">'+actions.map(a=>`<button data-action32="${a}">${labels[a]}</button>`).join('')+'</div>');
 d.querySelectorAll('[data-action32]').forEach(b=>b.onclick=async()=>{try{
  const a=b.dataset.action32;
  if(a==='recall'){d.close();withdraw26(r,m);return}
  if(a==='edit'){d.close();editMessage27(r,m);return}
  if(a==='regenerate'){d.close();regen26(r,m);return}
  if(a==='copy'){await navigator.clipboard.writeText(m.transcript||m.content);toast('已复制')}
  if(a==='quote'){wxQuote={conversationId:r.id,name:roles.find(x=>x.id===m.sender)?.name||r.name,text:(m.transcript||m.content).slice(0,300)};d.close();renderConversation();return}
  if(a==='favorite'){wxPut({...wx18,favorites:[...(wx18.favorites||[]),{id:crypto.randomUUID(),name:wxName(r),text:m.transcript||m.content,at:Date.now()}].slice(-300)});toast('已收藏')}
  if(a==='delete'){if(busy)throw Error('请等本轮回复结束');wxHistoryCommit(r.id,(histories[r.id]||[]).filter(x=>x!==m));d.close();renderConversation();return}
  if(a==='transcribe'){d.close();await wxTranscribe(r,m);return}d.close();
 }catch(e){toast(e.message)}});
};
const renderChat32=renderConversation;renderConversation=function(){
 renderChat32();screen.querySelectorAll('.message-actions26,.speak-message').forEach(el=>el.remove());
 screen.querySelectorAll('.wx18-recalled .bubble button').forEach(el=>el.remove());
 const r=findConversation(current);if(!r)return;
 const failed=(histories[r.id]||[]).slice().reverse().find(m=>m.role==='user'&&m.kind!=='recall'&&Object.keys(m.errors26||{}).length);
 if(failed){const right=screen.querySelector('.chat-page .nav-r');if(right){const b=document.createElement('button');b.type='button';b.className='ib';b.textContent='↻';b.setAttribute('aria-label','重试未完成的回复');b.onclick=()=>regen26(r,failed);right.append(b)}}
};
// Keep app-wide controls on the desktop's My page only.
const wxMe32=renderWxMe;renderWxMe=function(){wxMe32();
 screen.querySelectorAll('[data-wx19-action="theme"],[data-wx19-action="api"],[data-wx19-action="proactive"]').forEach(el=>el.remove());
 screen.querySelectorAll('button').forEach(b=>{if(/^(一键搬家|文字大小|字体大小|安装到手机桌面|恢复出厂设置|检查更新)/.test(b.textContent.trim()))b.remove()});
};
const wxSettings32=wxSettings;wxSettings=function(){wxSettings32();screen.querySelectorAll('button').forEach(b=>{if(/^(一键搬家|文字大小|安装到手机桌面|恢复出厂设置|检查更新)/.test(b.textContent.trim()))b.remove()})};
const desktopMe32=renderMe;renderMe=function(){desktopMe32();const b=$('#openFonts span');if(b)b.textContent='手机原字体 / 三种字体 ›'};
// Clearing credentials must clear all three saved profiles, including in-memory keys.
const meKeys32=renderMe;renderMe=function(){meKeys32();const b=$('#clearKey');if(b){const prior=b.onclick;b.onclick=()=>{try{clearSlotKeys32();prior()}catch(e){toast('密钥清除未完成：'+e.message)}}}};
