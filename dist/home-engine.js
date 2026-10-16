(function(root){
 const crops={radish:{name:'樱桃萝卜',icon:'🌱',fruit:'🍒',time:60000,cost:2,reward:14},carrot:{name:'奶油胡萝卜',icon:'🥕',fruit:'🥕',time:300000,cost:5,reward:30},berry:{name:'玫瑰草莓',icon:'🍓',fruit:'🍓',time:900000,cost:10,reward:60}};
 const clothes={rose:{name:'玫瑰初见',color:'#e8a9b9',price:0},mint:{name:'薄荷茶会',color:'#a3c9bc',price:60},lilac:{name:'紫藤舞会',color:'#b8a4cf',price:100},gold:{name:'香槟公主',color:'#d8b76e',price:160}};
 const day=t=>new Date(t).getFullYear()+'-'+new Date(t).getMonth()+'-'+new Date(t).getDate();
 function create(now=Date.now()){return {version:1,points:40,avatar:{skin:'#ffe2cc',hair:'#765345',style:'long',outfit:'rose'},owned:['rose'],pet:null,partner:'',plots:Array.from({length:4},()=>null),daily:{day:day(now),care:0,water:0,harvest:0,stolen:[],claimed:[]},log:[],position:{x:48,y:59}}}
 function normalize(s,now){if(!s||s.version!==1)return create(now);if(s.daily.day!==day(now))s.daily={day:day(now),care:0,water:0,harvest:0,stolen:[],claimed:[]};return s}
 function needs(p,now){const decay=Math.max(0,now-p.updated)/3600000*3;return {food:Math.max(0,Math.round(p.food-decay)),clean:Math.max(0,Math.round(p.clean-decay)),joy:Math.max(0,Math.round(p.joy-decay))}}
 function ready(p,now){return !!(p&&p.watered&&now-p.planted>=crops[p.crop].time)}
 function apply(original,a,now=Date.now()){
  const s=normalize(JSON.parse(JSON.stringify(original)),now),d=s.daily;let message='';
  const pay=n=>{if(s.points<n)throw Error('积分不够，先去完成任务或收获蔬菜吧');s.points-=n};
  if(a.type==='avatar'){if(!['#ffe2cc','#e7b99b','#bd896e'].includes(a.skin)||!['#765345','#302d39','#c9a16c'].includes(a.hair)||!['long','short'].includes(a.style))throw Error('请选择提供的外观');s.avatar={...s.avatar,skin:a.skin,hair:a.hair,style:a.style};message='新造型已保存'}
  else if(a.type==='wear'){const c=clothes[a.id];if(!c)throw Error('服装不存在');if(!s.owned.includes(a.id)){pay(c.price);s.owned.push(a.id)}s.avatar.outfit=a.id;message='换上了'+c.name}
  else if(a.type==='partner'){s.partner=String(a.id||'');message='共同养育伙伴已保存'}
  else if(a.type==='adopt'){if(s.pet)throw Error('你已经有一位小伙伴啦');if(!['cat','bunny','dog'].includes(a.kind))throw Error('请选择宠物');s.pet={kind:a.kind,name:String(a.name||'奶糖').trim().slice(0,12)||'奶糖',born:now,updated:now,food:65,clean:65,joy:65,xp:0,last:{}};message='欢迎'+s.pet.name+'回家'}
  else if(a.type==='care'){if(!s.pet)throw Error('先领养一只宠物吧');if(!['food','clean','joy'].includes(a.kind))throw Error('请选择照料方式');const p=s.pet,k=a.kind,stamp=p.last[k];if(stamp!==undefined&&now-stamp<60000)throw Error('刚刚照料过，过一分钟再来吧');Object.assign(p,needs(p,now));if(p[k]>=95)throw Error('这个状态已经很好，试试别的互动吧');p[k]=Math.min(100,p[k]+30);p.updated=now;p.last[k]=now;p.xp+=10;d.care++;message=(a.actor||'你')+'和'+p.name+({food:'一起吃了点心',clean:'洗了香香的泡泡浴',joy:'开心地玩了一会儿'}[k])}
  else if(a.type==='plant'){if(!Number.isInteger(a.index)||a.index<0||a.index>3||s.plots[a.index])throw Error('请选一块空地');if(!crops[a.crop])throw Error('请选择种子');pay(crops[a.crop].cost);s.plots[a.index]={crop:a.crop,planted:now,watered:false};message='种下了'+crops[a.crop].name+'，记得浇水'}
  else if(a.type==='water'){const p=s.plots[a.index];if(!p)throw Error('先种下种子');if(p.watered)throw Error('土壤已经湿润啦');p.watered=true;d.water++;message='小苗喝到了水'}
  else if(a.type==='harvest'){const p=s.plots[a.index];if(!ready(p,now))throw Error('浇水后等待成熟再收获吧');s.points+=crops[p.crop].reward;s.plots[a.index]=null;d.harvest++;message='收获'+crops[p.crop].name+'，获得 '+crops[p.crop].reward+' 积分'}
  else if(a.type==='steal'){if(!a.id||d.stolen.includes(a.id)||d.stolen.length>=3)throw Error('这块菜园今天已摘过，或今日已摘满三次');d.stolen.push(a.id);s.points+=8;message='从虚拟角色菜园摘到一篮蔬菜，获得 8 积分'}
  else if(a.type==='claim'){const tasks={visit:[true,10],care:[d.care>=2,20],water:[d.water>=2,15],harvest:[d.harvest>=1,20]};const t=tasks[a.id];if(!t||!t[0]||d.claimed.includes(a.id))throw Error('任务尚未完成或已经领取');d.claimed.push(a.id);s.points+=t[1];message='任务奖励 +'+t[1]+' 积分'}
  else throw Error('暂不支持这个操作');
  s.log.unshift({at:now,text:message});s.log=s.log.slice(0,30);return {state:s,message};
 }
 const api={crops,clothes,create,normalize,needs,ready,apply};root.PalaisHome=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
