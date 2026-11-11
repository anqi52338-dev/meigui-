// Applies to text generation across chat, groups, Moments and the other apps.
// Connection and vision probes keep their deliberately small test budgets.
function outputBudget28(requested){return Output28.budget(localRead('outputTokens28',null),requested)}
function saveOutput28(value){const next=Output28.validate(value);localSave('outputTokens28',next);return next}
const apiOutput28=renderApi;renderApi=function(){
 apiOutput28();const section=document.createElement('section');section.className='auto21';
 section.innerHTML=`<h3>限制输出长度</h3><form id="outputForm28"><label>最大输出额度 · Token<input name="tokens" type="number" inputmode="numeric" required min="1" max="9999" step="1" value="${Output28.stored(localRead('outputTokens28',null))}"></label><p class="api-note">默认2080，最大9999。聊天、群聊、朋友圈等文字生成共用；Token不等于汉字数，部分模型的思考也会占用额度。提高额度可缓解截断，但服务商可能另有限制。此项不限制气泡数量。</p><button class="primary full">保存输出额度</button><p id="outputStatus28" role="status"></p></form>`;
 const view=screen.querySelector('.view');if(!view)return;const anchor=$('#style26')?.closest('section');if(anchor)anchor.after(section);else view.append(section);
 $('#outputForm28').onsubmit=e=>{e.preventDefault();try{const n=saveOutput28(e.target.tokens.value);$('#outputStatus28').textContent='已保存：每次最多 '+n+' Token；下一次生成生效';toast('最大输出额度已保存')}catch(err){toast(err.message)}};
};
