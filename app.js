'use strict';
(() => {
  // ---------- Constants ----------
  const KEYS = { program: 'rul.program', log: 'rul.log', current: 'rul.current', settings: 'rul.settings', body: 'rul.body', ratios: 'rul.ratios' };
  const MUSCLE_KEYS = ['chest', 'front-delts', 'side-delts', 'rear-delts', 'traps', 'upper-back', 'lats', 'lower-back', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'glutes', 'quads', 'hamstrings', 'adductors', 'calves'];
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
  const START_ROWS = 2;
  const LIB_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
  const PHOTO_CACHE = 'rul-photos';
  const LIBRARY = window.LIBRARY || [];
  const BUNDLED = new Set(window.BUNDLED || []);
  const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const LIB_BY_ID = new Map(LIBRARY.map((e) => [e.id, e]));
  const LIB_BY_NORM = new Map();
  LIBRARY.forEach((e) => { LIB_BY_NORM.set(norm(e.n), e.id); LIB_BY_NORM.set(norm(e.id), e.id); });
  const DEFAULT_PROFILE = {
    weight: 68, height: 179, age: '',
    goal: 'Build muscle (hypertrophy)',
    experience: 'About 1 year of lifting, then a break. Back to training since about August 2026.',
    injuries: 'Lower back issue. Avoid exercises that load the lower back.',
    priorities: 'Chest and shoulders first, then back and arms. Abs too (new to training abs).',
    gym: 'Full commercial gym with machines, cables, dumbbells and barbells.',
    schedule: '2–4 days a week with no fixed weekdays; sometimes 2–3 days between workouts.',
    notes: ''
  };

  const s1 = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const ICON = {
    chev: `${s1} stroke-width="2.2"><path d="M6 9l6 6 6-6"/></svg>`,
    tick: `${s1} stroke-width="3"><path pathLength="1" d="M4.5 12.5l5 5L19.5 7"/></svg>`,
    check: `${s1} stroke-width="3"><path d="M4 12.5l5 5L20 6.5"/></svg>`,
    plus: `${s1} stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>`,
    link: `${s1} stroke-width="2.2"><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/></svg>`,
    trend: `${s1} stroke-width="2.2"><path d="M4 16l6-6 4 4 6-6"/><path d="M15 8h5v5"/></svg>`,
    clock: `${s1} stroke-width="2.2"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`,
    flame: `${s1} stroke-width="2.1"><path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.6-5.3 3.7-8.3.4 2 1.6 3.1 2.6 3.6.3-2.8 1.8-5 3.7-6.6-.3 3.3 3 5.5 3 9.6 0 4.6-2.6 7.9-6.5 7.9z"/></svg>`,
    trophy: `${s1} stroke-width="2"><path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4"/></svg>`,
    leaf: `${s1} stroke-width="2"><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/></svg>`,
    undo: `${s1} stroke-width="2.2"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>`,
    expand: `${s1} stroke-width="2.2"><path d="M15 4h5v5M9 20H4v-5M20 4l-6 6M4 20l6-6"/></svg>`,
    sparkle: `${s1} stroke-width="2"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z"/></svg>`,
    share: `${s1} stroke-width="2.1"><path d="M12 15V3M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>`,
    user: `${s1} stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>`,
    up: `${s1} stroke-width="2.2"><path d="M6 15l6-6 6 6"/></svg>`,
    flat: `${s1} stroke-width="2.6"><path d="M5 12h14"/></svg>`,
    stuck: `${s1} stroke-width="2.6"><path d="M9 6v12M15 6v12"/></svg>`,
    dot: `${s1} stroke-width="2"><circle cx="12" cy="12" r="3.5"/></svg>`,
    sync: `${s1} stroke-width="2.1"><path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20v-4h-4"/></svg>`,
    down: `${s1} stroke-width="2.2"><path d="M6 9l6 6 6-6"/></svg>`,
    edit: `${s1} stroke-width="2"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/></svg>`,
    x: `${s1} stroke-width="2.2"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
    today: `${s1} stroke-width="2"><path d="M2 12h20"/><rect x="5" y="7" width="3" height="10" rx="1"/><rect x="16" y="7" width="3" height="10" rx="1"/></svg>`,
    history: `${s1} stroke-width="2"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg>`,
    program: `${s1} stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`,
    settings: `${s1} stroke-width="2"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>`
  };

  // ---------- Storage ----------
  const load = (k) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
  const save = (k, v) => {
    try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); }
    catch (e) { toast(t('saveFail')); }
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));

  let program = load(KEYS.program) || clone(window.DEFAULT_PROGRAM);
  let log = load(KEYS.log) || { sessions: [] };
  let current = load(KEYS.current);
  let body = load(KEYS.body) || [];
  const RATIOS = load(KEYS.ratios) || {};
  const SETTINGS_DEFAULT = { wakeLock: true, theme: 'dark', lang: 'en', blockWeeks: 8, blockStart: null, deload: null, sharedAt: 0, sync: null };
  let settings = Object.assign({}, SETTINGS_DEFAULT, load(KEYS.settings) || {});
  settings.profile = Object.assign({}, DEFAULT_PROFILE, settings.profile || {});
  if (!body.length && settings.profile.weight) body = [{ t: Date.now(), kg: +settings.profile.weight }];
  const ui = { tab: 'today', open: null, override: null, histMode: 'sessions', histOpen: null, intro: true, viewAnim: false, flash: null, justOpened: null, popPlate: null, coach: 'review' };

  // Saves that other devices should see also schedule a sync.
  const saveProgram = () => { program.updatedAt = Date.now(); save(KEYS.program, program); scheduleSync(); };
  const saveLog = () => { save(KEYS.log, log); scheduleSync(1200); };
  const saveCurrent = () => save(KEYS.current, current);
  const saveSettings = () => save(KEYS.settings, settings);
  const saveBody = () => { save(KEYS.body, body); scheduleSync(); };
  const saveShared = () => { settings.sharedAt = Date.now(); saveSettings(); scheduleSync(); };

  // Older saved programs don't have the Arabic text yet: copy it from the default program.
  function migrateProgram() {
    const D = window.DEFAULT_PROGRAM;
    const dEx = new Map(); const dSes = new Map();
    D.sessions.forEach((s) => { dSes.set(s.id, s); s.exercises.forEach((e) => dEx.set(e.id, e)); });
    let changed = false;
    (program.sessions || []).forEach((s) => {
      const ds = dSes.get(s.id);
      if (ds && !s.ar && ds.name === s.name) { s.ar = clone(ds.ar); changed = true; }
      s.exercises.forEach((e) => {
        const de = dEx.get(e.id);
        if (de && !e.ar && de.name === e.name) { e.ar = clone(de.ar); changed = true; }
      });
    });
    if (changed) save(KEYS.program, program);
  }
  if (program.sessions) migrateProgram();

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
        const tx = d.transaction('photos', mode);
        const req = fn(tx.objectStore('photos'));
        tx.oncomplete = () => res(req ? req.result : undefined);
        tx.onerror = () => rej(tx.error);
      });
    };
    return {
      get: (k) => run('readonly', (s) => s.get(k)),
      put: (k, v) => run('readwrite', (s) => s.put(v, k)),
      keys: () => run('readonly', (s) => s.getAllKeys())
    };
  })();
  const blobUrls = new Map();

  // ---------- Language ----------
  const L = () => settings.lang === 'ar';
  function t(key, ...a) {
    const pack = window.STR[settings.lang] || window.STR.en;
    const v = pack[key] !== undefined ? pack[key] : window.STR.en[key];
    return typeof v === 'function' ? v(...a) : v;
  }
  const muscleName = (m) => (window.MUSCLE_NAMES[settings.lang] || window.MUSCLE_NAMES.en)[m] || m;
  const exName = (ex) => (L() && ex.ar && ex.ar.name) || ex.name;
  const exCue = (ex) => (L() && ex.ar && ex.ar.cue) || ex.cue || '';
  const exSteps = (ex) => (L() && ex.ar && ex.ar.steps && ex.ar.steps.length ? ex.ar.steps : ex.steps) || [];
  const exField = (ex, k) => (L() && ex.ar && ex.ar[k]) || ex[k] || '';
  const sName = (s) => (L() && s.ar && s.ar.name) || s.name;
  const sFocus = (s) => (L() && s.ar && s.ar.focus) || s.focus || '';
  const comma = () => (L() ? '، ' : ', ');

  // ---------- Helpers ----------
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slug = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'exercise';
  const DAY = 86400000;
  const startOfDay = (x) => { const d = new Date(x); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const daysAgo = (x) => Math.round((startOfDay(Date.now()) - startOfDay(x)) / DAY);
  const locale = () => (L() ? 'ar-SY-u-nu-latn' : 'en-GB');
  const fmtDate = (x) => new Date(x).toLocaleDateString(locale(), { weekday: 'short', day: 'numeric', month: 'short' });
  const fmtDateEN = (x) => new Date(x).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const fmtRest = (s) => (!s ? t('noRest') : s < 60 ? t('secs', s) : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`);
  const fmtClock = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const relDay = (x) => { const d = daysAgo(x); return d === 0 ? t('relToday') : d === 1 ? t('relYesterday') : t('relDays', d); };
  const plateOf = (s) => (s && PLATES.includes(s.color) ? s.color : 'red');
  const sessions = () => program.sessions || [];
  const sessionById = (id) => sessions().find((s) => s.id === id);
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const exById = (id) => { for (const s of sessions()) { const e = s.exercises.find((x) => x.id === id); if (e) return e; } return null; };
  const entryName = (e) => { const ex = exById(e.exId); return ex ? exName(ex) : e.name; };
  const workoutName = (w) => { const s = sessionById(w.sessionId); return s ? sName(s) : w.name; };

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
  function firstLogged() { return log.sessions.length ? Math.min(...log.sessions.map((s) => s.start)) : null; }
  function rampActive() {
    const r = program.rampIn;
    if (!r || !r.enabled) return false;
    const f = firstLogged();
    return !f || (Date.now() - f) / DAY < (r.weeks || 2) * 7;
  }
  function deloadActive() { return !!(settings.deload && Date.now() < settings.deload.end); }
  function checkDeloadEnd() {
    if (settings.deload && Date.now() >= settings.deload.end) {
      settings.blockStart = settings.deload.end;
      settings.deload = null;
      saveShared();
    }
  }
  const blockStart = () => settings.blockStart || firstLogged();
  function blockWeek() { const b = blockStart(); return b ? Math.floor((startOfDay(Date.now()) - startOfDay(b)) / (7 * DAY)) + 1 : 0; }
  function roundsInBlock() {
    const b = blockStart();
    if (!b) return 0;
    return Math.floor(log.sessions.filter((s) => s.start >= b).length / Math.max(1, sessions().length));
  }
  // Target sets after the ease-in and easy-week rules.
  function targetSets(ex) {
    if (deloadActive()) return Math.min(ex.sets, 2);
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
    if (noWeight || ws.every((w) => w === '')) return `${reps} ${t('repsWord')}`;
    if (ws.every((w) => w === ws[0])) return `${ws[0]} kg × ${reps}`;
    return sets.map((s) => `${fmtWeight(s.w) || 'BW'}×${s.r}`).join(', ');
  }
  const setsHTML = (sets, noWeight) => `<bdi class="num">${esc(fmtSets(sets, noWeight))}</bdi>`;
  function topSet(sets) {
    return sets.reduce((best, s) => {
      const w = s.w == null ? -Infinity : +s.w;
      if (!best || w > best.w || (w === best.w && +s.r > best.r)) return { w, r: +s.r };
      return best;
    }, null);
  }
  function progressionTip(ex, last) {
    if (!last || last.sets.length < START_ROWS) return '';
    const { max } = parseReps(ex.reps);
    if (!max || !last.sets.every((s) => +s.r >= max)) return '';
    return ex.noWeight ? t('tipBW', max) : t('tipW', max);
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
      const dash = k.replace(/\s+/g, '-');
      const key = MUSCLE_KEYS.includes(k) ? [k] : MUSCLE_KEYS.includes(dash) ? [dash] : MUSCLE_ALIAS[k] || MUSCLE_ALIAS[k.replace(/-/g, ' ')] || [];
      key.forEach((m) => { if (!out.includes(m)) out.push(m); });
    });
    return out;
  }

  // ---------- Overlays and the Android back button ----------
  // One history entry stands for "something is open", so Back closes it instead of leaving the app.
  const ov = { count: 0, ignore: 0 };
  function ovOpen() {
    ov.count++;
    if (!(history.state && history.state.ov)) history.pushState({ ov: 1 }, '');
  }
  function ovClose(fromPop) {
    ov.count = Math.max(0, ov.count - 1);
    if (fromPop) { if (ov.count > 0) history.pushState({ ov: 1 }, ''); return; }
    if (ov.count === 0) setTimeout(() => { if (ov.count === 0 && history.state && history.state.ov) { ov.ignore++; history.back(); } }, 60);
  }
  window.addEventListener('popstate', () => {
    if (ov.ignore) { ov.ignore--; return; }
    if ($('#viewer-root').innerHTML) closeViewer(true);
    else if ($('#sheet-root').innerHTML && !$('#sheet-root').classList.contains('closing')) closeSheet(true);
    else if ($('#cele-root').innerHTML) closeCele(true);
  });

  // ---------- Toast ----------
  let toastTimer, toastOutTimer;
  function toast(msg) {
    const root = $('#toast-root');
    root.innerHTML = `<div class="toast" role="status">${esc(msg)}</div>`;
    clearTimeout(toastTimer); clearTimeout(toastOutTimer);
    toastOutTimer = setTimeout(() => { const el = $('.toast', root); if (el) el.classList.add('out'); }, 2600);
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
    const names = [...primary, ...secondary].map(muscleName).join(comma());
    return `<svg viewBox="0 0 220 210" role="img" aria-label="${esc(t('musclesAria', names || t('noneSet')))}">${out.join('')}<text x="55" y="207">${t('front')}</text><text x="165" y="207">${t('back')}</text></svg>`;
  }
  function musclesLine(ex) {
    const p = (ex.primary || []).map(muscleName);
    const s = (ex.secondary || []).map(muscleName);
    if (!p.length && !s.length) return '';
    const low = (arr) => esc(L() ? arr.join(comma()) : arr.join(', ').toLowerCase());
    return `<p class="muscles">${p.length ? t('works', low(p)) : ''}${s.length ? t('also', low(s)) : ''}</p>`;
  }

  // ---------- Photos ----------
  const saveRatios = () => save(KEYS.ratios, RATIOS);
  function photoHTML(ex) {
    if (ex.photo && ex.photo.startsWith('custom:')) {
      const key = ex.photo.slice(7);
      return `<div class="photo" data-custom="${esc(key)}" data-act="zoom" data-title="${esc(exName(ex))}" role="button" aria-label="${esc(t('enlarge'))}"><div class="ph">${t('loadingPhoto')}</div></div>`;
    }
    const urls = photoUrls(ex.library);
    if (!urls) return `<div class="photo"><div class="ph">${t('noPhoto')}</div></div>`;
    const r = RATIOS[urls[0]];
    return `<div class="photo" data-act="zoom" data-srcs="${esc(urls.join('|'))}" data-title="${esc(exName(ex))}" role="button" aria-label="${esc(t('enlarge'))}"${r ? ` style="--ar:${r}"` : ''}>
      <img class="lib a" src="${urls[0]}" alt="${esc(exName(ex))}: ${esc(t('startPh'))}"><img class="lib b" src="${urls[1]}" alt="${esc(exName(ex))}: ${esc(t('endPh'))}">
      <span class="phase" aria-hidden="true"><span>${t('startPh')}</span><span>${t('endPh')}</span></span>
      <span class="hint">${ICON.expand}${t('tapEnlarge')}</span></div>`;
  }
  async function hydratePhotos(root = document) {
    for (const el of root.querySelectorAll('[data-custom]')) {
      const key = el.dataset.custom;
      try {
        let url = blobUrls.get(key);
        if (!url) { const blob = await idb.get(key); if (!blob) throw new Error('missing'); url = URL.createObjectURL(blob); blobUrls.set(key, url); }
        el.innerHTML = `<img src="${url}" alt="${esc(t('yourPhoto'))}">`;
      } catch (e) { el.innerHTML = `<div class="ph">${t('photoMissing')}</div>`; }
    }
  }
  // Size each photo box to its picture so tall photos aren't cut off.
  document.addEventListener('load', (e) => {
    const img = e.target;
    if (img.tagName !== 'IMG' || !img.classList.contains('a') || !img.naturalWidth) return;
    const box = img.closest('.photo');
    if (!box) return;
    const r = +Math.max(0.72, Math.min(1.8, img.naturalWidth / img.naturalHeight)).toFixed(3);
    const key = img.getAttribute('src');
    box.style.setProperty('--ar', r);
    if (RATIOS[key] !== r) { RATIOS[key] = r; saveRatios(); }
  }, true);
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (img.tagName === 'IMG' && img.classList.contains('lib')) {
      const box = img.closest('.photo');
      if (box && !box.dataset.failed) {
        box.dataset.failed = '1';
        box.removeAttribute('data-act');
        box.innerHTML = `<div class="ph">${t('photoNotSaved')}</div>`;
      }
    }
  }, true);

  function openViewer(srcs, title) {
    const root = $('#viewer-root');
    const fresh = !root.innerHTML;
    root.innerHTML = `<div class="viewer" role="dialog" aria-modal="true" aria-label="${esc(title)}" data-act="close-viewer">
      <div class="v-top"><p class="v-title">${esc(title)}</p><button class="v-close" data-act="close-viewer" aria-label="${esc(t('close'))}">${ICON.x}</button></div>
      <div class="v-stage mode-play" data-act="noop">${srcs.map((s, i) => `<img src="${s}" class="${i ? 'b' : 'a'}" alt="">`).join('')}</div>
      ${srcs.length > 1 ? `<div class="seg v-seg" style="--n:3" data-act="noop">
        <button data-act="v-mode" data-mode="play" aria-pressed="true">${t('play')}</button>
        <button data-act="v-mode" data-mode="start" aria-pressed="false">${t('startPh')}</button>
        <button data-act="v-mode" data-mode="end" aria-pressed="false">${t('endPh')}</button></div>` : ''}
    </div>`;
    if (fresh) ovOpen();
    setTimeout(() => { const b = $('#viewer-root .v-close'); if (b) b.focus({ preventScroll: true }); }, 30);
  }
  function closeViewer(fromPop) {
    const root = $('#viewer-root');
    const v = $('.viewer', root);
    if (!v) return;
    ovClose(fromPop);
    if (reduceMotion()) { root.innerHTML = ''; return; }
    v.classList.add('out');
    setTimeout(() => { if ($('.viewer.out', root)) root.innerHTML = ''; }, 200);
  }

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
  const newSet = () => ({ w: '', r: '', done: false });
  function exState(ex) {
    if (!current.ex[ex.id]) current.ex[ex.id] = { sets: Array.from({ length: Math.min(START_ROWS, targetSets(ex)) }, newSet), done: false };
    return current.ex[ex.id];
  }
  const goalOf = (ex, st) => Math.max(targetSets(ex), st.sets.length);
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
  function moveOnLater(fromId, nextOpen) {
    if (nextOpen === fromId) return;
    const token = current.start;
    setTimeout(() => {
      if (!current || current.start !== token || ui.open !== fromId || ui.tab !== 'today') return;
      ui.open = nextOpen; ui.justOpened = nextOpen;
      render();
      if (nextOpen) scrollToEx(nextOpen);
      else { const f = $('.finish-area'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }, reduceMotion() ? 0 : 650);
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
      else { toast(t('enterReps')); const inp = document.querySelector(`input[data-f="r"][data-ex="${exId}"][data-i="${i}"]`); if (inp) inp.focus(); return; }
    }
    if (set.w === '' && ph.w !== '' && !ex.noWeight) set.w = ph.w;
    set.done = true;
    unlockAudio();
    if (navigator.vibrate) navigator.vibrate(25);
    const allRows = st.sets.every((x) => x.done);
    if (allRows && st.sets.length >= targetSets(ex)) st.done = true;
    const isA = ex.supersetWithNext && s.exercises[idx + 1];
    const isB = idx > 0 && s.exercises[idx - 1].supersetWithNext;
    let nextOpen = exId;
    if (isA) {
      const partner = s.exercises[idx + 1];
      if (!exState(partner).done) { nextOpen = partner.id; toast(t('ssNow', exName(partner))); }
      else if (st.done) nextOpen = nextUndone(s, idx);
    } else {
      startTimer(ex.rest, exName(ex));
      if (isB) {
        const partner = s.exercises[idx - 1];
        if (!exState(partner).done) nextOpen = partner.id;
        else if (st.done) nextOpen = nextUndone(s, idx);
      } else if (st.done) nextOpen = nextUndone(s, idx);
    }
    saveCurrent();
    ui.open = exId;
    ui.flash = `${exId}:${i}`;
    render();
    moveOnLater(exId, nextOpen);
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
      if (done.length) entries.push({ exId: ex.id, name: ex.name, reps: ex.reps, targetSets: targetSets(ex), noWeight: !!ex.noWeight, sets: done });
    });
    if (!entries.length) {
      if (confirm(t('noSetsDiscard'))) discardWorkout(true);
      return;
    }
    const undone = (s ? s.exercises : []).filter((ex) => !(current.ex[ex.id] || {}).done).length;
    if (undone && !confirm(t('notFinished', undone))) return;
    const done = { id: `w${current.start}`, sessionId: current.sessionId, name: s ? s.name : 'Workout', color: s ? s.color : 'red', start: current.start, end: Date.now(), entries, ...(deloadActive() ? { easy: true } : {}) };
    log.sessions.push(done);
    saveLog();
    current = null; saveCurrent();
    stopTimer(); wakeOff();
    const nx = sessionById(nextSessionId());
    ui.tab = 'today';
    render();
    window.scrollTo(0, 0);
    if (navigator.vibrate) navigator.vibrate([40, 70, 40, 70, 120]);
    celebrate(done, nx ? sName(nx) : '');
  }
  function discardWorkout(skipConfirm) {
    if (!skipConfirm && !confirm(t('discardQ'))) return;
    current = null; saveCurrent(); stopTimer(); wakeOff(); ui.viewAnim = true; ui.intro = true; render(); window.scrollTo(0, 0);
  }

  // ---------- Rest timer, sound, wake lock ----------
  let timer = null, audio = null;
  function unlockAudio() {
    try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch (e) { audio = null; }
  }
  function beep() {
    if (!audio) return;
    [0, 0.25, 0.5].forEach((d) => {
      const o = audio.createOscillator(), g = audio.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(audio.destination);
      const at = audio.currentTime + d;
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
    $('.clock', el).textContent = timer.over ? t('go') : fmtClock(left);
    $('.lbl b', el).textContent = timer.over ? t('restOver') : t('rest');
    $('.lbl-sub', el).textContent = timer.over ? t('nextSet') : t('afterX', timer.label);
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
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    wakeOn(); tick();
    if (syncReady() && Date.now() - (settings.sync.lastSync || 0) > 60000) scheduleSync(300);
  });

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
      const slot = L() ? n - 1 - i : i; // Arabic reads right to left, so the first session sits on the right.
      const cx = left + gap * (slot + 0.5), sel = s.id === selId, h = sel ? 104 : 80, p = plateOf(s);
      const x0 = cx - pw / 2;
      return `<g class="pl-in" style="--d:${i}"><g class="plate${sel ? ' sel' : ''}${ui.popPlate === s.id ? ' pop' : ''}" data-plate="${p}" data-act="pick" data-session="${esc(s.id)}" role="button" tabindex="0" aria-label="${esc(sName(s))}">
        <rect x="${x0.toFixed(1)}" y="${cy - h / 2}" width="${pw.toFixed(1)}" height="${h}" rx="8" style="fill:url(#pg-${p})"/>
        <rect x="${(x0 + 4).toFixed(1)}" y="${cy - h / 2 + 7}" width="3" height="${h - 14}" rx="1.5" fill="rgba(255,255,255,.3)"/>
        <rect x="${(cx - 5).toFixed(1)}" y="${cy - h / 2 + 12}" width="10" height="${h - 24}" rx="5" fill="rgba(0,0,0,.22)"/>
        <text class="plate-label" x="${cx.toFixed(1)}" y="${cy + 74}">${esc(sName(s))}</text></g></g>`;
    }).join('');
    return `<svg class="barbell${ui.intro ? ' intro' : ''}" viewBox="0 0 ${W} ${H}" role="group">
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
      dots.push(`<span class="day${w ? ' on' : ''}${k === 0 ? ' today' : ''}"${w ? ` data-plate="${plateOf(w)}"` : ''} style="--d:${13 - k}" title="${esc(fmtDate(d.getTime()) + (w ? ` ${workoutName(w)}` : ''))}"></span>`);
    }
    const lastTxt = last ? ` <span>${esc(t('lastShort', workoutName(last), relDay(last.start)))}</span>` : '';
    return `<div class="streak${ui.intro ? ' intro' : ''}">
      <p class="streak-txt">${esc(t('streakHead', count))}${lastTxt}</p>
      <div class="days" aria-hidden="true">${dots.join('')}</div>
      <div class="days-lbl" aria-hidden="true"><span>${t('twoWeeksAgo')}</span><span>${t('todayLbl')}</span></div>
      ${syncReady() && settings.sync.lastSync ? `<p class="sync-line">${ICON.sync}${esc(t('syncedAgo', t('relTime', Math.floor((Date.now() - settings.sync.lastSync) / 60000))))}</p>` : ''}
    </div>`;
  }

  // ---------- Block progress and exercise status ----------
  function scoreOf(sets, noWeight) {
    if (noWeight) return [0, Math.max(0, ...sets.map((x) => +x.r || 0))];
    const ws = sets.filter((x) => x.w != null && x.w !== '');
    if (!ws.length) return [-Infinity, Math.max(0, ...sets.map((x) => +x.r || 0))];
    const w = Math.max(...ws.map((x) => +x.w));
    return [w, Math.max(...ws.filter((x) => +x.w === w).map((x) => +x.r || 0))];
  }
  const better = (a, b) => a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]);
  // up: the latest time was a new best. stuck: no new best in the last 3 times. Easy-week sessions are ignored.
  function statusOf(rows, noWeight) {
    if (!rows.length) return 'none';
    if (rows.length === 1) return 'new';
    let bi = 0;
    rows.forEach((r, i) => { if (better(scoreOf(r.sets, noWeight), scoreOf(rows[bi].sets, noWeight))) bi = i; });
    const since = rows.length - 1 - bi;
    return since === 0 ? 'up' : since >= 3 ? 'stuck' : 'flat';
  }
  function exStatuses() {
    const out = new Map();
    exerciseHistory().forEach((v, id) => out.set(id, statusOf(v.rows.filter((r) => !r.easy), v.noWeight)));
    return out;
  }
  function sessionNeedsUpdate(s, status) {
    const st = s.exercises.map((ex) => status.get(ex.id) || 'none');
    const judged = st.filter((x) => x === 'up' || x === 'flat' || x === 'stuck').length;
    const stuck = st.filter((x) => x === 'stuck').length;
    return stuck >= 2 && stuck * 2 >= judged;
  }
  const ST_ICON = { up: 'trend', flat: 'flat', stuck: 'stuck', new: 'dot', none: 'dot' };
  function blockCard(due) {
    const total = settings.blockWeeks || 8;
    const status = exStatuses();
    const ids = [...new Set(sessions().flatMap((s) => s.exercises.map((e) => e.id)))];
    const counts = { up: 0, flat: 0, stuck: 0, new: 0 };
    ids.forEach((id) => { const st = status.get(id); if (st && counts[st] !== undefined) counts[st]++; });
    const fillSeg = (f) => `<span class="bc-seg"><i style="width:${ui.intro ? 0 : (f * 100).toFixed(1)}%" data-prop="width" data-to="${(f * 100).toFixed(1)}%"></i></span>`;
    let right = '', bar = '', txt = '', actions = '';
    if (deloadActive()) {
      const left = settings.deload.end - Date.now();
      right = `<span class="bc-week">${ICON.leaf}</span>`;
      bar = `<div class="bc-bar easy">${fillSeg(Math.min(1, Math.max(0, 1 - left / (7 * DAY))))}</div>`;
      txt = t('easyLeft', Math.max(1, Math.ceil(left / DAY)));
      actions = `<button class="btn sm primary" data-act="coach-sheet" data-preset="newBlock">${ICON.sparkle}${t('planNext')}</button>`;
    } else {
      const b = blockStart();
      const dayIn = b ? Math.max(0, (startOfDay(Date.now()) - startOfDay(b)) / DAY + 1) : 0;
      const wk = blockWeek();
      right = wk ? `<span class="bc-week">${esc(t('weekOf', Math.min(wk, total), total))}</span>` : '';
      bar = `<div class="bc-bar">${Array.from({ length: total }, (_, i) => fillSeg(Math.min(1, Math.max(0, dayIn / 7 - i)))).join('')}<span class="bc-leaf${due ? ' due' : ''}" title="${esc(t('startEasy'))}">${ICON.leaf}</span></div>`;
      if (!wk) txt = t('notStarted');
      else if (due) {
        txt = t('blockDone');
        actions = `<button class="btn sm primary" data-act="deload-start">${ICON.leaf}${t('startEasy')}</button><button class="btn sm soft" data-act="coach-sheet" data-preset="newBlock">${ICON.sparkle}${t('planNext')}</button>`;
      } else {
        const weeksLeft = Math.ceil((total * 7 - dayIn + 1) / 7);
        txt = weeksLeft <= 1 ? t('lastWeek') : t('weeksLeft', weeksLeft);
      }
    }
    const statKeys = ['up', 'flat', 'stuck', 'new'].filter((k) => counts[k]);
    const stats = statKeys.length ? `<button class="bc-stats" data-act="progress-sheet">${statKeys.map((k) => `<span class="pill ${k}">${ICON[ST_ICON[k]]}${esc(t('stCount')[k](counts[k]))}</span>`).join('')}<span class="bc-more">${t('seeDetails')}${ICON.chev}</span></button>` : '';
    return `<section class="block-card${due ? ' due' : ''}${ui.intro ? ' intro' : ''}">
      <div class="bc-top"><b>${t('blockCardT')}</b>${right}</div>
      ${bar}
      <p class="bc-txt">${esc(txt)}</p>
      ${actions ? `<div class="row wrap bc-actions">${actions}</div>` : ''}
      ${stats}
    </section>`;
  }
  function topLabel(sets, noWeight) {
    const [w, r] = scoreOf(sets, noWeight);
    return noWeight || !isFinite(w) ? `${r}` : `${fmtWeight(w)}×${r}`;
  }
  function sheetProgress() {
    const status = exStatuses();
    const hist = exerciseHistory();
    const secs = sessions().map((s) => {
      const rows = s.exercises.map((ex) => {
        const st = status.get(ex.id) || 'none';
        const v = hist.get(ex.id);
        const last = v ? v.rows.filter((r) => !r.easy).slice(-4).map((r) => topLabel(r.sets, v.noWeight)).join(' → ') : '';
        return `<li class="pg-row"><span class="grow"><span class="pg-name">${esc(exName(ex))}</span>${last ? `<bdi dir="ltr" class="pg-last num">${esc(last)}</bdi>` : ''}</span><span class="pill ${st}">${ICON[ST_ICON[st]]}${esc(t('st')[st])}</span></li>`;
      }).join('');
      return `<section class="pg-sec" data-plate="${plateOf(s)}"><div class="pg-head"><span class="pchip" aria-hidden="true"></span><b class="grow">${esc(sName(s))}</b>${sessionNeedsUpdate(s, status) ? `<span class="pill stuck">${t('needsUpdate')}</span>` : ''}</div><ul class="pg-list">${rows}</ul></section>`;
    }).join('');
    openSheet(`<h3>${t('progressT')}</h3><p class="small muted">${t('progressHelp')}</p>${secs}
      <p class="small" style="margin-top:14px">${t('whenUpdate')}</p>
      <button class="btn primary wide" data-act="coach-sheet" data-preset="stuck">${ICON.sparkle}${t('askStuck')}</button>
      <button class="btn ghost wide" data-act="close-sheet">${t('doneBtn')}</button>`);
  }

  function thumbHTML(ex) {
    if (ex.photo && ex.photo.startsWith('custom:')) return `<span class="thumb" data-custom="${esc(ex.photo.slice(7))}"></span>`;
    const urls = photoUrls(ex.library);
    return urls ? `<img class="thumb" src="${urls[0]}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : '<span class="thumb"></span>';
  }
  const setsRange = (ex) => { const tg = targetSets(ex); return tg > START_ROWS ? `${START_ROWS}–${tg}` : `${tg}`; };

  function viewToday() {
    if (current) return viewWorkout();
    const list = sessions();
    if (!list.length) return `<div class="empty">${ICON.program}<h2>${t('noSessions')}</h2><p>${t('noSessionsText')}</p><button class="btn primary" data-act="tab" data-tab="program">${t('openProgram')}</button></div>`;
    const sid = ui.override && sessionById(ui.override) ? ui.override : nextSessionId();
    const s = sessionById(sid);
    document.body.dataset.plate = plateOf(s);
    const last = lastLoggedSession();
    let notes = '';
    if (deloadActive()) {
      notes += `<div class="note">${ICON.leaf}<span>${esc(t('easyActive', fmtDate(settings.deload.end)))}<br><button class="linkish" data-act="deload-end">${t('endEasy')}</button></span></div>`;
    }
    const blockDue = !deloadActive() && blockWeek() > (settings.blockWeeks || 8);
    const bc = blockCard(blockDue);
    if (last && daysAgo(last.start) >= 7) notes += `<div class="note">${ICON.clock}<span>${esc(t('gapNote', daysAgo(last.start)))}</span></div>`;
    if (!deloadActive() && rampActive() && s.exercises.some((e) => e.sets >= 4)) {
      notes += `<div class="note">${ICON.trend}<span>${esc(t('rampNote', (program.rampIn && program.rampIn.weeks) || 2, (program.rampIn && program.rampIn.maxSets) || 3))}</span></div>`;
    }
    const items = s.exercises.map((ex, i) => {
      const pair = ex.supersetWithNext && s.exercises[i + 1] ? `<span class="pair-mark">${ICON.link}${esc(t('supersetWith', exName(s.exercises[i + 1])))}</span>` : '';
      const urls = photoUrls(ex.library);
      const zoom = urls ? ` data-act="zoom" data-srcs="${esc(urls.join('|'))}" data-title="${esc(exName(ex))}" role="button"` : '';
      return `<li style="--d:${i}"${zoom}>${thumbHTML(ex)}<span class="pv-txt"><span class="pv-name">${esc(exName(ex))}</span>${pair}</span><span class="t"><bdi>${setsRange(ex)} × ${esc(ex.reps)}</bdi></span></li>`;
    }).join('');
    const heroCls = ui.intro ? ' intro' : ui.popPlate ? ' swap' : '';
    return `
      <section class="hero${heroCls}">
        <div class="bar-wrap">${barbell(list, sid)}</div>
        <p class="kicker">${ui.override ? t('yourPick') : t('nextUp')}</p>
        <h1 class="hero-title">${esc(sName(s))}</h1>
        ${sFocus(s) ? `<p class="hero-focus">${esc(sFocus(s))}</p>` : ''}
      </section>
      ${notes}
      ${blockDue ? bc : ''}
      <button class="btn primary big" data-act="start" data-session="${esc(s.id)}">${esc(t('startX', sName(s)))}</button>
      ${ui.override
        ? `<button class="btn ghost wide" data-act="clear-override">${esc(t('goBackTo', sName(sessionById(nextSessionId()))))}</button>`
        : `<button class="btn ghost wide" data-act="pick-sheet">${t('differentSession')}</button>`}
      ${blockDue ? '' : bc}
      ${streak(last)}
      <h3 class="sub">${esc(t('nExercises', s.exercises.length))}</h3>
      <ul class="preview-list${ui.intro ? ' intro' : ''}">${items}</ul>`;
  }

  function viewWorkout() {
    const s = sessionById(current.sessionId);
    if (!s) return `<div class="empty"><p>${t('sessionRemoved')}</p><button class="btn" data-act="discard">${t('discardWorkout')}</button></div>`;
    document.body.dataset.plate = plateOf(s);
    if (ui.open === null) ui.open = nextUndone(s, -1);
    const exs = s.exercises;
    let total = 0, doneAll = 0;
    const segs = [];
    const items = exs.map((ex, idx) => {
      const st = exState(ex);
      const goal = goalOf(ex, st);
      const doneCount = st.sets.filter((x) => x.done).length;
      total += goal; doneAll += doneCount;
      const frac = st.done ? 1 : Math.min(1, doneCount / goal);
      const from = prevFrac[ex.id] == null ? frac : prevFrac[ex.id];
      pendingFrac[ex.id] = frac;
      segs.push(`<span class="pseg"><i style="width:${(from * 100).toFixed(1)}%" data-prop="width" data-to="${(frac * 100).toFixed(1)}%"></i></span>`);
      const pairedA = ex.supersetWithNext && exs[idx + 1];
      const pairedB = idx > 0 && exs[idx - 1].supersetWithNext;
      const open = ui.open === ex.id;
      const cls = ['ex', open ? 'open' : '', st.done ? 'done' : '', open && ui.justOpened === ex.id ? 'opening' : ''].filter(Boolean).join(' ');
      const restText = pairedA ? t('noRestNext') : t('restX', fmtRest(ex.rest));
      const ring = `<svg class="ring" viewBox="0 0 36 36" aria-hidden="true"><circle class="trk" cx="18" cy="18" r="15"/><circle class="val" cx="18" cy="18" r="15" style="stroke-dashoffset:${(RING_C * (1 - from)).toFixed(2)}" data-prop="stroke-dashoffset" data-to="${(RING_C * (1 - frac)).toFixed(2)}"/></svg>`;
      const link = pairedA ? `<li class="ss-link" aria-hidden="true"><span>${ICON.link}${t('superset')}</span></li>` : '';
      return `<li class="${cls}" id="ex-${esc(ex.id)}">
        <button class="ex-head" data-act="toggle" data-ex="${esc(ex.id)}" aria-expanded="${open}">
          <span class="badge">${ring}<span class="n">${st.done ? ICON.check : idx + 1}</span></span>
          <span class="txt"><span class="name">${esc(exName(ex))}</span><span class="meta">${esc(t('setsLabel', Math.min(START_ROWS, targetSets(ex)), targetSets(ex)))} × <bdi>${esc(ex.reps)}</bdi>${comma()}${esc(restText)}</span></span>
          <span class="count"><bdi>${doneCount}/${goal}</bdi></span>
          <span class="chev">${ICON.chev}</span>
        </button>
        ${open ? exBody(ex, st, idx, s, pairedA, pairedB) : ''}
      </li>${link}`;
    }).join('');
    const allDone = exs.every((ex) => (current.ex[ex.id] || {}).done);
    return `
      <header class="wk-top">
        <div class="wk-row"><h2>${esc(sName(s))}</h2><span class="elapsed" id="elapsed">${fmtClock(Date.now() - current.start)}</span><span class="wk-count">${esc(t('doneOfSets', doneAll, total))}</span></div>
        <div class="psegs" aria-hidden="true">${segs.join('')}</div>
      </header>
      <ul class="exlist">${items}</ul>
      <div class="finish-area">
        <button class="btn ${allDone ? 'primary' : ''} big" data-act="finish">${t('finishWorkout')}</button>
        <button class="btn ghost danger wide" data-act="discard">${t('discardWorkout')}</button>
      </div>`;
  }

  function exBody(ex, st, idx, s, pairedA, pairedB) {
    const last = lastEntry(ex.id);
    const tip = progressionTip(ex, last);
    const target = targetSets(ex);
    const hasRm = st.sets.some((set, i) => i >= START_ROWS && !set.done);
    const rows = st.sets.map((set, i) => {
      const ph = placeholders(ex, i);
      const removable = i >= START_ROWS && !set.done;
      const just = ui.flash === `${ex.id}:${i}`;
      return `<div class="srow${set.done ? ' done' : ''}${just ? ' just' : ''}">
        <span class="sn">${i + 1}</span>
        ${ex.noWeight ? '' : `<input type="number" step="any" data-f="w" data-ex="${esc(ex.id)}" data-i="${i}" value="${esc(set.w)}" placeholder="${esc(ph.w)}" aria-label="${esc(t('setW', i + 1))}">`}
        <input type="number" inputmode="numeric" data-f="r" data-ex="${esc(ex.id)}" data-i="${i}" value="${esc(set.r)}" placeholder="${esc(ph.r)}" aria-label="${esc(t('setR', i + 1))}">
        <button class="chk" data-act="check" data-ex="${esc(ex.id)}" data-i="${i}" aria-pressed="${set.done}" aria-label="${esc(t('setDone', i + 1))}">${ICON.tick}</button>
        ${hasRm ? (removable ? `<button class="srm" data-act="rmset" data-ex="${esc(ex.id)}" data-i="${i}" aria-label="${esc(t('removeSetN', i + 1))}">${ICON.x}</button>` : '<span></span>') : ''}
      </div>`;
    }).join('');
    const doneCount = st.sets.filter((x) => x.done).length;
    const waitingMore = !st.done && st.sets.length && st.sets.every((x) => x.done) && st.sets.length < target;
    const nextN = st.sets.length + 1;
    const pairNote = pairedA ? `<div class="note">${ICON.link}<span>${esc(t('ssNoteA', exName(s.exercises[idx + 1])))}</span></div>`
      : pairedB ? `<div class="note">${ICON.link}<span>${esc(t('ssNoteB', exName(s.exercises[idx - 1]), fmtRest(ex.rest)))}</span></div>` : '';
    const warm = idx === 0 && !st.sets.some((x) => x.done) ? `<div class="note">${ICON.flame}<span>${esc(t('warmUp'))}</span></div>` : '';
    const steps = exSteps(ex);
    const howto = steps.length ? `<details class="howto"${last ? '' : ' open'}><summary>${t('howTo')}</summary><ol>${steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></details>` : '';
    const lastTxt = last ? `${esc(t('lastTime', relDay(last.date)))} ${setsHTML(last.sets, ex.noWeight)}` : esc(ex.noWeight ? t('firstTime') : t('firstTimeW'));
    const photoNote = exField(ex, 'photoNote');
    const weightHint = exField(ex, 'weightHint');
    const actions = waitingMore
      ? `<div class="more-card"><p><b>${esc(t('moreDone', doneCount))}</b> ${esc(t('moreQ', nextN, target))}</p>
          <div class="row wrap"><button class="btn primary sm" data-act="addset" data-ex="${esc(ex.id)}">${ICON.plus}${esc(t('doSetN', nextN))}</button>
          <button class="btn sm soft" data-act="exdone" data-ex="${esc(ex.id)}">${ICON.check}${t('doneEx')}</button></div></div>`
      : `<div class="ex-actions">
          <button class="btn sm soft" data-act="addset" data-ex="${esc(ex.id)}">${ICON.plus}${esc(t('addSetN', nextN))}</button>
          ${st.done
            ? `<button class="btn sm soft" data-act="exundo" data-ex="${esc(ex.id)}">${ICON.undo}${t('undoDone')}</button>`
            : `<button class="btn sm soft" data-act="exdone" data-ex="${esc(ex.id)}">${ICON.check}${t('doneEx')}</button>`}
        </div>`;
    return `<div class="ex-body">
      ${photoHTML(ex)}
      ${photoNote ? `<p class="photo-note">${esc(photoNote)}</p>` : ''}
      ${L() && exName(ex) !== ex.name ? `<p class="alt-name">${t('inEnglish')} <bdi dir="ltr">${esc(ex.name)}</bdi></p>` : ''}
      <div class="map-row">
        <div class="body-map">${bodyMap(ex.primary, ex.secondary)}</div>
        <div>${musclesLine(ex)}${exCue(ex) ? `<p class="cue">${esc(exCue(ex))}</p>` : ''}</div>
      </div>
      ${warm}${pairNote}
      <p class="last">${lastTxt}</p>
      ${tip ? `<div class="progress-tip">${ICON.trend}<span>${esc(tip)}</span></div>` : ''}
      <div class="sets${ex.noWeight ? ' nw' : ''}${hasRm ? ' has-rm' : ''}">
        <div class="sets-h"><span>${t('setH')}</span>${ex.noWeight ? '' : `<span>${t('kgH')}</span>`}<span>${t('repsH')}</span><span></span>${hasRm ? '<span></span>' : ''}</div>
        ${rows}
      </div>
      ${weightHint ? `<p class="small muted">${esc(weightHint)}</p>` : ''}
      ${actions}
      ${howto}
    </div>`;
  }

  function viewHistory() {
    const n = sessionById(nextSessionId());
    document.body.dataset.plate = plateOf(n);
    const seg = `<div class="seg" style="--n:2"><button data-act="hist-mode" data-mode="sessions" aria-pressed="${ui.histMode === 'sessions'}">${t('workoutsTab')}</button><button data-act="hist-mode" data-mode="exercises" aria-pressed="${ui.histMode === 'exercises'}">${t('exercisesTab')}</button></div>`;
    const title = `<h2 class="page-title">${t('history')}</h2>`;
    if (!log.sessions.length) return `${title}${seg}<div class="empty">${ICON.history}<p>${t('histEmpty')}</p></div>`;
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
              <span class="grow"><b>${esc(workoutName(w))}</b><span class="small muted block">${esc(t('histMeta', fmtDate(w.start), mins, sets, vol ? Math.round(vol).toLocaleString('en') : 0))}</span></span>
              <span class="chev">${ICON.chev}</span>
            </button>
            ${open ? `<div class="hist-detail">${w.entries.map((e) => `<div class="hx"><b>${esc(entryName(e))}</b><br>${setsHTML(e.sets, e.noWeight)}</div>`).join('')}
              <div class="row wrap"><button class="btn sm soft" data-act="date-sheet" data-id="${esc(w.id)}">${ICON.clock}${t('changeDate')}</button>
              <button class="btn sm soft danger" data-act="hist-del" data-id="${esc(w.id)}">${t('deleteWorkout')}</button></div></div>` : ''}
          </div>
        </div>`;
      }).join('');
      return `${title}${seg}<div class="tl${ui.intro ? ' intro' : ''}">${items}</div>`;
    }
    const byEx = exerciseHistory();
    const items = [...byEx.entries()].sort((a, b) => a[1].label.localeCompare(b[1].label, locale())).map(([id, v], k) => {
      const open = ui.histOpen === `x:${id}`;
      const latest = v.rows[v.rows.length - 1];
      const vals = v.rows.map((r) => (v.noWeight ? r.sets.reduce((a, s) => a + (+s.r || 0), 0) : topSet(r.sets).w)).filter((x) => isFinite(x));
      const mini = vals.length > 1 ? spark(vals, { w: 72, h: 28, mini: true }) : '';
      const detail = open ? `<div class="hist-detail">${vals.length > 1 ? spark(vals, { draw: true }) : ''}<p class="small muted">${v.noWeight ? t('lineReps') : t('lineTop')}</p>
        ${[...v.rows].reverse().slice(0, 12).map((r) => `<div class="hx"><span class="small muted">${esc(fmtDate(r.date))}</span><br>${setsHTML(r.sets, v.noWeight)}</div>`).join('')}</div>` : '';
      return `<div class="hx-item" style="--d:${k}"><button data-act="hist-open" data-id="x:${esc(id)}" aria-expanded="${open}">
        <span class="grow"><b>${esc(v.label)}</b><span class="small muted block">${esc(fmtDate(latest.date))}: ${setsHTML(latest.sets, v.noWeight)}</span></span>${mini}<span class="chev">${ICON.chev}</span></button>${detail}</div>`;
    }).join('');
    return `${title}${seg}<div class="hx-list${ui.intro ? ' intro' : ''}">${items}</div>`;
  }
  function exerciseHistory() {
    const byEx = new Map();
    [...log.sessions].sort((a, b) => a.start - b.start).forEach((w) => w.entries.forEach((e) => {
      if (!byEx.has(e.exId)) byEx.set(e.exId, { name: e.name, noWeight: e.noWeight, rows: [] });
      const v = byEx.get(e.exId); v.name = e.name; v.rows.push({ date: w.start, sets: e.sets, easy: !!w.easy });
    }));
    byEx.forEach((v, id) => { const ex = exById(id); v.label = ex ? exName(ex) : v.name; });
    return byEx;
  }
  function spark(vals, o = {}) {
    const W = o.w || 300, H = o.h || 76, pad = o.mini ? 3 : 8;
    const min = Math.min(...vals), max = Math.max(...vals), span = max - min || 1;
    const pts = vals.map((v, i) => [pad + (i * (W - 2 * pad)) / (vals.length - 1), max === min ? H / 2 : H - pad - ((v - min) / span) * (H - 2 * pad)]);
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('');
    const lp = pts[pts.length - 1];
    const area = `${d}L${lp[0].toFixed(1)} ${H}L${pts[0][0].toFixed(1)} ${H}Z`;
    const label = o.mini ? 'aria-hidden="true"' : `role="img" aria-label="${esc(t('trendAria', fmtWeight(vals[0]), fmtWeight(vals[vals.length - 1])))}"`;
    return `<svg class="spark${o.mini ? ' mini' : ''}${o.draw ? ' draw' : ''}" viewBox="0 0 ${W} ${H}" ${label}><path class="area" d="${area}"/><path class="line" pathLength="1" d="${d}"/>${o.mini ? '' : `<circle cx="${lp[0].toFixed(1)}" cy="${lp[1].toFixed(1)}" r="5"/>`}</svg>`;
  }

  function viewProgram() {
    const n = sessionById(nextSessionId());
    document.body.dataset.plate = plateOf(n);
    const secs = sessions().map((s) => {
      const exs = s.exercises.map((ex, i) => {
        const partner = ex.supersetWithNext && s.exercises[i + 1];
        const meta = `${ex.sets} × <bdi>${esc(ex.reps)}</bdi>${comma()}${esc(partner ? t('ssWithLower', exName(partner)) : t('restX', fmtRest(ex.rest)))}${!ex.library && !ex.photo ? esc(comma() + t('noPhotoShort')) : ''}`;
        return `<div class="prog-ex">
          <div class="info" data-act="edit-ex" data-session="${esc(s.id)}" data-ex="${esc(ex.id)}" role="button" tabindex="0">
            <div class="nm">${esc(exName(ex))}</div><div class="mt">${meta}</div></div>
          <button class="icon-btn" data-act="move-ex" data-dir="-1" data-session="${esc(s.id)}" data-ex="${esc(ex.id)}" ${i === 0 ? 'disabled' : ''} aria-label="${esc(t('moveUp', exName(ex)))}">${ICON.up}</button>
          <button class="icon-btn" data-act="move-ex" data-dir="1" data-session="${esc(s.id)}" data-ex="${esc(ex.id)}" ${i === s.exercises.length - 1 ? 'disabled' : ''} aria-label="${esc(t('moveDown', exName(ex)))}">${ICON.down}</button>
          <button class="icon-btn" data-act="edit-ex" data-session="${esc(s.id)}" data-ex="${esc(ex.id)}" aria-label="${esc(t('editX', exName(ex)))}">${ICON.edit}</button>
        </div>`;
      }).join('');
      return `<section class="prog-session" data-plate="${plateOf(s)}">
        <div class="prog-session-head"><span class="pchip" aria-hidden="true"></span><div class="grow"><h3>${esc(sName(s))}</h3><div class="small muted">${esc(sFocus(s))}</div></div>
          <button class="btn sm soft" data-act="edit-session" data-session="${esc(s.id)}">${t('edit')}</button></div>
        ${exs || `<p class="muted" style="padding:12px 0 0">${t('noExercises')}</p>`}
        <button class="btn sm soft" style="margin-top:10px" data-act="add-ex" data-session="${esc(s.id)}">${ICON.plus}${t('addExercise')}</button>
      </section>`;
    }).join('');
    return `<h2 class="page-title">${t('program')}</h2>
      <p class="muted">${esc(t('programDesc', program.name || ''))}</p>
      <div class="panel coach-panel">
        <h3>${ICON.sparkle}${t('coachT')}</h3>
        <p class="small">${t('coachText')}</p>
        <div class="row wrap"><button class="btn primary" data-act="coach-sheet">${ICON.sparkle}${t('askCoach')}</button><button class="btn" data-act="import-sheet">${t('importReply')}</button></div>
      </div>
      ${secs}
      <button class="btn wide" style="margin-top:18px" data-act="edit-session">${ICON.plus}${t('addSession')}</button>`;
  }

  function viewSettings() {
    const n = sessionById(nextSessionId());
    document.body.dataset.plate = plateOf(n);
    const sw = (key, on, title, text) => `<div class="opt-row"><div class="grow"><b>${title}</b><span class="small muted">${text}</span></div>
      <button class="switch" role="switch" aria-checked="${on}" data-act="toggle-setting" data-key="${key}" aria-label="${esc(title)}"></button></div>`;
    const segRow = (title, help, act, attr, opts, cur) => `<div class="opt-row stack"><div class="grow"><b>${title}</b>${help ? `<span class="small muted">${help}</span>` : ''}</div>
      <div class="seg" style="--n:${opts.length}">${opts.map(([k, l]) => `<button data-act="${act}" data-${attr}="${k}" aria-pressed="${String(cur) === String(k)}">${l}</button>`).join('')}</div></div>`;
    const p = settings.profile;
    return `<h2 class="page-title">${t('settings')}</h2>
      ${segRow(t('language'), '', 'lang', 'lang-pick', [['en', 'English'], ['ar', 'العربية']], settings.lang)}
      ${segRow(t('theme'), t('themeHelp'), 'theme', 'theme-pick', [['dark', t('dark')], ['light', t('light')], ['auto', t('phone')]], settings.theme || 'dark')}
      <div class="opt-row"><div class="grow"><b>${t('profileT')}</b><span class="small muted">${esc(t('profileSum', p.weight, p.height))}</span></div>
        <button class="btn sm soft" data-act="profile-sheet">${ICON.user}${t('edit')}</button></div>
      ${sw('wakeLock', !!settings.wakeLock, t('keepOn'), t('keepOnHelp'))}
      ${sw('rampIn', !!(program.rampIn && program.rampIn.enabled), t('easeIn'), t('easeHelp'))}
      ${segRow(t('blockT'), esc(t('blockHelp', settings.blockWeeks || 8)), 'block-weeks', 'weeks', [[6, '6'], [8, '8'], [10, '10'], [12, '12']], settings.blockWeeks || 8)}
      <div class="opt-row"><div class="grow"><span class="small muted">${deloadActive() ? esc(t('easyActive', fmtDate(settings.deload.end))) : ''}</span></div>
        ${deloadActive() ? `<button class="btn sm soft" data-act="deload-end">${t('endEasy')}</button>` : `<button class="btn sm soft" data-act="deload-start">${ICON.leaf}${t('easyNow')}</button>`}</div>
      ${syncBox()}
      <div class="opt-row"><div class="grow"><b>${t('photosT')}</b><span class="small muted" id="photo-status">${t('checking')}</span></div>
        <button class="btn sm soft" data-act="prefetch">${t('downloadNow')}</button></div>
      <div class="opt-row stack"><div class="grow"><b>${t('backupT')}</b><span class="small muted">${t('backupHelp')}</span></div>
        <div class="row wrap"><button class="btn sm primary" data-act="backup">${ICON.share}${t('backupBtn')}</button><button class="btn sm soft" data-act="backup-dl">${t('saveToPhone')}</button></div></div>
      <div class="opt-row"><div class="grow"><b>${t('restoreT')}</b><span class="small muted">${t('restoreHelp')}</span></div>
        <label class="btn sm soft">${t('restoreBtn')}<input type="file" accept="application/json,.json,text/plain,.txt" data-act="restore" class="hidden"></label></div>
      <div class="opt-row"><div class="grow"><b>${t('resetT')}</b><span class="small muted">${t('resetHelp')}</span></div>
        <button class="btn sm soft danger" data-act="reset-program">${t('resetBtn')}</button></div>
      <div class="opt-row"><div class="grow"><b>${t('clearT')}</b><span class="small muted">${t('clearHelp')}</span></div>
        <button class="btn sm soft danger" data-act="clear-history">${t('clearBtn')}</button></div>
      <p class="small muted" style="margin-top:20px">${t('credits')}</p>`;
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
        if (tot > best) prs.push({ name: entryName(e), val: t('prReps', tot) });
        return;
      }
      const top = topSet(e.sets);
      if (!top || !isFinite(top.w)) return;
      const prevSets = prev.flatMap((q) => q.sets).filter((x) => x.w != null);
      if (!prevSets.length) return;
      const bestW = Math.max(...prevSets.map((x) => x.w));
      const bestR = Math.max(0, ...prevSets.filter((x) => x.w === top.w).map((x) => x.r));
      if (top.w > bestW || (top.w === bestW && top.r > bestR)) prs.push({ name: entryName(e), val: `${fmtWeight(top.w)} kg × ${top.r}` });
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
        <h2 id="cele-t">${esc(t('doneTitle', workoutName(w)))}</h2>
        <p class="muted date">${esc(fmtDate(w.start))}</p>
        <div class="cele-stats">
          <div><b data-count="${sm.mins}">${sm.mins}</b><span>${t('minutesL', sm.mins)}</span></div>
          <div><b data-count="${sm.sets}">${sm.sets}</b><span>${t('setsL', sm.sets)}</span></div>
          <div><b data-count="${sm.volume}">${sm.volume.toLocaleString('en')}</b><span>${t('kgLifted')}</span></div>
        </div>
        ${sm.prs.length ? `<div class="prs"><h3>${ICON.trophy}${t('newBests')}</h3><ul>${sm.prs.map((x) => `<li>${esc(x.name)}: <bdi class="num">${esc(x.val)}</bdi></li>`).join('')}</ul></div>` : ''}
        ${nextName ? `<p class="next">${t('nextTime')} <b>${esc(nextName)}</b></p>` : ''}
        <button class="btn primary big" data-act="close-cele">${t('doneBtn')}</button>
      </div>
    </div>`;
    ovOpen();
    if (!calm) {
      $('#cele-root').querySelectorAll('[data-count]').forEach((el) => {
        const to = +el.dataset.count, t0 = performance.now() + 450, dur = 1100;
        el.textContent = '0';
        const step = (now) => {
          const p = Math.max(0, Math.min(1, (now - t0) / dur));
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))).toLocaleString('en');
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }
    const btn = $('#cele-root .btn');
    if (btn) setTimeout(() => btn.focus({ preventScroll: true }), 50);
  }
  function closeCele(fromPop) {
    const el = $('#cele-root .cele');
    if (!el) return;
    ovClose(fromPop);
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
    if (fresh) ovOpen();
    hydratePhotos(root);
    const f = $('#sheet-root [autofocus]');
    if (f) setTimeout(() => f.focus(), fresh && !reduceMotion() ? 420 : 30);
  }
  function closeSheet(fromPop) {
    const root = $('#sheet-root');
    sheetState = null;
    if (!root.innerHTML || root.classList.contains('closing')) return;
    ovClose(fromPop);
    clearTimeout(sheetCloseTimer);
    if (reduceMotion()) { root.innerHTML = ''; return; }
    root.classList.add('closing');
    sheetCloseTimer = setTimeout(() => { root.innerHTML = ''; root.classList.remove('closing'); }, 220);
  }

  // Change when a logged workout happened (for example, logged today but done yesterday).
  const pad2 = (n) => String(n).padStart(2, '0');
  const dateValue = (x) => { const d = new Date(x); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; };
  const timeValue = (x) => { const d = new Date(x); return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
  function sheetDate(id) {
    const w = log.sessions.find((x) => x.id === id);
    if (!w) return;
    const quick = [[0, t('todayLbl')], [1, t('yesterdayLbl')], [2, t('twoDaysLbl')]].map(([d, l]) => {
      const x = new Date(); x.setDate(x.getDate() - d);
      return `<button type="button" class="chip" data-act="date-quick" data-date="${dateValue(x)}" aria-pressed="${dateValue(x) === dateValue(w.start)}">${l}</button>`;
    }).join('');
    openSheet(`<h3>${ICON.clock}${t('changeDate')}</h3>
      <p class="small muted">${esc(workoutName(w))}, ${esc(fmtDate(w.start))}</p>
      <div class="chips" style="margin-bottom:14px">${quick}</div>
      <div class="grid2">
        <label class="field"><span>${t('dateF')}</span><input type="date" id="wd-date" dir="ltr" max="${dateValue(Date.now())}" value="${dateValue(w.start)}"></label>
        <label class="field"><span>${t('timeF')}</span><input type="time" id="wd-time" dir="ltr" value="${timeValue(w.start)}"></label>
      </div>
      <button class="btn primary big" data-act="date-save" data-id="${esc(id)}">${t('saveDate')}</button>
      <button class="btn ghost wide" data-act="close-sheet">${t('cancel')}</button>`);
  }
  function saveWorkoutDate(id) {
    const w = log.sessions.find((x) => x.id === id);
    const d = ($('#wd-date') || {}).value, tm = ($('#wd-time') || {}).value || '12:00';
    if (!w || !d) return;
    const [y, mo, da] = d.split('-').map(Number);
    const [h, mi] = tm.split(':').map(Number);
    const start = new Date(y, mo - 1, da, h, mi).getTime();
    if (!isFinite(start)) return;
    if (start > Date.now()) { toast(t('dateFuture')); return; }
    const shift = start - w.start;
    w.start += shift;
    w.end = (w.end || w.start) + shift;
    w.editedAt = Date.now();
    log.sessions.sort((a, b) => a.start - b.start);
    saveLog();
    closeSheet();
    render();
    toast(t('dateSaved'));
  }

  function sheetPick() {
    const nextId = nextSessionId();
    const sel = ui.override || nextId;
    const status = exStatuses();
    const items = sessions().map((s) => {
      const last = log.sessions.filter((w) => w.sessionId === s.id).sort((a, b) => b.start - a.start)[0];
      const meta = [t('nExercises', s.exercises.length), last ? t('lastDone', relDay(last.start)) : t('notDoneYet')].join(comma());
      return `<li><button class="pick-card${s.id === sel ? ' sel' : ''}" data-plate="${plateOf(s)}" data-act="pick" data-session="${esc(s.id)}">
        <span class="pchip lg" aria-hidden="true"></span>
        <span class="grow"><span class="pk-name">${esc(sName(s))}</span>${sFocus(s) ? `<span class="pk-focus">${esc(sFocus(s))}</span>` : ''}<span class="pk-meta">${esc(meta)}</span></span>
        <span class="pk-badges">${s.id === nextId ? `<span class="pk-badge">${t('nextUp')}</span>` : ''}${sessionNeedsUpdate(s, status) ? `<span class="pill stuck">${t('needsUpdate')}</span>` : ''}</span>
      </button></li>`;
    }).join('');
    openSheet(`<h3>${t('pickSession')}</h3><ul class="pick-list">${items}</ul>`);
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
    const chips = (field, cls) => MUSCLE_KEYS.map((k) => `<button type="button" class="chip ${cls}" data-act="chip" data-field="${field}" data-m="${k}" aria-pressed="${(ex[field] || []).includes(k)}">${esc(muscleName(k))}</button>`).join('');
    const photoNow = ex.photo && ex.photo.startsWith('custom:') ? t('ownPhoto') : ex.library ? t('libraryX', libName(ex.library) || ex.library) : t('noPhotoP');
    const ar = ex.ar || {};
    openSheet(`
      <h3>${draft.isNew ? t('newExercise') : t('editExercise')}</h3>
      <form id="ex-form" autocomplete="off">
        ${L() ? `<label class="field"><span>${t('nameArF')}</span><input name="arname" value="${esc(ar.name || '')}"></label>` : ''}
        <label class="field"><span>${L() ? t('nameEnF') : t('nameF')}</span><input name="name" dir="auto" value="${esc(ex.name)}" required ${draft.isNew && !ex.name ? 'autofocus' : ''}>${L() ? `<div class="help">${t('nameEnHelp')}</div>` : ''}</label>
        <div class="grid3">
          <label class="field"><span>${t('setsF')}</span><input name="sets" type="number" inputmode="numeric" min="1" max="10" value="${esc(ex.sets)}"></label>
          <label class="field"><span>${t('repsF')}</span><input name="reps" dir="ltr" value="${esc(ex.reps)}"></label>
          <label class="field"><span>${t('restF')}</span><input name="rest" type="number" inputmode="numeric" min="0" step="5" value="${esc(ex.rest)}"></label>
        </div>
        <p class="help" style="margin:-6px 0 14px">${t('setsHelp')}</p>
        <label class="field"><span>${t('cueF')}</span><textarea name="cue" rows="2" style="min-height:64px">${esc(L() ? ar.cue || ex.cue || '' : ex.cue)}</textarea></label>
        <label class="field"><span>${t('stepsF')}</span><textarea name="steps" rows="5">${esc((L() && ar.steps && ar.steps.length ? ar.steps : ex.steps || []).join('\n'))}</textarea><div class="help">${t('oneStep')}</div></label>
        <div class="field"><span>${t('mainMuscles')}</span><div class="chips" data-group="primary">${chips('primary', '')}</div></div>
        <div class="field"><span>${t('alsoWorks')}</span><div class="chips" data-group="secondary">${chips('secondary', 'sec')}</div></div>
        <label class="check-row"><input type="checkbox" name="supersetWithNext" ${ex.supersetWithNext ? 'checked' : ''}> ${t('ssNext')}</label>
        <label class="check-row"><input type="checkbox" name="noWeight" ${ex.noWeight ? 'checked' : ''}> ${t('bwOnly')}</label>
        <div class="field"><span>${t('photoF')}</span>
          ${(ex.library || ex.photo) ? photoHTML(ex) : ''}
          <p class="small muted" style="margin:6px 0">${esc(photoNow)}</p>
          <div class="row wrap">
            <button type="button" class="btn sm soft" data-act="lib-photo">${t('chooseLib')}</button>
            <label class="btn sm soft">${t('useOwn')}<input type="file" accept="image/*" data-act="own-photo" class="hidden"></label>
            ${(ex.library || ex.photo) ? `<button type="button" class="btn sm ghost" data-act="no-photo">${t('removePhoto')}</button>` : ''}
          </div>
        </div>
        <div class="row" style="margin-top:18px">
          <button type="submit" class="btn primary grow">${t('saveEx')}</button>
          ${draft.isNew ? '' : `<button type="button" class="btn danger" data-act="delete-ex">${t('del')}</button>`}
        </div>
        <button type="button" class="btn ghost wide" data-act="close-sheet">${t('cancel')}</button>
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
    const cue = f.cue.value.trim();
    const steps = f.steps.value.split('\n').map((x) => x.trim()).filter(Boolean);
    if (L()) {
      ex.ar = Object.assign({}, ex.ar || {}, { name: f.arname.value.trim(), cue, steps });
      if (!ex.cue) ex.cue = '';
    } else { ex.cue = cue; ex.steps = steps; }
    ex.primary = [...f.querySelectorAll('[data-group="primary"] [aria-pressed="true"]')].map((b) => b.dataset.m);
    ex.secondary = [...f.querySelectorAll('[data-group="secondary"] [aria-pressed="true"]')].map((b) => b.dataset.m).filter((m) => !ex.primary.includes(m));
    ex.supersetWithNext = f.supersetWithNext.checked;
    ex.noWeight = f.noWeight.checked;
  }
  function saveExerciseDraft() {
    readExerciseForm();
    const d = sheetState;
    const ex = d.ex;
    if (!ex.name) { toast(t('nameNeeded')); return; }
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
    toast(d.isNew ? t('addedTo', exName(ex), sName(s)) : t('exSaved'));
    if (navigator.onLine) prefetchPhotos();
  }

  function sheetLibrary(mode, sessionId) {
    sheetState = Object.assign(sheetState || {}, { libMode: mode, libSession: sessionId });
    const keep = sheetState;
    openSheet(`<h3>${mode === 'photo' ? t('chooseAPhoto') : t('addAnExercise')}</h3>
      <label class="field"><span>${esc(t('searchN', LIBRARY.length))}</span><input type="search" id="lib-q" dir="ltr" placeholder="${esc(t('searchPh'))}" autofocus></label>
      ${mode === 'add' ? `<button class="btn sm soft" data-act="blank-ex">${t('blankEx')}</button>` : ''}
      <ul class="results" id="lib-results"></ul>
      <button class="btn ghost wide" data-act="${mode === 'photo' ? 'back-to-edit' : 'close-sheet'}">${mode === 'photo' ? t('backBtn') : t('cancel')}</button>`, keep);
    renderLibResults('');
  }
  function renderLibResults(q) {
    const words = norm(q) ? q.toLowerCase().split(/\s+/).map(norm).filter(Boolean) : [];
    const res = (words.length ? LIBRARY.filter((e) => { const n = norm(e.n); return words.every((w) => n.includes(w)); }) : LIBRARY.filter((e) => BUNDLED.has(e.id))).slice(0, 40);
    $('#lib-results').innerHTML = res.length ? res.map((e) => {
      const thumb = BUNDLED.has(e.id) ? `<img class="thumb" src="img/${e.id}/0.jpg" alt="" loading="lazy">` : `<img class="thumb" src="${LIB_BASE}${e.id}/0.jpg?thumb" alt="" loading="lazy" onerror="this.style.visibility='hidden'">`;
      return `<li><button data-act="lib-choose" data-lib="${esc(e.id)}">${thumb}<span dir="ltr"><span class="rn">${esc(e.n)}</span><br><span class="r-meta">${esc([e.eq, (e.p || []).join(', ')].filter(Boolean).join(', '))}</span></span></button></li>`;
    }).join('') : `<li class="muted" style="padding:12px 0">${t('noMatches')}</li>`;
  }

  function sheetSession(sessionId) {
    const s = sessionId ? sessionById(sessionId) : null;
    const color = s ? plateOf(s) : PLATES[sessions().length % PLATES.length];
    const idx = s ? sessions().indexOf(s) : -1;
    const ar = (s && s.ar) || {};
    openSheet(`<h3>${s ? t('editSession') : t('newSession')}</h3>
      <form id="session-form" autocomplete="off">
        ${L() ? `<label class="field"><span>${t('nameArF')}</span><input name="arname" value="${esc(ar.name || '')}"></label>` : ''}
        <label class="field"><span>${L() ? t('nameEnF') : t('nameF')}</span><input name="name" dir="auto" value="${esc(s ? s.name : '')}" required ${s ? '' : 'autofocus'}></label>
        <label class="field"><span>${t('focusF')}</span><input name="focus" value="${esc(s ? (L() ? ar.focus || s.focus || '' : s.focus || '') : '')}" placeholder="${esc(t('focusPh'))}"></label>
        <div class="field"><span>${t('plateColour')}</span><div class="swatches">${PLATES.map((p) => `<button type="button" class="swatch" data-plate="${p}" data-act="swatch" data-color="${p}" aria-pressed="${p === color}" aria-label="${p}"></button>`).join('')}</div></div>
        ${s ? `<div class="row wrap" style="margin-bottom:12px">
          <button type="button" class="btn sm soft" data-act="move-session" data-dir="-1" ${idx === 0 ? 'disabled' : ''}>${t('moveEarlier')}</button>
          <button type="button" class="btn sm soft" data-act="move-session" data-dir="1" ${idx === sessions().length - 1 ? 'disabled' : ''}>${t('moveLater')}</button></div>` : ''}
        <div class="row"><button type="submit" class="btn primary grow">${t('saveSession')}</button>${s ? `<button type="button" class="btn danger" data-act="delete-session">${t('del')}</button>` : ''}</div>
        <button type="button" class="btn ghost wide" data-act="close-sheet">${t('cancel')}</button>
      </form>`, { sessionId, color });
  }

  function sheetProfile() {
    const p = settings.profile;
    const f = (k, label, type = 'text', extra = '') => `<label class="field"><span>${label}</span>${type === 'area'
      ? `<textarea name="${k}" rows="2" style="min-height:64px">${esc(p[k])}</textarea>`
      : `<input name="${k}" type="${type}" ${extra} value="${esc(p[k])}">`}</label>`;
    openSheet(`<h3>${t('profileT')}</h3><p class="small muted">${t('profileHelp')}</p>
      <form id="profile-form" autocomplete="off">
        <div class="grid3">
          ${f('weight', t('weightF'), 'number', 'step="0.1" inputmode="decimal"')}
          ${f('height', t('heightF'), 'number', 'inputmode="numeric"')}
          ${f('age', t('ageF'), 'number', 'inputmode="numeric"')}
        </div>
        ${f('goal', t('goalF'))}
        ${f('experience', t('experienceF'), 'area')}
        ${f('injuries', t('injuriesF'), 'area')}
        ${f('priorities', t('prioritiesF'), 'area')}
        ${f('gym', t('gymF'), 'area')}
        ${f('schedule', t('scheduleF'), 'area')}
        ${f('notes', t('notesF'), 'area')}
        <button type="submit" class="btn primary big">${t('saveProfile')}</button>
        <button type="button" class="btn ghost wide" data-act="close-sheet">${t('cancel')}</button>
      </form>`);
  }
  function saveProfile(form) {
    const p = settings.profile;
    const oldW = +p.weight;
    ['weight', 'height', 'age', 'goal', 'experience', 'injuries', 'priorities', 'gym', 'schedule', 'notes'].forEach((k) => { p[k] = form[k].value.trim(); });
    const w = parseFloat(p.weight);
    if (w && w !== oldW) {
      const today = startOfDay(Date.now());
      body = body.filter((b) => startOfDay(b.t) !== today);
      body.push({ t: Date.now(), kg: w });
      saveBody();
    }
    saveShared();
    closeSheet();
    render();
    toast(t('profileSaved'));
  }

  // ---------- AI coach ----------
  const PRESET_TEXT = {
    review: 'Look at my progress and my program and tell me what to improve. Update my program if something should change.',
    newBlock: 'I finished a training block. Plan my next block: keep the exercises that are still improving, swap or change the ones that are stuck, and adjust sets or reps if needed. Send the full updated program.',
    stuck: 'My weights have stopped going up on some exercises. Find which ones from my log and tell me how to get them moving again. Update the program if needed.',
    pain: 'Something hurts or feels wrong (see my note). Tell me what to change so I can keep training around it safely, and when I should see a doctor or physiotherapist instead. Update the program if exercises should be swapped.',
    swap: "I want to swap an exercise (see my note). Suggest the best replacement for my goals, my back and my gym, and update the program.",
    add: 'I want a muscle to grow more (see my note). Adjust my program to give it more work without making sessions too long.',
    shorter: 'My workouts take too long. Make each session shorter while keeping my progress going.',
    question: "Just answer my question in the note. Don't change my program unless the answer needs it."
  };
  const PRESET_NEEDS_NOTE = ['pain', 'swap', 'add', 'question'];
  function sheetCoach() {
    const presets = t('presets');
    openSheet(`<h3>${ICON.sparkle}${t('askCoach')}</h3>
      <p class="small muted">${t('coachHelp')}</p>
      <p class="field-title">${t('coachQ')}</p>
      <div class="opt-list" role="radiogroup">
        ${Object.keys(PRESET_TEXT).map((k) => `<button type="button" role="radio" class="opt" data-act="coach-preset" data-preset="${k}" aria-checked="${ui.coach === k}"><span class="dot"></span>${esc(presets[k])}</button>`).join('')}
      </div>
      <label class="field"><span>${t('noteLabel')}</span><textarea id="coach-note" rows="3" placeholder="${esc(t('notePh'))}"></textarea></label>
      <button class="btn primary big" data-act="coach-copy">${t('copyPrompt')}</button>
      <button class="btn ghost wide" data-act="import-sheet">${t('haveReply')}</button>`);
  }
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
  function enSets(sets, noWeight) {
    if (noWeight) return `${sets.map((s) => s.r).join(', ')} reps`;
    const ws = sets.map((s) => (s.w == null ? 'bodyweight' : `${fmtWeight(s.w)} kg`));
    return ws.every((w) => w === ws[0]) ? `${ws[0]} x ${sets.map((s) => s.r).join(', ')}` : sets.map((s, i) => `${ws[i]} x ${s.r}`).join(', ');
  }
  function coachPrompt(preset, note) {
    const p = settings.profile;
    const lines = [];
    const add = (s = '') => lines.push(s);
    add("You are my personal strength coach. I'm not an expert, so explain things simply. Everything you need is below: my profile, my current program, and the progress I logged in my workout app.");
    add();
    add('## About me');
    const bw = body.slice().sort((a, b) => a.t - b.t);
    const bwTrend = bw.length > 1 ? ` (logged: ${bw.slice(-6).map((b) => `${b.kg} kg on ${fmtDateEN(b.t)}`).join(', ')})` : '';
    add(`- Body weight: ${p.weight || 'not given'}${p.weight ? ' kg' : ''}${bwTrend}`);
    add(`- Height: ${p.height ? `${p.height} cm` : 'not given'}`);
    add(`- Age: ${p.age || 'not given'}`);
    add(`- Goal: ${p.goal || 'not given'}`);
    add(`- Training experience: ${p.experience || 'not given'}`);
    add(`- Injuries or pain: ${p.injuries || 'none mentioned'}`);
    add(`- Muscles I most want to grow: ${p.priorities || 'not given'}`);
    add(`- Gym and equipment: ${p.gym || 'not given'}`);
    add(`- Schedule: ${p.schedule || 'not given'}`);
    if (p.notes) add(`- Other notes: ${p.notes}`);
    add(`- Today's date: ${fmtDateEN(Date.now())}`);
    add();
    add('## How my app works');
    add(`- Sessions rotate in this order with no fixed weekdays: ${sessions().map((s) => s.name).join(' → ')} → repeat.`);
    add('- Each exercise starts with 2 sets. When I feel good I add sets up to the target number of sets.');
    add('- Double progression: when I reach the top of the rep range on every set, I add the smallest weight jump next time.');
    add(`- Ease-in for the first 2 weeks (4-set exercises capped at 3): ${program.rampIn && program.rampIn.enabled ? (rampActive() ? 'on and active now' : 'on, already finished') : 'off'}.`);
    const wk = blockWeek();
    add(`- Training block: ${wk ? `week ${wk} of ${settings.blockWeeks || 8}` : 'not started'}. After the block the app suggests an easy (deload) week of 2 sets per exercise, 10–20% lighter. ${deloadActive() ? `I'm in an easy week now until ${fmtDateEN(settings.deload.end)}.` : ''}`.trim());
    add();
    add('## My current program');
    sessions().forEach((s) => {
      add(`${s.name}${s.focus ? ` (${s.focus})` : ''}`);
      s.exercises.forEach((ex, i) => {
        const partner = ex.supersetWithNext && s.exercises[i + 1];
        add(`  ${i + 1}. ${ex.name}: target ${ex.sets} sets x ${ex.reps.replace(/–/g, '-')} reps, rest ${ex.rest} s${partner ? `, superset with ${partner.name}` : ''}${ex.noWeight ? ', bodyweight' : ''}`);
      });
    });
    add();
    add('## My training log');
    const all = [...log.sessions].sort((a, b) => a.start - b.start);
    if (!all.length) add('- Nothing logged yet.');
    else {
      const last28 = all.filter((w) => Date.now() - w.start < 28 * DAY);
      const avgMin = Math.round(all.reduce((a, w) => a + ((w.end || w.start) - w.start), 0) / all.length / 60000);
      add(`- Workouts logged: ${all.length}, from ${fmtDateEN(all[0].start)} to ${fmtDateEN(all[all.length - 1].start)}.`);
      add(`- Last 4 weeks: ${last28.length} workouts (about ${(last28.length / 4).toFixed(1)} per week).`);
      add(`- Average workout length: ${avgMin} min.`);
      add(`- Recent workouts: ${all.slice(-8).map((w) => `${w.name} on ${fmtDateEN(w.start)}`).join('; ')}.`);
    }
    add();
    add('## Progress per exercise');
    add('Format: date: weight x reps for each set. Negative weight means machine assistance (less is better).');
    const hist = exerciseHistory();
    const inProgram = new Set();
    sessions().forEach((s) => s.exercises.forEach((ex) => inProgram.add(ex.id)));
    const notLogged = [];
    inProgram.forEach((id) => {
      const v = hist.get(id);
      const ex = exById(id);
      if (!v) { notLogged.push(ex.name); return; }
      add(`${ex.name} (${v.rows.length} session${v.rows.length === 1 ? '' : 's'}):`);
      v.rows.slice(-8).forEach((r) => add(`  ${fmtDateEN(r.date)}: ${enSets(r.sets, v.noWeight)}`));
      if (!v.noWeight && v.rows.length > 1) {
        const first = topSet(v.rows[0].sets), lastTop = topSet(v.rows[v.rows.length - 1].sets);
        const best = v.rows.map((r) => ({ d: r.date, s: topSet(r.sets) })).reduce((a, b) => (b.s.w > a.s.w || (b.s.w === a.s.w && b.s.r > a.s.r) ? b : a));
        if (isFinite(first.w) && isFinite(lastTop.w)) add(`  Top set first ${fmtWeight(first.w)} kg x ${first.r}, latest ${fmtWeight(lastTop.w)} kg x ${lastTop.r}, best ${fmtWeight(best.s.w)} kg x ${best.s.r} (${fmtDateEN(best.d)}).`);
      }
    });
    if (notLogged.length) add(`Not logged yet: ${notLogged.join(', ')}.`);
    const stat = exStatuses();
    const named = (k) => [...inProgram].filter((id) => stat.get(id) === k).map((id) => exById(id).name);
    add(`Improving (new best the last time): ${named('up').join(', ') || 'none'}.`);
    add(`Stuck (no new best in the last 3 times, easy weeks ignored): ${named('stuck').join(', ') || 'none'}.`);
    const old = [...hist.entries()].filter(([id]) => !inProgram.has(id));
    if (old.length) add(`Logged before but no longer in my program: ${old.map(([, v]) => `${v.name} (last ${enSets(v.rows[v.rows.length - 1].sets, v.noWeight)})`).join('; ')}.`);
    add();
    add('## What I want');
    add(PRESET_TEXT[preset] || PRESET_TEXT.review);
    if (note) add(`My note: ${note}`);
    add();
    add('## How to reply');
    add(`1. Start with a short explanation in ${L() ? 'Arabic' : 'English'}, in plain words: what you notice in my progress, what to change and why.`);
    add('2. If my program should change, end your reply with the complete updated program as JSON inside a ```json code block, in exactly this format:');
    add('```json');
    add(JSON.stringify({
      name: 'Program name',
      sessions: [{ name: 'Upper A', focus: 'Short description', exercises: [Object.assign({
        name: 'Incline Dumbbell Press', sets: 4, reps: '6-10', rest: 150, cue: 'One short coaching cue', steps: ['Step one', 'Step two'],
        primary: ['chest'], secondary: ['front-delts', 'triceps'], library: 'Incline Dumbbell Press', supersetWithNext: false
      }, L() ? { ar: { name: 'Arabic name', cue: 'Arabic cue', steps: ['Arabic step one', 'Arabic step two'] } } : {})] }]
    }, null, 1));
    add('```');
    add('   Rules for the JSON:');
    add('   - Sessions rotate in the order listed. "sets" is the target number of sets; "reps" is text such as "8-12", "10-15 / leg" or "8 / side"; "rest" is in seconds.');
    add('   - "supersetWithNext": true pairs an exercise with the one after it; the rest comes after the second one. Add "noWeight": true for bodyweight exercises.');
    add(`   - Muscles must come from this list: ${MUSCLE_KEYS.join(', ')}.`);
    add('   - "library" is the exact name of an exercise in Free Exercise DB (github.com/yuhonas/free-exercise-db) that shows the same movement, so my app can show its photos. Use null if nothing fits.');
    add('   - Keep the name exactly the same for every exercise you keep, so my history stays linked. For exercises you keep you can leave out "steps"; write 3–6 short steps for every new exercise.');
    if (L()) add('   - Include "ar" with the Arabic name, cue and steps for every new or changed exercise. Keep "name" in English.');
    add('   - To only add exercises to one session, you can instead send {"session": "Session name", "exercises": [ ... ]}.');
    add("3. If my program shouldn't change, say so and leave out the JSON.");
    add();
    add('My current program as JSON (for exact names):');
    add('```json');
    add(JSON.stringify(programForAI()));
    add('```');
    return lines.join('\n');
  }
  async function copyCoachPrompt() {
    const note = ($('#coach-note') || {}).value || '';
    if (PRESET_NEEDS_NOTE.includes(ui.coach) && !note.trim()) { toast(t('needNote')); const n = $('#coach-note'); if (n) n.focus(); return; }
    const text = coachPrompt(ui.coach, note.trim());
    try { await navigator.clipboard.writeText(text); toast(t('copied')); }
    catch (e) {
      openSheet(`<h3>${t('copyFallbackT')}</h3><p class="small muted">${t('copyFallbackText')}</p>
        <label class="field"><textarea rows="12" readonly id="prompt-text" dir="ltr">${esc(text)}</textarea></label>
        <button class="btn ghost wide" data-act="close-sheet">${t('doneBtn')}</button>`);
      const ta = $('#prompt-text'); ta.focus(); ta.select();
    }
  }

  // ---------- Import ----------
  function parseLooseJSON(text) {
    const src = String(text || '');
    const blocks = [...src.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map((m) => m[1]);
    for (const b of blocks.reverse()) {
      try { const d = JSON.parse(b.trim()); if (d && (Array.isArray(d.sessions) || Array.isArray(d.exercises))) return d; } catch (e) { /* try the next one */ }
    }
    const a = src.indexOf('{'), z = src.lastIndexOf('}');
    if (a < 0 || z <= a) throw new Error(t('errNoJSON'));
    try { return JSON.parse(src.slice(a, z + 1)); }
    catch (e) { throw new Error(t('errBadJSON')); }
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
  function cleanAr(a) {
    if (!a || typeof a !== 'object') return null;
    const out = {};
    if (a.name) out.name = String(a.name).trim();
    if (a.cue) out.cue = String(a.cue).trim();
    if (Array.isArray(a.steps)) out.steps = a.steps.map(String).filter(Boolean);
    if (a.focus) out.focus = String(a.focus).trim();
    return Object.keys(out).length ? out : null;
  }
  function normExercise(x, warnings, usedIds, known) {
    if (!x || typeof x !== 'object' || !String(x.name || '').trim()) throw new Error(t('errExName'));
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
    const ar = Object.assign({}, (old && old.ar) || {}, cleanAr(x.ar) || {});
    if (Object.keys(ar).length) out.ar = ar;
    if (old) ['photo', 'photoNote', 'weightHint'].forEach((k) => { if (old[k] && (k !== 'photoNote' || out.library === old.library)) out[k] = old[k]; });
    return out;
  }
  function sheetImport(text = '', err = '', preview = null) {
    let body = '';
    if (preview) {
      const warn = preview.warnings.length ? `<div class="note">${esc(t('noPhotoMatch', preview.warnings.join(', ')))}</div>` : '';
      if (preview.kind === 'program') {
        body = `<div class="panel"><h3>${esc(preview.program.name)}</h3>
          ${preview.program.sessions.map((s) => `<p class="small"><b>${esc(sName(s))}</b>: ${esc(t('sessionsN', s.exercises.length))}</p>`).join('')}</div>${warn}
          <button class="btn primary big" data-act="apply-import">${t('replaceProgram')}</button>`;
      } else {
        const target = preview.target || (sessions()[0] && sessions()[0].id);
        body = `<div class="panel"><h3>${esc(t('nToAdd', preview.exercises.length))}</h3>
          ${preview.exercises.map((e) => `<p class="small">${esc(exName(e))}: ${e.sets} × <bdi>${esc(e.reps)}</bdi></p>`).join('')}
          <label class="field"><span>${t('addToSession')}</span><select id="import-target">${sessions().map((s) => `<option value="${esc(s.id)}" ${s.id === target ? 'selected' : ''}>${esc(sName(s))}</option>`).join('')}</select></label></div>${warn}
          <button class="btn primary big" data-act="apply-import">${t('addExercises')}</button>`;
      }
    }
    openSheet(`<h3>${t('importT')}</h3>
      <p class="small muted">${t('pasteWhole')}</p>
      <label class="field"><textarea id="import-text" rows="8" dir="auto">${esc(text)}</textarea></label>
      ${err ? `<div class="note" role="alert">${esc(err)}</div>` : ''}
      ${preview ? body : `<button class="btn primary wide" data-act="check-import">${t('checkImport')}</button>`}
      <button class="btn ghost wide" data-act="close-sheet">${t('cancel')}</button>`, { importPreview: preview });
  }
  function checkImport() {
    const text = $('#import-text').value;
    try {
      const data = parseLooseJSON(text);
      const warnings = [];
      const known = existingByName();
      if (Array.isArray(data.sessions)) {
        if (!data.sessions.length) throw new Error(t('errNoSessions'));
        const sIds = new Set();
        const oldSessions = new Map(sessions().map((s) => [norm(s.name), s]));
        const sessionsOut = data.sessions.map((s, i) => {
          if (!s || !String(s.name || '').trim()) throw new Error(t('errSessionName'));
          const name = String(s.name).trim();
          const oldS = oldSessions.get(norm(name));
          let id = oldS ? oldS.id : slug(name), n = 2;
          while (sIds.has(id)) id = `${slug(name)}-${n++}`;
          sIds.add(id);
          const used = new Set();
          const out = { id, name, focus: String(s.focus || '').trim(), color: PLATES.includes(s.color) ? s.color : oldS ? plateOf(oldS) : PLATES[i % PLATES.length],
            exercises: (Array.isArray(s.exercises) ? s.exercises : []).map((x) => normExercise(x, warnings, used, known)) };
          const ar = Object.assign({}, (oldS && oldS.ar) || {}, cleanAr(s.ar) || {});
          if (Object.keys(ar).length) out.ar = ar;
          return out;
        });
        sheetImport(text, '', { kind: 'program', program: { name: String(data.name || program.name || 'My program'), sessions: sessionsOut }, warnings });
      } else if (Array.isArray(data.exercises)) {
        if (!data.exercises.length) throw new Error(t('errNoExercises'));
        const used = new Set();
        const exercises = data.exercises.map((x) => normExercise(x, warnings, used, known));
        const tg = sessions().find((s) => norm(s.name) === norm(data.session));
        sheetImport(text, '', { kind: 'exercises', exercises, warnings, target: tg ? tg.id : null });
      } else {
        throw new Error(t('errNoList'));
      }
    } catch (e) { sheetImport(text, e.message); }
  }
  function applyImport() {
    const p = sheetState && sheetState.importPreview;
    if (!p) return;
    if (p.kind === 'program') {
      if (!confirm(t('replaceQ'))) return;
      program = { name: p.program.name, rampIn: program.rampIn || { enabled: true, weeks: 2, maxSets: 3 }, sessions: p.program.sessions };
      ui.override = null;
      toast(t('replaced'));
    } else {
      const s = sessionById($('#import-target').value);
      p.exercises.forEach((ex) => {
        let id = ex.id, n = 2;
        while (s.exercises.some((e) => e.id === id)) id = `${ex.id}-${n++}`;
        s.exercises.push(Object.assign({}, ex, { id }));
      });
      toast(t('addedN', p.exercises.length, sName(s)));
    }
    saveProgram();
    closeSheet();
    render();
    if (navigator.onLine) prefetchPhotos();
  }

  // ---------- Backup ----------
  async function backupData() {
    const photos = {};
    try {
      for (const k of await idb.keys()) {
        const blob = await idb.get(k);
        photos[k] = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
      }
    } catch (e) { /* no photos */ }
    return JSON.stringify({ app: 'rolling-upper-lower', version: 2, exported: new Date().toISOString(), program, log, settings, body, photos });
  }
  function downloadFile(text, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  async function backup(shareFirst) {
    const text = await backupData();
    const base = `workout-backup-${new Date().toISOString().slice(0, 10)}`;
    if (shareFirst && navigator.canShare) {
      // Android's share menu takes text files more reliably than .json, and restore reads both.
      const candidates = [new File([text], `${base}.json`, { type: 'application/json' }), new File([text], `${base}.txt`, { type: 'text/plain' })];
      const file = candidates.find((f) => { try { return navigator.canShare({ files: [f] }); } catch (e) { return false; } });
      if (file) {
        try { await navigator.share({ files: [file], title: base }); toast(t('backupShared')); return; }
        catch (e) { if (e && e.name === 'AbortError') return; }
      }
    }
    downloadFile(text, `${base}.json`);
    toast(t('backupSaved'));
  }
  async function restore(file) {
    try {
      const data = JSON.parse(await file.text());
      if (data.app !== 'rolling-upper-lower' || !data.program || !data.log) throw new Error('bad');
      if (!confirm(t('restoreQ', fmtDate(data.exported)))) return;
      program = data.program; log = data.log; body = data.body || body;
      settings = Object.assign({}, SETTINGS_DEFAULT, data.settings || {});
      settings.profile = Object.assign({}, DEFAULT_PROFILE, settings.profile || {});
      for (const [k, url] of Object.entries(data.photos || {})) await idb.put(k, await (await fetch(url)).blob());
      migrateProgram();
      settings.sharedAt = Date.now();
      saveProgram(); saveLog(); saveSettings(); saveBody();
      applyLang(); applyTheme();
      render();
      toast(t('restored'));
    } catch (e) { toast(t('notBackup')); }
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

  // ---------- Sync between devices ----------
  // Everything except the in-progress workout and device-only settings (theme, language, screen) is synced.
  const SHARED_KEYS = ['profile', 'blockWeeks', 'blockStart', 'deload'];
  let syncTimer = null, syncBusy = false, syncAgain = false, syncState = null, pendingRender = false;
  const syncReady = () => !!(settings.sync && settings.sync.url && settings.sync.code);
  function scheduleSync(delay = 2500) {
    if (!syncReady()) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => runSync(false), delay);
  }
  function localPayload() {
    const shared = {};
    SHARED_KEYS.forEach((k) => { shared[k] = settings[k] === undefined ? null : settings[k]; });
    return { v: 1, program, programAt: program.updatedAt || 0, log: { sessions: log.sessions, deleted: log.deleted || [] }, shared, sharedAt: settings.sharedAt || 0, body };
  }
  function mergePayload(a, b) {
    if (!b || !b.log) return a;
    const deleted = new Set([...(a.log.deleted || []), ...(b.log.deleted || [])]);
    const byId = new Map();
    (b.log.sessions || []).forEach((w) => byId.set(w.id, w));
    a.log.sessions.forEach((w) => { const o = byId.get(w.id); if (!o || (w.editedAt || 0) >= (o.editedAt || 0)) byId.set(w.id, w); });
    const sessionsOut = [...byId.values()].filter((w) => !deleted.has(w.id)).sort((x, y) => x.start - y.start);
    const days = new Map();
    [...(b.body || []), ...(a.body || [])].sort((x, y) => x.t - y.t).forEach((x) => days.set(startOfDay(x.t), x));
    const progA = (a.programAt || 0) > (b.programAt || 0) || !b.program;
    const sharedA = (a.sharedAt || 0) > (b.sharedAt || 0) || !b.shared;
    return {
      v: 1,
      program: progA ? a.program : b.program, programAt: Math.max(a.programAt || 0, b.programAt || 0),
      log: { sessions: sessionsOut, deleted: [...deleted].sort() },
      shared: sharedA ? a.shared : b.shared, sharedAt: Math.max(a.sharedAt || 0, b.sharedAt || 0),
      body: [...days.values()]
    };
  }
  function applyPayload(m) {
    const before = JSON.stringify(localPayload());
    program = clone(m.program);
    if (m.programAt) program.updatedAt = m.programAt;
    migrateProgram();
    log = { sessions: clone(m.log.sessions), deleted: [...m.log.deleted] };
    SHARED_KEYS.forEach((k) => { if (m.shared && k in m.shared) settings[k] = clone(m.shared[k]); });
    settings.profile = Object.assign({}, DEFAULT_PROFILE, settings.profile || {});
    settings.sharedAt = m.sharedAt || 0;
    body = clone(m.body || []);
    save(KEYS.program, program); save(KEYS.log, log); save(KEYS.body, body); saveSettings();
    return JSON.stringify(localPayload()) !== before;
  }
  function normUrl(u) {
    return String(u || '').trim().replace(/\/v1\/data\/?$/, '').replace(/\/+$/, '');
  }
  function urlProblem(u) {
    if (!u) return t('needUrlCode');
    if (/^https:\/\//i.test(u) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(u)) return '';
    return t('errHttps');
  }
  async function syncApi(method, payload) {
    const c = settings.sync;
    let res;
    try {
      res = await fetch(`${c.url}/v1/data`, {
        method, cache: 'no-store',
        headers: Object.assign({ Authorization: `Bearer ${c.code}` }, payload ? { 'Content-Type': 'application/json' } : {}),
        body: payload ? JSON.stringify(payload) : undefined
      });
    } catch (e) { throw new Error(t('errNoServer')); }
    if (res.status === 401 || res.status === 403) throw new Error(t('errWrongCode'));
    const data = await res.json().catch(() => null);
    if (!res.ok && res.status !== 409) throw new Error(data && data.error ? data.error : t('errServer', res.status));
    return { status: res.status, data };
  }
  function syncStatusText() {
    if (!syncReady()) return t('notSetUp');
    if (syncState === 'busy') return t('syncing');
    if (settings.sync.lastError) return t('syncErr', settings.sync.lastError);
    if (settings.sync.lastSync) return t('syncedAgo', t('relTime', Math.floor((Date.now() - settings.sync.lastSync) / 60000)));
    return '';
  }
  function showSyncStatus() { const el = $('#sync-status'); if (el) el.textContent = syncStatusText(); }
  async function runSync(manual) {
    if (!syncReady()) { if (manual) toast(t('needUrlCode')); return; }
    if (!navigator.onLine) { if (manual) toast(t('syncErr', t('errOfflineSync'))); return; }
    if (syncBusy) { syncAgain = true; return; }
    syncBusy = true; syncState = 'busy'; showSyncStatus();
    const countBefore = log.sessions.length;
    let changed = false;
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const got = await syncApi('GET');
        const remote = got.data && typeof got.data === 'object' ? got.data : { rev: 0, data: null };
        const merged = mergePayload(localPayload(), remote.data);
        if (applyPayload(merged)) changed = true;
        if (remote.data && JSON.stringify(merged) === JSON.stringify(remote.data)) break;
        const put = await syncApi('PUT', { baseRev: remote.rev || 0, data: merged });
        if (put.status === 409) continue;
        break;
      }
      settings.sync.lastSync = Date.now();
      settings.sync.lastError = null;
      if (manual || log.sessions.length > countBefore) toast(log.sessions.length > countBefore ? t('syncPulled') : t('syncDone'));
    } catch (e) {
      settings.sync.lastError = e.message;
      if (manual) toast(t('syncErr', e.message));
    } finally {
      saveSettings();
      syncBusy = false; syncState = null;
      showSyncStatus();
      if (changed) {
        const a = document.activeElement;
        if (a && a.matches('input, textarea, select')) pendingRender = true; else render();
      }
      if (syncAgain) { syncAgain = false; scheduleSync(500); }
    }
  }
  document.addEventListener('focusout', () => { if (pendingRender) setTimeout(() => { const a = document.activeElement; if (pendingRender && !(a && a.matches('input, textarea, select'))) { pendingRender = false; render(); } }, 200); });
  window.addEventListener('online', () => scheduleSync(800));
  function newCode() {
    const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    return [...crypto.getRandomValues(new Uint8Array(32))].map((b) => abc[b % abc.length]).join('');
  }
  function makeSyncCode() {
    const code = newCode();
    const inp = $('#sync-code');
    if (inp) inp.value = code;
    navigator.clipboard.writeText(code).then(() => toast(t('codeCopied')), () => {});
  }
  async function saveSyncSettings() {
    let raw = String(($('#sync-url') || {}).value || '').trim();
    let code = String(($('#sync-code') || {}).value || '').trim();
    // A whole "link for another device" pasted into the address box works too.
    const linkPart = raw.match(/#sync=([^&]+)&code=([^&\s]+)/);
    if (linkPart) { raw = decodeURIComponent(linkPart[1]); code = decodeURIComponent(linkPart[2]); }
    const url = normUrl(raw);
    const problem = urlProblem(url);
    if (problem) { toast(problem); return; }
    if (!code) {
      // Only make a new code for a server nobody has claimed yet.
      try {
        const r = await fetch(`${url}/v1/ping`, { cache: 'no-store' });
        const info = await r.json();
        if (info && info.claimed) { toast(t('serverClaimed')); return; }
      } catch (e) { toast(t('syncErr', t('errNoServer'))); return; }
      code = newCode();
    }
    settings.sync = { url, code, lastSync: null, lastError: null };
    saveSettings();
    render();
    runSync(true);
  }
  function syncLink() {
    return `${location.origin}${location.pathname}#sync=${encodeURIComponent(settings.sync.url)}&code=${encodeURIComponent(settings.sync.code)}`;
  }
  function copySyncLink() {
    const link = syncLink();
    navigator.clipboard.writeText(link).then(() => toast(t('linkCopied')), () => {
      openSheet(`<h3>${t('copyLink')}</h3><label class="field"><textarea rows="4" readonly id="link-text" dir="ltr">${esc(link)}</textarea></label><button class="btn ghost wide" data-act="close-sheet">${t('doneBtn')}</button>`);
      const ta = $('#link-text'); ta.focus(); ta.select();
    });
  }
  function readSyncLink() {
    if (!location.hash.startsWith('#sync=')) return;
    const p = new URLSearchParams(location.hash.slice(1));
    const url = normUrl(p.get('sync')), code = (p.get('code') || '').trim();
    history.replaceState(null, '', location.pathname + location.search);
    if (url && code && !urlProblem(url) && confirm(t('connectQ'))) {
      settings.sync = { url, code, lastSync: null, lastError: null };
      saveSettings();
      if (ui.tab === 'settings') render();
      runSync(true);
    }
  }
  function syncBox() {
    const c = settings.sync || settings.syncLast || {};
    return `<div class="opt-row stack sync-box"><div class="grow"><b>${ICON.sync}${t('syncT')}</b><span class="small muted">${t('syncHelp')}</span></div>
      <label class="field"><span>${t('syncUrl')}</span><input id="sync-url" type="url" dir="ltr" inputmode="url" autocomplete="off" spellcheck="false" placeholder="https://workout-sync.yourname.workers.dev" value="${esc(c.url || '')}"></label>
      <label class="field"><span>${t('syncCode')}</span><input id="sync-code" dir="ltr" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(c.code || '')}"><span class="help">${t('syncCodeHelp')}</span></label>
      <div class="row wrap"><button class="btn sm primary" data-act="sync-save">${t('saveSync')}</button>${syncReady() || c.code ? '' : `<button class="btn sm ghost" data-act="sync-make">${t('makeCode')}</button>`}</div>
      ${syncReady() ? `<div class="row wrap"><button class="btn sm soft" data-act="sync-now">${ICON.sync}${t('syncNow')}</button><button class="btn sm soft" data-act="sync-link">${t('copyLink')}</button><button class="btn sm ghost danger" data-act="sync-off">${t('turnOff')}</button></div>` : ''}
      <p class="small muted sync-status" id="sync-status">${esc(syncStatusText())}</p>
    </div>`;
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
    const labels = [current ? t('workout') : t('today'), t('history'), t('program'), t('settings')];
    nav.querySelectorAll('button').forEach((b, j) => {
      if (j === i) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
      b.querySelector('.tab-l').textContent = labels[j];
    });
  }
  function applyTheme() {
    const th = settings.theme || 'dark';
    document.documentElement.dataset.theme = th;
    const dark = th === 'dark' || (th === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#121418' : '#eef0f3';
  }
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);
  function applyLang() {
    const h = document.documentElement;
    h.lang = settings.lang === 'ar' ? 'ar' : 'en';
    h.dir = t('dir');
    const add = $('#timer [data-t="add"]'), skip = $('#timer [data-t="skip"]');
    if (add) { add.textContent = t('plus15'); add.setAttribute('aria-label', t('plus15Aria')); }
    if (skip) skip.textContent = t('skip');
    document.title = L() ? 'تمارين علوي/سفلي' : 'Rolling Upper/Lower';
  }
  function render() {
    checkDeloadEnd();
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
      if (el) el.textContent = total ? t('photoStat', ok, total) : t('allBuiltIn');
    });
  }

  // ---------- Events ----------
  document.addEventListener('click', async (e) => {
    const el = e.target.closest('[data-act]');
    if (!el || el.tagName === 'INPUT') return;
    const act = el.dataset.act, exId = el.dataset.ex, sid = el.dataset.session;
    switch (act) {
      case 'noop': break;
      case 'tab': if (ui.tab !== el.dataset.tab) { ui.viewAnim = true; ui.intro = true; } ui.tab = el.dataset.tab; ui.histOpen = null; render(); window.scrollTo(0, 0); break;
      case 'start': startWorkout(sid); break;
      case 'pick-sheet': sheetPick(); break;
      case 'pick': ui.override = sid === nextSessionId() ? null : sid; ui.popPlate = sid; closeSheet(); render(); break;
      case 'clear-override': ui.override = null; ui.popPlate = nextSessionId(); render(); break;
      case 'toggle': ui.open = ui.open === exId ? '' : exId; if (ui.open) ui.justOpened = exId; render(); if (ui.open) scrollToEx(exId); break;
      case 'check': checkSet(exId, +el.dataset.i); break;
      case 'addset': {
        const ex = sessionById(current.sessionId).exercises.find((x) => x.id === exId);
        const st = exState(ex); st.sets.push(newSet()); st.done = false; ui.open = exId; saveCurrent(); render();
        const inp = document.querySelector(`input[data-ex="${exId}"][data-i="${st.sets.length - 1}"]`);
        if (inp) inp.focus({ preventScroll: false });
        break;
      }
      case 'rmset': { const st = current.ex[exId]; st.sets.splice(+el.dataset.i, 1); saveCurrent(); render(); break; }
      case 'exdone': {
        const s = sessionById(current.sessionId); const idx = s.exercises.findIndex((x) => x.id === exId);
        current.ex[exId].done = true; saveCurrent(); ui.open = exId; render();
        moveOnLater(exId, nextUndone(s, idx));
        break;
      }
      case 'exundo': current.ex[exId].done = false; ui.open = exId; saveCurrent(); render(); break;
      case 'zoom': {
        if (el.dataset.custom) { const u = blobUrls.get(el.dataset.custom); if (u) openViewer([u], el.dataset.title || ''); }
        else if (el.dataset.srcs) openViewer(el.dataset.srcs.split('|'), el.dataset.title || '');
        break;
      }
      case 'close-viewer': if (e.target === el || el.classList.contains('v-close') || el.closest('.v-close')) closeViewer(); break;
      case 'v-mode': {
        const stage = $('#viewer-root .v-stage');
        stage.className = `v-stage mode-${el.dataset.mode}`;
        el.parentElement.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === el)));
        break;
      }
      case 'finish': finishWorkout(); break;
      case 'discard': discardWorkout(); break;
      case 'hist-mode': ui.histMode = el.dataset.mode; ui.histOpen = null; ui.intro = true; render(); break;
      case 'hist-open': ui.histOpen = ui.histOpen === el.dataset.id ? null : el.dataset.id; render(); break;
      case 'date-sheet': sheetDate(el.dataset.id); break;
      case 'date-quick': { const inp = $('#wd-date'); if (inp) inp.value = el.dataset.date; el.parentElement.querySelectorAll('.chip').forEach((b) => b.setAttribute('aria-pressed', String(b === el))); break; }
      case 'date-save': saveWorkoutDate(el.dataset.id); break;
      case 'hist-del': if (confirm(t('deleteWorkoutQ'))) { log.deleted = [...(log.deleted || []), el.dataset.id]; log.sessions = log.sessions.filter((w) => w.id !== el.dataset.id); saveLog(); ui.histOpen = null; render(); } break;
      case 'close-sheet': if (e.target === el || el.tagName === 'BUTTON') closeSheet(); break;
      case 'coach-sheet': if (el.dataset.preset) ui.coach = el.dataset.preset; sheetCoach(); break;
      case 'coach-preset': ui.coach = el.dataset.preset; el.parentElement.querySelectorAll('.opt').forEach((b) => b.setAttribute('aria-checked', String(b === el))); break;
      case 'coach-copy': copyCoachPrompt(); break;
      case 'import-sheet': sheetImport(); break;
      case 'check-import': checkImport(); break;
      case 'apply-import': applyImport(); break;
      case 'add-ex': sheetState = { sessionId: sid }; sheetLibrary('add', sid); break;
      case 'blank-ex': sheetEditExercise(newExerciseDraft(sheetState.libSession, null)); break;
      case 'lib-choose': {
        if (sheetState && sheetState.libMode === 'photo' && sheetState.ex) { sheetState.ex.library = el.dataset.lib; delete sheetState.ex.photo; sheetState.libMode = null; sheetEditExercise(sheetState); }
        else sheetEditExercise(newExerciseDraft(sheetState.libSession, el.dataset.lib));
        break;
      }
      case 'edit-ex': { const s = sessionById(sid); const ex = s.exercises.find((x) => x.id === exId); sheetEditExercise({ sessionId: sid, isNew: false, origId: exId, ex: clone(ex) }); break; }
      case 'move-ex': { const s = sessionById(sid); const i = s.exercises.findIndex((x) => x.id === exId); const j = i + +el.dataset.dir; if (j < 0 || j >= s.exercises.length) break; [s.exercises[i], s.exercises[j]] = [s.exercises[j], s.exercises[i]]; saveProgram(); render(); break; }
      case 'chip': el.setAttribute('aria-pressed', el.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); break;
      case 'lib-photo': readExerciseForm(); sheetLibrary('photo', sheetState.sessionId); break;
      case 'back-to-edit': sheetState.libMode = null; sheetEditExercise(sheetState); break;
      case 'no-photo': readExerciseForm(); sheetState.ex.library = null; delete sheetState.ex.photo; sheetEditExercise(sheetState); break;
      case 'delete-ex': {
        if (!confirm(t('deleteExQ'))) break;
        const s = sessionById(sheetState.sessionId); s.exercises = s.exercises.filter((x) => x.id !== sheetState.origId); saveProgram(); closeSheet(); render(); break;
      }
      case 'edit-session': sheetSession(sid || null); break;
      case 'swatch': $('#session-form').querySelectorAll('.swatch').forEach((b) => b.setAttribute('aria-pressed', String(b === el))); sheetState.color = el.dataset.color; break;
      case 'move-session': {
        const list = program.sessions; const i = list.findIndex((s) => s.id === sheetState.sessionId); const j = i + +el.dataset.dir;
        if (j < 0 || j >= list.length) break; [list[i], list[j]] = [list[j], list[i]]; saveProgram(); render(); sheetSession(sheetState.sessionId); break;
      }
      case 'delete-session': {
        if (!confirm(t('deleteSessionQ'))) break;
        program.sessions = program.sessions.filter((s) => s.id !== sheetState.sessionId); saveProgram(); closeSheet(); render(); break;
      }
      case 'profile-sheet': sheetProfile(); break;
      case 'toggle-setting': {
        const key = el.dataset.key;
        if (key === 'rampIn') { program.rampIn = Object.assign({ weeks: 2, maxSets: 3 }, program.rampIn || {}); program.rampIn.enabled = !program.rampIn.enabled; saveProgram(); }
        else { settings[key] = !settings[key]; saveSettings(); if (key === 'wakeLock') { if (settings.wakeLock) wakeOn(); else wakeOff(); } }
        render(); break;
      }
      case 'theme': settings.theme = el.dataset.themePick; saveSettings(); applyTheme(); render(); break;
      case 'lang': settings.lang = el.dataset.langPick; saveSettings(); applyLang(); ui.viewAnim = true; render(); break;
      case 'block-weeks': settings.blockWeeks = +el.dataset.weeks; saveShared(); render(); break;
      case 'deload-start': settings.deload = { start: Date.now(), end: startOfDay(Date.now()) + 7 * DAY }; saveShared(); render(); break;
      case 'deload-end': settings.deload = null; settings.blockStart = Date.now(); saveShared(); render(); break;
      case 'progress-sheet': sheetProgress(); break;
      case 'sync-save': saveSyncSettings(); break;
      case 'sync-make': makeSyncCode(); break;
      case 'sync-now': runSync(true); break;
      case 'sync-link': copySyncLink(); break;
      case 'sync-off': if (confirm(t('offQ'))) { settings.syncLast = { url: settings.sync.url, code: settings.sync.code }; settings.sync = null; saveSettings(); render(); toast(t('syncOff')); } break;
      case 'prefetch': {
        if (!navigator.onLine) { toast(t('offline')); break; }
        el.disabled = true; el.textContent = t('downloading');
        const r = await prefetchPhotos();
        toast(r.total ? t('photosSaved', r.ok, r.total) : t('allBuiltIn'));
        render(); break;
      }
      case 'backup': backup(true); break;
      case 'backup-dl': backup(false); break;
      case 'reset-program': if (confirm(t('resetQ'))) { program = clone(window.DEFAULT_PROGRAM); saveProgram(); ui.override = null; render(); toast(t('resetDone')); } break;
      case 'clear-history': if (confirm(t('clearQ'))) { log = { sessions: [], deleted: [...(log.deleted || []), ...log.sessions.map((w) => w.id)] }; saveLog(); render(); toast(t('cleared')); } break;
      case 'close-cele': closeCele(); break;
      default: break;
    }
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role="button"][data-act]')) { e.preventDefault(); e.target.click(); }
    if (e.key === 'Escape') {
      if ($('#viewer-root').innerHTML) closeViewer();
      else if ($('#sheet-root').innerHTML) closeSheet();
    }
  });
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.f && current) {
      const st = current.ex[el.dataset.ex];
      if (st) { st.sets[+el.dataset.i][el.dataset.f] = el.value; saveCurrent(); }
    }
    if (el.id === 'lib-q') renderLibResults(el.value);
  });
  document.addEventListener('change', async (e) => {
    const el = e.target;
    if (el.dataset.act === 'restore' && el.files[0]) { await restore(el.files[0]); el.value = ''; }
    if (el.dataset.act === 'own-photo' && el.files[0]) {
      readExerciseForm();
      try { const key = await saveOwnPhoto(el.files[0]); sheetState.ex.photo = `custom:${key}`; sheetEditExercise(sheetState); }
      catch (err) { toast(t('photoReadFail')); }
    }
  });
  document.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    if (f.id === 'ex-form') saveExerciseDraft();
    if (f.id === 'profile-form') saveProfile(f);
    if (f.id === 'session-form') {
      const name = f.name.value.trim();
      if (!name) { toast(t('sessionNameNeeded')); return; }
      const focus = f.focus.value.trim();
      let s;
      if (sheetState.sessionId) { s = sessionById(sheetState.sessionId); s.name = name; s.color = sheetState.color; }
      else {
        let id = slug(name), n = 2;
        while (sessionById(id)) id = `${slug(name)}-${n++}`;
        s = { id, name, focus: '', color: sheetState.color, exercises: [] };
        program.sessions.push(s);
      }
      if (L()) { s.ar = Object.assign({}, s.ar || {}, { name: f.arname.value.trim(), focus }); }
      else s.focus = focus;
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
  applyLang();
  buildNav();
  render();
  if (current) wakeOn();
  readSyncLink();
  if (syncReady()) setTimeout(() => runSync(false), 400);
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController) toast(t('appUpdated')); });
    navigator.serviceWorker.register('sw.js').then(() => { if (navigator.onLine) prefetchPhotos(); }).catch(() => {});
  }
  window.__app = { get program() { return program; }, get log() { return log; }, get settings() { return settings; }, render, runSync: () => runSync(true), mergePayload, exStatuses: () => Object.fromEntries(exStatuses()), coachPrompt: (p, n) => coachPrompt(p || 'review', n || '') };
})();
