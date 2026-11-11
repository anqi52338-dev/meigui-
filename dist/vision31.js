/* Shared transport fix: never expose reasoning_content as a chat reply. */
request=async function(c,messages,max_tokens=1024,signal,options={}){
 if(!signal&&active26&&typeof messages[0]?.content==='string'&&messages[0].content.includes('你是对话长期记忆整理器'))signal=active26.controller.signal;
 const probe=max_tokens<=100||options.disableThinking===true;
 max_tokens=typeof outputBudget28==='function'?outputBudget28(max_tokens):max_tokens;
 const body={model:c.model,messages,stream:false,max_tokens};
 const images=messages.some(m=>Array.isArray(m.content)&&m.content.some(p=>p.type==='image_url'));
 if((probe||images)&&/deepseek|^v4[-_ ]?(?:pro|flash)$/i.test(c.model||''))body.thinking={type:'disabled'};
 for(let attempt=0;attempt<3;attempt++){
  const res=await fetch(endpoint(c.base),{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+c.key},body:JSON.stringify(body),signal:signal?AbortSignal.any([signal,AbortSignal.timeout(45000)]):AbortSignal.timeout(45000)});
  let data;try{data=await res.json()}catch{throw Error('接口未返回 JSON（HTTP '+res.status+'），请检查接口地址')}
  if(!res.ok){const reason=String(data?.error?.message||data?.message||res.statusText);
   if(attempt<2&&[400,422].includes(res.status)){
    if(body.max_tokens!==undefined&&/max_tokens/i.test(reason)&&/unsupported|not supported|not allowed|max_completion_tokens/i.test(reason)){body.max_completion_tokens=body.max_tokens;delete body.max_tokens;continue}
    if(body.thinking&&/thinking/i.test(reason)&&/unsupported|not supported|unknown|unrecognized|not allowed|extra.*forbidden/i.test(reason)){delete body.thinking;continue}
   }
   throw Error('HTTP '+res.status+' · '+reason.slice(0,400));
  }
  try{return Chat26.output(data)}catch(e){if(/思考内容|耗尽输出额度/.test(e.message))throw Error('接口没有返回正式回复：本次请求的输出 Token 上限可能被思考内容用完。这不是账户余额不足。请在 API 设置提高输出上限；识图请选服务商实际支持图片的模型。');throw e}
 }
};
PalaisSticker.probeAnswer=function(text,expected){
 const names={red:'红',green:'绿',blue:'蓝',yellow:'黄',purple:'紫',orange:'橙',black:'黑',white:'白'};
 const clean=s=>{s=String(s).trim().toLowerCase().replace(/色$/,'');return names[s]||s};
 try{const a=JSON.parse(text.match(/\[[\s\S]*?\]/)?.[0]||'null');return Array.isArray(a)&&a.length===expected.length&&a.every((x,i)=>clean(x)===clean(expected[i]))}catch{return false}
};
checkVision=async function(){
 if(visionChecking||!apiReady()){toast('请先保存聊天 API 地址、密钥和模型');return false}
 visionChecking=true;const c={...config,key},signature=visionSignature(c),previous=visionCapability,b=$('#checkVision');
 if(b){b.disabled=true;b.textContent='正在检测图片识别…'}
 try{
  for(let i=0;i<2;i++){
   const challenge=visionChallenge(),text=await request(c,[{role:'user',content:[{type:'text',text:'查看图片中的六个大色块，按从左到右返回颜色名称，只输出六项JSON数组。名称只能使用：红、绿、蓝、黄、紫、橙、黑、白。不要猜测无法看到的图片。'},{type:'image_url',image_url:{url:challenge.image}}]}],2080,undefined,{disableThinking:true});
   if(!PalaisSticker.probeAnswer(text,challenge.expected))throw Error('色块顺序识别未通过，暂不开放自定义表情');
  }
  if(signature!==visionSignature())throw Error('配置已更改，请重新检测');
  const next={signature,passed:true,checkedAt:Date.now()};localSave('visionCapability',next);visionCapability=next;toast('识图检测通过，自定义表情包已开放');return true;
 }catch(e){
  if(signature===visionSignature()){
   const transient=/Token|超时|timeout|fetch|network|HTTP (?:429|5\d\d)/i.test(e.message),next=transient&&previous?.passed&&previous.signature===signature?previous:{signature,passed:false,error:friendly(e),checkedAt:Date.now()};
   try{localSave('visionCapability',next);visionCapability=next}catch{}
  }
  toast('识图检测未完成：'+friendly(e));return false;
 }finally{visionChecking=false;if($('#visionStatus'))$('#visionStatus').textContent=visionStatus();if(b){b.disabled=false;b.textContent='检测当前模型能否识图'}if(tab==='stickers')renderStickers()}
};
const visionHTML31=visionPanelHTML;visionPanelHTML=function(){return visionHTML31()+'<p class="api-note">检测使用 API 设置里的输出上限（默认 2080 Token），不再限制为 100。DeepSeek 识图检测请求关闭思考；官方识图入口为 deepseek-flash。第三方同名模型仍需通过图片实测。Token 输出上限与账户余额是两回事。</p>'};
