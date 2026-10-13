// Generates apps-script/DemoAssets.gs: fictional hand-written-looking signatures (PNG, ink
// #0b2a6b on transparent — the same colour the signature pad exports) for every person in
// apps-script/DemoSeed.gs, plus one sample "work done" photo. Deterministic (seeded by name).
// Usage: node tools/gen-demo-assets.js
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const zlib = require('zlib');

const root = path.join(__dirname, '..');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'apps-script', 'DemoSeed.gs'), 'utf8'), ctx);
const SEED = ctx.DEMO_SEED;

// ------------------------------------------------------------ PNG writer
const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = (buf) => { let c = -1; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
function png(w, h, colorType, bitDepth, rows, plte, trns) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = bitDepth; ihdr[9] = colorType; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.concat(rows.map((r) => Buffer.concat([Buffer.from([0]), r])));
  const parts = [Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr)];
  if (plte) parts.push(chunk('PLTE', plte));
  if (trns) parts.push(chunk('tRNS', trns));
  parts.push(chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(parts);
}

// ------------------------------------------------------------ deterministic random
function rng(str) {
  let h = 2166136261;
  for (const ch of str) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// ------------------------------------------------------------ signature
function signature(name) {
  const W = 360, H = 120, A = new Float32Array(W * H);
  const R = rng(name);
  const seg = (x0, y0, x1, y1, w) => {
    const minx = Math.max(0, Math.floor(Math.min(x0, x1) - w - 1)), maxx = Math.min(W - 1, Math.ceil(Math.max(x0, x1) + w + 1));
    const miny = Math.max(0, Math.floor(Math.min(y0, y1) - w - 1)), maxy = Math.min(H - 1, Math.ceil(Math.max(y0, y1) + w + 1));
    const dx = x1 - x0, dy = y1 - y0, L = dx * dx + dy * dy || 1;
    for (let y = miny; y <= maxy; y++) for (let x = minx; x <= maxx; x++) {
      const px = x + 0.5, py = y + 0.5;
      const t = Math.max(0, Math.min(1, ((px - x0) * dx + (py - y0) * dy) / L));
      const d = Math.hypot(px - (x0 + t * dx), py - (y0 + t * dy));
      const c = Math.max(0, Math.min(1, w / 2 + 0.5 - d));
      if (c > A[y * W + x]) A[y * W + x] = c;
    }
  };
  const stroke = (pts, w0) => {
    for (let i = 1; i < pts.length; i++) {
      const [a, b] = [pts[i - 1], pts[i]];
      const speed = Math.hypot(b[0] - a[0], b[1] - a[1]);
      seg(a[0], a[1], b[0], b[1], Math.max(1.3, w0 - speed * 0.25));
    }
  };
  // words: loops of a prolate cycloid (cursive-like) with random loop heights, first loop taller (capital)
  const words = 1 + (R() < 0.75 ? 1 : 0);
  let x = 16 + R() * 12;
  const slant = 0.3 + R() * 0.25;
  for (let wi = 0; wi < words; wi++) {
    let loops = wi === 0 ? 3 + Math.floor(R() * 3) : 2 + Math.floor(R() * 3);
    const v = 4.2 + R() * 1.6, a = v * (1.35 + R() * 0.5), base = 74 + (R() - 0.5) * 10;
    while (loops > 1 && x + loops * Math.PI * 2 * v + 30 > W - 16) loops--;
    const hs = [];
    for (let k = 0; k <= loops; k++) hs.push(k === 0 ? 38 + R() * 14 : (R() < 0.3 ? 26 + R() * 14 : 9 + R() * 12));
    const pts = [];
    for (let t = 0; t <= loops * Math.PI * 2; t += 0.05) {
      const k = Math.floor(t / (Math.PI * 2)), f = (t / (Math.PI * 2)) - k;
      const hb = hs[k] + (hs[k + 1] - hs[k]) * Math.max(0, f - 0.6) / 0.4 * 0.3;
      const yy = base - hb * (0.5 - 0.5 * Math.cos(t)) + Math.sin(t * 0.37 + wi) * 2.5 - wi * 4;
      const xx = x + v * t - a * Math.sin(t) - (yy - base) * slant;
      pts.push([xx, yy]);
    }
    stroke(pts, 2.4 + R() * 0.8);
    x = pts[pts.length - 1][0] + 14 + R() * 12;
    if (x > W - 90) break;
  }
  // flourish: a sweeping underline back to the left
  const fl = [], x1 = Math.min(W - 16, x + 10), x0 = 16 + R() * 30, yb = 92 + R() * 10;
  for (let t = 0; t <= 1; t += 0.01) {
    const xx = x1 + (x0 - x1) * t, yy = yb + Math.sin(t * Math.PI) * (6 + R() * 0.3) - t * 6;
    fl.push([xx, yy]);
  }
  stroke(fl, 2.2);
  // 4-bit palette: 16 alpha levels of the ink colour
  const plte = Buffer.alloc(48), trns = Buffer.alloc(16);
  for (let i = 0; i < 16; i++) { plte[i * 3] = 0x0b; plte[i * 3 + 1] = 0x2a; plte[i * 3 + 2] = 0x6b; trns[i] = i * 17; }
  const rows = [];
  for (let y = 0; y < H; y++) {
    const r = Buffer.alloc(W / 2);
    for (let xq = 0; xq < W; xq += 2) {
      const q = (v) => Math.round(Math.min(1, v) * 15);
      r[xq / 2] = (q(A[y * W + xq]) << 4) | q(A[y * W + xq + 1]);
    }
    rows.push(r);
  }
  return png(W, H, 3, 4, rows, plte, trns);
}

// ------------------------------------------------------------ "work done" photo (flat illustration)
function photo() {
  const W = 320, H = 240;
  const pix = (x, y) => {
    // wall / floor / hazard stripe / green check badge
    let c = y < 150 ? [214, 222, 228] : [150, 156, 160];
    if (y >= 140 && y < 150) c = ((Math.floor((x + y) / 12)) % 2) ? [250, 204, 21] : [30, 30, 30];
    if (y >= 60 && y < 140 && x >= 30 && x < 130) c = [96, 125, 139];            // a cabinet
    if (y >= 70 && y < 130 && x >= 40 && x < 120 && (x - 40) % 20 < 2) c = [69, 90, 100];
    const dx = x - 230, dy = y - 95, d = Math.hypot(dx, dy);
    if (d < 46) c = [16, 185, 129];
    // check mark
    const onSeg = (ax, ay, bx, by) => {
      const L = (bx - ax) ** 2 + (by - ay) ** 2, t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / L));
      return Math.hypot(x - (ax + t * (bx - ax)), y - (ay + t * (by - ay))) < 6;
    };
    if (d < 46 && (onSeg(208, 96, 224, 113) || onSeg(224, 113, 254, 78))) c = [255, 255, 255];
    return c;
  };
  const rows = [];
  for (let y = 0; y < H; y++) {
    const r = Buffer.alloc(W * 3);
    for (let x = 0; x < W; x++) { const c = pix(x, y); r[x * 3] = c[0]; r[x * 3 + 1] = c[1]; r[x * 3 + 2] = c[2]; }
    rows.push(r);
  }
  return png(W, H, 2, 8, rows);
}

// ------------------------------------------------------------ output
const names = [...new Set(SEED.users.map((u) => u.fullname).concat(Object.values(SEED.requesters).map((r) => r.name)))];
const sigs = {};
names.forEach((n) => { sigs[n] = signature(n).toString('base64'); });
const outDir = process.argv.includes('--preview') ? path.join(root, 'tools', 'preview') : null;
if (outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  names.forEach((n, i) => fs.writeFileSync(path.join(outDir, 'sig' + i + '.png'), Buffer.from(sigs[n], 'base64')));
  fs.writeFileSync(path.join(outDir, 'photo.png'), photo());
}
const src = '/**\n * DEMO assets — GENERATED by `node tools/gen-demo-assets.js` (do not edit by hand).\n' +
  ' * Fictional signatures (PNG base64, one per demo person in DemoSeed.gs) and a sample\n' +
  ' * "work done" photo. seedDemoData_() stores them as files in the app Drive folder.\n */\n' +
  'var DEMO_ASSETS = {\n  "signatures": {\n' +
  names.map((n) => '    ' + JSON.stringify(n) + ': "' + sigs[n] + '"').join(',\n') +
  '\n  },\n  "photo": "' + photo().toString('base64') + '"\n};\n';
fs.writeFileSync(path.join(root, 'apps-script', 'DemoAssets.gs'), src);
console.log('apps-script/DemoAssets.gs: ' + names.length + ' signatures + 1 photo, ' + Math.round(src.length / 1024) + ' KB');
