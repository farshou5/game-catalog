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
    note: 'The highest-leverage category in the whole list — everything here turns noisy MediaPipe landmarks into a body that moves believably, which is the actual product. And as of 2 Aug, ALL FIVE ARE ALREADY OWNED. Assets/Plugins/RootMotion in the shared project holds Final IK (32 MB) AND PuppetMaster (55 MB), and throws in Baker and RagdollManager on top. Nothing in this category needs buying — it needs using.',
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
    note: 'Rhythm is the one genre where a hands-free, 2m-away player is ideal rather than a compromise — it needs almost no precision from the tracker, only timing. But the two MOVE LIBRARIES below are the wrong way to get reference moves: record them through our own MediaPipe pipeline instead. We already have the machinery (the virtual-human replay harness records and replays landmark streams). Only the beat/timing tools are worth considering, and both reviewers flagged even those as risky against 50-150ms tracking latency.',
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
    note: 'Read this category narrowly. The player-driven avatar gets its motion from the PLAYER — Final IK retargets live landmarks onto the rig, so bought locomotion clips are not what animates it. Clips are only needed for characters we do not drive from pose (obstacles, NPCs) and for the moments tracking is not driving the avatar at all: menus, idle, celebrate, game over, and the fallback blend when tracking confidence drops. Cheap stylised RIGS still matter; large clip libraries mostly do not.',
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
  '1962': 'Idle/tycoon economies are tap-driven meta loops — the opposite of our hands-free constraint, and a parity tax across three platforms.',
  '2691': 'Redundant with the full Infinite Runner Engine above; buy one runner reference, not three.',
  '5629': 'Third runner reference. Redundant — pick one and read it properly.',
  '1361': 'A customisation meta-feature we would then have to rebuild in Kotlin and Flutter. Skip until v2.',
  '644': 'Thematically lovely for a win-screen dance, but Humanoid retargeting onto hypercasual rigs costs days. Later, not now.',
  '1319': 'Borderline: it is a preset pack we could replicate from the docs in an afternoon.',
  '4003': 'Contested: tracking latency is roughly 50-150ms, so tight rhythm windows may be unfair. Only viable with generous timing and a calibration step.',
  '4937': 'Same latency caveat as the rhythm framework.',
  '240': 'Same latency caveat; also the most expensive of the three rhythm options.',
};

// Second-opinion challenges from Codex (gpt-5.6-sol, xhigh). Keyed by pick id.
const CHALLENGE2 = {
  '5629': 'Effectively legacy — version 1.0 from 2021, authored for Unity 2018.4.',
  '3754': 'Redundant if we buy the Infinite Runner Engine, which already ships flight and tunnel examples. Only worth it for a dedicated free-flight flagship.',
  '2593': 'Disagrees with Kimi, which wanted this in the top three: active rigidbodies and joints are unjustified CPU cost unless ragdoll physics IS the core mechanic.',
  '2836': 'Unity-only architecture, therefore parity debt against Kotlin and Flutter. A small AudioMixer facade is enough.',
  '928': 'Built for elaborate spatial soundscapes — excessive for short arcade sessions, and another Unity-only system.',
  '1059': 'Overlaps 2000 Game Sound FX. Buy one of the two initially, not both.',
  '4710': 'Probably unnecessary — the POLYGON City and Town packs we already own contain character sets. Only needed if a flagship genuinely wants crowds.',
  '2561': 'Also flagged here: decorative masking plus extra UI shader overdraw, for almost no benefit at two metres.',
  '4303': 'Also flagged here: pointer decoration and overdraw, and Feel can already reproduce it.',
  '2483': 'Also flagged here: adds another render-to-texture path to solve inventory/portrait problems we do not have.',
};

// Already owned — verified on disk 2026-08-01, either in the Joystick project or
// in the shared AssetsToCheck evaluation project on the same PC.
const OWNED = {
  '74': 'Already owned and downloaded (48 MB in the Asset Store cache), and installed. This was the single highest pick on the page — nothing to buy.',
  '270': 'Already owned AND imported — Assets/Plugins/RootMotion/PuppetMaster (55 MB) in the shared AssetsToCheck project. Nothing to buy.',
  '4011': 'Already owned — sitting in the shared AssetsToCheck project (2.9 GB). Nothing to buy.',
  '1080': 'Already owned — in the shared AssetsToCheck project. Nothing to buy.',
  '1975': 'Redundant: PuppetMaster is already owned and imported, and the same RootMotion folder also ships RagdollManager. This was the "buy one of the two" alternative — both are already covered.',
  '3754': 'Already owned and imported into AssetsToCheck on 2 Aug (RageRun Games / Easy Flying System). Nothing to buy.',
  '170':  'Already owned and imported — Assets/Plugins/Demigiant/DOTweenPro. Nothing to buy.',
  '4003': 'Already owned and imported — Assets/Dypsloom/RhythmTimeline (49 MB). Nothing to buy.',
  '4937': 'Already owned and imported — Assets/Beat Detection. Its 4 demo scripts needed a GUIText fix to compile on Unity 6; done 2 Aug.',
  '2005': 'Already owned and imported — Assets/Animo/AA.Hip.Hop (37 MB).',
  '644':  'Already owned and imported — Assets/Dance_MoCap_Collection_Update (346 MB).',
  '1411': 'Superseded: Amplify Impostors is owned AND imported (203 MB, 2 Aug), and is the better tool here — it BAKES impostors in-editor (vendor wiki: "currently only provides the in-editor baked variant"), so there is zero runtime generation cost. A runtime impostor generator spends GPU at play time, which is exactly what MediaPipe has already taken. Use Amplify if impostors are ever needed at all — and for Joystick they are not.',
  // Audio: 29 GB / 41,466 files already on disk in the Music2 library.
  '3567': 'Covered by the Music2 library — 29 GB and 41,466 audio files already on disk. Nothing to buy.',
  '928':  'Covered by the Music2 library. Nothing to buy.',
  '2836': 'Covered by the Music2 library. Nothing to buy — and both reviewers called a Unity-only audio manager parity debt anyway.',
  '1059': 'Covered by the Music2 library, which already includes impact and whoosh packs. Nothing to buy.',
  '1070': 'Covered by the Music2 library, which already includes electronic and hybrid-action music packs. Nothing to buy.',
};

// Superseded by how this project actually works — not by a better purchase.
const SUPERSEDED = {
  '644':  'Our animation source is the PLAYER, live, through MediaPipe. A dance mode needs a reference to score against, and that reference is better recorded through our own tracking pipeline than bought as mocap: no Humanoid retargeting, the data is already in landmark form so scoring is a direct comparison, and the same recording replays in Kotlin and Flutter. A Unity .anim clip does none of that.',
  '2005': 'Same reason as the mocap collection: record the reference moves through our own pipeline instead. Free, no retargeting, and parity-portable across all three apps.',
  '2044': 'Only needed for characters we do NOT drive from pose — obstacles, NPCs, or the avatar during menus and game-over. The player-driven avatar gets its motion from the player.',
  '1049': 'Same caveat: useful for non-player craft, not for the avatar the player is animating with their own body.',
  '253':  'Keep only as the fallback blend for when tracking confidence drops. Not the primary animation source.',
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
    const ownState = OWNED[rawId] ? 'owned' : 'need';
    return `<article class="card" data-own="${ownState}">
  <span class="num">${ci * 5 + i + 1}</span>
  ${OWNED[rawId] ? '<span class="owned">OWNED</span>' : ''}
  ${img ? `<div class="thumb"><img loading="lazy" src="${esc(img)}" alt=""
    onerror="this.parentElement.style.display='none'"></div>` : ''}
  <h3>${esc(it.n)}</h3>
  <div class="meta">${esc(it.cn || it.c || '')}${isProj ? ' &middot; complete project' : ''}${it.p ? ' &middot; ' + esc(it.p) + ' pts' : ''}</div>
  <p class="why">${esc(why)}</p>
  ${it.m ? `<p class="map"><b>Control mapping:</b> ${esc(it.m)}</p>` : ''}
  ${OWNED[rawId] ? `<p class="chal own"><b>You already own this:</b> ${esc(OWNED[rawId])}</p>` : ''}
  ${SUPERSEDED[rawId] ? `<p class="chal sup"><b>Don't buy — record it instead:</b> ${esc(SUPERSEDED[rawId])}</p>` : ''}
  ${CHALLENGE[rawId] ? `<p class="chal"><b>Kimi disagrees:</b> ${esc(CHALLENGE[rawId])}</p>` : ''}
  ${CHALLENGE2[rawId] ? `<p class="chal c2"><b>Codex disagrees:</b> ${esc(CHALLENGE2[rawId])}</p>` : ''}
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
.ownfilter{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px}
.ownfilter .lbl{color:#8f909b;font-size:13px}
.ofb{padding:7px 15px;border-radius:17px;border:1.5px solid #33343d;
 background:#1c1d24;color:#c8c9d0;font-size:13.5px;font-weight:600;cursor:pointer}
.ofb span{opacity:.55;font-weight:400;margin-left:3px}
.ofb.active{border-color:#7fe07f;color:#7fe07f;
 background:color-mix(in srgb,#7fe07f 12%,#1c1d24)}
.cat.hidden{display:none}
.card.hidden{display:none}
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
.chal.c2{background:rgba(122,184,255,.09);border-color:rgba(122,184,255,.32);
 color:#a8c6e8}
.chal.c2 b{color:#7ab8ff}
.chal.own{background:rgba(127,224,127,.10);border-color:rgba(127,224,127,.38);
 color:#a9dfa9}
.chal.own b{color:#7fe07f}
.chal.sup{background:rgba(255,159,91,.10);border-color:rgba(255,159,91,.38);
 color:#e5c09a}
.chal.sup b{color:#ff9f5b}
.owned{position:absolute;top:8px;right:34px;background:#7fe07f;color:#0e0f13;
 font-size:10.5px;font-weight:800;letter-spacing:.06em;padding:2px 7px;
 border-radius:9px}
.card:has(.owned){border-left-color:#7fe07f}
.verdict{background:#15161c;border:1px solid #2a2b33;border-left:3px solid #ff5b6e;
 border-radius:11px;padding:0;margin:0 0 10px}
.verdict>summary{cursor:pointer;padding:12px 16px;font-size:15px;font-weight:700;
 color:#ff8b96;list-style:none;display:flex;align-items:center;gap:9px}
.verdict>summary::-webkit-details-marker{display:none}
.verdict>summary::before{content:'▸';font-size:13px;opacity:.75}
.verdict[open]>summary::before{content:'▾'}
.verdict[open]>summary{border-bottom:1px solid #2a2b33;margin-bottom:12px}
.verdict>*:not(summary){margin-left:16px;margin-right:16px}
.verdict>*:last-child{margin-bottom:14px}
.verdict.inv{border-left-color:#c58cff}
.verdict.inv>summary{color:#c58cff}
.verdict.inv h3{margin:14px 0 6px;font-size:14px;color:#e8e8ea;
 text-transform:uppercase;letter-spacing:.05em}
.verdict.inv b{color:#e8e8ea}
.verdict.inv code{background:#0e0f13;padding:1px 5px;border-radius:4px;
 font-size:12.5px;color:#9a9aa5}
ul.inv2{margin:0;padding-left:20px;font-size:14px;color:#c8c9d0}
ul.inv2 li{margin-bottom:4px}
.verdict.endless{border-left-color:#7ab8ff}
.verdict.endless>summary{color:#7ab8ff}
.verdict.endless b{color:#e8e8ea}
.verdict.final{border-left-color:#7fe07f}
.verdict.final>summary{color:#7fe07f}
.verdict.final b{color:#e8e8ea}
.verdict p{margin:0 0 9px;font-size:14px;color:#c8c9d0;max-width:85ch}
.verdict ol,.verdict ul{margin:0 0 9px;padding-left:20px;font-size:14px;
 color:#c8c9d0}
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
<div class="ownfilter">
  <span class="lbl">Show:</span>
  <button class="ofb active" data-own="all">All <span id="nAll"></span></button>
  <button class="ofb" data-own="owned">✓ Already owned <span id="nOwned"></span></button>
  <button class="ofb" data-own="need">Not owned yet <span id="nNeed"></span></button>
</div>
<div class="toc">${CATS.map((c, i) =>
  `<a href="#c${i}" style="border-color:${c.color};color:${c.color}">${esc(c.name)}</a>`).join('')}</div>
</header>
<main>
<details class="verdict inv">
<summary>What is actually installed — full scan, 2 Aug 2026</summary>
<p>Every folder and subfolder of both Unity projects, walked. Products often sit
one level down (four separate RootMotion products live inside
<code>Plugins/RootMotion</code>), so a top-level listing undercounts badly.</p>

<h3>Joystick project</h3>
<ul class="inv2">
<li><b>Feel</b> — MMFeedbacks + MMTools + NiceVibrations, 196 MB, demos excluded</li>
<li><b>Synty POLYGON</b> — City, Town, Nature, Generic (344 MB)</li>
<li><b>Ultimate Joystick</b> (Tank &amp; Healer Studio)</li>
<li><b>MediaPipe Unity plugin</b> (homuler) — the tracking anchor</li>
</ul>

<h3>AssetsToCheck — shared library, reusable by both projects</h3>
<ul class="inv2">
<li><b>RootMotion, 4 products</b> in <code>Plugins/RootMotion</code>: <b>Final IK</b> (32 MB),
    <b>PuppetMaster</b> (55 MB), <b>Baker</b>, <b>RagdollManager</b></li>
<li><b>DOTween PRO</b> — <code>Plugins/Demigiant</code> (not the free build)</li>
<li><b>Amplify Impostors</b> — 203 MB, added 2 Aug</li>
<li><b>OpenCV for Unity</b> — 2.9 GB &middot; <b>Character Controller Pro</b> — 26 MB</li>
<li><b>Beat Detection</b> &middot; <b>Rhythm Timeline</b> (Dypsloom, 49 MB) &middot;
    <b>AA Hip Hop</b> (Animo, 37 MB) &middot; <b>Dance MoCap Collection</b> (346 MB)</li>
<li><b>Easy Flying System</b> (RageRun Games)</li>
<li>Vehicles, four stacks: <b>Realistic Car Controller Pro</b> (644 MB),
    <b>NWH Vehicle Physics 2 + WheelController</b> (528 MB), <b>EVP5</b> (75 MB),
    <b>Ash Vehicle Physics</b></li>
<li>World-building: <b>CityGen3D</b> (1.9 GB), <b>EasyRoads3D Pro</b> (108 MB),
    <b>PampelGames Road Constructor</b> (150 MB), <b>Spline Architect</b> +
    ObjectCloning + TerrainTools (153 MB), <b>MicroVerse</b> + Roads</li>
<li><b>Player-X</b> character pack &middot; <b>Feel</b> (full, with demos) &middot; <b>TextMesh Pro</b></li>
</ul>

<h3>Elsewhere</h3>
<ul class="inv2">
<li><b>Music2 library</b> — 29 GB, 41,466 audio files. Closes the audio category outright.</li>
<li><b>Owned but not imported</b> (in the Asset Store download cache):
    <b>Dlib FaceLandmark Detector</b>, <b>Color Tracker</b></li>
<li><b>~818 further packages</b> owned on the Unity account but not downloaded —
    Package Manager fetches that list live, so it cannot be audited from here.</li>
</ul>
<p class="src">Consequence: of the 55 cards below, 17 are already owned, and the
purchase list is empty. The remaining value on this page is the reasoning about
what to USE, not what to buy.</p>
</details>

<details class="verdict endless">
<summary>Endless: the right call, but not the way endless games normally work</summary>
<p>Both reviewers were asked whether endless is even correct for a hands-free,
two-metre, pose-controlled game. Both said yes — and both immediately named the
same failure mode, in near-identical terms. Codex called it
<b>"fatigue-contaminated failure"</b>: as the player tires, their pose quality and
the tracker's confidence decline <i>together</i>, so a long run eventually ends
because their body or the camera failed, not because their decisions did. Kimi
put the same point as "scores become a stamina contest instead of a skill
contest."</p>
<p><b>So: endless content, short runs.</b> What we want is an auto-restarting
score-attack arcade, not Temple Run. Non-negotiables both agreed on:</p>
<ul>
<li><b>Tracking dropout must never kill a run.</b> Dropout is a system fault:
freeze danger, forgive, resume on a neutral pose plus a visible countdown. An
endless game that kills you on dropout is an unfairness machine.</li>
<li><b>No one-touch death.</b> Always a shield or health reserve, so a single
tracking glitch can't end a run.</li>
<li><b>Death must be legible at two metres</b> and obviously the player's fault,
or the auto-restart feels like the game discarding their run.</li>
<li><b>Cap physical demand early; ramp complexity instead.</b> Plateau the speed
(Kimi suggests ~60% of what a touch runner would reach), then add difficulty
through patterns, simultaneity and feints — thinking harder, not moving faster.</li>
<li><b>Mandatory rest beats</b> — a 2–4s low-demand valley every 20–30s, with
score rewards placed <i>in</i> the valleys so resting doesn't feel like losing.</li>
<li><b>Design a climax.</b> Around the 2.5–3 minute mark, a telegraphed intensity
spike that ends most runs by the game's hand at a legible peak — far better than
runs ending because the player wandered off.</li>
<li><b>Use tracking confidence as a difficulty signal</b>: when it drops, freeze
the ramp and spawn forgiving patterns. That is the concrete implementation of
"dropout never kills".</li>
</ul>
<p><b>The four formats, where they agreed:</b> (1) <b>lane/dodge auto-runner</b> —
StickX for lanes, A jump, B slide; the lowest jitter sensitivity and lowest
physical demand of any format, and both ranked it first. (2) <b>endless driver</b>
— steering is the most forgiving input there is, and we already own four vehicle
stacks plus the road tools. (3) <b>wide-gate flyer</b> — forgiving because a gate
is huge relative to input noise. (4) <b>arena survivor with auto-aim</b> — strong
score-chase but the fatigue ceiling; ship it last.</p>
<p><b>The traps — and one of them is uncomfortably close to home.</b> Both flagged
<b>flappy-style one-tap timing games</b>: the whole game is a tight timing window,
so every gesture false positive or negative becomes an unfair death. Both also
flagged <b>rhythm and dance</b> (50–150ms variable pose latency means grading
timing we cannot fairly measure — Kimi's note on Beat Detection was literally
"resist"), <b>twin-stick and precision aiming</b> (one stick cannot move and aim,
and a raised aiming arm is textbook gorilla-arm), <b>precision platformers</b>,
and <b>anything with meta-progression menus</b>, which need selection UI we cannot
offer without tripling gesture-menu work across three platforms.</p>
<p><b>Where they split:</b> the retry seam. Kimi wants a fully automatic restart —
score card, countdown, next run — on the grounds that a "RETRY?" prompt waits for
input the player physically cannot give. Codex wants A = retry / B = menu with an
idle timeout to game-select, warning that auto-restart traps the player in a loop.
The synthesis is to auto-restart on a visible countdown, while showing a
persistent exit gesture and falling back to the catalog on idle. They also split
on run length: Kimi says 90–150s median, Codex 3–5 minutes; Kimi's is the safer
figure for a standing player.</p>
</details>

<details class="verdict final">
<summary>Final verdict, after a full inventory: buy almost nothing</summary>
<p>On 1 Aug I inventoried what is actually installed on this PC — the Joystick
project plus the shared AssetsToCheck library — and put that list to both
reviewers. They converged, independently, on the same uncomfortable answer:
<b>this project's asset needs are already met.</b> Codex put it plainly —
"input, feedback, UI, environments, roads, characters, vehicles, tracking and
profiling are already sufficiently covered."</p>
<p><b>The single gap they named was audio — and that turned out to be already
owned too.</b> The Music2 library holds <b>29 GB across 41,466 audio files</b>
(SFX packs, engine sounds, combat magic, card-game UI, hybrid-action and
classical music). Audio was the last thing on the buy list, and it was never
needed. <b>The shopping list is now zero.</b></p>
<p><b>The entire top category is owned outright.</b>
<code>Assets/Plugins/RootMotion</code> in the shared project already contains
<b>Final IK</b> (32 MB) and <b>PuppetMaster</b> (55 MB) — the two picks I called
the highest-leverage on this whole page — plus <b>Baker</b> and
<b>RagdollManager</b> as bonuses. Between those, OpenCV for Unity and Character
Controller Pro, all five cards in "Pose → avatar core" are already on disk. That
category doesn't need buying; it needs using.</p>
<p>The one purchase neither of them could cross off is not an asset at all:
<b>representative low/mid-tier arm64 test phones</b>, because GPU contention and
thermal throttling under MediaPipe cannot be reproduced in the editor.</p>
<p><b>Owned but under-used, per both reviewers</b> — this is where the value
actually is: <b>Feel/MMFeedbacks</b> for dwell progress, tracking-lost warnings,
countdowns and game-over transitions (plus MMTools object pooling, which
directly fights the GC spikes that stutter tracking); <b>Spline Architect</b>
for runner paths, camera rails and reusable endless segments; <b>Ultimate
Joystick</b> as a StickX/StickY debug visualiser rather than a touch control;
<b>TextMesh Pro</b> for distance-readable prompts; <b>Synty</b> as one shared
visual language across the flagships. The road/terrain/city tools are usable
strictly as editor-time bake tools — never at runtime on arm64. And of the four
vehicle physics packages owned, pick <i>one</i> if a driving flagship happens.</p>
<p><b>They split three ways, and the splits are informative.</b></p>
<ul>
<li><b>OpenCV for Unity.</b> Codex would use it offline to analyse recorded
sessions for latency, jitter and dropout; Kimi would keep it out of Joystick
entirely as a Unity-only duplicate of MediaPipe. They agree on what matters:
<b>never a runtime dependency.</b></li>
<li><b>Haptics.</b> Kimi wanted NiceVibrations to be the primary selection
"click" on every hover and commit. That is wrong here, and Codex caught why: the
phone is propped up two metres away, so the player cannot feel it. Audio is the
confirm channel; haptics are dead weight for this product.</li>
<li><b>Hyper-casual template bundles.</b> Kimi would buy them to fill out the
long tail of the catalog; Codex refuses them outright — inconsistent input
assumptions and performance profiles cost more integration work than they save.
Given that every game must be re-pointed at four targets anyway, Codex has the
better of this one.</li>
</ul>
<p><b>The three highest-leverage moves cost nothing</b>, and both reviewers rank
them above every purchase on this page:</p>
<ol>
<li><b>The hands-free shell.</b> One state machine for dwell selection, confirm
and cancel gestures, inactivity timeouts, tracking-loss recovery, game-over and
auto-retry. No purchased touch UI can satisfy the two-metre law.</li>
<li><b>The virtual-pad adapter + replay harness.</b> Calibration, body-relative
normalisation, One Euro smoothing, dead zones, hysteresis, confidence loss, and
recorded-input playback as golden tests. Every game and all three platforms
benefit from it once.</li>
<li><b>A per-game certification gate.</b> Enforce four-target-only input, zero
touch dependency, allocation limits and pooling, with replay-driven smoke tests
on real phones — so 115 games don't become 115 separate performance problems.</li>
</ol>
<p class="src">Everything below this box was written before that inventory. It is
kept because the reasoning per card is still sound, but read it as "what we would
have bought", not a shopping list. Cards marked OWNED are already on this PC.</p>
</details>

<details class="verdict">
<summary>Earlier round — where the reviewers disagreed with me</summary>
<p>Two independent reviewers were given this list and the same constraints:
Kimi K3 at max effort (red notes on the cards) and Codex gpt-5.6-sol at xhigh
(blue notes). They agree far more than they disagree. The three most useful
objections, which both of them raised in some form:</p>
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
<p>It also named the category neither of us can buy, and rated it above everything
on this page: <b>the hands-free interaction layer itself</b>, in two parts.</p>
<ol>
<li><b>Dwell-confirm UI.</b> One focus manager, oversized targets, radial-fill
dwell buttons at roughly 600–900ms, audio ticks on hover / dwell / confirm, a
visible countdown that auto-advances game-over into retry, and one universal
"hand raise = back" escape gesture. Small to build, but it <i>is</i> the app —
every menu and retry flow lives or dies here.</li>
<li><b>Signal conditioning + a written gesture spec.</b> Body-relative
normalisation, adaptive calibration, confidence gating, a One Euro (speed-
sensitive) filter on StickX/StickY, dead zones, button hysteresis (press at 0.7,
release at 0.4), debounce and cooldowns. Never derive ButtonA/ButtonB from a
single noisy threshold. Write it once as a platform-neutral spec with golden
regression clips — recorded landmark streams mapped to expected pad output,
replayed on all three platforms. That is where Kotlin/Flutter/Unity parity
actually lives, and no asset provides it.</li>
</ol>
<p>Runner-up missed category: crash / FPS / tracking-loss telemetry. IL2CPP arm64
plus MediaPipe will fail in the wild in ways desk testing never reproduces.</p>
<p>Its three-purchase budget answer: <b>Infinite Runner Engine</b>, <b>one large SFX
library</b> (at two metres, with no haptics and no touch, audio IS the tactile
feedback — every dwell tick, confirm, crash and countdown needs a sound), and
<b>Ragdoll Animator 2</b> for fail-state juice. Its swap rule: if one of the four
flagships is a flying game, trade the third for the flight system. And spend
nothing on the performance category until a profiler — not a hunch — says so.</p>
<p>Codex picks the same first two — <b>Infinite Runner Engine</b> and <b>2000 Game
Sound FX</b> — but takes <b>3D Hypercasual Meters</b> as its third, on the grounds
that big readable shapes become dwell timers, calibration gauges and retry
countdowns, which is the shell we still have to build. It explicitly rejects
Ragdoll Animator 2 for that slot. Where two reviewers converge on the same two
purchases from different reasoning, that is about as strong a signal as this
exercise can produce.</p>
<p>Codex added two things Kimi did not. First, a <b>tracking-loss protocol</b>:
when the player leaves frame, decay the axes to neutral, release both buttons,
pause, show reacquisition guidance, then resume through a countdown — never just
freeze. Second, a <b>vetting rule for any template purchase</b>: require full
source, no native plugins or closed DLLs, no mandatory URP/HDRP, and input that
can be cleanly replaced. Harvest subsystems into our architecture; never inherit
a template's touch UI or application shell.</p>
<p>It also flags a parity angle worth keeping in mind: Unity-only architectural
assets (audio managers, UI frameworks) are parity debt, because whatever they do
has to be rebuilt by hand in Kotlin and Flutter.</p>
</details>
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
<script>
(function () {
  var cards = [].slice.call(document.querySelectorAll('.card'));
  var cats = [].slice.call(document.querySelectorAll('.cat'));
  var btns = [].slice.call(document.querySelectorAll('.ofb'));
  var owned = cards.filter(function (c) { return c.dataset.own === 'owned'; }).length;

  document.getElementById('nAll').textContent = cards.length;
  document.getElementById('nOwned').textContent = owned;
  document.getElementById('nNeed').textContent = cards.length - owned;

  function apply(mode) {
    cards.forEach(function (c) {
      c.classList.toggle('hidden', mode !== 'all' && c.dataset.own !== mode);
    });
    // hide a category heading entirely when nothing in it survives the filter
    cats.forEach(function (s) {
      var visible = s.querySelectorAll('.card:not(.hidden)').length;
      s.classList.toggle('hidden', visible === 0);
    });
  }

  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      btns.forEach(function (x) { x.classList.toggle('active', x === b); });
      apply(b.dataset.own);
    });
  });
})();
</script>
</body></html>`;

fs.writeFileSync(path.join(ROOT, 'picks.html'), out);
console.log('wrote picks.html', out.length, 'bytes; missing ids:', missing);
