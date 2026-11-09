/* ---------- optional server sync ----------
   When the site is opened through the Express server (npm start), progress and imported papers are
   also kept in the server's SQLite file, so every device sees the same data. On static hosting or
   file:// the /api calls fail and the site keeps working from the browser storage alone. */
const Sync=(()=>{
  const AT='stage6-sync-at';let on=false,quiet=false,timer=null;
  const getAt=()=>{try{return +localStorage.getItem(AT)||0}catch(e){return 0}};
  const setAt=t=>{try{localStorage.setItem(AT,String(t))}catch(e){}};
  const api=(path,opt)=>fetch('/api'+path,{headers:{'content-type':'application/json'},...opt}).then(r=>{if(!r.ok)throw new Error(r.status);return r.json()});
  const putState=t=>api('/state',{method:'PUT',body:JSON.stringify({db:DB,updatedAt:t})}).catch(()=>{});
  function pushState(){if(!on)return;const t=Date.now();setAt(t);clearTimeout(timer);timer=setTimeout(()=>putState(t),800)}
  function pushPaper(p){if(on&&!quiet)api('/papers/'+encodeURIComponent(p.id),{method:'PUT',body:JSON.stringify(p)}).catch(()=>{})}
  function dropPaper(id){if(on)api('/papers/'+encodeURIComponent(id),{method:'DELETE'}).catch(()=>{})}
  async function init(){
    let changed=false;
    try{
      const s=await api('/state');on=true;
      if(s.db&&s.updatedAt>getAt()){DB=s.db;mem=DB;try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}setAt(s.updatedAt);changed=true}
      else if(getAt()>s.updatedAt||(!s.db&&localStorage.getItem(KEY))){const t=getAt()||Date.now();setAt(t);await putState(t)}
      const remote=await api('/papers'),local=await IDB.all(),have=new Set(local.map(p=>p.id));
      quiet=true;
      for(const p of remote)if(!have.has(p.id)){await IDB.put(p);mountCustom(p);changed=true}
      quiet=false;
      const known=new Set(remote.map(p=>p.id));
      local.filter(p=>!known.has(p.id)).forEach(pushPaper);
    }catch(e){quiet=false}
    if(changed)render();
  }
  return{init,pushState,pushPaper,dropPaper};
})();
Sync.init();
window.Sync=Sync;
