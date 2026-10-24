'use strict';
(() => {
  // ---------- Constants ----------
  const KEYS = { program: 'rul.program', log: 'rul.log', current: 'rul.current', settings: 'rul.settings' };
  const MUSCLES = [
    ['chest', 'Chest'], ['front-delts', 'Front delts'], ['side-delts', 'Side delts'], ['rear-delts', 'Rear delts'],
    ['traps', 'Traps'], ['upper-back', 'Upper back'], ['lats', 'Lats'], ['lower-back', 'Lower back'],
    ['biceps', 'Biceps'], ['triceps', 'Triceps'], ['forearms', 'Forearms'], ['abs', 'Abs'], ['obliques', 'Obliques'],
    ['glutes', 'Glutes'], ['quads', 'Quads'], ['hamstrings', 'Hamstrings'], ['adductors', 'Adductors'], ['calves', 'Calves']
  ];
  const MUSCLE_LABEL = Object.fromEntries(MUSCLES);
  const MUSCLE_ALIAS = {
    shoulders: ['front-delts', 'side-delts'], delts: ['front-delts', 'side-delts'], deltoids: ['front-delts', 'side-delts'],
    'front delts': ['front-delts'], 'anterior delts': ['front-delts'], 'side delts': ['side-delts'], 'lateral delts': ['side-delts'],
    'rear delts': ['rear-delts'], 'posterior delts': ['rear-delts'], trapezius: ['traps'], neck: ['traps'],
    'middle back': ['upper-back'], 'mid back': ['upper-back'], rhomboids: ['upper-back'], 'upper back': ['upper-back'],
    'lower back': ['lower-back'], 'erector spinae': ['lower-back'], latissimus: ['lats'], 'latissimus dorsi': ['lats'],
    abdominals: ['abs'], core: ['abs'], 'rectus abdominis': ['abs'], oblique: ['obliques'],
    quadriceps: ['quads'], quad: ['quads'], hamstring: ['hamstrings'], glute: ['glutes'], abductors: ['glutes'],
    adductor: ['adductors'], calf: ['calves'], pecs: ['chest'], 'upper chest': ['chest'], forearm: ['forearms']
  };
  const PLATES = ['red', 'blue', 'yellow', 'green'];
  const LIB_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
  const PHOTO_CACHE = 'rul-photos';
  const LIBRARY = window.LIBRARY || [];
  const BUNDLED = new Set(window.BUNDLED || []);
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const LIB_BY_ID = new Map(LIBRARY.map((e) => [e.id, e]));
  const LIB_BY_NORM = new Map();
  LIBRARY.forEach((e) => { LIB_BY_NORM.set(norm(e.n), e.id); LIB_BY_NORM.set(norm(e.id), e.id); });

  const ICON = {
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    tick: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path pathLength="1" d="M4.5 12.5l5 5L19.5 7"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/></svg>',
    trend: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 16l6-6 4 4 6-6"/><path d="M15 8h5v5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.6-5.3 3.7-8.3.4 2 1.6 3.1 2.6 3.6.3-2.8 1.8-5 3.7-6.6-.3 3.3 3 5.5 3 9.6 0 4.6-2.6 7.9-6.5 7.9z"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    today: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M2 12h20"/><rect x="5" y="7" width="3" height="10" rx="1"/><rect x="16" y="7" width="3" height="10" rx="1"/></svg>',
    history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg>',
    program: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
    settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>'
  };

  // ---------- Storage ----------
  const load = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
  const save = (k, v) => {
    try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); }
    catch (e) { toast('Could not save. Your phone may be out of storage.'); }
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));

  let program = load(KEYS.program) || clone(window.DEFAULT_PROGRAM);
  let log = load(KEYS.log) || { sessions: [] };
  let current = load(KEYS.current);
  let settings = Object.assign({ wakeLock: true, theme: 'dark' }, load(KEYS.settings) || {});
  const ui = { tab: 'today', open: null, override: null, histMode: 'sessions', histOpen: null, intro: true, viewAnim: false, flash: null, justOpened: null, popPlate: null };

  const saveProgram = () => save(KEYS.program, program);
  const saveLog = () => save(KEYS.log, log);
  const saveCurrent = () => save(KEYS.current, current);
  const saveSettings = () => save(KEYS.settings, settings);

  // Custom photos live in IndexedDB (too big for localStorage).
  const idb = (() => {
    let dbp;
    const db = () => dbp || (dbp = new Promise((res, rej) => {
      const r = indexedDB.open('rul', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('photos');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    }));
    const run = async (mode, fn) => {
      const d = await db();
      return new Promise((res, rej) => {
        const t = d.transaction('photos', mode);
        const req = fn(t.objectStore('photos'));
        t.oncomplete = () => res(req ? req.result : undefined);
        t.onerror = () => rej(t.error);
      });
    };
    return {
      get: (k) => run('readonly', (s) => s.get(k)),
      put: (k, v) => run('readwrite', (s) => s.put(v, k)),
      del: (k) => run('readwrite', (s) => s.delete(k)),
      keys: () => run('readonly', (s) => s.getAllKeys())
    };
  })();
  const blobUrls = new Map();

  // ---------- Helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slug = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'exercise';
  const DAY = 86400000;
  const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const daysAgo = (t) => Math.round((startOfDay(Date.now()) - startOfDay(t)) / DAY);
  const fmtDate = (t) => new Date(t).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const fmtRest = (s) => (!s ? 'no rest' : s < 60 ? `${s} s` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
  const fmtClock = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const relDay = (t) => { const d = daysAgo(t); return d === 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`; };
  const plateOf = (s) => (s && PLATES.includes(s.color) ? s.color : 'red');
  const sessions = () => program.sessions || [];
  const sessionById = (id) => sessions().find((s) => s.id === id);
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function parseReps(str) {
    const s = String(str || '');
    const m = s.match(/(\d+)\s*[-–to]+\s*(\d+)/);
    if (m) return { min: +m[1], max: +m[2] };
    const one = s.match(/(\d+)/);
    return one ? { min: +one[1], max: +one[1] } : { min: 0, max: 0 };
  }
  function lastLoggedSession() {
    const s = log.sessions;
    return s.length ? s.reduce((a, b) => ((b.end || b.start) > (a.end || a.start) ? b : a)) : null;
  }
  function nextSessionId() {
    const list = sessions();
    if (!list.length) return null;
    const last = lastLoggedSession();
    const i = last ? list.findIndex((s) => s.id === last.sessionId) : -1;
    return list[(i + 1) % list.length].id;
  }
  function rampActive() {
    const r = program.rampIn;
    if (!r || !r.enabled) return false;
    if (!log.sessions.length) return true;
    const first = Math.min(...log.sessions.map((s) => s.start));
    return (Date.now() - first) / DAY < (r.weeks || 2) * 7;
  }
  function effSets(ex) {
    const r = program.rampIn || {};
    return rampActive() && ex.sets >= 4 ? Math.min(ex.sets, r.maxSets || 3) : ex.sets;
  }
  function lastEntry(exId) {
    const list = [...log.sessions].sort((a, b) => b.start - a.start);
    for (const s of list) {
      const e = s.entries.find((x) => x.exId === exId);
      if (e) return { date: s.start, ...e };
    }
    return null;
  }
  function fmtWeight(w) { return w == null || w === '' ? '' : String(+(+w).toFixed(2)); }
  function fmtSets(sets, noWeight) {
    if (!sets || !sets.length) return '';
    const reps = sets.map((s) => s.r).join(', ');
    const ws = sets.map((s) => fmtWeight(s.w));
    if (noWeight || ws.every((w) => w === '')) return `${reps} reps`;
    if (ws.every((w) => w === ws[0])) return `${ws[0]} kg × ${reps}`;
    return sets.map((s) => `${fmtWeight(s.w) || 'BW'}×${s.r}`).join(', ');
  }
  function topSet(sets) {
    return sets.reduce((best, s) => {
      const w = s.w == null ? -Infinity : +s.w;
      if (!best || w > best.w || (w === best.w && +s.r > best.r)) return { w, r: +s.r };
      return best;
    }, null);
  }
  function progressionTip(ex, last) {
    if (!last || !last.sets.length) return '';
    const { max } = parseReps(ex.reps);
    if (!max) return '';
    const target = last.targetSets || effSets(ex);
    if (last.sets.length < target) return '';
    if (!last.sets.every((s) => +s.r >= max)) return '';
    return ex.noWeight
      ? `Last time you hit ${max} reps on every set. Make it harder today: slow the lowering or add a pause.`
      : `Last time you hit ${max} reps on every set. Add the smallest weight jump today.`;
  }
  function libName(id) { const e = LIB_BY_ID.get(id); return e ? e.n : null; }
  function photoUrls(lib) {
    if (!lib) return null;
    return BUNDLED.has(lib) ? [`img/${lib}/0.jpg`, `img/${lib}/1.jpg`] : [`${LIB_BASE}${lib}/0.jpg`, `${LIB_BASE}${lib}/1.jpg`];
  }
  function mapMuscles(list) {
    const out = [];
    (Array.isArray(list) ? list : String(list || '').split(',')).forEach((raw) => {
      const k = String(raw).trim().toLowerCase();
      if (!k) return;
      const key = MUSCLE_LABEL[k] ? [k] : MUSCLE_LABEL[k.replace(/\s+/g, '-')] ? [k.replace(/\s+/g, '-')] : MUSCLE_ALIAS[k] || MUSCLE_ALIAS[k.replace(/-/g, ' ')] || [];
      key.forEach((m) => { if (!out.includes(m)) out.push(m); });
    });
    return out;
  }

  // ---------- Toast ----------
  let toastTimer, toastOutTimer;
  function toast(msg) {
    const root = $('#toast-root');
    root.innerHTML = `<div class="toast" role="status">${esc(msg)}</div>`;
    clearTimeout(toastTimer); clearTimeout(toastOutTimer);
    toastOutTimer = setTimeout(() => { const t = $('.toast', root); if (t) t.classList.add('out'); }, 2600);
    toastTimer = setTimeout(() => { root.innerHTML = ''; }, 2900);
  }

  // ---------- Body map ----------
  function bodyMap(primary = [], secondary = []) {
    const P = new Set(primary), S = new Set(secondary);
    const k = (m) => (P.has(m) ? 'mp' : S.has(m) ? 'ms' : 'm0');
    const out = [];
    const E = (cls, cx, cy, rx, ry, rot = 0) => `<ellipse class="${cls}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"${rot ? ` transform="rotate(${rot} ${cx} ${cy})"` : ''}/>`;
    const both = (fn) => { out.push(fn(-1), fn(1)); };
    const fig = (c, back) => {
      const x = (s, dx) => (c + s * dx).toFixed(1);
      out.push(`<circle class="nb" cx="${c}" cy="13" r="8.5"/>`, `<path class="nb" d="M${c - 4} 20L${c + 4} 20L${c + 5} 27L${c - 5} 27Z"/>`);
      both((s) => E('nb', x(s, 28.5), 91, 3, 4.2));
      both((s) => E('nb', x(s, 9), 150.5, 4, 3.5));
      both((s) => E('nb', x(s, 11), 190, 4.5, 2.6));
      both((s) => E(k('side-delts'), x(s, 21.5), 38.5, 3.4, 7, s * 12));
      both((s) => E(k('forearms'), x(s, 26), 75, 3.8, 11, s * -8));
      if (!back) {
        both((s) => `<path class="${k('traps')}" d="M${x(s, 4.5)} 24L${x(s, 13)} 29.5L${x(s, 5)} 30Z"/>`);
        both((s) => E(k('front-delts'), x(s, 15.5), 35, 5.5, 6.5, s * 20));
        both((s) => `<path class="${k('chest')}" d="M${x(s, 1)} 30.5L${x(s, 12)} 31Q${x(s, 19)} 34 ${x(s, 17)} 45Q${x(s, 10)} 50.5 ${x(s, 1)} 47.5Z"/>`);
        both((s) => E(k('biceps'), x(s, 22.5), 53, 4.2, 9, s * -8));
        out.push(`<rect class="${k('abs')}" x="${c - 6}" y="49.5" width="12" height="36" rx="3"/>`);
        both((s) => `<path class="${k('obliques')}" d="M${x(s, 7.5)} 50Q${x(s, 15)} 52 ${x(s, 15)} 62L${x(s, 13)} 83Q${x(s, 10)} 87 ${x(s, 7.5)} 86Z"/>`);
        out.push(`<path class="nb" d="M${c - 13} 88L${c + 13} 88L${c + 9} 99L${c} 102L${c - 9} 99Z"/>`);
        both((s) => `<path class="${k('quads')}" d="M${x(s, 4)} 100Q${x(s, 13)} 96 ${x(s, 15)} 104Q${x(s, 16)} 125 ${x(s, 12.5)} 145Q${x(s, 8.5)} 149 ${x(s, 5.5)} 145Q${x(s, 3)} 122 ${x(s, 4)} 100Z"/>`);
        both((s) => `<path class="${k('adductors')}" d="M${x(s, 1.2)} 103Q${x(s, 3.2)} 102 ${x(s, 3.3)} 106Q${x(s, 3.8)} 117 ${x(s, 4)} 126Q${x(s, 1.5)} 118 ${x(s, 1.2)} 103Z"/>`);
        both((s) => E(k('calves'), x(s, 10), 170, 4.2, 14, s * 3));
      } else {
        out.push(`<path class="${k('traps')}" d="M${c} 20L${c + 6} 26L${c + 15} 31L${c + 7} 36L${c + 3} 52L${c} 56L${c - 3} 52L${c - 7} 36L${c - 15} 31L${c - 6} 26Z"/>`);
        both((s) => E(k('rear-delts'), x(s, 16), 35.5, 5.5, 6.5, s * -20));
        both((s) => `<path class="${k('upper-back')}" d="M${x(s, 8)} 38Q${x(s, 14)} 36.5 ${x(s, 15.5)} 42Q${x(s, 14.5)} 48.5 ${x(s, 8.5)} 50Q${x(s, 6.5)} 45 ${x(s, 8)} 38Z"/>`);
        both((s) => `<path class="${k('lats')}" d="M${x(s, 5)} 54Q${x(s, 10)} 51 ${x(s, 16)} 47Q${x(s, 18)} 59 ${x(s, 13.5)} 72Q${x(s, 9.5)} 81 ${x(s, 5.5)} 84Z"/>`);
        out.push(`<rect class="${k('lower-back')}" x="${c - 4.5}" y="62" width="9" height="24" rx="3"/>`);
        both((s) => E(k('triceps'), x(s, 22.5), 53, 4.3, 9.5, s * -8));
        both((s) => E(k('glutes'), x(s, 7.2), 96.5, 7.5, 8.5));
        both((s) => `<path class="${k('hamstrings')}" d="M${x(s, 3)} 107Q${x(s, 12)} 103 ${x(s, 14)} 110Q${x(s, 14.5)} 128 ${x(s, 11.5)} 145Q${x(s, 7.5)} 149 ${x(s, 4.5)} 145Q${x(s, 2)} 125 ${x(s, 3)} 107Z"/>`);
        both((s) => E(k('calves'), x(s, 10), 167, 5, 13, s * 3));
      }
    };
    fig(55, false);
    fig(165, true);
    const names = [...primary, ...secondary].map((m) => MUSCLE_LABEL[m]).filter(Boolean).join(', ');
    return `<svg viewBox="0 0 220 210" role="img" aria-label="Muscles worked: ${esc(names || 'none set')}">${out.join('')}<text x="55" y="207">Front</text><text x="165" y="207">Back</text></svg>`;
  }
  function musclesLine(ex) {
    const p = (ex.primary || []).map((m) => MUSCLE_LABEL[m]).filter(Boolean);
    const s = (ex.secondary || []).map((m) => MUSCLE_LABEL[m]).filter(Boolean);
    if (!p.length && !s.length) return '';
    return `<p class="muscles">${p.length ? `Works <b>${esc(p.join(', ').toLowerCase())}</b>.` : ''}${s.length ? ` Also ${esc(s.join(', ').toLowerCase())}.` : ''}</p>`;
  }

  // ---------- Photo ----------
  function photoHTML(ex) {
    if (ex.photo && ex.photo.startsWith('custom:')) {
      return `<div class="photo" data-custom="${esc(ex.photo.slice(7))}"><div class="ph">Loading your photo…</div></div>`;
    }
    const urls = photoUrls(ex.library);
    if (!urls) return `<div class="photo"><div class="ph">No photo yet. Add one in Program.</div></div>`;
    return `<div class="photo" data-act="pause" role="button" aria-label="Pause or play the demonstration"><img class="lib" src="${urls[0]}" alt="${esc(ex.name)}: start position"><img class="lib b" src="${urls[1]}" alt="${esc(ex.name)}: end position"><span class="phase" aria-hidden="true"><span>Start</span><span>End</span></span><span class="hint">${reduceMotion() ? 'Tap to see the end' : 'Tap to pause'}</span></div>`;
  }
  async function hydratePhotos(root = document) {
    for (const el of root.querySelectorAll('[data-custom]')) {
      const key = el.dataset.custom;
      try {
        let url = blobUrls.get(key);
        if (!url) { const blob = await idb.get(key); if (!blob) throw new Error('missing'); url = URL.createObjectURL(blob); blobUrls.set(key, url); }
        el.innerHTML = `<img src="${url}" alt="Your photo">`;
      } catch (e) { el.innerHTML = '<div class="ph">Photo not found on this phone.</div>'; }
    }
  }
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (img.tagName === 'IMG' && img.classList.contains('lib')) {
      const box = img.closest('.photo');
      if (box && !box.dataset.failed) {
        box.dataset.failed = '1';
        box.innerHTML = '<div class="ph">This photo isn\'t saved yet. Open the app once with internet and it downloads for offline use.</div>';
      }
    }
  }, true);

  async function photoList() {
    const urls = new Set();
    sessions().forEach((s) => s.exercises.forEach((ex) => {
      if (ex.library && !BUNDLED.has(ex.library) && !(ex.photo || '').startsWith('custom:')) photoUrls(ex.library).forEach((u) => urls.add(u));
    }));
    return [...urls];
  }
  async function photoStatus() {
    const urls = await photoList();
    if (!('caches' in window)) return { ok: 0, total: urls.length };
    let ok = 0;
    for (const u of urls) if (await caches.match(u)) ok++;
    return { ok, total: urls.length };
  }
  async function prefetchPhotos() {
    const urls = await photoList();
    if (!('caches' in window) || !urls.length) return { ok: 0, total: urls.length };
    const cache = await caches.open(PHOTO_CACHE);
    let ok = 0;
    await Promise.all(urls.map(async (u) => {
      try {
        if (await caches.match(u)) { ok++; return; }
        const r = await fetch(u, { mode: 'cors' });
        if (r.ok) { await cache.put(u, r); ok++; }
      } catch (e) { /* offline */ }
    }));
    return { ok, total: urls.length };
  }

  // ---------- Workout state ----------
  function exState(ex) {
    if (!current.ex[ex.id]) current.ex[ex.id] = { sets: Array.from({ length: effSets(ex) }, () => ({ w: '', r: '', done: false })), done: false };
    return current.ex[ex.id];
  }
  function placeholders(ex, i) {
    const last = lastEntry(ex.id);
    if (!last || !last.sets.length) return { w: '', r: '' };
    const s = last.sets[Math.min(i, last.sets.length - 1)];
    return { w: fmtWeight(s.w), r: String(s.r) };
  }
  function nextUndone(s, afterIdx) {
    const list = s.exercises;
    for (let j = afterIdx + 1; j < list.length; j++) if (!(current.ex[list[j].id] || {}).done) return list[j].id;
    for (let j = 0; j < list.length; j++) if (!(current.ex[list[j].id] || {}).done) return list[j].id;
    return null;
  }
  function startWorkout(sessionId) {
    current = { sessionId, start: Date.now(), ex: {} };
    const s = sessionById(sessionId);
    ui.open = s && s.exercises[0] ? s.exercises[0].id : null;
    ui.override = null;
    Object.keys(prevFrac).forEach((k) => delete prevFrac[k]);
    ui.viewAnim = true; ui.justOpened = ui.open;
    saveCurrent();
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    wakeOn();
    render();
    window.scrollTo(0, 0);
  }
  function checkSet(exId, i) {
    const s = sessionById(current.sessionId);
    const idx = s.exercises.findIndex((e) => e.id === exId);
    const ex = s.exercises[idx];
    const st = exState(ex);
    const set = st.sets[i];
    if (set.done) { set.done = false; st.done = false; saveCurrent(); render(); return; }
    const ph = placeholders(ex, i);
    if (set.r === '') {
      if (ph.r !== '') set.r = ph.r;
      else { toast('Enter your reps first.'); const inp = document.querySelector(`input[data-f="r"][data-ex="${exId}"][data-i="${i}"]`); if (inp) inp.focus(); return; }
    }
    if (set.w === '' && ph.w !== '' && !ex.noWeight) set.w = ph.w;
    set.done = true;
    unlockAudio();
    if (navigator.vibrate) navigator.vibrate(25);
    const allDone = st.sets.every((x) => x.done);
    if (allDone) st.done = true;
    const isA = ex.supersetWithNext && s.exercises[idx + 1];
    const isB = idx > 0 && s.exercises[idx - 1].supersetWithNext;
    let nextOpen = exId;
    if (isA) {
      const partner = s.exercises[idx + 1];
      if (!exState(partner).done) { nextOpen = partner.id; toast(`Superset: now do ${partner.name}.`); }
      else if (allDone) nextOpen = nextUndone(s, idx);
    } else {
      startTimer(ex.rest, ex.name);
      if (isB) {
        const partner = s.exercises[idx - 1];
        if (!exState(partner).done) nextOpen = partner.id;
        else if (allDone) nextOpen = nextUndone(s, idx);
      } else if (allDone) nextOpen = nextUndone(s, idx);
    }
    saveCurrent();
    ui.open = exId;
    ui.flash = `${exId}:${i}`;
    render();
    if (nextOpen !== exId) {
      const token = current.start;
      setTimeout(() => {
        if (!current || current.start !== token || ui.open !== exId || ui.tab !== 'today') return;
        ui.open = nextOpen; ui.justOpened = nextOpen;
        render();
        if (nextOpen) scrollToEx(nextOpen);
        else { const f = $('.finish-area'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      }, reduceMotion() ? 0 : 650);
    }
  }
  function scrollToEx(id) {
    if (!id) return;
    requestAnimationFrame(() => { const el = document.getElementById(`ex-${id}`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  }
  function finishWorkout() {
    const s = sessionById(current.sessionId);
    const entries = [];
    (s ? s.exercises : []).forEach((ex) => {
      const st = current.ex[ex.id];
      if (!st) return;
      const done = st.sets.filter((x) => x.done).map((x) => ({ w: x.w === '' || ex.noWeight ? null : +x.w, r: +x.r }));
      if (done.length) entries.push({ exId: ex.id, name: ex.name, reps: ex.reps, targetSets: st.sets.length, noWeight: !!ex.noWeight, sets: done });
    });
    if (!entries.length) {
      if (confirm('No sets are logged yet. Discard this workout?')) discardWorkout(true);
      return;
    }
    const undone = (s ? s.exercises : []).filter((ex) => !(current.ex[ex.id] || {}).done).length;
    if (undone && !confirm(`${undone} exercise${undone > 1 ? 's are' : ' is'} not finished. Finish the workout anyway?`)) return;
    const done = { id: `w${current.start}`, sessionId: current.sessionId, name: s ? s.name : 'Workout', color: s ? s.color : 'red', start: current.start, end: Date.now(), entries };
    log.sessions.push(done);
    saveLog();
    current = null; saveCurrent();
    stopTimer(); wakeOff();
    const nx = sessionById(nextSessionId());
    ui.tab = 'today';
    render();
    window.scrollTo(0, 0);
    if (navigator.vibrate) navigator.vibrate([40, 70, 40, 70, 120]);
    celebrate(done, nx ? nx.name : '');
  }
  function discardWorkout(skipConfirm) {
    if (!skipConfirm && !confirm('Discard this workout? Sets you logged in it will be deleted.')) return;
    current = null; saveCurrent(); stopTimer(); wakeOff(); ui.viewAnim = true; ui.intro = true; render(); window.scrollTo(0, 0);
  }

  // ---------- Rest timer, sound, wake lock ----------
  let timer = null, audio = null;
  function unlockAudio() {
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch (e) { audio = null; }
  }
  function beep() {
    if (!audio) return;
    [0, 0.25, 0.5].forEach((t) => {
      const o = audio.createOscillator(), g = audio.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(audio.destination);
      const at = audio.currentTime + t;
      g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(0.3, at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);
      o.start(at); o.stop(at + 0.2);
    });
  }
  function startTimer(sec, label) {
    if (!sec) return;
    timer = { end: Date.now() + sec * 1000, total: sec * 1000, label, over: false };
    tick();
  }
  function stopTimer() { timer = null; tick(); }
  const TRING_C = 213.63;
  function tick() {
    const el = $('#timer');
    if (!timer) { el.classList.add('hidden'); return; }
    const now = Date.now();
    const left = timer.end - now;
    if (left <= 0 && !timer.over) {
      timer.over = true; timer.overAt = now;
      if (navigator.vibrate) navigator.vibrate([300, 120, 300, 120, 300]);
      beep();
    }
    if (timer.over && now - timer.overAt > 8000) { timer = null; el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    el.classList.toggle('over', timer.over);
    $('.clock', el).textContent = timer.over ? 'Go' : fmtClock(left);
    $('.lbl b', el).textContent = timer.over ? 'Rest is over' : 'Rest';
    $('.lbl-sub', el).textContent = timer.over ? 'Start your next set.' : `after ${timer.label}`;
    const frac = timer.over ? 1 : Math.max(0, Math.min(1, left / timer.total));
    $('.t-ring .val', el).style.strokeDashoffset = (TRING_C * (1 - frac)).toFixed(2);
  }
  setInterval(tick, 250);
  let wakeLock = null;
  async function wakeOn() {
    if (!settings.wakeLock || !current || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
    try { wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { /* not allowed */ }
  }
  function wakeOff() { if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { wakeOn(); tick(); } });

  // ---------- Views ----------
  const prevFrac = {};
  let pendingFrac = {};
  const RING_C = 94.25;

  function barbell(list, selId) {
    const n = list.length;
    if (!n) return '';
    const W = 360, H = 150, cy = 60, left = 52, right = 308, gap = (right - left) / n;
    const pw = Math.min(44, gap - 12);
    const grads = PLATES.map((p) => `<linearGradient id="pg-${p}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--${p}) 62%, white)"/><stop offset=".5" style="stop-color:var(--${p})"/><stop offset="1" style="stop-color:color-mix(in srgb, var(--${p}) 70%, black)"/></linearGradient>`).join('');
    const plates = list.map((s, i) => {
      const cx = left + gap * (i + 0.5), sel = s.id === selId, h = sel ? 104 : 80, p = plateOf(s);
      const x0 = cx - pw / 2;
      return `<g class="pl-in" style="--d:${i}"><g class="plate${sel ? ' sel' : ''}${ui.popPlate === s.id ? ' pop' : ''}" data-plate="${p}" data-act="pick" data-session="${esc(s.id)}" role="button" tabindex="0" aria-label="${esc(s.name)}${sel ? ', selected' : ''}">
        <rect x="${x0.toFixed(1)}" y="${cy - h / 2}" width="${pw.toFixed(1)}" height="${h}" rx="8" style="fill:url(#pg-${p})"/>
        <rect x="${(x0 + 4).toFixed(1)}" y="${cy - h / 2 + 7}" width="3" height="${h - 14}" rx="1.5" fill="rgba(255,255,255,.3)"/>
        <rect x="${(cx - 5).toFixed(1)}" y="${cy - h / 2 + 12}" width="10" height="${h - 24}" rx="5" fill="rgba(0,0,0,.22)"/>
        <text class="plate-label" x="${cx.toFixed(1)}" y="${cy + 74}">${esc(s.name)}</text></g></g>`;
    }).join('');
    return `<svg class="barbell${ui.intro ? ' intro' : ''}" viewBox="0 0 ${W} ${H}" role="group" aria-label="Session rotation. Tap a plate to pick a session.">
      <defs>${grads}<linearGradient id="pg-bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--bar-a)"/><stop offset="1" style="stop-color:var(--bar-b)"/></linearGradient></defs>
      <rect x="4" y="${cy - 4}" width="${W - 8}" height="8" rx="4" fill="url(#pg-bar)"/>
      <rect x="${left - 20}" y="${cy - 17}" width="10" height="34" rx="3" fill="url(#pg-bar)"/>
      <rect x="${right + 10}" y="${cy - 17}" width="10" height="34" rx="3" fill="url(#pg-bar)"/>
      ${plates}</svg>`;
  }

  function streak(last) {
    const byDay = new Map();
    log.sessions.forEach((w) => byDay.set(startOfDay(w.start), w));
    const dots = [];
    let count = 0;
    for (let k = 13; k >= 0; k--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - k);
      const w = byDay.get(d.getTime());
      if (w) count++;
      dots.push(`<span class="day${w ? ' on' : ''}${k === 0 ? ' today' : ''}"${w ? ` data-plate="${plateOf(w)}"` : ''} style="--d:${13 - k}" title="${esc(fmtDate(d.getTime()) + (w ? `: ${w.name}` : ''))}"></span>`);
    }
    const head = count ? `${count} workout${count > 1 ? 's' : ''} in the last 2 weeks` : 'No workouts in the last 2 weeks yet';
    const lastTxt = last ? ` <span>Last: ${esc(last.name)}, ${relDay(last.start)}.</span>` : '';
    return `<div class="streak${ui.intro ? ' intro' : ''}">
      <p class="streak-txt">${head}.${lastTxt}</p>
      <div class="days" aria-hidden="true">${dots.join('')}</div>
      <div class="days-lbl" aria-hidden="true"><span>2 weeks ago</span><span>Today</span></div>
    </div>`;
  }

  function thumbHTML(ex) {
    if (ex.photo && ex.photo.startsWith('custom:')) return `<span class="thumb" data-custom="${esc(ex.photo.slice(7))}"></span>`;
    const urls = photoUrls(ex.library);
    return urls ? `<img class="thumb" src="${urls[0]}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : '<span class="thumb"></span>';
  }

  function viewToday() {
    if (current) return viewWorkout();
    const list = sessions();
    if (!list.length) return `<div class="empty">${ICON.program}<h2>No sessions yet</h2><p>Add a session in Program, or import one from an AI.</p><button class="btn primary" data-act="tab" data-tab="program">Open Program</button></div>`;
    const sid = ui.override && sessionById(ui.override) ? ui.override : nextSessionId();
    const s = sessionById(sid);
    document.body.dataset.plate = plateOf(s);
    const last = lastLoggedSession();
    let notes = '';
    if (last && daysAgo(last.start) >= 7) {
      notes += `<div class="note">${ICON.clock}<span>It's been ${daysAgo(last.start)} days since your last workout. Use about 10% less weight today, then build back up next time.</span></div>`;
    }
    if (rampActive() && s.exercises.some((e) => e.sets >= 4)) {
      notes += `<div class="note">${ICON.trend}<span>Easing in: during your first ${(program.rampIn && program.rampIn.weeks) || 2} weeks, exercises with 4 sets use ${(program.rampIn && program.rampIn.maxSets) || 3}. The extra set starts after that.</span></div>`;
    }
    const items = s.exercises.map((ex, i) => {
      const pair = ex.supersetWithNext && s.exercises[i + 1] ? `<span class="pair-mark">${ICON.link}Superset with ${esc(s.exercises[i + 1].name)}</span>` : '';
      return `<li style="--d:${i}">${thumbHTML(ex)}<span class="pv-txt"><span class="pv-name">${esc(ex.name)}</span>${pair}</span><span class="t">${effSets(ex)} × ${esc(ex.reps)}</span></li>`;
    }).join('');
    const heroCls = ui.intro ? ' intro' : ui.popPlate ? ' swap' : '';
    return `
      <section class="hero${heroCls}">
        <div class="bar-wrap">${barbell(list, sid)}</div>
        <p class="kicker">${ui.override ? 'Your pick' : 'Next up'}</p>
        <h1 class="hero-title">${esc(s.name)}</h1>
        ${s.focus ? `<p class="hero-focus">${esc(s.focus)}</p>` : ''}
      </section>
      ${notes}
      <button class="btn primary big" data-act="start" data-session="${esc(s.id)}">Start ${esc(s.name)}</button>
      ${ui.override
        ? `<button class="btn ghost wide" data-act="clear-override">Go back to ${esc(sessionById(nextSessionId()).name)}</button>`
        : '<button class="btn ghost wide" data-act="pick-sheet">Do a different session</button>'}
      ${streak(last)}
      <h3 class="sub">${s.exercises.length} exercise${s.exercises.length === 1 ? '' : 's'}</h3>
      <ul class="preview-list${ui.intro ? ' intro' : ''}">${items}</ul>`;
  }

  function viewWorkout() {
    const s = sessionById(current.sessionId);
    if (!s) return `<div class="empty"><p>This session was removed from your program.</p><button class="btn" data-act="discard">Discard workout</button></div>`;
    document.body.dataset.plate = plateOf(s);
    if (ui.open === null) ui.open = nextUndone(s, -1);
    const exs = s.exercises;
    let total = 0, doneAll = 0;
    const segs = [];
    const items = exs.map((ex, idx) => {
      const st = exState(ex);
      const doneCount = st.sets.filter((x) => x.done).length;
      total += st.sets.length; doneAll += doneCount;
      const frac = st.done ? 1 : doneCount / st.sets.length;
      const from = prevFrac[ex.id] == null ? frac : prevFrac[ex.id];
      pendingFrac[ex.id] = frac;
      segs.push(`<span class="pseg"><i style="width:${(from * 100).toFixed(1)}%" data-prop="width" data-to="${(frac * 100).toFixed(1)}%"></i></span>`);
      const pairedA = ex.supersetWithNext && exs[idx + 1];
      const pairedB = idx > 0 && exs[idx - 1].supersetWithNext;
      const open = ui.open === ex.id;
      const cls = ['ex', open ? 'open' : '', st.done ? 'done' : '', open && ui.justOpened === ex.id ? 'opening' : ''].filter(Boolean).join(' ');
      const restText = pairedA ? 'no rest, then the next exercise' : `rest ${fmtRest(ex.rest)}`;
      const ring = `<svg class="ring" viewBox="0 0 36 36" aria-hidden="true"><circle class="trk" cx="18" cy="18" r="15"/><circle class="val" cx="18" cy="18" r="15" style="stroke-dashoffset:${(RING_C * (1 - from)).toFixed(2)}" data-prop="stroke-dashoffset" data-to="${(RING_C * (1 - frac)).toFixed(2)}"/></svg>`;
      const link = pairedA ? `<li class="ss-link" aria-hidden="true"><span>${ICON.link}Superset</span></li>` : '';
      return `<li class="${cls}" id="ex-${esc(ex.id)}">
        <button class="ex-head" data-act="toggle" data-ex="${esc(ex.id)}" aria-expanded="${open}">
          <span class="badge">${ring}<span class="n">${st.done ? ICON.check : idx + 1}</span></span>
          <span class="txt"><span class="name">${esc(ex.name)}</span><span class="meta">${st.sets.length} × ${esc(ex.reps)}, ${restText}</span></span>
          <span class="count">${doneCount}/${st.sets.length}</span>
          <span class="chev">${ICON.chev}</span>
        </button>
        ${open ? exBody(ex, st, idx, s, pairedA, pairedB) : ''}
      </li>${link}`;
    }).join('');
    const allDone = exs.every((ex) => (current.ex[ex.id] || {}).done);
    return `
      <header class="wk-top">
        <div class="wk-row"><h2>${esc(s.name)}</h2><span class="elapsed" id="elapsed">${fmtClock(Date.now() - current.start)}</span><span class="wk-count">${doneAll}/${total} sets</span></div>
        <div class="psegs" aria-hidden="true">${segs.join('')}</div>
      </header>
      <ul class="exlist">${items}</ul>
      <div class="finish-area">
        <button class="btn ${allDone ? 'primary' : ''} big" data-act="finish">Finish workout</button>
        <button class="btn ghost danger wide" data-act="discard">Discard workout</button>
      </div>`;
  }

  function exBody(ex, st, idx, s, pairedA, pairedB) {
    const last = lastEntry(ex.id);
    const tip = progressionTip(ex, last);
    const hasRm = st.sets.some((set, i) => i >= effSets(ex) && !set.done);
    const rows = st.sets.map((set, i) => {
      const ph = placeholders(ex, i);
      const extra = i >= effSets(ex) && !set.done;
      const just = ui.flash === `${ex.id}:${i}`;
      return `<div class="srow${set.done ? ' done' : ''}${just ? ' just' : ''}">
        <span class="sn">${i + 1}</span>
        ${ex.noWeight ? '' : `<input type="number" step="any" data-f="w" data-ex="${esc(ex.id)}" data-i="${i}" value="${esc(set.w)}" placeholder="${esc(ph.w)}" aria-label="Set ${i + 1} weight in kg">`}
        <input type="number" inputmode="numeric" data-f="r" data-ex="${esc(ex.id)}" data-i="${i}" value="${esc(set.r)}" placeholder="${esc(ph.r)}" aria-label="Set ${i + 1} reps">
        <button class="chk" data-act="check" data-ex="${esc(ex.id)}" data-i="${i}" aria-pressed="${set.done}" aria-label="Set ${i + 1} done">${ICON.tick}</button>
        ${hasRm ? (extra ? `<button class="rm" data-act="rmset" data-ex="${esc(ex.id)}" data-i="${i}" aria-label="Remove set ${i + 1}">${ICON.x}</button>` : '<span></span>') : ''}
      </div>`;
    }).join('');
    const pairNote = pairedA ? `<div class="note">${ICON.link}<span>Superset: after each set, go straight to ${esc(s.exercises[idx + 1].name)}, then rest.</span></div>`
      : pairedB ? `<div class="note">${ICON.link}<span>Superset with ${esc(s.exercises[idx - 1].name)}. Rest ${fmtRest(ex.rest)} after this one.</span></div>` : '';
    const warm = idx === 0 && !st.sets.some((x) => x.done)
      ? `<div class="note">${ICON.flame}<span>Warm up first: 5 minutes of easy cardio, then 2–3 lighter ramp-up sets on this exercise (about 50% × 10, 70% × 5, 85% × 2).</span></div>` : '';
    const steps = (ex.steps || []).length ? `<details class="howto"${last ? '' : ' open'}><summary>How to do it</summary><ol>${ex.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></details>` : '';
    const lastTxt = last
      ? `Last time, ${relDay(last.date)}: <b class="num">${esc(fmtSets(last.sets, ex.noWeight))}</b>`
      : ex.noWeight ? 'First time logging this one.' : 'First time logging this one. Start light and find your working weight.';
    return `<div class="ex-body">
      ${photoHTML(ex)}
      ${ex.photoNote ? `<p class="photo-note">${esc(ex.photoNote)}</p>` : ''}
      <div class="map-row">
        <div class="body-map">${bodyMap(ex.primary, ex.secondary)}</div>
        <div>${musclesLine(ex)}${ex.cue ? `<p class="cue">${esc(ex.cue)}</p>` : ''}</div>
      </div>
      ${warm}${pairNote}
      <p class="last">${lastTxt}</p>
      ${tip ? `<div class="progress-tip">${ICON.trend}<span>${esc(tip)}</span></div>` : ''}
      <div class="sets${ex.noWeight ? ' nw' : ''}${hasRm ? ' has-rm' : ''}">
        <div class="sets-h"><span>Set</span>${ex.noWeight ? '' : '<span>kg</span>'}<span>Reps</span><span></span>${hasRm ? '<span></span>' : ''}</div>
        ${rows}
      </div>
      ${ex.weightHint ? `<p class="small muted">${esc(ex.weightHint)}</p>` : ''}
      <div class="ex-actions">
        <button class="btn sm soft" data-act="addset" data-ex="${esc(ex.id)}">${ICON.plus}Add a set</button>
        ${st.done ? '' : `<button class="btn sm soft" data-act="exdone" data-ex="${esc(ex.id)}">Done with this exercise</button>`}
      </div>
      ${steps}
    </div>`;
  }

  function viewHistory() {
    const n = sessionById(nextSessionId());
    document.body.dataset.plate = plateOf(n);
    const seg = `<div class="seg" style="--n:2"><button data-act="hist-mode" data-mode="sessions" aria-pressed="${ui.histMode === 'sessions'}">Workouts</button><button data-act="hist-mode" data-mode="exercises" aria-pressed="${ui.histMode === 'exercises'}">Exercises</button></div>`;
    const title = '<h2 class="page-title">History</h2>';
    if (!log.sessions.length) return `${title}${seg}<div class="empty">${ICON.history}<p>No workouts logged yet. Finish your first session and it shows up here.</p></div>`;
    if (ui.histMode === 'sessions') {
      const items = [...log.sessions].sort((a, b) => b.start - a.start).map((w, k) => {
        const open = ui.histOpen === w.id;
        const sets = w.entries.reduce((a, e) => a + e.sets.length, 0);
        const mins = Math.max(1, Math.round(((w.end || w.start) - w.start) / 60000));
        const vol = w.entries.reduce((a, e) => a + (e.noWeight ? 0 : e.sets.reduce((b, x) => b + (x.w > 0 ? x.w * x.r : 0), 0)), 0);
        return `<div class="tl-item" data-plate="${plateOf(w)}" style="--d:${k}">
          <span class="pchip tl-plate" aria-hidden="true"></span>
          <div class="tl-card">
            <button data-act="hist-open" data-id="${esc(w.id)}" aria-expanded="${open}">
              <span class="grow"><b>${esc(w.name)}</b><span class="small muted block">${fmtDate(w.start)}, ${mins} min, ${sets} sets${vol ? `, ${Math.round(vol).toLocaleString('en')} kg` : ''}</span></span>
              <span class="chev">${ICON.chev}</span>
            </button>
            ${open ? `<div class="hist-detail">${w.entries.map((e) => `<div class="hx"><b>${esc(e.name)}</b><br><span class="num">${esc(fmtSets(e.sets, e.noWeight))}</span></div>`).join('')}
              <button class="btn sm soft danger" data-act="hist-del" data-id="${esc(w.id)}">Delete this workout</button></div>` : ''}
          </div>
        </div>`;
      }).join('');
      return `${title}${seg}<div class="tl${ui.intro ? ' intro' : ''}">${items}</div>`;
    }
    const byEx = new Map();
    [...log.sessions].sort((a, b) => a.start - b.start).forEach((w) => w.entries.forEach((e) => {
      if (!byEx.has(e.exId)) byEx.set(e.exId, { name: e.name, noWeight: e.noWeight, rows: [] });
      const v = byEx.get(e.exId); v.name = e.name; v.rows.push({ date: w.start, sets: e.sets });
    }));
    const items = [...byEx.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([id, v], k) => {
      const open = ui.histOpen === `x:${id}`;
      const latest = v.rows[v.rows.length - 1];
      const vals = v.rows.map((r) => (v.noWeight ? r.sets.reduce((a, s) => a + (+s.r || 0), 0) : topSet(r.sets).w)).filter((x) => isFinite(x));
      const mini = vals.length > 1 ? spark(vals, { w: 72, h: 28, mini: true }) : '';
      const detail = open ? `<div class="hist-detail">${vals.length > 1 ? spark(vals, { draw: true }) : ''}<p class="small muted">${v.noWeight ? 'The line shows total reps per workout.' : 'The line shows your heaviest set per workout.'}</p>
        ${[...v.rows].reverse().slice(0, 12).map((r) => `<div class="hx"><span class="small muted">${fmtDate(r.date)}</span><br><span class="num">${esc(fmtSets(r.sets, v.noWeight))}</span></div>`).join('')}</div>` : '';
      return `<div class="hx-item" style="--d:${k}"><button data-act="hist-open" data-id="x:${esc(id)}" aria-expanded="${open}">
        <span class="grow"><b>${esc(v.name)}</b><span class="small muted block">${fmtDate(latest.date)}: ${esc(fmtSets(latest.sets, v.noWeight))}</span></span>${mini}<span class="chev">${ICON.chev}</span></button>${detail}</div>`;
    }).join('');
    return `${title}${seg}<div class="hx-list${ui.intro ? ' intro' : ''}">${items}</div>`;
  }
  function spark(vals, o = {}) {
    const W = o.w || 300, H = o.h || 76, pad = o.mini ? 3 : 8;
    const min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1;
    const pts = vals.map((v, i) => [pad + (i * (W - 2 * pad)) / (vals.length - 1), max === min ? H / 2 : H - pad - ((v - min) / span) * (H - 2 * pad)]);
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
    const lp = pts[pts.length - 1];
    const area = `${d}L${lp[0].toFixed(1)} ${H}L${pts[0][0].toFixed(1)} ${H}Z`;
    const label = o.mini ? 'aria-hidden="true"' : `role="img" aria-label="Trend from ${fmtWeight(vals[0])} to ${fmtWeight(vals[vals.length - 1])}"`;
    return `<svg class="spark${o.mini ? ' mini' : ''}${o.draw ? ' draw' : ''}" viewBox="0 0 ${W} ${H}" ${label}><path class="area" d="${area}"/><path class="line" pathLength="1" d="${d}"/>${o.mini ? '' : `<circle cx="${lp[0].toFixed(1)}" cy="${lp[1].toFixed(1)}" r="5"/>`}</svg>`;
  }

  function viewProgram() {
    const n = sessionById(nextSessionId());
    document.body.dataset.plate = plateOf(n);
    const list = sessions();
    const secs = list.map((s) => {
      const exs = s.exercises.map((ex, i) => {
        const partner = ex.supersetWithNext && s.exercises[i + 1];
        return `<div class="prog-ex">
          <div class="info" data-act="edit-ex" data-session="${esc(s.id)}" data-ex="${esc(ex.id)}" role="button" tabindex="0">
            <div class="nm">${esc(ex.name)}</div>
            <div class="mt">${ex.sets} × ${esc(ex.reps)}, ${partner ? `superset with ${esc(partner.name)}` : `rest ${fmtRest(ex.rest)}`}${!ex.library && !ex.photo ? ', no photo' : ''}</div></div>
          <button class="icon-btn" data-act="move-ex" data-dir="-1" data-session="${esc(s.id)}" data-ex="${esc(ex.id)}" ${i === 0 ? 'disabled' : ''} aria-label="Move ${esc(ex.name)} up">${ICON.up}</button>
          <button class="icon-btn" data-act="move-ex" data-dir="1" data-session="${esc(s.id)}" data-ex="${esc(ex.id)}" ${i === s.exercises.length - 1 ? 'disabled' : ''} aria-label="Move ${esc(ex.name)} down">${ICON.down}</button>
          <button class="icon-btn" data-act="edit-ex" data-session="${esc(s.id)}" data-ex="${esc(ex.id)}" aria-label="Edit ${esc(ex.name)}">${ICON.edit}</button>
        </div>`;
      }).join('');
      return `<section class="prog-session" data-plate="${plateOf(s)}">
        <div class="prog-session-head"><span class="pchip" aria-hidden="true"></span><div class="grow"><h3>${esc(s.name)}</h3><div class="small muted">${esc(s.focus || '')}</div></div>
          <button class="btn sm soft" data-act="edit-session" data-session="${esc(s.id)}">Edit</button></div>
        ${exs || '<p class="muted" style="padding:12px 0 0">No exercises yet.</p>'}
        <button class="btn sm soft" style="margin-top:10px" data-act="add-ex" data-session="${esc(s.id)}">${ICON.plus}Add exercise</button>
      </section>`;
    }).join('');
    return `<h2 class="page-title">Program</h2>
      <p class="muted">${esc(program.name || '')}. Sessions run in this order, then repeat.</p>
      <div class="panel">
        <h3>Change it with AI</h3>
        <p class="small">Copy the prompt and paste it into Claude or another AI, then say what you want changed. Paste the AI's answer back with Import. Your logged history is kept.</p>
        <div class="row wrap"><button class="btn primary" data-act="copy-prompt">Copy prompt for AI</button><button class="btn" data-act="import-sheet">Import</button></div>
      </div>
      ${secs}
      <button class="btn wide" style="margin-top:18px" data-act="edit-session">${ICON.plus}Add a session</button>`;
  }

  function viewSettings() {
    const n = sessionById(nextSessionId());
    document.body.dataset.plate = plateOf(n);
    const sw = (key, on, title, text) => `<div class="opt-row"><div class="grow"><b>${title}</b><span class="small muted">${text}</span></div>
      <button class="switch" role="switch" aria-checked="${on}" data-act="toggle-setting" data-key="${key}" aria-label="${title}"></button></div>`;
    const themes = [['dark', 'Dark'], ['light', 'Light'], ['auto', 'Phone']];
    return `<h2 class="page-title">Settings</h2>
      <div class="opt-row"><div class="grow"><b>Theme</b><span class="small muted">Phone follows your phone's setting.</span></div>
        <div class="seg" style="--n:3">${themes.map(([k, l]) => `<button data-act="theme" data-theme-pick="${k}" aria-pressed="${(settings.theme || 'dark') === k}">${l}</button>`).join('')}</div></div>
      ${sw('wakeLock', !!settings.wakeLock, 'Keep the screen on during workouts', 'So the rest timer stays visible.')}
      ${sw('rampIn', !!(program.rampIn && program.rampIn.enabled), 'Ease in for the first 2 weeks', 'Exercises with 4 sets use 3 until week 3.')}
      <div class="opt-row"><div class="grow"><b>Photos for offline use</b><span class="small muted" id="photo-status">Checking…</span></div>
        <button class="btn sm soft" data-act="prefetch">Download now</button></div>
      <div class="opt-row"><div class="grow"><b>Back up your data</b><span class="small muted">Saves your program, workouts and own photos to a file. Do this now and then, since everything lives only on this phone.</span></div>
        <button class="btn sm soft" data-act="backup">Back up</button></div>
      <div class="opt-row"><div class="grow"><b>Restore from a backup</b><span class="small muted">Replaces what's on this phone with the backup file.</span></div>
        <label class="btn sm soft">Restore<input type="file" accept="application/json,.json" data-act="restore" class="hidden"></label></div>
      <div class="opt-row"><div class="grow"><b>Reset the program</b><span class="small muted">Goes back to the original Rolling Upper/Lower Split. Your history is kept.</span></div>
        <button class="btn sm soft danger" data-act="reset-program">Reset</button></div>
      <div class="opt-row"><div class="grow"><b>Delete all history</b><span class="small muted">Removes every logged workout from this phone.</span></div>
        <button class="btn sm soft danger" data-act="clear-history">Delete</button></div>
      <p class="small muted" style="margin-top:20px">Exercise photos and the exercise library come from Free Exercise DB (public domain). Your data never leaves this phone.</p>`;
  }

  // ---------- Finish celebration ----------
  function workoutSummary(w) {
    const prior = log.sessions.filter((x) => x.start < w.start);
    let volume = 0, sets = 0;
    const prs = [];
    w.entries.forEach((e) => {
      sets += e.sets.length;
      if (!e.noWeight) e.sets.forEach((x) => { if (x.w > 0) volume += x.w * x.r; });
      const prev = prior.flatMap((p) => p.entries.filter((q) => q.exId === e.exId));
      if (!prev.length) return;
      if (e.noWeight) {
        const tot = e.sets.reduce((a, x) => a + x.r, 0);
        const best = Math.max(...prev.map((q) => q.sets.reduce((a, x) => a + x.r, 0)));
        if (tot > best) prs.push(`${e.name}: ${tot} reps in total`);
        return;
      }
      const top = topSet(e.sets);
      if (!top || !isFinite(top.w)) return;
      const prevSets = prev.flatMap((q) => q.sets).filter((x) => x.w != null);
      if (!prevSets.length) return;
      const bestW = Math.max(...prevSets.map((x) => x.w));
      const bestR = Math.max(0, ...prevSets.filter((x) => x.w === top.w).map((x) => x.r));
      if (top.w > bestW || (top.w === bestW && top.r > bestR)) prs.push(`${e.name}: ${fmtWeight(top.w)} kg × ${top.r}`);
    });
    return { mins: Math.max(1, Math.round((w.end - w.start) / 60000)), sets, volume: Math.round(volume), prs };
  }
  function celebrate(w, nextName) {
    const sm = workoutSummary(w);
    const calm = reduceMotion();
    const conf = calm ? '' : Array.from({ length: 44 }, (_, i) => `<i style="--x:${(Math.random() * 100).toFixed(1)}%;--r:${Math.round(Math.random() * 900 - 450)}deg;--t:${(1.7 + Math.random() * 1.3).toFixed(2)}s;--dl:${(Math.random() * 0.45).toFixed(2)}s;--w:${6 + Math.round(Math.random() * 6)}px;background:var(--${PLATES[i % 4]})"></i>`).join('');
    $('#cele-root').innerHTML = `<div class="cele" data-plate="${plateOf(w)}" role="dialog" aria-modal="true" aria-labelledby="cele-t">
      <div class="confetti" aria-hidden="true">${conf}</div>
      <div class="cele-card">
        <div class="medal">${ICON.check}</div>
        <h2 id="cele-t">${esc(w.name)} done</h2>
        <p class="muted date">${fmtDate(w.start)}</p>
        <div class="cele-stats">
          <div><b data-count="${sm.mins}">${sm.mins}</b><span>${sm.mins === 1 ? 'minute' : 'minutes'}</span></div>
          <div><b data-count="${sm.sets}">${sm.sets}</b><span>${sm.sets === 1 ? 'set' : 'sets'}</span></div>
          <div><b data-count="${sm.volume}">${sm.volume.toLocaleString('en')}</b><span>kg lifted</span></div>
        </div>
        ${sm.prs.length ? `<div class="prs"><h3>${ICON.trophy}New bests</h3><ul>${sm.prs.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>` : ''}
        ${nextName ? `<p class="next">Next time: <b>${esc(nextName)}</b></p>` : ''}
        <button class="btn primary big" data-act="close-cele">Done</button>
      </div>
    </div>`;
    if (!calm) {
      $('#cele-root').querySelectorAll('[data-count]').forEach((el) => {
        const to = +el.dataset.count, t0 = performance.now() + 450, dur = 1100;
        el.textContent = '0';
        const step = (t) => {
          const p = Math.max(0, Math.min(1, (t - t0) / dur));
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('en');
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }
    const btn = $('#cele-root .btn');
    if (btn) setTimeout(() => btn.focus({ preventScroll: true }), 50);
  }
  function closeCele() {
    const el = $('#cele-root .cele');
    if (!el) return;
    ui.intro = true;
    render();
    if (reduceMotion()) { $('#cele-root').innerHTML = ''; return; }
    el.classList.add('out');
    setTimeout(() => { $('#cele-root').innerHTML = ''; }, 280);
  }

  // ---------- Sheets ----------
  let sheetState = null, sheetCloseTimer = null;
  function openSheet(html, state) {
    sheetState = state || null;
    const root = $('#sheet-root');
    clearTimeout(sheetCloseTimer);
    const fresh = !root.innerHTML || root.classList.contains('closing');
    root.classList.remove('closing');
    root.innerHTML = `<div class="sheet-back${fresh ? ' enter' : ''}" data-act="close-sheet"></div><div class="sheet ${fresh ? 'enter' : 'swap'}" role="dialog" aria-modal="true">${html}</div>`;
    hydratePhotos(root);
    const f = $('#sheet-root [autofocus]');
    if (f) setTimeout(() => f.focus(), fresh && !reduceMotion() ? 420 : 30);
  }
  function closeSheet() {
    const root = $('#sheet-root');
    sheetState = null;
    if (!root.innerHTML) return;
    clearTimeout(sheetCloseTimer);
    if (reduceMotion()) { root.innerHTML = ''; return; }
    root.classList.add('closing');
    sheetCloseTimer = setTimeout(() => { root.innerHTML = ''; root.classList.remove('closing'); }, 220);
  }

  function sheetPick() {
    const items = sessions().map((s) => `<li data-plate="${plateOf(s)}"><button data-act="pick" data-session="${esc(s.id)}"><span class="pchip"></span><span><span class="rn">${esc(s.name)}</span><br><span class="rm">${esc(s.focus || '')}</span></span></button></li>`).join('');
    openSheet(`<h3>Pick a session</h3><ul class="results">${items}</ul>`);
  }

  // Free Exercise DB only says "shoulders"; guess which head from the movement name.
  function libMuscles(e, list) {
    const n = e.n.toLowerCase();
    const head = /rear|face pull|reverse (machine )?fl|bent.over.*(raise|fly)|reverse pec/.test(n) ? ['rear-delts']
      : /lateral|side raise|upright/.test(n) ? ['side-delts']
      : /press|front raise|arnold/.test(n) ? ['front-delts', 'side-delts'] : null;
    return mapMuscles(list.map((m) => (m === 'shoulders' && head ? head.join(',') : m)).join(',').split(','));
  }
  function newExerciseDraft(sessionId, libId) {
    const e = libId ? LIB_BY_ID.get(libId) : null;
    const primary = e ? libMuscles(e, e.p) : [];
    return {
      sessionId, isNew: true,
      ex: {
        id: '', name: e ? e.n : '', sets: 3, reps: '8–12', rest: 90, library: e ? e.id : null, cue: '',
        steps: e ? e.st.slice() : [], primary, secondary: e ? libMuscles(e, e.s).filter((m) => !primary.includes(m)) : [],
        supersetWithNext: false, noWeight: !!(e && e.eq === 'body only')
      }
    };
  }
  function sheetEditExercise(draft) {
    const ex = draft.ex;
    const chips = (field, cls) => MUSCLES.map(([k, l]) => `<button type="button" class="chip ${cls}" data-act="chip" data-field="${field}" data-m="${k}" aria-pressed="${(ex[field] || []).includes(k)}">${l}</button>`).join('');
    const photoNow = ex.photo && ex.photo.startsWith('custom:') ? 'Your own photo' : ex.library ? `Library: ${esc(libName(ex.library) || ex.library)}` : 'No photo';
    openSheet(`
      <h3>${draft.isNew ? 'New exercise' : 'Edit exercise'}</h3>
      <form id="ex-form" autocomplete="off">
        <label class="field"><span>Name</span><input name="name" value="${esc(ex.name)}" required ${draft.isNew && !ex.name ? 'autofocus' : ''}></label>
        <div class="grid3">
          <label class="field"><span>Sets</span><input name="sets" type="number" inputmode="numeric" min="1" max="10" value="${esc(ex.sets)}"></label>
          <label class="field"><span>Reps</span><input name="reps" value="${esc(ex.reps)}"></label>
          <label class="field"><span>Rest (sec)</span><input name="rest" type="number" inputmode="numeric" min="0" step="5" value="${esc(ex.rest)}"></label>
        </div>
        <label class="field"><span>Coaching cue</span><textarea name="cue" rows="2" style="min-height:64px">${esc(ex.cue)}</textarea></label>
        <label class="field"><span>How to do it</span><textarea name="steps" rows="5">${esc((ex.steps || []).join('\n'))}</textarea><div class="help">One step per line.</div></label>
        <div class="field"><span>Main muscles</span><div class="chips" data-group="primary">${chips('primary', '')}</div></div>
        <div class="field"><span>Also works</span><div class="chips" data-group="secondary">${chips('secondary', 'sec')}</div></div>
        <label class="check-row"><input type="checkbox" name="supersetWithNext" ${ex.supersetWithNext ? 'checked' : ''}> Superset with the next exercise</label>
        <label class="check-row"><input type="checkbox" name="noWeight" ${ex.noWeight ? 'checked' : ''}> Bodyweight only (log reps, no kg)</label>
        <div class="field"><span>Photo</span>
          ${(ex.library || ex.photo) ? photoHTML(ex) : ''}
          <p class="small muted" style="margin:6px 0">${photoNow}</p>
          <div class="row wrap">
            <button type="button" class="btn sm" data-act="lib-photo">Choose from library</button>
            <label class="btn sm">Use my own photo<input type="file" accept="image/*" data-act="own-photo" class="hidden"></label>
            ${(ex.library || ex.photo) ? '<button type="button" class="btn sm ghost" data-act="no-photo">Remove photo</button>' : ''}
          </div>
        </div>
        <div class="row" style="margin-top:18px">
          <button type="submit" class="btn primary grow">Save exercise</button>
          ${draft.isNew ? '' : '<button type="button" class="btn danger" data-act="delete-ex">Delete</button>'}
        </div>
        <button type="button" class="btn ghost" style="width:100%;margin-top:6px" data-act="close-sheet">Cancel</button>
      </form>`, draft);
  }
  function readExerciseForm() {
    const f = $('#ex-form');
    if (!f || !sheetState || !sheetState.ex) return;
    const ex = sheetState.ex;
    ex.name = f.name.value.trim();
    ex.sets = Math.max(1, Math.min(10, parseInt(f.sets.value, 10) || 3));
    ex.reps = f.reps.value.trim().replace(/(\d)\s*-\s*(\d)/, '$1–$2') || '8–12';
    ex.rest = Math.max(0, parseInt(f.rest.value, 10) || 0);
    ex.cue = f.cue.value.trim();
    ex.steps = f.steps.value.split('\n').map((x) => x.trim()).filter(Boolean);
    ex.primary = [...f.querySelectorAll('[data-group="primary"] [aria-pressed="true"]')].map((b) => b.dataset.m);
    ex.secondary = [...f.querySelectorAll('[data-group="secondary"] [aria-pressed="true"]')].map((b) => b.dataset.m).filter((m) => !ex.primary.includes(m));
    ex.supersetWithNext = f.supersetWithNext.checked;
    ex.noWeight = f.noWeight.checked;
  }
  function saveExerciseDraft() {
    readExerciseForm();
    const d = sheetState;
    const ex = d.ex;
    if (!ex.name) { toast('Give the exercise a name.'); return; }
    const s = sessionById(d.sessionId);
    if (d.isNew) {
      let id = slug(ex.name), n = 2;
      while (s.exercises.some((e) => e.id === id)) id = `${slug(ex.name)}-${n++}`;
      ex.id = id;
      s.exercises.push(clone(ex));
    } else {
      const i = s.exercises.findIndex((e) => e.id === d.origId);
      s.exercises[i] = clone(ex);
    }
    saveProgram();
    closeSheet();
    render();
    toast(d.isNew ? `Added ${ex.name} to ${s.name}.` : 'Exercise saved.');
    if (navigator.onLine) prefetchPhotos();
  }

  function sheetLibrary(mode, sessionId) {
    sheetState = Object.assign(sheetState || {}, { libMode: mode, libSession: sessionId });
    const keep = sheetState;
    openSheet(`<h3>${mode === 'photo' ? 'Choose a photo' : 'Add an exercise'}</h3>
      <label class="field"><span>Search ${LIBRARY.length} exercises</span><input type="search" id="lib-q" placeholder="For example: cable row" autofocus></label>
      ${mode === 'add' ? '<button class="btn sm" data-act="blank-ex">Start from a blank exercise</button>' : ''}
      <ul class="results" id="lib-results"></ul>
      <button class="btn ghost" style="width:100%;margin-top:8px" data-act="${mode === 'photo' ? 'back-to-edit' : 'close-sheet'}">${mode === 'photo' ? 'Back' : 'Cancel'}</button>`, keep);
    renderLibResults('');
  }
  function renderLibResults(q) {
    const words = norm(q) ? q.toLowerCase().split(/\s+/).map(norm).filter(Boolean) : [];
    const res = (words.length ? LIBRARY.filter((e) => { const n = norm(e.n); return words.every((w) => n.includes(w)); }) : LIBRARY.filter((e) => BUNDLED.has(e.id))).slice(0, 40);
    $('#lib-results').innerHTML = res.length ? res.map((e) => {
      const thumb = BUNDLED.has(e.id) ? `<img class="thumb" src="img/${e.id}/0.jpg" alt="" loading="lazy">` : `<img class="thumb lib-thumb" src="${LIB_BASE}${e.id}/0.jpg?thumb" alt="" loading="lazy" onerror="this.style.visibility='hidden'">`;
      return `<li><button data-act="lib-choose" data-lib="${esc(e.id)}">${thumb}<span><span class="rn">${esc(e.n)}</span><br><span class="rm">${esc([e.eq, (e.p || []).join(', ')].filter(Boolean).join(', '))}</span></span></button></li>`;
    }).join('') : '<li class="muted" style="padding:12px 0">No matches. Try fewer or different words.</li>';
  }

  function sheetSession(sessionId) {
    const s = sessionId ? sessionById(sessionId) : null;
    const color = s ? plateOf(s) : PLATES[sessions().length % PLATES.length];
    const idx = s ? sessions().indexOf(s) : -1;
    openSheet(`<h3>${s ? 'Edit session' : 'New session'}</h3>
      <form id="session-form" autocomplete="off">
        <label class="field"><span>Name</span><input name="name" value="${esc(s ? s.name : '')}" required ${s ? '' : 'autofocus'}></label>
        <label class="field"><span>Focus</span><input name="focus" value="${esc(s ? s.focus || '' : '')}" placeholder="For example: chest and back"></label>
        <div class="field"><span>Plate colour</span><div class="swatches">${PLATES.map((p) => `<button type="button" class="swatch" data-plate="${p}" data-act="swatch" data-color="${p}" aria-pressed="${p === color}" aria-label="${p}"></button>`).join('')}</div></div>
        ${s ? `<div class="row wrap" style="margin-bottom:12px">
          <button type="button" class="btn sm" data-act="move-session" data-dir="-1" ${idx === 0 ? 'disabled' : ''}>Move earlier</button>
          <button type="button" class="btn sm" data-act="move-session" data-dir="1" ${idx === sessions().length - 1 ? 'disabled' : ''}>Move later</button></div>` : ''}
        <div class="row"><button type="submit" class="btn primary grow">Save session</button>${s ? '<button type="button" class="btn danger" data-act="delete-session">Delete</button>' : ''}</div>
        <button type="button" class="btn ghost" style="width:100%;margin-top:6px" data-act="close-sheet">Cancel</button>
      </form>`, { sessionId, color });
  }

  // ---------- AI import / export ----------
  function programForAI() {
    return {
      name: program.name,
      sessions: sessions().map((s) => ({
        name: s.name, focus: s.focus || '',
        exercises: s.exercises.map((ex) => ({
          name: ex.name, sets: ex.sets, reps: ex.reps.replace(/–/g, '-'), rest: ex.rest, cue: ex.cue || '',
          primary: ex.primary || [], secondary: ex.secondary || [], library: ex.library ? libName(ex.library) : null,
          supersetWithNext: !!ex.supersetWithNext, ...(ex.noWeight ? { noWeight: true } : {})
        }))
      }))
    };
  }
  function aiPrompt() {
    return `I use an offline workout app that imports programs as JSON. Reply with only the JSON, no other text, in exactly this format:

{
  "name": "Program name",
  "sessions": [
    {
      "name": "Upper A",
      "focus": "Short description",
      "exercises": [
        {
          "name": "Incline Dumbbell Press",
          "sets": 4,
          "reps": "6-10",
          "rest": 150,
          "cue": "One short coaching cue",
          "steps": ["Step one", "Step two"],
          "primary": ["chest"],
          "secondary": ["front-delts", "triceps"],
          "library": "Incline Dumbbell Press",
          "supersetWithNext": false
        }
      ]
    }
  ]
}

Rules:
- Sessions rotate in the order listed.
- "reps" is text such as "8-12", "10-15 / leg" or "8 / side". "rest" is in seconds.
- "supersetWithNext": true pairs an exercise with the one after it; the rest comes after the second one.
- Add "noWeight": true for bodyweight exercises where only reps are logged.
- Muscles must come from this list: ${MUSCLES.map((m) => m[0]).join(', ')}.
- "library" is the exact name of an exercise in Free Exercise DB (github.com/yuhonas/free-exercise-db) that shows the same movement, so the app can show its photos. Use null if nothing fits.
- When an exercise stays the same, keep its name exactly as it is in my current program, so my logged history stays linked to it.
- For exercises already in my program you can leave out "steps"; the app keeps the ones it has. Write 3-6 short steps for every new exercise.
- To only add exercises to one session instead of replacing the program, reply with {"session": "Session name", "exercises": [ ... ]}.

My current program:
${JSON.stringify(programForAI(), null, 1)}

What I want changed:
`;
  }
  async function copyPrompt() {
    const text = aiPrompt();
    try { await navigator.clipboard.writeText(text); toast('Prompt copied. Paste it into the AI and add what you want changed.'); }
    catch (e) {
      openSheet(`<h3>Copy this prompt</h3><p class="small muted">Select all the text, copy it, then paste it into the AI.</p>
        <label class="field"><textarea rows="12" readonly id="prompt-text">${esc(text)}</textarea></label>
        <button class="btn ghost" style="width:100%" data-act="close-sheet">Done</button>`);
      const t = $('#prompt-text'); t.focus(); t.select();
    }
  }
  function parseLooseJSON(text) {
    let t = String(text || '').trim().replace(/^```(?:json)?/i, '').replace(/```\s*$/, '');
    const a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a < 0 || b <= a) throw new Error("There's no JSON in the pasted text. Paste the AI's whole answer.");
    try { return JSON.parse(t.slice(a, b + 1)); }
    catch (e) { throw new Error("The JSON isn't valid. Ask the AI to reply with only the JSON, then paste it again."); }
  }
  function matchLibrary(v) {
    if (!v) return null;
    if (LIB_BY_ID.has(v)) return v;
    return LIB_BY_NORM.get(norm(v)) || null;
  }
  function existingByName() {
    const m = new Map();
    sessions().forEach((s) => s.exercises.forEach((ex) => { if (!m.has(norm(ex.name))) m.set(norm(ex.name), ex); }));
    return m;
  }
  function normExercise(x, warnings, usedIds, known) {
    if (!x || typeof x !== 'object' || !String(x.name || '').trim()) throw new Error('Every exercise needs a "name".');
    const name = String(x.name).trim();
    const old = known.get(norm(name));
    // Same name as an exercise you already have: keep its id so its history stays linked.
    const base = old ? old.id : slug(x.id || name);
    let id = base, n = 2;
    while (usedIds.has(id)) id = `${base}-${n++}`;
    usedIds.add(id);
    let lib = matchLibrary(x.library);
    if (x.library && !lib) warnings.push(name);
    if (!lib && !x.library && old) lib = old.library || null;
    const primary = x.primary ? mapMuscles(x.primary) : old ? (old.primary || []).slice() : [];
    const secondary = x.secondary ? mapMuscles(x.secondary) : old ? (old.secondary || []).slice() : [];
    const reps = String(x.reps == null ? (old ? old.reps : '8-12') : x.reps).trim().replace(/(\d)\s*-\s*(\d)/, '$1–$2');
    let steps = Array.isArray(x.steps) ? x.steps.map(String).filter(Boolean) : String(x.steps || '').split('\n').map((s) => s.trim()).filter(Boolean);
    if (!steps.length && old) steps = (old.steps || []).slice();
    if (!steps.length && lib && LIB_BY_ID.get(lib)) steps = LIB_BY_ID.get(lib).st.slice();
    const out = {
      id, name, sets: Math.max(1, Math.min(10, parseInt(x.sets, 10) || (old ? old.sets : 3))), reps,
      rest: x.rest === 0 ? 0 : Math.max(0, parseInt(x.rest, 10) || (old ? old.rest : 90)),
      library: lib, cue: String(x.cue == null ? (old ? old.cue || '' : '') : x.cue).trim(),
      steps, primary, secondary: secondary.filter((m) => !primary.includes(m)),
      supersetWithNext: !!x.supersetWithNext, noWeight: x.noWeight == null && old ? !!old.noWeight : !!x.noWeight
    };
    if (old) ['photo', 'photoNote', 'weightHint'].forEach((k) => { if (old[k] && (k !== 'photoNote' || out.library === old.library)) out[k] = old[k]; });
    return out;
  }
  function sheetImport(text = '', err = '', preview = null) {
    let body = '';
    if (preview) {
      const warn = preview.warnings.length ? `<div class="note">No photo match for: ${esc(preview.warnings.join(', '))}. You can choose photos for these in Program later.</div>` : '';
      if (preview.kind === 'program') {
        body = `<div class="panel"><h3>${esc(preview.program.name || 'New program')}</h3>
          ${preview.program.sessions.map((s) => `<p class="small"><b>${esc(s.name)}</b>: ${s.exercises.length} exercises</p>`).join('')}</div>${warn}
          <button class="btn primary big" data-act="apply-import">Replace my program</button>`;
      } else {
        const target = preview.target || (sessions()[0] && sessions()[0].id);
        body = `<div class="panel"><h3>${preview.exercises.length} exercise${preview.exercises.length > 1 ? 's' : ''} to add</h3>
          ${preview.exercises.map((e) => `<p class="small">${esc(e.name)}: ${e.sets} × ${esc(e.reps)}</p>`).join('')}
          <label class="field"><span>Add to session</span><select id="import-target">${sessions().map((s) => `<option value="${esc(s.id)}" ${s.id === target ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label></div>${warn}
          <button class="btn primary big" data-act="apply-import">Add exercises</button>`;
      }
    }
    openSheet(`<h3>Import from AI</h3>
      <p class="small muted">Paste the AI's whole answer below.</p>
      <label class="field"><textarea id="import-text" rows="8" placeholder='{"name": "...", "sessions": [ ... ]}'>${esc(text)}</textarea></label>
      ${err ? `<div class="note" role="alert">${esc(err)}</div>` : ''}
      ${preview ? body : '<button class="btn primary" style="width:100%" data-act="check-import">Check the import</button>'}
      <button class="btn ghost" style="width:100%;margin-top:6px" data-act="close-sheet">Cancel</button>`, { importPreview: preview });
  }
  function checkImport() {
    const text = $('#import-text').value;
    try {
      const data = parseLooseJSON(text);
      const warnings = [];
      const known = existingByName();
      if (Array.isArray(data.sessions)) {
        if (!data.sessions.length) throw new Error('The program has no sessions.');
        const sIds = new Set();
        const sessionsOut = data.sessions.map((s, i) => {
          if (!s || !String(s.name || '').trim()) throw new Error('Every session needs a "name".');
          let id = slug(s.name), n = 2;
          while (sIds.has(id)) id = `${slug(s.name)}-${n++}`;
          sIds.add(id);
          const used = new Set();
          return { id, name: String(s.name).trim(), focus: String(s.focus || '').trim(), color: PLATES.includes(s.color) ? s.color : PLATES[i % PLATES.length],
            exercises: (Array.isArray(s.exercises) ? s.exercises : []).map((x) => normExercise(x, warnings, used, known)) };
        });
        sheetImport(text, '', { kind: 'program', program: { name: String(data.name || program.name || 'My program'), sessions: sessionsOut }, warnings });
      } else if (Array.isArray(data.exercises)) {
        if (!data.exercises.length) throw new Error('There are no exercises to add.');
        const used = new Set();
        const exercises = data.exercises.map((x) => normExercise(x, warnings, used, known));
        const t = sessions().find((s) => norm(s.name) === norm(data.session));
        sheetImport(text, '', { kind: 'exercises', exercises, warnings, target: t ? t.id : null });
      } else {
        throw new Error('This JSON has no "sessions" or "exercises" list. Ask the AI to use the format from the prompt.');
      }
    } catch (e) { sheetImport(text, e.message); }
  }
  function applyImport() {
    const p = sheetState && sheetState.importPreview;
    if (!p) return;
    if (p.kind === 'program') {
      if (!confirm('Replace your whole program with this one? Your logged history is kept.')) return;
      program = { name: p.program.name, rampIn: program.rampIn || { enabled: true, weeks: 2, maxSets: 3 }, sessions: p.program.sessions };
      ui.override = null;
      toast('Program replaced. Your history is kept.');
    } else {
      const s = sessionById($('#import-target').value);
      p.exercises.forEach((ex) => {
        let id = ex.id, n = 2;
        while (s.exercises.some((e) => e.id === id)) id = `${ex.id}-${n++}`;
        s.exercises.push(Object.assign({}, ex, { id }));
      });
      toast(`Added ${p.exercises.length} exercise${p.exercises.length > 1 ? 's' : ''} to ${s.name}.`);
    }
    saveProgram();
    closeSheet();
    render();
    if (navigator.onLine) prefetchPhotos();
  }

  // ---------- Backup ----------
  async function backup() {
    const photos = {};
    try {
      for (const k of await idb.keys()) {
        const blob = await idb.get(k);
        photos[k] = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
      }
    } catch (e) { /* no photos */ }
    const data = { app: 'rolling-upper-lower', version: 1, exported: new Date().toISOString(), program, log, settings, photos };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `workout-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast('Backup saved to your Downloads.');
  }
  async function restore(file) {
    try {
      const data = JSON.parse(await file.text());
      if (data.app !== 'rolling-upper-lower' || !data.program || !data.log) throw new Error('bad');
      if (!confirm(`Restore the backup from ${fmtDate(data.exported)}? It replaces the program and history on this phone.`)) return;
      program = data.program; log = data.log; settings = Object.assign({ wakeLock: true, theme: 'dark' }, data.settings || {}); applyTheme();
      for (const [k, url] of Object.entries(data.photos || {})) await idb.put(k, await (await fetch(url)).blob());
      saveProgram(); saveLog(); saveSettings();
      render();
      toast('Backup restored.');
    } catch (e) { toast("That file isn't a backup from this app."); }
  }
  async function saveOwnPhoto(file) {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
    const scale = Math.min(1, 900 / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.8));
    const key = `p${Date.now()}`;
    await idb.put(key, blob);
    return key;
  }

  // ---------- Render ----------
  const TABS = ['today', 'history', 'program', 'settings'];
  function buildNav() {
    const icons = { today: ICON.today, history: ICON.history, program: ICON.program, settings: ICON.settings };
    $('#tabs').innerHTML = '<span class="tab-ind" aria-hidden="true"></span>' + TABS.map((id) => `<button data-act="tab" data-tab="${id}">${icons[id]}<span class="tab-l"></span></button>`).join('');
  }
  function renderNav() {
    const nav = $('#tabs');
    const i = Math.max(0, TABS.indexOf(ui.tab));
    nav.style.setProperty('--i', i);
    const labels = [current ? 'Workout' : 'Today', 'History', 'Program', 'Settings'];
    nav.querySelectorAll('button').forEach((b, j) => {
      if (j === i) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
      b.querySelector('.tab-l').textContent = labels[j];
    });
  }
  function applyTheme() {
    const t = settings.theme || 'dark';
    document.documentElement.dataset.theme = t;
    const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#121418' : '#eef0f3';
  }
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  function render() {
    const views = { today: viewToday, history: viewHistory, program: viewProgram, settings: viewSettings };
    const main = $('#main');
    pendingFrac = {};
    main.innerHTML = (views[ui.tab] || viewToday)();
    if (ui.viewAnim && !reduceMotion()) { main.classList.remove('view-enter'); void main.offsetWidth; main.classList.add('view-enter'); }
    ui.viewAnim = false; ui.intro = false; ui.flash = null; ui.justOpened = null; ui.popPlate = null;
    renderNav();
    hydratePhotos(main);
    const anim = main.querySelectorAll('[data-to]');
    if (anim.length) requestAnimationFrame(() => requestAnimationFrame(() => anim.forEach((el) => el.style.setProperty(el.dataset.prop, el.dataset.to))));
    Object.assign(prevFrac, pendingFrac);
    tick();
    if (ui.tab === 'settings') photoStatus().then(({ ok, total }) => {
      const el = $('#photo-status');
      if (el) el.textContent = total ? `${ok} of ${total} added photos saved. The original program's photos are built in.` : 'All photos in your program are built in.';
    });
  }

  // ---------- Events ----------
  document.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-act]');
    if (!t || t.tagName === 'INPUT') return;
    const act = t.dataset.act, exId = t.dataset.ex, sid = t.dataset.session;
    switch (act) {
      case 'tab': if (ui.tab !== t.dataset.tab) { ui.viewAnim = true; ui.intro = true; } ui.tab = t.dataset.tab; ui.histOpen = null; render(); window.scrollTo(0, 0); break;
      case 'start': startWorkout(sid); break;
      case 'pick-sheet': sheetPick(); break;
      case 'pick': ui.override = sid === nextSessionId() ? null : sid; ui.popPlate = sid; closeSheet(); render(); break;
      case 'clear-override': ui.override = null; ui.popPlate = nextSessionId(); render(); break;
      case 'toggle': ui.open = ui.open === exId ? '' : exId; if (ui.open) ui.justOpened = exId; render(); if (ui.open) scrollToEx(exId); break;
      case 'check': checkSet(exId, +t.dataset.i); break;
      case 'addset': { const ex = sessionById(current.sessionId).exercises.find((x) => x.id === exId); const st = exState(ex); st.sets.push({ w: '', r: '', done: false }); st.done = false; saveCurrent(); render(); break; }
      case 'rmset': { const st = current.ex[exId]; st.sets.splice(+t.dataset.i, 1); st.done = st.sets.every((x) => x.done); saveCurrent(); render(); break; }
      case 'exdone': { const s = sessionById(current.sessionId); const idx = s.exercises.findIndex((x) => x.id === exId); current.ex[exId].done = true; ui.open = nextUndone(s, idx); ui.justOpened = ui.open; saveCurrent(); render(); scrollToEx(ui.open); break; }
      case 'pause': {
        t.classList.toggle('paused');
        const h = $('.hint', t), p = t.classList.contains('paused');
        if (h) h.textContent = reduceMotion() ? (p ? 'Showing the end. Tap for the start' : 'Tap to see the end') : (p ? 'Paused. Tap to play' : 'Tap to pause');
        break;
      }
      case 'finish': finishWorkout(); break;
      case 'discard': discardWorkout(); break;
      case 'hist-mode': ui.histMode = t.dataset.mode; ui.histOpen = null; ui.intro = true; render(); break;
      case 'theme': settings.theme = t.dataset.themePick; saveSettings(); applyTheme(); render(); break;
      case 'close-cele': closeCele(); break;
      case 'hist-open': ui.histOpen = ui.histOpen === t.dataset.id ? null : t.dataset.id; render(); break;
      case 'hist-del': if (confirm('Delete this workout from your history?')) { log.sessions = log.sessions.filter((w) => w.id !== t.dataset.id); saveLog(); ui.histOpen = null; render(); } break;
      case 'close-sheet': if (e.target === t || t.tagName === 'BUTTON') closeSheet(); break;
      case 'copy-prompt': copyPrompt(); break;
      case 'import-sheet': sheetImport(); break;
      case 'check-import': checkImport(); break;
      case 'apply-import': applyImport(); break;
      case 'add-ex': sheetState = { sessionId: sid }; sheetLibrary('add', sid); break;
      case 'blank-ex': sheetEditExercise(newExerciseDraft(sheetState.libSession, null)); break;
      case 'lib-choose': {
        if (sheetState && sheetState.libMode === 'photo' && sheetState.ex) { sheetState.ex.library = t.dataset.lib; delete sheetState.ex.photo; sheetState.libMode = null; sheetEditExercise(sheetState); }
        else sheetEditExercise(newExerciseDraft(sheetState.libSession, t.dataset.lib));
        break;
      }
      case 'edit-ex': { const s = sessionById(sid); const ex = s.exercises.find((x) => x.id === exId); sheetEditExercise({ sessionId: sid, isNew: false, origId: exId, ex: clone(ex) }); break; }
      case 'move-ex': { const s = sessionById(sid); const i = s.exercises.findIndex((x) => x.id === exId); const j = i + +t.dataset.dir; if (j < 0 || j >= s.exercises.length) break; [s.exercises[i], s.exercises[j]] = [s.exercises[j], s.exercises[i]]; saveProgram(); render(); break; }
      case 'chip': t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); break;
      case 'lib-photo': readExerciseForm(); sheetLibrary('photo', sheetState.sessionId); break;
      case 'back-to-edit': sheetState.libMode = null; sheetEditExercise(sheetState); break;
      case 'no-photo': readExerciseForm(); sheetState.ex.library = null; delete sheetState.ex.photo; sheetEditExercise(sheetState); break;
      case 'delete-ex': {
        if (!confirm('Delete this exercise from the program? Its logged history is kept.')) break;
        const s = sessionById(sheetState.sessionId); s.exercises = s.exercises.filter((x) => x.id !== sheetState.origId); saveProgram(); closeSheet(); render(); break;
      }
      case 'edit-session': sheetSession(sid || null); break;
      case 'swatch': $('#session-form').querySelectorAll('.swatch').forEach((b) => b.setAttribute('aria-pressed', String(b === t))); sheetState.color = t.dataset.color; break;
      case 'move-session': {
        const list = program.sessions; const i = list.findIndex((s) => s.id === sheetState.sessionId); const j = i + +t.dataset.dir;
        if (j < 0 || j >= list.length) break; [list[i], list[j]] = [list[j], list[i]]; saveProgram(); render(); sheetSession(sheetState.sessionId); break;
      }
      case 'delete-session': {
        if (!confirm('Delete this session and its exercises from the program? Logged history is kept.')) break;
        program.sessions = program.sessions.filter((s) => s.id !== sheetState.sessionId); saveProgram(); closeSheet(); render(); break;
      }
      case 'toggle-setting': {
        const key = t.dataset.key;
        if (key === 'rampIn') { program.rampIn = Object.assign({ weeks: 2, maxSets: 3 }, program.rampIn || {}); program.rampIn.enabled = !program.rampIn.enabled; saveProgram(); }
        else { settings[key] = !settings[key]; saveSettings(); if (key === 'wakeLock') settings.wakeLock ? wakeOn() : wakeOff(); }
        render(); break;
      }
      case 'prefetch': {
        if (!navigator.onLine) { toast("You're offline. Connect to the internet and try again."); break; }
        t.disabled = true; t.textContent = 'Downloading…';
        const r = await prefetchPhotos();
        toast(r.total ? `${r.ok} of ${r.total} photos saved for offline.` : 'All photos are already built in.');
        render(); break;
      }
      case 'backup': backup(); break;
      case 'reset-program': if (confirm('Reset to the original Rolling Upper/Lower Split? Your history is kept.')) { program = clone(window.DEFAULT_PROGRAM); saveProgram(); ui.override = null; render(); toast('Program reset.'); } break;
      case 'clear-history': if (confirm('Delete every logged workout? This cannot be undone unless you have a backup.')) { log = { sessions: [] }; saveLog(); render(); toast('History deleted.'); } break;
      default: break;
    }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-act]')) { e.preventDefault(); e.target.click(); }
    if (e.key === 'Escape' && $('#sheet-root').innerHTML) closeSheet();
  });
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.f && current) {
      const st = current.ex[t.dataset.ex];
      if (st) { st.sets[+t.dataset.i][t.dataset.f] = t.value; saveCurrent(); }
    }
    if (t.id === 'lib-q') renderLibResults(t.value);
  });
  document.addEventListener('change', async (e) => {
    const t = e.target;
    if (t.dataset.act === 'restore' && t.files[0]) { await restore(t.files[0]); t.value = ''; }
    if (t.dataset.act === 'own-photo' && t.files[0]) {
      readExerciseForm();
      try { const key = await saveOwnPhoto(t.files[0]); sheetState.ex.photo = `custom:${key}`; sheetEditExercise(sheetState); }
      catch (err) { toast("Couldn't read that photo. Try another one."); }
    }
  });
  document.addEventListener('submit', (e) => {
    e.preventDefault();
    if (e.target.id === 'ex-form') saveExerciseDraft();
    if (e.target.id === 'session-form') {
      const f = e.target, name = f.name.value.trim();
      if (!name) { toast('Give the session a name.'); return; }
      if (sheetState.sessionId) { const s = sessionById(sheetState.sessionId); s.name = name; s.focus = f.focus.value.trim(); s.color = sheetState.color; }
      else {
        let id = slug(name), n = 2;
        while (sessionById(id)) id = `${slug(name)}-${n++}`;
        program.sessions.push({ id, name, focus: f.focus.value.trim(), color: sheetState.color, exercises: [] });
      }
      saveProgram(); closeSheet(); render();
    }
  });
  setInterval(() => { const el = $('#elapsed'); if (el && current) el.textContent = fmtClock(Date.now() - current.start); }, 1000);

  // Timer controls are static markup in index.html.
  $('#timer').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || !timer) return;
    if (b.dataset.t === 'add') { if (timer.over) { timer.over = false; timer.end = Date.now(); } timer.end += 15000; timer.total += 15000; }
    if (b.dataset.t === 'skip') timer = null;
    tick();
  });

  // ---------- Start ----------
  if (!program.sessions) program = clone(window.DEFAULT_PROGRAM);
  applyTheme();
  buildNav();
  render();
  if (current) wakeOn();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) toast('App updated. Close and reopen it to use the new version.'); });
    navigator.serviceWorker.register('sw.js').then(() => { if (navigator.onLine) prefetchPhotos(); }).catch(() => {});
  }
  window.__app = { get program() { return program; }, get log() { return log; }, render, celebrate: (w, n) => celebrate(w, n) };
})();
