import pdfplumber,re,json,subprocess,os,numpy as np
from PIL import Image
U='/mnt/user-data/uploads/'
SRC={'C':U+'4c15a2ec-Checkpoint_Test_Stage_6.pdf','P':U+'2aa1c0b3-Progression_Test_Stage_6.pdf'}
COV={'C':[(1,'April 2023',1),(17,'April 2023',2),(33,'October 2023',1),(49,'October 2023',2),(65,'April 2024',1),(85,'April 2024',2),(105,'October 2024',1),(125,'October 2024',2),(149,'April 2025',1),(165,'April 2025',2),(185,'October 2025',1),(205,'October 2025',2)],
     'P':[(1,'2022',1),(17,'2022',2),(33,'2023',1),(49,'2023',2),(67,'2024',1),(89,'2024',2),(109,'2025',1),(125,'2025',2),(145,'2026',1),(165,'2026',2)]}
NP={'C':224,'P':184};D=110;S=D/72
papers=[];qs=[]
for k in 'CP':
  pdf=pdfplumber.open(SRC[k]);cv=COV[k]
  for pi,(start,sess,pap) in enumerate(cv):
    end=(cv[pi+1][0]-1) if pi+1<len(cv) else NP[k]
    pid=f"{k}{pi+1:02d}";papers.append({'id':pid,'kind':k,'session':sess,'paper':pap,'pages':[start,end]})
    expect=1;cur=None
    for pn in range(start+1,end+1):
      p=pdf.pages[pn-1];txt=p.extract_text() or ''
      if 'BLANK PAGE' in txt and len(txt)<200: continue
      ws=p.extract_words()
      bottom=790
      for w in ws:
        if w['text'] in('Permission','______________________________________________________________________________________________________________________________________') or w['text'].startswith('____'):
          if w['top']>300: bottom=min(bottom,w['top']-6)
      starts=[]
      for w in sorted(ws,key=lambda w:w['top']):
        if 46<=w['x0']<=54 and w['top']>55 and w['top']<bottom and w['text']==str(expect):
          starts.append((expect,w['top']));expect+=1
      img=f'/home/claude/pq/{pid}_{pn}.png'
      subprocess.run(['pdftoppm','-r',str(D),'-png','-singlefile','-f',str(pn),'-l',str(pn),SRC[k],img[:-4]],check=True)
      full=Image.open(img).convert('L')
      segs=[]
      first=starts[0][1] if starts else bottom
      if cur is not None and first-58>30: segs.append((cur,56,first-6))
      for i,(n,top) in enumerate(starts):
        nxt=starts[i+1][1]-6 if i+1<len(starts) else bottom
        cur={'id':f'{pid}-Q{n:02d}','paper':pid,'n':n,'crops':[],'text':'','pages':[]};qs.append(cur);segs.append((cur,top-6,nxt))
      for q,y0,y1 in segs:
        c=full.crop((int(40*S),int(y0*S),int(562*S),int(y1*S)))
        a=np.array(c);rows=np.where((a<225).sum(1)>1)[0]
        if len(rows)==0: continue
        c=c.crop((0,max(0,rows[0]-6),c.width,min(c.height,rows[-1]+8)))
        if c.height<12: continue
        fn=f"{q['id']}_{len(q['crops'])}.webp";c.save('/home/claude/pq/'+fn,quality=72,method=6);q['crops'].append(fn);q['pages'].append(pn)
        q['text']+=(p.crop((40,y0,562,y1)).extract_text() or '')+'\n'
      os.remove(img)
    papers[-1]['nq']=expect-1
json.dump({'papers':papers,'qs':qs},open('/home/claude/pq.json','w'),ensure_ascii=False,indent=1)
print(len(qs));[print(p['id'],p['session'],p['paper'],p['nq']) for p in papers]
tot=sum(os.path.getsize('/home/claude/pq/'+f) for q in qs for f in q['crops']);print('bytes',tot)
