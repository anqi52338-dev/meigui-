/* Runs before either layout. Both entrypoints keep the same storage origin. */
(function(){
 try{
  let info=null;try{info=JSON.parse(window.NativeRose?.getAppInfo31()||'null')}catch{}
  let first=Number(localStorage.getItem('palais.firstVersion31'));
  if(Update31.validVersion(info?.firstVersion))first=info.firstVersion;
  else if(!Update31.validVersion(first)){first=Object.keys(localStorage).some(k=>k.startsWith('palais.')&&k!=='palais.firstVersion31')?30:Update31.CURRENT}
  localStorage.setItem('palais.firstVersion31',String(first));
  const saved=localStorage.getItem('palais.uiMode31'),selected=Update31.mode(first,saved);
  window.roseBuild31={firstVersion:first,currentVersion:Update31.CURRENT,native:!!info,mode:selected};
  const here=new URL(location.href),target=Update31.LAYOUTS[selected];
  if(here.pathname.split('/').pop()!==target){const next=new URL(target,here);next.search=here.search;next.hash=here.hash;location.replace(next.href)}
 }catch(e){window.roseBuild31={firstVersion:Update31.CURRENT,currentVersion:Update31.CURRENT,native:!!window.NativeRose,mode:location.pathname.endsWith('layout30.html')?'v30':location.pathname.endsWith('layout31.html')?'v31':'latest',storageError:true}}
})();
