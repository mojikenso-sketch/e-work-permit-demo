# e-Work Permit (FM-MR-58) — ระบบทดลองใช้ (Demo)

ระบบใบขออนุญาตปฏิบัติงานออนไลน์ (ยื่นคำขอ, เช็กลิสต์ความปลอดภัย, ลงนามออนไลน์, อนุมัติหลายระดับ, ติดตามสถานะ, พิมพ์)
สำหรับบริษัทสมมติ **บริษัท ตัวอย่าง อินดัสทรี จำกัด (Demo Co., Ltd.)** — ข้อมูลทั้งหมดเป็นข้อมูลตัวอย่าง และรีเซ็ตอัตโนมัติทุก 3 วัน

ขั้นตอนติดตั้ง / บัญชีทดลอง: ดู **`README_DEMO.txt`**

Programming by Duongruthai_Milk

## โครงสร้าง

| ไฟล์ | หน้าที่ |
|---|---|
| `docs/` | หน้าเว็บ (GitHub Pages, root = `/docs`) |
| `docs/config.js` | URL ของ Web App (`apiUrl`) + ข้อความติดต่อ `DEMO_CONTACT` ในแถบ Demo |
| `docs/assets/js/demo.js` | แถบ "ระบบทดลองใช้ (Demo)" + นับถอยหลังการรีเซ็ต (ทุกหน้า, ซ่อนตอนพิมพ์) |
| `apps-script/Code.gs` | router (`doGet`/`doPost`), ตัวช่วย Sheet, cache, LockService |
| `apps-script/Auth.gs` | รหัสผ่าน, login/session, ผู้ใช้ + บทบาท (จป. / ผู้รับผิดชอบงาน / เจ้าของพื้นที่) |
| `apps-script/Permits.gs` | ยื่นคำขอ, ลำดับอนุมัติ 3 ขั้น, ติดตาม, ตรวจสอบ, ปิดงาน, ไฟล์, การ์ด Teams (ปิดใน Demo) |
| `apps-script/Setup.gs` | `setupSystem()`, keep-warm, trigger เตือนค้างอนุมัติ |
| `apps-script/Data.gs` | ข้อมูลอ้างอิง (บริษัท, เช็กลิสต์, ระเบียบ) — สำเนาไปที่ `docs/assets/js/data.js` ด้วย `node tools/sync-data.js` |
| `apps-script/DemoSeed.gs` | ข้อมูลตัวอย่าง (plain data): ผู้ใช้ 7 บัญชี, ใบอนุญาต 25 ใบ, ผู้รับเหมา — วันที่อิงจาก "วันนี้" |
| `apps-script/DemoAssets.gs` | ลายเซ็นสมมติ + รูป "แจ้งเสร็จงาน" (สร้างด้วย `node tools/gen-demo-assets.js`) |
| `apps-script/Demo.gs` | `setupDemo()`, `seedDemoData_()`, `demoAutoReset()`, `resetDemoNow()`, API `demo_info`, สวิตช์ `WP_DEMO` |
| `apps-script/ALL-IN-ONE.gs` | ทุกไฟล์ด้านบนรวมเป็นไฟล์เดียว (สร้างด้วย `node tools/build-all-in-one.js`) |
| `appsscript.json` | manifest ของ Apps Script (timeZone `Asia/Bangkok`, V8, Web app) |
| `test/` | ชุดทดสอบ (mock Apps Script ในหน่วยความจำ) + dev server |

## สิ่งที่ปิด/จำกัดในโหมด Demo (`WP_DEMO = true` ใน Demo.gs)

- การแจ้งเตือน Microsoft Teams / เตือนค้างอนุมัติ → ไม่ส่ง (บันทึก log `DEMO: ... skipped`)
- ปุ่ม "รีเซ็ตข้อมูล" (ลบฐานข้อมูลทั้งหมด) → ปฏิเสธ
- ลบใบอนุญาตตัวอย่าง → ปฏิเสธ (ใบที่ผู้ทดลองสร้างเองลบได้ ด้วยรหัสยืนยัน `demo1234`)
- บัญชีทดลอง: เปลี่ยนรหัสผ่าน / เปลี่ยนบทบาท / ปิดการใช้งาน ไม่ได้, ใส่รหัสผิดกี่ครั้งก็ไม่ถูกล็อก
- ข้อมูลทั้งหมด (ผู้ใช้, ใบอนุญาต, ไฟล์ใน Drive ของระบบ) รีเซ็ตกลับเป็นค่าเริ่มต้นทุก 3 วัน (trigger รายวัน ~03:00 น.)
- คีย์ใน localStorage / sessionStorage ขึ้นต้นด้วย `demo_ewp_` ทั้งหมด

## พัฒนา / ทดสอบ

```
node test/run.js                 # ชุดทดสอบทั้งหมด (backend, workflow, demo, frontend)
node test/dev-server.js 8765     # เปิด docs/ + mock API (ข้อมูล demo) ที่ http://localhost:8765/
node tools/sync-data.js          # หลังแก้ apps-script/Data.gs
node tools/gen-demo-assets.js    # หลังเพิ่มคนใน DemoSeed.gs (ลายเซ็น)
node tools/build-all-in-one.js   # หลังแก้ไฟล์ .gs ใดๆ
```

ชุดทดสอบเดิมของระบบรันโดยปิด `WP_DEMO` (ตรวจพฤติกรรมเดิมครบ) ส่วน `test/demo.test.js` ตรวจโหมด Demo
