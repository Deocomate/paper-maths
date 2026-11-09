import random
def edge(n,amp,seed):
  r=random.Random(seed);return [round(r.uniform(0,amp),1) for _ in range(n+1)]
def torn(seed,amp=5,top=True,bottom=True,left=True,right=True,n=46):
  pts=[]
  t=edge(n,amp,seed);b=edge(n,amp,seed+1);l=edge(14,amp*.8,seed+2);r=edge(14,amp*.8,seed+3)
  for i in range(n+1): x=100*i/n; pts.append(f"{x:.2f}% {t[i] if top else 0}px")
  for i in range(1,14): y=100*i/14; pts.append(f"calc(100% - {r[i] if right else 0}px) {y:.2f}%")
  for i in range(n,-1,-1): x=100*i/n; pts.append(f"{x:.2f}% calc(100% - {b[i] if bottom else 0}px)")
  for i in range(13,0,-1): y=100*i/14; pts.append(f"{l[i] if left else 0}px {y:.2f}%")
  return 'polygon('+','.join(pts)+')'
css=''
for k in range(1,5): css+=f".t{k}{{clip-path:{torn(k*7,5)}}}\n"
css+=f".tTB{{clip-path:{torn(91,14,True,True,False,False,60)}}}\n.tT{{clip-path:{torn(55,16,True,False,False,False,60)}}}\n.tapeclip{{clip-path:{torn(3,3,False,False,True,True,8)}}}\n"
shell=open('shell.html').read()
a=shell.index('<style>')+7;b=shell.index('</style>')
NOISE="url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.28 0 0 0 0 0.2 0 0 0 .55 -.18'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)'/%3E%3C/svg%3E\")"
FIB="url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.012 .08' numOctaves='2' seed='3'/%3E%3CfeColorMatrix values='0 0 0 0 0.4 0 0 0 0 0.33 0 0 0 0 0.25 0 0 0 .35 -.12'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23f)'/%3E%3C/svg%3E\")"
style=open('theme.css').read().replace('NOISE',NOISE).replace('FIBRE',FIB)+css
shell=shell[:a]+style+shell[b:]
shell=shell.replace('<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">','<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&family=Courier+Prime:wght@400;700&display=swap" rel="stylesheet">')
shell=shell.replace('<footer>Built from your <i>Visual Maths Guide</i> (Units 1 &amp; 2) and <i>Progression Test + Checkpoint</i> file. Not an official Cambridge publication.</footer>','<footer class="kraft tT" id="foot"></footer>')
shell=shell.replace('<main id="app"></main>','<main id="app"></main>').replace('Stage 6 Maths Revision · Units 1 &amp; 2','Paper Maths · Stage 6 · Units 1–17')
open('shell4.html','w').write(shell);print(len(shell))
