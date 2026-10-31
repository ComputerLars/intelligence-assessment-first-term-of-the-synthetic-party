"""Stage only tracked public files; render Markdown with source HTML disabled."""
from pathlib import Path
import subprocess,sys,shutil,json,re,html,hashlib
from markdown_it import MarkdownIt
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(sys.argv[1]).resolve()
assert OUT!=ROOT and ROOT not in OUT.parents, 'Stage outside the checkout'
OUT.mkdir(parents=True,exist_ok=True)
md=MarkdownIt('commonmark',{'html':False}).enable('table')
def rendered(text):
 # Only empty, explicit source anchors are interpreted. All other source HTML is literal.
 anchors={}
 def anchor(m):
  key='SOURCEANCHOR'+str(len(anchors))+'END';anchors[key]=m[1];return '\n\n'+key+'\n\n'
 text=re.sub(r'<a\s+id=["\']([A-Za-z0-9_-]+)["\']\s*>\s*</a>',anchor,text)
 result=md.render(text)
 for key,value in anchors.items():result=result.replace('<p>'+key+'</p>','<a id="'+value+'"></a>')
 return result
tracked=subprocess.check_output(['git','ls-files','-z'],cwd=ROOT).decode().split('\0')
files={}
translation_dir=ROOT/'docs/translations/en'
translation_index=json.loads((translation_dir/'index.json').read_text()) if (translation_dir/'index.json').exists() else {}
translated_records=[]
for name in tracked:
 if not name:continue
 src=ROOT/name
 if not src.is_file():continue
 if name.startswith('docs/'):
  dest=OUT/name[5:];dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dest)
 if not (name.startswith('source-edition/') or ('/' not in name and src.suffix.lower() in {'.md','.txt','.cff','.docx'})):continue
 # Executable historical HTML is never served as HTML.
 dest=OUT/'archive'/name
 if src.suffix.lower() in {'.html','.htm','.svg'}:dest=Path(str(dest)+'.txt')
 dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dest)
 suffix=src.suffix.lower();kind='image' if suffix in {'.png','.jpg','.jpeg','.webp','.gif'} else 'pdf' if suffix=='.pdf' else 'download'
 entry={'url':dest.relative_to(OUT).as_posix(),'kind':kind,'sha256':hashlib.sha256(src.read_bytes()).hexdigest()}
 if suffix in {'.md','.txt','.tsv','.csv','.json','.py','.js','.ts','.tsx','.jsx','.yaml','.yml','.cff','.html','.htm','.svg','.css'}:
  try:text=src.read_text()
  except UnicodeDecodeError:pass
  else:
   if name=='README.md':text=re.sub(r'!\[The deployed public source registry\][^\n]*\n\s*\*The public-facing source registry[^\n]*\n','',text)
   if name=='README.md':text=re.sub(r'^!\[The deployed public source registry\]\(docs/assets/intelligence-assessment-pages-front\.png\)\s*\n\s*\*Public source registry(?:, v\.01)?\.[^\n]*\*\s*\n', '', text, flags=re.M)

   entry['kind']='text';view=OUT/'views'/Path(name+'.json');view.parent.mkdir(parents=True,exist_ok=True)
   view.write_text(json.dumps({'html':rendered(text) if suffix=='.md' else '<pre>'+html.escape(text)+'</pre>'},ensure_ascii=False))
   entry['view']=view.relative_to(OUT).as_posix()
 if name in translation_index and entry['kind']=='text':
  t=json.loads((translation_dir/translation_index[name]['file']).read_text())
  assert t['source']==name and t['source_sha256']==entry['sha256'], 'Stale translation: '+name
  marks=r'\[[^\]\n]*[█…][^\]\n]*\]|\[\.\.\.\]'
  assert re.findall(marks,src.read_text())==re.findall(marks,t['text']), 'Changed redaction markers: '+name
  english=OUT/'views/en'/Path(name+'.json');english.parent.mkdir(parents=True,exist_ok=True)
  english.write_text(json.dumps({'html':rendered(t['text']) if suffix=='.md' else '<pre>'+html.escape(t['text'])+'</pre>'},ensure_ascii=False))
  entry['en_view']=english.relative_to(OUT).as_posix()
  if re.fullmatch(r'source-edition/dossiers/A\d{2}\.md',name):
   matches=list(re.finditer(r'<a id="(a\d{2}-[sd]\d+)"></a>',t['text']));entries={}
   for i,m in enumerate(matches):entries[m[1].upper()]=t['text'][m.end():matches[i+1].start() if i+1<len(matches) else len(t['text'])].strip()
   original=json.loads((ROOT/'docs/registry'/Path(name).with_suffix('.json').name).read_text())
   assert set(original)==set(entries),name
   target=OUT/'registry/en'/Path(name).with_suffix('.json').name;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(json.dumps(entries,ensure_ascii=False))
   translated_records.extend(key for key in entries if entries[key]!=original[key])
 files[name]=entry
(OUT/'registry/files.json').write_text(json.dumps(files,ensure_ascii=False))
(OUT/'registry/english.json').write_text(json.dumps(translated_records))
(OUT/'.nojekyll').touch()
print(f'Staged {len(files)} public files in {OUT}')
