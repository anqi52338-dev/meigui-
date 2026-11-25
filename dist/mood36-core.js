(function(root){
 const labels=['开心','兴奋','平静','心动','满足','得意','难过','大哭','疲惫','焦虑','担心','害怕','生气','暴怒','烦躁','失望','无聊','发呆','害羞','喜欢','爱意','惊讶','疑惑','灵感','孤独','困倦','治愈','期待','放松','加油'];
 const ids=['joy','excited','calm','love','content','proud','sad','cry','tired','anxious','worried','afraid','angry','furious','mad','disappointed','bored','blank','shy','like','affection','surprised','confused','inspired','lonely','sleepy','healed','hopeful','relaxed','cheer'];
 function neglected(history,day,role){const rows=history.filter(m=>new Date(m.createdAt).toLocaleDateString('sv-SE')===day&&m.kind!=='recall');const last=rows.at(-1),reason=!rows.some(m=>m.role==='user')||last?.role==='assistant'&&(last.proactive||last.proactive21);let hash=0;for(const c of day+'|'+role)hash=(Math.imul(hash,31)+c.charCodeAt(0))>>>0;return {eligible:!!reason,egg:!!reason&&hash%100<22}}
 function parse(text){let value;try{const s=text.trim().replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'');value=JSON.parse(s)}catch{throw Error('模型未返回有效的心情日记格式，请重试')}
 const index=ids.includes(value.mood)?ids.indexOf(value.mood):labels.indexOf(value.mood);if(index<0||typeof value.diary!=='string'||!value.diary.trim()||value.diary.length>3000||typeof value.message!=='string'||!value.message.trim()||value.message.length>500)throw Error('心情、日记或确认消息不完整');return {mood:ids[index],diary:value.diary.trim(),message:value.message.trim()}}
 function asks(text){return /心情日记/.test(text)&&!/(不要|别|不用|取消|不想).{0,8}(写|生成|记录|心情日记)/.test(text)}
 const api={labels,ids,neglected,parse,asks};root.Mood36=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
