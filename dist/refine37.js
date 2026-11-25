/* Shared presentation fixes for all retained layouts. */
const labels37=Object.fromEntries(Mood36.ids.map((id,i)=>[id,Mood36.labels[i]]));
function journalMemory37(moods=moods24,diaries=wx18.diaries){return Refine37.journals(memories,roles,moods,diaries)}
function saveMood37(next){const nextMem=journalMemory37(next),keys=['moods24','memories'],old=keys.map(k=>localStorage.getItem('palais.'+k));try{localSave('moods24',next);localSave('memories',nextMem)}catch(e){keys.forEach((k,i)=>{try{old[i]===null?localStorage.removeItem('palais.'+k):localStorage.setItem('palais.'+k,old[i])}catch{}});throw e}moods24=next;memories=nextMem}
function syncJournals37(){const next=journalMemory37();if(next!==memories){localSave('memories',next);memories=next}}
// Diary changes and their role memories are committed together, including edited text.
function putDiary37(next){const nextMem=journalMemory37(moods24,next.diaries),keys=['memories','wx18'],raw=keys.map(k=>localStorage.getItem('palais.'+k));try{localSave('memories',nextMem);localSave('wx18',next)}catch(e){keys.forEach((k,i)=>{try{raw[i]===null?localStorage.removeItem('palais.'+k):localStorage.setItem('palais.'+k,raw[i])}catch{}});throw e}memories=nextMem;wx18=next}
const memoryPrompt37=memoryPrompt;memoryPrompt=function(id){const query=(histories[id.replace(/^shared:/,'')]||[]).slice().reverse().find(m=>m.role==='user'&&m.kind!=='recall')?.content||'';return memoryPrompt37(id)+Refine37.recall(memories[id],query,labels37)};
const detail37=drawMemoryDetail;drawMemoryDetail=function(id){detail37(id);const entries=memories[id]?.journals37||[];if(!entries.length)return;const card=document.createElement('details');card.className='memory-archive journal-memory37';card.innerHTML='<summary>专属心情日记记忆 · '+entries.length+'条</summary><p class="api-note">日记按角色独立保存。私聊会按话题找回相关记录，群聊不读取私人日记。</p>'+entries.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12).map(e=>'<p><small>'+escapeHtml(e.date+' · '+(labels37[e.mood]||'随记'))+'</small><br>'+escapeHtml(e.text||'已记录心情')+'</p>').join('');$('#memoryDetail')?.append(card)};
const diary37=wxDiary;wxDiary=function(date){try{syncJournals37()}catch(e){toast('日记仍保留，记忆同步失败：'+e.message)}return diary37(date)};
window.addEventListener('DOMContentLoaded',()=>{try{syncJournals37()}catch(e){toast('心情记忆同步未完成：'+e.message)}});
// The mood library is private; only the mood label may inform a group reply.
moodContext36=function(id,room){const m=moods24[day24()]?.[id];if(!m)return '';return '\n你今天记录的心情：'+(labels37[m.mood]||m.mood)+(room?.members?'。不要在群聊泄露私人日记。':'；'+String(m.note||'').slice(0,1500))};
const display37=displayText27;displayText27=function(m){const text=display37(m),r=roles.find(r=>r.id===m.sender);return m.role==='assistant'&&r?Refine37.clean(text,r.name,wx18.prefs[r.id]?.remark):text};
const chatView37=renderConversation;renderConversation=function(){
 chatView37();const r=findConversation(current);if(!r)return;
 const history=(histories[r.id]||[]).filter(m=>m.kind!=='pat'),rows=[...screen.querySelectorAll('#messages .msg')];
 rows.forEach((el,i)=>{const m=history[i];if(!m||m.kind==='recall'||!m.sticker?.custom)return;const sticker=el.querySelector('.sticker-only34');if(!sticker)return;
  const body=el.querySelector('.message-body'),separate=[...body.children].some(n=>n!==sticker&&n.matches('.bubble')&&(n.textContent.trim()||n.querySelector('img,button,audio')));
  if(!separate){el.classList.add('sticker-row37');return}
  const row=document.createElement('div');row.className='msg '+m.role+' sticker-row37';const actor=roles.find(p=>p.id===m.sender)||r;row.innerHTML=(m.role==='user'?avatarHTML('profile','🎀'):avatarHTML('role:'+actor.id,actor.emoji||'🌷'))+'<div class="message-body">'+(r.members&&m.role==='assistant'?'<small class="sender-name">'+escapeHtml(actor.name)+'</small>':'')+'</div>';row.querySelector('.message-body').append(sticker);row.querySelector('.avatar').ondblclick=()=>patAvatar(r,m);el.after(row);
 });
 const list=$('#messages');if(list)list.scrollTop=list.scrollHeight;
};
// Remove unavailable discovery entries rather than presenting dead-end actions.
const wechat37=renderWechat;renderWechat=function(){wechat37();if(wxTab==='discover'){screen.querySelectorAll('[data-wx19-action="scan"],[data-wx19-action="shake"],[data-wx19-action="nearby"]').forEach(b=>b.remove());screen.querySelectorAll('.wx-body>.group').forEach(g=>{if(!g.children.length)g.remove()})}};
const addMenu37=wx19AddMenu;wx19AddMenu=function(){addMenu37();screen.querySelector('[data-wx19-action="scan"]')?.remove()};
icons21.diary=face24('joy');const diaryIcon37=screen.querySelector('.desk-app-diary>.art21-icon');if(diaryIcon37)diaryIcon37.innerHTML=icons21.diary;
const css37=document.createElement('style');css37.textContent=`
:root[data-theme] #screen .wx19.chat-page .bubble.sticker-only34,:root #screen .wx19.chat-page .sticker-row37 .bubble{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;border-radius:0!important;outline:0!important}
:root #screen .wx19.chat-page .sticker-row37 .bubble:before,:root #screen .wx19.chat-page .sticker-row37 .bubble:after{display:none!important}
.sticker-row37 .sticker-message{background:none!important;border:0!important;padding:0!important;margin:0!important;box-shadow:none!important}
:root[data-theme] #screen .wx19.chat-page .message-body>.quote35{font-size:calc(var(--font27,13px) * .82)!important;line-height:1.45!important;color:var(--f-muted,#95838c)!important;background:color-mix(in srgb,var(--f-ink,#704557) 5%,white)!important;border:0!important;box-shadow:none!important;border-radius:4px;padding:5px 8px;margin:3px 0 0;max-width:100%;overflow-wrap:anywhere}
:root[data-theme] #screen .wx19 .wx-search input{padding-left:8px!important;text-indent:0!important;margin:0!important}
.crop-dialog25 canvas{border-radius:0!important}
.desk-app-diary .art21-icon>.mood-icon36{width:48px!important;height:46px!important;object-fit:contain!important}
.journal-memory37 p{white-space:pre-wrap;overflow-wrap:anywhere}
`;document.head.append(css37);
