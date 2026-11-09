// validate all sol files: render diagrams with stub
const fs=require('fs');global.document={};global.esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
eval(fs.readFileSync('src/diag.js','utf8').replace(/const DR=/,'global.DR=').replace(/^const DC=/m,'global.DC='));
const S={};let bad=0,n=0;
for(const f of fs.readdirSync('data/sol')){eval(fs.readFileSync('data/sol/'+f,'utf8'));}
for(const pid in S)for(const q in S[pid]){const it=S[pid][q];n++;if(!it.a)console.log('noans',pid,q);
 (it.d||[]).forEach(([k,o])=>{try{if(!DR[k])throw 'no renderer '+k;const out=DR[k](o);if(/NaN|undefined/.test(out))throw 'NaN/undefined in output'}catch(e){bad++;console.log(pid,q,k,String(e).slice(0,120))}})}
console.log(Object.keys(S).length,'papers',n,'qs',bad,'bad diagrams');
