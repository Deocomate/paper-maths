/* ================= solution diagrams =================
   Each renderer returns an <svg>. Colours follow the Visual Maths Guide. */
const DC={ink:'#1d2433',mut:'#5b6578',line:'#9aa7c0',hl:'#e8770e',hls:'#fff1e2',ok:'#17894a',oks:'#e4f6ea',bad:'#c4372f',bads:'#fdeceb',
  col:['#7a4fa0','#2f5bd3','#0f8a6a','#c4651a','#c43b78','#2f5bd3','#0f8a6a'],soft:['#f1ecf9','#e8f0fc','#e5f5ee','#fff1e2','#fcebf2','#e8f0fc','#e5f5ee']};
let dgN=0;
const tw=(s,f=15)=>String(s).length*f*0.56+4;
const tx=(x,y,s,o={})=>`<text x="${x}" y="${y}" text-anchor="${o.a||'middle'}" font-size="${o.f||15}" font-weight="${o.w||700}" fill="${o.c||DC.ink}" stroke="#fff" stroke-width="3" paint-order="stroke"${o.it?' font-style="italic"':''}>${esc(s)}</text>`;
function svgWrap(w,h,body,alt){const id='dm'+(++dgN);
  return `<svg class="dg" viewBox="0 0 ${Math.ceil(w)} ${Math.ceil(h)}" style="max-width:${Math.ceil(w)}px" role="img" aria-label="${esc(alt||'Solution diagram')}"><defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>${body.replace(/#MK/g,'#'+id)}</svg>`}
const arrow=(x1,y1,x2,y2,c=DC.col[1],w=2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" marker-end="url(#MK)"/>`;
const arc=(x1,x2,y,h,c=DC.col[1])=>`<path d="M${x1} ${y} Q ${(x1+x2)/2} ${y-h} ${x2} ${y}" fill="none" stroke="${c}" stroke-width="2" marker-end="url(#MK)"/>`;

/* --- place value chart --- */
const PLACE={4:'Ten thousands',3:'Thousands',2:'Hundreds',1:'Tens',0:'Ones','-1':'Tenths','-2':'Hundredths','-3':'Thousandths','-4':'Ten-thousandths'};
function digitsOf(n){n=String(n);const [i,d='']=n.split('.');const m={};const I=i.replace('-','');for(let k=0;k<I.length;k++)m[I.length-1-k]=I[k];for(let k=0;k<d.length;k++)m[-(k+1)]=d[k];return{m,lead:I==='0',hasDec:n.includes('.')}}
function placeCols(nums,extra=[]){let hi=0,lo=0;nums.forEach(n=>{const d=digitsOf(n);Object.keys(d.m).forEach(p=>{p=+p;if(p>hi)hi=p;if(p<lo)lo=p})});extra.forEach(p=>{if(p>hi)hi=p;if(p<lo)lo=p});if(lo>-1)lo=-1;const c=[];for(let p=hi;p>=lo;p--)c.push(p);return c}
function dPV(o){
  const rows=o.rows.map(r=>typeof r==='object'?r:{n:r});const cols=placeCols(rows.map(r=>r.n));const hl=(o.hl||[]).map(String);
  const lw=rows.some(r=>r.l)?Math.max(...rows.map(r=>tw(r.l||'',14)))+16:0,cw=96,x0=8+lw,rh=54,top=8;
  let s='';cols.forEach((p,i)=>{const x=x0+i*cw,c=(3-p+70)%5,on=hl.includes(PLACE[p]);
    s+=`<rect x="${x+2}" y="${top}" width="${cw-4}" height="${30+rows.length*rh}" rx="10" fill="${DC.soft[c]}" stroke="${on?DC.hl:'none'}" stroke-width="3"/>`+tx(x+cw/2,top+20,PLACE[p],{f:12,c:DC.mut})});
  rows.forEach((r,ri)=>{const y=top+30+ri*rh,d=digitsOf(r.n);
    if(r.l)s+=tx(lw,y+rh/2+5,r.l,{a:'end',f:14,w:700,c:r.hl?DC.hl:DC.ink});
    cols.forEach((p,i)=>{const v=d.m[p];if(v===undefined)return;const c=(3-p+70)%5,on=hl.includes(PLACE[p]);s+=tx(x0+i*cw+cw/2,y+rh/2+10,v,{f:28,w:900,c:on?DC.hl:DC.col[c]})});
    const pi=cols.indexOf(0);if(pi>=0)s+=`<circle cx="${x0+(pi+1)*cw}" cy="${y+rh/2+8}" r="4.5" fill="${DC.ink}"/>`;
    if(ri<rows.length-1)s+=`<line x1="${x0}" y1="${y+rh}" x2="${x0+cols.length*cw}" y2="${y+rh}" stroke="#fff" stroke-width="2"/>`});
  const h=top+30+rows.length*rh+8;
  return svgWrap(x0+cols.length*cw+8,h,s,'Place-value chart: '+rows.map(r=>(r.l?r.l+' = ':'')+r.n).join('; '));
}
/* --- shift digits for ×/÷ 10, 100, 1000 --- */
function dShift(o){
  const k=o.k,f=digitsOf(o.from),t=digitsOf(o.to);const cols=placeCols([o.from,o.to]);const cw=86,x0=118,top=8,rh=58;
  let s='';cols.forEach((p,i)=>{const x=x0+i*cw,c=(3-p+70)%5;s+=`<rect x="${x+2}" y="${top}" width="${cw-4}" height="${30+2*rh+40}" rx="10" fill="${DC.soft[c]}"/>`+tx(x+cw/2,top+20,PLACE[p],{f:11,c:DC.mut})});
  const X=p=>x0+cols.indexOf(p)*cw+cw/2;const y1=top+30,y2=top+30+rh+40;
  s+=tx(x0-12,y1+rh/2+8,o.from,{a:'end',f:16})+tx(x0-12,y2+rh/2+8,o.to,{a:'end',f:16,c:DC.hl});
  Object.entries(f.m).forEach(([p,v])=>{p=+p;s+=tx(X(p),y1+rh/2+10,v,{f:28,w:900,c:DC.col[(3-p+70)%5]})});
  Object.entries(t.m).forEach(([p,v])=>{p=+p;s+=tx(X(p),y2+rh/2+10,v,{f:28,w:900,c:DC.col[(3-p+70)%5]})});
  Object.keys(f.m).forEach(p=>{p=+p;if(f.lead&&p===0)return;if(cols.indexOf(p+k)<0)return;s+=arrow(X(p),y1+rh-2,X(p+k)+(k>0?8:-8),y2+4,DC.hl)});
  const dp=cols.indexOf(0);s+=`<circle cx="${x0+(dp+1)*cw}" cy="${y1+rh/2+8}" r="4.5" fill="${DC.ink}"/><circle cx="${x0+(dp+1)*cw}" cy="${y2+rh/2+8}" r="4.5" fill="${DC.ink}"/>`;
  s+=tx(x0-12,y1+rh+26,o.op,{a:'end',f:18,w:900,c:DC.hl});
  const W=x0+cols.length*cw+8;
  s+=tx(W/2+50,top+30+2*rh+40+28,`${Math.abs(k)} place${Math.abs(k)>1?'s':''} ${k>0?'left':'right'} · the decimal point stays`,{f:13,c:DC.mut});
  return svgWrap(W,top+30+2*rh+40+40,s,`${o.from} ${o.op} = ${o.to}: digits move ${Math.abs(k)} places ${k>0?'left':'right'}`);
}
/* --- chain / function machine --- */
function dChain(o){
  const rows=o.rows;let W=0;const rh=70;let s='';
  rows.forEach((r,ri)=>{let x=10;const y=14+ri*rh;
    r.forEach((v,i)=>{if(i%2===0){const w=Math.max(64,tw(v,17)+18),last=i===r.length-1,q=String(v).startsWith('?');
        s+=`<rect x="${x}" y="${y}" width="${w}" height="42" rx="10" fill="${last?DC.hls:q?'#fff':DC.soft[1]}" stroke="${last?DC.hl:q?DC.line:'none'}" stroke-width="2" ${q?'stroke-dasharray="5 4"':''}/>`+tx(x+w/2,y+27,v,{f:17,w:800});x+=w}
      else{const w=Math.max(70,tw(v,15)+20);s+=tx(x+w/2,y+12,v,{f:15,w:900,c:DC.hl})+arrow(x+6,y+21,x+w-6,y+21,DC.hl);x+=w}});
    if(o.labels&&o.labels[ri])s+=tx(x+10,y+27,o.labels[ri],{a:'start',f:13,c:DC.mut}),x+=tw(o.labels[ri],13)+14;
    W=Math.max(W,x+10)});
  return svgWrap(W,14+rows.length*rh-14,s,rows.map(r=>r.join(' ')).join('; '));
}
/* --- rounding number lines --- */
const nf=v=>parseFloat(v);
function dNL(o){
  const lines=o.lines;let s='';const W=600,lh=112;
  lines.forEach((L,li)=>{const y=58+li*lh,lo=nf(L.lo),hi=nf(L.hi),x=nf(L.x),X=v=>50+(v-lo)/(hi-lo)*(W-100);
    s+=`<line x1="${X(lo)-14}" y1="${y}" x2="${X(hi)+14}" y2="${y}" stroke="${DC.mut}" stroke-width="2"/>`;
    for(let i=0;i<=10;i++){const xx=X(lo+(hi-lo)*i/10),m=i===5,e=i===0||i===10;s+=`<line x1="${xx}" y1="${y-(e?14:m?11:6)}" x2="${xx}" y2="${y+(e?14:m?11:6)}" stroke="${m?DC.hl:DC.mut}" stroke-width="${e||m?2:1}"/>`}
    s+=tx(X(lo),y+34,L.lo,{f:17,w:900,c:String(L.to)===String(L.lo)?DC.hl:DC.ink})+tx(X(hi),y+34,L.hi,{f:17,w:900,c:String(L.to)===String(L.hi)?DC.hl:DC.ink});
    s+=tx(X((lo+hi)/2),y+30,'halfway',{f:11,c:DC.hl});
    s+=`<circle cx="${X(x)}" cy="${y}" r="7" fill="${DC.col[0]}"/>`+tx(X(x),y-16,L.x,{f:16,w:900,c:DC.col[0]});
    const tgt=nf(L.to),tx2=X(tgt);s+=`<path d="M${X(x)} ${y-30} Q ${(X(x)+tx2)/2} ${y-58} ${tx2+(tx2>X(x)?-4:4)} ${y-20}" fill="none" stroke="${DC.hl}" stroke-width="2.2" marker-end="url(#MK)"/>`;
    if(L.note)s+=tx(W-6,y-38,L.note,{a:'end',f:12,c:DC.mut})});
  return svgWrap(W,58+lines.length*lh-46,s,lines.map(L=>`${L.x} is between ${L.lo} and ${L.hi}; it rounds to ${L.to}`).join('. '));
}
/* --- range that rounds to a value --- */
function dRange(o){
  const W=620,y=92,mn=nf(o.min),mx=nf(o.max),X=v=>40+(nf(v)-mn)/(mx-mn)*(W-80);let s='';
  s+=tx(W/2,22,`Rounds to ${o.t}`,{f:17,w:900,c:DC.col[2]});
  s+=`<line x1="20" y1="${y}" x2="${W-20}" y2="${y}" stroke="${DC.mut}" stroke-width="2"/>`;
  (o.ticks||[o.min,o.max]).forEach(v=>{s+=`<line x1="${X(v)}" y1="${y-9}" x2="${X(v)}" y2="${y+9}" stroke="${DC.mut}" stroke-width="2"/>`+tx(X(v),y+28,v,{f:14,c:DC.mut})});
  s+=`<rect x="${X(o.lo)}" y="${y-7}" width="${X(o.hi)-X(o.lo)}" height="14" rx="7" fill="${DC.col[2]}" opacity=".85"/>`;
  s+=`<circle cx="${X(o.lo)}" cy="${y}" r="7.5" fill="${DC.col[2]}" stroke="#fff" stroke-width="2"/>`+tx(X(o.lo),y-20,o.lo,{f:15,w:900,c:DC.col[2]});
  s+=`<circle cx="${X(o.hi)}" cy="${y}" r="7.5" fill="${DC.col[2]}" stroke="#fff" stroke-width="2"/>`+tx(X(o.hi),y-20,o.hi,{f:15,w:900,c:DC.col[2]});
  if(o.ex)s+=`<circle cx="${X(o.ex)}" cy="${y}" r="7" fill="#fff" stroke="${DC.bad}" stroke-width="3"/>`+tx(X(o.ex),y-38,o.ex+' ✗',{f:13,c:DC.bad});
  let h=y+40;
  if(o.pts){o.pts.forEach((p,i)=>{const v=nf(p),inn=v>=nf(o.lo)-1e-9&&v<=nf(o.hi)+1e-9,yy=y+52+(i%2)*24;
      s+=`<line x1="${X(p)}" y1="${y+10}" x2="${X(p)}" y2="${yy-14}" stroke="${inn?DC.ok:DC.line}" stroke-width="1.5" stroke-dasharray="3 3"/><circle cx="${X(p)}" cy="${y}" r="5" fill="${inn?DC.ok:'#fff'}" stroke="${inn?DC.ok:DC.mut}" stroke-width="2"/>`+tx(X(p),yy,p+(inn?' ✓':' ✗'),{f:14,w:800,c:inn?DC.ok:DC.mut});h=Math.max(h,yy+10)})}
  s+=tx(W/2,h+16,o.cap||`smallest ${o.lo} · largest ${o.hi}`,{f:13,c:DC.mut});
  return svgWrap(W,h+26,s,`Numbers from ${o.lo} to ${o.hi} round to ${o.t}`+(o.pts?'. Checked: '+o.pts.join(', '):''));
}
/* --- ordering on a number line --- */
function dOrder(o){
  const W=620,y=70,mn=nf(o.min),mx=nf(o.max),X=v=>40+(nf(v)-mn)/(mx-mn)*(W-80);let s='';
  const vals=o.vals.map(v=>Array.isArray(v)?v:[v,'']);const hl=(o.hl||[]).map(String);
  s+=`<line x1="20" y1="${y}" x2="${W-20}" y2="${y}" stroke="${DC.mut}" stroke-width="2"/>`;
  (o.ticks||[]).forEach(v=>{s+=`<line x1="${X(v)}" y1="${y-6}" x2="${X(v)}" y2="${y+6}" stroke="${DC.mut}"/>`+tx(X(v),y+22,v,{f:11,c:DC.mut})});
  const sorted=[...vals].sort((a,b)=>nf(a[0])-nf(b[0]));
  sorted.forEach((v,i)=>{const up=i%2===0,on=hl.includes(String(v[0])),c=on?DC.hl:DC.col[i%5];
    s+=`<circle cx="${X(v[0])}" cy="${y}" r="6" fill="${c}"/><line x1="${X(v[0])}" y1="${up?y-8:y+8}" x2="${X(v[0])}" y2="${up?y-26:y+30}" stroke="${c}" stroke-width="1.5"/>`+
      tx(X(v[0]),up?y-32:y+48,v[0]+(v[1]?' '+v[1]:''),{f:14,w:900,c})});
  let x=20;const y2=y+86;s+=tx(20,y2-4,'smallest',{a:'start',f:11,c:DC.mut});
  sorted.forEach((v,i)=>{const t=v[1]?`${v[0]} ${v[1]}`:String(v[0]),w=tw(t,15)+18,on=hl.includes(String(v[0]));
    s+=`<rect x="${x}" y="${y2+4}" width="${w}" height="32" rx="8" fill="${on?DC.hls:DC.soft[i%5]}" stroke="${on?DC.hl:'none'}" stroke-width="2"/>`+tx(x+w/2,y2+25,t,{f:15,w:800});x+=w;if(i<sorted.length-1){s+=tx(x+10,y2+26,'<',{f:16,c:DC.mut});x+=20}});
  return svgWrap(Math.max(W,x+20),y2+46,s,'In order: '+sorted.map(v=>v[0]).join(' < '));
}
/* --- jumps (sequences) --- */
function dJumps(o){
  const rows=o.rows||[o];let s='',W=0;const rh=o.pos?118:100;
  const lab=rows.some(r=>r.label),y0=lab?78:58,RH=rh+(lab?16:0);
  rows.forEach((r,ri)=>{const y=y0+ri*RH;let x=10;const hl=(r.hl||[]).map(Number);const xs=[];
    if(r.label){s+=tx(10,y-50,r.label,{a:'start',f:13,c:DC.mut})}
    r.terms.forEach((t,i)=>{const w=Math.max(54,tw(t,17)+16),on=hl.includes(i),dots=t==='…';
      if(dots){s+=tx(x+16,y+27,'…',{f:20});xs.push([x+16,0]);x+=32+22;return}
      s+=`<rect x="${x}" y="${y}" width="${w}" height="40" rx="10" fill="${on?DC.hls:DC.soft[1]}" stroke="${on?DC.hl:'none'}" stroke-width="2.5"/>`+tx(x+w/2,y+26,t,{f:17,w:900,c:on?DC.hl:DC.ink});
      if(o.pos||r.pos)s+=tx(x+w/2,y+58,(r.p0||1)+i<0?'':'term '+((r.posl&&r.posl[i])||((r.p0||1)+i)),{f:11,c:DC.mut});
      xs.push([x+w/2,w]);x+=w+22});
    for(let i=0;i<r.terms.length-1;i++){if(r.terms[i]==='…'||r.terms[i+1]==='…')continue;const st=r.steps?r.steps[i]:r.step;
      s+=arc(xs[i][0]+6,xs[i+1][0]-6,y-3,34,DC.col[1])+tx((xs[i][0]+xs[i+1][0])/2,y-24,st,{f:13,w:900,c:DC.col[1]})}
    W=Math.max(W,x)});
  return svgWrap(W,y0+rows.length*RH-(o.pos?40:52)-(lab?16:0),s,rows.map(r=>r.terms.join(', ')).join('; '));
}
/* --- position-to-term table --- */
function dPT(o){
  const n=o.pos.length,cw=78,x0=96,top=10;let s='';const hl=(o.hl||[]).map(Number);
  s+=`<rect x="6" y="${top}" width="84" height="42" rx="8" fill="#eef1f6"/>`+tx(48,top+26,'Position',{f:13,c:DC.mut});
  s+=`<rect x="6" y="${top+100}" width="84" height="42" rx="8" fill="#eef1f6"/>`+tx(48,top+126,'Term',{f:13,c:DC.mut});
  o.pos.forEach((p,i)=>{const x=x0+i*cw,dots=p==='…',on=hl.includes(i);
    if(dots){s+=tx(x+cw/2,top+27,'…',{f:20})+tx(x+cw/2,top+127,'…',{f:20});return}
    s+=`<rect x="${x+4}" y="${top}" width="${cw-8}" height="42" rx="8" fill="${DC.soft[1]}"/>`+tx(x+cw/2,top+27,p,{f:18,w:900});
    s+=`<rect x="${x+4}" y="${top+100}" width="${cw-8}" height="42" rx="8" fill="${on?DC.hls:DC.soft[2]}" stroke="${on?DC.hl:'none'}" stroke-width="2.5"/>`+tx(x+cw/2,top+127,o.term[i],{f:18,w:900,c:on?DC.hl:DC.ink});
    s+=arrow(x+cw/2,top+46,x+cw/2,top+96,DC.hl)+tx(x+cw/2+4,top+76,o.rule,{a:'start',f:12,w:900,c:DC.hl})});
  const W=x0+n*cw+10;s+=tx(W/2,top+170,o.cap||`term = position ${o.rule}`,{f:14,c:DC.mut});
  return svgWrap(W,top+180,s,`Position-to-term rule ${o.rule}: `+o.pos.map((p,i)=>p+' → '+o.term[i]).join(', '));
}
/* --- table --- */
function dGrid(o){
  const cols=o.head.length;const cw=o.head.map((h,c)=>Math.max(tw(h,14),...o.rows.map(r=>tw(r[c],15)))+22);const rh=36;let s='',x=6;
  o.head.forEach((h,c)=>{s+=`<rect x="${x}" y="6" width="${cw[c]-3}" height="${rh}" rx="6" fill="#eef1f6"/>`+tx(x+cw[c]/2,29,h,{f:13,c:DC.mut});x+=cw[c]});
  o.rows.forEach((r,ri)=>{let x=6;const y=6+(ri+1)*(rh+3);const rowhl=(o.hlr||[]).includes(ri);
    r.forEach((v,c)=>{const t=String(v),ok=/✓/.test(t),bad=/✗/.test(t);
      s+=`<rect x="${x}" y="${y}" width="${cw[c]-3}" height="${rh}" rx="6" fill="${ok?DC.oks:bad?DC.bads:rowhl?DC.hls:'#fff'}" stroke="${rowhl?DC.hl:'#dde3ee'}"/>`+tx(x+cw[c]/2,y+24,t,{f:15,w:c===0?800:700,c:ok?DC.ok:bad?DC.bad:DC.ink});x+=cw[c]})});
  const W=cw.reduce((a,b)=>a+b,0)+12;
  return svgWrap(W,6+(o.rows.length+1)*(rh+3)+6,s,o.head.join(' | ')+'. '+o.rows.map(r=>r.join(' | ')).join('. '));
}
/* --- square arrays and cubes --- */
function dSquares(o){
  let s='',x=10,H=0;
  o.n.forEach((n,k)=>{const c=Math.min(24,Math.floor(170/n)),w=n*c,col=DC.col[k%5];
    for(let r=0;r<n;r++)for(let j=0;j<n;j++)s+=`<rect x="${x+j*c}" y="${10+r*c}" width="${c-2}" height="${c-2}" rx="${c>10?3:1}" fill="${col}"/>`;
    s+=tx(x+w/2,10+w+24,`${n} × ${n} = ${n*n}`,{f:15,w:900,c:col});x+=Math.max(w,110)+28;H=Math.max(H,w+44)});
  return svgWrap(x,H,s,o.n.map(n=>`${n} squared is ${n*n}`).join('; '));
}
function dCube(o){
  const n=o.n,c=Math.min(26,Math.floor(120/n));let s='',x=10;
  for(let L=0;L<n;L++){for(let r=0;r<n;r++)for(let j=0;j<n;j++)s+=`<rect x="${x+j*c}" y="${10+r*c}" width="${c-2}" height="${c-2}" rx="3" fill="${DC.col[L%5]}"/>`;
    s+=tx(x+n*c/2,10+n*c+20,`layer ${L+1}: ${n*n}`,{f:12,c:DC.col[L%5]});x+=n*c+22}
  s+=tx(x/2,10+n*c+48,`${n} layers × ${n*n} = ${n*n*n} = ${n}³`,{f:16,w:900,c:DC.hl});
  return svgWrap(Math.max(x,280),10+n*c+60,s,`${n} cubed: ${n} layers of ${n} by ${n} = ${n*n*n}`);
}
/* --- Venn --- */
function dVenn(o){
  const W=560,H=250;let s=`<rect x="4" y="4" width="${W-8}" height="${H-8}" rx="12" fill="#fbfcfe" stroke="#dde3ee"/>`;
  s+=`<circle cx="210" cy="135" r="98" fill="${DC.col[1]}" fill-opacity=".09" stroke="${DC.col[1]}" stroke-width="2"/><circle cx="350" cy="135" r="98" fill="${DC.col[4]}" fill-opacity=".09" stroke="${DC.col[4]}" stroke-width="2"/>`;
  s+=tx(150,22,o.A,{f:13,w:900,c:DC.col[1]})+tx(410,22,o.B,{f:13,w:900,c:DC.col[4]});
  const put=(arr,x,c)=>{arr.forEach((v,i)=>{const n=arr.length,y=135+(i-(n-1)/2)*30+6;s+=tx(x,y,v,{f:18,w:900,c})})};
  put(o.a||[],160,DC.col[1]);put(o.ab||[],280,DC.col[0]);put(o.b||[],400,DC.col[4]);
  if(o.out&&o.out.length)s+=tx(W-14,H-16,'Neither: '+o.out.join(', '),{a:'end',f:14,c:DC.mut});
  return svgWrap(W,H,s,`${o.A} only: ${(o.a||[]).join(', ')}. Both: ${(o.ab||[]).join(', ')}. ${o.B} only: ${(o.b||[]).join(', ')}.`+(o.out?` Neither: ${o.out.join(', ')}.`:''));
}
/* --- multiples on number lines --- */
function dMult(o){
  const W=620,mx=o.max,X=v=>40+v/mx*(W-80),lh=78;let s='';const meet=o.meet||[];
  o.lines.forEach((n,li)=>{const y=58+li*lh,c=DC.col[[1,4,2,3][li%4]];
    s+=tx(20,y-30,(o.names&&o.names[li])||`Multiples of ${n}`,{a:'start',f:13,w:900,c});
    s+=`<line x1="${X(0)}" y1="${y}" x2="${X(mx)}" y2="${y}" stroke="#c9d1e0" stroke-width="2"/>`;
    for(let m=0;m+n<=mx+1e-9;m+=n)s+=`<path d="M${X(m)+2} ${y-2} Q ${X(m+n/2)} ${y-26} ${X(m+n)-2} ${y-2}" fill="none" stroke="${c}" stroke-width="1.8"/>`;
    for(let m=0;m<=mx+1e-9;m+=n){const on=meet.includes(m);s+=`<circle cx="${X(m)}" cy="${y}" r="${on?6:4}" fill="${on?DC.hl:c}"/>`+((mx/n<=16)?tx(X(m),y+20,m,{f:11,c:on?DC.hl:DC.mut,w:on?900:700}):'')}});
  const yb=58+(o.lines.length-1)*lh;
  meet.forEach(m=>{s+=`<line x1="${X(m)}" y1="34" x2="${X(m)}" y2="${yb+8}" stroke="${DC.hl}" stroke-width="2" stroke-dasharray="5 4"/>`});
  s+=tx(W/2,yb+48,o.cap||('Shared landing points: '+meet.join(', ')),{f:14,w:900,c:DC.hl});
  return svgWrap(W,yb+58,s,(o.cap||'')+' Multiples of '+o.lines.join(' and ')+' meet at '+meet.join(', '));
}
/* --- factor lists --- */
function dFactors(o){
  let s='',W=0;const sh=(o.shared||[]).map(Number);
  o.rows.forEach((r,ri)=>{const y=14+ri*58;s+=tx(40,y+27,r.n,{a:'end',f:20,w:900,c:DC.col[[1,4,2][ri%3]]});let x=54;
    r.f.forEach(v=>{const on=sh.includes(v),w=Math.max(38,tw(v,15)+16);s+=`<rect x="${x}" y="${y+4}" width="${w}" height="34" rx="17" fill="${on?DC.hl:DC.soft[1]}"/>`+tx(x+w/2,y+26,v,{f:15,w:900,c:on?'#fff':DC.ink});x+=w+8});W=Math.max(W,x)});
  const y=14+o.rows.length*58;if(o.cap!==false)s+=tx(10,y+14,o.cap||('Common factors: '+sh.join(', ')),{a:'start',f:15,w:900,c:DC.hl});
  return svgWrap(Math.max(W,320)+10,y+26,s,o.rows.map(r=>`Factors of ${r.n}: ${r.f.join(', ')}`).join('. ')+'. Shared: '+sh.join(', '));
}
/* --- step boxes --- */
function dFlow(o){
  let s='',y=6,W=0;o.steps.forEach((t,i)=>{const w=Math.min(600,tw(t,15)+56),last=i===o.steps.length-1;
    s+=`<rect x="6" y="${y}" width="${w}" height="38" rx="10" fill="${last?DC.hls:DC.soft[(i%4)+1]}" stroke="${last?DC.hl:'none'}" stroke-width="2"/><circle cx="26" cy="${y+19}" r="11" fill="${last?DC.hl:DC.col[1]}"/>`+tx(26,y+24,i+1,{f:12,w:900,c:'#fff'})+tx(46,y+24,t,{a:'start',f:15,w:700});
    W=Math.max(W,w+12);y+=38;if(!last){s+=arrow(26,y+2,26,y+16,DC.mut,1.6);y+=20}});
  return svgWrap(W,y+6,s,o.steps.join(' → '));
}
const DR={pv:dPV,shift:dShift,chain:dChain,nl:dNL,range:dRange,order:dOrder,jumps:dJumps,pt:dPT,grid:dGrid,sq:dSquares,cube:dCube,venn:dVenn,mult:dMult,factors:dFactors,flow:dFlow};
function solHTML(id){const S=SOL[id];if(!S)return'';
  return `<div class="sol"><div class="solh">🧭 Solution in pictures</div>${S.d.map(([t,o])=>`<div class="dgwrap">${DR[t](o)}</div>`).join('')}${S.s?`<ol class="solsteps">${S.s.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`:''}<div class="small muted">Diagram drawn for this site · <span class="pill gen">Generated</span></div></div>`}
