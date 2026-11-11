(function(root){
 const MAX=2*1024*1024;
 function parse(text,name){
  text=String(text).replace(/^\uFEFF/,'').trim();if(!text)throw Error('文件内容为空');if(text.length>MAX)throw Error('单个文件最多2MB');
  let rows;
  if(/\.txt$/i.test(name)){rows=[];let rest=text;while(rest){let end=Math.min(8000,rest.length);if(/[\uD800-\uDBFF]/.test(rest[end-1]))end--;rows.push({name:name.replace(/\.txt$/i,'')+(rows.length?' · '+(rows.length+1):''),content:rest.slice(0,end),constant:true});rest=rest.slice(end)}}
  else{
   let data;try{data=JSON.parse(text)}catch{throw Error('JSON格式有误，请检查文件')}
   rows=Array.isArray(data)?data:Array.isArray(data?.worldbook)?data.worldbook:data?.character_book?.entries??data?.entries;
   if(rows&&typeof rows==='object'&&!Array.isArray(rows))rows=Object.values(rows);
   if(!Array.isArray(rows))throw Error('未找到世界书条目，支持entries、character_book.entries及条目数组');
  }
  if(!rows.length||rows.length>500)throw Error('文件需包含1–500个条目');
  return rows.map((e,i)=>{
   if(!e||typeof e!=='object'||typeof e.content!=='string'||!e.content.trim())throw Error('第'+(i+1)+'条缺少背景内容');
   const content=e.content.trim();if(content.length>8000)throw Error('第'+(i+1)+'条超过8000字，请先拆分');
   const raw=e.keys??e.key??'',keys=(Array.isArray(raw)?raw.map(String).join(','):String(raw)).trim();if(keys.length>500)throw Error('第'+(i+1)+'条关键词超过500字');
   const advanced=!!(e.selective||e.use_regex||e.matchWholeWords||e.extensions?.selectiveLogic||e.extensions?.useProbability);
   const mode=e.mode==='always'||e.constant===true||e.constant===undefined&&e.mode!=='keywords'&&!keys?'always':'keywords';if(mode==='keywords'&&!keys)throw Error('第'+(i+1)+'条使用关键词触发，但没有关键词');
   return {name:String(e.name||e.comment||'导入条目 '+(i+1)).slice(0,60),content,keys,mode,enabled:e.enabled!==false&&e.disable!==true&&!advanced,advanced};
  });
 }
 function merge(old,rows,scope,target,id){
  if(!['global','local'].includes(scope)||scope==='local'&&!/^(role|group):.+/.test(target))throw Error('请选择有效的导入范围与局部对象');
  const signature=e=>JSON.stringify([e.name,e.content,e.keys||'',e.mode,e.scope||((e.roleId||e.groupId)?'local':'global'),e.roleId||'',e.groupId||'']);
  const known=new Set(old.map(signature)),next=old.slice();let added=0;
  for(const row of rows){const {advanced,...entry}=row;Object.assign(entry,{scope,roleId:scope==='local'&&target.startsWith('role:')?target.slice(5):'',groupId:scope==='local'&&target.startsWith('group:')?target.slice(6):''});if(entry.mode==='keywords'&&!entry.keys)entry.mode='always';const k=signature(entry);if(known.has(k))continue;known.add(k);next.push({...entry,id:id()});added++}
  return {next,added,skipped:rows.length-added};
 }
 function separate(m){return !!(m.sticker?.custom&&m.kind!=='recall')}
 const api={MAX,parse,merge,separate};root.Book34=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
