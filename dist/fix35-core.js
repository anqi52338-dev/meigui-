(function(root){
 const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 function recipients(text,people,quote){
  if(/@(?:所有人|全体成员)(?=\s|$|[，。！？、,:：;；!?])/.test(text))return people.map(p=>p.id);
  const ids=people.filter(p=>[p.name,p.remark].filter(Boolean).some(n=>new RegExp('@'+escape(n)+'(?=\\s|$|[，。！？、,:：;；!?])').test(text))).map(p=>p.id);
  return ids.length?ids:quote?.sender&&people.some(p=>p.id===quote.sender)?[quote.sender]:[];
 }
 function clean(text,self,people){
  return String(text).replace(/\[\[气泡\]\]/g,'\n[[气泡]]\n').replace(/^\s*[【\[]([^\]】\n]{1,60})[】\]]\s*[:：]?\s*/gm,(whole,label)=>{
   const name=label.replace(/^回复\s*/,'').trim();if([self.name,self.remark,'assistant'].includes(name))return '';
   const target=people.find(p=>[p.name,p.remark].includes(name));return target?'@'+target.name+' ':whole;
  });
 }
 function seen(list,ids){const set=new Set(ids);return list.map(n=>set.has(n.id)&&n.type!=='chat'?{...n,read:true}:n)}
 function incompatible(message){if(/image.{0,30}assistant|assistant.{0,30}image/i.test(message))return false;return /HTTP (400|415|422)/.test(message)&&/(does not support|not supported|unsupported|不支持).{0,60}(image|vision|image_url|图片|多模态)|(image|vision|image_url|图片|多模态).{0,60}(does not support|not supported|unsupported|不支持)/i.test(message)}
 function messages(rows){return rows.map(m=>m.role==='assistant'&&Array.isArray(m.content)&&m.content.some(p=>p.type==='image_url')?{...m,content:m.content.filter(p=>p.type==='text').map(p=>typeof p.text==='string'?p.text:p.text?.value||'').join('\n')||'[角色发送了一张图片]'}:m)}
 const api={recipients,clean,seen,incompatible,messages};root.Fix35=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
