"""Regenerate the web index from the published registers and exact dossier entries."""
from pathlib import Path
import csv,json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
def rows(p):return list(csv.DictReader(p.open(),delimiter='\t'))
cat=rows(ROOT/'source-edition/CATALOGUE.tsv');files=rows(ROOT/'source-edition/SOURCE_FILES.tsv');refs=rows(ROOT/'source-edition/ARTICLE-REFERENCES.tsv');out=ROOT/'docs/registry';out.mkdir(exist_ok=True)
byfiles={}
for f in files:
 assert hashlib.sha256((ROOT/'source-edition'/f['path']).read_bytes()).hexdigest()==f['sha256'],f['path']
 for rid in re.split(r';\s*',f['record_ids']):byfiles.setdefault(rid,[]).append({'path':f['path'],'sha256':f['sha256']})
records=[];dossiers=[]
for i in range(1,33):
 did=f'A{i:02}';text=(ROOT/f'source-edition/dossiers/{did}.md').read_text();name=re.search(r'^# (.+)',text)[1];ms=list(re.finditer(r'<a id="(a\d{2}-[sd]\d+)"></a>',text));entries={}
 for j,m in enumerate(ms):entries[m[1].upper()]=text[m.end():ms[j+1].start() if j+1<len(ms) else len(text)].strip()
 group=[r for r in cat if r['dossier']==did];assert set(entries)=={r['item_id'] for r in group}
 for r in group:records.append({**r,'type':'correspondence' if '-S' in r['item_id'] else 'document / data / media','sources':byfiles.get(r['item_id'],[])})
 dossiers.append({'id':did,'title':name,'count':len(group)});(out/f'{did}.json').write_text(json.dumps(entries,ensure_ascii=False)+'\n')
(out/'index.json').write_text(json.dumps({'records':records,'dossiers':dossiers,'references':refs},ensure_ascii=False)+'\n')
print(f'{len(records)} records; {len(dossiers)} dossiers; {len(refs)} references')
