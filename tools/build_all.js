// Builds all.html — one browsable view over BOTH catalogs:
//   assets.html   -> 5,649 Unity Asset Store assets (embedded JSON #d0)
//   index.html    -> 1,118 ready-made complete projects (pre-rendered cards)
// The two were only ever viewable separately; this merges them.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// ---- assets ---------------------------------------------------------------
const assetsHtml = read('assets.html');
const ASSETS = JSON.parse(assetsHtml.match(/id=["']d0["'][^>]*>([\s\S]*?)<\/script>/)[1])
  .map(a => ({
    k: 'a',
    id: String(a.id),
    n: a.n || '',
    d: (a.d || '').slice(0, 300),
    cat: a.cn || (a.c && a.c[0]) || '',
    img: (a.img || []).slice(0, 2),
    src: a.src || '',
    ts: a.ts || '',
    dl: a.dl || 0,
  }));

// ---- complete projects ----------------------------------------------------
const indexHtml = read('index.html');
const PROJECTS = [];
// Cards contain nested <div>s, so slice between card starts rather than trying
// to regex a balanced block.
const starts = [];
const startRe = /<div class="card" /g;
let sm;
while ((sm = startRe.exec(indexHtml)) !== null) starts.push(sm.index);

const attr = (chunk, name) => {
  const m = chunk.match(new RegExp(name + '="([^"]*)"'));
  return m ? m[1] : '';
};

for (let i = 0; i < starts.length; i++) {
  const chunk = indexHtml.slice(starts[i], i + 1 < starts.length ? starts[i + 1] : indexHtml.length);
  const id = attr(chunk, 'data-id');
  if (!id) continue;
  const imgs = [...chunk.matchAll(/<img[^>]+src="([^"]+)"/g)].map(x => x[1]).slice(0, 2);
  const t = chunk.match(/<h3><a href="([^"]+)"[^>]*>([\s\S]*?)<\/a><\/h3>/);
  const desc = chunk.match(/<p>([\s\S]*?)<\/p>/);
  PROJECTS.push({
    k: 'p',
    id,
    n: t ? t[2].replace(/<[^>]*>/g, '').trim() : '',
    d: desc ? desc[1].replace(/<[^>]*>/g, '').trim().slice(0, 300) : '',
    cat: attr(chunk, 'data-cat'),
    g: attr(chunk, 'data-g'),
    tier: attr(chunk, 'data-tier'),
    img: imgs,
    src: t ? t[1] : `https://gamepackage.net/ready-made-solutions/${id}`,
    ts: attr(chunk, 'data-ts'),
  });
}

const DATA = [...PROJECTS, ...ASSETS];
console.log(`assets=${ASSETS.length} projects=${PROJECTS.length} total=${DATA.length}`);
if (PROJECTS.length < 1000) throw new Error('project extraction looks wrong');

const GENRES = {
  dance: '🕺 Dance & Music', racing: '🏎 Racing & Driving', flying: '🪂 Flying',
  runner: '🏃 Runners & Parkour', sports: '⚽ Sports', shooter: '🔫 Shooters & Battle',
  puzzle: '🧩 Puzzle & Cards', sim: '🏗 Simulation & Idle',
  action: '🗡 Action & Adventure', arcade: '👾 Arcade & Casual', other: '🎮 Other',
};

const out = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Everything — assets + complete projects</title>
<style>
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:#0e0f13;color:#e8e8ea;
 font-family:system-ui,Segoe UI,Roboto,sans-serif}
header{background:#15161c;padding:12px 18px;border-bottom:1px solid #2a2b33;
 position:sticky;top:0;z-index:5}
.nav{margin-bottom:10px;font-size:14px}
.nav a{color:#7ab8ff;text-decoration:none;font-weight:600}
.nav .here{color:#e8e8ea;font-weight:600}
.nav span{color:#5a5b66;margin:0 8px}
.row{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin-bottom:8px}
.tab,.chip{padding:7px 14px;border-radius:17px;border:1.5px solid #33343d;
 background:#1c1d24;color:#c8c9d0;font-size:13.5px;font-weight:600;cursor:pointer}
.chip{padding:5px 12px;font-size:13px}
.tab span,.chip span{opacity:.55;font-weight:400;margin-left:3px}
.tab.active{border-color:var(--tc,#7fe07f);color:var(--tc,#7fe07f);
 background:color-mix(in srgb,var(--tc,#7fe07f) 12%,#1c1d24)}
.chip.active{border-color:#4ec9a8;color:#4ec9a8;
 background:color-mix(in srgb,#4ec9a8 12%,#1c1d24)}
#q{flex:1;min-width:220px;max-width:460px;padding:9px 12px;border-radius:9px;
 border:1px solid #33343d;background:#1c1d24;color:#fff;font-size:15px}
#count{color:#9a9aa5;font-size:13px}
main{display:grid;gap:14px;padding:16px;
 grid-template-columns:repeat(auto-fill,minmax(320px,1fr))}
.card{position:relative;background:#15161c;border:1px solid #2a2b33;
 border-radius:11px;padding:12px;display:flex;flex-direction:column}
.card.p{border-left:3px solid #f2c14e}
.card.a{border-left:3px solid #7ab8ff}
.kind{position:absolute;top:9px;right:11px;font-size:10px;font-weight:800;
 letter-spacing:.06em;padding:2px 7px;border-radius:9px}
.kind.p{background:#f2c14e;color:#0e0f13}
.kind.a{background:#7ab8ff;color:#0e0f13}
.imgs{display:flex;gap:4px;margin:-12px -12px 10px;border-radius:11px 11px 0 0;
 overflow:hidden;background:#0b0c10}
.imgs img{width:100%;height:120px;object-fit:cover;display:block;flex:1}
.card h3{margin:0;font-size:15px;flex:1;min-width:0}
.card h3 a{color:#e8e8ea;text-decoration:none}
.card h3 a:hover{color:#7ab8ff}
.meta{color:#8f909b;font-size:12px;margin-bottom:7px;text-transform:uppercase;
 letter-spacing:.03em}
.card p{margin:0 0 11px;font-size:13.5px;color:#c8c9d0;flex:1}
.links{display:flex;gap:6px;flex-wrap:wrap}
.links a{font-size:12.5px;font-weight:600;text-decoration:none;padding:5px 10px;
 border-radius:14px;border:1.5px solid #33343d;background:#1c1d24;color:#c8c9d0}
.hdr{display:flex;align-items:flex-start;gap:8px;margin-bottom:4px;
 padding-right:58px}
.fav{flex:0 0 auto;background:none;border:none;font-size:17px;color:#6d6e78;
 cursor:pointer;line-height:1.15;padding:0}
.fav.on{color:#ff5b6e}
.card.faved{border-color:#ff5b6e}
.stars{display:flex;gap:2px;margin-top:9px}
.star{background:none;border:none;color:#3a3b45;font-size:16px;cursor:pointer;
 padding:0 1px;line-height:1}
.star.on{color:#f2c14e}
#more{grid-column:1/-1;height:1px}
#empty{grid-column:1/-1;color:#8f909b;padding:26px 4px}
</style></head><body>
<header>
 <div class="nav"><a href="index.html">Complete Projects</a><span>|</span><a
  href="assets.html">Assets</a><span>|</span><span class="here">🌐 Everything</span><span>|</span><a
  href="joystick.html">🕹 Joystick</a><span>|</span><a href="picks.html">⭐ Top picks</a></div>
 <div class="row" id="srcrow">
  <button class="tab active" data-k="*" style="--tc:#7fe07f">Everything <span>${DATA.length}</span></button>
  <button class="tab" data-k="a" style="--tc:#7ab8ff">Assets <span>${ASSETS.length}</span></button>
  <button class="tab" data-k="p" style="--tc:#f2c14e">Complete projects <span>${PROJECTS.length}</span></button>
 </div>
 <div class="row" id="genrow"></div>
 <div class="row"><input id="q" placeholder="Search…">
  <button class="chip" id="sTitle" data-s="title">Title only</button>
  <button class="chip active" id="sFull" data-s="full">Title + description</button>
  <span id="count"></span></div>
 <div class="row"><span style="color:#8f909b;font-size:13px">Show:</span>
  <button class="chip" id="favtab">♥ My favorites <span id="favn">0</span></button>
  <span style="color:#8f909b;font-size:13px;margin-left:6px">Rating:</span>
  <button class="chip active rbtn" data-r="">Any</button>
  <button class="chip rbtn" data-r="5">★5</button>
  <button class="chip rbtn" data-r="4">★4</button>
  <button class="chip rbtn" data-r="3">★3</button>
  <button class="chip rbtn" data-r="2">★2</button>
  <button class="chip rbtn" data-r="1">★1</button>
  <button class="chip rbtn" data-r="0">Unrated</button></div>
</header>
<main id="grid"><div id="empty" style="display:none">Nothing matches.</div><div id="more"></div></main>
<script id="d" type="application/json">${JSON.stringify(DATA).replace(/</g, '\\u003c')}</script>
<script>
const DATA=JSON.parse(document.getElementById('d').textContent);
const GENRES=${JSON.stringify(GENRES)};
const grid=document.getElementById('grid'),more=document.getElementById('more'),
 q=document.getElementById('q'),count=document.getElementById('count'),
 empty=document.getElementById('empty'),genrow=document.getElementById('genrow');
let kind='*',genre=null,scope='full',view=[],rendered=0,favOnly=false,rfilter=null;
const CHUNK=60;

// Same localStorage keys the other pages use, so hearts and stars set here show
// up on Complete Projects / Assets / Joystick and vice versa.
// projects -> gp_favs / gp_ratings   assets -> gpa_favs / gpa_ratings
const KEY={p:{f:'gp_favs',r:'gp_ratings'},a:{f:'gpa_favs',r:'gpa_ratings'}};
const FAVS={p:new Set(JSON.parse(localStorage.getItem('gp_favs')||'[]').map(String)),
            a:new Set(JSON.parse(localStorage.getItem('gpa_favs')||'[]').map(String))};
const RATS={p:JSON.parse(localStorage.getItem('gp_ratings')||'{}'),
            a:JSON.parse(localStorage.getItem('gpa_ratings')||'{}')};
const favSet=k=>FAVS[k], ratMap=k=>RATS[k];
function saveFavs(k){localStorage.setItem(KEY[k].f,JSON.stringify([...FAVS[k]]));}
function saveRatings(k){localStorage.setItem(KEY[k].r,JSON.stringify(RATS[k]));}
function favCount(){return FAVS.p.size+FAVS.a.size;}

function paintFav(el,it){const on=FAVS[it.k].has(it.id);
 el.classList.toggle('faved',on);const b=el.querySelector('.fav');
 b.textContent=on?'♥':'♡';b.classList.toggle('on',on);}
function paintStars(el,it){const r=RATS[it.k][it.id]||0;
 [...el.querySelectorAll('.star')].forEach((b,i)=>b.classList.toggle('on',i<r));}

const SYNC='https://joystick-favs.farshoukh.workers.dev';let syncT=null;
function pushSync(){clearTimeout(syncT);syncT=setTimeout(()=>{
 fetch(SYNC+'/sync',{method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({gp_favs:[...FAVS.p],gpa_favs:[...FAVS.a],
   gp_ratings:RATS.p,gpa_ratings:RATS.a})}).catch(()=>{});
 const fc=document.getElementById('favn');if(fc)fc.textContent=favCount();},800);}

function esc(s){const d=document.createElement('div');d.textContent=s==null?'':s;
 return d.innerHTML;}

function renderGenres(){
 const cnt={};
 for(const it of DATA){if(kind!=='*'&&it.k!==kind)continue;if(it.k!=='p')continue;
  cnt[it.g]=(cnt[it.g]||0)+1;}
 const keys=Object.keys(GENRES).filter(g=>cnt[g]);
 genrow.innerHTML=keys.length
  ?'<button class="chip'+(genre===null?' active':'')+'" data-g="">All types</button>'
   +keys.map(g=>'<button class="chip'+(genre===g?' active':'')+'" data-g="'+g+'">'
     +GENRES[g]+' <span>'+cnt[g]+'</span></button>').join('')
  :'';
 [...genrow.querySelectorAll('.chip')].forEach(b=>b.addEventListener('click',()=>{
  genre=b.dataset.g||null;renderGenres();refresh();}));
}

function makeCard(it){
 const el=document.createElement('div');
 el.className='card '+it.k;
 const imgs=(it.img||[]).map(u=>'<img loading="lazy" src="'+esc(u)+'" alt="">').join('');
 const yt='https://www.youtube.com/results?search_query='
  +encodeURIComponent(it.n+(it.k==='p'?' unity game':' unity asset'));
 el.innerHTML=
  '<span class="kind '+it.k+'">'+(it.k==='p'?'PROJECT':'ASSET')+'</span>'
  +(imgs?'<div class="imgs">'+imgs+'</div>':'')
  +'<div class="hdr"><button class="fav" title="Favorite">♡</button>'
  +'<h3><a href="'+esc(it.src)+'" target="_blank" rel="noopener">'+esc(it.n)+'</a></h3></div>'
  +'<div class="meta">'+esc(it.cat||'')+(it.tier?' · '+esc(it.tier):'')
   +(it.ts?' · '+it.ts.slice(0,10):'')+'</div>'
  +'<p>'+esc(it.d||'')+'</p>'
  +'<div class="links"><a href="'+esc(it.src)+'" target="_blank" rel="noopener">Open ↗</a>'
  +'<a href="'+yt+'" target="_blank" rel="noopener">🔍 YouTube</a></div>'
  +'<div class="stars">'+[1,2,3,4,5].map(i=>
    '<button class="star" data-i="'+i+'">★</button>').join('')+'</div>';

 const fb=el.querySelector('.fav');
 paintFav(el,it);
 fb.addEventListener('click',()=>{
  const s=favSet(it.k);
  s.has(it.id)?s.delete(it.id):s.add(it.id);
  saveFavs(it.k);paintFav(el,it);pushSync();
  if(favOnly)refresh();});

 paintStars(el,it);
 el.querySelectorAll('.star').forEach(b=>b.addEventListener('click',()=>{
  const r=ratMap(it.k),i=+b.dataset.i;
  if(r[it.id]===i)delete r[it.id];else r[it.id]=i;
  saveRatings(it.k);paintStars(el,it);pushSync();
  if(rfilter!==null)refresh();}));
 return el;
}

function compute(){
 const v=q.value.trim().toLowerCase();
 view=DATA.filter(it=>{
  if(favOnly&&!FAVS[it.k].has(it.id))return false;
  if(kind!=='*'&&it.k!==kind)return false;
  if(genre&&it.g!==genre)return false;
  if(rfilter!==null&&(RATS[it.k][it.id]||0)!==rfilter)return false;
  if(!v)return true;
  if(it.n.toLowerCase().includes(v))return true;
  if(scope==='title')return false;
  return (it.cat||'').toLowerCase().includes(v)
      || (it.d||'').toLowerCase().includes(v);
 });
}
function renderMore(){
 const end=Math.min(rendered+CHUNK,view.length);
 const frag=document.createDocumentFragment();
 for(let i=rendered;i<end;i++)frag.appendChild(makeCard(view[i]));
 grid.insertBefore(frag,more);rendered=end;
}
function refresh(){
 compute();
 [...grid.querySelectorAll('.card')].forEach(c=>c.remove());
 rendered=0;renderMore();
 count.textContent=view.length+' shown';
 empty.style.display=view.length?'none':'';
}
new IntersectionObserver(es=>{if(es[0].isIntersecting&&rendered<view.length)renderMore();},
 {rootMargin:'1000px'}).observe(more);

[...document.querySelectorAll('#srcrow .tab')].forEach(b=>b.addEventListener('click',()=>{
 kind=b.dataset.k;genre=null;
 document.querySelectorAll('#srcrow .tab').forEach(x=>x.classList.toggle('active',x===b));
 renderGenres();refresh();window.scrollTo(0,0);}));
q.addEventListener('input',refresh);
[document.getElementById('sTitle'),document.getElementById('sFull')].forEach(b=>
 b.addEventListener('click',()=>{scope=b.dataset.s;
  document.getElementById('sTitle').classList.toggle('active',scope==='title');
  document.getElementById('sFull').classList.toggle('active',scope==='full');
  refresh();}));
// hide any image that fails to load, whatever the host
document.addEventListener('error',function(e){const t=e.target;
 if(t&&t.tagName==='IMG'&&t.closest&&t.closest('.card'))t.style.display='none';},true);

document.getElementById('favtab').addEventListener('click',function(){
 favOnly=!favOnly;this.classList.toggle('active',favOnly);refresh();});
[...document.querySelectorAll('.rbtn')].forEach(b=>b.addEventListener('click',()=>{
 rfilter=b.dataset.r===''?null:+b.dataset.r;
 document.querySelectorAll('.rbtn').forEach(x=>x.classList.toggle('active',x===b));
 refresh();}));

document.getElementById('favn').textContent=favCount();
renderGenres();refresh();

// pull anything favourited/rated on the other pages or another device
fetch(SYNC+'/state').then(r=>r.json()).then(srv=>{
 let changed=false;
 for(const [k,sk] of [['p','gp_favs'],['a','gpa_favs']])
  for(const id of (srv[sk]||[])) if(!FAVS[k].has(String(id))){FAVS[k].add(String(id));changed=true;}
 for(const [k,sk] of [['p','gp_ratings'],['a','gpa_ratings']])
  for(const id in (srv[sk]||{})) if(!(id in RATS[k])){RATS[k][id]=srv[sk][id];changed=true;}
 if(changed){saveFavs('p');saveFavs('a');saveRatings('p');saveRatings('a');
  document.getElementById('favn').textContent=favCount();refresh();}
}).catch(()=>{});
</script>
</body></html>`;

fs.writeFileSync(path.join(ROOT, 'all.html'), out);
console.log('wrote all.html', out.length, 'bytes');
