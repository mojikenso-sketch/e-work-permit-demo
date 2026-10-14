/* DEMO copy: plain seed data (DemoSeed.gs), seedDemoData_ / setupDemo / demoAutoReset (hourly
 * trigger, re-seed every 5 hours) / resetDemoNow, the demo_info API, the 🔒 premium actions refused
 * by the server (DEMO_LOCKED_ACTIONS), the main API actions on the seeded data, ALL-IN-ONE.gs,
 * the frontend demo pieces (banner, 🔒 buttons, trial-gate.js + DEMO_TRIAL on every page) and
 * the neutral branding of the folder.
 * Run: node test/run.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createGas, GS_ORDER } = require('./gas-mock');

const ROOT = path.join(__dirname, '..');
const PNG_1x1 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const SIG = 'data:image/png;base64,' + PNG_1x1;
const BKK = (iso) => new Date(iso + '+07:00').getTime();

module.exports = function run() {
  let passed = 0;
  const failures = [];
  const check = (name, cond, extra) => {
    if (cond) { passed++; return; }
    failures.push('demo: ' + name + (extra !== undefined ? ' → ' + JSON.stringify(extra).slice(0, 500) : ''));
  };
  const throws = (name, fn, re) => {
    try { fn(); failures.push('demo: ' + name + ' → did not throw'); } catch (e) {
      if (re && !re.test(e.message)) failures.push('demo: ' + name + ' → wrong error: ' + e.message); else passed++;
    }
  };

  const gas = createGas();
  gas.load(path.join(ROOT, 'apps-script'), GS_ORDER); // WP_DEMO stays ON
  const G = gas.context;
  const setNow = (iso) => { gas.clock.offset = BKK(iso) - Date.now(); };
  const post = (b) => JSON.parse(G.doPost({ postData: { contents: JSON.stringify(b) } }).getContent());
  const get = (p) => JSON.parse(G.doGet({ parameter: p }).getContent());
  const S0 = G.DEMO_SEED;

  // ================================================================ plain seed data
  const flows = S0.permits.map((p) => p.flow);
  const nFlow = (re) => flows.filter((f) => re.test(f)).length;
  check('seed: 25 sample permits', S0.permits.length === 25, S0.permits.length);
  check('seed: every status (pending at stages 1–3, approved, expired, closed, rejected)',
    nFlow(/^pending:assign$/) >= 2 && nFlow(/^pending:area$/) >= 1 && nFlow(/^pending:safety$/) >= 1 && nFlow(/^approved$/) >= 4 &&
    nFlow(/^expired$/) >= 2 && nFlow(/^closed$/) >= 5 && nFlow(/^rejected:/) === 3, flows);
  const allTypes = new Set([].concat(...S0.permits.map((p) => p.types)));
  check('seed: work types hot / height / confined / electric / general (+ chemical) covered',
    ['hot', 'height', 'confined', 'electric', 'general', 'chemical'].every((t) => allTypes.has(t)) && [...allTypes].every((t) => G.WP_DATA.workTypes[t]));
  const uByName = Object.fromEntries(S0.users.map((u) => [u.username, u]));
  const roleOf = (u, r) => uByName[u] && uByName[u].roles.split(',').includes(r);
  check('seed: users for every role', ['safety', 'responsible', 'area_owner'].every((r) => S0.users.some((u) => u.roles.split(',').includes(r))));
  check('seed: approvers referenced by the permits hold that role', S0.permits.every((p) =>
    (!p.resp || roleOf(p.resp, 'responsible')) && (!p.area || roleOf(p.area, 'area_owner')) && (!p.safety || roleOf(p.safety, 'safety')) &&
    (p.flow === 'pending:assign' || p.flow === 'rejected:assign' || p.area) && p.resp), S0.permits.filter((p) => !p.resp));
  check('seed: requesters / crews exist, fictional phones (080-000-xxxx) and e-mails (*.example)', S0.permits.every((p) => S0.requesters[p.req] && S0.crews[p.req] && S0.crews[p.req].length >= (p.crew || 1)) &&
    Object.values(S0.requesters).concat(S0.users).every((x) => /^080-000-\d{4}$/.test(x.phone)) && S0.users.every((u) => /@demo-co\.example$/.test(u.email)));
  check('seed: companies = the fictional company only', G.WP_DATA.companies.every((c) => c.indexOf('บริษัท ตัวอย่าง อินดัสทรี จำกัด') === 0) &&
    S0.permits.every((p) => G.WP_DATA.companies[p.company]));
  check('seed: a signature for every person', S0.users.map((u) => u.fullname).concat(Object.values(S0.requesters).map((r) => r.name))
    .every((n) => /^iVBORw0KGgo/.test(G.DEMO_ASSETS.signatures[n] || '')) && /^iVBORw0KGgo/.test(G.DEMO_ASSETS.photo));

  // ================================================================ before setup
  setNow('2026-10-13T10:00:00');
  const di0 = get({ action: 'demo_info' });
  check('demo_info before setup: demo on, no reset yet', di0.ok && di0.data.demo === true && di0.data.last_reset === '' && di0.data.next_reset === '' && di0.data.track_example === null, di0);
  check('demoAutoReset before setup: skipped', G.demoAutoReset().skipped !== undefined);
  throws('seedDemoData_ before setup → SETUP', () => G.seedDemoData_(), /setupSystem/);

  // ================================================================ setupDemo
  const r1 = G.setupDemo();
  check('setupDemo: spreadsheet + folder + seed', gas.spreadsheets.size === 1 && r1.seed.users === 7 && r1.seed.permits === 25 && r1.seed.logs > 60, r1.seed);
  check('setupDemo: Script Properties (demo passwords, DEMO_LAST_RESET)', gas.propStore.WP_INITIAL_ADMIN_PASSWORD === 'demo1234' &&
    gas.propStore.WP_RESET_PASSWORD === 'demo1234' && gas.propStore.DEMO_LAST_RESET === new Date(BKK('2026-10-13T10:00:00')).toISOString().replace(/\.\d+Z$/, gas.propStore.DEMO_LAST_RESET.slice(-5)) &&
    gas.propStore.DEMO_SEED_MAX_ID === '25', gas.propStore);
  const demoTriggers = () => gas.triggers.filter((t) => t.getHandlerFunction() === 'demoAutoReset');
  check('setupDemo: exactly one HOURLY trigger for demoAutoReset', demoTriggers().length === 1 && demoTriggers()[0].hours === 1 &&
    !demoTriggers()[0].days && demoTriggers()[0].hour === null, gas.triggers);
  G.setupDemo();
  check('setupDemo again: still one (hourly) trigger, one spreadsheet, same data size', demoTriggers().length === 1 && demoTriggers()[0].hours === 1 && gas.spreadsheets.size === 1 &&
    gas.spreadsheets.get(gas.propStore.WP_SPREADSHEET_ID).getSheetByName('permits').getLastRow() === 26);
  check('setupDemo: old Drive files trashed on re-seed', [...gas.files.values()].filter((f) => !f.trashed).length === 18 &&
    [...gas.files.values()].filter((f) => f.trashed).length === 18);

  // ================================================================ demo_info
  const di = get({ action: 'demo_info' });
  check('demo_info: last / next reset (next = last + 5 hours)', di.ok && Math.abs(Date.parse(di.data.last_reset) - Date.parse(gas.propStore.DEMO_LAST_RESET)) < 1000 &&
    di.data.next_reset === new Date(BKK('2026-10-13T15:00:00')).toISOString() && di.data.reset_hours === 5 && di.data.reset_days === undefined, di.data);
  check('demo_info: lists the locked (premium) actions', ['delete', 'update_permit', 'user_save', 'user_toggle', 'reset_data', 'work_done'].every((a) => di.data.locked.includes(a)), di.data.locked);
  const ex = di.data.track_example;
  check('demo_info: track example = a sample permit in progress', ex && /^WP-\d{8}-\d{3}$/.test(ex.permit_no) && /^080-000-\d{4}$/.test(ex.phone), ex);
  const tr = post({ action: 'track', permit_no: ex.permit_no, phone: ex.phone, with_permit: true });
  check('track with the example works (status page data)', tr.ok && tr.data.view.permit.es === 'approved', tr);
  check('demo_info also via POST', post({ action: 'demo_info' }).ok);

  // ================================================================ the seeded data through the API
  const login = (u, pw = 'demo1234') => post({ action: 'login', username: u, password: pw });
  const L = {};
  S0.users.forEach((u) => { const r = login(u.username); L[u.username] = r.ok ? r.data.session : null; });
  check('every demo account logs in with demo1234', Object.values(L).every((s) => s), L);
  check('demo accounts: roles + no "must change password" warning', login('manager').data.user.roles.join() === 'responsible,area_owner' &&
    post({ action: 'users', session: L.admin }).data.initial_password_warning === false);
  const SA = L.admin;
  const dash = post({ action: 'dashboard', session: SA }).data;
  check('dashboard: counts by status (at 10:00)', JSON.stringify(dash.cnt) === JSON.stringify({ pending: 7, approved: 6, rejected: 3, closed: 6, expired: 3 }), dash.cnt);
  check('dashboard: 14-day chart has submissions on most days, today the busiest', dash.days.filter((d) => d.count > 0).length >= 9 && dash.days[13].count >= 5, dash.days);
  check('dashboard: every work type counted', Object.values(dash.byType).every((n) => n > 0), dash.byType);
  check('dashboard: in progress / pending lists', dash.activeNow.length === 6 && dash.pending.length === 7);
  const stats = get({ action: 'stats' }).data;
  check('public stats', stats.total === 25 && stats.pending === 7 && stats.today >= 5, stats);
  const list = post({ action: 'permits', session: SA }).data;
  const rows = list.rows;
  check('permits list: 25 rows', rows.length === 25 && list.counts.pending === 7);
  const nowStr = '2026-10-13 10:00:00';
  check('permit numbers WP-YYYYMMDD-NNN = day of submission, unique, running per day', rows.every((r) => r.permit_no === 'WP-' + r.created_at.slice(0, 10).replace(/-/g, '') + r.permit_no.slice(11) && /^WP-\d{8}-\d{3}$/.test(r.permit_no)) &&
    new Set(rows.map((r) => r.permit_no)).size === 25, rows.map((r) => r.permit_no + ' ' + r.created_at));
  check('dates relative to today: nothing in the future, submissions within the last 14 days', rows.every((r) => r.created_at <= nowStr && r.created_at >= '2026-09-29'), rows.map((r) => r.created_at));
  check('pending stages: 3 × ขั้นที่ 1, 2 × ขั้นที่ 2, 2 × ขั้นที่ 3', ['assign', 'area', 'safety'].map((s) => rows.filter((r) => r.es === 'pending' && r.stage === s).length).join() === '3,2,2');
  check('track_list (public) shows the recent sample permits', get({ action: 'track_list' }).data.length === 25);
  // full permit view of every sample permit
  let viewsOk = true, logsOk = true, sigOk = true;
  rows.forEach((r) => {
    const v = post({ action: 'permit', session: SA, id: r.id, signs: 1 });
    if (!v.ok) { viewsOk = false; return; }
    const p = v.data.permit, s = v.data.signs;
    if (!/^data:image\/png;base64,iVBOR/.test(s.requester)) sigOk = false;
    if (p.has_resp_sign && !/^data:image\/png/.test(s.resp)) sigOk = false;
    if (p.has_area_sign && !/^data:image\/png/.test(s.area)) sigOk = false;
    if (p.has_approver_sign && !/^data:image\/png/.test(s.approver)) sigOk = false;
    const lg = v.data.logs;
    if (!lg.length || lg[0].action !== 'submit' || lg.some((l, i) => l.created_at > nowStr || (i && l.created_at < lg[i - 1].created_at)) || lg[lg.length - 1].created_at > p.updated_at || p.updated_at > nowStr) logsOk = false;
    if (p.checklist._v !== 2 || !p.workers.length || p.worker_count < 1) viewsOk = false;
    if (p.work_types.includes('confined') !== (p.confined !== null)) viewsOk = false;
  });
  check('every sample permit opens (checklist v2, workers, confined section)', viewsOk);
  check('logs: start with "submit", chronological, none after updated_at', logsOk);
  check('signatures: requester + every approval stage served as PNG data URLs', sigOk);
  const closed = rows.find((r) => r.es === 'closed');
  const vc = post({ action: 'permit', session: SA, id: closed.id }).data.permit;
  check('closed permit: approvals + inspections before / after by all three rows', vc.resp_approved_at && vc.area_approved_at && vc.approved_at && vc.closed_at &&
    ['contractor', 'owner', 'safety'].every((k) => vc.inspections[k].before && vc.inspections[k].after) && vc.inspections.safety.permit.name === vc.approver_name, vc.inspections);
  const rej = rows.filter((r) => r.es === 'rejected').map((r) => post({ action: 'permit', session: SA, id: r.id }).data.permit);
  check('rejected permits: one per stage, with a reason', rej.map((p) => p.reject_stage).sort().join() === 'area,assign,safety' && rej.every((p) => p.approve_comment.length > 10), rej.map((p) => p.reject_stage));
  const doneRow = rows.find((r) => r.work_done_at);
  const vd = post({ action: 'permit', session: SA, id: doneRow.id }).data.permit;
  const f = post({ action: 'file', session: SA, id: doneRow.id, fid: vd.work_done_photos[0].fid });
  check('work done (แจ้งเสร็จงาน): note + photo served', doneRow.es === 'expired' && vd.work_done_note && f.ok && f.data.mimeType === 'image/png' && f.data.inline, f);
  const elec = rows.filter((r) => r.work_types.includes('electric')).map((r) => post({ action: 'permit', session: SA, id: r.id }).data.permit);
  check('electric permits carry a LOTO row', elec.every((p) => p.loto.length >= 1 && p.loto[0].item));

  // ================================================================ the approval workflow on sample data
  const mine = post({ action: 'my_tasks', session: L.resp1 }).data;
  check('resp1: "รออนุมัติของฉัน" lists their stage-1 permits', mine.count >= 1 && mine.pending.every((x) => x.stage === 'assign' && x.responsible_name === 'สมชาย ใจมั่น'), mine);
  const P = mine.pending[0];
  const ar = post({ action: 'approvers', session: L.resp1 }).data;
  const area1 = ar.area_owner.find((u) => u.name === 'ประสิทธิ์ เรืองศรี');
  const s1 = post({ action: 'stage_decide', session: L.resp1, id: P.id, decision: 'approve', sign: SIG, area_owner_id: area1.id });
  const s2 = post({ action: 'stage_decide', session: L.area1, id: P.id, decision: 'approve', sign: SIG });
  const s3 = post({ action: 'decide', session: L.safety, id: P.id, decision: 'approve', sign: SIG, comment: 'ok' });
  check('sample permit: ขั้นที่ 1 → 2 → 3 → อนุมัติ', s1.ok && s1.data.stage === 'area' && s2.ok && s2.data.stage === 'safety' && s3.ok && s3.data.status === 'approved', { s1, s2, s3 });
  const ins = post({ action: 'inspect_sign', session: L.area1, id: P.id, stage: 'before' });
  check('area owner signs "ก่อนเริ่มงาน" on the sample permit', ins.ok, ins);

  // a visitor's own request (public form)
  const body = {
    action: 'submit', company: G.WP_DATA.companies[0], permit_type: 'contractor', work_types: ['hot'], responsible_id: post({ action: 'responsibles' }).data[0].id,
    work_date: '2026-10-14', time_from: '08:00', time_to: '12:00', requester_title: 'นาย', requester_name: 'ผู้เยี่ยมชม ทดลอง', requester_company: 'ทดลอง',
    requester_phone: '0800000000', location: 'ทดลอง', job_detail: 'ทดลองระบบ', workers: [{ name: 'ช่าง ก' }], requester_sign: SIG
  };
  const V = post(body);
  check('visitor submit: next number of today', V.ok && V.data.permit_no === 'WP-20261013-009' && V.data.id === 26, V);

  // ================================================================ what the demo neuters
  gas.propStore.TEAMS_WEBHOOK_URL = 'https://example.invalid/hook';
  const V2 = post(body);
  check('Teams: no request sent, a log line instead', V2.ok && gas.fetches.length === 0 && gas.logs.some((l) => /DEMO: Teams notification skipped/.test(l)));
  check('approval reminders: skipped', G.checkApprovalReminders().skipped === 'demo' && gas.fetches.length === 0);
  check('testTeamsNotification: nothing sent', G.testTeamsNotification().ok === false && gas.fetches.length === 0);
  // ================================================================ 🔒 premium actions: refused by the server
  const LOCK = (r) => r && r.ok === false && r.code === 'DEMO_LOCKED' && r.error === 'ฟีเจอร์นี้มีในเวอร์ชันเต็ม';
  const rd = post({ action: 'reset_data', session: SA, resetPassword: 'demo1234' });
  check('reset_data locked, data kept', LOCK(rd) && post({ action: 'permits', session: SA }).data.rows.length === 27, rd);
  const dl = post({ action: 'delete', session: SA, id: 3, resetPassword: 'demo1234' });
  check('delete (sample permit) locked', LOCK(dl) && post({ action: 'permit', session: SA, id: 3 }).ok, dl);
  const dl2 = post({ action: 'delete', session: SA, id: V2.data.id, resetPassword: 'demo1234' });
  check('delete (a visitor\'s own permit) locked too', LOCK(dl2) && post({ action: 'permit', session: SA, id: V2.data.id }).ok, dl2);
  const sigFiles = JSON.parse(gas.propStore.DEMO_SEED_FILES);
  check('sample signature files untouched', sigFiles.every((id) => !gas.files.get(id).trashed));
  const p5 = post({ action: 'permit', session: SA, id: 5 }).data.permit;
  const up = post(Object.assign({}, p5, { action: 'update_permit', session: SA, id: 5, resetPassword: 'demo1234', base: p5.updated_at, job_detail: 'แก้ไขโดยผู้ทดลอง' }));
  check('update_permit (✏️ edit) locked, permit unchanged', LOCK(up) && post({ action: 'permit', session: SA, id: 5 }).data.permit.job_detail === p5.job_detail, up);
  const pw = post({ action: 'user_save', session: SA, id: 1, fullname: 'วรรณา ศรีปลอดภัย', position: 'x', password: 'hacked-123' });
  check('user_save (edit user / password) locked', LOCK(pw) && login('admin').ok, pw);
  const nu = post({ action: 'user_save', session: SA, username: 'visitor1', fullname: 'ผู้ทดลอง', roles: ['responsible'], password: 'visitor-1' });
  check('user_save (add user) locked', LOCK(nu) && login('visitor1', 'visitor-1').code === 'AUTH_FAILED', nu);
  const tg = post({ action: 'user_toggle', session: SA, id: 3 });
  check('user_toggle locked', LOCK(tg) && login('resp1').ok, tg);
  check('users list (view only) still works', post({ action: 'users', session: SA }).data.users.length === 7);
  const apr = rows.find((r) => r.es === 'approved' && !r.work_done_at) || rows.find((r) => !r.work_done_at);
  const apv = post({ action: 'permit', session: SA, id: apr.id }).data.permit;
  const wd = post({ action: 'work_done', no: apv.permit_no, t: apv.token || 'x', photos: [{ name: 'a.png', base64: PNG_1x1 }], note: 'เสร็จ' });
  check('work_done (report with photos) locked', LOCK(wd) && !post({ action: 'permit', session: SA, id: apr.id }).data.permit.work_done_at, wd);
  const wa = post(Object.assign({}, body, { attachment: { name: 'a.png', mimeType: 'image/png', base64: PNG_1x1 } }));
  check('submit with a file attachment (upload) locked', LOCK({ ok: wa.ok, code: wa.code, error: String(wa.error || '').replace(/ \(แนบไฟล์\)$/, '') }), wa);
  const wi = post(Object.assign({}, body, { item_files: [{ item: 'x', name: 'a.png', base64: PNG_1x1 }] }));
  check('submit with checklist item files (upload) locked', wi.ok === false && wi.code === 'DEMO_LOCKED', wi);
  check('nothing created by the locked submits', post({ action: 'permits', session: SA }).data.rows.length === 27);
  const bt = post({ action: 'batch', session: SA, calls: [{ action: 'delete', id: 3 }, { action: 'users' }] });
  check('batch cannot reach a locked action', bt.ok && bt.data[0].ok === false && bt.data[1].ok, bt);
  check('GET of a locked action refused', get({ action: 'delete', id: '3' }).ok === false);
  const sr = post({ action: 'save_review', session: SA, id: P.id, base: post({ action: 'permit', session: SA, id: P.id }).data.permit.updated_at, inspections: {}, checklist: {}, loto: [] });
  check('still usable: จป. save review on an approved permit', sr.ok, sr);
  for (let i = 0; i < 12; i++) login('admin', 'wrong-' + i);
  check('wrong passwords never lock a demo account', login('admin').ok);

  // ================================================================ auto reset every 5 hours (hourly trigger, fake clock)
  const permitsNow = () => post({ action: 'permits', session: login('admin').data.session }).data.rows.length;
  const lastReset = () => Date.parse(gas.propStore.DEMO_LAST_RESET);
  setNow('2026-10-13T11:00:00');
  const a1 = G.demoAutoReset();
  check('demoAutoReset after 1 h: nothing happens', a1.ok && a1.reset === false && permitsNow() === 27 && a1.next_reset === new Date(BKK('2026-10-13T15:00:00')).toISOString(), a1);
  setNow('2026-10-13T14:59:00');
  const a2 = G.demoAutoReset();
  check('demoAutoReset at 4 h 59 min: nothing happens', a2.reset === false && permitsNow() === 27, a2);
  setNow('2026-10-13T15:00:30');
  const a3 = G.demoAutoReset();
  check('demoAutoReset at 5 h+: re-seeded', a3.ok && a3.reset === true && permitsNow() === 25 && Math.abs(lastReset() - BKK('2026-10-13T15:00:30')) < 1000, a3);
  check('after reset: visitor permits gone, demo accounts as seeded', post({ action: 'users', session: login('admin').data.session }).data.users.find((u) => u.id === 3).position === 'วิศวกรซ่อมบำรุง');
  check('after reset: visitor uploads trashed, 18 fresh sample files', [...gas.files.values()].filter((x) => !x.trashed).length === 18);
  check('after reset: demo_info next reset = 5 hours later', get({ action: 'demo_info' }).data.next_reset === new Date(BKK('2026-10-13T20:00:30')).toISOString());
  const rows2 = post({ action: 'permits', session: login('admin').data.session }).data.rows;
  check('after reset: dates follow the new "now" (fresh, nothing in the future)', rows2.some((r) => r.created_at.startsWith('2026-10-13')) && rows2.every((r) => r.created_at <= '2026-10-13 15:00:30') &&
    rows2.filter((r) => r.es === 'closed').length === 6 && rows2.filter((r) => r.es === 'rejected').length === 3 && rows2.filter((r) => r.es === 'pending').length === 7,
  rows2.map((r) => r.created_at + ' ' + r.es));
  check('after reset: old sessions are gone (new salts)', post({ action: 'me', session: SA }).code === 'AUTH');
  setNow('2026-10-13T16:00:30');
  check('demoAutoReset 1 h after a reset: nothing', G.demoAutoReset().reset === false);
  // 24 hourly runs, each firing 5 s early (trigger jitter): a reset every 5th run, never in between
  const base = lastReset(), resets = [];
  for (let h = 1; h <= 24; h++) {
    gas.clock.offset = base + h * 3600e3 - 5000 - Date.now();
    if (G.demoAutoReset().reset) resets.push(h);
  }
  check('hourly trigger over 24 h: re-seeds every 5 hours (5, 10, 15, 20)', resets.join() === '5,10,15,20', resets);
  check('still exactly one hourly trigger', demoTriggers().length === 1 && demoTriggers()[0].hours === 1);

  // ================================================================ resetDemoNow + time-of-day invariants
  ['2026-10-18T00:20:00', '2026-10-18T06:45:00', '2026-10-18T13:30:00', '2026-10-18T23:55:00'].forEach((t) => {
    setNow(t);
    const rr = G.resetDemoNow();
    const ses = login('admin').data.session;
    const rs = post({ action: 'permits', session: ses }).data.rows;
    const cnt = (es) => rs.filter((r) => r.es === es).length;
    const stamp = t.replace('T', ' ');
    const allLogs = rs.map((r) => post({ action: 'permit', session: ses, id: r.id }).data.logs).flat();
    check('resetDemoNow at ' + t + ': 25 permits, nothing in the future, statuses spread', rr.permits === 25 && rs.length === 25 &&
      rs.every((r) => r.created_at <= stamp) && allLogs.every((l) => l.created_at <= stamp) &&
      cnt('pending') === 7 && cnt('rejected') === 3 && cnt('closed') === 6 && cnt('approved') + cnt('expired') === 9 && cnt('approved') >= 3,
    { approved: cnt('approved'), expired: cnt('expired'), bad: rs.filter((r) => r.created_at > stamp).map((r) => r.created_at) });
  });
  // the pure builder (the same seed as plain rows)
  setNow('2026-10-13T10:00:00');
  const b = G.demoBuildSeed_(new Date(BKK('2026-10-13T10:00:00')), { sig: {}, photo: { id: 'photo-id', size: 10 } });
  check('demoBuildSeed_: users / permits / logs as sheet rows', b.users.length === 7 && b.permits.length === 25 && b.logs.length > 60 &&
    b.permits.every((p) => G.WP_SCHEMA.permits.every((h) => Object.prototype.hasOwnProperty.call(p, h))) &&
    b.users.every((u) => G.WP_SCHEMA.users.every((h) => Object.prototype.hasOwnProperty.call(u, h))) && b.logs.every((l, i) => l.id === i + 1));
  check('demoBuildSeed_: every flow lands where intended', b.permits.every((p, i) => {
    const fl = b.flows[i], es = G.effectiveStatus_(p);
    if (fl.startsWith('pending:')) return es === 'pending' && G.stageOf_(p) === fl.split(':')[1];
    if (fl.startsWith('rejected:')) return es === 'rejected' && p.reject_stage === fl.split(':')[1];
    return es === fl;
  }), b.permits.map((p, i) => b.flows[i] + '→' + G.effectiveStatus_(p)));

  check('no server errors logged', !gas.logs.some((l) => l.startsWith('ERROR')), gas.logs.filter((l) => l.startsWith('ERROR')));
  check('every sheet write under LockService', gas.stats.unlockedWrites === 0, gas.stats.unlockedWrites);

  // ================================================================ ALL-IN-ONE.gs
  const { build } = require('../tools/build-all-in-one.js');
  const aio = fs.readFileSync(path.join(ROOT, 'apps-script', 'ALL-IN-ONE.gs'), 'utf8');
  check('ALL-IN-ONE.gs is up to date (run: node tools/build-all-in-one.js)', aio === build());
  const tops = {};
  (aio.match(/^(?:var|let|const|function)\s+[A-Za-z_$][\w$]*/gm) || []).forEach((m) => { const n = m.split(/\s+/)[1]; tops[n] = (tops[n] || 0) + 1; });
  check('ALL-IN-ONE.gs: no duplicate top-level names', Object.keys(tops).every((n) => tops[n] === 1), Object.keys(tops).filter((n) => tops[n] > 1));
  const g1 = createGas();
  vm.runInContext(aio, g1.context, { filename: 'ALL-IN-ONE.gs' });
  g1.context.now_ = () => new Date(g1.clock.now());
  g1.clock.offset = BKK('2026-10-13T09:00:00') - Date.now();
  const s1x = g1.context.setupDemo();
  const p1 = (x) => JSON.parse(g1.context.doPost({ postData: { contents: JSON.stringify(x) } }).getContent());
  const li = p1({ action: 'login', username: 'admin', password: 'demo1234' });
  check('ALL-IN-ONE.gs: setupDemo + login + dashboard + demo_info work', s1x.seed.permits === 25 && li.ok &&
    p1({ action: 'dashboard', session: li.data.session }).data.cnt.pending === 7 && p1({ action: 'demo_info' }).data.next_reset === new Date(BKK('2026-10-13T14:00:00')).toISOString() &&
    g1.triggers.length === 1 && g1.triggers[0].hours === 1, s1x.seed);
  check('ALL-IN-ONE.gs: locked actions refused', p1({ action: 'delete', session: li.data.session, id: 1, resetPassword: 'demo1234' }).code === 'DEMO_LOCKED');

  // ================================================================ frontend demo pieces
  const docs = path.join(ROOT, 'docs');
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
  const htmls = walk(docs).filter((x) => x.endsWith('.html') && !/admin[\\/]index\.html$/.test(x)); // admin/index.html = redirect only
  check('every page loads demo.js right after core.js', htmls.every((h) => /assets\/js\/core\.js\?v=\d+"><\/script>\n<script src="(?:\.\.\/)?assets\/js\/demo\.js/.test(fs.readFileSync(h, 'utf8'))),
    htmls.filter((h) => !/demo\.js/.test(fs.readFileSync(h, 'utf8'))));
  const demoJs = fs.readFileSync(path.join(docs, 'assets', 'js', 'demo.js'), 'utf8');
  check('banner text (5 hours shared reset + 5 hours per visitor) + contact constant + hidden in print',
    demoJs.includes('🧪 <b>ระบบทดลองใช้ (Demo)</b> — ข้อมูลตัวอย่าง (ใช้ร่วมกันทุกคน) รีเซ็ตกลับเป็นค่าเริ่มต้นทุก 5 ชั่วโมง · ผู้ทดลองแต่ละคนใช้งานได้ 5 ชั่วโมง') &&
    !/3 วัน/.test(demoJs) && demoJs.includes('window.DEMO_CONTACT') && /@media print \{ \.demo-banner \{ display: none !important; \}/.test(demoJs));
  // banner countdown: hours + minutes (no days) — run the real left() from demo.js
  const leftSrc = /const left = iso => \{[\s\S]*?\n  \};/.exec(demoJs);
  const leftFn = leftSrc && vm.runInNewContext('(' + leftSrc[0].replace(/^const left = /, '').replace(/;$/, '') + ')', { Date, Math });
  const inMs = (ms) => new Date(Date.now() + ms).toISOString();
  check('banner countdown shows hours / minutes', leftFn && leftFn(inMs(4 * 3600e3 + 59 * 60e3 + 30e3)) === 'อีก 4 ชม. 59 นาที' &&
    leftFn(inMs(25 * 60e3 + 30e3)) === 'อีก 25 นาที' && leftFn(inMs(-1000)) === 'กำลังรีเซ็ตในไม่ช้า', leftFn && [leftFn(inMs(4 * 3600e3 + 59 * 60e3 + 30e3)), leftFn(inMs(25 * 60e3 + 30e3))]);

  // ---------- trial gate (per-visitor 5 hours): on every page, after config.js
  const allHtml = walk(docs).filter((x) => x.endsWith('.html'));
  check('trial-gate.js included on every page (incl. admin/*.html, print.html) right after config.js', allHtml.length >= 13 &&
    allHtml.every((h) => /<script src="(?:\.\.\/)?config\.js"><\/script>\n<script src="(?:\.\.\/)?assets\/js\/trial-gate\.js(?:\?v=\d+)?"><\/script>/.test(fs.readFileSync(h, 'utf8'))),
  allHtml.filter((h) => !/trial-gate\.js/.test(fs.readFileSync(h, 'utf8'))).map((h) => path.relative(ROOT, h)));
  const tgPath = path.join(docs, 'assets', 'js', 'trial-gate.js');
  const shared = path.join(ROOT, '..', 'TrialGate', 'client', 'trial-gate.js');
  check('trial-gate.js = the shared TrialGate client, unchanged', fs.existsSync(tgPath) &&
    (!fs.existsSync(shared) || fs.readFileSync(shared, 'utf8') === fs.readFileSync(tgPath, 'utf8')));
  const cfgCtx = {};
  cfgCtx.window = cfgCtx;
  vm.runInNewContext(fs.readFileSync(path.join(docs, 'config.js'), 'utf8'), cfgCtx);
  const T = cfgCtx.DEMO_TRIAL;
  check('config.js: DEMO_TRIAL (gate URL, app ework, 5 hours, contact = DEMO_CONTACT, price line)', T && typeof T.gateUrl === 'string' &&
    (T.gateUrl === 'PASTE_TRIAL_GATE_URL_HERE' || /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(T.gateUrl)) &&
    T.app === 'ework' && T.hours === 5 && T.contact === cfgCtx.DEMO_CONTACT && /1,290 บาท\/เดือน/.test(T.priceHtml) && /29,900 บาท/.test(T.priceHtml), T);
  check('trial badge kept clear of the admin sidebar (CSS only)', /body\.layout-admin #demo-trial-badge \{ left: 280px; \}/.test(demoJs));

  // ---------- 🔒 premium buttons in the pages (one shared lock in demo.js)
  const rd_ = (rel) => fs.readFileSync(path.join(docs, rel), 'utf8');
  check('lock: one shared handler + modal text in demo.js', /WP\.lock = what =>/.test(demoJs) && /WP\.showLocked = /.test(demoJs) &&
    demoJs.includes('ฟีเจอร์นี้มีในเวอร์ชันเต็ม') && /addEventListener\('click', e => stop\(e, true\), true\)/.test(demoJs));
  const lockSpots = {
    'admin/permits.html': ['Export CSV'], 'assets/js/pages/permits.js': ['พิมพ์ / บันทึก PDF', 'แก้ไขใบอนุญาต', 'ลบใบอนุญาต'],
    'assets/js/pages/view.js': ['พิมพ์ / บันทึก PDF', 'แก้ไขใบอนุญาต', 'ลบใบอนุญาต'], 'assets/js/pages/status.js': ['พิมพ์ / บันทึก PDF', 'แจ้งเสร็จงานพร้อมรูปถ่าย'],
    'assets/js/pages/dashboard.js': ['รีเซ็ตข้อมูลทั้งหมด'], 'admin/users.html': ['จัดการผู้ใช้'], 'assets/js/pages/users.js': ['จัดการผู้ใช้'],
    'request.html': ['แนบไฟล์'], 'assets/js/app.js': ['แนบไฟล์'], 'print.html': ['พิมพ์ / บันทึก PDF']
  };
  const missing = [];
  Object.entries(lockSpots).forEach(([f, ws]) => { const src = rd_(f); ws.forEach((w) => { if (!new RegExp('(data-locked="|WP\\.lock\\(\')' + w.replace(/[/()]/g, '\\$&')).test(src)) missing.push(f + ': ' + w); }); });
  check('lock: premium buttons marked 🔒 (export, print, edit, delete, users, upload, work done, reset)', missing.length === 0, missing);
  check('lock: print.html and request.html?edit= show the full-version notice', /WP\.lockedPage\(root/.test(rd_('assets/js/pages/print.js')) && /editId && WP\.lockedPage/.test(rd_('assets/js/request.js')));
  const loginHtml = fs.readFileSync(path.join(docs, 'login.html'), 'utf8');
  check('login page: "บัญชีทดลอง" box with every demo account', loginHtml.includes('บัญชีทดลอง') && S0.users.every((u) => loginHtml.includes('data-u="' + u.username + '" data-p="demo1234"')));
  const jsFiles = walk(docs).filter((x) => x.endsWith('.js'));
  const badKeys = jsFiles.filter((x) => /(?:Storage\.(?:get|set|remove)Item\(\s*['"](?!demo_ewp_))|['"]wpt?_(?:session|swr|nobatch|handoff|draft)/.test(fs.readFileSync(x, 'utf8')));
  check('browser storage keys use the demo_ewp_ prefix only', badKeys.length === 0 && /storagePrefix = 'demo_ewp_'/.test(fs.readFileSync(path.join(docs, 'assets', 'js', 'core.js'), 'utf8')), badKeys);

  // ================================================================ neutral branding (whole demo folder)
  const J = (...a) => a.join('');
  const banned = new RegExp([J('แน', '็ป'), J('เทพ', 'วัฒนา'), J('นิวตริ', 'ซายส์'), J('ไทยร่วม', 'ใจ'), J('Thep', 'watana'), J('K', 'RG'), J('\\bK', 'ing\\b'),
    J('\\bN', 'ap\\b'), J('watana', 'thep'), J('kro', 'group'), J('AKfy', 'cb'), J('webhook\\.', 'office'), J('192\\.', '168\\.'), J('กัลย์', 'รวี')].join('|'), 'i');
  const all = walk(ROOT).filter((x) => !/[\\/](\.git|node_modules)[\\/]/.test(x) && !/\.(png|jpg|ico)$/i.test(x));
  const hits = [];
  // the owner's own deployed demo API and Trial Gate URLs in docs/config.js are the allowed Apps Script ids
  const ownApi = (x, line) => /[\\/]docs[\\/]config\.js$/.test(x) &&
    (/^window\.WP_CONFIG = \{ apiUrl: "https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec" \};?\s*$/.test(line) ||
     /^window\.DEMO_TRIAL = \{ gateUrl: 'https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec', /.test(line));
  all.forEach((x) => fs.readFileSync(x, 'utf8').split('\n').forEach((line, i) => { if (banned.test(line) && !ownApi(x, line)) hits.push(path.relative(ROOT, x) + ':' + (i + 1)); }));
  check('no real company / customer / people names, ids or webhooks anywhere (' + all.length + ' files)', hits.length === 0, hits);

  return { passed, failures };
};
