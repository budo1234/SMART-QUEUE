/* Smart Queue - actions.js: button handlers (sign in, create queue, assign slot, ...), click wiring and app start-up */
"use strict";
/* ---------- actions ---------- */
const val = id => ($('#' + id)?.value ?? '').trim();
function assignSlot(slotId, userId) {
  const s = DB.slots.find(x => x.id === slotId), q = queueById(s.qid);
  const old = DB.slots.find(x => x.qid === s.qid && x.userId === userId && x.id !== slotId && ['pending', 'rescheduled'].includes(x.status));
  const prev = s.userId;
  if (old) { old.userId = null; old.status = 'pending'; old.reminded = false; }
  if (prev && prev !== userId) notify(prev, 'Your slot has been cancelled. Contact the organiser');
  s.userId = userId; s.status = 'pending'; s.absentUser = null; s.reminded = false;
  notify(userId, old || prev === userId ? `Your slot has been updated to ${f12(s.time)} (slot #${s.n}) on ${fShort(q.date)}` : `You have been given slot #${s.n} at ${f12(s.time)} on ${fShort(q.date)} — ${q.name}`);
}
function cancelQueue(q, text, status) {
  q.status = status; DB.slots.filter(s => s.qid === q.id && s.userId).forEach(s => notify(s.userId, text));
}
function getQForm() {
  const d = { name: val('qn'), venue: val('qv'), date: val('qd'), start: val('qs'), end: val('qe'), dur: +val('qm'), allowResched: $('#qr').checked };
  if (!d.name || !d.venue || !d.date || !d.start || !d.end || !d.dur) { toast('Please fill in every field'); return null; }
  if (d.date < isoDate(new Date())) { toast('Date cannot be in the past'); return null; }
  if (Math.floor((toMin(d.end) - toMin(d.start)) / d.dur) < 1) { toast('Time range is too short for one slot'); return null; }
  return d;
}
const A = {
  tab: d => tab(d.r), back, goto: d => go(d.r, { id: d.id }),
  skip() { DB.seenOnboard = true; save(); tab('signin'); },
  next() { const i = (S.p.i || 0) + 1; if (i >= SLIDES.length) A.skip(); else { S.p = { i }; render(); } },
  fill(d) { $('#id').value = d.i; $('#pw').value = d.p; },
  signin() {
    const id = val('id').toLowerCase(), pw = $('#pw').value, ph = id.replace(/\s/g, '');
    const u = DB.users.find(x => (x.email.toLowerCase() === id || x.phone.replace(/\s/g, '') === ph) && x.password === pw);
    if (!u) return toast('Incorrect email/phone or password');
    if (!u.active) return toast('This account has been deactivated');
    DB.session = u.id; save(); tab(homeFor(u)); reminders();
  },
  signup() {
    const nm = val('nm'), em = val('em').toLowerCase(), ph = val('ph'), pw = $('#pw').value;
    if (nm.length < 2) return toast('Enter your full name');
    if (!/^\S+@\S+\.\S+$/.test(em)) return toast('Enter a valid email');
    if (ph.replace(/\D/g, '').length < 7) return toast('Enter a valid phone number');
    if (pw.length < 6) return toast('Password needs at least 6 characters');
    if (DB.users.some(u => u.email.toLowerCase() === em || u.phone.replace(/\s/g, '') === ph.replace(/\s/g, ''))) return toast('An account with that email or phone already exists');
    S.pending = { id: uid(), name: nm, email: em, phone: ph, password: pw, role: 'user', active: true, otp: String(Math.floor(100000 + Math.random() * 900000)) };
    go('otp', {}, true);
  },
  verify() {
    if (val('otp') !== S.pending.otp) return toast('That code is not correct');
    const { otp, ...u } = S.pending; DB.users.push(u); DB.session = u.id; S.pending = null; save(); toast('Welcome to Smart Queue!'); tab('home');
  },
  signout() { DB.session = null; save(); S.stack = []; S.r = 'signin'; render(); },
  saveprofile() { const u = cur(), nm = val('nm'), ph = val('ph'); if (nm.length < 2 || ph.replace(/\D/g, '').length < 7) return toast('Check your name and phone'); u.name = nm; u.phone = ph; save(); toast('Profile updated'); render(); },
  readall() { DB.notifs.forEach(n => { if (n.userId === DB.session) n.read = true; }); save(); render(); },
  async togglenotif() {
    if (DB.notifOn) { DB.notifOn = false; save(); return render(); }
    if (!('Notification' in window)) return toast('This browser does not support notifications');
    try { const r = await Notification.requestPermission(); DB.notifOn = r === 'granted'; toast(DB.notifOn ? 'Notifications enabled' : 'Permission was not granted'); } catch (e) { toast('Could not enable notifications'); }
    save(); render();
  },
  theme(d) { const r = document.documentElement; if (d.t === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', d.t); },
  reset() { if (confirm('Reset all demo data on this device?')) { DB = seed(); save(); S.stack = []; S.r = 'signin'; render(); } },
  filter(d) { S.filter = d.f; render(); },
  /* user */
  sendresched(d) {
    const s = DB.slots.find(x => x.id === d.id), ns = val('ns'); if (!ns) return;
    DB.reqs.push({ id: uid(), slotId: s.id, newSlotId: ns, userId: s.userId, note: val('why'), status: 'pending' });
    const q = queueById(s.qid); notify(q.adminId, `${cur().name} requested to reschedule slot #${s.n}`);
    save(); toast('Request sent'); back();
  },
  /* admin */
  createq() {
    const d = getQForm(); if (!d) return;
    const q = { id: uid(), adminId: cur().id, status: 'open', created: Date.now(), ...d };
    DB.queues.push(q); DB.slots.push(...mkSlots(q.id, d.start, d.end, d.dur)); save(); toast('Queue created'); S.stack = []; go('queue', { id: q.id }, true);
  },
  saveq(d) {
    const q = queueById(d.id), f = getQForm(); if (!f) return;
    const locked = DB.slots.some(s => s.qid === q.id && s.userId);
    Object.assign(q, { name: f.name, venue: f.venue, date: f.date, allowResched: f.allowResched });
    if (!locked) { Object.assign(q, { start: f.start, end: f.end, dur: f.dur }); DB.slots = DB.slots.filter(s => s.qid !== q.id); DB.slots.push(...mkSlots(q.id, f.start, f.end, f.dur)); }
    DB.slots.filter(s => s.qid === q.id && s.userId).forEach(s => notify(s.userId, `Queue details updated: ${q.name} on ${fShort(q.date)}`));
    save(); toast('Queue updated'); back();
  },
  cancelq(d) { const q = queueById(d.id); if (!confirm('Cancel this queue? All assigned users will be notified.')) return; cancelQueue(q, `The event has been cancelled: ${q.name}`, 'cancelled'); save(); toast('Queue cancelled'); S.stack = []; tab(cur().role === 'admin' ? 'dash' : 'overview'); },
  closeq(d) { const q = queueById(d.id); if (!confirm('Mark this queue as complete?')) return; q.status = 'closed'; save(); toast('Queue closed'); render(); },
  deactq(d) { const q = queueById(d.id); if (!confirm('Deactivate this queue? Assigned users will be notified.')) return; cancelQueue(q, `The event has been cancelled: ${q.name}`, 'cancelled'); save(); toast('Queue deactivated'); render(); },
  arrive(d) { const s = DB.slots.find(x => x.id === d.id); s.status = 'arrived'; save(); render(); },
  absent(d) { const s = DB.slots.find(x => x.id === d.id), u = s.userId; s.status = 'absent'; s.absentUser = u; s.userId = null; notify(u, 'You were marked absent and your slot has been released. Contact the organiser'); save(); render(); },
  removeslot(d) { const s = DB.slots.find(x => x.id === d.id); if (!confirm('Remove this user from the slot?')) return; notify(s.userId, 'Your slot has been cancelled. Contact the organiser'); s.userId = null; s.status = 'pending'; s.reminded = false; save(); render(); },
  doassign(d) { const sid = val('sl'); assignSlot(sid, d.u); save(); toast('Slot assigned to ' + userById(d.u).name); back(); },
  approve(d) {
    const r = DB.reqs.find(x => x.id === d.id), o = DB.slots.find(s => s.id === r.slotId), n = DB.slots.find(s => s.id === r.newSlotId);
    if (!n || n.userId) return toast('That slot is no longer free. Reject, or reassign manually');
    o.userId = null; o.status = 'pending'; o.reminded = false; n.userId = r.userId; n.status = 'rescheduled'; n.reminded = false; r.status = 'approved';
    notify(r.userId, `Reschedule approved. Your new slot is #${n.n} at ${f12(n.time)}`); save(); render();
  },
  reject(d) { const r = DB.reqs.find(x => x.id === d.id); r.status = 'rejected'; notify(r.userId, 'Your reschedule request was rejected. Your original slot stands'); save(); render(); },
  /* super */
  makeadmin() {
    const nm = val('nm'), em = val('em').toLowerCase(), ph = val('ph'), pw = val('pw');
    if (nm.length < 2 || !/^\S+@\S+\.\S+$/.test(em) || ph.replace(/\D/g, '').length < 7) return toast('Check name, email and phone');
    if (pw.length < 6) return toast('Password needs at least 6 characters');
    if (DB.users.some(u => u.email.toLowerCase() === em)) return toast('That email is already registered');
    DB.users.push({ id: uid(), name: nm, email: em, phone: ph, password: pw, role: 'admin', active: true, by: DB.session }); save(); toast('Admin created'); back();
  },
  toggleadmin(d) {
    const a = userById(d.id); a.active = !a.active;
    if (!a.active) DB.queues.filter(q => q.adminId === a.id && q.status === 'open').forEach(q => cancelQueue(q, `The event has been cancelled: ${q.name}`, 'cancelled'));
    save(); toast(a.active ? 'Admin reactivated' : 'Admin deactivated'); render();
  }
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = A[el.dataset.act]; if (fn) fn(el.dataset);
});

/* mark alerts as read when viewing */
const _render = render;
render = function () { if (S.r === 'notifs' && DB.session) { const was = unread(); _render(); if (was) { setTimeout(() => { DB.notifs.forEach(n => { if (n.userId === DB.session) n.read = true; }); save(); const t = document.querySelector('.tab .badge'); if (t) t.remove(); }, 1200); } } else _render(); };

/* offline + install */
try{if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(rs=>rs.forEach(r=>r.unregister())).catch(()=>{})}if(window.caches){caches.keys().then(ks=>ks.forEach(k=>caches.delete(k))).catch(()=>{})}}catch(e){}
/* boot */
render();
function bootNext() {
  if (S.r !== 'splash') return;
  try { const u = cur(); if (u) tab(homeFor(u)); else if (!DB.seenOnboard) { S.r = 'onboard'; S.p = { i: 0 }; render(); } else tab('signin'); reminders(); }
  catch (e) { S.r = 'signin'; try { render(); } catch (e2) {} }
}
setTimeout(bootNext, 450);
setTimeout(bootNext, 2000);
