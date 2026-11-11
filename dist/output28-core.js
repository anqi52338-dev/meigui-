(function(root){
 const DEFAULT=2080,MAX=100000;
 function validate(v){if(typeof v==='string'&&!v.trim())throw Error('请填写最大输出额度');const n=Number(v);if(!Number.isInteger(n)||n<1||n>MAX)throw Error('最大输出额度须为1–100000之间的整数');return n}
 function stored(v){try{return v==null?DEFAULT:validate(v)}catch{return DEFAULT}}
 function budget(cap,requested){const n=Number(requested);return Number.isInteger(n)&&n>=1&&n<=100?n:stored(cap)}
 const api={DEFAULT,MAX,validate,stored,budget};root.Output28=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
