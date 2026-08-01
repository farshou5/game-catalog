// Builds picks.html — curated Joystick shortlist (11 categories x 5).
// Sources: assets.html #d0 (full catalog) + tools/joystick_data.json (curated).
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

// Two sources: the full 5.6k asset catalog embedded in assets.html, and the
// hand-curated 750-item joystick_data.json (assets + ready-made projects).
const html = fs.readFileSync(path.join(ROOT, 'assets.html'), 'utf8');
const DATA = JSON.parse(html.match(/id=["']d0["'][^>]*>([\s\S]*?)<\/script>/)[1]);
const CURATED = require('./joystick_data.json');

const byId = new Map(DATA.map(x => [String(x.id), x]));            // A<id>
const projById = new Map(CURATED.filter(x => x.k === 'proj')
  .map(x => [String(x.id), x]));                                   // P<id>
// Curated assets carry richer fields (w/m); prefer them when present.
for (const x of CURATED) {
  if (x.k !== 'asset') continue;
  const prev = byId.get(String(x.id));
  byId.set(String(x.id), prev ? { ...prev, ...x } : x);
}

const CATS = [
  {
    name: 'Pose → avatar core',
    color: '#ff3d7f',
    note: 'The highest-leverage category in the whole list, and the one I originally missed. Everything here turns noisy MediaPipe landmarks into a body that moves believably — which is the actual product, not a nice-to-have. Buy from here first.',
    picks: [
      ['74', 'Final IK — the industry standard for retargeting. This is how you drive a rigged avatar from 33 pose landmarks without the limbs tearing apart. Nothing else on this list changes the feel of the app more.'],
      ['270', 'PuppetMaster — active ragdoll. Landmark jitter looks like a glitch on a kinematic rig, but reads as natural wobble on a physical puppet. It converts our worst technical weakness into a stylistic strength.'],
      ['4011', 'OpenCV for Unity. Not to replace MediaPipe, but for the pre/post-processing around it: smoothing filters, ROI cropping, frame conversion. Also our fallback if a device chokes on the GPU delegate.'],
      ['1080', 'Character Controller Pro — a controller robust enough to be fed noisy, occasionally-absent input without exploding. Standard controllers assume clean input; ours is never clean.'],
      ['1975', 'Active Ragdoll character controller — the cheaper alternative to PuppetMaster. Buy one of the two, not both.'],
    ],
  },
  {
    name: 'Rhythm & beat (Daily Moves)',
    color: '#00c8c8',
    note: 'A whole category I had missed. Rhythm is the one genre where a hands-free, 2m-away player is not a compromise but the ideal setup — and it needs almost no precision from the tracker, only timing.',
    picks: [
      ['4003', 'Rhythm Timeline 2 — a rhythm framework WITH an editor. This is the fastest credible route to the Daily Moves feature across all three apps.'],
      ['4937', 'Beat Detection — real-time beat extraction, so moves can sync to any track the player has rather than only pre-authored charts.'],
      ['240', 'Koreographer Pro — beat-synced event system. More mature than the above; use it if we want music-driven gameplay events everywhere, not just in one mode.'],
      ['2005', 'Hip-hop animation set — the reference moves the player copies.'],
      ['644', 'Dance MoCap Collection — a larger move library to score the player against.'],
    ],
  },
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
      ['2044', 'Parkour animation set — run, jump and vault cycles, the core vocabulary of every endless-runner flagship.'],
      ['1049', 'Flying animation clips for the glider/bird flagships.'],
      ['253', 'MOBILITY PRO mocap locomotion — clean run/walk/turn cycles to blend against when tracking confidence drops and we have to fall back to canned animation.'],
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
  {
    name: 'Complete projects — pose-native genres',
    color: '#ffd23d',
    note: 'Ready-made projects whose ORIGINAL design already assumes a whole moving body. These are not re-skins, they are the genres our control scheme was born for — the closest thing to a shortcut this project has.',
    picks: [
      ['P15', 'Yoga Fever — the player holds a pose and the game scores it. That is literally pose tracking as a game loop, with zero taps. If one complete project justifies its price here, it is this one.'],
      ['P1039', 'Red-light-green-light. A hands-free masterpiece by accident: move when told, freeze when told. Needs only "is the player moving", the single most reliable signal a pose tracker produces.'],
      ['P607', 'Body-race / dance-race. Whole-body input by design, and the scoring model is directly reusable for Daily Moves.'],
      ['P615', 'Timberman — two-sided chop. Maps perfectly onto lean-left / lean-right, and proves how far a two-state input can carry a game.'],
      ['P160', 'One-button flappy template. This is Poopy Bird\'s genre; worth buying purely to compare their difficulty curve and spawn pacing against ours.'],
    ],
  },
  {
    name: 'Complete projects — runner architecture',
    color: '#a0e060',
    note: 'Buy these for their spawn/difficulty/scoring code, not their content. Endless runners are the flagship shape for lean-to-steer, and their input layer is the only part we throw away.',
    picks: [
      ['P314', 'Lane runner built around lean steering — the closest existing match to our control model.'],
      ['P385', 'Parkour race runner. Good reference for a race framing, which gives a hands-free player a natural end condition without a menu.'],
      ['P419', 'Endless racer with tilt steering already built in. Tilt and lean are the same one-axis problem, so its steering feel transfers directly.'],
      ['P411', 'Ski/skate slide game — leaning IS the control in the original design.'],
      ['P1029', 'Stumble/fall-guys style physical runner. Its ragdoll failure states are exactly the visually-obvious game-over a 2m player needs.'],
    ],
  },
];

// Second-opinion challenges from Kimi K3 (max effort). Keyed by pick id.
const CHALLENGE = {
  '170': 'Feel already ships DOTween-based feedbacks, and plain DOTween is free — Pro only adds visual editors we would not use.',
  '968': 'Feel already has MMCameraShake. Straight redundancy.',
  '3745': 'Pipeline risk: most modern VFX packs are URP/Shader-Graph and render pink on the built-in pipeline we use. Verify before buying.',
  '2116': 'Same built-in-pipeline shader risk as above. Verify it is legacy-particle based, not Shader Graph.',
  '1993': 'Our bottleneck is MediaPipe GPU inference, not draw calls — and Synty content is already cheap. Pooling is trivial to hand-roll. Profile before buying.',
  '2455': 'Occlusion culling does not pay for small arcade scenes; frustum culling is already built in.',
  '2488': 'We have very few animated characters on screen. Little to reclaim.',
  '1411': 'Impostors are for big scenes with distant crowds. Our scenes are vignettes — wrong problem, and often URP-only.',
  '2483': 'A RenderTexture per 3D object in UI is genuinely expensive on mobile GPUs. Use sparingly or not at all.',
  '2561': 'Probably unnecessary: a dwell/hold-to-confirm ring is just uGUI Image with fillMethod = Radial360, which is built in and free.',
  '4303': 'Low value, and UI trails add overdraw.',
  '1962': 'Idle/tycoon economies are tap-driven meta loops — the opposite of our hands-free constraint.',
  '2691': 'Redundant with the full Infinite Runner Engine above; buy one runner reference, not two.',
  '4003': 'Contested: tracking latency is roughly 50-150ms, so tight rhythm windows may be unfair. Only viable with generous timing and a calibration step.',
  '4937': 'Same latency caveat as the rhythm framework.',
  '240': 'Same latency caveat; also the most expensive of the three rhythm options.',
};

const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let missing = [];
const sections = CATS.map((cat, ci) => {
  const cards = cat.picks.map(([rawId, why], i) => {
    const isProj = /^P/.test(rawId);
    const id = rawId.replace(/^P/, '');
    const it = isProj ? projById.get(id) : byId.get(id);
    if (!it) { missing.push(rawId); return ''; }
    const img = (it.img && it.img[0]) || '';
    const store = it.src && /assetstore\.unity/.test(it.src) ? it.src : '';
    const cat_url = isProj
      ? 'https://gamepackage.net/ready-made-solutions/' + id
      : 'https://gamepackage.net/assets/' + id;
    const yt = it.yt || ('https://www.youtube.com/results?search_query=' +
      encodeURIComponent(it.n + (isProj ? ' unity game' : ' unity asset')));
    return `<article class="card">
  <span class="num">${ci * 5 + i + 1}</span>
  ${img ? `<div class="thumb"><img loading="lazy" src="${esc(img)}" alt=""
    onerror="this.parentElement.style.display='none'"></div>` : ''}
  <h3>${esc(it.n)}</h3>
  <div class="meta">${esc(it.cn || it.c || '')}${isProj ? ' &middot; complete project' : ''}${it.p ? ' &middot; ' + esc(it.p) + ' pts' : ''}</div>
  <p class="why">${esc(why)}</p>
  ${it.m ? `<p class="map"><b>Control mapping:</b> ${esc(it.m)}</p>` : ''}
  ${CHALLENGE[rawId] ? `<p class="chal"><b>Kimi disagrees:</b> ${esc(CHALLENGE[rawId])}</p>` : ''}
  <div class="links">
    ${store ? `<a class="buy" href="${esc(store)}" target="_blank" rel="noopener">Unity Asset Store &#8599;</a>` : ''}
    <a class="alt" href="${esc(cat_url)}" target="_blank" rel="noopener">Catalog entry &#8599;</a>
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
<title>Joystick — top asset &amp; project picks</title>
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
.why{margin:0 0 10px;font-size:14px;color:#c8c9d0;flex:1}
.map{margin:0 0 10px;font-size:13px;color:#9a9aa5}
.map b{color:#c8c9d0}
.chal{margin:0 0 10px;padding:8px 10px;border-radius:8px;font-size:13px;
 background:rgba(255,91,110,.09);border:1px solid rgba(255,91,110,.32);
 color:#e0aab0}
.chal b{color:#ff8b96}
.verdict{background:#15161c;border:1px solid #2a2b33;border-left:3px solid #ff5b6e;
 border-radius:11px;padding:15px 17px;margin:0 0 26px}
.verdict h2{margin:0 0 8px;font-size:17px;color:#ff8b96}
.verdict p{margin:0 0 9px;font-size:14px;color:#c8c9d0;max-width:85ch}
.verdict ol{margin:0;padding-left:20px;font-size:14px;color:#c8c9d0}
.verdict li{margin-bottom:5px}
.verdict .src{color:#8f909b;font-size:12.5px;margin:10px 0 0}
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
<h1>Top picks for Joystick</h1>
<p>Eleven categories, five each — assets and ready-made projects, chosen
against this project's real constraints:
Android arm64 with MediaPipe tracking already eating the frame budget, four
flagship games, and a player standing two metres from a propped phone who
cannot touch the screen. Every card links to the Unity Asset Store page so it
can be bought properly.</p>
<div class="toc">${CATS.map((c, i) =>
  `<a href="#c${i}" style="border-color:${c.color};color:${c.color}">${esc(c.name)}</a>`).join('')}</div>
</header>
<main>
<div class="verdict">
<h2>Second opinion — and where it disagrees with me</h2>
<p>Kimi K3 (max effort) reviewed this list against the same constraints. Cards it
challenged carry a red note. Its three most useful objections:</p>
<ol>
<li><b>The whole performance category may be answering the wrong problem.</b> Our
frame budget is eaten by MediaPipe GPU inference, not by draw calls — and Synty
content is already cheap in scenes that are small arcade vignettes. Profile on
device before buying culling or impostor tools.</li>
<li><b>Built-in render pipeline is a buying filter.</b> Most current VFX packs are
URP / Shader Graph and render pink on the built-in pipeline this project uses.
Check the pipeline badge on every VFX purchase.</li>
<li><b>Some of it is already free.</b> Feel covers camera shake and brings DOTween;
a dwell-to-confirm ring is just a uGUI Image with <code>fillMethod =
Radial360</code>. Do not pay for those.</li>
</ol>
<p>It also named a category neither of us can buy, which it rated above everything
on this page: <b>input signal conditioning</b> — One Euro / Kalman filtering,
hysteresis and cooldowns on gesture state changes. Jitter is what makes a
two-metre UI feel broken, the fix is open-source rather than a purchase, and the
same filter ports to the Kotlin and Flutter apps, so it is parity-positive.</p>
<p>Its three-purchase budget answer: <b>Infinite Runner Engine</b>, <b>one large SFX
library</b> (at two metres, audio is the only feedback channel that reaches the
player), and <b>Ragdoll Animator 2</b> for fail-state juice.</p>
<p class="src">Codex (gpt-5.6-sol, xhigh) was asked the same four questions and
produced no usable answer on two attempts — it spent the run on web searches and
returned nothing. Only the Kimi review is reflected here.</p>
</div>
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
