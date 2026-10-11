/* Pure helpers shared by settings and chat. */
const PalaisCore = {
  apiURL(base, resource) {
    const u = new URL(base);
    if (u.protocol !== 'https:' && !(u.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(u.hostname))) throw Error('请使用 HTTPS 接口地址');
    if (u.username || u.password || u.search || u.hash) throw Error('接口地址不能包含账号、查询参数或锚点');
    u.pathname = u.pathname.replace(/\/+$/, '').replace(/\/(?:chat\/completions|models)$/, '');
    u.pathname += '/' + resource;
    return u.href;
  },
  modelIds(data) {
    if (!Array.isArray(data.data)) throw Error('服务商未返回标准模型列表，请使用手动输入');
    const ids = [...new Set(data.data.map(m => m?.id).filter(id => typeof id === 'string' && id.trim()))].sort();
    if (!ids.length) throw Error('此接口未返回可用模型，请检查密钥权限或手动输入');
    return ids;
  },
  activeEntries(entries, roleId, messages) {
    const text = messages.slice(-6).map(m => m.content).join('\n').normalize('NFKC').toLowerCase();
    return entries.filter(e => e.enabled && (!e.roleId || e.roleId === roleId) && (e.mode === 'always' || e.keys.split(/[,，;；\n]/).map(k => k.trim().normalize('NFKC').toLowerCase()).filter(Boolean).some(k => text.includes(k))));
  },
  systemPrompt(role, entries, messages) {
    const active = this.activeEntries(entries, role.id, messages);
    return role.prompt + (active.length ? '\n\n以下是本次对话适用的世界书背景资料，请结合角色设定保持人物、关系和世界观一致：\n' + active.map(e => `【${e.name}】\n${e.content}`).join('\n\n') : '');
  }
};
Object.assign(PalaisCore, {
  dateKey(date = new Date()) { return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-'); },
  dayNumber(date) {const value=Date.parse(date+'T12:00:00Z');return value/86400000},
  addDays(date,days){return new Date(Date.parse(date+'T12:00:00Z')+days*86400000).toISOString().slice(0,10)},
  cycleInfo(records,defaultCycle=28){const starts=[...new Set(records.map(r=>r.start))].sort();const gaps=starts.slice(1).map((s,i)=>this.dayNumber(s)-this.dayNumber(starts[i])).filter(n=>n>0);const cycle=gaps.length?Math.round(gaps.slice(-6).reduce((a,b)=>a+b,0)/gaps.slice(-6).length):defaultCycle;return {cycle,next:starts.length?this.addDays(starts.at(-1),cycle):null,samples:gaps.length}},
  memoryDue(memory,history,settings,now=Date.now()){const m=memory||{};const pending=history.length-(m.processed||0);const since=m.updatedAt||history[0]?.createdAt||now;return !!settings.enabled&&pending>0&&(pending>=settings.messages||(settings.daily&&now-since>=86400000));},
  memoryContext(memory){if(!memory)return '';return [memory.pinned&&'用户固定记忆：\n'+memory.pinned,memory.summary&&'已整理的长期记忆：\n'+memory.summary].filter(Boolean).join('\n\n')},
  cardReply(text){const match=text.match(/\[\[(红包|转账)\|([0-9]+(?:\.[0-9]{1,2})?)\|([^\]\n]{0,80})\]\]/);if(!match||Number(match[2])<=0||Number(match[2])>100000)return {content:text};return {content:text.replace(match[0],'').trim()||'送给你的一点心意。',card:{type:match[1]==='红包'?'redpacket':'transfer',amount:Number(match[2]).toFixed(2),note:match[3],status:'pending'}};},
  async pinDigest(pin,salt,webCrypto=globalThis.crypto){if(!/^\d{6}$/.test(pin))throw Error('请输入 6 位数字密码');const material=await webCrypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);const bytes=await webCrypto.subtle.deriveBits({name:'PBKDF2',salt:new Uint8Array(salt),iterations:150000,hash:'SHA-256'},material,256);return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');}
});
