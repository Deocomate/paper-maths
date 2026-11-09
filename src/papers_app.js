/* ================= Checkpoint & Progression test boards ================= */
const BOARDS={checkpoint:{k:'C',name:'Checkpoint',long:'Cambridge Primary Checkpoint',icon:'🏁',col:['#f0dca6','#9a6f0e'],blurb:'Real Checkpoint papers, one paper at a time. No hints — try it, finish, then see the method.'},
  progression:{k:'P',name:'Progression Test',long:'Stage 6 Progression Tests',icon:'📈',col:['#cdd8c0','#55704a'],blurb:'Progression Test papers by year. Work through each paper, then check your method.'}};
const PBY=Object.fromEntries(PAPERS.map(p=>[p.id,p]));
const boardOf=p=>p.board==='C'?'checkpoint':'progression';
const SESN={April:1,October:2,'':0};
function paperTitle(p){if(p.custom)return p.title;return `${p.board==='C'?'Checkpoint':'Progression Test'} · ${p.ses?p.ses+' ':''}${p.year} · Paper ${p.paper}`}
function PP(){const R=L();R.pp=R.pp||{};R.ppos=R.ppos||{};return R}
function pstats(pid){const R=PP(),m=R.pp[pid]||{},qs=PBY[pid].qs;
  const yes=qs.filter(q=>m[q.n]==='yes').length,no=qs.filter(q=>m[q.n]==='no').length;
  const marks=qs.reduce((a,q)=>a+q.marks,0),got=qs.reduce((a,q)=>a+(m[q.n]==='yes'?q.marks:0),0);
  return{yes,no,done:yes+no,tot:qs.length,marks,got}}
const pqid=(pid,n)=>pid+'-'+n;

function viewBoard(bk){const B=BOARDS[bk];setTheme(0);header();document.body.style.setProperty('--th',B.col[1]);document.body.style.setProperty('--ths',B.col[0]);
  const list=PAPERS.filter(p=>boardOf(p)===bk).sort((a,b)=>b.year-a.year||SESN[b.ses]-SESN[a.ses]||a.paper-b.paper);
  const groups=[];list.sort((a,b)=>(b.custom?1:0)-(a.custom?1:0));list.forEach(p=>{const g=p.custom?'My imported papers':`${p.ses?p.ses+' ':''}${p.year}`;let G=groups.find(x=>x.g===g);if(!G)groups.push(G={g,ps:[]});G.ps.push(p)});
  let all=0,dn=0,mk=0,gt=0;list.forEach(p=>{const s=pstats(p.id);all+=s.tot;dn+=s.done;mk+=s.marks;gt+=s.got});
  const next=list.find(p=>pstats(p.id).done<p.qs.length)||list[0];
  const card=(p,i)=>{const s=pstats(p.id),st=s.done===0?'Start':s.done<s.tot?'Continue':'Look again';
    return `<a class="ucard" href="#p-${p.id}">${paper(`<div class="pcard"><div class="pk">${p.custom?esc(p.title.toUpperCase()):'PAPER '+p.paper}</div><h3>${p.qs.length} questions · ${s.marks} marks</h3>
      <div class="row ubar">${bar(s.done,s.tot)}<span>${s.done}/${s.tot}</span></div>
      <div class="small">${s.done?`✓ ${s.yes} · ✗ ${s.no}${s.done===s.tot?` · <b>${s.got}/${s.marks} marks</b>`:''}`:'<span class="muted">Not started</span>'}</div>
      <span class="btn sm" style="margin-top:8px">${st} ▶</span></div>`,T4[i%4],`background-color:${i%2?'#f6f1e7':B.col[0]}`)}</a>`};
  $('#app').innerHTML=`<section class="wrap"><div class="crumbs"><a href="#home">← Home</a></div>
   <div class="uhero">${paper(`<div class="bicon">${B.icon}</div><div><div class="uk">${list.length} PAPERS · ${all} QUESTIONS</div><h1>${B.name.toUpperCase()}</h1>
     <div class="row ubar" style="max-width:420px">${bar(dn,all)}<span>${dn}/${all} done</span></div>
     <a class="btn big" href="#p-${next.id}">▶ ${pstats(next.id).done?'Continue':'Start'} ${esc(paperTitle(next).replace(/^[^·]+· /,''))}</a></div>`,'t3','background-color:'+B.col[0])}</div>
   <div class="howto">${paper(`<b>How it works:</b> <span class="step1">① Read the real question</span> → <span>② Work it out on paper and write your answer</span> → <span>③ Press <b>I'm done ✓</b></span> → <span>④ <b>Show the answer</b>: method in steps + picture</span> → <span>⑤ Mark yourself ✓ or ✗</span>`,'t1 small','background-color:#fbf8f1',false)}</div>
   ${groups.map(G=>`<div class="sechead"><h2>${esc(G.g)}</h2><span class="muted">${G.ps.length} paper${G.ps.length>1?'s':''}</span></div><div class="ugrid two">${G.ps.map(card).join('')}</div>`).join('')}
   <p class="small muted" style="margin-top:18px">Answers and methods were worked out for this site (no official mark scheme was in the file). Answers that need measuring (angles, drawings) are approximate — accept ±2°.</p></section>`;
}

function solBlock(pid,n){const S=solOf(pid,n);if(UI.editing===pid+'-'+n)return editorHTML(pid,n);const eb=isParent()?`<button class="btn sm ghost edbtn" id="ed-open">✎ Edit answer</button>`:'';if(!S||(!S.a&&!(S.s||[]).length))return`<div class="box grey">No answer saved yet.${eb}</div>`;
  const steps=(S.s||[]).filter(x=>x);
  return `<div class="box ok ansbig"><div class="lab">ANSWER</div><div class="av">${esc(S.a)}</div>${S.edited?'<span class="pill">✎ corrected by you</span>':''}${eb}</div>
   ${(steps.length||(S.d&&S.d.length))?`<div class="sol"><div class="solh">🧭 How to solve it</div>
    ${S.d&&S.d.length?S.d.map(([t,o])=>`<div class="dgwrap">${DR[t](o)}</div>`).join(''):''}
    ${steps.length?`<div class="flow">${steps.map((x,i)=>`<div class="fstep"><span class="fn">${i+1}</span><span class="ft">${esc(x)}</span></div>${i<steps.length-1?'<div class="farrow">↓</div>':''}`).join('')}</div>`:''}
   </div>`:''}`}

function viewPaper(pid){const p=PBY[pid],R=PP(),B=BOARDS[boardOf(p)];setTheme(0);header();document.body.style.setProperty('--th',B.col[1]);document.body.style.setProperty('--ths',B.col[0]);
  if(UI.ppid!==pid){UI.ppid=pid;UI.preveal=null;UI.ponly=false;UI.tool='tap'}
  const m=R.pp[pid]=R.pp[pid]||{};
  let qs=p.qs;if(UI.ponly){const w=qs.filter(q=>m[q.n]==='no');if(w.length)qs=w;else UI.ponly=false}
  let i=Math.max(0,qs.findIndex(q=>q.n===R.ppos[pid]));const q=qs[i]||qs[0];R.ppos[pid]=q.n;save();
  const id=pqid(pid,q.n),r=m[q.n],shown=!!r||UI.preveal===id,s=pstats(pid);
  const dots=`<div class="dots">${qs.map(x=>`<button data-pq="${x.n}" class="${x.n===q.n?'on':''} ${m[x.n]==='yes'?'ok':m[x.n]==='no'?'bad':''}">${x.n}</button>`).join('')}</div>`;
  window.PIMG=window.PIMG||{};const ready=q.crops.every(c=>PIMG[c]);
  if(!ready){if(UI.pload!==pid){UI.pload=pid;const sc=document.createElement('script');sc.src='pdata/'+pid+'.js';sc.onload=()=>{if((location.hash||'').slice(3)===pid)render()};sc.onerror=()=>toast('Could not load the question pictures.');document.head.appendChild(sc)}}
  const tick=q.tk;
  const imgs=ready?q.crops.map((c,ci)=>cropHTML(c,ci,id,tick)).join(''):'<div class="small muted" style="padding:30px;text-align:center">Loading the question…</div>';
  const finished=s.done===s.tot;
  $('#app').innerHTML=`<section class="wrap solo"><div class="crumbs"><a href="#${boardOf(p)}">← ${B.name} board</a></div>
   <div class="row between"><h1 class="th1" style="margin:4px 0">${esc(paperTitle(p))}</h1><span class="pill">${s.done}/${s.tot} done${finished?` · ${s.got}/${s.marks} marks`:''}</span></div>
   <div class="row" style="margin:6px 0">${s.no?`<button class="btn sm ${UI.ponly?'':'ghost'}" id="ponly">🔁 ${UI.ponly?'Showing my ✗ only — show all':'Redo my ✗ ('+s.no+')'}</button>`:''}</div>
   ${dots}
   ${paper(`<div class="row between"><span class="pill src">Question ${q.n}</span><span class="pill">${q.marks} mark${q.marks>1?'s':''}</span></div>
     ${ready?toolbarHTML(q):''}<div class="qimgwrap">${imgs}</div>
     ${shown?`${(L().ans||{})[id]?mine(id):'<div class="box mine small">Your answer is on the question above — compare it with the answer below.</div>'}${solBlock(pid,q.n)}
       <div class="box ${r==='yes'?'ok':r==='no'?'bad':'grey'}"><div class="row"><b>Did you get it right?</b><button class="btn sm ${r==='yes'?'':'ghost'}" data-pm="yes">✓ Yes</button><button class="btn sm ${r==='no'?'':'ghost'}" data-pm="no">✗ Not yet</button></div>${r==='no'?(()=>{const t=topicOf(pid,q.n);return SUBS[t]?`<div class="small" style="margin-top:8px">📘 This is <b>${esc(topicName(t))}</b>. <a href="#${sh(t)}" data-learn="1">Read the theory →</a> · <a href="#mistakes">All my mistakes →</a></div>`:`<div class="small" style="margin-top:8px"><a href="#mistakes">Saved to My mistakes →</a></div>`})():''}</div>`
     :pAnsBox(id)}
     <div class="row" style="margin-top:12px">${i>0?'<button class="btn ghost sm" id="pqprev">◀ Back</button>':''}${i<qs.length-1?'<button class="btn sm" id="pqnext">Next question ▶</button>':`<a class="btn sm" href="#${boardOf(p)}">Back to the board ▶</a>`}</div>`,'t2 qcard','background-color:#fbf8f1')}
   ${finished?paper(`<h3>🎉 Paper finished!</h3><p>You marked <b>${s.yes}</b> question${s.yes===1?'':'s'} right — about <b>${s.got} of ${s.marks}</b> marks.${s.no?` Press <b>Redo my ✗</b> to try the ${s.no} you missed again.`:' Brilliant — nothing to redo!'}</p>`,'t3','background-color:'+B.col[0]):''}
   <p class="small muted">${p.custom?'Imported by you.':`Source: ${esc(B.long)} file (${esc(paperTitle(p))}). Method written for this site — not an official mark scheme.`}${isParent()?' · <b>Parent mode is on</b> — you can edit answers.':''}</p></section>`;
  const goQ=n=>{R.ppos[pid]=n;UI.preveal=null;UI.mdsel=null;UI.tool='tap';save();render();window.scrollTo(0,0)};
  document.querySelectorAll('[data-pq]').forEach(b=>b.onclick=()=>goQ(+b.dataset.pq));
  const pv=$('#pqprev'),nx=$('#pqnext');if(pv)pv.onclick=()=>goQ(qs[i-1].n);if(nx)nx.onclick=()=>goQ(qs[i+1].n);
  const po=$('#ponly');if(po)po.onclick=()=>{UI.ponly=!UI.ponly;if(UI.ponly){const w=p.qs.find(x=>m[x.n]==='no');if(w)R.ppos[pid]=w.n}UI.preveal=null;save();render()};
  const upd=pBindAns(id,()=>{UI.preveal=id;render()});if(ready)bindInteract(id,upd);
  document.querySelectorAll('[data-pm]').forEach(b=>b.onclick=()=>{logWrong(topicOf(pid,q.n),m[q.n],b.dataset.pm);m[q.n]=b.dataset.pm;save();render()});
  document.querySelectorAll('[data-learn]').forEach(a=>a.onclick=()=>{UI.tab='learn';lastSub=null});
  const eo=$('#ed-open');if(eo)eo.onclick=()=>{UI.editing=pid+'-'+q.n;render()};bindEditor(pid,q.n);
}

function boardTiles(){return Object.entries(BOARDS).map(([bk,B],i)=>{const ps=PAPERS.filter(p=>boardOf(p)===bk);let a=0,d=0;ps.forEach(p=>{const s=pstats(p.id);a+=s.tot;d+=s.done});
  return `<a class="ucard" href="#${bk}">${paper(`<div class="bicon">${B.icon}</div><div class="ub"><div class="uk">${ps.length} PAPERS</div><h3 class="bigt">${B.name.toUpperCase()}</h3>
   <div class="row ubar">${bar(d,a)}<span>${d}/${a}</span></div></div>`,T4[(i+1)%4],`background-color:${B.col[0]}`)}</a>`}).join('')}

function parentPapers(){const rows=PAPERS.slice().sort((a,b)=>a.board.localeCompare(b.board)||b.year-a.year||SESN[b.ses]-SESN[a.ses]||a.paper-b.paper).map(p=>{const s=pstats(p.id);
  return `<tr><td><a href="#p-${p.id}">${esc(paperTitle(p))}</a></td><td>${s.done}/${s.tot}</td><td>${s.done?`${s.yes} ✓ · ${s.no} ✗`:'—'}</td><td>${s.done===s.tot?`${s.got}/${s.marks}`:'—'}</td></tr>`}).join('');
  return `<h2>Test papers · ${esc(learnerName())}</h2><div class="tablewrap paperbg"><table><tr><th>Paper</th><th>Done</th><th>Self-marked</th><th>Marks</th></tr>${rows}</table></div>`}
