/* ================= edits · topics · imports · mistakes ================= */
const TOPICS=()=>Object.keys(SUBS).sort((a,b)=>{const[x,y]=a.split('.').map(Number),[u,v]=b.split('.').map(Number);return x-u||y-v});
const topicName=t=>SUBS[t]?`${t} ${SUBS[t].title}`:'Other';
const topicSelect=(sel,attr='')=>`<select ${attr}>${TOPICS().map(t=>`<option value="${t}" ${t===sel?'selected':''}>${esc(topicName(t))}</option>`).join('')}<option value="" ${!sel?'selected':''}>Other / not sure</option></select>`;
const isParent=()=>!!DB.parentMode;
function EDITS(){DB.edits=DB.edits||{};return DB.edits}
function qObj(pid,n){const p=PBY[pid];return p&&p.qs.find(q=>q.n===n)}
function solOf(pid,n){const base=(PSOL[pid]||{})[n]||(qObj(pid,n)||{}).sol||{a:'',s:[]};const e=(EDITS()[pid]||{})[n];
  if(!e)return base;return{...base,a:e.a!=null?e.a:base.a,s:e.s!=null?e.s:base.s,d:e.s!=null&&e.keepD===false?[]:base.d,edited:true}}
function topicOf(pid,n){const e=(EDITS()[pid]||{})[n];if(e&&e.t!=null)return e.t;const q=qObj(pid,n);if(q&&q.t!=null)return q.t;return PTOPIC[pid+'-'+n]||''}

/* ---------- answer editor (parent mode) ---------- */
function editorHTML(pid,n){const S=solOf(pid,n);
  return `<div class="editbox paperbg"><b>✎ Edit this answer</b> <span class="small muted">(saved in this browser · included in Backup)</span>
   <label class="small">Answer</label><textarea id="ed-a" rows="2">${esc(S.a||'')}</textarea>
   <label class="small">Method — one step per line</label><textarea id="ed-s" rows="5">${esc((S.s||[]).join('\n'))}</textarea>
   <label class="small">Topic (used for the Mistakes page)</label>${topicSelect(topicOf(pid,n),'id="ed-t"')}
   <div class="row" style="margin-top:8px"><button class="btn sm" id="ed-save">Save</button><button class="btn sm ghost" id="ed-cancel">Cancel</button>${(EDITS()[pid]||{})[n]?'<button class="btn sm ghost" id="ed-reset">Undo my edits</button>':''}</div></div>`}
function bindEditor(pid,n){const E=EDITS();
  const sv=$('#ed-save');if(!sv)return;
  sv.onclick=()=>{const S0=(PSOL[pid]||{})[n]||(qObj(pid,n)||{}).sol||{a:'',s:[]};const a=$('#ed-a').value.trim(),s=$('#ed-s').value.split('\n').map(x=>x.trim()).filter(Boolean),t=$('#ed-t').value;
    E[pid]=E[pid]||{};const e={};if(a!==S0.a)e.a=a;if(JSON.stringify(s)!==JSON.stringify(S0.s||[])){e.s=s;e.keepD=false}if(t!==(PTOPIC[pid+'-'+n]||(qObj(pid,n)||{}).t||''))e.t=t;
    if(Object.keys(e).length)E[pid][n]=e;else delete E[pid][n];UI.editing=null;save();toast('Saved');render()};
  $('#ed-cancel').onclick=()=>{UI.editing=null;render()};
  const rs=$('#ed-reset');if(rs)rs.onclick=()=>{delete E[pid][n];UI.editing=null;save();toast('Back to the original answer');render()}}

/* ---------- custom papers (IndexedDB) ---------- */
const IDB={db:null,open(){return new Promise(res=>{try{const r=indexedDB.open('paper-maths-custom',1);r.onupgradeneeded=()=>r.result.createObjectStore('papers',{keyPath:'id'});r.onsuccess=()=>{this.db=r.result;res(this.db)};r.onerror=()=>res(null)}catch(e){res(null)}})},
  async all(){const d=this.db||await this.open();if(!d)return[];return new Promise(res=>{const q=d.transaction('papers').objectStore('papers').getAll();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>res([])})},
  async put(p){const d=this.db||await this.open();if(!d)throw new Error('no storage');return new Promise((res,rej)=>{const t=d.transaction('papers','readwrite');t.objectStore('papers').put(p);t.oncomplete=()=>{if(window.Sync)Sync.pushPaper(p);res()};t.onerror=()=>rej(t.error)})},
  async del(id){const d=this.db||await this.open();if(!d)return;return new Promise(res=>{const t=d.transaction('papers','readwrite');t.objectStore('papers').delete(id);t.oncomplete=()=>{if(window.Sync)Sync.dropPaper(id);res()}})}};
function mountCustom(p){const old=PAPERS.findIndex(x=>x.id===p.id);if(old>=0)PAPERS.splice(old,1);
  window.PIMG=window.PIMG||{};Object.entries(p.imgs||{}).forEach(([c,im])=>{PIMG[c]=im.d;GEO[c]={w:im.w,h:im.h}});
  const q={...p,custom:true};PAPERS.push(q);PBY[p.id]=q}
function unmountCustom(id){const i=PAPERS.findIndex(x=>x.id===id);if(i>=0)PAPERS.splice(i,1);delete PBY[id]}
let CUSTOM_READY=false;
IDB.all().then(list=>{list.forEach(mountCustom);CUSTOM_READY=true;if(list.length)render()});

function imgToData(file){return new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const W=Math.min(1000,im.naturalWidth),H=Math.round(im.naturalHeight*W/im.naturalWidth);
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,W,H);g.drawImage(im,0,0,W,H);
  let d=cv.toDataURL('image/webp',0.82);if(!d.startsWith('data:image/webp'))d=cv.toDataURL('image/jpeg',0.85);res({d,w:W,h:H})};im.onerror=rej;im.src=fr.result};fr.onerror=rej;fr.readAsDataURL(file)})}

/* ---------- import page ---------- */
function newDraft(){return{id:null,title:'',board:'C',year:new Date().getFullYear(),qs:[]}}
function viewImport(){setTheme(0);header();UI.imp=UI.imp||newDraft();const D=UI.imp;const mine=PAPERS.filter(p=>p.custom);
  $('#app').innerHTML=`<section class="wrap solo"><div class="crumbs"><a href="#parent">← Parent page</a></div><h1 class="th1">📥 Import exercises</h1>
  ${paper(`<p class="small">Add your own questions to the <b>Checkpoint</b> or <b>Progression</b> board. For each question: take a screenshot (or crop a photo / scan) and add it here, then type the answer and the method. Questions work exactly like the built-in ones — the child answers on the picture with the pen, line and ring tools.</p>
   <div class="grid2"><label class="small">Paper name<input class="inp" id="im-title" value="${esc(D.title)}" placeholder="e.g. Mock test 1 – Paper 1"></label>
   <label class="small">Board<select id="im-board"><option value="C" ${D.board==='C'?'selected':''}>Checkpoint board</option><option value="P" ${D.board==='P'?'selected':''}>Progression Test board</option></select></label></div>
   <div class="dropzone" id="im-drop" tabindex="0"><b>➕ Add question pictures</b><br><span class="small">Click to choose images (one image = one question) · drag & drop · or paste a screenshot (Ctrl+V)</span><input type="file" id="im-file" accept="image/*" multiple hidden></div>
   <div id="im-qs">${D.qs.map((q,i)=>`<div class="impq"><div class="row between"><b>Question ${i+1}</b><span><button class="btn sm ghost" data-up="${i}" ${i?'':'disabled'}>↑</button> <button class="btn sm ghost" data-del="${i}">✕ Remove</button></span></div>
     <img src="${q.img.d}" alt="question ${i+1}">
     <div class="grid2"><label class="small">Answer<textarea data-f="a" data-i="${i}" rows="2" placeholder="The correct answer">${esc(q.a||'')}</textarea></label>
     <label class="small">Method — one step per line<textarea data-f="s" data-i="${i}" rows="3" placeholder="Step 1&#10;Step 2">${esc(q.s||'')}</textarea></label></div>
     <div class="grid2"><label class="small">Topic${topicSelect(q.t||'',`data-f="t" data-i="${i}"`)}</label><label class="small">Marks<input class="inp" type="number" min="1" max="9" data-f="m" data-i="${i}" value="${q.m||1}"></label></div></div>`).join('')}</div>
   <div class="row" style="margin-top:10px"><button class="btn" id="im-save" ${D.qs.length?'':'disabled'}>💾 ${D.id?'Save changes':'Save paper'}</button>${D.id||D.qs.length?'<button class="btn ghost sm" id="im-new">Start a new paper</button>':''}<span class="small muted">${D.qs.length} question(s)</span></div>`,'t2','background-color:#fbf8f1',false)}
  <h2>My imported papers</h2>${mine.length?mine.map(p=>paper(`<div class="row between"><div><b>${esc(p.title)}</b><div class="small muted">${p.board==='C'?'Checkpoint':'Progression'} board · ${p.qs.length} questions</div></div>
     <span><a class="btn sm" href="#p-${p.id}">Open</a> <button class="btn sm ghost" data-edp="${p.id}">✎ Edit</button> <button class="btn sm ghost" data-rmp="${p.id}">🗑 Delete</button></span></div>`,'t1','background-color:#f6f1e7',false)).join(''):'<p class="muted">None yet.</p>'}
  <h2>Backup &amp; move to another device</h2>${paper(`<p class="small">Download one file with your imported papers, your answer corrections and every learner's progress. Load it on another computer or browser to carry on there.</p>
   <div class="row"><button class="btn sm" id="bk-out">⬇ Download backup</button><label class="btn sm ghost" style="cursor:pointer">⬆ Load backup<input type="file" id="bk-in" accept=".json,application/json" hidden></label></div>`,'t3','background-color:#fbf8f1',false)}</section>`;
  const keep=()=>{D.title=$('#im-title').value;D.board=$('#im-board').value};
  $('#im-title').oninput=keep;$('#im-board').onchange=keep;
  const addFiles=async fs=>{keep();for(const f of fs){if(!/^image\//.test(f.type))continue;try{D.qs.push({img:await imgToData(f),a:'',s:'',t:'',m:1})}catch(e){toast('Could not read '+f.name)}}viewImport()};
  const dz=$('#im-drop'),fi=$('#im-file');dz.onclick=()=>fi.click();fi.onchange=()=>addFiles([...fi.files]);
  dz.ondragover=e=>{e.preventDefault();dz.classList.add('over')};dz.ondragleave=()=>dz.classList.remove('over');dz.ondrop=e=>{e.preventDefault();addFiles([...e.dataTransfer.files])};
  document.onpaste=e=>{if(location.hash!=='#import')return;const fs=[...(e.clipboardData||{}).items||[]].filter(i=>i.type.startsWith('image/')).map(i=>i.getAsFile());if(fs.length){e.preventDefault();addFiles(fs)}};
  document.querySelectorAll('[data-f]').forEach(el=>el.oninput=el.onchange=()=>{D.qs[+el.dataset.i][el.dataset.f]=el.value});
  document.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{keep();D.qs.splice(+b.dataset.del,1);viewImport()});
  document.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{keep();const i=+b.dataset.up;[D.qs[i-1],D.qs[i]]=[D.qs[i],D.qs[i-1]];viewImport()});
  const nw=$('#im-new');if(nw)nw.onclick=()=>{UI.imp=newDraft();viewImport()};
  $('#im-save').onclick=async()=>{keep();if(!D.title.trim()){toast('Give the paper a name.');$('#im-title').focus();return}
    const id=D.id||('u'+Date.now().toString(36));const imgs={};
    const qs=D.qs.map((q,i)=>{const c=`${id}_q${i+1}`;imgs[c]=q.img;return{n:i+1,crops:[c],marks:+q.m||1,t:q.t||'',sol:{a:q.a.trim(),s:q.s.split('\n').map(x=>x.trim()).filter(Boolean)}}});
    const p={id,title:D.title.trim(),board:D.board,year:D.year,ses:'',paper:1,qs,imgs};
    try{await IDB.put(p);mountCustom(p);UI.imp=newDraft();toast('Saved to the '+(p.board==='C'?'Checkpoint':'Progression')+' board');location.hash='#p-'+id}catch(e){toast('Could not save — browser storage is full or blocked.')}};
  document.querySelectorAll('[data-edp]').forEach(b=>b.onclick=()=>{const p=PBY[b.dataset.edp];
    UI.imp={id:p.id,title:p.title,board:p.board,year:p.year,qs:p.qs.map(q=>({img:p.imgs[q.crops[0]],a:q.sol.a,s:(q.sol.s||[]).join('\n'),t:q.t,m:q.marks}))};viewImport();window.scrollTo(0,0)});
  document.querySelectorAll('[data-rmp]').forEach(b=>b.onclick=async()=>{if(!b.dataset.sure){b.dataset.sure=1;b.textContent='Click again to delete';return}await IDB.del(b.dataset.rmp);unmountCustom(b.dataset.rmp);toast('Deleted');viewImport()});
  $('#bk-out').onclick=async()=>{const list=await IDB.all();const txt=JSON.stringify({app:'paper-maths',v:1,date:new Date().toISOString(),db:DB,custom:list});const fn='paper-maths-backup-'+new Date().toISOString().slice(0,10)+'.json';
    try{const dl=window.claude&&window.claude.use?await window.claude.use('downloads'):null;if(dl){await dl.save({filename:fn,data:txt});return}}catch(e){toast('Download was cancelled.');return}
    const blob=new Blob([txt],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='paper-maths-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)};
  $('#bk-in').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const j=JSON.parse(await f.text());if(j.app!=='paper-maths')throw 0;
    for(const p of j.custom||[]){await IDB.put(p);mountCustom(p)}
    if(j.db){const d=j.db;DB.edits=Object.assign(EDITS(),d.edits||{});(d.learners||[]).forEach(l=>{if(!DB.learners.find(x=>x.id===l.id))DB.learners.push(l)});Object.assign(DB.data,d.data||{});save()}
    toast('Backup loaded');viewImport()}catch(err){toast('That file is not a Paper Maths backup.')}};
}

/* ---------- mistakes tracking ---------- */
function mistakes(){const R=L(),out=[];R.pp=R.pp||{};
  PAPERS.forEach(p=>p.qs.forEach(q=>{if((R.pp[p.id]||{})[q.n]==='no')out.push({t:topicOf(p.id,q.n),label:`${p.custom?p.title:(p.board==='C'?'Checkpoint ':'Progression ')+(p.ses?p.ses.slice(0,3)+' ':'')+p.year+' P'+p.paper} · Q${q.n}`,pid:p.id,n:q.n})}));
  EXAM.forEach(e=>{if(R.exam[e.id]==='no'){const s=skillSub(skillOfEx(e));out.push({t:s,label:`Topic exam question ${e.id}`,sub:s,tab:'exam'})}});
  PRACTICE.forEach(p=>{if(R.last[p.id]===false)out.push({t:p.sub,label:'Practise: '+p.q.slice(0,46)+(p.q.length>46?'…':''),sub:p.sub,tab:'practise'})});
  Object.entries(R.tests||{}).forEach(([u,t])=>{if(TESTS[u])TESTS[u].forEach(x=>{if(t.res&&t.res[x.id]===false)out.push({t:QT[x.qt].sub,label:`Unit ${u} test`,href:'#test'+u})})});
  return out}
function mistakeGroups(){const m=mistakes(),W=L().wlog||{},g={};
  m.forEach(x=>{(g[x.t]=g[x.t]||{t:x.t,items:[]}).items.push(x)});
  Object.keys(W).forEach(t=>{if(!g[t]&&W[t])g[t]={t,items:[]}});
  return Object.values(g).map(G=>({...G,ever:Math.max(W[G.t]||0,G.items.length)})).filter(G=>G.items.length||G.ever).sort((a,b)=>b.items.length-a.items.length||b.ever-a.ever)}
function logWrong(t,prev,now){const R=L();R.wlog=R.wlog||{};if(now==='no'&&prev!=='no')R.wlog[t||'']=(R.wlog[t||'']||0)+1}
function viewMistakes(){setTheme(0);header();const G=mistakeGroups(),open=UI.mopen||{};const now=G.filter(g=>g.items.length),max=Math.max(1,...G.map(g=>g.items.length));
  $('#app').innerHTML=`<section class="wrap"><div class="crumbs"><a href="#home">← Home</a></div>
  <div class="uhero">${paper(`<div class="bicon">🎯</div><div><div class="uk">${esc(learnerName().toUpperCase())}'S MISTAKES</div><h1>Things to fix</h1>
    <p class="small">Every question marked <b>✗ Not yet</b> lands here, sorted by topic. Read the theory for the topic, then try the questions again — when you get one right it leaves this page.</p></div>`,'t3','background-color:#ead2c6')}</div>
  ${G.length?`${paper(`<h3 style="margin-top:0">Topics to work on</h3><div class="mbars">${G.map(g=>`<a class="mrow" href="#mk-${g.t||'other'}"><span class="mt">${esc(topicName(g.t))}</span><span class="mb"><i style="width:${g.items.length/max*100}%"></i></span><b>${g.items.length}</b></a>`).join('')}</div>`,'t1','background-color:#fbf8f1',false)}
  ${G.map((g,i)=>{const s=g.t,has=SUBS[s],k=s||'other';return `<div id="mk-${k}">${paper(`<div class="row between"><div><div class="uk">${g.items.length?g.items.length+' TO FIX':'ALL FIXED ✓'} · WRONG ${g.ever} TIME${g.ever===1?'':'S'} SO FAR</div><h3 style="margin:2px 0">${esc(topicName(s))}</h3></div>
     <span>${has?`<button class="btn sm" data-th="${k}">📘 ${open[k]?'Hide':'Show'} the theory</button> <a class="btn sm ghost" href="#${sh(s)}" data-learn="1">Open topic ▶</a>`:''}</span></div>
     ${g.items.length?`<div class="chips">${g.items.map((x,j)=>`<button class="chip" data-mi="${i}:${j}">🔁 ${esc(x.label)}</button>`).join('')}</div>`:''}
     ${open[k]&&has?`<div class="theory">${cardsOf(s).map(c=>anyCard(c,{small:true})).join('')}</div>`:''}`,T4[i%4],`background-color:${i%2?'#f6f1e7':'#fbf8f1'}`,false)}</div>`}).join('')}`
  :paper(`<h3>Nothing to fix yet 🎉</h3><p>When you mark a question <b>✗ Not yet</b> on a test paper or a topic page, it will appear here with the theory to read.</p>`,'t2','background-color:#fbf8f1')}
  </section>`;
  document.querySelectorAll('[data-th]').forEach(b=>b.onclick=()=>{UI.mopen=UI.mopen||{};UI.mopen[b.dataset.th]=!UI.mopen[b.dataset.th];const y=window.scrollY;viewMistakes();window.scrollTo(0,y)});
  document.querySelectorAll('[data-learn]').forEach(a=>a.onclick=()=>{UI.tab='learn';lastSub=null});
  document.querySelectorAll('[data-mi]').forEach(b=>b.onclick=()=>{const[i,j]=b.dataset.mi.split(':').map(Number),x=G[i].items[j];
    if(x.pid){PP().ppos[x.pid]=x.n;UI.ppid=null;save();location.hash='#p-'+x.pid}else if(x.sub){go(x.sub,x.tab)}else if(x.href)location.hash=x.href});
}
function mistakeStrip(){const G=mistakeGroups(),n=G.reduce((a,g)=>a+g.items.length,0),k=G.filter(g=>g.items.length).length;
  return `<a class="mstrip" href="#mistakes">${paper(`<span class="mi">🎯</span><span class="mst">MY MISTAKES</span><span class="mcount">${n?`${n} TO FIX · ${k} TOPIC${k>1?'S':''}`:'0 TO FIX'}</span><span class="go">▶</span>`,'t4','background-color:#ead2c6',false)}</a>`}
