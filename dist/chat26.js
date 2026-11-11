/* Chat reliability, explicit message actions, staged stickers and transfer receipts. */
let style26=read('palais.chatStyle26',{actions:false,bubbles:10});
const staged26=new Map();
let active26=null;
request=async function(c,messages,max_tokens=1024,signal){
  if(!signal&&active26&&typeof messages[0]?.content==='string'&&messages[0].content.includes('你是对话长期记忆整理器'))signal=active26.controller.signal;
  const body={model:c.model,messages,stream:false,max_tokens};
  for(let attempt=0;attempt<2;attempt++){
    const res=await fetch(endpoint(c.base),{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+c.key},body:JSON.stringify(body),signal:signal?AbortSignal.any([signal,AbortSignal.timeout(45000)]):AbortSignal.timeout(45000)});
    let data;try{data=await res.json()}catch{throw Error('接口未返回 JSON（HTTP '+res.status+'），请检查接口地址')}
    if(!res.ok){const reason=data?.error?.message||data?.message||res.statusText;
      if(attempt===0&&[400,422].includes(res.status)&&/max_tokens/i.test(reason)&&/unsupported|not supported|not allowed|max_completion_tokens/i.test(reason)){body.max_completion_tokens=body.max_tokens;delete body.max_tokens;continue}
      throw Error('HTTP '+res.status+' · '+String(reason).slice(0,400));
    }
    return Chat26.output(data);
  }
};
function stylePrompt26(){return '\n你们在手机微信远程聊天，不是面对面。不要输出自己的名字、[名字]或说话人标签。'+(style26.actions?'允许用括号描写适量动作。':'只输出真实微信式聊天内容，禁止括号动作、舞台说明和旁白。')+'一次自然回复1–'+Math.min(10,Math.max(1,style26.bubbles||10))+'个气泡；按需要分条，不要凑数量。不同气泡用 [[气泡]] 隔开，不要编号。'}
function pendingPrompt26(hist,id){const a=hist.filter(m=>m.role==='user'&&m.card?.type==='transfer'&&['pending','sent'].includes(m.card.status)&&m.card.recipient===id);return a.length?'\n以下是用户给你的待处理转账。按人设决定是否收款或退回；只说收款不会操作余额，必须附上控制指令 [[收款|消息ID]] 或 [[退回转账|消息ID]]。不要操作不属于你的转账。\n'+a.map(m=>m.id+'：¥'+m.card.amount).join('\n'):''}
async function send26(r,value,card=null,options={}){
  if(!value||busy||phoneLocked)return false;
  if(!r.members&&!r.file&&r.friend27==='removed'){toast('请先重新添加这位微信好友');return false}
  if(options.sticker?.custom&&!customAvailable().some(s=>s.id===options.sticker.id)){toast('当前模型尚未通过识图检测，请换用基础表情包');return false}
  const hist=histories[r.id]||(histories[r.id]=[]),user={id:crypto.randomUUID(),role:'user',content:value,createdAt:Date.now(),...(r.members?{audience:r.members.slice()}:{}),...(card?{card}:{}),...(options.sticker?{sticker:options.sticker}:{}),...(options.extra||{})},oldWallet=wallet;
  try{if(card)wallet=outgoingMoney(r,user);hist.push(user);persist()}catch(e){if(hist.at(-1)===user)hist.pop();wallet=oldWallet;toast(e.message);return false}
  staged26.delete(r.id);
  if(!apiReady()){render();toast('消息已保存，连接 API 后可点「重新生成」');return true}
  await reply26(r,user,null,false,options);return true;
}
async function reply26(r,user,selected=null,retry=false,options={}){
  if(busy||phoneLocked)return false;if(!apiReady()){toast('请先连接聊天 API');return false}
  const id=r.id,hist=histories[id]||[],index=hist.findIndex(m=>m.id===user.id);if(index<0||user.kind==='recall')return false;
  busy=true;controller=new AbortController();const signal=controller.signal,timer=setTimeout(()=>signal.aborted||controller?.abort(),180000);let ok=true;
  const candidates=(r.members?r.members.map(id=>roles.find(x=>x.id===id)).filter(Boolean):[r]).filter(x=>!options.intro||!(r.introduced||[]).includes(x.id));
  let speakers=selected?candidates.filter(s=>s.id===selected):candidates;
  if(retry&&!selected){const missing=speakers.filter(s=>!hist.some(m=>m.replyTo26===user.id&&m.sender===s.id&&m.kind!=='recall'));if(missing.length)speakers=missing}
  const job={id,userId:user.id,controller};active26=job;wxTypingId=id;render();
  try{
    if(signal.aborted)return false;await consolidate(id);if(signal.aborted)return false;if(!r.members)await consolidate('shared:'+id);
    for(const speaker of speakers){
      if(signal.aborted||phoneLocked||user.kind==='recall'||!hist.includes(user))break;wxTypingId=id;
      try{
        const after=hist.slice(index+1).findIndex(m=>m.role==='user'&&!m.receipt26),end=after<0?hist.length:index+1+after;
        const oldReplies=hist.filter((m,i)=>m.role==='assistant'&&!m.receipt26&&(m.replyTo26===user.id||!m.replyTo26&&i>index&&i<end)&&(m.sender===speaker.id||!m.sender&&!r.members));
        const visible=(r.members?groupSeen(r,speaker.id):hist).filter(m=>hist.indexOf(m)<end&&(!retry||!oldReplies.includes(m))&&m.kind!=='recall');
        const system=PalaisCore.systemPrompt(speaker,worldbook,visible,id)+'\n'+(r.members?groupMemory(r,speaker.id):memoryPrompt(id)+'\n'+sharedContext(speaker.id))+'\n'+relationshipPrompt(speaker.id)+homeRelationshipPrompt(speaker.id,r.members)+(r.members?'':musicPrompt(speaker.id))+(r.members||typeof friendPrompt27!=='function'?'':friendPrompt27(speaker))+'\n用户称呼：'+profile.name+(r.members?'\n你在群聊「'+r.name+'」，成员：'+candidates.map(x=>x.name).join('、')+'。只扮演自己，未公开的私聊不能泄露。'+(options.intro?'请按自己人设自我介绍。':'自然回应最近消息。'):'')+moneyPrompt(speaker.id)+stylePrompt26()+(retry&&oldReplies.length?'\n本次仅重新生成文字，禁止发起新的转账、红包、亲属卡或处理收款。':pendingPrompt26(visible,speaker.id));
        const raw=await request({...config,key},await buildChatMessages(system,visible.slice(-40)),/reason|think|deepseek-r|o[134]/i.test(config.model)?4096:2048,signal);
        if(signal.aborted||phoneLocked||user.kind==='recall'||!hist.includes(user))throw new DOMException('Stopped','AbortError');
        const commands=[];const text=raw.replace(/\[\[(收款|退回转账)\|([^\]\n]+)\]\]/g,(_,a,b)=>{commands.push([a,b]);return ''});
        const parsed=text.trim()?prepareLivingReply(text):{content:''};
        if(retry&&oldReplies.length){delete parsed.card;delete parsed.kin}
        const chunks=(typeof Chat27==='undefined'?Chat26.bubbles:Chat27.split)(parsed.content,speaker.name,style26.actions,style26.bubbles,Chat26);if(!chunks.length&&!parsed.sticker&&!parsed.card&&!commands.length)throw Error('模型只返回了动作或空内容，请重新生成');
        if(!chunks.length&&(parsed.sticker||parsed.card))chunks.push('');
        const batch=crypto.randomUUID(),replies=chunks.map((content,i)=>({id:crypto.randomUUID(),role:'assistant',sender:speaker.id,createdAt:retry?(oldReplies[0]?.createdAt||user.createdAt)+i:Date.now()+i,replyTo26:user.id,batch26:batch,...(r.members?{audience:r.members.slice()}:{}),...(i===0?parsed:{}),content}));
        const oldHist=hist.slice(),oldWallet=wallet;
        try{
          if(replies[0])wallet=reserveRoleMoney(replies[0]);
          if(retry)for(let i=hist.length-1;i>=0;i--)if(oldReplies.includes(hist[i])&&!hist[i].card&&!hist[i].kin&&!hist[i].receipt26)hist.splice(i,1);
          // Insert retries at the original turn, before any later user messages.
          const nextUser=hist.findIndex((m,i)=>i>hist.indexOf(user)&&m.role==='user'&&!m.receipt26);
          hist.splice(nextUser<0?hist.length:nextUser,0,...replies);delete user.errors26?.[speaker.id];persist();
        }catch(e){hist.splice(0,hist.length,...oldHist);wallet=oldWallet;throw e}
        if(!retry||!oldReplies.length)for(const [a,msgId]of commands){const target=hist.find(m=>m.id===msgId&&m.role==='user'&&m.card?.recipient===speaker.id);if(target)try{settle26(r,target,a==='收款')}catch(e){toast(e.message)}}
        if(options.intro){r.introduced=[...new Set([...(r.introduced||[]),speaker.id])];saveSocial()}
        for(const reply of replies)incomingMessage(r,speaker,reply);
      }catch(e){ok=false;if(signal.aborted||user.kind==='recall'||!hist.includes(user))break;reportVisionFailure(e);user.errors26={...(user.errors26||{}),[speaker.id]:friendly(e)};try{persist()}catch{};toast(speaker.name+'：'+friendly(e));if(signal.aborted)break}
      if(isChatView()&&current===id)renderConversation();
    }
  }catch(e){ok=false;if(!signal.aborted&&user.kind!=='recall'&&hist.includes(user)){toast(friendly(e));user.errors26={...(user.errors26||{}),system:friendly(e)};try{persist()}catch{}}}
  finally{clearTimeout(timer);busy=false;controller=null;wxTypingId=null;if(active26===job)active26=null;render();if(!signal.aborted)memoryTick()}
  return ok;
}
const outgoing26=outgoingMoney;
outgoingMoney=function(r,m){if(m.card.type!=='transfer')return outgoing26(r,m);const peer=r.members?m.card.recipient:r.id;if(!roles.some(s=>s.id===peer)||r.members&&!r.members.includes(peer))throw Error('请选择有效的收款人');m.card.recipient=peer;const n=PalaisLiving.normalize(wallet),cents=PalaisWallet.cents(m.card.amount);if(n.roleTransfers.some(x=>x.id===m.id))return n;if(n.balance<cents)throw Error('零钱余额不足');n.balance-=cents;n.ledger.push({id:m.id,messageId:m.id,type:'transfer',delta:-cents,balance:n.balance,peer:roles.find(x=>x.id===peer).name,note:m.card.note,createdAt:m.createdAt});n.roleTransfers.push({id:m.id,cents,sender:peer,status:'reserved-user'});return n};
function settle26(r,m,accept){
  if(busy&&m.role!=='user')throw Error('请等待回复结束后再操作');
  const normalized=m.card.recipient||r.id,source=m.role==='user'?{...m,card:{...m.card,recipient:normalized}}:m;
  const result=Chat26.settle(wallet,source,accept,PalaisLiving,Date.now());if(!result.changed)return;
  const hist=histories[r.id],oldWallet=wallet,oldCard=m.card;
  const receipt={id:crypto.randomUUID(),role:m.role==='user'?'assistant':'user',...(m.role==='user'?{sender:result.peer}:{}),createdAt:Date.now(),receipt26:true,content:accept?'已收款':'已退回',...(r.members?{audience:r.members.slice()}:{}),card:{...m.card,status:result.status}};
  try{wallet=result.wallet;m.card={...m.card,status:result.status};hist.push(receipt);persist()}catch(e){wallet=oldWallet;m.card=oldCard;hist.pop();throw e}
  if(receipt.role==='assistant'){const speaker=roles.find(s=>s.id===result.peer);if(speaker)incomingMessage(r,speaker,receipt)}
  if(isChatView()&&current===r.id)renderConversation();
}
const receive26=receiveGift;receiveGift=function(r,m){if(m.card?.type!=='transfer')return receive26(r,m);try{settle26(r,m,true)}catch(e){toast(e.message)}};
const moneyBubble26=wx19MoneyBubble;wx19MoneyBubble=function(el,r,m){if(m.card.type!=='transfer')return moneyBubble26(el,r,m);const box=el.querySelector('.bubble'),c=m.card,done=['received','returned'].includes(c.status),label=c.status==='returned'?'已退回':c.status==='received'?'已收款':m.role==='assistant'?'待收款':'待对方收款';box.classList.add('wx19-money-wrap');box.innerHTML=`<button class="b-tf tail ${done?'done':''}"><div class="cd-top"><span class="money-icon">${wx19Icon(done?'check':'tf',32)}</span><div><div class="ttl">¥${escapeHtml(c.amount)}</div><small>${label}</small></div></div><div class="cd-bot">微信转账 · ${label}</div></button>`;box.firstChild.onclick=()=>{const d=wx19Sheet(`<h2>${label}</h2><p>¥${escapeHtml(c.amount)}</p>${!done&&m.role==='assistant'&&!m.receipt26?'<button class="primary full" id="accept26">确认收款</button><button class="secondary full" id="return26">退回转账</button>':''}`);for(const [id,yes]of [['accept26',true],['return26',false]])document.getElementById(id)?.addEventListener('click',()=>{try{settle26(r,m,yes);d.close()}catch(e){toast(e.message)}})}};
function withdraw26(r,m){if(busy){toast('请等待回复结束');return}if(m.card||m.kin||m.receipt26){toast('收付款卡片不能撤回，请使用收款或退回');return}const h=histories[r.id],i=h.indexOf(m),replacement={id:m.id,role:m.role,sender:m.sender,audience:m.audience,createdAt:m.createdAt,kind:'recall',content:m.role==='user'?'你撤回了一条消息':'对方撤回了一条消息',reedit:m.role==='user'&&!m.media?m.content:''};h[i]=replacement;try{persist();renderConversation()}catch(e){h[i]=m;toast(e.message)}}
function regen26(r,m){if(busy)return;if((m.role==='assistant'&&(m.card||m.kin))||m.receipt26){toast('收付款消息不重复生成，避免重复交易');return}const h=histories[r.id],i=h.indexOf(m),user=m.role==='user'?m:h.find(x=>x.id===m.replyTo26)||h.slice(0,i).reverse().find(x=>x.role==='user'&&x.kind!=='recall'&&!x.receipt26);if(!user)return toast('找不到对应的用户消息');reply26(r,user,m.role==='assistant'?(m.sender||r.id):null,true).catch(e=>toast(e.message))}
wx19StickerGrid=function(r,panel){const all=[...basicStickers,...customAvailable()];panel.querySelector('.emo-grid').innerHTML=all.map((s,i)=>`<button data-inline-sticker="${i}" title="${escapeHtml(s.name)}">${s.custom?`<img src="${escapeHtml(mediaCache.get('sticker:'+s.id)||'')}" alt="${escapeHtml(s.name)}">`:escapeHtml(s.emoji||'🌷')}</button>`).join('');panel.querySelectorAll('[data-inline-sticker]').forEach(b=>b.onclick=()=>{const s=all[Number(b.dataset.inlineSticker)];staged26.set(r.id,s);wx19.panel=null;const text=$('#composer textarea').value;renderConversation();$('#composer textarea').value=text;$('#composer textarea').dispatchEvent(new Event('input'))})};
const chat26Prior=renderConversation;renderConversation=function(){chat26Prior();const r=findConversation(current);if(!r)return;const h=(histories[r.id]||[]).filter(m=>m.kind!=='pat'),rows=[...screen.querySelectorAll('#messages .msg')];rows.forEach((el,i)=>{const m=h[i];if(!m||m.kind==='recall')return;const tools=document.createElement('div');tools.className='message-actions26';for(const [label,fn]of [['撤回',()=>withdraw26(r,m)],['重新生成',()=>regen26(r,m)]]){const b=document.createElement('button');b.textContent=label;b.type='button';b.disabled=(busy&&label!=='撤回')||!!m.receipt26||r.file&&label==='重新生成'; b.onclick=fn;tools.append(b)}el.querySelector('.message-body')?.append(tools);if(m.errors26&&Object.keys(m.errors26).length){const e=document.createElement('small');e.className='reply-error26';e.textContent=Object.entries(m.errors26).map(([id,t])=>(roles.find(s=>s.id===id)?.name||'角色')+'：'+t).join('；');el.querySelector('.message-body')?.append(e)}});
  const s=staged26.get(r.id),form=$('#composer');if(!form)return;const input=form.querySelector('textarea'),oldSubmit=form.onsubmit,oldInput=input.oninput;
  if(s){const preview=document.createElement('div');preview.className='staged26';preview.innerHTML=`<span>${escapeHtml(s.name)} · 将随消息发送</span><button type="button" aria-label="移除表情包">×</button>`;if(s.custom){const img=document.createElement('img');img.src=mediaCache.get('sticker:'+s.id)||'';preview.prepend(img)}else preview.prepend(document.createTextNode(s.emoji||'🌷'));preview.lastChild.onclick=()=>{const text=input.value;staged26.delete(r.id);renderConversation();$('#composer textarea').value=text;$('#composer textarea').dispatchEvent(new Event('input'))};$('.chat-bar').prepend(preview)}
  input.oninput=()=>{oldInput?.();if(staged26.has(r.id)&&!busy)$('#send').hidden=false};if(s&&!busy)$('#send').hidden=false;
  form.onsubmit=e=>{if(!staged26.has(r.id))return oldSubmit(e);e.preventDefault();const sticker=staged26.get(r.id);if(!busy)sendMessage(r,input.value.trim()||'[表情包：'+sticker.name+']',null,{sticker})};
};
const api26Prior=renderApi;renderApi=function(){api26Prior();const section=document.createElement('section');section.className='auto21';section.innerHTML=`<h3>微信回复方式</h3><form id="style26"><label class="check"><input name="actions" type="checkbox" ${style26.actions?'checked':''}>允许括号动作描写</label><label>单次最多气泡数（1–10）<input name="bubbles" type="number" min="1" max="10" required value="${Math.min(10,Math.max(1,style26.bubbles||10))}"></label><p class="api-note">默认纯微信文字，不带角色名或动作。气泡按内容自然拆分。测试连接仅代表短请求可用；群聊会逐个请求角色，失败可单独重试。</p><button class="primary">保存回复方式</button></form>`;screen.querySelector('.view').append(section);$('#style26').onsubmit=e=>{e.preventDefault();const next={actions:e.target.actions.checked,bubbles:Math.min(10,Math.max(1,Number(e.target.bubbles.value)||10))};try{localStorage.setItem('palais.chatStyle26',JSON.stringify(next));style26=next;toast('回复方式已保存')}catch(e){toast(e.message)}}};
function reset26(){const d=wxPanel('<h2>恢复出厂设置</h2><p>将清空此网址的小手机全部数据：角色、聊天、长期记忆、日历、家园、余额、图片、录音和歌曲。清空后无法撤销。</p><button class="secondary full" id="backup26">先导出完整搬家备份</button><label>确认清空请输入「清空全部数据」<input id="phrase26" autocomplete="off"></label><button class="primary full" id="reset26" disabled>清空全部数据并重启</button>');$('#backup26').onclick=()=>run22(()=>export22(false));$('#phrase26').oninput=()=>{$('#reset26').disabled=$('#phrase26').value!=='清空全部数据'};$('#reset26').onclick=()=>run22(async()=>{if($('#phrase26').value!=='清空全部数据')return;if(busy||socialBusy||memoryBusy||livingChatBusy||auto21Busy)throw Error('请等待当前生成完成后再清空');await restoreBackup22({local:{},media:[],songs:[]});location.reload()})}
for(const name of ['renderMe','renderWxMe']){const old=name==='renderMe'?renderMe:renderWxMe;const next=function(){old();const b=document.createElement('button');b.className='menu-button reset26';b.textContent='恢复出厂设置 · 清空全部数据';b.onclick=reset26;(screen.querySelector('.view,.wx19')||screen).append(b)};if(name==='renderMe')renderMe=next;else renderWxMe=next}
const dots26=notificationDots;notificationDots=function(){dots26();document.querySelector('.dock [data-wx="chat"]')?.classList.remove('has-news');document.querySelector('.dock [data-wx="discover"]')?.classList.toggle('has-news',PalaisNotice.feedUnread(notices)>0)};
const feedRender26=renderMoments;renderMoments=function(){feedRender26();screen.querySelectorAll('[data-tools21]').forEach(b=>{const old=b.onclick;b.onclick=()=>{old();const p=screen.querySelector('.tools21'),m=moments.find(x=>x.id===b.dataset.tools21);if(!p||!m)return;const more=document.createElement('button');more.textContent='请角色互动';more.onclick=()=>{p.remove();if(!apiReady())return toast('请先连接聊天 API');queueInteractions(m,null,true)};p.append(more)}})};
render();
