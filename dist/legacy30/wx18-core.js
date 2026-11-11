(function(root){
 const api={
  label(r,prefs){return prefs[r.id]?.remark||r.name},
  unread(id,notices){return notices.filter(n=>n.type==='chat'&&n.conversationId===id&&!n.read)},
  sort(items,prefs,histories){return items.slice().sort((a,b)=>Number(!!prefs[b.id]?.pinned)-Number(!!prefs[a.id]?.pinned)||(histories[b.id]?.at(-1)?.createdAt||0)-(histories[a.id]?.at(-1)?.createdAt||0))},
  canRecall(m,now){return m.role==='user'&&!m.card&&!m.kin&&m.kind!=='recall'&&now-m.createdAt<=120000},
  recall(m,now){if(!this.canRecall(m,now))throw Error('仅可撤回两分钟内的普通消息');return {id:m.id,role:m.role,createdAt:m.createdAt,audience:m.audience,kind:'recall',content:'你撤回了一条消息',reedit:m.media?'':m.content}},
  entry(data,id,now){const date=String(data.date||'');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date)throw Error('请选择日期');const title=String(data.title||'').trim(),text=String(data.text||'').trim();if(!title||title.length>80||text.length>20000)throw Error('标题 1–80 字，正文不超过 20000 字');return {id,date,title,text,weather:String(data.weather||'晴').slice(0,12),mood:String(data.mood||'平静').slice(0,12),updatedAt:now}},
  seconds(ms){const s=Math.floor(Math.max(0,ms)/1000);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')},
  holiday(date){return {'01-01':'元旦','05-01':'劳动节','06-01':'儿童节','10-01':'国庆节','12-25':'圣诞节'}[date.slice(5)]||''}
 };root.PalaisWX18=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
