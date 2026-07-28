// joystick-favs — KV-backed favorites/ratings sync for farshou5.github.io/game-catalog
// POST /sync  {gp_favs:[], gpa_favs:[], gp_ratings:{}, gpa_ratings:{}} -> stored
// GET  /state -> stored JSON (empty defaults if none)

const ALLOWED_ORIGINS = [
  'https://farshou5.github.io',
  'http://localhost:8931',
];
const MAX_BODY = 64 * 1024;
const KEY = 'state';

function cors(origin) {
  const o = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

function isIdArray(v) {
  return Array.isArray(v) && v.length <= 2000 &&
    v.every(x => typeof x === 'string' && /^\d{1,8}$/.test(x));
}

function isRatingMap(v) {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  const ks = Object.keys(v);
  return ks.length <= 2000 && ks.every(k =>
    /^\d{1,8}$/.test(k) && Number.isInteger(v[k]) && v[k] >= 1 && v[k] <= 5);
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const h = cors(req.headers.get('Origin') || '');

    if (req.method === 'OPTIONS') return new Response(null, { headers: h });

    if (req.method === 'GET' && url.pathname === '/refresh') {
      const raw = await env.FAVS_KV.get('refresh');
      return new Response(raw || '{"status":"idle"}', { headers: h });
    }

    if (req.method === 'POST' && url.pathname === '/refresh/request') {
      const raw = await env.FAVS_KV.get('refresh');
      const cur = raw ? JSON.parse(raw) : {};
      if (cur.status === 'running') {
        return new Response(JSON.stringify({ ok: true, status: 'running' }), { headers: h });
      }
      const next = { status: 'requested', requestedAt: Date.now(),
                     lastDoneAt: cur.lastDoneAt || 0, note: cur.note || '' };
      await env.FAVS_KV.put('refresh', JSON.stringify(next));
      return new Response(JSON.stringify({ ok: true, status: 'requested' }), { headers: h });
    }

    if (req.method === 'POST' && url.pathname === '/refresh/status') {
      let b;
      try { b = await req.json(); }
      catch { return new Response('{"ok":false,"err":"bad json"}', { status: 400, headers: h }); }
      if (!['running', 'done', 'error', 'idle'].includes(b.status) ||
          (b.note && (typeof b.note !== 'string' || b.note.length > 300))) {
        return new Response('{"ok":false,"err":"bad shape"}', { status: 400, headers: h });
      }
      const raw = await env.FAVS_KV.get('refresh');
      const cur = raw ? JSON.parse(raw) : {};
      const next = { status: b.status, updatedAt: Date.now(),
                     requestedAt: cur.requestedAt || 0,
                     lastDoneAt: b.status === 'done' ? Date.now() : (cur.lastDoneAt || 0),
                     note: b.note || '' };
      await env.FAVS_KV.put('refresh', JSON.stringify(next));
      return new Response('{"ok":true}', { headers: h });
    }

    if (req.method === 'GET' && url.pathname === '/state') {
      const raw = await env.FAVS_KV.get(KEY);
      return new Response(raw ||
        '{"gp_favs":[],"gpa_favs":[],"gp_ratings":{},"gpa_ratings":{},"ts":0}',
        { headers: h });
    }

    if (req.method === 'POST' && url.pathname === '/sync') {
      const buf = await req.arrayBuffer();
      if (buf.byteLength > MAX_BODY) {
        return new Response('{"ok":false,"err":"too big"}', { status: 413, headers: h });
      }
      let b;
      try { b = JSON.parse(new TextDecoder().decode(buf)); }
      catch { return new Response('{"ok":false,"err":"bad json"}', { status: 400, headers: h }); }
      if (!isIdArray(b.gp_favs) || !isIdArray(b.gpa_favs) ||
          !isRatingMap(b.gp_ratings) || !isRatingMap(b.gpa_ratings)) {
        return new Response('{"ok":false,"err":"bad shape"}', { status: 400, headers: h });
      }
      const state = {
        gp_favs: b.gp_favs, gpa_favs: b.gpa_favs,
        gp_ratings: b.gp_ratings, gpa_ratings: b.gpa_ratings,
        ts: Date.now(),
      };
      await env.FAVS_KV.put(KEY, JSON.stringify(state));
      return new Response('{"ok":true}', { headers: h });
    }

    return new Response('{"ok":true,"service":"joystick-favs","use":"/state or /sync"}',
      { headers: h });
  },
};
