const A=require('node:assert/strict'),L=require('../dist/living-core.js');
const base={balance:1000000,ledger:[]};
A.ok(Object.keys(L.catalog).length>=60);
for(const [id,r]of Object.entries(L.recipes)){
 let w=base,n=0;
 for(const [item,quantity]of Object.entries(r.need)){A.ok(L.catalog[item],id);w=L.purchase(w,{id:id+(n++),item,quantity,pay:'self',at:1})}
 const before=w.balance;w=L.cook(w,id);A.equal(w.inventory['meal:'+id],1);A.equal(w.balance,before);
 for(const item of Object.keys(r.need))A.equal(w.inventory[item],0);
}
let w=L.purchase(base,{id:'soap',item:'soap',quantity:2,pay:'self',at:1});A.equal(w.balance,998400);A.equal(w.inventory.soap,2);A.equal(L.purchase(w,{id:'soap',item:'soap',quantity:2,pay:'self',at:1}).balance,w.balance);A.throws(()=>L.purchase({...base,balance:0},{id:'x',item:'beef',quantity:1,pay:'self',at:1}));A.equal(base.balance,1000000);
console.log('Shop: all recipes purchasable and cookable, exact deductions, inventory, duplicate orders and insufficient balance passed');
