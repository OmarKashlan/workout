// Sync server for the Rolling Upper/Lower workout app, for any Node.js host (Node 18+, no packages needed).
//
// Run:   node server.js
//   - The port comes from SERVER_PORT or PORT (panels like Botkeep set one), otherwise 8080.
//   - The first device that syncs becomes the owner; after that only the same sync code works.
//     (Optional: set SYNC_TOKEN or a sync-token.txt file to fix the code yourself. Delete data/owner.txt to reset.)
//   - Data is saved in ./data. Back that folder up if you can.
//   - If a folder named ./public exists (the contents of gym-app), it is served too, so app and sync share one address.
//
// The app only talks to servers on https:// addresses, so this server must be reachable over HTTPS
// (a host that gives you an https:// link, or a proxy such as Cloudflare in front of it).
//
// API (same as cloudflare-worker.js):
//   GET  /v1/data   -> { rev, data }            (Authorization: Bearer <sync code>)
//   PUT  /v1/data   <- { baseRev, data }        -> { rev } or 409 with the newer { rev, data }

'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = +(process.env.SERVER_PORT || process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const MAX_BYTES = 20 * 1024 * 1024;

function configuredTokens() {
  let raw = process.env.SYNC_TOKEN || '';
  const file = path.join(__dirname, 'sync-token.txt');
  if (!raw && fs.existsSync(file)) raw = fs.readFileSync(file, 'utf8');
  return raw.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
}
const TOKENS = configuredTokens();
fs.mkdirSync(DATA_DIR, { recursive: true });
const OWNER_FILE = path.join(DATA_DIR, 'owner.txt');

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400'
};
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon'
};

function send(res, status, obj) {
  res.writeHead(status, { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}
const hashOf = (token) => crypto.createHash('sha256').update(token).digest('hex');
const sameText = (a, b) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && crypto.timingSafeEqual(x, y); };
function tokenOk(token) {
  if (!token || token.length < 16) return false;
  if (TOKENS.length) return TOKENS.some((c) => sameText(c, token));
  // No code configured: the first device that syncs claims this server.
  const owner = fs.existsSync(OWNER_FILE) ? fs.readFileSync(OWNER_FILE, 'utf8').trim() : '';
  if (!owner) { fs.writeFileSync(OWNER_FILE, hashOf(token)); return true; }
  return sameText(owner, hashOf(token));
}
const fileFor = (token) => path.join(DATA_DIR, `${hashOf(token)}.json`);
function readStored(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return { rev: 0, data: null }; }
}
function writeAtomic(file, text) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, text);
  fs.renameSync(tmp, file);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BYTES) { reject(Object.assign(new Error('too big'), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
function serveStatic(req, res, pathname) {
  if (!fs.existsSync(PUBLIC_DIR)) return send(res, 404, { error: 'not found' });
  let rel = decodeURIComponent(pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, { error: 'forbidden' });
  fs.readFile(file, (err, buf) => {
    if (err) return send(res, 404, { error: 'not found' });
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' || file.endsWith('sw.js') ? 'no-cache' : 'public, max-age=3600' });
    res.end(buf);
  });
}

// One request at a time per data file, so two quick saves can't overwrite each other.
const locks = new Map();
function withLock(key, fn) {
  const prev = locks.get(key) || Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(key, next.catch(() => {}));
  return next;
}

const server = http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
    if (pathname === '/v1/ping') return send(res, 200, { ok: true, app: 'workout-sync', claimed: TOKENS.length > 0 || fs.existsSync(OWNER_FILE) });
    if (pathname !== '/v1/data') {
      if (req.method === 'GET') return serveStatic(req, res, pathname);
      return send(res, 404, { error: 'not found' });
    }

    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    if (!tokenOk(token)) return send(res, 401, { error: 'wrong sync code' });
    const file = fileFor(token);

    if (req.method === 'GET') return send(res, 200, readStored(file));

    if (req.method === 'PUT') {
      const text = await readBody(req);
      let body;
      try { body = JSON.parse(text); } catch (e) { return send(res, 400, { error: 'bad json' }); }
      if (!body || typeof body.data !== 'object' || body.data === null) return send(res, 400, { error: 'missing data' });
      return withLock(file, () => {
        const stored = readStored(file);
        // Someone else saved first: send back their version so the app can merge and try again.
        if ((body.baseRev || 0) !== stored.rev) return send(res, 409, stored);
        const next = { rev: stored.rev + 1, updatedAt: Date.now(), data: body.data };
        if (stored.data) writeAtomic(file.replace(/\.json$/, '.previous.json'), JSON.stringify(stored));
        writeAtomic(file, JSON.stringify(next));
        return send(res, 200, { rev: next.rev, updatedAt: next.updatedAt });
      });
    }
    return send(res, 405, { error: 'method not allowed' });
  } catch (e) {
    return send(res, e.status || 500, { error: e.status ? e.message : 'server error' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Workout sync server running on port ${PORT}${fs.existsSync(PUBLIC_DIR) ? ', also serving the app from ./public' : ''}.`);
});
