const PalaisWallet = {
  initial() { return {balance:1000000,ledger:[],version:1}; },
  cents(value) { const s=String(value);if(!/^\d+(?:\.\d{1,2})?$/.test(s))throw Error('请输入最多两位小数的有效金额');const parts=s.split('.');const exact=BigInt(parts[0])*100n+BigInt((parts[1]||'').padEnd(2,'0'));if(exact<1n||exact>BigInt(Number.MAX_SAFE_INTEGER))throw Error('金额超出可精确记录的范围');return Number(exact); },
  apply(wallet,{messageId,conversationId,amount,direction,type,note,peer,createdAt=Date.now()}) {
    if(!messageId||!['in','out'].includes(direction))throw Error('无效的零钱记录');
    if(wallet.ledger.some(x=>x.messageId===messageId))return wallet;
    const cents=this.cents(amount);if(type==='redpacket'&&cents>20000)throw Error('单个红包最多 200 元');const delta=direction==='out'?-cents:cents,balance=wallet.balance+delta;
    if(balance<0)throw Error('零钱余额不足，请调整金额');if(!Number.isSafeInteger(balance))throw Error('零钱金额超出范围');
    return {...wallet,balance,ledger:[...wallet.ledger,{id:messageId,messageId,conversationId,delta,balance,type,note,peer,createdAt}]};
  },
  amount(cents) { const n=BigInt(cents);return String(n/100n)+'.'+String(n%100n).padStart(2,'0'); },
  money(cents) { const n=BigInt(Math.abs(cents));return (cents<0?'−':'')+Number(n/100n).toLocaleString('zh-CN')+'.'+String(n%100n).padStart(2,'0'); }
};
let wallet=localRead('chatState',null)?.wallet||PalaisWallet.initial();
