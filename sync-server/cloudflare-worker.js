// Sync server for the Rolling Upper/Lower workout app (Cloudflare Workers, free plan).
// Needs one KV binding named DATA. The first device that syncs becomes the owner:
// after that, only devices with the same sync code can read or save.
// (Optional: set a SYNC_TOKEN secret to fix the code yourself. To reset the owner, delete the "owner" key in KV.)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400'
};

const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status,
  headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function same(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);

    if (url.pathname === '/' || url.pathname === '/v1/ping') {
      const owner = env.DATA ? await env.DATA.get('owner') : null;
      return json({ ok: true, app: 'workout-sync', storage: !!env.DATA, claimed: !!(owner || env.SYNC_TOKEN) });
    }
    if (url.pathname !== '/v1/data') return json({ error: 'not found' }, 404);
    if (!env.DATA) return json({ error: 'Add a KV binding named DATA to this Worker.' }, 500);

    const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '').trim();
    if (token.length < 16) return json({ error: 'wrong sync code' }, 401);
    const hash = await sha256(token);

    if (env.SYNC_TOKEN) {
      const ok = String(env.SYNC_TOKEN).split(',').map((s) => s.trim()).some((c) => same(c, token));
      if (!ok) return json({ error: 'wrong sync code' }, 401);
    } else {
      const owner = await env.DATA.get('owner');
      if (!owner) await env.DATA.put('owner', hash); // first device to sync claims this server
      else if (!same(owner, hash)) return json({ error: 'wrong sync code' }, 401);
    }

    const key = `data:${hash}`;
    if (request.method === 'GET') {
      return json((await env.DATA.get(key, 'json')) || { rev: 0, data: null });
    }
    if (request.method === 'PUT') {
      const text = await request.text();
      if (text.length > 20 * 1024 * 1024) return json({ error: 'too big' }, 413);
      let body;
      try { body = JSON.parse(text); } catch (e) { return json({ error: 'bad json' }, 400); }
      if (!body || typeof body.data !== 'object' || body.data === null) return json({ error: 'missing data' }, 400);
      const stored = (await env.DATA.get(key, 'json')) || { rev: 0, data: null };
      // Another device saved first: send back its version so the app can merge and try again.
      if ((body.baseRev || 0) !== stored.rev) return json(stored, 409);
      const next = { rev: stored.rev + 1, updatedAt: Date.now(), data: body.data };
      if (stored.data) await env.DATA.put(`${key}:previous`, JSON.stringify(stored)); // one step of undo
      await env.DATA.put(key, JSON.stringify(next));
      return json({ rev: next.rev, updatedAt: next.updatedAt });
    }
    return json({ error: 'method not allowed' }, 405);
  }
};
