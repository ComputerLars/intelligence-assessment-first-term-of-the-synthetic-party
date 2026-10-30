
const data = window.REGISTER_DATA;
const nav = document.getElementById('nav');
const content = document.getElementById('content');
const pageTitle = document.getElementById('page-title');
const facts = document.getElementById('facts');
const quickLinks = document.getElementById('quick-links');
const objections = document.getElementById('objections');
document.getElementById('pages-link').href = data.pagesUrl;
document.getElementById('repo-link').href = data.repoUrl;

const pages = {
  home: renderHome,
  readme: renderReadme,
  register: renderRegister,
  functions: renderFunctions,
  concordance: renderConcordance,
  supplements: renderSupplements,
  notes: renderNotes,
};

const navModel = [
  {title: 'Front matter', links:[['home','Article / abstract'],['readme','README / register']]},
  {title: 'Routes', links:[['register','Source register'],['functions','Assigned functions'],['concordance','Assessment concordance'],['supplements','Supplements']]},
  {title: 'Protocol', links:[['notes','Reading the file / publication note']]}
];

function initNav() {
  nav.innerHTML = navModel.map(group => `
    <div class="nav-group">
      <h3>${group.title}</h3>
      ${group.links.map(([hash,label]) => `<a href="#${hash}">${label}</a>`).join('')}
    </div>`).join('');
}

function initRail() {
  facts.innerHTML = [
    data.summary,
    '32 dossiers (A01–A32)',
    '99 record-level references to 81 records',
    'Supplementary Malmö transcript and quantitative checks'
  ].map(x => `<li>${x}</li>`).join('');
  quickLinks.innerHTML = [
    ['Dossier register', '#register'],
    ['Complete catalogue', data.repoUrl + '/blob/main/source-edition/CATALOGUE.tsv'],
    ['Source files and hashes', data.repoUrl + '/blob/main/source-edition/SOURCE_FILES.tsv'],
    ['Citation guidance', data.repoUrl + '/blob/main/CITING.md'],
    ['Release note', data.repoUrl + '/blob/main/RELEASE-NOTES.md']
  ].map(([label,href])=> `<li><a target="_blank" rel="noopener" href="${href}">${label}</a></li>`).join('');
  objections.innerHTML = data.objections.map(x => `<li><a target="_blank" rel="noopener" href="${x.href}">${x.label}</a></li>`).join('');
}

function renderHome() {
  pageTitle.textContent = 'Article / abstract';
  content.innerHTML = `
    <section class="hero">
      <div class="eyebrow">${data.subtitle}</div>
      <h2>${data.title}</h2>
      <div class="subline">${data.author} · public-facing Pages entry point</div>
      <p class="tagline">${data.homeLead}</p>
      <div class="grid">
        <div class="card"><div class="kicker">Entry</div><h3>Article first</h3><p>The front page leads with the chapter title, abstract and routes into the source register so readers know what the environment is doing before they enter the dossiers.</p></div>
        <div class="card"><div class="kicker">Register</div><h3>Indexical navigation</h3><p>Routes are organised by dossier span, investigative function, supplement and record-type convention. The Pages layer acts as the orienting registry of the whole.</p></div>
        <div class="card"><div class="kicker">Repository</div><h3>Public source edition</h3><p>The GitHub repository remains the documentary base. This interface points outward to the archive while preserving the chapter's deadpan institutional fiction.</p></div>
      </div>
    </section>
    <section class="panel abstract">
      <div class="panel-title">Abstract</div>
      ${data.abstract.map(p => `<p>${p}</p>`).join('')}
    </section>
    <section class="panel bodycopy">
      <div class="panel-title">Methodological threshold</div>
      <p>${data.readmeIntro[0]}</p>
      <p>${data.readmeIntro[1]}</p>
      <p class="note">From here, continue into the README rendering, the source-register routes, or the assessment concordance.</p>
    </section>`;
}

function renderReadme() {
  pageTitle.textContent = 'README / register';
  content.innerHTML = `
    <section class="panel bodycopy">
      <div class="panel-title">Case file</div>
      <h2>${data.title}</h2>
      <p><strong>${data.subtitle}</strong></p>
      <p>${data.summary}</p>
      ${data.readmeIntro.map(p => `<p>${p}</p>`).join('')}
    </section>
    <section>
      <div class="panel-title">Points of entry</div>
      <div class="grid">${data.pointsOfEntry.map(item => `
        <article class="card">
          <div class="kicker">${item.id}</div>
          <h3><a target="_blank" rel="noopener" href="${item.href}">${item.label}</a></h3>
          <p>${item.desc}</p>
        </article>`).join('')}</div>
    </section>
    <section class="panel">
      <div class="panel-title">Public objections · Assurance 05</div>
      <p>The assessment proposes a public procedure for contesting representative authority. Its own findings are open to objection here.</p>
      <ul class="links">${data.objections.map(x=>`<li><a target="_blank" rel="noopener" href="${x.href}">${x.label}</a></li>`).join('')}</ul>
    </section>`;
}

function renderRegister() {
  pageTitle.textContent = 'Source register';
  content.innerHTML = `
    <section class="panel bodycopy">
      <div class="panel-title">Routes through the record</div>
      <p>The dossier entries connect each registered source to its available text, code, data or media. Redactions and omissions remain visible; the register retains every identifier.</p>
      <div class="list-table">${data.routes.map(r => `
        <div class="list-row">
          <div class="left"><a target="_blank" rel="noopener" href="${r.href}">${r.span}</a></div>
          <div>${r.label}</div>
        </div>`).join('')}</div>
    </section>
    <section class="panel bodycopy">
      <div class="panel-title">Open the repository files</div>
      <p><a target="_blank" rel="noopener" href="${data.repoUrl + '/blob/main/source-edition/README.md'}">Source register README</a> · <a target="_blank" rel="noopener" href="${'#register'}">All dossiers</a> · <a target="_blank" rel="noopener" href="${data.repoUrl + '/blob/main/source-edition/CATALOGUE.tsv'}">Catalogue</a></p>
    </section>`;
}

function renderFunctions() {
  pageTitle.textContent = 'Assigned functions';
  content.innerHTML = `
    <section class="panel bodycopy">
      <div class="panel-title">Investigative routing</div>
      <p>The same six-part structure used in the manuscript also organises the public source register. Each function frames a distinct question under investigation.</p>
      <div class="grid">${data.functions.map(f => `
        <article class="card">
          <div class="kicker">Function</div>
          <h3><a target="_blank" rel="noopener" href="${f.links[0]}">${f.title}</a></h3>
          <p>${f.question}</p>
        </article>`).join('')}</div>
    </section>`;
}

function renderConcordance() {
  pageTitle.textContent = 'Assessment concordance';
  content.innerHTML = `
    <section class="panel bodycopy">
      <div class="panel-title">Citations to records</div>
      <p>Follow the chapter’s citations to the corresponding source records. The record-level table contains 99 references to 81 records; the lists below also include whole-dossier citations.</p>
      <div class="list-table">${data.concordance.map(c => `
        <div class="list-row">
          <div class="left">${c.heading}</div>
          <div>${c.items.join(' · ')}</div>
        </div>`).join('')}</div>
      <p class="note"><a target="_blank" rel="noopener" href="${data.repoUrl + '/blob/main/source-edition/ARTICLE-INDEX.md'}">Open ARTICLE-INDEX.md on GitHub</a></p>
    </section>`;
}

function renderSupplements() {
  pageTitle.textContent = 'Supplements';
  content.innerHTML = `
    <section class="panel bodycopy">
      <div class="panel-title">Supplement register</div>
      <p>These supplements are separate from the 3,056 dossier records. They extend the source registry with the Malmö intercept, quantitative checks and language classification.</p>
      <div class="grid">${data.supplements.map(s => `
        <article class="card">
          <div class="kicker">${s.title}</div>
          <h3><a target="_blank" rel="noopener" href="${s.href}">${s.sub}</a></h3>
          <p>${s.desc}</p>
        </article>`).join('')}</div>
    </section>`;
}

function renderNotes() {
  pageTitle.textContent = 'Reading the file / publication note';
  content.innerHTML = `
    <section class="panel bodycopy">
      <div class="panel-title">Reading the file</div>
      <ul class="conventions">${data.conventions.map(c => `<li>${c}</li>`).join('')}</ul>
    </section>
    <section class="panel bodycopy">
      <div class="panel-title">Source and publication note</div>
      <p>This register accompanies Asker Bryld Staunæs, <em>Intelligence Assessment: First Term of The Synthetic Party</em>, prepared for <em>Political Parties and Digital Innovations: Participation, Democracy and Efficiency</em> (Palgrave Macmillan).</p>
      <p>Within the chapter’s institutional fiction, the European Democracy Sword’s coordinating environment assembles and screens these dossiers as an EEAS intelligence assessment. The records derive from The Synthetic Party’s historical production archive. Their reproduction status, redactions and source limitations are documented in this edition.</p>
    </section>`;
}

function route() {
  const hash = (location.hash || '#home').replace('#','');
  const renderer = pages[hash] || pages.home;
  renderer();
}

function initSearch() {
  const pool = [
    ...Object.entries({home:'Article / abstract', readme:'README / register', register:'Source register', functions:'Assigned functions', concordance:'Assessment concordance', supplements:'Supplements', notes:'Reading the file / publication note'}).map(([hash,label])=>({label, target:'#'+hash})),
    ...data.pointsOfEntry.map(x=>({label:`${x.id} · ${x.label}`, target:x.href})),
    ...data.supplements.map(x=>({label:`${x.title} · ${x.sub}`, target:x.href})),
    ...data.functions.map(x=>({label:x.title, target:x.links[0]}))
  ];
  const input = document.getElementById('search');
  const results = document.getElementById('search-results');
  function show(items) {
    results.innerHTML = items.slice(0,12).map(item => item.target.startsWith('#')
      ? `<a href="${item.target}">${item.label}</a>`
      : `<a target="_blank" rel="noopener" href="${item.target}">${item.label}</a>`).join('');
  }
  show(pool.slice(0,8));
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!q) return show(pool.slice(0,8));
    show(pool.filter(item => item.label.toLowerCase().includes(q)));
  });
}


let registry;
const esc = value => String(value).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const recordLink = r => `<a href="#record/${r.item_id}">${r.item_id} · ${esc(r.title)}</a>`;
function renderHome() {
 pageTitle.textContent='Article / abstract';
 content.innerHTML=`<section class="hero"><div class="eyebrow">EUROPEAN DEMOCRACY SWORD · v.01</div><h2>${data.title}</h2><p>${data.author}</p></section><section class="panel abstract"><div class="panel-title">Abstract</div>${data.abstract.map(p=>`<p>${p}</p>`).join('')}</section><p class="entry-actions"><a class="enter" href="#register">Enter the investigation →</a> <a href="${data.repoUrl}/raw/refs/heads/main/Intelligence_Assessment_First_Term_Synthetic_Party_v01.docx">Read the article (.docx)</a></p><p class="note">Computer Lars / Asker Bryld Staunæs · Artistic research. The investigating bureau is fictional; the historical sources are authentic.</p>`;
}
function renderRegister(params=new URLSearchParams()) {
 pageTitle.textContent='Source register';
 const did=params.get('dossier')||'',type=params.get('type')||'',q=(params.get('q')||'').toLowerCase();
 const matches=registry.records.filter(r=>(!did||r.dossier===did)&&(!type||r.type===type)&&(!q||(r.item_id+' '+r.title).toLowerCase().includes(q)));
 content.innerHTML=`<section class="panel"><h2>Source register</h2><p>3,056 records · 32 dossiers. [████] marks redaction; […] marks omission.</p><form id="filters"><label>Dossier <select name="dossier"><option value="">All dossiers</option>${registry.dossiers.map(d=>`<option value="${d.id}" ${d.id===did?'selected':''}>${esc(d.title)} (${d.count})</option>`).join('')}</select></label><label>Record type <select name="type"><option value="">All types</option>${['correspondence','document / data / media'].map(t=>`<option ${t===type?'selected':''}>${t}</option>`).join('')}</select></label><label>Identifier or title <input name="q" value="${esc(q)}"></label><button>Find records</button></form><p role="status">${matches.length} records</p><div class="list-table">${matches.map(r=>`<div class="list-row"><div>${recordLink(r)}</div><div>${esc(r.representation)} · ${esc(r.type)}</div></div>`).join('')}</div></section>`;
 document.getElementById('filters').addEventListener('submit',e=>{e.preventDefault();location.hash='register?'+new URLSearchParams(new FormData(e.target));});
}
function renderFunctions() {
 pageTitle.textContent='Assigned functions';content.innerHTML=`<h2>Assigned functions</h2><div class="grid">${data.functions.map((f,i)=>`<article class="card"><div class="kicker">${String(i).padStart(2,'0')}</div><h3><a href="#agent/${i}">${f.title}</a></h3><p>${f.question}</p></article>`).join('')}</div>`;
}
function renderAgent(n) {
 const f=data.functions[Number(n)];if(!f)return renderMissing();pageTitle.textContent=f.title;
 const refs=registry.references.filter(r=>r.section.startsWith(String(n).padStart(2,'0')+'.'));
 const sourceRoutes=data.concordance.find(c=>c.heading===f.title);
 content.innerHTML=`<h2>${f.title}</h2><p>${f.question}</p><section class="panel"><h3>Assessment routes</h3>${sourceRoutes?sourceRoutes.items.map(concordanceLink).join(' · '):''}</section><section class="panel"><h3>Record-level references</h3>${referenceTable(refs)}</section>`;
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
function referenceTable(refs) {return refs.length?`<table><thead><tr><th>Paragraph</th><th>Finding / section</th><th>Record</th></tr></thead><tbody>${refs.map(r=>`<tr><td>${esc(r.paragraph)}</td><td>${esc(r.section)}</td><td><a href="#record/${r.item_id}">${r.item_id}</a></td></tr>`).join('')}</tbody></table>`:'<p>Scope: the complete registry. No individual record citation in this section.</p><a href="#register">Open all dossiers</a>';}
function renderConcordance() {
 pageTitle.textContent='Assessment concordance';content.innerHTML=`<h2>Assessment concordance</h2><p>${registry.references.length} record-level references to ${new Set(registry.references.map(r=>r.item_id)).size} distinct records.</p>${data.concordance.map(c=>`<section class="panel"><h3>${esc(c.heading)}</h3><p>${c.items.map(concordanceLink).join(' · ')}</p></section>`).join('')}<section class="panel"><h3>Paragraph concordance</h3>${referenceTable(registry.references)}</section>`;
}
let routeSerial=0;
async function renderRecord(id) {
 const serial=routeSerial,r=registry.records.find(r=>r.item_id===id);if(!r)return renderMissing();pageTitle.textContent=id+' · '+r.title;
 content.innerHTML='<p role="status">Opening source entry…</p>';
 const response=await fetch(`registry/${r.dossier}.json`);if(!response.ok)throw Error('Source entry unavailable');const entries=await response.json();if(serial!==routeSerial)return;
 const url=data.repoUrl+`/blob/main/source-edition/dossiers/${r.dossier}.md#${id.toLowerCase()}`;
 content.innerHTML=`<p><a href="#register?dossier=${r.dossier}">← ${r.dossier}</a></p><h2>${id}: ${esc(r.title)}</h2><p class="status">${esc(r.representation)} · ${esc(r.type)}</p><section class="panel"><div class="source-text"></div></section>${r.sources.length?`<section class="panel"><h3>Source files</h3><ul>${r.sources.map(f=>`<li><a href="${data.repoUrl}/blob/main/source-edition/${encodeURI(f.path)}">${esc(f.path)}</a><details><summary>SHA-256</summary><code>${f.sha256}</code></details></li>`).join('')}</ul></section>`:''}<p><a href="${url}">Source entry on GitHub</a> · <a href="${data.repoUrl}/issues/new?template=objection.yml&title=${encodeURIComponent('Objection: '+id)}">Contest this record</a></p><section class="panel"><h3>Assessment references</h3>${(registry.references.some(x=>x.item_id===id)?referenceTable(registry.references.filter(x=>x.item_id===id)):'<p>No record-level citation in the assessment concordance.</p>')}</section>`;
 // Source text stays literal; link labels and targets are parsed without evaluating source HTML/code.
 const target=content.querySelector('.source-text');const body=entries[id].replace(/^##[^\n]*\n+/,'');const pattern=/\[([^\]\n]+)\]\(([^\s)]+)\)/g;let last=0,m;
 while((m=pattern.exec(body))){target.append(document.createTextNode(body.slice(last,m.index)));let a=document.createElement('a');a.textContent=m[1];let destination=new URL(m[2],data.repoUrl+'/blob/main/source-edition/dossiers/'+r.dossier+'.md');if(['https:','http:'].includes(destination.protocol)){a.href=destination.href;target.append(a);}else target.append(document.createTextNode(m[0]));last=pattern.lastIndex;}
 target.append(document.createTextNode(body.slice(last)));
}
function renderMissing(){pageTitle.textContent='Locator not found';content.innerHTML='<h2>Locator not found</h2><p>No record has been invented for this address.</p><a href="#register">Return to the register</a>';}
async function route() {
 routeSerial++;const hash=decodeURI((location.hash||'#home').slice(1));const [path,query='']=hash.split('?');const [kind,id]=path.split('/');if(kind==='content'){content.focus();return;}
 try{if(kind==='record')await renderRecord(id);else if(kind==='agent')renderAgent(id);else if(kind==='register')renderRegister(new URLSearchParams(query));else if(pages[kind])pages[kind]();else renderMissing();}catch(e){pageTitle.textContent='Source unavailable';content.innerHTML='<p role="alert">The source could not be loaded. Reload or open the repository.</p>';}
 document.querySelectorAll('#nav a').forEach(a=>{if(a.hash==='#'+kind)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});content.focus({preventScroll:true});window.scrollTo(0,0);
}
function initSearch(){const input=document.getElementById('search'),results=document.getElementById('search-results');results.setAttribute('aria-live','polite');function update(){let q=input.value.trim().toLowerCase();let matches=q?registry.records.filter(r=>(r.item_id+' '+r.title).toLowerCase().includes(q)):[];results.innerHTML=q?`<p>${matches.length} matches</p>`+matches.slice(0,12).map(recordLink).join('')+(matches.length>12?`<a href="#register?q=${encodeURIComponent(q)}">See all matches</a>`:''):'';}input.addEventListener('input',update);input.addEventListener('keydown',e=>{if(e.key==='Enter'){const match=registry.records.find(r=>r.item_id.toLowerCase()===input.value.trim().toLowerCase());location.hash=match?'record/'+match.item_id:'register?q='+encodeURIComponent(input.value.trim());}});update();}
async function boot(){try{const r=await fetch('registry/index.json');if(!r.ok)throw Error('index');registry=await r.json();initNav();initRail();initSearch();window.addEventListener('hashchange',route);await route();}catch(e){content.innerHTML='<p role="alert">The registry could not be loaded. Please reload or open the repository.</p>';}}
boot();
