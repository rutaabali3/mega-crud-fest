from pathlib import Path
import re, requests, csv
html=Path(__file__).with_name('index.html').read_text()
repos=re.findall(r"\['([a-z0-9-]+)','", html)
rows=[]
for repo in repos:
 url=f'https://rutaabali3.github.io/{repo}/'
 try:
  r=requests.get(url,timeout=25,headers={'User-Agent':'mega-crud-fest-link-check'})
  rows.append((repo,r.status_code,len(r.content),url))
 except Exception as e:
  rows.append((repo,'ERROR',0,url))
for row in rows: print('\t'.join(map(str,row)))
Path(__file__).with_name('link-check.tsv').write_text('repo\tstatus\tbytes\turl\n'+'\n'.join('\t'.join(map(str,r)) for r in rows)+'\n')
assert len(rows)==32, len(rows)
assert all(r[1]==200 for r in rows), [r for r in rows if r[1]!=200]
print(f'PASS: {len(rows)}/32 links returned HTTP 200')
