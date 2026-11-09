/* ================= interactive question layer ================= */
const LET='ABCDEFGHIJ';
function ovS(id){const R=PP();R.ov=R.ov||{};const o=R.ov[id]=R.ov[id]||{v:{},s:[],m:[],h:[]};o.h=o.h||[];return o}
function hasWork(id){const a=((L().ans||{})[id]||'').trim();const o=(PP().ov||{})[id];
  return !!(a||(o&&(Object.values(o.v).some(x=>x&&String(x).trim())||o.s.length||o.m.length)))}
const pc=(a,b)=>(a/b*100).toFixed(3)+'%';
function cropHTML(c,ci,id,tick){const g=GEO[c]||{},W=g.w||794,H=g.h||400,o=ovS(id),v=o.v,K=k=>ci+':'+k;
  let h='';
  (g.dot||[]).forEach(([x,y,w],i)=>{h+=`<input class="ov-in" data-k="${K('d'+i)}" value="${esc(v[K('d'+i)]||'')}" style="left:${pc(x,W)};top:${pc(y-21,H)};width:${pc(w,W)};height:${pc(22,H)}" autocomplete="off" aria-label="answer line">`});
  (g.box||[]).forEach(([x,y,w,hh],i)=>{const k=K('b'+i),st=`left:${pc(x+2,W)};top:${pc(y+2,H)};width:${pc(w-4,W)};height:${pc(hh-4,H)}`;
    h+=tick?`<button class="ov-tick ${v[k]?'on':''}" data-k="${k}" style="${st}" aria-label="tick box">${v[k]?'✓':''}</button>`
           :`<input class="ov-box" data-k="${k}" value="${esc(v[k]||'')}" style="${st}" autocomplete="off" aria-label="answer box">`});
  (g.ch||[]).forEach(([x,y,w,hh],i)=>{const k=K('c'+i);h+=`<button class="ov-ch ${v[k]?'on':''}" data-k="${k}" style="left:${pc(x,W)};top:${pc(y,H)};width:${pc(w,W)};height:${pc(hh,H)}" aria-label="choice ${LET[i]}"><span class="lab">${LET[i]}</span></button>`});
  (g.opt||[]).forEach(([x,y,w,hh],i)=>{const k=K('o'+i);h+=`<button class="ov-opt ${v[k]?'on':''}" data-k="${k}" style="left:${pc(x,W)};top:${pc(y,H)};width:${pc(w,W)};height:${pc(hh,H)}" aria-label="option"></button>`});
  (g.md||[]).forEach(([x,y],i)=>{h+=`<span class="ov-md" data-md="${ci}:${i}" style="left:${pc(x,W)};top:${pc(y,H)}"></span>`});
  return `<div class="qi" data-ci="${ci}" data-w="${W}" data-h="${H}"><img class="qimg" src="${PIMG[c]}" alt="question picture" draggable="false">${h}<svg class="ink" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${inkSVG(o,ci)}</svg></div>`}
function inkSVG(o,ci){let s='';
  o.s.filter(t=>t.ci===ci).forEach(t=>{const p=t.p;
    if(t.t==='p')s+=`<polyline points="${p.map(q=>q.join(',')).join(' ')}" class="st"/>`;
    else if(t.t==='l'&&p.length>1)s+=`<line x1="${p[0][0]}" y1="${p[0][1]}" x2="${p[1][0]}" y2="${p[1][1]}" class="st"/>`;
    else if(t.t==='r'&&p.length>1){const cx=(p[0][0]+p[1][0])/2,cy=(p[0][1]+p[1][1])/2,rx=Math.abs(p[1][0]-p[0][0])/2+4,ry=Math.abs(p[1][1]-p[0][1])/2+4;s+=`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" class="st"/>`}});
  o.m.filter(m=>m[0]===ci).forEach(m=>{s+=`<line x1="${m[1]}" y1="${m[2]}" x2="${m[3]}" y2="${m[4]}" class="st mt"/><circle cx="${m[3]}" cy="${m[4]}" r="5" class="mtd"/>`});
  return s}
function toolbarHTML(q){const draw=q.dr;
  const t=UI.tool||'tap';const B=(k,ic,lab)=>`<button class="tb ${t===k?'on':''}" data-tool="${k}" title="${lab}">${ic}<span>${lab}</span></button>`;
  return `<div class="toolbar">${B('tap','👆','Write / click')}${B('pen','✏️','Pen')}${B('line','📏','Line')}${B('ring','⭕','Ring')}<button class="tb" id="tundo" title="Undo">↶<span>Undo</span></button><button class="tb" id="tclear" title="Clear">🗑<span>Clear</span></button>${q.ln?'<span class="tbhint">🔗 Click an orange dot, then click what it matches (or use 📏 Line).</span>':q.rg?'<span class="tbhint">⭕ Click a picture or number to ring it (or use ⭕ Ring).</span>':draw?'<span class="tbhint">✏️ This question needs drawing — use the Pen or Line.</span>':''}</div>`}
function bindInteract(id,onWork){const o=ovS(id),app=$('#app');
  const qis=[...document.querySelectorAll('.qi')];const tool=()=>UI.tool||'tap';
  const redraw=ci=>{const q=qis.find(x=>+x.dataset.ci===ci);if(q)q.querySelector('svg.ink').innerHTML=inkSVG(o,ci)};
  const changed=()=>{save();onWork&&onWork()};
  qis.forEach(q=>q.classList.toggle('drawing',tool()!=='tap'));
  document.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>{UI.tool=b.dataset.tool;UI.mdsel=null;document.querySelectorAll('[data-tool]').forEach(x=>x.classList.toggle('on',x===b));qis.forEach(q=>q.classList.toggle('drawing',UI.tool!=='tap'))});
  document.querySelectorAll('.qi input').forEach(i=>i.oninput=()=>{o.v[i.dataset.k]=i.value;changed()});
  document.querySelectorAll('.ov-tick').forEach(b=>b.onclick=()=>{const k=b.dataset.k;o.v[k]=o.v[k]?'':'✓';b.textContent=o.v[k];b.classList.toggle('on',!!o.v[k]);changed()});
  document.querySelectorAll('.ov-ch,.ov-opt').forEach(b=>b.onclick=()=>{const k=b.dataset.k;o.v[k]=o.v[k]?'':'1';b.classList.toggle('on',!!o.v[k]);changed()});
  // matching dots: click a dot, then click another dot or any place on the picture
  document.querySelectorAll('.ov-md').forEach(d=>d.onclick=e=>{e.stopPropagation();const [ci,i]=d.dataset.md.split(':').map(Number);const q=qis.find(x=>+x.dataset.ci===ci),g=GEO[PBY[UI.ppid].qs.find(x=>pqid(UI.ppid,x.n)===id).crops[ci]];
    const p=g.md[i];
    if(UI.mdsel&&UI.mdsel.ci===ci&&UI.mdsel.i!==i){o.m.push([ci,UI.mdsel.p[0],UI.mdsel.p[1],p[0],p[1]]);o.h.push('m');UI.mdsel=null;document.querySelectorAll('.ov-md').forEach(x=>x.classList.remove('sel'));redraw(ci);changed()}
    else{UI.mdsel={ci,i,p};document.querySelectorAll('.ov-md').forEach(x=>x.classList.toggle('sel',x===d))}});
  qis.forEach(q=>{const ci=+q.dataset.ci,W=+q.dataset.w,H=+q.dataset.h,svg=q.querySelector('svg.ink');
    const pt=e=>{const r=svg.getBoundingClientRect();return[Math.round((e.clientX-r.left)/r.width*W),Math.round((e.clientY-r.top)/r.height*H)]};
    q.addEventListener('click',e=>{if(tool()==='tap'&&UI.mdsel&&UI.mdsel.ci===ci&&!e.target.closest('input,button,.ov-md')){const p=pt(e);o.m.push([ci,UI.mdsel.p[0],UI.mdsel.p[1],p[0],p[1]]);o.h.push('m');UI.mdsel=null;document.querySelectorAll('.ov-md').forEach(x=>x.classList.remove('sel'));redraw(ci);changed()}});
    let cur=null;
    svg.addEventListener('pointerdown',e=>{if(tool()==='tap')return;e.preventDefault();svg.setPointerCapture(e.pointerId);const p=pt(e);cur={ci,t:{pen:'p',line:'l',ring:'r'}[tool()],p:[p,p]};if(cur.t==='p')cur.p=[p];o.s.push(cur);o.h.push('s');redraw(ci)});
    svg.addEventListener('pointermove',e=>{if(!cur)return;const p=pt(e);if(cur.t==='p'){const l=cur.p[cur.p.length-1];if(Math.abs(l[0]-p[0])+Math.abs(l[1]-p[1])>=3)cur.p.push(p)}else cur.p[1]=p;redraw(ci)});
    const end=()=>{if(!cur)return;if(cur.t==='p'&&cur.p.length===1)cur.p.push([cur.p[0][0]+1,cur.p[0][1]+1]);cur=null;changed()};
    svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end)});
  const un=$('#tundo');if(un)un.onclick=()=>{const k=o.h.pop();if(k==='s')o.s.pop();else if(k==='m')o.m.pop();qis.forEach(q=>redraw(+q.dataset.ci));changed()};
  const cl=$('#tclear');if(cl)cl.onclick=()=>{if(!cl.dataset.sure){cl.dataset.sure=1;cl.querySelector('span').textContent='Sure?';return}
    o.v={};o.s=[];o.m=[];o.h=[];save();render()};
}
function pAnsBox(id){const R=L();R.ans=R.ans||{};R.fin=R.fin||{};const a=R.ans[id]||'';const w=hasWork(id);
  if(R.fin[id])return`${a?`<div class="box mine"><b>Your answer:</b> ${esc(a)}</div>`:''}<div class="row"><button class="btn" id="ashow">Show the answer</button><button class="btn ghost sm" id="aedit">✎ Change my answer</button></div>`;
  return`<label class="small" for="aans"><b>Your answer / working</b> — answer on the question above (type on the lines, tick, ring or draw), or write here.</label><textarea id="aans" placeholder="Optional if you answered on the question">${esc(a)}</textarea>
   <div class="row" style="margin-top:6px"><button class="btn" id="adone" ${w?'':'disabled'}>I'm done ✓</button><span class="small muted" id="ahint">${w?'':'Answer the question first.'}</span></div>`}
function pBindAns(id,onShow){const R=L();const t=$('#aans'),d=$('#adone');
  const upd=()=>{if(!d)return;const w=hasWork(id);d.disabled=!w;$('#ahint').textContent=w?'':'Answer the question first.'};
  if(t)t.oninput=()=>{R.ans[id]=t.value;save();upd()};
  if(d)d.onclick=()=>{if(!hasWork(id))return;if(t)R.ans[id]=t.value.trim();R.fin[id]=1;save();render()};
  const e=$('#aedit');if(e)e.onclick=()=>{delete R.fin[id];save();render()};
  const s=$('#ashow');if(s)s.onclick=onShow;return upd}
