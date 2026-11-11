/* Shared by all layouts; visualViewport handles browsers that overlay the IME. */
(function(){
 let raf=0;const update=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{
  const input=document.querySelector('#composer textarea'),typing=input&&document.activeElement===input,v=window.visualViewport;
  const native=document.documentElement.classList.contains('native30'),standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone;
  const height=typing&&v?Math.max(120,Math.round(Math.min(window.innerHeight,v.height))):window.innerHeight;
  document.documentElement.style.setProperty('--keyboard-height32',height+'px');
  document.documentElement.style.setProperty('--keyboard-width32',typing&&v?Math.min(window.innerWidth,v.width||window.innerWidth)+'px':'100%');
  document.documentElement.style.setProperty('--keyboard-left32',typing&&v?Math.max(0,v.offsetLeft||0)+'px':'0px');
  document.documentElement.style.setProperty('--keyboard-top32',typing&&v?Math.max(0,v.offsetTop)+'px':'0px');
  document.documentElement.classList.toggle('typing32',!!typing&&(native||standalone||window.innerWidth<=600));
  if(typing){const list=document.querySelector('#messages');if(list)list.scrollTop=list.scrollHeight}
 })};
 document.addEventListener('focusin',update);document.addEventListener('focusout',()=>setTimeout(update,80));window.addEventListener('resize',update);window.visualViewport?.addEventListener('resize',update);window.visualViewport?.addEventListener('scroll',update);
 const css=document.createElement('style');css.textContent=':root.typing32 .phone,:root.native30.typing32[data-theme] .phone{position:fixed!important;top:var(--keyboard-top32,0px)!important;left:var(--keyboard-left32,0px)!important;width:var(--keyboard-width32,100%)!important;height:var(--keyboard-height32)!important;min-height:0!important;max-height:none!important;margin:0!important;border-radius:0!important}:root.typing32 #screen{min-height:0!important;flex:1!important;overflow:hidden!important}:root.typing32 .chat-page{height:100%!important;min-height:0!important;display:flex!important;flex-direction:column!important}:root.typing32 #messages{min-height:0!important;flex:1!important;overflow:auto!important}:root.typing32 .chat-bar{flex-shrink:0!important}:root.typing32 .phone>.status,:root.typing32 .phone>.homebar,:root.typing32 .music-mini{display:none!important}';document.head.append(css);
})();
