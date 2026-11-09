import json,sys
from PIL import Image,ImageDraw
G=json.load(open('data/overlays.json'))
keys=sys.argv[1].split(',');out=sys.argv[2]
fs=[c for c,g in G.items() if any(k in g for k in keys)]
tiles=[]
for c in fs:
  g=G[c];im=Image.open('data/img/'+c).convert('RGB');d=ImageDraw.Draw(im)
  for x,y,w in g.get('dot',[]):d.rectangle([x,y-12,x+w,y+3],outline=(0,120,255),width=3)
  for x,y,w,h in g.get('box',[]):d.rectangle([x,y,x+w,y+h],outline=(0,200,0),width=4)
  for i,(x,y,w,h) in enumerate(g.get('ch',[])):d.rectangle([x,y,x+w,y+h],outline=(255,0,0),width=3);d.text((x+3,y+3),'ABCDEFGH'[i],fill=(255,0,0))
  for x,y,w,h in g.get('opt',[]):d.rectangle([x,y,x+w,y+h],outline=(255,0,200),width=3)
  for x,y in g.get('md',[]):d.ellipse([x-7,y-7,x+7,y+7],fill=(255,140,0))
  d.text((5,5),c,fill=(255,0,0))
  im.thumbnail((400,400));tiles.append(im)
n=len(tiles);cols=4;per=16
for s in range(0,n,per):
  T=tiles[s:s+per];rows=(len(T)+cols-1)//cols
  sheet=Image.new('RGB',(cols*405,rows*405),'white')
  for i,t in enumerate(T):sheet.paste(t,((i%cols)*405,(i//cols)*405))
  sheet.save(f'{out}_{s//per}.png')
print(n)
