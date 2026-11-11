(function(root){
 function device(ua,touch=0){ua=String(ua||'');const ios=/iPhone|iPad|iPod/i.test(ua)||/Macintosh/i.test(ua)&&touch>1,android=/Android/i.test(ua);let browser='other';
  if(/MicroMessenger|\bQQ\//i.test(ua))browser='embedded';else if(/Quark/i.test(ua))browser='quark';else if(/MQQBrowser|QQBrowser/i.test(ua))browser='qq';else if(/UCBrowser|UCWEB/i.test(ua))browser='uc';else if(/EdgA|EdgiOS|Edg\//i.test(ua))browser='edge';else if(/MiuiBrowser|HuaweiBrowser|VivoBrowser|HeyTapBrowser|OppoBrowser/i.test(ua))browser='system';else if(/Chrome|CriOS/i.test(ua))browser='chrome';else if(/Safari/i.test(ua))browser='safari';return {os:ios?'ios':android?'android':'desktop',browser};
 }
 function view(d,ready,standalone,secure=true,installed=false){
  const names={qq:'QQ浏览器',quark:'夸克浏览器',uc:'UC浏览器',edge:'Edge',chrome:'Chrome',safari:'Safari',system:'手机自带浏览器',embedded:'应用内置浏览器',other:'当前浏览器'},name=names[d.browser];
  if(standalone||installed)return {name,canPrompt:false,title:'已在桌面应用中，或已完成本次安装',steps:['从手机桌面的玫瑰小手机图标进入即可。']};
  if(!secure)return {name,canPrompt:false,title:'请先使用 HTTPS 小手机网址',steps:['复制下方网址，在手机浏览器中打开后再添加。']};
  if(d.browser==='embedded')return {name,canPrompt:false,title:'请先在独立浏览器打开',steps:['打开当前应用自己的菜单，选择“在浏览器打开”，或复制下方网址到手机浏览器。','打开后，在浏览器菜单查找“添加到桌面/主屏幕”。']};
  if(d.os==='ios')return {name,canPrompt:false,title:'苹果手机通过分享菜单添加',steps:['用 Safari 打开下方小手机网址。','点浏览器的分享按钮，选择“添加到主屏幕”。','如有“作为网页 App 打开”开关，请开启，再点“添加”。']};
  const steps=d.os==='desktop'?['在安卓或苹果手机的浏览器里打开下方网址，再按对应手机的提示操作。']:['点浏览器自己的菜单，查找“添加到桌面/主屏幕”或“安装应用”。',...(d.browser==='qq'?['如果进入“收藏/添加书签”，检查是否提供“桌面”作为保存位置；入口随浏览器版本变化。']:[]),'“添加到浏览器首页/收藏”只是在浏览器里保存入口，请选择手机桌面。','浏览器或系统若弹出创建桌面快捷方式的确认，请完成确认。','如果菜单没有桌面选项，这个版本暂时不能用本页创建图标。可复制网址，换一个提供桌面添加功能的浏览器。'];
  return {name,canPrompt:!!ready,title:ready?'浏览器已提供安装入口':'暂未获得浏览器的一键安装入口',steps};
 }
 async function reset(scope,registration,cacheApi){
  if(registration&&registration.scope!==scope)throw Error('缓存范围不匹配，已停止修复');
  if(registration)await registration.unregister();const prefix='rose-phone:'+scope+':';for(const name of await cacheApi.keys())if(name.startsWith(prefix))await cacheApi.delete(name);
 }
 const api={device,view,reset};root.Install29=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
