/* Smart Queue - store.js: data model, seed data, saving to localStorage, app state, navigation, toast and notifications */
"use strict";
/* ---------- data ---------- */
function mkSlots(qid, start, end, dur) {
  const out = []; let n = 1;
  for (let t = toMin(start); t + dur <= toMin(end); t += dur) out.push({ id: uid(), qid, n: n++, time: toHM(t), userId: null, status: 'pending', absentUser: null, reminded: false });
  return out;
}
function seed() {
  const now = new Date();
  const startMin = Math.ceil((now.getHours() * 60 + now.getMinutes() + 5) / 5) * 5;
  let s = startMin, day = isoDate(now);
  if (s > 20 * 60) { day = isoDate(new Date(now.getTime() + 86400000)); s = 9 * 60; } // late evening: demo queue is tomorrow 9:00
  const sa = { id: 'u_super', name: 'Super Admin', email: 'super@smartqueue.app', phone: '08000000000', password: 'super123', role: 'super', active: true };
  const ad = { id: 'u_admin', name: 'Ngozi Admin', email: 'admin@smartqueue.app', phone: '08011111111', password: 'admin123', role: 'admin', active: true, by: 'u_super' };
  const u1 = { id: 'u_user', name: 'Demo User', email: 'user@smartqueue.app', phone: '08022222222', password: 'user123', role: 'user', active: true };
  const u2 = { id: 'u_amaka', name: 'Amaka Obi', email: 'amaka@example.com', phone: '08033333333', password: 'user123', role: 'user', active: true };
  const u3 = { id: 'u_tunde', name: 'Tunde Bello', email: 'tunde@example.com', phone: '08044444444', password: 'user123', role: 'user', active: true };
  const q = { id: 'q_demo', adminId: ad.id, name: 'Lagos Passport Office — Demo', venue: 'Ikoyi Passport Office', date: day, start: toHM(s), end: toHM(s + 180), dur: 15, status: 'open', allowResched: true, created: Date.now() };
  const slots = mkSlots(q.id, q.start, q.end, q.dur);
  slots[0].userId = u2.id; slots[1].userId = u1.id;
  return { users: [sa, ad, u1, u2, u3], queues: [q], slots, notifs: [], reqs: [], session: null, seenOnboard: false, notifOn: false };
}
function load() { try { const r = localStorage.getItem(K); if (r) return JSON.parse(r); } catch (e) {} return seed(); }
let DB = load();
function save() { try { localStorage.setItem(K, JSON.stringify(DB)); } catch (e) {} }

/* ---------- state ---------- */
const S = { r: 'splash', p: {}, stack: [], filter: 'all', pending: null, q: '' };
const cur = () => DB.users.find(u => u.id === DB.session && u.active) || null;
const userById = id => DB.users.find(u => u.id === id);
const queueById = id => DB.queues.find(q => q.id === id);
const slotsOf = qid => DB.slots.filter(s => s.qid === qid).sort((a, b) => a.n - b.n);
const slotStart = (q, s) => new Date(q.date + 'T' + s.time + ':00');
const unread = () => DB.notifs.filter(n => n.userId === DB.session && !n.read).length;
const homeFor = u => u.role === 'super' ? 'admins' : u.role === 'admin' ? 'dash' : 'home';

function go(r, p = {}, replace = false) { if (!replace) S.stack.push({ r: S.r, p: S.p }); S.r = r; S.p = p; S.filter = 'all'; S.q = ''; render(); window.scrollTo(0, 0); }
function tab(r) { S.stack = []; S.r = r; S.p = {}; S.filter = 'all'; render(); window.scrollTo(0, 0); }
function back() { const b = S.stack.pop(); if (b) { S.r = b.r; S.p = b.p; render(); } else { const u = cur(); tab(u ? homeFor(u) : 'signin'); } }

let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200); }
function notify(userId, text) {
  DB.notifs.unshift({ id: uid(), userId, text, ts: Date.now(), read: false });
  if (userId === DB.session) {
    toast(text);
    try { if (DB.notifOn && 'Notification' in window && Notification.permission === 'granted') new Notification('Smart Queue', { body: text }); } catch (e) {}
  }
}
