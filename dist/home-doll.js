// 家园纸娃娃：矢量绘制，面容/发色/腮红/脸饰/服装可自由组合
(function(root){
 const mix=(a,b,t)=>'#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');
 const looks=[{hair:'#9a6249',eye:'#8d4a5c'},{hair:'#dcae6c',eye:'#4f9a7c'},{hair:'#7a5244',eye:'#5b7fc4'},{hair:'#c98f70',eye:'#b9853a'}];
 const tints={natural:c=>c,cocoa:c=>mix(c,'#3b2621',.42),honey:c=>mix(c,'#f3c27a',.38)};
 const dresses={
  rose:{main:'#f8bccb',light:'#ffe2ea',line:'#e292a8',shoe:'#f29bb3'},
  mint:{main:'#a9dcc6',light:'#e3f6ec',line:'#74b99c',shoe:'#7cc3a5'},
  lilac:{main:'#cdb8f0',light:'#efe6ff',line:'#a28ad6',shoe:'#a993e0'},
  gold:{main:'#f5d991',light:'#fff3d4',line:'#d6ae55',shoe:'#e2bb63'}
 };
 const scallop=(y,from,to,r,fill,line)=>{let d=`M${from} ${y}`;for(let x=from;x<to-.1;x+=r*2)d+=` a${r} ${r} 0 0 0 ${r*2} 0`;return `<path d="${d}" fill="${fill}" stroke="${line}" stroke-width=".8"/>`};
 function backHair(look,c,o){
  if(look===0)return `<path d="M22 50Q16 20 50 16Q84 20 78 50Q86 78 81 104Q75 114 68 105Q64 96 69 86L31 86Q36 96 32 105Q25 114 19 104Q14 78 22 50Z" fill="${c}" stroke="${o}" stroke-width="1.1"/>`;
  if(look===1)return `<path d="M23 52Q18 18 50 16Q82 18 77 52Q81 72 73 80Q66 84 65 75L35 75Q34 84 27 80Q19 72 23 52Z" fill="${c}" stroke="${o}" stroke-width="1.1"/>`;
  if(look===2)return `<circle cx="27" cy="25" r="11" fill="${c}" stroke="${o}" stroke-width="1.1"/><circle cx="73" cy="25" r="11" fill="${c}" stroke="${o}" stroke-width="1.1"/><path d="M21 21q6 4 12 0M21 28q6 4 12 0M67 21q6 4 12 0M67 28q6 4 12 0" fill="none" stroke="${o}" stroke-width=".8"/><path d="M24 52Q20 20 50 18Q80 20 76 52Q78 68 71 74L29 74Q22 68 24 52Z" fill="${c}" stroke="${o}" stroke-width="1.1"/>`;
  return `<path d="M23 50Q19 16 50 15Q81 16 77 50L81 120Q72 127 64 118L64 86L36 86L36 118Q28 127 19 120Z" fill="${c}" stroke="${o}" stroke-width="1.1"/>`;
 }
 function accessory(look){
  if(look===0)return `<g transform="translate(68 30) rotate(14)"><path d="M0 0C-6-7-13-5-12 1C-11 7-4 6 0 0C4 6 11 7 12 1C13-5 6-7 0 0Z" fill="#ffc4d4" stroke="#e58aa6" stroke-width=".9"/><circle r="2.4" fill="#f6d68e" stroke="#d6ae55" stroke-width=".7"/></g>`;
  if(look===1)return `<g transform="translate(31 31)">${[0,72,144,216,288].map(a=>`<circle cx="${(Math.cos(a*Math.PI/180)*3.6).toFixed(2)}" cy="${(Math.sin(a*Math.PI/180)*3.6).toFixed(2)}" r="2.8" fill="#fff" stroke="#9fd2bb" stroke-width=".8"/>`).join('')}<circle r="2" fill="#f6d68e"/></g>`;
  if(look===2)return `<path d="M20 33l-4 9 4-2 2 3M80 33l4 9-4-2-2 3" fill="#d9c9fb" stroke="#a28ad6" stroke-width=".8" stroke-linejoin="round"/><circle cx="27" cy="25" r="2" fill="#efe6ff"/><circle cx="73" cy="25" r="2" fill="#efe6ff"/>`;
  return `<path d="M36 22L38 13L43 19L50 10L57 19L62 13L64 22Q50 18 36 22Z" fill="#f6d98e" stroke="#cfa24c" stroke-width=".9" stroke-linejoin="round"/><circle cx="50" cy="12" r="1.7" fill="#ffc4d4"/><circle cx="38" cy="14" r="1" fill="#fff"/><circle cx="62" cy="14" r="1" fill="#fff"/>`;
 }
 function bangs(look,c,o,shine){
  const d=look===1?'M25 52Q23 24 50 22Q77 24 75 52Q73 42 66 38Q60 44 50 42Q40 44 34 38Q27 42 25 52Z':look===3?'M25 50Q23 22 50 21Q77 22 75 50Q68 36 54 32Q51 40 44 40Q46 34 44 31Q32 36 25 50Z':'M25 50Q24 24 50 22Q76 24 75 50Q70 40 62 36Q60 44 52 44Q54 38 50 33Q46 42 38 44Q40 38 38 35Q30 40 25 50Z';
  return `<path d="${d}" fill="${c}" stroke="${o}" stroke-width="1.1" stroke-linejoin="round"/><path d="M34 29Q42 25 50 25" fill="none" stroke="${shine}" stroke-width="2" stroke-linecap="round" opacity=".75"/>`;
 }
 function face(a,eye,brow){
  const blush=a.blush==='none'?'':`<ellipse cx="34" cy="63.5" rx="5.2" ry="2.6" fill="${a.blush==='peach'?'#ffae8a':'#ff9db6'}" opacity=".5"/><ellipse cx="66" cy="63.5" rx="5.2" ry="2.6" fill="${a.blush==='peach'?'#ffae8a':'#ff9db6'}" opacity=".5"/>`;
  const eyeSvg=x=>`<ellipse cx="${x}" cy="56" rx="4.8" ry="6" fill="${eye}"/><ellipse cx="${x}" cy="57.2" rx="2.8" ry="3.6" fill="${mix(eye,'#2a1a20',.55)}"/><circle cx="${x-1.7}" cy="53.6" r="1.8" fill="#fff"/><circle cx="${x+1.6}" cy="58.6" r=".9" fill="#fff"/><path d="M${x-5.6} 51.6Q${x} 47.6 ${x+5.6} 51.6" fill="none" stroke="#4b2f37" stroke-width="1.5" stroke-linecap="round"/>`;
  const detail=a.detail==='freckles'?'<g fill="#c98d74" opacity=".75"><circle cx="31" cy="61" r=".7"/><circle cx="34" cy="62" r=".7"/><circle cx="32.6" cy="59.6" r=".6"/><circle cx="69" cy="61" r=".7"/><circle cx="66" cy="62" r=".7"/><circle cx="67.4" cy="59.6" r=".6"/></g>':a.detail==='star'?'<path d="M67 59.5l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9z" fill="#e7bc5c"/>':'';
  return `<ellipse cx="50" cy="52" rx="25" ry="24" fill="#ffe8da" stroke="#efc3ad" stroke-width="1"/>${blush}${eyeSvg(40)}${eyeSvg(60)}<path d="M35 45.5q5-2 9 0M56 45.5q4-2 9 0" fill="none" stroke="${brow}" stroke-width="1.1" stroke-linecap="round"/><circle cx="50" cy="61.6" r=".8" fill="#e6a596"/><path d="M47 65.4q1.5 1.8 3 0q1.5 1.8 3 0" fill="none" stroke="#c96b80" stroke-width="1.1" stroke-linecap="round"/>${detail}`;
 }
 function dress(id){
  const c=dresses[id]||dresses.rose,skin='#ffe8da',skinLine='#efc3ad';
  let skirt=`<path d="M36 104Q24 126 19 146Q50 155 81 146Q76 126 64 104Z" fill="${c.main}" stroke="${c.line}" stroke-width="1"/>`;
  if(id==='mint')skirt+=`<path d="M41 106Q36 126 35 144Q50 148 65 144Q64 126 59 106Z" fill="#fffdf8" stroke="${c.line}" stroke-width=".8"/><path d="M45 120q5 4 10 0M44 130q6 4 12 0" fill="none" stroke="${c.line}" stroke-width=".7"/>`;
  if(id==='lilac')skirt+=`<path d="M33 110Q26 128 23 144Q50 150 77 144Q74 128 67 110" fill="${c.light}" opacity=".55"/>${[[30,132],[70,132],[50,140]].map(([x,y])=>`<path d="M${x} ${y}c-3-3-6-2-6 1s3 3 6-1c3 4 6 3 6 1s-3-4-6-1z" fill="#fff" stroke="${c.line}" stroke-width=".6"/>`).join('')}`;
  if(id==='gold')skirt=`<path d="M36 104Q20 126 14 148Q50 158 86 148Q80 126 64 104Z" fill="${c.main}" stroke="${c.line}" stroke-width="1"/><path d="M36 104Q30 124 30 146M64 104Q70 124 70 146M50 106V150" fill="none" stroke="${c.line}" stroke-width=".7" opacity=".7"/><path d="M22 136Q50 146 78 136" fill="none" stroke="#fff" stroke-width="1.6" stroke-dasharray="0 4" stroke-linecap="round"/>`;
  if(id==='rose')skirt+=`<path d="M24 136Q34 128 40 140Q50 130 60 140Q66 128 76 136" fill="none" stroke="${c.line}" stroke-width=".8"/>`;
  const hem=id==='gold'?scallop(149,14,86,3,'#fffaf0',c.line):scallop(146,19,81,2.5,'#fffaf3',c.line);
  return `<g class="doll-figure"><path d="M43 150L43 182M57 150L57 182" stroke="#ecd6cf" stroke-width="8.6" stroke-linecap="round"/><path d="M43 150L43 182M57 150L57 182" stroke="#fffaf6" stroke-width="7" stroke-linecap="round"/><path d="M39.6 174q3.4 2 6.8 0M53.6 174q3.4 2 6.8 0" fill="none" stroke="${c.line}" stroke-width=".8"/><ellipse cx="42" cy="186" rx="6.6" ry="4.2" fill="${c.shoe}" stroke="${c.line}" stroke-width=".8"/><ellipse cx="58" cy="186" rx="6.6" ry="4.2" fill="${c.shoe}" stroke="${c.line}" stroke-width=".8"/><path d="M38 183h8M54 183h8" stroke="${c.line}" stroke-width=".8"/>${skirt}${hem}<path d="M33 90Q26 102 27 112M67 90Q74 102 73 112" fill="none" stroke="${skinLine}" stroke-width="6.2" stroke-linecap="round"/><path d="M33 90Q26 102 27 112M67 90Q74 102 73 112" fill="none" stroke="${skin}" stroke-width="4.6" stroke-linecap="round"/><path d="M38 82Q50 87 62 82L64 106Q50 110 36 106Z" fill="${c.main}" stroke="${c.line}" stroke-width="1"/><path d="M44 84L50 92L56 84" fill="${c.light}" stroke="${c.line}" stroke-width=".7"/><circle cx="35" cy="87" r="7" fill="${c.light}" stroke="${c.line}" stroke-width="1"/><circle cx="65" cy="87" r="7" fill="${c.light}" stroke="${c.line}" stroke-width="1"/><path d="M50 104c-5-5-10-4-10 0s5 4 10 0c5 4 10 4 10 0s-5-5-10 0z" fill="${id==='gold'?'#fff6dc':c.light}" stroke="${c.line}" stroke-width=".8"/><circle cx="50" cy="104" r="1.8" fill="#f6d68e" stroke="${c.line}" stroke-width=".5"/>${id==='gold'?'<path d="M42 84q8 5 16 0" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="0 2.6" stroke-linecap="round"/>':''}</g>`;
 }
 function svg(a,outfit){
  const look=[0,1,2,3].includes(a.look)?a.look:0,base=looks[look],hair=(tints[a.tint]||tints.natural)(base.hair),line=mix(hair,'#3b2621',.35),shine=mix(hair,'#ffffff',.45);
  return `<svg class="doll-svg" viewBox="0 0 100 200" aria-hidden="true">${backHair(look,hair,line)}<rect x="45.5" y="72" width="9" height="12" rx="3" fill="#ffe8da" stroke="#efc3ad" stroke-width=".8"/>${dress(outfit)}<g class="doll-face">${face(a,base.eye,line)}${bangs(look,hair,line,shine)}${accessory(look)}</g></svg>`;
 }
 root.PalaisDoll={svg,dresses};
})(typeof window!=='undefined'?window:globalThis);
