(function(root){
function key(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function date(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))throw Error('日期无效');const d=new Date(s+'T12:00:00');if(key(d)!==s)throw Error('日期无效');return d}
function add(s,n){const d=date(s);d.setDate(d.getDate()+n);return key(d)}
function water(rows,day,id){date(day);if(rows.some(x=>x.id===id))return rows;return [...rows,{id,date:day}]}
function undo(rows,day){const i=rows.findLastIndex(x=>x.date===day);return i<0?rows:rows.filter((_,n)=>n!==i)}
function stats(rows,day,days){const start=add(day,1-days),counts={};for(const r of rows)if(r.date>=start&&r.date<=day)counts[r.date]=(counts[r.date]||0)+1;return {total:Object.values(counts).reduce((a,b)=>a+b,0),counts,start}}
function cycle(rows,fallback=28,length=5){const sorted=rows.slice().sort((a,b)=>a.start.localeCompare(b.start)),gaps=sorted.slice(1).map((r,i)=>Math.round((date(r.start)-date(sorted[i].start))/86400000)).filter(x=>x>=15&&x<=90),average=gaps.length?Math.round(gaps.slice(-6).reduce((a,b)=>a+b,0)/gaps.slice(-6).length):fallback,last=sorted.at(-1);return {average,gaps,last,next:last?add(last.start,average):null,length}}
const api={key,date,add,water,undo,stats,cycle};root.Fresh24=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
