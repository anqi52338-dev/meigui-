/* Keep character editing separate from conversation wallpaper in every layout. */
const appearance33=openAppearance;
openAppearance=function(r){
 appearance33(r);
 const dialog=document.querySelector('#appearance');
 dialog.querySelector('h2').textContent='聊天背景';
 dialog.querySelector('#appearanceRole')?.remove();
 dialog.querySelector('#appearanceBook')?.remove();
};
const tools33=openChatTools;
openChatTools=function(r){
 tools33(r);
 const background=document.querySelector('#toolsAppearance');if(!background)return;
 background.textContent='聊天背景 ›';
 if(r.members||r.file)return;
 const dialog=background.closest('dialog'),edit=document.createElement('button');
 edit.type='button';edit.className='menu-button';edit.id='toolsRole33';edit.textContent='修改头像和信息 ›';
 edit.onclick=()=>{dialog.close();editRole(r.id)};
 background.before(edit);
};
