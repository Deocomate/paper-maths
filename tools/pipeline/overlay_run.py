import json,re,sys
sys.path.insert(0,'tools/pipeline')
from overlay_detect import *
P=json.load(open('data/papers.json'))
G={}
OV={'cp2023a2_q03_0.webp':'none','cp2024o2_q15_0.webp':'none','cp2024o2_q15_1.webp':'none','pt2022p1_q05_0.webp':'none','pt2023p2_q15_0.webp':'none','pt2026p2_q17_0.webp':'none',
 'cp2024o1_q21_0.webp':{'drop':[(203,65),(434,77)]},'pt2022p2_q10_0.webp':{'drop':[(203,43)],'add':[[124,701,453,290]]},'pt2024p2_q29_0.webp':{'drop':[(584,73)]},
 'pt2026p1_q33_0.webp':{'drop':[(40,42)]},'pt2026p2_q13_0.webp':{'drop':[(548,197)]},'cp2025a2_q06_0.webp':{'add':[[194,115,147,37]]},'cp2025a2_q11_0.webp':{'add':[[519,88,38,102]]}}
def rowsort(bs):
    hs=sorted(b[3] for b in bs);th=0.5*hs[len(hs)//2]
    bs=sorted(bs,key=lambda b:b[1]+b[3]/2);rows=[]
    for b in bs:
        cy=b[1]+b[3]/2
        if rows and cy-rows[-1][0]<=th:rows[-1][1].append(b)
        else:rows.append([cy,[b]])
    return [b for r in rows for b in sorted(r[1],key=lambda b:b[0])]
def standalone(im,b,dot=False):
    x,y,w,h=b;bb=(im<170).astype(np.uint8);d=cv2.dilate(bb,np.ones((7,7),np.uint8));lab,n=ndimage.label(d)
    cx,cy=min(im.shape[1]-1,x+w//2),y+h//2
    # label of the box border/dots: sample along the top edge / dot row
    ys=[cy] if dot else [y,y+h-1]
    L=set()
    for yy in ys:
        for xx in range(x,x+w,3):
            if 0<=yy<im.shape[0] and lab[yy,min(xx,im.shape[1]-1)]:L.add(lab[yy,min(xx,im.shape[1]-1)])
    for l in L:
        sl=ndimage.find_objects((lab==l).astype(int))[0];H=sl[0].stop-sl[0].start;W=sl[1].stop-sl[1].start
        if dot and H>40:return False
        if not dot and (H*W>2.6*(w+14)*(h+14)) and not (H<h+30):return False
    return True
RING=r'\bring\b';LINE=r'[Dd]raw (a )?(straight )?lines?\b(?! of symmetry)|[Jj]oin|[Mm]atch';TICK=r'Tick|\(✓\)'
for p in P:
  for q in p['qs']:
    t=q['text'];isring=bool(re.search(RING,t));isline=bool(re.search(LINE,t));istick=bool(re.search(TICK,t))
    for c in q['crops']:
      im=load('data/img/'+c);H,W=im.shape
      g={'w':W,'h':H,'dot':dotted(im),'box':boxes(im)}
      if istick:g['tick']=1
      if isring:
        cl=[x for x in clusters(im) if x[1]>30]
        # keep similar-size clusters
        if len(cl)>=2:
          a=sorted(x[2]*x[3] for x in cl);med=a[len(a)//2]
          cl=[x for x in cl if 0.3*med<=x[2]*x[3]<=3*med]
        if 2<=len(cl)<=8:g['ch']=sorted(cl,key=lambda x:(round(x[1]/60),x[0]))
        else:
          orow=option_rows(im)
          if orow:g['opt']=[w for r in orow for w in r]
      if isline:
        fr=frames(im);L=[f for f in fr if f[0]+f[2]/2<W*0.5];R=[f for f in fr if f[0]+f[2]/2>=W*0.5]
        allf=L+R;ys=[f[1] for f in allf]
        if len(allf)>=3 and max(ys)-min(ys)<min(f[3] for f in allf):g['md']=[[f[0]+f[2]//2,f[1]+f[3]] for f in allf]
        elif len(L)>=2 and len(R)>=2:g['md']=[[f[0]+f[2],f[1]+f[3]//2] for f in L]+[[f[0],f[1]+f[3]//2] for f in R]
      ov=OV.get(c)
      if ov is not None:
        if ov=='none':g.pop('ch',None);orow=option_rows(im);g['opt']=[w for r in orow for w in r] if orow else []
        else:
          ch=[x for x in g.get('ch',[]) if tuple(x[:2]) not in ov.get('drop',[])]+ov.get('add',[]);g['ch']=ch
      if g.get('ch'):g['ch']=rowsort(g['ch'])
      g['box']=[b for b in g['box'] if standalone(im,b)]
      g['dot']=[d for d in g['dot'] if standalone(im,[d[0],d[1]-3,d[2],6],dot=True)]
      G[c]={k:v for k,v in g.items() if v not in([],None)}
json.dump(G,open('data/overlays.json','w'))
import collections
cnt=collections.Counter(k for g in G.values() for k in g if k not in('w','h'))
print(cnt)
