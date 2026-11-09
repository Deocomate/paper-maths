#!/usr/bin/env python3
"""Build Paper Maths into dist/.

Outputs
  dist/web/index.html          single page app (all code + unit data inline)
  dist/web/pdata/<paper>.js    question pictures for one test paper (lazy-loaded)
  dist/offline/Paper_Maths.html  one self-contained file (everything inline, works offline)

Usage:  python3 build.py        (Python 3.8+, no third-party packages)
"""
import json, base64, subprocess, os, re, shutil, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
SRC, DATA, DIST = 'src', 'data', 'dist'

# question flags used by the UI (tick boxes, drawing hint, ring hint, matching hint)
DR = r'\b[Dd]raw\b(?! a ring)|[Ss]ketch|[Cc]omplete the (net|diagram|shape|graph|bar|line graph)|[Pp]lot\b|\bShade\b|shading|[Mm]ark\b|[Rr]eflect|[Tt]ranslat|[Rr]otat|[Ss]how the'
TK = r'Tick|\(✓\)'
RG = r'\bring\b'
LN = r'[Dd]raw (a )?(straight )?lines? to|[Jj]oin|[Mm]atch'

def b64(path):
    return 'data:image/webp;base64,' + base64.b64encode(open(path, 'rb').read()).decode()

def main():
    # 1. HTML shell with the theme CSS inlined -> src/shell4.html
    subprocess.run([sys.executable, 'mkshell.py'], check=True, cwd=SRC)
    shell = open(f'{SRC}/shell4.html', encoding='utf8').read()

    # 2. Units 1-2 exam items (topic pages) + their pictures
    items = json.load(open(f'{DATA}/exam_items.json', encoding='utf8'))
    exam = [{k: i[k] for k in ('id', 'unit', 'kind', 'year', 'paper', 'oq', 'srcpage', 'related', 'page', 'answer', 'skill')} for i in items]
    vimg = {p: b64(f'{DATA}/guide/v{p}.webp') for p in range(2, 20)}
    qimg = {i['id']: b64(f"{DATA}/exam/{i['id']}.webp") for i in items}

    # 3. Checkpoint / Progression papers
    papers = json.load(open(f'{DATA}/papers.json', encoding='utf8'))
    pp = [{'id': p['id'], 'board': p['board'], 'year': p['year'], 'ses': p['ses'], 'paper': p['paper'],
           'qs': [{'n': q['n'], 'crops': q['crops'], 'marks': q['marks'],
                   'tk': bool(re.search(TK, q['text'])), 'dr': bool(re.search(DR, q['text'])),
                   'rg': bool(re.search(RG, q['text'])), 'ln': bool(re.search(LN, q['text']))} for q in p['qs']]}
          for p in papers]
    sol = 'const PSOL=(()=>{const S={};\n' + '\n'.join(
        open(f'{DATA}/sol/{f}', encoding='utf8').read() for f in sorted(os.listdir(f'{DATA}/sol'))) + '\nreturn S})();\n'

    data = ('const EXAM=' + json.dumps(exam, ensure_ascii=False) + ';\n'
            'const VIMG=' + json.dumps(vimg) + ';\n'
            'const QIMG=' + json.dumps(qimg) + ';\n'
            'const PAPERS=' + json.dumps(pp) + ';\n'
            'const PTOPIC=' + open(f'{DATA}/topics.json', encoding='utf8').read() + ';\n'
            'const GEO=' + open(f'{DATA}/overlays.json', encoding='utf8').read() + ';\n'
            + sol
            + open(f'{SRC}/data.js', encoding='utf8').read() + '\n'
            + open(f'{SRC}/data2.js', encoding='utf8').read() + '\n'
            + open(f'{SRC}/cimg.js', encoding='utf8').read())
    code = '\n'.join(open(f'{SRC}/{f}', encoding='utf8').read() for f in
                     ['diag.js', 'sol.js', 'prac2.js', 'interact.js', 'extra.js', 'papers_app.js', 'app5.js', 'sync.js'])
    html = shell.replace('/*@@DATA@@*/', data).replace('/*@@CODE@@*/', code)

    # 4. web build: index.html + one picture bundle per paper
    shutil.rmtree(DIST, ignore_errors=True)
    os.makedirs(f'{DIST}/web/pdata'); os.makedirs(f'{DIST}/offline')
    open(f'{DIST}/web/index.html', 'w', encoding='utf8').write(html)
    allimg = {}
    for p in papers:
        m = {c: b64(f'{DATA}/img/{c}') for q in p['qs'] for c in q['crops']}
        allimg.update(m)
        open(f"{DIST}/web/pdata/{p['id']}.js", 'w').write('window.PIMG=Object.assign(window.PIMG||{},' + json.dumps(m) + ');')

    # 5. offline single file
    off = html.replace('const PAPERS=', 'window.PIMG=' + json.dumps(allimg) + ';\nconst PAPERS=', 1)
    open(f'{DIST}/offline/Paper_Maths.html', 'w', encoding='utf8').write(off)
    print(f'web/index.html {len(html)/1e6:.1f} MB · {len(papers)} paper bundles · offline {len(off)/1e6:.1f} MB')

if __name__ == '__main__':
    main()
