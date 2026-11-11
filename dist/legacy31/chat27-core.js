(function(root){
 const clone=x=>JSON.parse(JSON.stringify(x));
 function clean(text,catalog=[]){
  let sticker;
  const content=String(text||'').replace(/\[\[表情包[|：:][^\]\n]*\]\]|[【\[]表情包[|：:][^】\]\n]*[】\]]/g,token=>{
   const value=token.replace(/^[\[【]+表情包[|：:]\s*/,'').replace(/[\]】]+$/,'').split(/[；;\n]|[，,]?情绪说明/)[0].trim();
   const found=catalog.find(s=>s.id===value||s.name===value);if(found&&!sticker)sticker=clone(found);return '';
  }).replace(/^\s*(?:情绪说明|用户情绪说明|表情包ID|表情包名称)\s*[:：=].*$/gm,'').trim();
  return {content,...(sticker?{sticker}:{})};
 }
 function split(text,name,actions,max,C){
  let parts=C.bubbles(clean(text).content,name,actions,max);
  if(parts.length===1){const t=parts[0],lines=t.split(/\n+/).map(s=>s.replace(/^\s*\d+[.、）)]\s*/, '').trim()).filter(Boolean);if(lines.length>1)parts=lines;
   else if(t.length>=36){const sentences=t.match(/[^。！？!?\n]+[。！？!?]+[”’"']?|[^。！？!?\n]+$/g)||[t];if(sentences.length>1)parts=sentences.map(s=>s.trim()).filter(Boolean)}
  }
  const cap=Math.max(1,Math.min(10,Number(max)||10));if(parts.length>cap)parts=[...parts.slice(0,cap-1),parts.slice(cap-1).join('\n')];return parts;
 }
 function canSee(rel,actor,m,roles,knows){return !(m.hiddenFrom27||[]).includes(actor)&&!(m.author==='me'&&roles.some(r=>r.id===actor&&r.friend27==='removed'))&&knows(rel,actor,m.author)}
 function purge(state,id,L,C){
  const s=clone(state);if(!s.roles.some(r=>r.id===id))throw Error('角色已不存在');
  for(const [cid,h]of Object.entries(s.histories))for(const m of h){const peer=m.role==='user'?(m.card?.recipient||cid):m.sender;if(peer===id&&m.card?.type==='transfer'&&['pending','sent'].includes(m.card.status)){const source={...m,card:{...m.card,recipient:peer}};const result=C.settle(s.wallet,source,false,L,Date.now());s.wallet=result.wallet;m.card.status='returned'}}
  s.worldbook=(s.worldbook||[]).filter(e=>e.roleId!==id);s.roles=s.roles.filter(r=>r.id!==id);delete s.histories[id];for(const cid of Object.keys(s.histories))s.histories[cid]=s.histories[cid].filter(m=>m.sender!==id);
  s.groups=s.groups.map(g=>({...g,members:g.members.filter(x=>x!==id),introduced:(g.introduced||[]).filter(x=>x!==id)}));
  delete s.memories[id];delete s.memories['shared:'+id];
  s.relations=s.relations.filter(r=>r.a!==id&&r.b!==id);
  s.moments=s.moments.filter(m=>m.author!==id).map(m=>{let gone=new Set((m.comments||[]).filter(c=>c.author===id).map(c=>c.id)),changed=true;while(changed){changed=false;for(const c of m.comments||[])if(gone.has(c.parentId)&&!gone.has(c.id)){gone.add(c.id);changed=true}}return {...m,comments:(m.comments||[]).filter(c=>!gone.has(c.id)),likes:(m.likes||[]).filter(x=>x!==id),mentions27:(m.mentions27||[]).filter(x=>x!==id)}});
  s.notices=s.notices.filter(n=>n.actor!==id&&n.conversationId!==id);s.feedEvents=s.feedEvents.map(e=>({...e,audience:(e.audience||[]).filter(x=>x!==id)}));
  if(s.wallet.accounts)delete s.wallet.accounts[id];if(s.wallet.kinCards)delete s.wallet.kinCards[id];s.wallet.sponsorRequests=(s.wallet.sponsorRequests||[]).map(q=>q.roleId===id&&q.status==='pending'?{...q,status:'declined'}:q);
  s.living.guests=s.living.guests.filter(x=>x!==id);delete s.living.avatars[id];s.living.jobs=(s.living.jobs||[]).filter(x=>x.roleId!==id&&x.actor!==id);s.living.events=s.living.events.filter(e=>e.speaker!==id).map(e=>({...e,audience:(e.audience||[]).filter(x=>x!==id)}));
  delete s.wx18.prefs[id];delete s.wx18.drafts[id];for(const g of Object.values(s.dissolved)){g.members=g.members.filter(x=>x!==id);g.history=g.history.filter(m=>m.sender!==id)}
  return s;
 }
 const api={clean,split,canSee,purge};root.Chat27=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
