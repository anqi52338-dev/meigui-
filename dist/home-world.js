(function(root){
 const maps={garden:{width:1100,height:1000,spawn:{x:535,y:500},door:{x:535,y:402},blocks:[{x:357,y:120,w:356,h:263},{x:70,y:660,w:210,h:158}]},inside:{width:800,height:720,spawn:{x:400,y:580},door:{x:400,y:636},blocks:[{x:82,y:155,w:194,h:100},{x:495,y:155,w:205,h:96},{x:520,y:370,w:155,h:84},{x:75,y:385,w:140,h:90}]}};
 function valid(room,p){const m=maps[room];return !!m&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=30&&p.y>=50&&p.x<=m.width-30&&p.y<=m.height-35&&!m.blocks.some(b=>p.x>b.x-13&&p.x<b.x+b.w+13&&p.y>b.y-8&&p.y<b.y+b.h+12)}
 function move(room,p,dx,dy){let n={...p};if(valid(room,{x:n.x+dx,y:n.y}))n.x+=dx;if(valid(room,{x:n.x,y:n.y+dy}))n.y+=dy;return n}
 function path(room,from,to){const m=maps[room],step=20,cols=Math.ceil(m.width/step),rows=Math.ceil(m.height/step),cell=p=>({x:Math.round(p.x/step),y:Math.round(p.y/step)}),key=p=>p.y*cols+p.x,start=cell(from);let end=cell(to);const free=p=>p.x>=0&&p.y>=0&&p.x<cols&&p.y<rows&&valid(room,{x:p.x*step,y:p.y*step});
  if(!free(end)){let best=null,dist=Infinity;for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const p={x,y},d=(x-end.x)**2+(y-end.y)**2;if(free(p)&&d<dist){best=p;dist=d}}end=best}if(!end)return [];
  const queue=[start],seen=new Set([key(start)]),parents=new Map();let found=false;for(let at=0;at<queue.length;at++){const p=queue[at];if(key(p)===key(end)){found=true;break}for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const n={x:p.x+dx,y:p.y+dy},k=key(n);if(free(n)&&!seen.has(k)){seen.add(k);parents.set(k,p);queue.push(n)}}}if(!found)return [];const points=[];let p=end;while(key(p)!==key(start)){points.push({x:p.x*step,y:p.y*step});p=parents.get(key(p));if(!p)return []}return points.reverse();
 }
 function camera(room,p,width,height){const m=maps[room];return {x:Math.max(0,Math.min(m.width-width,p.x-width/2)),y:Math.max(0,Math.min(m.height-height,p.y-height*.57))}}
 function safeLocation(loc){const room=loc?.room==='inside'?'inside':'garden';return {room,...(loc&&valid(room,loc)?{x:loc.x,y:loc.y}:maps[room].spawn)}}
 const api={maps,valid,move,path,camera,safeLocation};root.PalaisHomeWorld=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
