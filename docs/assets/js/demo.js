/* ================================================================
   e-Work Permit — DEMO banner ("ระบบทดลองใช้"). Loaded on every page right after core.js.
   Shows when the demo data is reset next (GET ?action=demo_info) with a live countdown
   and the contact line window.DEMO_CONTACT (docs/config.js). Layout pages place it on top of
   their content (layout.js → WP.demoBanner()); pages without layout.js (print.html) get it at
   the top of <body>. Hidden when printing.
   ================================================================ */
(() => {
  const WP = window.WP;
  if (!WP) return;
  const E = WP.esc;
  const KEY = (WP.storagePrefix || 'demo_ewp_') + 'demo_info';
  const MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const contact = String(window.DEMO_CONTACT || 'สนใจใช้งานจริง ติดต่อ: Fastwork / LINE: (ใส่ภายหลัง)');

  const css = `
.demo-banner { margin: 0 0 18px; padding: 10px 16px; border-radius: 14px; border: 1px solid rgba(251, 191, 36, .45);
  background: linear-gradient(135deg, rgba(251, 191, 36, .16), rgba(16, 185, 129, .10)); color: #fde68a;
  font-size: 14px; line-height: 1.6; overflow-wrap: anywhere; position: relative; z-index: 1; }
.demo-banner b { color: #fef3c7; font-weight: 600; }
.demo-banner .demo-next { color: #fff; font-weight: 500; white-space: nowrap; }
.demo-banner .demo-contact { color: #d1fae5; font-size: 13px; margin-top: 2px; }
.demo-banner .demo-try { margin-top: 6px; font-size: 13px; color: #e2e8f0; }
.demo-banner .demo-try button { font: inherit; font-size: 12px; margin-left: 6px; padding: 2px 10px; border-radius: 8px; border: 1px solid rgba(251, 191, 36, .6);
  background: rgba(251, 191, 36, .15); color: #fde68a; cursor: pointer; }
.demo-banner.demo-top { margin: 0; border-radius: 0; border-width: 0 0 1px; text-align: center; font-family: 'Sarabun', 'Leelawadee UI', Tahoma, sans-serif; }
.demo-accounts { width: 100%; max-width: 440px; margin-top: 22px; padding: 20px 22px; text-align: left; }
.demo-accounts h2 { margin: 0 0 4px; font-size: 18px; font-weight: 500; color: #fde68a; }
.demo-accounts p { margin: 0 0 10px; font-size: 13px; color: var(--muted, #9ca3af); }
.demo-accounts table { width: 100%; border-collapse: collapse; font-size: 13px; }
.demo-accounts th { text-align: left; font-weight: 500; padding: 6px 8px; color: var(--text-2, #cbd5e1); border-bottom: 1px solid rgba(16, 185, 129, .25); }
.demo-accounts td { padding: 7px 8px; border-bottom: 1px solid rgba(16, 185, 129, .12); vertical-align: top; }
.demo-accounts tbody tr { cursor: pointer; transition: background .2s; }
.demo-accounts tbody tr:hover { background: rgba(16, 185, 129, .12); }
.demo-accounts code { color: #a7f3d0; font-size: 13px; }
.demo-accounts .demo-note { margin: 12px 0 0; font-size: 12px; }
@media (max-width: 640px) { .demo-banner { font-size: 13px; padding: 9px 12px; } .demo-banner .demo-next { white-space: normal; } }
@media print { .demo-banner { display: none !important; } }`;
  const st = document.createElement('style');
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  const pad = n => String(n).padStart(2, '0');
  // Thai date/time of an ISO instant in Asia/Bangkok (UTC+7, no DST)
  const thai = iso => {
    const t = Date.parse(iso);
    if (isNaN(t)) return '';
    const d = new Date(t + 7 * 3600e3);
    return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + (d.getUTCFullYear() + 543) + ' เวลา ' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ' น.';
  };
  const left = iso => {
    let s = Math.floor((Date.parse(iso) - Date.now()) / 1000);
    if (!(s > 0)) return 'กำลังรีเซ็ตในไม่ช้า';
    const d = Math.floor(s / 86400); s -= d * 86400;
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60);
    return 'อีก ' + (d ? d + ' วัน ' : '') + (d || h ? h + ' ชม. ' : '') + m + ' นาที';
  };

  let info = null;
  const banners = [];
  const paint = () => {
    banners.forEach(b => {
      const el = b.querySelector('.demo-next');
      if (!WP.apiUrl) el.textContent = '- (ยังไม่ได้ตั้งค่า API)';
      else if (!info) el.textContent = 'กำลังโหลด…';
      else if (!info.next_reset) el.textContent = 'ยังไม่ได้รัน setupDemo()';
      else el.textContent = thai(info.next_reset) + ' (' + left(info.next_reset) + ')';
      // tracking page: a sample permit number + phone to try
      const tr = b.querySelector('.demo-try');
      if (tr && info && info.track_example && !tr.dataset.done) {
        tr.dataset.done = '1';
        const ex = info.track_example;
        tr.innerHTML = `🔎 ทดลองค้นหา: เลขที่ <b>${E(ex.permit_no)}</b> · เบอร์โทร <b>${E(ex.phone)}</b><button type="button">ใส่ให้</button>`;
        tr.querySelector('button').addEventListener('click', () => {
          const f = document.getElementById('tf');
          if (!f) return;
          if (f.permit_no) f.permit_no.value = ex.permit_no;
          if (f.phone) f.phone.value = ex.phone;
          f.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        tr.hidden = false;
      }
    });
  };

  WP.demoBanner = (cls = '') => {
    const d = document.createElement('div');
    d.className = 'demo-banner ' + cls;
    d.setAttribute('role', 'note');
    d.innerHTML = `<div>🧪 <b>ระบบทดลองใช้ (Demo)</b> — ข้อมูลทั้งหมดจะถูกรีเซ็ตกลับเป็นค่าเริ่มต้นทุก 3 วัน · รีเซ็ตครั้งถัดไป: <span class="demo-next"></span></div>
<div class="demo-contact">${E(contact)}</div>` + (document.body && document.body.dataset.active === 'track' ? '<div class="demo-try" hidden></div>' : '');
    banners.push(d);
    paint();
    return d;
  };

  // reset schedule: cached for this tab for 10 minutes (one GET per visit, not per page)
  const load = async () => {
    if (!WP.apiUrl) return;
    try {
      const c = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (c && c.url === WP.apiUrl && Date.now() - c.at < 600e3 && c.info) { info = c.info; paint(); return; }
    } catch { }
    const r = await WP.get('demo_info');
    if (!r.ok) return;
    info = r.data;
    try { sessionStorage.setItem(KEY, JSON.stringify({ url: WP.apiUrl, at: Date.now(), info })); } catch { }
    paint();
  };
  load();
  setInterval(paint, 30e3);

  // pages without layout.js (print.html): the banner goes on top of <body>
  WP.ready.then(() => {
    if (banners.length || !document.body) return;
    document.body.insertBefore(WP.demoBanner('demo-top'), document.body.firstChild);
  });
})();
