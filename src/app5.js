/* ================= merge Units 3–17 ================= */
Object.entries(UT2).forEach(([u,t])=>{UNITS[u]={id:+u,name:'Unit '+u,title:t,subs:UNITSUBS2[u]}});
Object.entries(ST2).forEach(([s,t])=>{SUBS[s]={id:s,unit:+s.split('.')[0],title:t,cards:SUBC2[s]}});
UNITS[1].title='Number and place value';UNITS[2].title='Numbers and sequences';
const UL=Object.keys(UNITS).map(Number).sort((a,b)=>a-b);
const UCOL=[['#c9d9ea','#3f6fa3'],['#cdd8c0','#55704a'],['#f0dca6','#9a6f0e'],['#ead2c6','#a4503d'],['#e7d8bd','#85602f'],['#d9d1e8','#66579a']];
const ucol=u=>UCOL[(u-1)%UCOL.length];
const SYM={1:'4.7',2:'n²',3:'x̄',4:'−3',5:'◇',6:'¾',7:'m²',8:'+.',9:'⅙',10:'×',11:'3D',12:'2:3',13:'∠',14:'÷',15:'▮▮▮',16:'( )',17:'↗'};
const sh=s=>'s'+s.replace('.','-');
const hs=h=>{const m=/^s(\d+)-(\d)$/.exec(h);return m?m[1]+'.'+m[2]:null};
const cardsOf=s=>SUBS[s].qts||SUBS[s].cards;
const cardT=id=>GUIDE[id]?GUIDE[id].t:CARDS[id]?CARDS[id].t:id;
const skT=k=>CARDS[k]?`${CARDS[k].sub} · ${CARDS[k].t}`:skillTitle(k);

/* ================= storage ================= */
const KEY='stage6-maths-rev-v3';let mem=null;
function loadAll(){let d=null;try{d=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){d=mem}
  return d||{learners:[{id:'L1',name:'Learner 1'}],current:'L1',mapOverride:{},data:{}}}
let DB=loadAll();
function save(){mem=DB;try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}if(window.Sync)Sync.pushState()}
function L(){const id=DB.current;if(!DB.data[id])DB.data[id]={seen:{},tried:{},first:{},last:{},exam:{},tests:{}};return DB.data[id]}
function learnerName(){const l=DB.learners.find(x=>x.id===DB.current);return l?l.name:'Learner'}

/* ================= progress ================= */
const skillOfEx=e=>(DB.mapOverride&&DB.mapOverride[e.id])||e.skill;
function examFor(s,kind){return EXAM.filter(e=>skillSub(skillOfEx(e))===s&&(!kind||e.kind===kind))}
const subItems=s=>PRACTICE.filter(p=>p.sub===s);
function stats(s){const R=L(),q=cardsOf(s),p=subItems(s),e=examFor(s);
  return{learn:q.filter(x=>R.tried[x]).length,learnT:q.length,prac:p.filter(x=>R.last[x.id]!==undefined).length,pracT:p.length,exam:e.filter(x=>R.exam[x.id]).length,examT:e.length}}
function nextStep(u){const R=L();
  for(const s of UNITS[u].subs){const st=stats(s);
    if(st.learn<st.learnT){const q=cardsOf(s).find(x=>!R.tried[x]);return{label:`${s} · ${cardT(q)}`,s,tab:'learn',qt:q}}
    if(st.prac<st.pracT)return{label:`${s} Practise`,s,tab:'practise'};
    if(st.exam<st.examT)return{label:`${s} Exam questions`,s,tab:'exam'}}
  if(TESTS[u]&&!L().tests[u])return{label:`Take the ${UNITS[u].name} test`,href:'#test'+u};
  return{label:`Look back over ${UNITS[u].name}`,s:UNITS[u].subs[0],tab:'learn'}}
function unitPct(u){let a=0,b=0;UNITS[u].subs.forEach(s=>{const t=stats(s);a+=t.learn+t.prac+t.exam;b+=t.learnT+t.pracT+t.examT});return b?Math.round(a/b*100):0}
function redoList(u){const R=L(),out=[];
  PRACTICE.forEach(p=>{if(SUBS[p.sub].unit===u&&R.last[p.id]===false)out.push({kind:'prac',id:p.id,s:p.sub,q:p.q,sk:p.qt})});
  EXAM.forEach(e=>{if(e.unit===u&&R.exam[e.id]==='no')out.push({kind:'exam',id:e.id,s:skillSub(skillOfEx(e)),q:`${e.id} · ${e.kind==='P'?'Progression Test':'Checkpoint'} ${e.year}`,sk:skillOfEx(e)})});
  const t=R.tests[u];if(t&&TESTS[u])TESTS[u].forEach(x=>{if(t.res[x.id]===false)out.push({kind:'test',id:x.id,s:QT[x.qt].sub,q:x.q,sk:x.qt})});
  return out}

/* ================= shared UI ================= */
const UI={tab:'learn',qt:null,pidx:0,hint:false,akind:'P',aidx:0,reveal:null};let lastSub=null;
function setTheme(u){const c=u?ucol(u):['#e7dfcf','#2b2e33'];const b=document.body.style;b.setProperty('--th',c[1]);b.setProperty('--ths',c[0])}
function header(){const R=L();const cont=R.lastSub&&SUBS[R.lastSub]?'#'+sh(R.lastSub):'#unit1';
  $('#top').innerHTML=`<a class="brand" href="#home">Paper&nbsp;Maths<small>Stage 6</small></a>
   <nav><a href="#home">HOME</a><a href="#units" id="navunits">UNITS</a><a href="#checkpoint" class="nb" data-ic="🏁">CHECKPOINT</a><a href="#progression" class="nb" data-ic="📈">PROGRESSION</a><a href="#mistakes" class="nb" data-ic="🎯">MISTAKES</a><a href="#parent">PARENT</a><a class="pillbtn" href="${cont}">${R.lastSub?'Continue':'Start'}</a></nav>`;
  $('#navunits').onclick=e=>{if((location.hash||'#home')==='#home'||location.hash===''){e.preventDefault();const g=$('#unitgrid');if(g)g.scrollIntoView({behavior:'smooth'})}else{e.preventDefault();location.hash='#home';setTimeout(()=>{const g=$('#unitgrid');if(g)g.scrollIntoView()},60)}}}
function go(s,tab,extra={}){UI.tab=tab;Object.assign(UI,extra);lastSub=s;if(location.hash!=='#'+sh(s))location.hash='#'+sh(s);else render();window.scrollTo(0,0)}
const bar=(a,b)=>`<span class="mbar"><i style="width:${b?a/b*100:0}%"></i></span>`;
const paper=(inner,cls='',st='',tape=true)=>`<div class="pw ${tape?'taped':''}"><div class="paper ${cls}" style="${st}">${inner}</div></div>`;
const T4=['t1','t2','t3','t4'];

/* ================= Home ================= */
const CHEERS=['Grab a pencil — every picture is hiding a maths trick. Let’s find it! ✏️','Your brain is a muscle. Time for a maths workout! 💪','Small steps every day make a maths superstar. Ready? ⭐','Mistakes are just proof you are trying. Let’s do some maths! 🚀','One picture, one idea, one step closer to Checkpoint. Let’s go! 🎯']
function mascot(){return `<svg class="collage" viewBox="0 0 1200 560" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
 <defs>
  <filter id="pp" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="4" seed="4" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="16" xChannelSelector="R" yChannelSelector="G" result="t"/><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.55 0 0 0 -0.2" result="g"/><feComposite in="g" in2="t" operator="in" result="g2"/><feMerge><feMergeNode in="t"/><feMergeNode in="g2"/></feMerge></filter>
  <filter id="pw" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="11" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="22" xChannelSelector="G" yChannelSelector="R"/></filter>
 </defs>
 <rect width="1200" height="560" fill="#e9e0cf" filter="url(#pp)"/>
 <polygon points="-20,-20 600,-20 470,110 300,230 -20,350" fill="#f4eee3" filter="url(#pw)"/>
 <polygon points="-20,-20 580,-20 450,110 280,220 -20,330" fill="#e2b231" filter="url(#pp)"/>
 <polygon points="-20,300 250,250 330,400 -20,500" fill="#d8cab1" filter="url(#pp)"/>
 <polygon points="960,330 1220,230 1220,580 1060,580 940,470" fill="#f4eee3" filter="url(#pw)"/>
 <polygon points="970,340 1220,245 1220,580 1070,580 950,470" fill="#5f7a4d" filter="url(#pp)"/>
 <polygon points="1100,470 1220,430 1220,580 1080,580" fill="#7a9566" filter="url(#pp)"/>
 <path d="M330 600 C 300 400 330 160 520 95 C 700 30 905 90 965 270 C 1010 410 1000 530 990 600 Z" fill="#f4eee3" filter="url(#pw)"/>
 <path d="M345 600 C 315 400 345 170 525 105 C 700 45 895 100 952 275 C 995 410 985 530 975 600 Z" fill="#4a77aa" filter="url(#pp)"/>
 <path d="M345 600 C 330 480 350 380 420 330 C 520 300 560 420 600 600 Z" fill="#416c9d" filter="url(#pp)"/>
 <circle cx="565" cy="255" r="74" fill="#f4eee3" filter="url(#pp)"/><circle cx="765" cy="248" r="68" fill="#f4eee3" filter="url(#pp)"/>
 <circle cx="592" cy="268" r="33" fill="#2b2e33" filter="url(#pp)"/><circle cx="783" cy="262" r="30" fill="#2b2e33" filter="url(#pp)"/>
 <path d="M598 340 L738 330 Q 712 440 650 430 Q 606 400 598 340 Z" fill="#2b2e33" filter="url(#pp)"/>
 <g stroke="#2b2e33" stroke-width="17" stroke-linecap="round" filter="url(#pp)"><line x1="925" y1="95" x2="955" y2="45"/><line x1="965" y1="160" x2="1035" y2="120"/><line x1="985" y1="225" x2="1060" y2="212"/></g>
</svg>`}
function unitIcon(u){const c=ucol(u);return `<span class="uicon" style="background:${c[1]}">${esc(SYM[u]||u)}</span>`}
function viewHome(){setTheme(0);header();
  const cards=UL.map((u,i)=>{const U=UNITS[u],c=ucol(u),p=unitPct(u);
    return `<a class="ucard" href="#unit${u}">${paper(`${unitIcon(u)}<div class="ub"><div class="uk">UNIT ${u}</div><h3>${esc(U.title)}</h3>
     <div class="us">${U.subs.map(s=>esc(s+' '+SUBS[s].title)).join(' · ')}</div>
     <div class="row ubar">${bar(p,100)}<span>${p}%</span></div></div>`,T4[i%4],`background-color:${c[0]}`)}</a>`}).join('');
  $('#app').innerHTML=`<section class="hero tTB">${mascot()}
</section>
   <section class="wrap herotiles"><div class="ugrid two">${boardTiles()}</div>${mistakeStrip()}</section>
   <section class="wrap"><div class="sechead" id="unitgrid"><h2>Pick a unit</h2><span class="muted">${UL.length} units</span></div><div class="ugrid">${cards}</div></section>`;
}

/* ================= Unit board ================= */
function viewUnit(u){const U=UNITS[u],R=L();setTheme(u);header();const ns=nextStep(u),rl=redoList(u),t=R.tests[u],c=ucol(u);
  const rows=U.subs.map((s,i)=>{const st=stats(s);
    return paper(`<div class="subrow"><span class="sn">${s}</span><div class="si"><h3>${esc(SUBS[s].title)}</h3>
     <div class="prog"><span>📘 Pictures ${st.learn}/${st.learnT} ${bar(st.learn,st.learnT)}</span>${st.pracT?`<span>✏️ Practise ${st.prac}/${st.pracT} ${bar(st.prac,st.pracT)}</span>`:''}${st.examT?`<span>📝 Exam ${st.exam}/${st.examT} ${bar(st.exam,st.examT)}</span>`:''}</div></div>
     <a class="btn" href="#${sh(s)}" data-open="${s}">Open</a></div>`,T4[i%4],`background-color:${i%2?'#f6f1e7':c[0]}`,false)}).join('');
  $('#app').innerHTML=`<section class="wrap"><div class="crumbs"><a href="#home">← All units</a></div>
   <div class="uhero">${paper(`${unitIcon(u)}<div><div class="uk">UNIT ${u}</div><h1>${esc(U.title)}</h1><button class="btn big" id="cont">▶ ${esc(ns.label)}</button></div>`,'t3','background-color:'+c[0])}</div>
   ${rows}
   <div class="ugrid two">${TESTS[u]?`<a class="ucard" href="#test${u}">${paper(`<h3>📝 ${U.name} test</h3><span class="muted small">${t?`Best ${t.best}/${TESTS[u].length} · first try ${t.first}/${TESTS[u].length}`:TESTS[u].length+' mixed questions, no hints'}</span>`,'t1','background-color:#f6f1e7')}</a>`:''}
    <a class="ucard" href="#redo${u}">${paper(`<h3>🔁 Redo my mistakes</h3><span class="muted small">${rl.length?rl.length+' question(s) to redo':'Nothing to redo 🎉'}</span>`,'t2','background-color:#f6f1e7')}</a></div></section>`;
  $('#cont').onclick=()=>{if(ns.href)location.hash=ns.href;else go(ns.s,ns.tab,ns.qt?{qt:ns.qt}:{})};
  document.querySelectorAll('[data-open]').forEach(a=>a.onclick=()=>{UI.tab='learn';lastSub=null});
}

/* ================= Topic page ================= */
function viewSub(s){const S=SUBS[s],U=UNITS[S.unit],R=L();setTheme(S.unit);R.lastSub=s;save();header();
  if(lastSub!==s){lastSub=s;UI.pidx=0;UI.hint=false;UI.aidx=0;UI.reveal=null;UI.akind='P'}
  if(!cardsOf(s).includes(UI.qt))UI.qt=cardsOf(s).find(q=>!R.tried[q])||cardsOf(s)[0];
  const st=stats(s);if((UI.tab==='practise'&&!st.pracT)||(UI.tab==='exam'&&!st.examT))UI.tab='learn';
  const tab=(k,n,lab,a,b)=>`<button class="st ${UI.tab===k?'on':''}" data-tab="${k}"><b>${a===b?'✓':n}</b>${lab}<small>${a}/${b}</small></button>`;
  const body=UI.tab==='practise'?practiseHTML(s):UI.tab==='exam'?examHTML(s):learnHTML(s);
  const i=U.subs.indexOf(s),nx=U.subs[i+1];
  $('#app').innerHTML=`<section class="wrap"><div class="crumbs"><a href="#unit${S.unit}">← ${U.name} · ${esc(U.title)}</a></div><h1 class="th1">${s} · ${esc(S.title)}</h1>
   <div class="steps">${tab('learn',1,'Pictures',st.learn,st.learnT)}${st.pracT?tab('practise',2,'Practise',st.prac,st.pracT):''}${st.examT?tab('exam',st.pracT?3:2,'Exam questions',st.exam,st.examT):''}</div>
   <div id="body">${body}</div>${nx?`<div class="nexttopic"><a class="btn ghost" href="#${sh(nx)}" data-open="1">Next topic: ${nx} ${esc(SUBS[nx].title)} ▶</a></div>`:''}</section>`;
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{UI.tab=b.dataset.tab;UI.hint=false;UI.reveal=null;render();window.scrollTo(0,0)});
  document.querySelectorAll('[data-open]').forEach(a=>a.onclick=()=>{UI.tab='learn';lastSub=null});
  if(UI.tab==='practise')bindPractise(s);else if(UI.tab==='exam')bindExam(s);else bindLearn(s);
}
function card2(id,o={}){const c=CARDS[id],col=ucol(+c.sub.split('.')[0])[1];
  return `<article class="gcard ${o.small?'small':''}" style="--gc:${col}"><div class="gk">CAMBRIDGE PRIMARY MATHEMATICS · STAGE 6</div><h2 class="gt">${esc(c.head)}</h2>
   ${c.s?`<div class="gs">${esc(c.s)}</div><hr>`:''}${c.ex?`<div class="exbox"><b>WORKED EXAMPLE</b><p>${esc(c.ex)}</p></div><div class="meth"><b>METHOD</b> · ${esc(c.m)}</div>`:''}
   <img class="gimg" src="${CIMG[id]}" alt="${esc(c.t+'. '+(c.ex||c.s||''))}" loading="lazy">
   <div class="gref">${esc(c.ref)}</div><div class="gfoot"><span>${esc(c.g.toUpperCase())} · VISUAL METHODS</span><b>${String(c.p).padStart(2,'0')}</b></div></article>`}
const anyCard=(id,o={})=>GUIDE[id]?guideCard(id,o):card2(id,o);

/* ---------- Learn ---------- */
function learnHTML(s){const R=L(),ids=cardsOf(s),idx=ids.indexOf(UI.qt),nx=ids[idx+1],pv=ids[idx-1];
  const tabs=`<div class="ctabs">${ids.map((id,i)=>`<button data-qt="${id}" class="${id===UI.qt?'on':''}"><b>${R.tried[id]?'✓':i+1}</b>${esc(cardT(id))}</button>`).join('')}</div>`;
  const after=nx?`<button class="btn" data-qt="${nx}">Next picture ▶</button>`:(subItems(s).length?`<button class="btn" id="toprac">Go to Practise ▶</button>`:examFor(s).length?`<button class="btn" id="toexam2">Go to Exam questions ▶</button>`:'');
  if(!GUIDE[UI.qt]){R.tried[UI.qt]=1;save();
    return `${tabs}<div class="solo">${paper(card2(UI.qt),'t1 white','',true)}<div class="row navrow">${pv?`<button class="btn ghost" data-qt="${pv}">◀ Previous</button>`:''}<span class="muted small">Picture ${idx+1} of ${ids.length}</span>${after}</div></div>`}
  const q=QT[UI.qt],gd=q.guided,done=R.tried[UI.qt];R.seen[UI.qt]=1;save();
  return`${tabs}<div class="seewrap">${paper(guideCard(UI.qt),'t1 white')}
   ${paper(`<h3>Read the picture</h3><p class="exq">${esc(q.ex.q)}</p><ol>${q.ex.steps.map(t=>`<li>${esc(t)}</li>`).join('')}</ol>
    <div class="ansline">Answer: <b>${esc(q.ex.answer)}</b></div>
    <details class="watch"><summary>⚠️ Common mistake</summary><p><b>${esc(q.mistake.wrong)}</b> — ${esc(q.mistake.why)}</p><p>✔ ${esc(q.mistake.fix)}</p></details>
    <div class="try"><h3>✏️ Your turn</h3><p class="tq">${esc(gd.text)}</p>${partsHTML(gd,'gd')}<button class="btn" id="gcheck">Check</button><div id="gfb">${done?`<div class="box ok small">✓ Done</div>`:''}</div></div>
    <div class="row" style="margin-top:12px">${after}</div>`,'t3 readit','background-color:#fbf8f1',false)}</div>`}
function bindLearn(s){const R=L();
  document.querySelectorAll('[data-qt]').forEach(b=>b.onclick=()=>{UI.qt=b.dataset.qt;render();window.scrollTo(0,0)});
  const tp=$('#toprac');if(tp)tp.onclick=()=>{UI.tab='practise';render();window.scrollTo(0,0)};
  const te=$('#toexam2');if(te)te.onclick=()=>{UI.tab='exam';render();window.scrollTo(0,0)};
  const gc=$('#gcheck');if(!gc)return;const q=QT[UI.qt];
  gc.onclick=()=>{const vals=readParts(q.guided,'gd');if(vals.every(v=>!String(v).trim())){toast('Type an answer first.');return}
    const m=markItem(q.guided,vals);showMarks(q.guided,'gd',m.res);R.tried[UI.qt]=1;save();
    $('#gfb').innerHTML=`<div class="box ${m.ok?'ok':'warn'} small"><b>${m.ok?'Well done!':'Not quite.'}</b> ${esc(q.guided.expl)}</div>`;updTabs(s)};
}

/* ---------- 'finish first' answer box ---------- */
function ansBox(id){const R=L();R.ans=R.ans||{};R.fin=R.fin||{};const a=R.ans[id]||'';
  if(R.fin[id])return`<div class="box mine"><b>Your answer:</b> ${esc(a)}</div><div class="row"><button class="btn" id="ashow">Show the answer</button><button class="btn ghost sm" id="aedit">✎ Change my answer</button></div>`;
  return`<label class="small" for="aans"><b>Your answer</b> — work it out on paper, then write your final answer here.</label><textarea id="aans" placeholder="e.g. 54 and 120">${esc(a)}</textarea>
   <div class="row" style="margin-top:6px"><button class="btn" id="adone" ${a.trim()?'':'disabled'}>I'm done ✓</button><span class="small muted" id="ahint">${a.trim()?'':'Write an answer first.'}</span></div>`}
function bindAnsBox(id,onShow){const R=L();const t=$('#aans'),d=$('#adone');
  if(t){t.oninput=()=>{R.ans[id]=t.value;d.disabled=!t.value.trim();$('#ahint').textContent=t.value.trim()?'':'Write an answer first.'};
    d.onclick=()=>{if(!t.value.trim())return;R.ans[id]=t.value.trim();R.fin[id]=1;save();render()}}
  const e=$('#aedit');if(e)e.onclick=()=>{delete R.fin[id];save();render()};
  const sh=$('#ashow');if(sh)sh.onclick=onShow}
const mine=id=>{const a=(L().ans||{})[id];return a?`<div class="box mine"><b>Your answer:</b> ${esc(a)}</div>`:''};

/* ---------- Practise ---------- */
function practiseHTML(s){const items=subItems(s),R=L(),i=Math.min(UI.pidx,items.length-1),it=items[i],last=R.last[it.id],isOpen=it.self||it.parts.some(p=>p.spec.t==='open');
  const dots=`<div class="dots">${items.map((x,k)=>`<button data-pi="${k}" class="${k===i?'on':''} ${R.last[x.id]===true?'ok':R.last[x.id]===false?'bad':''}">${k+1}</button>`).join('')}</div>`;
  const shown=last!==undefined||UI.reveal===it.id;
  return`${dots}${paper(`<div class="row between"><span class="pill">${esc(cardT(it.qt))}</span>${it.gen?'<span class="pill gen">Generated question</span>':`<span class="pill src">${esc(it.src)}</span>`}</div>
   <p class="q">${esc(it.q)}</p>${isOpen?(shown?'':ansBox(it.id)):partsHTML(it,'pp')}
   <div class="row" style="margin-top:8px">${isOpen?'':`<button class="btn" id="pcheck">Check</button>`}${!shown?`<button class="btn ghost" id="phint">💡 Hint</button>`:''}</div>
   ${UI.hint&&!shown?`<div class="hintbox">${anyCard(it.qt,{small:true})}</div>`:''}
   <div id="pfb">${shown?feedback(it,last,isOpen):''}</div>
   <div class="row" style="margin-top:12px">${i>0?'<button class="btn ghost sm" id="pprev">◀ Back</button>':''}${i<items.length-1?'<button class="btn sm" id="pnext">Next question ▶</button>':examFor(s).length?'<button class="btn sm" id="toexam">Go to Exam questions ▶</button>':''}</div>`,'t2 qcard','background-color:#fbf8f1')}`}
function feedback(it,ok,isOpen){
  const head=isOpen?(ok===undefined?`<div class="row"><b>Did you get it?</b><button class="btn sm" data-self="1">✓ Yes</button><button class="btn sm ghost" data-self="0">✗ Not yet</button></div>`:`<div class="row"><b>${ok?'✓ Marked as correct':'✗ Marked as not yet'}</b><button class="btn sm ghost" data-self="${ok?0:1}">Change</button></div>`):`<b>${ok?'✓ Correct!':'✗ Not yet — compare with the picture below.'}</b>`;
  return`${isOpen?mine(it.id):''}<div class="box ${ok===true?'ok':ok===false?'bad':'grey'}">${head}<div style="margin-top:6px"><b>Answer:</b> ${esc(it.expl)}</div></div>${solHTML(it.id)}`}
function bindPractise(s){const items=subItems(s),R=L(),i=Math.min(UI.pidx,items.length-1),it=items[i];
  document.querySelectorAll('[data-pi]').forEach(b=>b.onclick=()=>{UI.pidx=+b.dataset.pi;UI.hint=false;UI.reveal=null;render()});
  const h=$('#phint');if(h)h.onclick=()=>{UI.hint=!UI.hint;render()};
  const pv=$('#pprev'),nx=$('#pnext'),te=$('#toexam');if(pv)pv.onclick=()=>{UI.pidx=i-1;UI.hint=false;UI.reveal=null;render()};if(nx)nx.onclick=()=>{UI.pidx=i+1;UI.hint=false;UI.reveal=null;render()};
  if(te)te.onclick=()=>{UI.tab='exam';render();window.scrollTo(0,0)};
  const pc=$('#pcheck');if(pc)pc.onclick=()=>{const vals=readParts(it,'pp');if(vals.every(v=>!String(v).trim())){toast('Type an answer first.');return}
    const m=markItem(it,vals);if(R.first[it.id]===undefined)R.first[it.id]=m.ok&&!UI.hint;R.last[it.id]=m.ok;save();
    showMarks(it,'pp',m.res);$('#pfb').innerHTML=feedback(it,m.ok,false);updTabs(s);pc.textContent='Check again'};
  bindAnsBox(it.id,()=>{UI.reveal=it.id;render()});
  document.querySelectorAll('[data-self]').forEach(b=>b.onclick=()=>{const ok=b.dataset.self==='1';if(R.first[it.id]===undefined)R.first[it.id]=ok;R.last[it.id]=ok;save();render()});
}
function updTabs(s){const st=stats(s);const m={learn:[st.learn,st.learnT],practise:[st.prac,st.pracT],exam:[st.exam,st.examT]};
  Object.entries(m).forEach(([k,v])=>{const e=document.querySelector(`.steps [data-tab="${k}"] small`);if(e)e.textContent=v[0]+'/'+v[1]})}

/* ---------- Exam questions ---------- */
function examHTML(s){const R=L(),P=examFor(s,'P'),C=examFor(s,'C');if(!P.length&&C.length)UI.akind='C';
  const list=UI.akind==='P'?P:C,done=a=>a.filter(e=>R.exam[e.id]).length;
  const seg=`<div class="seg"><button data-ak="P" class="${UI.akind==='P'?'on':''}">Progression Test ${done(P)}/${P.length}</button><button data-ak="C" class="${UI.akind==='C'?'on':''}">Checkpoint ${done(C)}/${C.length}</button></div>`;
  if(!list.length)return seg+`<div class="empty">No questions here.</div>`;
  const i=Math.min(UI.aidx,list.length-1),e=list[i],r=R.exam[e.id],shown=r||UI.reveal===e.id;
  const dots=`<div class="dots">${list.map((x,k)=>`<button data-ai="${k}" class="${k===i?'on':''} ${R.exam[x.id]==='yes'?'ok':R.exam[x.id]==='no'?'bad':''}">${k+1}</button>`).join('')}</div>`;
  return`${seg}${dots}${paper(`<div class="row between"><span class="pill src">${esc(e.id)} · ${esc(e.year)} · Paper ${e.paper}</span><span class="pill">${esc(skT(skillOfEx(e)))}</span></div>
   <div class="qimgwrap"><img class="qimg" src="${QIMG[e.id]}" alt="Original exam question ${esc(e.id)}"></div>
   ${shown?`${mine(e.id)}<div class="box ${r==='yes'?'ok':r==='no'?'bad':'grey'}"><b>Answer:</b> ${esc(e.answer)}
     <div class="row" style="margin-top:8px"><b>Did you get it?</b><button class="btn sm ${r==='yes'?'':'ghost'}" data-ex="yes">✓ Yes</button><button class="btn sm ${r==='no'?'':'ghost'}" data-ex="no">✗ Not yet</button></div></div>${solHTML(e.id)}`
     :ansBox(e.id)}
   <div class="row" style="margin-top:12px">${i>0?'<button class="btn ghost sm" id="aprev">◀ Back</button>':''}${i<list.length-1?'<button class="btn sm" id="anext">Next question ▶</button>':''}</div>
   <div class="small muted" style="margin-top:8px">Source: ${e.kind==='P'?'Progression Test':'Checkpoint'} ${esc(e.year)}, Paper ${e.paper}, Q${e.oq} (PDF p. ${e.srcpage})${e.related?' · also uses Unit '+esc(e.related):''}. Study answers from your file, not an official mark scheme.</div>`,'t2 qcard','background-color:#fbf8f1')}`}
function bindExam(s){const R=L(),list=examFor(s,UI.akind),i=Math.min(UI.aidx,Math.max(0,list.length-1)),e=list[i];
  document.querySelectorAll('[data-ak]').forEach(b=>b.onclick=()=>{UI.akind=b.dataset.ak;UI.aidx=0;UI.reveal=null;render()});
  document.querySelectorAll('[data-ai]').forEach(b=>b.onclick=()=>{UI.aidx=+b.dataset.ai;UI.reveal=null;render()});
  const pv=$('#aprev'),nx=$('#anext');if(pv)pv.onclick=()=>{UI.aidx=i-1;UI.reveal=null;render()};if(nx)nx.onclick=()=>{UI.aidx=i+1;UI.reveal=null;render()};
  bindAnsBox(e.id,()=>{UI.reveal=e.id;render()});
  document.querySelectorAll('[data-ex]').forEach(b=>b.onclick=()=>{R.exam[e.id]=b.dataset.ex;save();render()});
}

/* ================= Unit test (Units 1–2) ================= */
function viewTest(u){const U=UNITS[u],R=L();setTheme(u);header();const T=TESTS[u],t=R.tests[u];
  $('#app').innerHTML=`<section class="wrap"><div class="crumbs"><a href="#unit${u}">← ${U.name}</a></div><h1 class="th1">📝 ${U.name} test</h1>
   <p class="muted">${T.length} mixed questions. No hints — answer everything, then press <b>Finish</b>. <span class="pill gen">Generated questions</span></p>
   ${T.map((x,k)=>paper(`<p class="q">${k+1}. ${esc(x.q)}</p>${partsHTML(x,'tt'+k)}<div id="tr${k}"></div>`,T4[k%4]+' qcard','background-color:#fbf8f1',false)).join('')}
   <div class="row"><button class="btn big" id="tfin">Finish</button><a class="btn ghost" href="#unit${u}">Back</a></div><div id="tsum"></div></section>`;
  $('#tfin').onclick=()=>{let sc=0;const resd={};T.forEach((x,k)=>{const m=markItem(x,readParts(x,'tt'+k));showMarks(x,'tt'+k,m.res);resd[x.id]=m.ok;if(m.ok)sc++;
      $('#tr'+k).innerHTML=m.ok?'':`<div class="box bad small"><b>Answer:</b> ${esc(x.parts.map(p=>ansText(p.spec)).join(' · '))} · <a href="#${sh(QT[x.qt].sub)}" data-rl="${x.qt}">Look at the picture: ${esc(GUIDE[x.qt].t)}</a></div>`});
    R.tests[u]={first:t?t.first:sc,best:Math.max(sc,t?t.best:0),res:resd,date:todayStr()};save();
    $('#tsum').innerHTML=`<div class="box ${sc===T.length?'ok':'tip'}" style="font-size:20px"><b>Score: ${sc} / ${T.length}</b> ${sc===T.length?'🎉 Perfect!':'· Wrong answers are now in “Redo my mistakes”.'}</div>`;
    document.querySelectorAll('[data-rl]').forEach(a=>a.onclick=()=>{UI.tab='learn';UI.qt=a.dataset.rl;lastSub=null});
    $('#tfin').textContent='Finish again';$('#tsum').scrollIntoView({behavior:'smooth'})};
}

/* ================= Redo mistakes ================= */
function viewRedo(u){const U=UNITS[u];setTheme(u);header();const list=redoList(u);
  $('#app').innerHTML=`<section class="wrap"><div class="crumbs"><a href="#unit${u}">← ${U.name}</a></div><h1 class="th1">🔁 Redo my mistakes</h1>
   ${list.length?`<p class="muted">Look at the picture again, then redo the question. It leaves this list when you get it right.</p>`+list.map((m,k)=>paper(`<div class="redo"><div><span class="pill">${m.kind==='prac'?'Practise':m.kind==='exam'?'Exam question':'Unit test'}</span> <span class="pill src">${esc(skT(m.sk))}</span><p style="margin:8px 0 0;font-weight:700">${esc(m.q)}</p></div>
     <div class="row">${GUIDE[m.sk]||CARDS[m.sk]?`<button class="btn ghost sm" data-rl="${k}">📘 Picture</button>`:''}<button class="btn sm" data-rd="${k}">Redo ▶</button></div></div>`,T4[k%4],'background-color:#fbf8f1',false)).join(''):'<div class="empty">Nothing to redo. 🎉</div>'}</section>`;
  document.querySelectorAll('[data-rl]').forEach(b=>b.onclick=()=>{const m=list[+b.dataset.rl];go(m.s,'learn',{qt:m.sk})});
  document.querySelectorAll('[data-rd]').forEach(b=>b.onclick=()=>{const m=list[+b.dataset.rd];
    if(m.kind==='prac'){const idx=subItems(m.s).findIndex(p=>p.id===m.id);UI.pidx=idx;UI.hint=false;UI.reveal=null;delete L().last[m.id];if(L().fin)delete L().fin[m.id];save();go(m.s,'practise')}
    else if(m.kind==='exam'){const e=EXAM.find(x=>x.id===m.id);const l=examFor(m.s,e.kind);UI.akind=e.kind;UI.aidx=l.findIndex(x=>x.id===m.id);UI.reveal=null;delete L().exam[m.id];if(L().fin)delete L().fin[m.id];save();go(m.s,'exam')}
    else location.hash='#test'+u});
}

/* ================= Parent ================= */
function viewParent(){setTheme(0);header();const R=L();
  const prog=UL.map(u=>`<tr class="urow"><td colspan="4"><b>Unit ${u} · ${esc(UNITS[u].title)}</b>${R.tests[u]?` — test: first try ${R.tests[u].first}/${TESTS[u].length}, best ${R.tests[u].best}`:''}</td></tr>`+UNITS[u].subs.map(s=>{const st=stats(s),p=subItems(s),e=examFor(s);
    return`<tr><td>${s} ${esc(SUBS[s].title)}</td><td>${st.learn}/${st.learnT}</td><td>${p.length?`${p.filter(x=>R.first[x.id]===true).length} right first time · ${st.prac}/${p.length} done`:'—'}</td><td>${e.length?`${e.filter(x=>R.exam[x.id]==='yes').length} ✓ · ${e.filter(x=>R.exam[x.id]==='no').length} ✗ of ${e.length}`:'—'}</td></tr>`}).join('')).join('');
  $('#app').innerHTML=`<section class="wrap"><h1 class="th1">Parent page</h1>
  ${paper(`<h3>Learners</h3>${DB.learners.map(l=>`<div class="row" style="margin:4px 0"><input class="inp" value="${esc(l.name)}" data-ln="${l.id}"><button class="btn sm ${l.id===DB.current?'':'ghost'}" data-use="${l.id}">${l.id===DB.current?'Current':'Switch'}</button></div>`).join('')}
   <div class="row" style="margin-top:8px"><input class="inp" id="newl" placeholder="New learner name"><button class="btn sm" id="addl">Add</button></div><p class="small muted">Progress is saved in this browser only.</p>`,'t1','background-color:#fbf8f1')}
  <h2>Progress · ${esc(learnerName())}</h2><div class="tablewrap paperbg"><table><tr><th>Topic</th><th>Pictures</th><th>Practise</th><th>Exam (self-marked)</th></tr>${prog}</table></div>
  ${paper(`<h3 style="margin-top:0">Parent tools</h3><div class="row"><label class="row" style="gap:8px;cursor:pointer"><input type="checkbox" id="pmode" ${isParent()?'checked':''}> <b>Parent mode</b> — show “✎ Edit answer” on test papers so you can correct an answer or method</label></div>
   <div class="row" style="margin-top:10px"><a class="btn sm" href="#import">📥 Import exercises</a><a class="btn sm ghost" href="#import">⬇ Backup / move to another device</a><a class="btn sm ghost" href="#mistakes">🎯 ${esc(learnerName())}'s mistakes</a></div>`,'t2','background-color:#fbf8f1',false)}${parentPapers()}<h2>Sources</h2>${paper(`<ul class="small"><li><b>Visual Maths Guides</b> — Units 1–2 (23 pages), Units 3–4 (25), Units 5–7 (46), Units 8–17 (122). Every method page is a picture card in Learn: ${Object.keys(GUIDE).length+Object.keys(CARDS).length} cards.</li>
   <li><b>Practice from the guides</b> — Units 1–2: 19 questions; Units 3–4: 20 “Your turn” questions with the guide’s answers. The Units 5–17 guides have no practice sheets.</li>
   <li><b>Progression Test + Checkpoint</b> — 121 Units 1–2 questions sorted into topics, plus full papers on the boards: ${PAPERS.filter(p=>p.board==='C').length} Checkpoint papers and ${PAPERS.filter(p=>p.board==='P').length} Progression Test papers (${PAPERS.reduce((a,p)=>a+p.qs.length,0)} questions). No mark schemes were in the files, so every answer and method was worked out for this site.</li>
   <li><b>Made for this site</b> (labelled “Generated”): Your-turn questions in Units 1–2, unit tests, and all solution diagrams.</li></ul>`,'t3','background-color:#fbf8f1')}
  <details class="paperbg dt"><summary>Exam question → topic mapping (${EXAM.length})</summary><p class="small muted">Change a topic if you disagree; the question moves there.</p><div class="tablewrap"><table><tr><th>Question</th><th>Answer</th><th>Topic / skill</th></tr>${EXAM.map(e=>`<tr><td><b>${e.id}</b><div class="small muted">Unit ${e.unit} · ${e.kind==='P'?'Progression':'Checkpoint'} ${esc(e.year)}</div></td><td class="small">${esc(e.answer)}</td><td><select data-map="${e.id}">${Object.keys(GUIDE).concat(Object.keys(EXTRA)).filter(k=>skillSub(k)[0]==String(e.unit)).map(k=>`<option value="${k}" ${k===skillOfEx(e)?'selected':''}>${esc(skillTitle(k))}</option>`).join('')}</select></td></tr>`).join('')}</table></div></details>
  <div style="margin:16px 0"><button class="btn sm ghost" id="reset">Clear ${esc(learnerName())}’s progress</button></div></section>`;
  document.querySelectorAll('[data-ln]').forEach(i=>i.onchange=()=>{DB.learners.find(l=>l.id===i.dataset.ln).name=i.value.trim()||'Learner';save();render()});
  document.querySelectorAll('[data-use]').forEach(b=>b.onclick=()=>{DB.current=b.dataset.use;save();lastSub=null;render()});
  $('#pmode').onchange=e=>{DB.parentMode=e.target.checked;save();toast(DB.parentMode?'Parent mode on':'Parent mode off')};
  $('#addl').onclick=()=>{const n=$('#newl').value.trim();if(!n)return;const id='L'+Date.now();DB.learners.push({id,name:n});DB.current=id;save();lastSub=null;render()};
  document.querySelectorAll('[data-map]').forEach(sl=>sl.onchange=()=>{const e=EXAM.find(x=>x.id===sl.dataset.map);if(sl.value===e.skill)delete DB.mapOverride[e.id];else DB.mapOverride[e.id]=sl.value;save();toast('Saved')});
  $('#reset').onclick=e=>{const b=e.target;if(b.dataset.sure){delete DB.data[DB.current];save();render();toast('Cleared')}else{b.dataset.sure=1;b.textContent='Click again to confirm'}};
}

/* ================= router ================= */
function render(){const h=(location.hash||'#home').slice(1),sub=hs(h);let m;
  if((m=/^unit(\d+)$/.exec(h))&&UNITS[m[1]])viewUnit(+m[1]);else if(sub&&SUBS[sub])viewSub(sub);
  else if((m=/^test(\d+)$/.exec(h))&&TESTS[m[1]])viewTest(+m[1]);else if((m=/^redo(\d+)$/.exec(h))&&UNITS[m[1]])viewRedo(+m[1]);
  else if(h==='parent')viewParent();else if(BOARDS[h])viewBoard(h);else if(h==='mistakes')viewMistakes();else if(h==='import')viewImport();else if((m=/^p-(\w+)$/.exec(h))&&PBY[m[1]])viewPaper(m[1]);else viewHome();
  $('#foot').innerHTML=`<nav><a href="#home">HOME</a><span>•</span><a href="#home" onclick="setTimeout(()=>{const g=document.getElementById('unitgrid');if(g)g.scrollIntoView()},60)">UNITS</a><span>•</span><a href="#checkpoint">CHECKPOINT</a><span>•</span><a href="#progression">PROGRESSION</a><span>•</span><a href="#mistakes">MISTAKES</a><span>•</span><a href="#parent">PARENT</a></nav><div class="oval">Paper Maths</div><p>Built from your Visual Maths Guides and Progression Test + Checkpoint file. Not an official Cambridge publication.</p>`}
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0)});
render();
