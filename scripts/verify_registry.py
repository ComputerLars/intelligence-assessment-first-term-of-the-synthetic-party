from pathlib import Path
import csv,json,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
def rows(p):return list(csv.DictReader(p.open(),delimiter='\t'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
cat=rows(ROOT/'source-edition/CATALOGUE.tsv');refs=rows(ROOT/'source-edition/ARTICLE-REFERENCES.tsv');files=rows(ROOT/'source-edition/SOURCE_FILES.tsv')
assert len(cat)==3056 and len({r['item_id'] for r in cat})==3056
assert len(refs)==99 and len({r['item_id'] for r in refs})==81
assert {r['item_id'] for r in cat if r['representation']=='withheld'}=={'A23-D10','A23-D11','A23-D12','A29-D19'}
index=json.loads((ROOT/'docs/registry/index.json').read_text());assert len(index['dossiers'])==32 and len(index['records'])==3056 and index['references']==refs
for row in cat:
 entry=json.loads((ROOT/'docs/registry'/f"{row['dossier']}.json").read_text())[row['item_id']]
 source=(ROOT/'source-edition/dossiers'/f"{row['dossier']}.md").read_text();assert entry in source
for row in files:assert sha(ROOT/'source-edition'/row['path'])==row['sha256'],row['path']
for row in refs:assert row['item_id'] in {r['item_id'] for r in cat}
for line in (ROOT/'SHA256SUMS.txt').read_text().splitlines():
 digest,name=line.split('  ',1);assert sha(ROOT/name)==digest,name
print(json.dumps({'records':len(cat),'dossiers':32,'references':len(refs),'distinct_records':81,'source_files':len(files),'errors':0}))
