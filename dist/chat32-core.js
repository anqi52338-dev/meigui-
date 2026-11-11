(function(root){
 function limit(value){const n=Number(value);if(value===''||!Number.isInteger(n)||n<0||n>520)throw Error('语音每日额度须为0–520的整数');return n}
 function voiceEligible(m){return m?.role==='assistant'&&m.content?.trim()&&m.content.length<=600&&!m.media&&!m.card&&!m.kin&&!m.receipt26&&!m.sticker&&m.kind!=='recall'&&!!m.voiceRequested32}
 function menu(m){if(m.kind==='recall')return [];if(m.role==='user')return ['recall','edit'];return ['copy','quote','delete','favorite',...(!m.card&&!m.kin&&!m.receipt26?['regenerate']:[]),...(m.media?.type==='voice'?['transcribe']:[])]}
 function viewport(height,vheight,offset=0){return Math.max(120,Math.round(Math.min(height,vheight+offset)))}
 const api={limit,voiceEligible,menu,viewport};root.Chat32=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
