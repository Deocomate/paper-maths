import json,sys
from PIL import Image,ImageDraw
P={p['id']:p for p in json.load(open('pp/papers.json'))}
pid=sys.argv[1];W=500;cols=3;H=1900
ims=[]
for q in P[pid]['qs']:
  for k,f in enumerate(q['crops']):
    im=Image.open('pp/img/'+f).convert('L');s=W/im.width;im=im.resize((W,int(im.height*s)))
    c=Image.new('L',(W,im.height+16),255);c.paste(im,(0,16));ImageDraw.Draw(c).text((2,1),f"Q{q['n']}"+(f" ({k+1})" if k else ''),fill=0);ims.append(c)
sheets=[];cur=[[]];hh=0
for im in ims:
  if hh+im.height>H and cur[-1]:
    if len(cur)==cols: sheets.append(cur);cur=[[]]
    else: cur.append([])
    hh=0
  cur[-1].append(im);hh+=im.height
sheets.append(cur)
for n,sh in enumerate(sheets):
  G=Image.new('L',(cols*(W+8),max(sum(x.height for x in c) for c in sh)),255)
  for k,c in enumerate(sh):
    y=0
    for x in c: G.paste(x,(k*(W+8),y));y+=x.height
  G.save(f'pp/{pid}_s{n}.png')
print(len(sheets))
