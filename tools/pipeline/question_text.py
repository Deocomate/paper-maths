import json,sys,re
P={p['id']:p for p in json.load(open('pp/papers.json'))}
for pid in sys.argv[1:]:
  print('#####',pid)
  for q in P[pid]['qs']:
    t=re.sub(r'\s+',' ',q['text']);t=re.sub(r'© UCLES \d+ \S+ (\[Turn over)?','',t)
    print(f"Q{q['n']} [{q['marks']}] {t[:600]}")
