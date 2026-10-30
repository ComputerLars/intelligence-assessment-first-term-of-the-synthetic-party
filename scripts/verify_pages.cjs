// Exercise routing against every published record and registered source file.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const stage=process.argv[2],index=JSON.parse(fs.readFileSync('docs/registry/index.json'));
const files=JSON.parse(fs.readFileSync(stage+'/registry/files.json'));
const ctx={window:{},document:{getElementById:()=>({})},URL,URLSearchParams,console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('docs/data.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('docs/app.js','utf8').replace(/boot\(\);\s*$/,''),ctx);
ctx.idx=index;ctx.manifest=files;vm.runInContext('registry=idx;files=manifest;',ctx);
const link=(url,base)=>{ctx.href=url;ctx.base=base;return vm.runInContext('resolveLink(href,base)',ctx)};
for(const r of index.records){
 assert.equal(link(`source-edition/dossiers/${r.dossier}.md#${r.item_id.toLowerCase()}`,'README.md'),'#record/'+r.item_id);
 for(const s of r.sources){assert(files['source-edition/'+s.path],s.path);assert(fs.existsSync(stage+'/'+files['source-edition/'+s.path].url),s.path);}
}
assert.equal(link('TRANSCRIPT.md#P064','source-edition/supplements/malmo/README.md'),'#file/source-edition/supplements/malmo/TRANSCRIPT.md?at=P064');
assert.equal(link('javascript:alert(1)','README.md'),null);
assert.equal(link('source-edition/DOSSIERS.md','README.md'),'#register');
assert.equal(link('dossiers/A17.md','source-edition/README.md'),'#dossier/A17');
for(const [p,f] of Object.entries(files))if(f.view)assert(fs.existsSync(stage+'/'+f.view),p);
const home=JSON.parse(fs.readFileSync(stage+'/'+files['README.md'].view)).html;
assert(!home.includes('pages-front.png'));assert(home.includes('Give the record identifier'));
const malmo=JSON.parse(fs.readFileSync(stage+'/'+files['source-edition/supplements/malmo/TRANSCRIPT.md'].view)).html;assert(malmo.includes('id="P064"'));
console.log('Verified 3,056 record routes, all registered source-file routes, README, passage anchors and unsafe-link rejection.');
for(const [path,expected] of [
 ['source-edition/supplements/malmo/README.md','#file/source-edition/supplements/README.md'],
 ['source-edition/supplements/README.md','#file/source-edition/README.md'],
 ['source-edition/README.md','#home'],
 ['source-edition/facsimiles/A17-D03.pdf','#record/A17-D03']]){ctx.path=path;assert.equal(vm.runInContext('fileParent(path)',ctx),expected);}
assert.equal(link('ARTICLE-INDEX.md#03-capacity-control','source-edition/README.md'),'#file/source-edition/ARTICLE-INDEX.md?at=03-capacity-control');
for(const d of index.dossiers){const group=index.records.filter(r=>r.dossier===d.id);ctx.first=group[0];ctx.last=group.at(-1);assert.equal(vm.runInContext('recordNeighbours(first).previous',ctx),undefined);assert.equal(vm.runInContext('recordNeighbours(last).next',ctx),undefined);}
console.log('Verified parent chain, owning-record return, concordance fragment and all 32 dossier boundaries.');
