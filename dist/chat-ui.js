(function(root){
 function stamp(message){if(!message?.createdAt)return null;const d=new Date(message.createdAt);if(!Number.isFinite(d.getTime()))return null;return {iso:d.toISOString(),date:d.toLocaleDateString('zh-CN',{month:'long',day:'numeric'}),time:d.toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false})}}
 const api={stamp};root.PalaisChatUI=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
function chatStampHTML(m){const t=PalaisChatUI.stamp(m);return t?`<time class="chat-stamp" datetime="${t.iso}">${escapeHtml(t.date)}<small>${escapeHtml(t.time)}</small></time>`:''}
