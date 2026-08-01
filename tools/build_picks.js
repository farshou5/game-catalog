// Builds picks.html — curated Joystick asset shortlist (7 categories x 5).
// Data source: the inline #d0 catalog already embedded in assets.html.
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const html = fs.readFileSync(path.join(ROOT, 'assets.html'), 'utf8');
const DATA = JSON.parse(html.match(/id=["']d0["'][^>]*>([\s\S]*?)<\/script>/)[1]);
const byId = new Map(DATA.map(x => [String(x.id), x]));

const CATS = [
  {
    name: 'Game feel & juice',
    color: '#f2c14e',
    note: 'Feel (More Mountains) is already in the Unity project — these are the layers Feel does not cover: tweened menus, shake presets, and cheap stylised burst VFX for hit/score moments.',
    picks: [
      ['170', 'The tween library everything else assumes. Our hands-free menus need dwell-to-select rings, scale pops and eased slide-ins driven from code — DOTween does all of it in one line and is mobile-cheap.'],
      ['968', 'Preset camera shake we can trigger from the 4 virtual-pad events. Cheaper to wire per-game than hand-rolling shake in every flagship.'],
      ['1013', 'Score/win celebration burst. At 2m the player needs a big unmistakable "you scored" signal — confetti reads from across the room where a number flash does not.'],
      ['3745', 'Stylised break/shatter VFX matching our POLYGON look. Gives obstacles in Poopy Bird / dodge games a satisfying death instead of just despawning.'],
      ['2116', 'General-purpose particle pack to pull one-off hits, pickups and trails from, rather than buying a pack per game.'],
    ],
  },
  {
    name: 'Mobile performance (arm64)',
    color: '#7fe07f',
    note: 'The single biggest risk in this project: MediaPipe tracking already eats a large slice of the frame budget, so game rendering has to be unusually cheap. These pay for themselves the first time a flagship drops below 60fps.',
    picks: [
      ['1993', 'Mesh combining + object pooling in one. Pooling matters most for endless games that spawn obstacles forever — GC spikes are what makes tracking stutter.'],
      ['2455', 'Occlusion/distance culling. Our Synty environments are draw-call heavy; culling is the cheapest way to buy frame time back for the tracking thread.'],
      ['2488', 'Animator LOD. Every animated character off-screen or far away is wasted CPU we need for pose inference.'],
      ['1411', 'Impostors for distant scenery — turns background Synty props into billboards. Big win for endless runners with long view distances.'],
      ['1319', 'Baked mobile lighting setup for the built-in pipeline (which this project uses). Avoids the realtime-light cost we currently pay for no visual gain.'],
    ],
  },
  {
    name: 'Endless / arcade templates (study, do not ship)',
    color: '#7ab8ff',
    note: 'Buy these to read, not to ship. Our games must only ever read StickX/StickY/ButtonA/ButtonB, so template input layers get thrown away — what we want is their spawn/difficulty/scoring architecture.',
    picks: [
      ['348', 'The reference implementation for infinite runners. Its level-segment spawner and speed-ramp curve are directly portable to our endless flagships in all three apps.'],
      ['2691', 'Smaller, cleaner runner starter — easier to read end-to-end than the full engine above.'],
      ['1962', 'Arcade-idle loop. Interesting for a hands-free mode where the player earns progress by holding poses rather than reacting fast.'],
      ['5629', 'Endless tunnel — the exact shape of a one-axis (StickX only) motion game. Good template for a lean-left/lean-right flagship.'],
      ['3754', 'Flying system. We already have a Hang Glider concept; this is the closest off-the-shelf reference for pitch/roll from a single stick.'],
    ],
  },
  {
    name: 'Characters & animation',
    color: '#c58cff',
    note: 'Our avatar/puppet is driven by MediaPipe landmarks, so we need cheap stylised rigs plus animation clips for the moments tracking is NOT driving the character (menus, idle, celebrate, game over).',
    picks: [
      ['5190', 'Low-cost stylised characters that match the hypercasual look and cost almost nothing to render — ideal as game avatars.'],
      ['1361', 'Stickman customisation. A stickman reads perfectly at 2m and is the cheapest possible rig to drive from pose landmarks.'],
      ['644', 'Dance mocap. Directly enables a Daily Moves / dance-match mode: compare the player pose against a reference clip.'],
      ['1049', 'Flying animation clips for the glider/bird flagships.'],
      ['2593', 'Ragdoll Animator — blends animation into ragdoll on failure. A hands-free "you died" needs to be visually obvious without any UI.'],
    ],
  },
  {
    name: 'HUD & UI for a 2m-away player',
    color: '#4ec9a8',
    note: 'Our hardest UX constraint: the player cannot touch the phone and is standing two metres away. Everything must be large, world-space where possible, and selectable by dwell/gesture.',
    picks: [
      ['1543', 'World-space hypercasual meters/gauges. This is the single most on-point asset in the list — big readable progress and charge meters are exactly what a dwell-to-select, no-touch UI needs.'],
      ['2483', 'Renders 3D objects into uGUI. Lets the game-select grid show live rotating 3D previews instead of flat emoji tiles.'],
      ['2561', 'Soft mask for uGUI — fixes the hard-edged clipping in our scrolling game list.'],
      ['4303', 'Icon trails: gives the moving cursor/hand indicator a visible tail, which makes an untouched, camera-driven pointer far easier to follow.'],
      ['3036', 'Large avatar icon set for the game grid and player slots.'],
    ],
  },
  {
    name: 'Environments (extends the Synty packs we own)',
    color: '#ff9f5b',
    note: 'We already own POLYGON City / Town / Nature. These extend that exact art style so re-skins stay consistent across all games and no new shader/material work is needed.',
    picks: [
      ['489', 'POLYGON Adventure — broad prop/environment coverage, same Synty pipeline we already have set up.'],
      ['2443', 'Alpine Mountain biome — snow/mountain endless-runner backdrop we currently lack.'],
      ['4710', 'POLYGON City Characters — matching character set for the city environment we already imported.'],
      ['51', 'AllSky, 220+ skyboxes. Cheapest possible way to make each of the 4 flagships feel like a different world.'],
      ['3677', 'Spawner for POLYGON Nature — procedural scatter, which is what an endless environment needs.'],
    ],
  },
  {
    name: 'Audio',
    color: '#ff5b6e',
    note: 'Audio is doing double duty for us: it is the only feedback channel that works when the player is looking away from a phone 2m away. Sound is arguably higher value than art here.',
    picks: [
      ['3567', '2000 general game SFX — one purchase covers pickups, fails, UI blips across all 115 catalog games.'],
      ['928', 'Interactive ambient soundscapes, Unity 6 ready. Gives each flagship a distinct bed cheaply.'],
      ['2836', 'Audio manager with pooling. We need one shared audio layer across games rather than per-game AudioSources.'],
      ['1059', 'Impacts/whooshes — the exact hit vocabulary for dodge-and-collide gameplay.'],
      ['1070', 'Electronic/dance music pack for the movement-driven modes.'],
    ],
  },
];

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let missing = [];
const sections = CATS.map((cat, ci) => {
  const cards = cat.picks.map(([id, why], i) => {
    const it = byId.get(id);
    if (!it) { missing.push(id); return ''; }
    const img = (it.img && it.img[0]) || '';
    const store = it.src && /assetstore\.unity/.test(it.src) ? it.src : '';
    const yt = 'https://www.youtube.com/results?search_query=' +
      encodeURIComponent(it.n + ' unity asset');
    return `<article class="card">
  <span class="num">${ci * 5 + i + 1}</span>
  ${img ? `<div class="thumb"><img loading="lazy" src="${esc(img)}" alt=""
    onerror="this.parentElement.style.display='none'"></div>` : ''}
  <h3>${esc(it.n)}</h3>
  <div class="meta">${esc(it.cn || '')}${it.p ? ' &middot; ' + esc(it.p) + ' pts' : ''}</div>
  <p class="why">${esc(why)}</p>
  <div class="links">
    ${store ? `<a class="buy" href="${esc(store)}" target="_blank" rel="noopener">Unity Asset Store &#8599;</a>` : ''}
    <a class="alt" href="https://gamepackage.net/assets/${esc(id)}" target="_blank" rel="noopener">Catalog entry &#8599;</a>
    <a class="yt" href="${esc(yt)}" target="_blank" rel="noopener">&#128269; YouTube</a>
  </div>
</article>`;
  }).join('\n');

  return `<section class="cat" style="--tc:${cat.color}">
  <h2>${esc(cat.name)}</h2>
  <p class="note">${esc(cat.note)}</p>
  <div class="grid">
${cards}
  </div>
</section>`;
}).join('\n');

const out = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Joystick — top 35 asset picks</title>
<style>
:root{color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:#0e0f13;color:#e8e8ea;
 font-family:system-ui,Segoe UI,Roboto,sans-serif;line-height:1.5}
header{background:#15161c;padding:16px 18px;border-bottom:1px solid #2a2b33}
.nav{font-size:14px;margin-bottom:10px}
.nav a{color:#7ab8ff;text-decoration:none;font-weight:600}
.nav .here{color:#e8e8ea;font-weight:600}
.nav span{color:#5a5b66;margin:0 8px}
h1{margin:0 0 6px;font-size:22px}
header p{margin:0;color:#9a9aa5;font-size:14px;max-width:70ch}
.toc{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.toc a{padding:6px 13px;border-radius:16px;border:1.5px solid #33343d;
 background:#1c1d24;color:#c8c9d0;font-size:13px;font-weight:600;
 text-decoration:none}
main{padding:18px;max-width:1400px;margin:0 auto}
.cat{margin-bottom:34px}
.cat h2{font-size:18px;margin:0 0 4px;color:var(--tc)}
.note{margin:0 0 14px;color:#9a9aa5;font-size:14px;max-width:80ch}
.grid{display:grid;gap:14px;
 grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
.card{position:relative;background:#15161c;border:1px solid #2a2b33;
 border-left:3px solid var(--tc);border-radius:11px;padding:13px;
 display:flex;flex-direction:column}
.num{position:absolute;top:10px;right:12px;color:#4a4b55;
 font-size:13px;font-weight:700}
.thumb{margin:-13px -13px 10px;border-radius:11px 11px 0 0;overflow:hidden;
 background:#0b0c10}
.thumb img{width:100%;display:block;aspect-ratio:16/9;object-fit:cover}
.card h3{margin:0 0 3px;font-size:15.5px;padding-right:26px}
.meta{color:#8f909b;font-size:12.5px;margin-bottom:8px;
 text-transform:uppercase;letter-spacing:.03em}
.why{margin:0 0 12px;font-size:14px;color:#c8c9d0;flex:1}
.links{display:flex;gap:7px;flex-wrap:wrap}
.links a{font-size:12.5px;font-weight:600;text-decoration:none;
 padding:5px 11px;border-radius:14px;border:1.5px solid #33343d;
 background:#1c1d24;color:#c8c9d0}
.links .buy{border-color:#7fe07f;color:#7fe07f}
footer{padding:22px 18px 40px;color:#6d6e78;font-size:13px;
 border-top:1px solid #2a2b33;max-width:80ch}
</style></head><body>
<header>
<div class="nav"><a href="index.html">Games</a><span>&middot;</span><a
 href="joystick.html">Joystick</a><span>&middot;</span><a
 href="assets.html">All assets</a><span>&middot;</span><span
 class="here">Top picks</span></div>
<h1>Top 35 asset picks for Joystick</h1>
<p>Seven categories, five each — chosen against this project's real constraints:
Android arm64 with MediaPipe tracking already eating the frame budget, four
flagship games, and a player standing two metres from a propped phone who
cannot touch the screen. Every card links to the Unity Asset Store page so it
can be bought properly.</p>
<div class="toc">${CATS.map((c, i) =>
  `<a href="#c${i}" style="border-color:${c.color};color:${c.color}">${esc(c.name)}</a>`).join('')}</div>
</header>
<main>
${sections.replace(/<section class="cat"/g, (m => {
  let n = -1; return () => { n++; return `<section id="c${n}" class="cat"`; };
})())}
</main>
<footer>
<p><b>Licensing note.</b> Buy links point at the Unity Asset Store. The
catalog links are for browsing/preview only — Asset Store licences are issued
per Unity account, so anything actually shipped in the app should be purchased
under the account that builds it.</p>
<p>Already in the project: More Mountains <b>Feel</b>, Synty
<b>POLYGON City / Town / Nature</b>. Those are deliberately excluded above.</p>
</footer>
</body></html>`;

fs.writeFileSync(path.join(ROOT, 'picks.html'), out);
console.log('wrote picks.html', out.length, 'bytes; missing ids:', missing);
