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
 files[name]=entry
(OUT/'registry/files.json').write_text(json.dumps(files,ensure_ascii=False))
(OUT/'.nojekyll').touch()
print(f'Staged {len(files)} public files in {OUT}')
