================================================================
 e-Work Permit (FM-MR-58) — ระบบทดลองใช้ (DEMO)
 ใบขออนุญาตปฏิบัติงานออนไลน์: ยื่นคำขอ · เช็กลิสต์ความปลอดภัย · ลงนามออนไลน์
 · อนุมัติหลายระดับ (ผู้รับผิดชอบงาน → เจ้าของพื้นที่ → จป.) · ติดตามสถานะ (QR) · พิมพ์ A4
 Programming by Duongruthai_Milk
================================================================

นี่คืออะไร
----------
สำเนาสาธิตของระบบ e-Work Permit สำหรับให้ลูกค้าทดลองใช้ผ่านเว็บ
- หน้าเว็บ : โฟลเดอร์ docs/        → GitHub Pages
- หลังบ้าน : โฟลเดอร์ apps-script/ → Google Apps Script (Web App)
- ข้อมูล    : Google Sheets + Google Drive ที่สคริปต์สร้างขึ้นเองในบัญชี Google ของเจ้าของ
- ใช้บริษัทสมมติ "บริษัท ตัวอย่าง อินดัสทรี จำกัด (Demo Co., Ltd.)" — ชื่อคน ผู้รับเหมา
  เบอร์โทร (080-000-xxxx) และอีเมล (*.example) ทั้งหมดเป็นข้อมูลสมมติ
- มีข้อมูลตัวอย่าง 25 ใบ (รออนุมัติ 3 ขั้น / อนุมัติ-กำลังปฏิบัติงาน / หมดอายุ / ปิดงาน /
  ไม่อนุมัติ; งานประกายไฟ งานที่สูง ที่อับอากาศ งานไฟฟ้า งานสารเคมี งานทั่วไป)
  วันที่อิงจาก "วันนี้" เสมอ จึงไม่ดูเก่า
- ข้อมูลทั้งหมดรีเซ็ตกลับเป็นค่าเริ่มต้นอัตโนมัติทุก 3 วัน (ประมาณ 03:00 น.)
  ทุกหน้ามีแถบ "🧪 ระบบทดลองใช้ (Demo)" บอกเวลารีเซ็ตครั้งถัดไป + นับถอยหลัง


บัญชีทดลอง (รหัสผ่านทุกบัญชี: demo1234)
-----------------------------------------
  ชื่อผู้ใช้   บทบาท
  admin      จป. (เจ้าหน้าที่ความปลอดภัย) — แดชบอร์ด, อนุมัติขั้นที่ 3, จัดการผู้ใช้
  safety     จป. คนที่ 2
  resp1      ผู้รับผิดชอบงาน — อนุมัติขั้นที่ 1 (ลงนาม + เลือกเจ้าของพื้นที่)
  resp2      ผู้รับผิดชอบงาน (งานไฟฟ้า)
  area1      เจ้าของพื้นที่ — อนุมัติขั้นที่ 2
  area2      เจ้าของพื้นที่ (คลังสินค้า/สาธารณูปโภค)
  manager    ผู้รับผิดชอบงาน + เจ้าของพื้นที่

  รหัสยืนยันการ ✏️ แก้ไข / 🗑 ลบใบอนุญาต (Reset password): demo1234
  ติดตามสถานะ (track.html): แถบ Demo ในหน้านั้นแสดงเลขที่ + เบอร์โทรตัวอย่าง กด "ใส่ให้" ได้เลย
  ผู้ขอใบอนุญาต (request.html) ไม่ต้องเข้าสู่ระบบ

สิ่งที่ถูกปิด/จำกัดในระบบทดลอง (เพื่อไม่ให้ผู้ทดลองคนหนึ่งทำให้ระบบเสียสำหรับคนอื่น)
- แจ้งเตือน Microsoft Teams / เตือนค้างอนุมัติ: ไม่ส่งจริง (บันทึก log "DEMO: ... skipped")
- ปุ่ม "รีเซ็ตข้อมูล" (ลบฐานข้อมูลทั้งหมด): ใช้ไม่ได้
- ลบใบอนุญาตตัวอย่าง: ไม่ได้ (ใบที่ผู้ทดลองยื่นเองลบได้)
- บัญชีทดลองด้านบน: เปลี่ยนรหัสผ่าน / เปลี่ยนบทบาท / ปิดการใช้งาน ไม่ได้
  และใส่รหัสผิดกี่ครั้งก็ไม่ถูกล็อก (เพิ่มผู้ใช้ใหม่ได้ตามปกติ — หายไปเมื่อรีเซ็ต)
- ระบบไม่มีการส่งอีเมล


ขั้นตอนติดตั้ง (ทำครั้งเดียว)
------------------------------
1) สร้างโปรเจกต์ Apps Script
   - เปิด https://script.google.com → New project (โครงการใหม่)
     ตั้งชื่อ เช่น "e-Work Permit DEMO API" (ใช้บัญชี Google ที่จะเป็นเจ้าของข้อมูล demo)
   - Project Settings (รูปเฟือง) → ติ๊ก Show "appsscript.json" manifest file in editor
     → เปิดไฟล์ appsscript.json ในตัวแก้ไข แล้ววางเนื้อหาจากไฟล์ appsscript.json ของโฟลเดอร์นี้แทน

2) วางโค้ด (เลือกแบบใดแบบหนึ่ง)
   แบบ A (ง่ายสุด): เปิดไฟล์ Code.gs ในตัวแก้ไข ลบโค้ดเดิม (myFunction) ทั้งหมด
          แล้ววางเนื้อหาทั้งไฟล์ apps-script/ALL-IN-ONE.gs → กด Save (Ctrl+S)
   แบบ B: สร้างไฟล์สคริปต์ 8 ไฟล์ตามลำดับ Data, Code, Auth, Permits, Setup, DemoSeed,
          DemoAssets, Demo แล้ววางเนื้อหาจาก apps-script/<ชื่อ>.gs ให้ครบ (ห้ามวาง ALL-IN-ONE ซ้ำ)

3) รัน setupDemo ครั้งเดียว
   - เลือกฟังก์ชัน setupDemo ในแถบด้านบน → Run (เรียกใช้)
   - อนุญาตสิทธิ์ (Google Sheets, Google Drive, จัดการ trigger) — ถ้าขึ้น "Google hasn't
     verified this app" ให้กด Advanced → Go to ... (unsafe) เพราะเป็นสคริปต์ของเราเอง
   - setupDemo จะ: สร้าง Spreadsheet "e-Work Permit (FM-MR-58) Database" + โฟลเดอร์ Drive
     "e-Work Permit (FM-MR-58) Files", ตั้ง Script Properties (รหัส demo, DEMO_LAST_RESET),
     ใส่ข้อมูลตัวอย่าง และติดตั้ง trigger รายวัน demoAutoReset (มีแค่ 1 ตัวเสมอ, รันซ้ำได้)
   - ดูผลที่ Execution log (มีลิงก์ Spreadsheet/โฟลเดอร์ และรายชื่อบัญชีทดลอง)

4) Deploy เป็น Web app
   - Deploy (การทำให้ใช้งานได้) → New deployment (การทำให้ใช้งานได้รายการใหม่) → รูปเฟือง → Web app
   - Execute as: Me (ฉัน)        Who has access: Anyone (ทุกคน)
   - กด Deploy → คัดลอก Web app URL ที่ลงท้ายด้วย /exec

5) ตั้งค่าหน้าเว็บ
   - แก้ไฟล์ docs/config.js
       window.WP_CONFIG = { apiUrl: "PASTE_DEPLOYED_EXEC_URL_HERE" };
     เปลี่ยน PASTE_DEPLOYED_EXEC_URL_HERE เป็น URL /exec จากข้อ 4
   - แก้ข้อความติดต่อในบรรทัด window.DEMO_CONTACT = "..." (แสดงในแถบ Demo ทุกหน้า)
     ค่าเริ่มต้น: "สนใจใช้งานจริง ติดต่อ: Fastwork / LINE: (ใส่ภายหลัง)"
   - (ถ้ายังไม่ใส่ URL ทุกหน้าจะแสดงข้อความ "ยังไม่ได้ตั้งค่า API")

6) Push ขึ้น GitHub
   - สร้าง repository ใหม่ใน GitHub (เช่น ework-permit-demo) — Public
   - ในโฟลเดอร์นี้ (มี git และ commit แรกแล้ว):
       git add -A
       git commit -m "Set API URL"
       git remote add origin https://github.com/<USERNAME>/ework-permit-demo.git
       git push -u origin main

7) เปิด GitHub Pages
   - Repository → Settings → Pages → Build and deployment: Deploy from a branch
     → Branch: main / folder: /docs → Save
   - รอ 1–2 นาที แล้วเปิด https://<USERNAME>.github.io/ework-permit-demo/

8) ทดสอบ: หน้าแรก → ขอใบอนุญาต / ติดตามสถานะ → "สำหรับ จป. / ผู้อนุมัติ" → กดบัญชีทดลองในกล่อง
   "บัญชีทดลอง" เพื่อกรอกอัตโนมัติ


ฟังก์ชันใน Apps Script (รันจากตัวแก้ไข)
---------------------------------------
  setupDemo()      รันครั้งแรกครั้งเดียว (รันซ้ำได้: ข้อมูลจะถูกรีเซ็ตและ trigger ยังมี 1 ตัว)
  resetDemoNow()   รีเซ็ตข้อมูลกลับเป็นค่าเริ่มต้นทันที (เช่น ก่อนนัดลูกค้าดู demo)
  demoAutoReset()  ถูกเรียกโดย trigger ทุกวัน ~03:00 น. — รีเซ็ตเมื่อครบ 3 วันนับจาก DEMO_LAST_RESET
  seedDemoData_()  (ภายใน) ล้างชีต users / permits / permit_logs + ไฟล์ในโฟลเดอร์ Drive ของระบบ
                   แล้วเขียนข้อมูลตัวอย่างจาก DemoSeed.gs (ฟังก์ชันที่ลงท้าย _ เรียกจากเมนู Run ไม่ได้)
  API: GET <exec URL>?action=demo_info → เวลารีเซ็ตล่าสุด/ครั้งถัดไป (ใช้แสดงในแถบ Demo)

แก้โค้ด .gs ภายหลัง: วางโค้ดใหม่ → Deploy → Manage deployments (จัดการการทำให้ใช้งานได้)
→ ✏️ Edit → Version: New version → Deploy  (URL /exec เดิมใช้ต่อได้ ไม่ต้องแก้ config.js)
ไม่ต้องใช้ "New deployment" ซ้ำ เพราะจะได้ URL ใหม่


สำหรับนักพัฒนา
--------------
  node test/run.js                 ชุดทดสอบทั้งหมด (mock Apps Script ในเครื่อง)
  node test/dev-server.js 8765     ดูหน้าเว็บ + ข้อมูล demo ในเครื่องที่ http://localhost:8765/
  node tools/sync-data.js          หลังแก้ apps-script/Data.gs
  node tools/gen-demo-assets.js    สร้างลายเซ็นสมมติใหม่ (หลังเพิ่มชื่อคนใน DemoSeed.gs)
  node tools/build-all-in-one.js   สร้าง apps-script/ALL-IN-ONE.gs ใหม่หลังแก้ไฟล์ .gs ใดๆ
  คีย์ที่เก็บในเบราว์เซอร์ขึ้นต้นด้วย demo_ewp_ ทั้งหมด (ไม่ชนกับระบบจริงบนโดเมน github.io เดียวกัน)
