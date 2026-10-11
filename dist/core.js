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
