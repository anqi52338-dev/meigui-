const PalaisWallet = {
  initial() { return {balance:1000000,ledger:[],version:1}; },
  cents(value) { const s=String(value);if(!/^\d+(?:\.\d{1,2})?$/.test(s))throw Error('请输入最多两位小数的有效金额');const parts=s.split('.');const n=Number(parts[0])*100+Number((parts[1]||'').padEnd(2,'0'));if(!Number.isSafeInteger(n)||n<1||n>10000000)throw Error('金额需在 0.01–100000 元之间');return n; },
  apply(wallet,{messageId,conversationId,amount,direction,type,note,peer,createdAt=Date.now()}) {
    if(!messageId||!['in','out'].includes(direction))throw Error('无效的零钱记录');
    if(wallet.ledger.some(x=>x.messageId===messageId))return wallet;
    const cents=this.cents(amount),delta=direction==='out'?-cents:cents,balance=wallet.balance+delta;
    if(balance<0)throw Error('零钱余额不足，请调整金额');if(!Number.isSafeInteger(balance))throw Error('零钱金额超出范围');
    return {...wallet,balance,ledger:[...wallet.ledger,{id:messageId,messageId,conversationId,delta,balance,type,note,peer,createdAt}]};
  },
  money(cents) { return (cents/100).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}); }
};
let wallet=localRead('chatState',null)?.wallet||PalaisWallet.initial();
