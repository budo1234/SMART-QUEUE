/* Smart Queue - views.js: every screen (user, admin, super admin, shared) and the render function */
"use strict";
/* ---------- shell ---------- */
function tabsFor(u) {
  if (u.role === 'user') return [['home', 'Home', 'home'], ['myq', 'My Queue', 'ticket'], ['hist', 'History', 'clock'], ['notifs', 'Alerts', 'bell'], ['profile', 'Profile', 'user']];
  if (u.role === 'admin') return [['dash', 'Queues', 'list'], ['newq', 'New', 'plus'], ['notifs', 'Alerts', 'bell'], ['profile', 'Profile', 'user']];
  return [['admins', 'Admins', 'users'], ['overview', 'Overview', 'grid'], ['notifs', 'Alerts', 'bell'], ['profile', 'Profile', 'user']];
}
function shell(title, body, o = {}) {
  const u = cur();
  const tb = u && o.tabs !== false ? `<nav class="tabbar">${tabsFor(u).map(([k, l, i]) => `<button class="tab ${S.r === k || (o.tabOf === k) ? 'on' : ''}" data-act="tab" data-r="${k}">${svg(i)}${l}${k === 'notifs' && unread() ? `<span class="badge">${unread()}</span>` : ''}</button>`).join('')}</nav>` : '';
  return `<header class="top">${o.back ? `<button class="iconbtn" data-act="back" aria-label="Back">${svg('back')}</button>` : ''}<h1>${esc(title)}</h1>${o.right || ''}</header><main>${body}</main>${tb}`;
}
const empty = (icon, h, t) => `<div class="empty"><div class="ring">${svg(icon)}</div><b style="color:var(--ink)">${esc(h)}</b><div>${esc(t)}</div></div>`;
const pill = (cls, t) => `<span class="pill p-${cls}">${esc(t)}</span>`;

/* ---------- views ---------- */
const V = {};
V.splash = () => `<div class="center"><div class="logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><h1 style="margin:0;font-size:30px;letter-spacing:-.02em">Smart Queue</h1><div class="mute">Right place. Right time.</div></div>`;

const SLIDES = [
  ['Skip the crowd', 'No more standing for hours. Get a time slot and show up only when it is your turn.', 'users'],
  ['Know your number', 'See your queue number, how many people are ahead of you, and a live countdown to your slot.', 'ticket'],
  ['Get a heads-up', 'We alert you 10 minutes before your turn, and instantly if anything changes.', 'bell']
];
V.onboard = () => {
  const i = S.p.i || 0, s = SLIDES[i];
  return `<div class="center" style="justify-content:space-between"><div style="width:100%;text-align:right"><button class="link" data-act="skip">Skip</button></div>
  <div><div class="logo" style="margin:0 auto 24px">${svg(s[2]).replace('class="ic"', 'class="ic" style="width:46px;height:46px"')}</div><h1 style="margin:0 0 10px;font-size:28px;letter-spacing:-.02em">${s[0]}</h1><p class="mute" style="font-size:15px;max-width:300px;margin:0 auto">${s[1]}</p></div>
  <div style="width:100%"><div class="dots">${SLIDES.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div><div style="height:18px"></div><button class="btn" data-act="next">${i === SLIDES.length - 1 ? 'Get started' : 'Next'}</button></div></div>`;
};

V.signin = () => `<div style="padding:28px 20px;display:flex;flex-direction:column;gap:6px">
  <div class="logo" style="width:64px;height:64px;border-radius:20px">${svg('clock').replace('class="ic"', 'class="ic" style="width:32px;height:32px"')}</div>
  <h1 style="margin:14px 0 2px;font-size:28px;letter-spacing:-.02em">Welcome back</h1><div class="mute">Sign in with your email or phone number. Admins and Super Admins use this same screen.</div>
  <label for="id">Email or phone</label><input id="id" autocomplete="username" inputmode="email" placeholder="you@example.com">
  <label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" placeholder="••••••••">
  <div style="height:10px"></div><button class="btn" data-act="signin">Sign in</button>
  <div class="row" style="justify-content:center;margin-top:6px"><span class="mute">New here?</span><button class="link" data-act="goto" data-r="signup">Create account</button></div>
  <div class="card" style="margin-top:14px"><b>Demo accounts</b><div class="mute">Tap to fill the form</div>
  <div class="demo"><button class="chip" data-act="fill" data-i="user@smartqueue.app" data-p="user123">User</button><button class="chip" data-act="fill" data-i="admin@smartqueue.app" data-p="admin123">Admin</button><button class="chip" data-act="fill" data-i="super@smartqueue.app" data-p="super123">Super Admin</button></div></div></div>`;

V.signup = () => `<div style="padding:28px 20px">
  <button class="iconbtn" data-act="goto" data-r="signin" aria-label="Back">${svg('back')}</button>
  <h1 style="margin:14px 0 2px;font-size:28px;letter-spacing:-.02em">Create account</h1><div class="mute">Register as a user to receive queue slots.</div>
  <label for="nm">Full name</label><input id="nm" autocomplete="name">
  <label for="em">Email</label><input id="em" type="email" autocomplete="email" inputmode="email">
  <label for="ph">Phone number</label><input id="ph" type="tel" autocomplete="tel" inputmode="tel" placeholder="080…">
  <label for="pw">Password</label><input id="pw" type="password" autocomplete="new-password" placeholder="At least 6 characters">
  <div style="height:14px"></div><button class="btn" data-act="signup">Continue</button></div>`;

V.otp = () => {
  const p = S.pending;
  return `<div style="padding:28px 20px">
  <button class="iconbtn" data-act="goto" data-r="signup" aria-label="Back">${svg('back')}</button>
  <h1 style="margin:14px 0 2px;font-size:28px;letter-spacing:-.02em">Verify your account</h1>
  <div class="mute">Enter the 6-digit code for ${esc(p.email)}.</div>
  <div class="note" style="margin-top:12px">Demo mode: no SMS or email is sent. Your code is <b>${esc(p.otp)}</b>.</div>
  <label for="otp">Verification code</label><input id="otp" inputmode="numeric" maxlength="6" placeholder="000000" style="font-size:24px;letter-spacing:.3em;text-align:center">
  <div style="height:14px"></div><button class="btn" data-act="verify">Verify &amp; continue</button></div>`;
};

/* --- user --- */
function activeSlotsFor(uid_) {
  return DB.slots.filter(s => s.userId === uid_ && ['pending', 'rescheduled'].includes(s.status)).map(s => ({ s, q: queueById(s.qid) })).filter(x => x.q && x.q.status === 'open').sort((a, b) => slotStart(a.q, a.s) - slotStart(b.q, b.s));
}
const ahead = (s) => DB.slots.filter(x => x.qid === s.qid && x.userId && x.n < s.n && ['pending', 'rescheduled'].includes(x.status)).length;
function slotCard(x, big) {
  const { s, q } = x, a = ahead(s), t = slotStart(q, s).getTime();
  return `<div class="card ${big ? 'hero' : ''}">
  <div class="row sp"><div><div class="${big ? '' : 'mute'}" style="${big ? 'opacity:.8;font-size:13px' : ''}">${esc(q.name)}</div><div style="font-weight:700">${esc(q.venue)}</div></div>${s.status === 'rescheduled' ? pill('resched', 'Rescheduled') : ''}</div>
  <div style="height:12px"></div>
  <div class="row sp" style="align-items:flex-end"><div><div class="${big ? '' : 'mute'}" style="${big ? 'opacity:.8;font-size:13px' : ''}">You are</div><div class="big">#${s.n}</div></div>
  <div style="text-align:right"><div style="font-weight:700">${f12(s.time)}</div><div class="${big ? '' : 'mute'}" style="${big ? 'opacity:.85' : ''}">${fDate(q.date)}</div></div></div>
  <div style="height:12px"></div>
  <div class="row sp"><div class="${big ? '' : 'mute'}" style="${big ? 'opacity:.9' : ''}">${a === 0 ? 'You are next in line' : a + ' ' + (a === 1 ? 'person' : 'people') + ' before you'}</div></div>
  ${big ? `<div style="height:10px"></div><div class="mute" style="opacity:.8">Starts in</div><div class="mid" data-cd="${t}">--:--:--</div>` : ''}
  </div>`;
}
V.home = () => {
  const u = cur(), act = activeSlotsFor(u.id);
  let body;
  if (!act.length) body = `<div class="card">${empty('ticket', 'No active slot', 'When an organiser assigns you a time slot, it will show up here with a live countdown.')}</div>`;
  else body = slotCard(act[0], true) + `<div class="two"><button class="btn ghost" data-act="goto" data-r="myq">Slot details</button>${act[0].q.allowResched ? `<button class="btn sec" data-act="goto" data-r="resched" data-id="${act[0].s.id}">Reschedule</button>` : '<span></span>'}</div>` + (act.length > 1 ? '<h2>Other slots</h2>' + act.slice(1).map(x => slotCard(x, false)).join('') : '');
  return shell('Hi, ' + u.name.split(' ')[0], body);
};
V.myq = () => {
  const u = cur(), act = activeSlotsFor(u.id);
  if (!act.length) return shell('My Queue', `<div class="card">${empty('pin', 'Nothing here yet', 'You have no upcoming queue slots.')}</div>`);
  const body = act.map(x => {
    const { s, q } = x, reqs = DB.reqs.filter(r => r.slotId === s.id && r.status === 'pending');
    return slotCard(x, false) + `<div class="card"><div class="row sp"><span class="mute">Venue</span><b>${esc(q.venue)}</b></div><div class="row sp" style="margin-top:8px"><span class="mute">Slot length</span><b>${q.dur} min</b></div><div class="row sp" style="margin-top:8px"><span class="mute">Queue window</span><b>${f12(q.start)} – ${f12(q.end)}</b></div>
    <div style="height:12px"></div>${reqs.length ? `<div class="note">Reschedule request pending admin approval.</div>` : q.allowResched ? `<button class="btn sec" data-act="goto" data-r="resched" data-id="${s.id}">Request reschedule</button>` : `<div class="mute">Rescheduling is not enabled for this queue.</div>`}</div>`;
  }).join('');
  return shell('My Queue', body);
};
V.hist = () => {
  const u = cur();
  const rows = DB.slots.map(s => ({ s, q: queueById(s.qid) })).filter(({ s, q }) => q && ((s.userId === u.id && (s.status === 'arrived' || q.status !== 'open')) || s.absentUser === u.id)).sort((a, b) => slotStart(b.q, b.s) - slotStart(a.q, a.s));
  if (!rows.length) return shell('History', `<div class="card">${empty('clock', 'No history yet', 'Your past queues will appear here.')}</div>`);
  return shell('History', rows.map(({ s, q }) => {
    const out = s.absentUser === u.id ? ['absent', 'Absent'] : s.status === 'arrived' ? ['arrived', 'Attended'] : q.status === 'cancelled' ? ['cancelled', 'Cancelled'] : ['closed', 'Closed'];
    return `<div class="card"><div class="row sp"><b>${esc(q.name)}</b>${pill(out[0], out[1])}</div><div class="mute">${esc(q.venue)}</div><div class="mute" style="margin-top:4px">${fDate(q.date)} · ${f12(s.time)} · Slot #${s.n}</div></div>`;
  }).join(''));
};
V.resched = () => {
  const s = DB.slots.find(x => x.id === S.p.id); if (!s) return shell('Reschedule', empty('clock', 'Not found', ''), { back: true });
  const q = queueById(s.qid), free = slotsOf(q.id).filter(x => !x.userId && x.n > s.n);
  return shell('Request reschedule', `<div class="card"><div class="mute">Current slot</div><b>#${s.n} · ${f12(s.time)} · ${fDate(q.date)}</b>
  ${free.length ? `<label for="ns">Preferred new slot</label><select id="ns">${free.map(x => `<option value="${x.id}">#${x.n} — ${f12(x.time)}</option>`).join('')}</select><label for="why">Reason (optional)</label><textarea id="why" rows="3"></textarea><div style="height:12px"></div><button class="btn" data-act="sendresched" data-id="${s.id}">Send request</button>` : `<div style="height:10px"></div><div class="note">No later free slots are available right now.</div>`}</div>`, { back: true, tabOf: 'home' });
};

/* --- shared --- */
V.notifs = () => {
  const u = cur(), list = DB.notifs.filter(n => n.userId === u.id);
  const body = list.length ? `<button class="btn ghost sm" style="align-self:flex-end" data-act="readall">Mark all read</button>` + list.map(n => `<div class="card notif ${n.read ? '' : 'unread'}"><div style="flex:1">${esc(n.text)}<div class="mute" style="margin-top:4px">${ago(n.ts)}</div></div></div>`).join('') : `<div class="card">${empty('bell', 'All caught up', 'Slot updates and reminders will appear here.')}</div>`;
  return shell('Alerts', body);
};
V.profile = () => {
  const u = cur(), role = { user: 'User', admin: 'Admin', super: 'Super Admin' }[u.role];
  return shell('Profile', `<div class="card"><div class="row"><div class="av" style="width:56px;height:56px;font-size:20px">${esc(u.name[0])}</div><div><b style="font-size:17px">${esc(u.name)}</b><div class="mute">${esc(u.email)}</div>${pill('open', role)}</div></div>
  <label for="nm">Full name</label><input id="nm" value="${esc(u.name)}"><label for="ph">Phone</label><input id="ph" value="${esc(u.phone)}" inputmode="tel"><div style="height:12px"></div><button class="btn" data-act="saveprofile">Save changes</button></div>
  <button class="btn ghost" data-act="goto" data-r="settings">${svg('gear')} Settings</button><button class="btn danger" data-act="signout">Sign out</button>`, { right: '' });
};
V.settings = () => `${''}` + shell('Settings', `<div class="card"><div class="row sp"><div><b>Phone notifications</b><div class="mute">Show system alerts while the app is open (needs permission)</div></div><button class="btn sm ${DB.notifOn ? '' : 'sec'}" data-act="togglenotif">${DB.notifOn ? 'On' : 'Enable'}</button></div></div>
  <div class="card"><b>Appearance</b><div class="chips" style="margin-top:8px"><button class="chip" data-act="theme" data-t="auto">System</button><button class="chip" data-act="theme" data-t="light">Light</button><button class="chip" data-act="theme" data-t="dark">Dark</button></div></div>
  <div class="card"><b>Demo data</b><div class="mute">Reset everything on this device back to the sample queue and demo accounts.</div><div style="height:10px"></div><button class="btn danger sm" data-act="reset">Reset demo data</button></div>
  <div class="note">Smart Queue demo · data is stored on this device only.</div>`, { back: true, tabOf: 'profile' });

/* --- admin --- */
function qStats(q) {
  const sl = slotsOf(q.id);
  return { total: sl.length, done: sl.filter(s => s.status === 'arrived').length, wait: sl.filter(s => s.userId && ['pending', 'rescheduled'].includes(s.status)).length, free: sl.filter(s => !s.userId).length, absent: sl.filter(s => s.status === 'absent').length };
}
const qPill = q => pill(q.status === 'open' ? 'open' : q.status === 'closed' ? 'closed' : 'cancelled', q.status === 'deactivated' ? 'Deactivated' : q.status[0].toUpperCase() + q.status.slice(1));
const qCard = (q, own) => { const st = qStats(q); return `<div class="card" data-act="goto" data-r="queue" data-id="${q.id}" style="cursor:pointer"><div class="row sp"><b>${esc(q.name)}</b>${qPill(q)}</div><div class="mute">${esc(q.venue)} · ${fShort(q.date)} · ${f12(q.start)}–${f12(q.end)}</div>${!own ? `<div class="mute">By ${esc((userById(q.adminId) || {}).name || 'Unknown')}</div>` : ''}<div class="row" style="margin-top:10px;gap:14px"><span class="mute"><b style="color:var(--ink)">${st.total - st.free}</b>/${st.total} assigned</span><span class="mute"><b style="color:var(--ink)">${st.done}</b> done</span><span class="mute"><b style="color:var(--ink)">${st.wait}</b> waiting</span></div></div>`; };
V.dash = () => {
  const u = cur(), qs = DB.queues.filter(q => q.adminId === u.id).sort((a, b) => b.created - a.created);
  const reqs = DB.reqs.filter(r => r.status === 'pending' && qs.some(q => q.id === (DB.slots.find(s => s.id === r.slotId) || {}).qid)).length;
  return shell('My Queues', (reqs ? `<div class="note">${reqs} reschedule request${reqs > 1 ? 's' : ''} awaiting your review.</div>` : '') + (qs.length ? qs.map(q => qCard(q, true)).join('') : `<div class="card">${empty('list', 'No queues yet', 'Create your first queue to start assigning slots.')}</div><button class="btn" data-act="tab" data-r="newq">Create queue</button>`));
};
function queueForm(q) {
  const lock = q && DB.slots.some(s => s.qid === q.id && s.userId);
  return `<div class="card"><label for="qn">Queue name</label><input id="qn" value="${esc(q?.name || '')}" placeholder="Lagos Passport Office — July 5">
  <label for="qv">Location / venue</label><input id="qv" value="${esc(q?.venue || '')}">
  <label for="qd">Date</label><input id="qd" type="date" value="${q?.date || isoDate(new Date())}" min="${isoDate(new Date())}">
  <div class="two"><div><label for="qs">Start time</label><input id="qs" type="time" value="${q?.start || '09:00'}" ${lock ? 'disabled' : ''}></div><div><label for="qe">End time</label><input id="qe" type="time" value="${q?.end || '12:00'}" ${lock ? 'disabled' : ''}></div></div>
  <label for="qm">Minutes per slot</label><input id="qm" type="number" min="1" max="240" value="${q?.dur || 15}" ${lock ? 'disabled' : ''}>
  ${lock ? '<div class="note" style="margin-top:10px">Times and slot length are locked because users are already assigned.</div>' : ''}
  <label style="display:flex;gap:10px;align-items:center;margin-top:14px"><input id="qr" type="checkbox" style="width:20px;height:20px" ${q ? (q.allowResched ? 'checked' : '') : 'checked'}> Allow users to request reschedules</label>
  <div id="calc" class="mute" style="margin-top:10px"></div></div>`;
}
V.newq = () => shell('New Queue', queueForm(null) + `<button class="btn" data-act="createq">Create queue</button>`);
V.editq = () => { const q = queueById(S.p.id); return shell('Edit Queue', queueForm(q) + `<button class="btn" data-act="saveq" data-id="${q.id}">Save changes</button><button class="btn danger" data-act="cancelq" data-id="${q.id}">Cancel queue</button>`, { back: true, tabOf: 'dash' }); };

V.queue = () => {
  const u = cur(), q = queueById(S.p.id); if (!q) return shell('Queue', empty('list', 'Queue not found', ''), { back: true });
  const mine = u.role === 'admin' && q.adminId === u.id, can = mine && q.status === 'open', st = qStats(q), sl = slotsOf(q.id);
  const started = new Date() >= new Date(q.date + 'T' + q.start + ':00');
  const f = S.filter;
  const filt = sl.filter(s => f === 'all' ? true : f === 'pending' ? s.userId && ['pending', 'rescheduled'].includes(s.status) : f === 'arrived' ? s.status === 'arrived' : f === 'absent' ? s.status === 'absent' : !s.userId);
  const reqs = DB.reqs.filter(r => r.status === 'pending' && (DB.slots.find(s => s.id === r.slotId) || {}).qid === q.id);
  const reqHtml = can && reqs.length ? '<h2>Reschedule requests</h2>' + reqs.map(r => { const o = DB.slots.find(s => s.id === r.slotId), n = DB.slots.find(s => s.id === r.newSlotId), us = userById(r.userId); return `<div class="card"><b>${esc(us?.name)}</b><div class="mute">#${o.n} ${f12(o.time)} → #${n ? n.n + ' ' + f12(n.time) : '?'}${n && n.userId ? ' (taken)' : ''}</div>${r.note ? `<div style="margin-top:6px">“${esc(r.note)}”</div>` : ''}<div class="row" style="margin-top:10px"><button class="btn sm" data-act="approve" data-id="${r.id}">Approve</button><button class="btn sm ghost" data-act="reject" data-id="${r.id}">Reject</button></div></div>`; }).join('') : '';
  const cards = filt.map(s => {
    const us = userById(s.userId), over = s.userId && ['pending', 'rescheduled'].includes(s.status) && slotStart(q, s) < new Date();
    const lab = s.status === 'arrived' ? pill('arrived', 'Arrived') : s.userId ? (s.status === 'rescheduled' ? pill('resched', 'Rescheduled') : over ? pill('absent', 'Overdue') : pill('pending', 'Pending')) : s.status === 'absent' ? pill('absent', 'Released') : pill('free', 'Available');
    const nm = us ? esc(us.name) : s.status === 'absent' ? `Free <span class="mute">(absent: ${esc((userById(s.absentUser) || {}).name || '')})</span>` : '<span class="mute">Unassigned</span>';
    let acts = '';
    if (can) {
      if (s.userId && s.status !== 'arrived') acts = `<button class="btn sm" data-act="arrive" data-id="${s.id}">Arrived</button><button class="btn sm ghost" data-act="absent" data-id="${s.id}">Absent</button><button class="btn sm ghost" data-act="goto" data-r="assign" data-id="${s.id}">Reassign</button><button class="btn sm ghost" data-act="removeslot" data-id="${s.id}">Remove</button>`;
      else if (!s.userId) acts = `<button class="btn sm" data-act="goto" data-r="assign" data-id="${s.id}">Assign user</button>`;
    }
    return `<div class="card slot"><div class="num">#${s.n}</div><div><b>${nm}</b><span class="mute">${f12(s.time)}${us ? ' · ' + esc(us.phone) : ''}</span></div>${lab}${acts ? `<div class="acts">${acts}</div>` : ''}</div>`;
  }).join('') || `<div class="card">${empty('list', 'Nothing in this view', '')}</div>`;
  const ctrl = can ? `<div class="two">${!started ? `<button class="btn ghost" data-act="goto" data-r="editq" data-id="${q.id}">Edit</button>` : `<button class="btn ghost" data-act="closeq" data-id="${q.id}">Close queue</button>`}<button class="btn ghost" data-act="cancelq" data-id="${q.id}">Cancel queue</button></div>${!started ? `<button class="btn sec" data-act="closeq" data-id="${q.id}">Close queue</button>` : ''}` : '';
  const sup = u.role === 'super' && q.status === 'open' ? `<button class="btn danger" data-act="deactq" data-id="${q.id}">Deactivate queue</button>` : '';
  return shell('Queue', `<div class="card"><div class="row sp"><b style="font-size:17px">${esc(q.name)}</b>${qPill(q)}</div><div class="mute">${esc(q.venue)}</div><div class="mute">${fDate(q.date)} · ${f12(q.start)}–${f12(q.end)} · ${q.dur} min slots</div></div>
  <div class="stats"><div class="stat"><b>${st.done}</b><span>Done</span></div><div class="stat"><b>${st.wait}</b><span>Waiting</span></div><div class="stat"><b>${st.free}</b><span>Free</span></div><div class="stat"><b>${st.total}</b><span>Total</span></div></div>
  ${ctrl}${sup}${reqHtml}
  <div class="chips">${[['all', 'All'], ['pending', 'Pending'], ['arrived', 'Arrived'], ['absent', 'Released'], ['free', 'Free']].map(([k, l]) => `<button class="chip ${f === k ? 'on' : ''}" data-act="filter" data-f="${k}">${l}</button>`).join('')}</div>${cards}`, { back: true, tabOf: u.role === 'admin' ? 'dash' : 'overview' });
};
V.assign = () => {
  const s = DB.slots.find(x => x.id === S.p.id), q = queueById(s.qid), cands = userMatches('');
  const free = slotsOf(q.id).filter(x => !x.userId);
  return shell('Assign slot', `<div class="card"><div class="mute">${esc(q.name)}</div><label for="sl">Time slot</label><select id="sl">${[...(s.userId ? [s] : []), ...free].map(x => `<option value="${x.id}" ${x.id === s.id ? 'selected' : ''}>#${x.n} — ${f12(x.time)}${x.userId ? ' (current)' : ''}</option>`).join('')}</select>
  <label for="srch">Find registered user</label><input id="srch" placeholder="Search by name or phone" autocomplete="off"></div><div id="ulist" style="display:flex;flex-direction:column;gap:8px">${userList(cands)}</div>`, { back: true, tabOf: 'dash' });
};
function userMatches(t) { t = t.trim().toLowerCase(); return DB.users.filter(u => u.role === 'user' && u.active && (!t || u.name.toLowerCase().includes(t) || u.phone.replace(/\s/g, '').includes(t.replace(/\s/g, '')))); }
const userList = l => l.length ? l.map(u => `<div class="card userrow" data-act="doassign" data-u="${u.id}"><div class="av">${esc(u.name[0])}</div><div style="flex:1"><b>${esc(u.name)}</b><div class="mute">${esc(u.phone)}</div></div><span class="pill p-pending">Assign</span></div>`).join('') : `<div class="card">${empty('users', 'No users found', 'They need to sign up in the app first.')}</div>`;

/* --- super admin --- */
V.admins = () => {
  const ads = DB.users.filter(u => u.role === 'admin');
  return shell('Admins', `<button class="btn" data-act="goto" data-r="newadmin">${svg('plus')} Create admin</button>` + (ads.length ? ads.map(a => `<div class="card"><div class="row sp"><div class="row"><div class="av">${esc(a.name[0])}</div><div><b>${esc(a.name)}</b><div class="mute">${esc(a.email)} · ${esc(a.phone)}</div></div></div>${pill(a.active ? 'open' : 'cancelled', a.active ? 'Active' : 'Inactive')}</div><div class="mute" style="margin-top:8px">${DB.queues.filter(q => q.adminId === a.id).length} queue(s)</div><div style="height:10px"></div><button class="btn sm ${a.active ? 'ghost' : ''}" data-act="toggleadmin" data-id="${a.id}">${a.active ? 'Deactivate' : 'Reactivate'}</button></div>`).join('') : `<div class="card">${empty('users', 'No admins yet', 'Create the first admin account.')}</div>`));
};
V.newadmin = () => shell('Create admin', `<div class="card"><label for="nm">Full name</label><input id="nm"><label for="em">Email</label><input id="em" type="email" inputmode="email"><label for="ph">Phone</label><input id="ph" type="tel" inputmode="tel"><label for="pw">Temporary password</label><input id="pw" type="text" placeholder="At least 6 characters"></div><button class="btn" data-act="makeadmin">Create admin</button>`, { back: true, tabOf: 'admins' });
V.overview = () => {
  const qs = [...DB.queues].sort((a, b) => b.created - a.created), us = DB.users;
  return shell('Platform overview', `<div class="stats"><div class="stat"><b>${us.filter(u => u.role === 'admin').length}</b><span>Admins</span></div><div class="stat"><b>${us.filter(u => u.role === 'user').length}</b><span>Users</span></div><div class="stat"><b>${qs.filter(q => q.status === 'open').length}</b><span>Open</span></div><div class="stat"><b>${DB.slots.filter(s => s.userId).length}</b><span>Slots</span></div></div><h2>All queues</h2>` + (qs.length ? qs.map(q => qCard(q, false)).join('') : `<div class="card">${empty('grid', 'No queues', '')}</div>`));
};

/* ---------- render ---------- */
function render() {
  const u = cur();
  const open = ['splash', 'onboard', 'signin', 'signup', 'otp'];
  if (!u && !open.includes(S.r)) S.r = 'signin';
  if (u && open.includes(S.r)) S.r = homeFor(u);
  if (u) { const allowed = { user: ['home', 'myq', 'hist', 'resched', 'notifs', 'profile', 'settings'], admin: ['dash', 'newq', 'editq', 'queue', 'assign', 'notifs', 'profile', 'settings'], super: ['admins', 'newadmin', 'overview', 'queue', 'notifs', 'profile', 'settings'] }[u.role]; if (!allowed.includes(S.r)) S.r = homeFor(u); }
  try { $('#app').innerHTML = (V[S.r] || V.signin)(); } catch (e) { console.error(e); $('#app').innerHTML = '<div class="center"><b>Something went wrong</b><button class="btn" onclick="location.reload()">Reload</button></div>'; }
  if (S.r === 'newq' || S.r === 'editq') { bindCalc(); calc(); }
  if (S.r === 'assign') { const i = $('#srch'); if (i) i.addEventListener('input', () => { $('#ulist').innerHTML = userList(userMatches(i.value)); }); }
  tick();
}
function calc() {
  const el = $('#calc'); if (!el) return;
  const s = $('#qs').value, e = $('#qe').value, d = +$('#qm').value;
  if (!s || !e || !d) { el.textContent = ''; return; }
  const n = Math.floor((toMin(e) - toMin(s)) / d);
  el.innerHTML = n > 0 ? `This creates <b style="color:var(--ink)">${n} slots</b> (${f12(s)} – ${f12(toHM(toMin(s) + n * d))}).` : 'End time must be later than start time by at least one slot.';
}
function bindCalc() { ['qs', 'qe', 'qm'].forEach(i => { const e = $('#' + i); if (e) e.addEventListener('input', calc); }); }
function cd(ms) { const t = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(t / 86400), h = Math.floor(t % 86400 / 3600), m = Math.floor(t % 3600 / 60), s = t % 60; return (d ? d + 'd ' : '') + pad(h) + ':' + pad(m) + ':' + pad(s); }
function tick() { document.querySelectorAll('[data-cd]').forEach(e => { const l = +e.dataset.cd - Date.now(); e.textContent = l <= 0 ? "It's your turn" : cd(l); }); }
function reminders() {
  let ch = false;
  DB.slots.forEach(s => {
    if (!s.userId || s.reminded || !['pending', 'rescheduled'].includes(s.status)) return;
    const q = queueById(s.qid); if (!q || q.status !== 'open') return;
    const diff = slotStart(q, s) - Date.now();
    if (diff <= 10 * 60000 && diff > -5 * 60000) { s.reminded = true; ch = true; notify(s.userId, 'Your turn is in 10 minutes. Please head over now'); }
  });
  if (ch) { save(); const a = document.activeElement; if (!a || !['INPUT', 'TEXTAREA', 'SELECT'].includes(a.tagName)) render(); }
}
setInterval(tick, 1000); setInterval(reminders, 15000);
