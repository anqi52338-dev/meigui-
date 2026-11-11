/* Actual API audio messages, not browser speech synthesis or simulated durations. */
let voicePolicy32=localRead('voicePolicy32',{daily:0}),voiceQueue32=[],voiceRunning32=false,voiceJobs32=new Map();
function voiceLimit32(){try{return Chat32.limit(voicePolicy32.daily)}catch{return 0}}
function voiceUsage32(){const day=PalaisCore.dateKey(),value=localRead('voiceUsage32',{});return value.day===day?{day,count:Math.max(0,Number(value.count)||0)}:{day,count:0}}
function voiceReady32(){return voiceReady()&&!!voiceSettings.tts&&voiceLimit32()>0}
function voiceInstruction32(){return voiceReady32()?'\n你可根据人设与内容主动发语音。想发语音时，在本次第一条短消息前标注 [[语音]]，其余正常写聊天文字。不要将语音标记解释给用户。也可全发文字。':''}
const buildVoice32=buildChatMessages;buildChatMessages=async function(system,history){return buildVoice32(system+voiceInstruction32(),history)};
const parseVoice32=prepareLivingReply;prepareLivingReply=function(text){const wants=text.includes('[[语音]]');const result=parseVoice32(text.replaceAll('[[语音]]',''));if(wants)result.voiceRequested32=true;return result};
function voiceLive32(job){const h=histories[job.r.id]||[],m=job.m;return !job.controller.signal.aborted&&!phoneLocked&&voiceLimit32()>0&&h.includes(m)&&m.kind!=='recall'&&roles.some(x=>x.id===job.speaker.id)&&(!m.replyTo26||h.some(x=>x.id===m.replyTo26&&x.kind!=='recall'))}
function cancelVoice32(){for(const job of voiceJobs32.values())job.controller.abort();voiceQueue32=[];voiceJobs32.clear()}
function cancelMessageVoice32(r,m){for(const [id,job]of voiceJobs32)if(job.r.id===r.id&&(m.role==='user'?job.m.replyTo26===m.id:job.m===m||m.batch26&&job.m.batch26===m.batch26)){job.controller.abort();voiceQueue32=voiceQueue32.filter(x=>x!==job);voiceJobs32.delete(id)}}
async function duration32(blob){
 const AudioContextClass=window.AudioContext||window.webkitAudioContext;if(!AudioContextClass)throw Error('当前设备无法读取语音时长，保留文字回复');
 const ctx=new AudioContextClass();try{const decoded=await ctx.decodeAudioData(await blob.arrayBuffer());if(!Number.isFinite(decoded.duration)||decoded.duration<=0)throw Error('语音时长无效');return decoded.duration}finally{await ctx.close().catch(()=>{})}
}
async function voiceWorker32(){
 if(voiceRunning32)return;voiceRunning32=true;
 try{while(voiceQueue32.length){
  const job=voiceQueue32.shift(),{m,r}=job;let mediaKey=null;
  try{
   if(!voiceLive32(job)||!voiceReady32())continue;
   const usage=voiceUsage32();if(usage.count>=voiceLimit32())continue;
   localSave('voiceUsage32',{...usage,count:usage.count+1});m.voiceAttempt32=true;try{persist()}catch(e){delete m.voiceAttempt32;throw e}
   const c=effectiveVoiceConfig(),res=await fetch(PalaisCore.apiURL(c.base,'audio/speech'),{method:'POST',headers:{Authorization:'Bearer '+c.key,'Content-Type':'application/json'},body:JSON.stringify({model:voiceSettings.tts,voice:voiceSettings.voice||'alloy',input:m.content.slice(0,600),response_format:'mp3'}),signal:AbortSignal.any([job.controller.signal,AbortSignal.timeout(60000)])});
   if(!res.ok)throw Error('语音接口 HTTP '+res.status);
   let blob=await res.blob();if(!blob.size||blob.size>8*1024*1024||(!blob.type.startsWith('audio/')&&blob.type!=='application/octet-stream'))throw Error('语音接口未返回有效音频');
   if(blob.type==='application/octet-stream')blob=new Blob([blob],{type:'audio/mpeg'});
   const seconds=await duration32(blob);if(!voiceLive32(job))continue;
   const data=await data22(blob);if(!voiceLive32(job))continue;
   mediaKey='voice32:'+m.id;await mediaWrite(mediaKey,data);
   if(!voiceLive32(job)){await mediaWrite(mediaKey,null);mediaKey=null;continue}
   const oldMedia=m.media,oldTranscript=m.transcript;m.media={type:'voice',key:mediaKey,duration:seconds};m.transcript=m.content;
   try{persist()}catch(e){m.media=oldMedia;m.transcript=oldTranscript;await mediaWrite(mediaKey,null);mediaKey=null;throw e}
   mediaKey=null;if(isChatView()&&current===r.id)renderConversation();
  }catch(e){if(mediaKey)try{await mediaWrite(mediaKey,null)}catch{}if(!job.controller.signal.aborted)toast('语音未发送，文字已保留：'+e.message)}finally{voiceJobs32.delete(m.id)}
 }}finally{voiceRunning32=false}
}
const incoming32=incomingMessage;incomingMessage=function(r,speaker,m){
 incoming32(r,speaker,m);
 if(!voiceReady32()||!Chat32.voiceEligible(m)||m.voiceAttempt32||voiceJobs32.has(m.id))return;
 const job={r,speaker,m,controller:new AbortController};voiceJobs32.set(m.id,job);voiceQueue32.push(job);voiceWorker32();
};
const voiceBubble32=wx19VoiceBubble;wx19VoiceBubble=function(el,m){
 voiceBubble32(el,m);const b=el.querySelector('.wx19-voice'),audio=el.querySelector('audio');if(!b||!audio)return;
 const show=seconds=>{if(!Number.isFinite(seconds)||seconds<=0)return;const n=Math.max(1,Math.ceil(seconds));b.querySelector('span').textContent=n+'″';b.style.minWidth=Math.min(230,75+n*3)+'px';b.setAttribute('aria-label','播放'+n+'秒语音')};show(m.media?.duration);
 if(!m.media?.duration){audio.addEventListener('loadedmetadata',()=>show(audio.duration),{once:true});audio.preload='metadata'}
 b.onclick=async()=>{if(!audio.paused){audio.pause();b.classList.remove('playing32');return}try{document.querySelectorAll('#messages audio').forEach(a=>{if(a!==audio)a.pause()});await audio.play();b.classList.add('playing32')}catch{toast('语音暂时无法播放，请重试')}};audio.addEventListener('ended',()=>b.classList.remove('playing32'));audio.addEventListener('pause',()=>b.classList.remove('playing32'));
};
const speech32=playSpeech;playSpeech=function(text){if(!voiceSettings.tts)return Promise.reject(Error('请先配置真实语音合成模型'));return speech32(text)};
voiceSettings.autoPlay=false;
function voiceQuotaForm32(){
 const section=document.createElement('section');section.className='voice-quota32';section.innerHTML=`<form id="voiceQuota32"><label>角色主动语音 · 所有角色合计 / 天<input name="daily" type="number" min="0" max="520" step="1" required value="${voiceLimit32()}"></label><p class="api-note">0为关闭，最多520。接入文字转语音模型后，角色可按内容选择发送语音条。按接口尝试计数，失败也计入，避免重复消耗；不会自动播放。关闭应用后不会生成语音。</p><button class="primary full">保存语音额度</button></form>`;
 section.querySelector('form').onsubmit=e=>{e.preventDefault();try{const daily=Chat32.limit(e.target.daily.value);localSave('voicePolicy32',{daily});voicePolicy32={daily};if(!daily)cancelVoice32();toast('主动语音额度已保存')}catch(e){toast(e.message)}};return section;
}
