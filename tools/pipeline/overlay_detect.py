import cv2,numpy as np,sys,json
from scipy import ndimage
def load(f):
    im=cv2.imread(f,cv2.IMREAD_GRAYSCALE);return im
def clean_dots(im,x0,x1,y):
    H=im.shape[0];d=im<170
    cross=(d[max(0,y-7):min(H,y+8),x0:x1].sum(0)>=13).sum()
    if cross>3:return False
    for xe in (max(0,x0-6),min(im.shape[1]-1,x1+4)):
        col=d[max(0,y-14):min(H,y+15),xe:xe+3].any(1)
        if col.sum()>=24:return False
    return True
def dotted(im):
    """find horizontal dotted lines: rows of small blobs regularly spaced"""
    b=(im<170).astype(np.uint8)
    lab,n=ndimage.label(b)
    objs=ndimage.find_objects(lab)
    pts=[]
    for i,s in enumerate(objs):
        h=s[0].stop-s[0].start;w=s[1].stop-s[1].start
        if h<=4 and w<=4:
            pts.append(((s[1].start+s[1].stop)/2,(s[0].start+s[0].stop)/2))
    extra=[]
    for i,s in enumerate(objs):
        h=s[0].stop-s[0].start;w=s[1].stop-s[1].start
        if h<=4 and w>=40:
            seg=im[s[0],s[1]].min(0)
            if (seg>110).mean()>0.12:  # gaps between dots
                y=(s[0].start+s[0].stop)//2
                if clean_dots(im,s[1].start,s[1].stop,y):extra.append([s[1].start-2,y,w+4])
    pts.sort(key=lambda p:(round(p[1]),p[0]))
    # group by y
    rows={}
    for x,y in pts:
        k=None
        for yy in rows:
            if abs(yy-y)<=1.5:k=yy;break
        rows.setdefault(k if k is not None else y,[]).append(x)
    out=[]
    for y,xs in rows.items():
        xs.sort();run=[xs[0]]
        for x in xs[1:]+[1e9]:
            if x-run[-1]<=7: run.append(x)
            else:
                if len(run)>=10 and run[-1]-run[0]>=40 and clean_dots(im,int(run[0]),int(run[-1]),int(y)): out.append([int(run[0])-2,int(y),int(run[-1]-run[0])+4])
                run=[x]
    for e in extra:
        if not any(abs(o[1]-e[1])<=3 and o[0]<e[0]+e[2] and e[0]<o[0]+o[2] for o in out):out.append(e)
    # merge pieces on same row that touch
    out.sort(key=lambda o:(o[1],o[0]));m=[]
    for o in out:
        if m and abs(m[-1][1]-o[1])<=3 and o[0]-(m[-1][0]+m[-1][2])<8:m[-1][2]=max(m[-1][2],o[0]+o[2]-m[-1][0])
        else:m.append(list(o))
    return m
def boxes(im):
    b=(im<150).astype(np.uint8)*255
    cs,hi=cv2.findContours(b,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_SIMPLE)
    out=[]
    if hi is None:return out
    for i,c in enumerate(cs):
        if hi[0][i][3]==-1: continue  # want holes (inner contours)
        x,y,w,h=cv2.boundingRect(c)
        if not(30<=w<=170 and 30<=h<=75):continue
        a=cv2.contourArea(c)
        if a<0.85*w*h:continue
        inner=im[y+3:y+h-3,x+3:x+w-3]
        if inner.size==0 or (inner<200).mean()>0.01:continue  # must be empty
        H,W=im.shape;d=im<170;dirty=0
        for sl in [d[max(0,y-9):max(0,y-4),x:x+w],d[min(H,y+h+4):min(H,y+h+9),x:x+w],d[y:y+h,max(0,x-9):max(0,x-4)],d[y:y+h,min(W,x+w+4):min(W,x+w+9)]]:
            if sl.size and sl.mean()>0.04:dirty+=1
        if dirty>1:continue
        out.append([x,y,w,h])
    # drop grid cells: boxes touching another box of similar size
    keep=[]
    for i,(x,y,w,h) in enumerate(out):
        t=0
        for j,(X,Y,W,H) in enumerate(out):
            if i==j:continue
            if abs(W-w)<6 and abs(H-h)<6 and (abs(X-(x+w))<6 or abs(x-(X+W))<6) and abs(Y-y)<6:t+=1
            if abs(W-w)<6 and abs(H-h)<6 and (abs(Y-(y+h))<6 or abs(y-(Y+H))<6) and abs(X-x)<6:t+=1
        if t==0:keep.append([x,y,w,h])
    return keep
if __name__=='__main__':
    for f in sys.argv[1:]:
        im=load(f);print(f,im.shape,'dots',dotted(im),'boxes',boxes(im))

def textlines(im):
    b=(im<150)
    prof=b.sum(1)>0
    lines=[];y=0;H=len(prof)
    while y<H:
        if prof[y]:
            s=y
            while y<H and prof[y]:y+=1
            lines.append((s,y))
        y+=1
    return lines
def words_in(im,y0,y1,gap=10):
    b=(im[y0:y1]<150).any(0)
    ws=[];x=0;W=len(b)
    while x<W:
        if b[x]:
            s=x;e=x
            while x<W and (b[x] or (x-e)<gap):
                if b[x]:e=x
                x+=1
            ws.append([s,e+1])
        else:x+=1
    return ws
def textlines_v(im):
    b=(im<150);b=ndimage.binary_dilation(b,structure=np.ones((9,1)))
    prof=b.sum(1)>0;lines=[];y=0;H=len(prof)
    while y<H:
        if prof[y]:
            s=y
            while y<H and prof[y]:y+=1
            lines.append((s+4,y-4))
        y+=1
    return lines
def option_rows(im):
    """rows of widely spaced short items (numbers/words to ring)"""
    out=[]
    for (y0,y1) in textlines_v(im):
        h=y1-y0
        if h<8 or h>48:continue
        ws=words_in(im,y0,y1)
        if not(3<=len(ws)<=10):continue
        gaps=[ws[i+1][0]-ws[i][1] for i in range(len(ws)-1)]
        if min(gaps)<22 or max(e-s for s,e in ws)>140:continue
        if ws[0][0]<40:continue   # starts at question margin -> sentence
        out.append([[s-4,y0-4,e-s+8,h+8] for s,e in ws])
    return out
def clusters(im):
    b=(im<170).astype(np.uint8)
    d=cv2.dilate(b,np.ones((15,15),np.uint8))
    lab,n=ndimage.label(d)
    out=[]
    for s in ndimage.find_objects(lab):
        y0,y1=s[0].start,s[0].stop;x0,x1=s[1].start,s[1].stop
        w,h=x1-x0,y1-y0
        if ((h>=55 and w>=45) or (h>=25 and w>=90 and w<4*h)) and w<0.75*im.shape[1] and w<3.2*h:
            out.append([x0,y0,w,h])
    return out
def frames(im):
    b=(im<150).astype(np.uint8)*255
    cs,hi=cv2.findContours(b,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_SIMPLE)
    out=[]
    if hi is None:return out
    for i,c in enumerate(cs):
        if hi[0][i][3]==-1:continue
        x,y,w,h=cv2.boundingRect(c)
        if 70<=w<=320 and 22<=h<=140 and cv2.contourArea(c)>0.85*w*h:out.append([x,y,w,h])
    keep=[]
    for i,(x,y,w,h) in enumerate(out):
        if any(j!=i and abs(Y-(y+h))<8 and abs(X-x)<8 or j!=i and abs(y-(Y+H))<8 and abs(X-x)<8 or j!=i and abs(X-(x+w))<8 and abs(Y-y)<8 or j!=i and abs(x-(X+W))<8 and abs(Y-y)<8 for j,(X,Y,W,H) in enumerate(out)):continue
        keep.append([x,y,w,h])
    return keep
