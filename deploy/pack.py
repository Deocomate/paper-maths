"""Packs what the server needs (backend, package files, built site) into one tgz.
Usage: python deploy/pack.py <output.tgz>   (run `python build.py` first)"""
import sys, tarfile, os

out = sys.argv[1]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with tarfile.open(out, 'w:gz') as t:
    for name in ['server/app.js', 'server/index.js', 'package.json', 'package-lock.json', 'dist/web']:
        t.add(os.path.join(root, name), arcname=name, filter=lambda i: None if i.name.endswith('.test.js') else i)
print(out, round(os.path.getsize(out) / 1e6, 1), 'MB')
