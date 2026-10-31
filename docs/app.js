const data=window.REGISTER_DATA;
const content=document.getElementById('content'),pageTitle=document.getElementById('page-title'),buffer=document.getElementById('buffer');
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let registry,files,routeSerial=0,currentHash='',parentRoute='#home';
const scrolls=new Map();
const recordLink=r=>`<a href="#record/${r.item_id}">${r.item_id} · ${esc(r.title)}</a>`;
const fileRoute=(path,at='')=>'#file/'+encodeURI(path)+(at?'?at='+encodeURIComponent(at):'');
function resolveLink(href,base){
 const root=data.repoUrl+'/blob/main/';
 if(href.startsWith(root))href=href.slice(root.length),base='README.md';
 if(href.startsWith(data.pagesUrl)){const u=new URL(href);return u.hash||'#home';}
 const u=new URL(href,'https://archive.invalid/'+base);
 if(u.origin!=='https://archive.invalid')return ['https:','http:','mailto:'].includes(u.protocol)?u.href:null;
 let path=decodeURIComponent(u.pathname.slice(1)),at=decodeURIComponent(u.hash.slice(1));
 if(path.endsWith('/'))path+='README.md';
 const rec=at.toUpperCase();
 if(/^A\d{2}-[SD]\d+$/.test(rec)&&registry.records.some(r=>r.item_id===rec))return '#record/'+rec;
 if(/^source-edition\/dossiers\/A\d{2}\.md$/.test(path)&&!at)return '#dossier/'+path.match(/A\d{2}/)[0];
 if(path==='source-edition/DOSSIERS.md')return '#register';
 if(path==='source-edition/CATALOGUE.tsv')return '#catalogue';
 if(path==='source-edition/ARTICLE-INDEX.md')return at?fileRoute(path,at):'#concordance';
 if(path==='README.md')return at?fileRoute(path,at):'#home';
 return files[path]?fileRoute(path,at):u.href.replace('https://archive.invalid/',root);
}
function wireLinks(base){
 content.querySelectorAll('a[href]').forEach(a=>{const href=resolveLink(a.getAttribute('href'),base);if(href)a.setAttribute('href',href);else a.removeAttribute('href');});
 content.querySelectorAll('img').forEach(img=>{const u=new URL(img.getAttribute('src'),'https://archive.invalid/'+base),f=files[decodeURIComponent(u.pathname.slice(1))];if(u.origin==='https://archive.invalid'&&f)img.src=f.url;else img.removeAttribute('src');img.loading='lazy';});
 content.querySelectorAll('h1,h2,h3,h4').forEach(h=>{if(!h.id)h.id=h.textContent.toLowerCase().replace(/[^\p{L}\p{N} _-]/gu,'').replace(/ /g,'-');});
}
function contextLinks(parent=parentRoute){return `<p class="file-context"><a href="${parent}">Parent</a> · <a href="#home">Root</a></p>`;}
function fileParent(path){
 const owner=registry.records.find(r=>r.sources.some(s=>'source-edition/'+s.path===path));
 if(owner)return '#record/'+owner.item_id;
 const parts=path.split('/');parts.pop();
 if(path.endsWith('/README.md'))parts.pop();
 const parent=[...parts,'README.md'].join('/');
 return parent==='README.md'?'#home':files[parent]?fileRoute(parent):'#register';
}
function recordNeighbours(r){const group=registry.records.filter(x=>x.dossier===r.dossier),i=group.findIndex(x=>x.item_id===r.item_id);return {previous:group[i-1],next:group[i+1]};}
async function renderFile(path,at='',home=false){
 const f=files[path];if(!f)return renderMissing();
 const serial=routeSerial;parentRoute=fileParent(path);
 pageTitle.textContent='/'+path;
 let body='';
 if(f.kind==='text'){const response=await fetch(f.view);if(!response.ok)throw Error('file');body=(await response.json()).html;}
 else if(f.kind==='image')body=`<h2>${esc(path.split('/').pop())}</h2><img src="${f.url}" alt="${esc(path)}">`;
 else if(f.kind==='pdf')body=`<h2>${esc(path.split('/').pop())}</h2><object class="pdf" data="${f.url}" type="application/pdf"><p>Open the PDF using the link below.</p></object>`;
 else body=`<h2>${esc(path.split('/').pop())}</h2><p>File available below.</p>`;
 if(serial!==routeSerial)return;
 content.innerHTML=body;if(f.kind==='text')wireLinks(path);
 if(!home)content.insertAdjacentHTML('afterbegin',contextLinks());
 if(!home)content.insertAdjacentHTML('beforeend',`<p class="file-context"><a href="${f.url}" download>Download this file</a> · <a href="${data.repoUrl}/blob/main/${encodeURI(path)}">View source on GitHub</a></p>`);
}
function renderDirectory(){parentRoute='#home';pageTitle.textContent='/dossiers';content.innerHTML=contextLinks()+`<h2>Dossier register</h2><p>Open a dossier or enter a record identifier.</p><p>32 dossiers · 3,056 records · <a href="#catalogue">Complete catalogue</a></p><ul class="links">${registry.dossiers.map(d=>`<li><a href="#dossier/${d.id}">${esc(d.title)}</a> · ${d.count} records</li>`).join('')}</ul>`;}
function renderRegister(params=new URLSearchParams()){
 const did=params.get('dossier')||'',type=params.get('type')||'',q=(params.get('q')||'').toLowerCase();
 const d=registry.dossiers.find(d=>d.id===did);if(did&&!d)return renderMissing();
 parentRoute='#register';pageTitle.textContent=did?'/dossiers/'+did:'/catalogue';
 const matches=registry.records.filter(r=>(!did||r.dossier===did)&&(!type||r.type===type)&&(!q||(r.item_id+' '+r.title).toLowerCase().includes(q)));
 const size=75,totalPages=Math.max(1,Math.ceil(matches.length/size)),page=Math.min(totalPages,Math.max(1,parseInt(params.get('page'),10)||1)),start=(page-1)*size;
 const pageLink=n=>{const p=new URLSearchParams(params);p.set('page',n);return '#catalogue?'+p;};
 const batches=totalPages>1?`<p>${page>1?`<a href="${esc(pageLink(page-1))}">← Previous 75</a> · `:''}Page ${page} of ${totalPages}${page<totalPages?` · <a href="${esc(pageLink(page+1))}">Next ${Math.min(size,matches.length-start-size)} →</a>`:''}</p>`:'';
 content.innerHTML=contextLinks()+`<h2>${d?esc(d.title):'Complete catalogue'}</h2><form id="filters"><label>Dossier <select name="dossier"><option value="">All dossiers</option>${registry.dossiers.map(d=>`<option value="${d.id}" ${d.id===did?'selected':''}>${esc(d.title)}</option>`).join('')}</select></label><label>Record type <select name="type"><option value="">All types</option>${['correspondence','document / data / media'].map(t=>`<option ${t===type?'selected':''}>${t}</option>`).join('')}</select></label><label>Identifier or title <input name="q" value="${esc(q)}"></label><button>Find records</button></form><p role="status">${matches.length} records${matches.length?` · Showing ${start+1}–${Math.min(start+size,matches.length)}`:''}</p>${batches}<div class="list-table">${matches.slice(start,start+size).map(r=>`<div class="list-row"><div>${recordLink(r)}</div><div>${esc(r.representation)} · ${esc(r.type)}</div></div>`).join('')}</div>${batches}`;
 document.getElementById('filters').addEventListener('submit',e=>{e.preventDefault();location.hash='catalogue?'+new URLSearchParams(new FormData(e.target));});
}
function renderFunctions(){parentRoute='#home';pageTitle.textContent='/assignments';content.innerHTML=contextLinks()+`<h2>Assigned functions</h2>${data.functions.map((f,i)=>`<section><h3><a href="#agent/${i}">${esc(f.title)}</a></h3><p>${esc(f.question)}</p></section>`).join('')}`;}
function renderAgent(n){
 const f=data.functions[Number(n)];if(!f)return renderMissing();parentRoute='#functions';pageTitle.textContent='/assignments/'+n;
 const ds=registry.dossiers.filter(d=>f.dossiers.includes(d.id));
 const refs=registry.references.filter(r=>r.section.startsWith(String(n).padStart(2,'0')+'.'));
 content.innerHTML=contextLinks()+`<h2>${esc(f.title)}</h2><p>${esc(f.question)}</p><h3>Dossier routes</h3><ul class="links">${ds.map(d=>`<li><a href="#dossier/${d.id}">${esc(d.title)}</a> · ${d.count} records</li>`).join('')}</ul>${refs.length?`<details><summary>Article concordance</summary>${referenceTable(refs)}</details>`:''}`;
}
function renderArticle() {
 pageTitle.textContent='Article';
 content.innerHTML=`<section class="hero"><div class="eyebrow">EUROPEAN DEMOCRACY SWORD</div><h2>${data.title}</h2><p>${data.author}</p></section><section class="panel abstract"><div class="panel-title">Abstract</div>${data.abstract.map(p=>`<p>${p}</p>`).join('')}</section><p class="entry-actions"><a class="enter" href="#register">Source dossiers</a> <a href="${data.repoUrl}/raw/refs/heads/main/Intelligence_Assessment_First_Term_Synthetic_Party_v01.docx">Read the article (.docx)</a></p><p class="note">Computer Lars / Asker Bryld Staunæs · Artistic research. The investigating bureau is fictional; the historical sources are authentic.</p>`;
}
function concordanceLink(s) {
 if(/^A\d{2}-[SD]\d+$/.test(s))return `<a href="#record/${s}">${s}</a>`;
 if(/^A\d{2}$/.test(s))return `<a href="#register?dossier=${s}">${s}</a>`;
 const range=s.match(/^(A\d{2})-([SD])(\d+)–(?:[SD])?(\d+)$/);
 if(range){let out=[];for(let n=+range[3];n<=+range[4];n++){const id=`${range[1]}-${range[2]}${String(n).padStart(2,'0')}`;if(registry.records.some(r=>r.item_id===id))out.push(`<a href="#record/${id}">${id}</a>`);}return out.join(' · ');}
 const dr=s.match(/^(A\d{2})–(A\d{2})$/);if(dr)return registry.dossiers.filter(d=>d.id>=dr[1]&&d.id<=dr[2]).map(d=>`<a href="#register?dossier=${d.id}">${d.id}</a>`).join(' · ');
 if(s.includes('Malmö'))return '<a href="#supplements">Malmö intercept</a>';
 if(s.includes('METHOD'))return '<a href="#supplements">METHOD-A15-A08</a>';
 return '<a href="#register">Complete dossier register</a>';
}
function referenceTable(refs) {return refs.length?`<table><thead><tr><th>Paragraph</th><th>Article section</th><th>Record</th></tr></thead><tbody>${refs.map(r=>`<tr><td>${esc(r.paragraph)}</td><td>${esc(r.section)}</td><td><a href="#record/${r.item_id}">${r.item_id}</a></td></tr>`).join('')}</tbody></table>`:'<p>Scope: the complete registry. No individual record citation in this section.</p><a href="#register">Open all dossiers</a>';}
function renderConcordance() {
 pageTitle.textContent='Article concordance';content.innerHTML=`<h2>Article concordance</h2><p>${registry.references.length} record-level references to ${new Set(registry.references.map(r=>r.item_id)).size} distinct records.</p>${data.concordance.map(c=>`<section class="panel"><h3>${esc(c.heading)}</h3><p>${c.items.map(concordanceLink).join(' · ')}</p></section>`).join('')}<section class="panel"><h3>Paragraph concordance</h3>${referenceTable(registry.references)}</section>`;
}

async function renderRecord(id){
 const serial=routeSerial,r=registry.records.find(r=>r.item_id===id);if(!r)return renderMissing();
 parentRoute='#dossier/'+r.dossier;pageTitle.textContent='/dossiers/'+r.dossier+'/'+id;
 const response=await fetch(`registry/${r.dossier}.json`);if(!response.ok)throw Error('entry');const entries=await response.json();if(serial!==routeSerial)return;
 const refs=registry.references.filter(x=>x.item_id===id),{previous,next}=recordNeighbours(r);
 content.innerHTML=contextLinks()+`<h2>${id}: ${esc(r.title)}</h2><p class="status">${esc(r.representation)} · ${esc(r.type)}</p><section class="source-text"></section>${r.sources.length?`<h3>Source files</h3><ul>${r.sources.map(f=>`<li><a href="${fileRoute('source-edition/'+f.path)}">${esc(f.path)}</a><details><summary>SHA-256</summary><code>${f.sha256}</code></details></li>`).join('')}</ul>`:''}<p>${previous?`<a href="#record/${previous.item_id}">← ${previous.item_id}</a> · `:''}${next?`<a href="#record/${next.item_id}">${next.item_id} →</a> · `:''}<a href="#register">Dossier register</a> · <a href="${data.repoUrl}/blob/main/source-edition/dossiers/${r.dossier}.md#${id.toLowerCase()}">View source on GitHub</a> · <a href="${data.repoUrl}/issues/new?template=objection.yml&title=${encodeURIComponent('Objection: '+id)}">Contest this record</a></p>${refs.length?`<details><summary>Cited in the accompanying article</summary>${referenceTable(refs)}</details>`:''}`;
 const target=content.querySelector('.source-text'),body=entries[id].replace(/^##[^\n]*\n+/,''),pattern=/\[([^\]\n]+)\]\(([^\s)]+)\)/g;let last=0,m;
 while((m=pattern.exec(body))){target.append(document.createTextNode(body.slice(last,m.index)));const a=document.createElement('a'),href=resolveLink(m[2],`source-edition/dossiers/${r.dossier}.md`);a.textContent=m[1];if(href){a.href=href;target.append(a);}else target.append(document.createTextNode(m[0]));last=pattern.lastIndex;}
 target.append(document.createTextNode(body.slice(last)));
}
function renderMissing(){pageTitle.textContent='/not-found';content.innerHTML='<h2>Locator not found</h2><p>No matching record in the catalogue.</p><a href="#register">Return to the dossier register</a>';}
async function route(){
 if(currentHash)scrolls.set(currentHash,buffer.scrollTop);
 const serial=++routeSerial,hash=location.hash||'#home';currentHash=hash;
 const [path,query='']=hash.slice(1).split('?'),split=path.indexOf('/'),kind=split<0?path:path.slice(0,split),id=split<0?'':decodeURI(path.slice(split+1)),params=new URLSearchParams(query);
 if(kind==='content'){content.focus();return;}
 try{
 if(kind==='home'||kind==='readme'||kind==='notes')await renderFile('README.md','',true);
 else if(kind==='file')await renderFile(id,params.get('at'));
 else if(kind==='record')await renderRecord(id);
 else if(kind==='dossier')renderRegister(new URLSearchParams({dossier:id}));
 else if(kind==='catalogue'||(kind==='register'&&query))renderRegister(params);
 else if(kind==='register')renderDirectory();
 else if(kind==='agent')renderAgent(id);
 else if(kind==='functions')renderFunctions();
 else if(kind==='concordance'){renderConcordance();pageTitle.textContent='/article/concordance';content.insertAdjacentHTML('afterbegin',contextLinks('#home'));}
 else if(kind==='article'){renderArticle();pageTitle.textContent='/publication/article';content.insertAdjacentHTML('afterbegin',contextLinks('#home'));}
 else if(kind==='supplements')await renderFile('source-edition/supplements/README.md');
 else if(kind==='objections'){await renderFile('README.md','',true);params.set('at','public-objections');}
 else renderMissing();
 }catch(e){pageTitle.textContent='/unavailable';content.innerHTML=`<p role="alert">The source could not be loaded. <a href="${data.repoUrl}">Open the repository</a>.</p>`;console.error(e);}
 if(serial!==routeSerial)return;
 content.focus({preventScroll:true});buffer.scrollTop=scrolls.get(hash)||0;
 const at=params.get('at');if(at){const anchor=Array.from(content.querySelectorAll('[id]')).find(el=>el.id===at);if(anchor)anchor.scrollIntoView({block:'start'});}
 document.getElementById('search-results').innerHTML='';
}
function locate(){const q=document.getElementById('search').value.trim(),upper=q.toUpperCase();if(['README','ROOT','/'].includes(upper))location.hash='home';else if(q==='..'||upper==='PARENT')location.hash=parentRoute;else if(registry.dossiers.some(d=>d.id===upper))location.hash='dossier/'+upper;else if(registry.records.some(r=>r.item_id===upper))location.hash='record/'+upper;else location.hash='catalogue?q='+encodeURIComponent(q);}
async function boot(){try{
 const responses=await Promise.all([fetch('registry/index.json'),fetch('registry/files.json')]);if(responses.some(r=>!r.ok))throw Error('index');[registry,files]=await Promise.all(responses.map(r=>r.json()));
 document.getElementById('locator').addEventListener('submit',e=>{e.preventDefault();locate();});
 document.getElementById('search').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase(),matches=q?registry.records.filter(r=>(r.item_id+' '+r.title).toLowerCase().includes(q)):[];document.getElementById('search-results').innerHTML=q?`<p>${matches.length} identifier/title matches</p>`+matches.slice(0,8).map(recordLink).join(''):'';});
 window.addEventListener('hashchange',route);await route();
 }catch(e){content.innerHTML='<p role="alert">The registry could not be loaded. Please reload.</p>';console.error(e);}}
boot();
