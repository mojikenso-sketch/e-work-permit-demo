/**
 * DEMO seed data (plain data) — the default content written by seedDemoData_() (Demo.gs)
 * on setupDemo(), resetDemoNow() and every 5 hours by demoAutoReset() (hourly trigger).
 *
 * Everything here is FICTIONAL: the company "บริษัท ตัวอย่าง อินดัสทรี จำกัด (Demo Co., Ltd.)",
 * its staff, contractors, phone numbers (080-000-xxxx) and e-mails (*.example).
 *
 * Dates are RELATIVE to the moment of the reset so the demo never looks stale:
 *   day / cday  = work date / created date in days from "today" (Asia/Bangkok), e.g. -2 = two days ago
 *   from / to   = work window (HH:MM, "to" ≤ "from" = overnight)
 *   ctime       = time of day the request was submitted (moved earlier automatically when it
 *                 would lie in the future at reset time)
 * flow = what happened to the request:
 *   closed            approved, worked, inspected and closed by the จป.
 *   expired           approved, the work window is over, not closed yet (shows "หมดอายุ")
 *   approved          approved, work today / upcoming (shows "อนุมัติ / ปฏิบัติงาน")
 *   pending:assign    ขั้นที่ 1 — waits for the ผู้รับผิดชอบงาน
 *   pending:area      ขั้นที่ 2 — waits for the เจ้าของพื้นที่
 *   pending:safety    ขั้นที่ 3 — waits for the จป.
 *   rejected:<stage>  rejected at that stage (reason = why)
 * resp / area / safety = usernames of the approvers (DEMO_SEED.users).
 * Tests (test/demo.test.js) verify this data and what the builder makes of it.
 */
var DEMO_SEED = {
  "password": "demo1234",        // every demo account (public, shown on the login page)
  "resetPassword": "demo1234",   // Script Property WP_RESET_PASSWORD (confirms ✏️ edit / 🗑 delete)
  "users": [
    { "username": "admin", "fullname": "วรรณา ศรีปลอดภัย", "position": "เจ้าหน้าที่ความปลอดภัย (จป.วิชาชีพ)", "roles": "safety", "phone": "080-000-1001", "email": "wanna.s@demo-co.example" },
    { "username": "safety", "fullname": "ธนากร มั่นคงดี", "position": "เจ้าหน้าที่ความปลอดภัย (จป.เทคนิคขั้นสูง)", "roles": "safety", "phone": "080-000-1002", "email": "thanakorn.m@demo-co.example" },
    { "username": "resp1", "fullname": "สมชาย ใจมั่น", "position": "วิศวกรซ่อมบำรุง", "roles": "responsible", "phone": "080-000-1003", "email": "somchai.j@demo-co.example" },
    { "username": "resp2", "fullname": "กมลวรรณ ทองดี", "position": "หัวหน้างานวิศวกรรมไฟฟ้า", "roles": "responsible", "phone": "080-000-1004", "email": "kamonwan.t@demo-co.example" },
    { "username": "area1", "fullname": "ประสิทธิ์ เรืองศรี", "position": "ผู้จัดการฝ่ายผลิต", "roles": "area_owner", "phone": "080-000-1005", "email": "prasit.r@demo-co.example" },
    { "username": "area2", "fullname": "นภาพร แสงทอง", "position": "หัวหน้าแผนกคลังสินค้าและสาธารณูปโภค", "roles": "area_owner", "phone": "080-000-1006", "email": "napaporn.s@demo-co.example" },
    { "username": "manager", "fullname": "อนุชา บุญมา", "position": "ผู้จัดการโรงงาน", "roles": "responsible,area_owner", "phone": "080-000-1007", "email": "anucha.b@demo-co.example" }
  ],
  "requesters": {
    "weld": { "title": "นาย", "name": "วีระพงษ์ แก้วประเสริฐ", "company": "บริษัท ช่างเหล็กไทย เอ็นจิเนียริ่ง จำกัด", "phone": "080-000-2101" },
    "scaf": { "title": "นาย", "name": "บุญเลิศ สายทอง", "company": "หจก. ทวีทรัพย์ นั่งร้านและก่อสร้าง", "phone": "080-000-2102" },
    "elec": { "title": "นาย", "name": "ชัยวัฒน์ ศรีสุข", "company": "บริษัท พลังไฟ เทคนิคอล เซอร์วิส จำกัด", "phone": "080-000-2103" },
    "tank": { "title": "นาย", "name": "อำนาจ พรหมมา", "company": "บริษัท คลีนแทงค์ เซอร์วิส จำกัด", "phone": "080-000-2104" },
    "air":  { "title": "นาย", "name": "ณัฐพล มีสุข", "company": "บริษัท เย็นสบาย แอร์ แอนด์ คูลลิ่ง จำกัด", "phone": "080-000-2105" },
    "paint": { "title": "นาง", "name": "สุดารัตน์ วงศ์ใหญ่", "company": "หจก. สีสวย เพ้นท์ติ้ง", "phone": "080-000-2106" },
    "chem": { "title": "นาย", "name": "ธีรวัฒน์ ปัญญาดี", "company": "บริษัท เคมีภัณฑ์ภิบาล โลจิสติกส์ จำกัด", "phone": "080-000-2107" },
    "mtn":  { "title": "นาย", "name": "สุรศักดิ์ ทองคำ", "company": "แผนกซ่อมบำรุง (ภายใน)", "phone": "080-000-2108" },
    "ee":   { "title": "นาย", "name": "ปิยะ อินทร์แก้ว", "company": "แผนกวิศวกรรมไฟฟ้า (ภายใน)", "phone": "080-000-2109" },
    "prod": { "title": "นางสาว", "name": "จิราพร ดวงดี", "company": "แผนกผลิต (ภายใน)", "phone": "080-000-2110" }
  },
  // worker crews (name, role) — a permit takes the first N of its crew
  "crews": {
    "weld": [["สมพงษ์ ใจกล้า", "ช่างเชื่อม"], ["ประเสริฐ ทองมา", "ช่างเชื่อม"], ["วิทยา สุขใจ", "ผู้ช่วยช่าง"], ["มานพ ศรีทอง", "ผู้เฝ้าระวังไฟ (Fire Watch)"]],
    "scaf": [["สมบัติ แก้วกล้า", "หัวหน้าชุดนั่งร้าน"], ["อดิศร มณีวงศ์", "ช่างนั่งร้าน"], ["เกรียงไกร ทองสุข", "ช่างนั่งร้าน"], ["สุชาติ บุญรอด", "ผู้ช่วยช่าง"], ["วรพจน์ คงดี", "ผู้ช่วยช่าง"]],
    "elec": [["ธนพล วงศ์ทอง", "ช่างไฟฟ้า (บัตรช่างระดับ 2)"], ["กิตติศักดิ์ ใจดี", "ช่างไฟฟ้า"], ["ภานุวัฒน์ สีทอง", "ผู้ช่วยช่างไฟฟ้า"]],
    "tank": [["สมหมาย ดีเลิศ", "ผู้ควบคุมงานที่อับอากาศ"], ["จักรพันธ์ ทองหล่อ", "ผู้ปฏิบัติงาน"], ["อนันต์ พรมสุข", "ผู้ปฏิบัติงาน"], ["ไพโรจน์ แสงดี", "ผู้ช่วยเหลือ"], ["ศักดิ์ชัย มั่นคง", "ผู้เฝ้าระวัง"]],
    "air": [["วัชระ บุญเรือง", "ช่างแอร์"], ["นิพนธ์ ชัยมงคล", "ช่างแอร์"], ["สิทธิชัย แก้วมณี", "ผู้ช่วยช่าง"]],
    "paint": [["สมใจ รักงาน", "ช่างทาสี"], ["บุญมี ศรีสวัสดิ์", "ช่างทาสี"], ["ทองใบ แสนดี", "ผู้ช่วยช่าง"]],
    "chem": [["ชาตรี ใจเย็น", "พนักงานขับรถขนส่งสารเคมี"], ["ยุทธนา ปลอดภัย", "ผู้ควบคุมการถ่ายสาร"]],
    "mtn": [["สุรศักดิ์ ทองคำ", "ช่างซ่อมบำรุง"], ["อภิชาติ วงศ์ดี", "ช่างซ่อมบำรุง"], ["พงศกร ศรีเมือง", "ช่างเทคนิค"]],
    "ee": [["ปิยะ อินทร์แก้ว", "ช่างไฟฟ้า"], ["ศุภชัย คำแก้ว", "ช่างไฟฟ้า"]],
    "prod": [["จิราพร ดวงดี", "หัวหน้ากะผลิต"], ["มยุรี สายบุญ", "พนักงานผลิต"], ["สมศรี ทองแท้", "พนักงานผลิต"]]
  },
  "permits": [
    // ---------------- closed (ปิดงานแล้ว)
    { "flow": "closed", "types": ["hot"], "ptype": "contractor", "company": 0, "req": "weld", "crew": 3,
      "location": "อาคารผลิต 1 – ไลน์บรรจุ 2", "job": "เชื่อมซ่อมขาตั้งสายพานลำเลียง (Conveyor) ที่แตกร้าว พร้อมเสริมแผ่นเหล็ก",
      "day": -12, "from": "08:30", "to": "16:30", "cday": -13, "ctime": "14:10", "resp": "resp1", "area": "area1", "safety": "admin",
      "cl": { "h9": "ใบรับรองช่างเชื่อม (สมพงษ์ ใจกล้า)" }, "ownerSign": true },
    { "flow": "closed", "types": ["height"], "ptype": "contractor", "company": 0, "req": "scaf", "crew": 5,
      "location": "หลังคาโกดังสินค้า B", "job": "ติดตั้งนั่งร้านและเปลี่ยนแผ่นหลังคาเมทัลชีทที่รั่วซึม 12 แผ่น",
      "day": -10, "from": "08:00", "to": "17:00", "cday": -11, "ctime": "10:25", "resp": "resp1", "area": "area2", "safety": "safety" },
    { "flow": "closed", "types": ["electric"], "ptype": "contractor", "company": 0, "req": "elec", "crew": 3,
      "location": "ห้อง MDB อาคาร 2", "job": "บำรุงรักษาตู้ MDB ประจำปี ขันแน่นจุดต่อ และตรวจวัดอุณหภูมิด้วยกล้องอินฟราเรด",
      "day": -8, "from": "18:00", "to": "23:00", "cday": -9, "ctime": "09:40", "resp": "resp2", "area": "area2", "safety": "admin",
      "loto": [{ "item": "MDB-2 / ACB หลัก", "on": "18:05", "off": "22:40" }] },
    { "flow": "closed", "types": ["confined", "general"], "ptype": "contractor", "company": 0, "req": "tank", "crew": 5,
      "location": "ถังเก็บน้ำมันพืช T-02", "job": "ล้างทำความสะอาดภายในถังเก็บ T-02 และตรวจสภาพผนังถัง",
      "day": -6, "from": "08:00", "to": "16:00", "cday": -7, "ctime": "13:15", "resp": "manager", "area": "manager", "safety": "admin",
      "cl": { "cs_about": "ล้างถังเก็บน้ำมันพืช T-02" } },
    { "flow": "closed", "types": ["general"], "ptype": "internal", "company": 1, "req": "mtn", "crew": 3,
      "location": "โรงซ่อมบำรุง (Workshop)", "job": "ยกเปลี่ยนมอเตอร์ปั๊มน้ำหล่อเย็น 15 kW ด้วยรอกโซ่",
      "day": -4, "from": "09:00", "to": "15:00", "cday": -5, "ctime": "16:05", "resp": "resp1", "area": "area1", "safety": "safety" },
    { "flow": "closed", "types": ["chemical"], "ptype": "contractor", "company": 0, "req": "chem", "crew": 2,
      "location": "ลานถ่ายสารเคมี (Unloading Bay)", "job": "ถ่ายโซดาไฟ (NaOH 50%) จากรถขนส่งเข้าถังเก็บ TK-05 ปริมาณ 12,000 ลิตร",
      "day": -2, "from": "10:00", "to": "12:00", "cday": -3, "ctime": "11:30", "resp": "resp1", "area": "area2", "safety": "admin" },
    // ---------------- expired (approved, window over, not closed yet)
    { "flow": "expired", "types": ["hot", "height"], "ptype": "contractor", "company": 0, "req": "weld", "crew": 4,
      "location": "ท่อส่งไอน้ำ ระดับ +6 ม. อาคารหม้อไอน้ำ", "job": "ตัดและเชื่อมเปลี่ยนท่อไอน้ำขนาด 4 นิ้ว ช่วงที่ผุกร่อน บนรางท่อสูง 6 เมตร",
      "day": -3, "from": "08:00", "to": "17:00", "cday": -4, "ctime": "15:45", "resp": "resp1", "area": "area1", "safety": "safety",
      "done": "งานเชื่อมเสร็จเรียบร้อย ทดสอบแรงดันแล้วไม่รั่ว เก็บอุปกรณ์และทำความสะอาดพื้นที่แล้ว", "cl": { "h9": "ใบรับรองช่างเชื่อม" } },
    { "flow": "expired", "types": ["general"], "ptype": "contractor", "company": 0, "req": "air", "crew": 3,
      "location": "ห้องควบคุมคุณภาพ (QC Lab)", "job": "ล้างและเติมน้ำยาเครื่องปรับอากาศ 4 เครื่อง",
      "day": -1, "from": "09:00", "to": "15:00", "cday": -2, "ctime": "10:20", "resp": "resp2", "area": "area1", "safety": "admin",
      "done": "ล้างแอร์ครบ 4 เครื่อง เติมน้ำยา R32 และทดสอบการทำความเย็นแล้ว" },
    { "flow": "expired", "types": ["height"], "ptype": "contractor", "company": 1, "req": "paint", "crew": 3,
      "location": "ผนังภายนอกอาคารสำนักงาน (ด้านทิศเหนือ)", "job": "ทาสีผนังภายนอกอาคารด้วยรถกระเช้า ความสูงไม่เกิน 8 เมตร",
      "day": -1, "from": "08:00", "to": "16:00", "cday": -3, "ctime": "14:00", "resp": "manager", "area": "area2", "safety": "safety" },
    // ---------------- approved (today / upcoming)
    { "flow": "approved", "types": ["hot"], "ptype": "contractor", "company": 0, "req": "weld", "crew": 4,
      "location": "อาคารผลิต 1 – ไลน์บรรจุ 1", "job": "เชื่อมติดตั้งราวกันตกและแผ่นกันชนรอบเครื่องบรรจุอัตโนมัติ",
      "day": 0, "from": "08:00", "to": "17:00", "cday": -1, "ctime": "13:30", "resp": "resp1", "area": "area1", "safety": "admin",
      "cl": { "h9": "ใบรับรองช่างเชื่อม" }, "ownerSign": true },
    { "flow": "approved", "types": ["electric"], "ptype": "internal", "company": 0, "req": "ee", "crew": 2,
      "location": "ห้องเครื่องอัดอากาศ (Air Compressor Room)", "job": "เปลี่ยนเบรกเกอร์และสายไฟเมนของเครื่องอัดอากาศ AC-03",
      "day": 0, "from": "13:00", "to": "20:00", "cday": -1, "ctime": "09:15", "resp": "resp2", "area": "area2", "safety": "safety",
      "loto": [{ "item": "MCC-1 / CB-AC03", "on": "13:05", "off": "" }] },
    { "flow": "approved", "types": ["confined"], "ptype": "contractor", "company": 0, "req": "tank", "crew": 5,
      "location": "บ่อบำบัดน้ำเสีย – บ่อเติมอากาศ 1", "job": "ลอกตะกอนและซ่อมหัวจ่ายอากาศในบ่อบำบัด (ระบายน้ำออกแล้ว)",
      "day": 0, "from": "20:00", "to": "04:00", "cday": -1, "ctime": "16:40", "resp": "manager", "area": "manager", "safety": "admin",
      "cl": { "cs_about": "ลอกตะกอนและซ่อมหัวจ่ายอากาศ" } },
    { "flow": "approved", "types": ["height", "general"], "ptype": "contractor", "company": 0, "req": "scaf", "crew": 4,
      "location": "หอผึ่งเย็น (Cooling Tower) CT-1", "job": "ตั้งนั่งร้านและเปลี่ยนใบพัดลมหอผึ่งเย็น",
      "day": 1, "from": "08:00", "to": "17:00", "cday": 0, "ctime": "08:20", "resp": "resp1", "area": "area2", "safety": "safety" },
    { "flow": "approved", "types": ["chemical"], "ptype": "contractor", "company": 1, "req": "chem", "crew": 2,
      "location": "ลานถ่ายสารเคมี (Unloading Bay)", "job": "ถ่ายกรดฟอสฟอริก 85% เข้าถังเก็บ TK-07",
      "day": 1, "from": "10:00", "to": "12:00", "cday": 0, "ctime": "08:50", "resp": "resp1", "area": "area2", "safety": "admin" },
    { "flow": "approved", "types": ["general"], "ptype": "internal", "company": 0, "req": "prod", "crew": 3,
      "location": "คลังวัตถุดิบ – โซน A", "job": "ย้ายชั้นวางพาเลทและจัดผังคลังใหม่ด้วยรถยก (Forklift)",
      "day": 2, "from": "08:00", "to": "12:00", "cday": 0, "ctime": "09:05", "resp": "manager", "area": "area2", "safety": "safety" },
    // ---------------- pending ขั้นที่ 3 (จป.)
    { "flow": "pending:safety", "types": ["hot", "confined"], "ptype": "contractor", "company": 0, "req": "weld", "crew": 4,
      "location": "ถังผสม MX-01 อาคารผลิต 2", "job": "เชื่อมซ่อมใบกวนภายในถังผสม MX-01",
      "day": 1, "from": "08:00", "to": "16:00", "cday": 0, "ctime": "07:40", "resp": "resp1", "area": "area1",
      "cl": { "cs_about": "เชื่อมซ่อมใบกวนภายในถัง", "h9": "ใบรับรองช่างเชื่อม" } },
    { "flow": "pending:safety", "types": ["electric"], "ptype": "contractor", "company": 0, "req": "elec", "crew": 2,
      "location": "สถานีไฟฟ้าย่อย (Substation) 22 kV", "job": "ทดสอบรีเลย์ป้องกันและฉีดล้างลูกถ้วยหม้อแปลง",
      "day": 2, "from": "07:00", "to": "15:00", "cday": -1, "ctime": "15:30", "resp": "resp2", "area": "area2",
      "loto": [{ "item": "RMU-1 / LBS ขาเข้า", "on": "", "off": "" }] },
    // ---------------- pending ขั้นที่ 2 (เจ้าของพื้นที่)
    { "flow": "pending:area", "types": ["height"], "ptype": "contractor", "company": 0, "req": "air", "crew": 2,
      "location": "หลังคาอาคารสำนักงาน", "job": "ติดตั้งคอยล์ร้อนเครื่องปรับอากาศชุดใหม่บนหลังคา",
      "day": 1, "from": "09:00", "to": "16:00", "cday": 0, "ctime": "08:05", "resp": "resp2", "area": "area2" },
    { "flow": "pending:area", "types": ["general"], "ptype": "internal", "company": 1, "req": "mtn", "crew": 3,
      "location": "ห้องเย็น 3 (Cold Room)", "job": "เปลี่ยนซีลประตูและไฟส่องสว่างในห้องเย็น",
      "day": 2, "from": "13:00", "to": "17:00", "cday": -1, "ctime": "16:50", "resp": "resp1", "area": "area1" },
    // ---------------- pending ขั้นที่ 1 (ผู้รับผิดชอบงาน)
    { "flow": "pending:assign", "types": ["hot"], "ptype": "contractor", "company": 0, "req": "weld", "crew": 2,
      "location": "ลานจอดรถบรรทุก", "job": "เชื่อมซ่อมรั้วเหล็กและประตูรั้วบานเลื่อน",
      "day": 2, "from": "08:00", "to": "12:00", "cday": 0, "ctime": "09:20", "resp": "resp1" },
    { "flow": "pending:assign", "types": ["chemical", "general"], "ptype": "contractor", "company": 0, "req": "paint", "crew": 3,
      "location": "พื้นอาคารคลังสินค้า B", "job": "เคลือบพื้นอีพ็อกซี่ (Epoxy) บริเวณทางเดินรถยก",
      "day": 3, "from": "08:00", "to": "17:00", "cday": 0, "ctime": "09:45", "resp": "manager" },
    { "flow": "pending:assign", "types": ["electric", "height"], "ptype": "internal", "company": 0, "req": "ee", "crew": 2,
      "location": "อาคารผลิต 2 – โคมไฟเพดานสูง", "job": "เปลี่ยนโคมไฟ High Bay เป็น LED จำนวน 24 ชุด",
      "day": 3, "from": "08:00", "to": "17:00", "cday": 0, "ctime": "10:10", "resp": "resp2",
      "loto": [{ "item": "DB-P2 วงจรแสงสว่าง", "on": "", "off": "" }] },
    // ---------------- rejected (ไม่อนุมัติ)
    { "flow": "rejected:assign", "types": ["hot"], "ptype": "contractor", "company": 0, "req": "weld", "crew": 1,
      "location": "ห้องเก็บสารไวไฟ", "job": "เจียรตัดชั้นวางเหล็กเก่าในห้องเก็บสารไวไฟ",
      "day": -5, "from": "09:00", "to": "12:00", "cday": -6, "ctime": "10:00", "resp": "resp1",
      "reason": "พื้นที่มีสารไวไฟจัดเก็บอยู่ ให้ย้ายสารออกและวัดค่า LEL ก่อน แล้วยื่นขอใหม่" },
    { "flow": "rejected:area", "types": ["general"], "ptype": "contractor", "company": 0, "req": "air", "crew": 2,
      "location": "ห้องประชุมใหญ่ ชั้น 2", "job": "ย้ายตำแหน่งเครื่องปรับอากาศ 2 เครื่อง",
      "day": -2, "from": "09:00", "to": "17:00", "cday": -4, "ctime": "13:20", "resp": "resp2", "area": "area2",
      "reason": "ห้องประชุมมีกำหนดใช้งานตลอดวัน กรุณาเลื่อนเป็นวันเสาร์" },
    { "flow": "rejected:safety", "types": ["confined"], "ptype": "contractor", "company": 0, "req": "tank", "crew": 2,
      "location": "บ่อพักน้ำเสีย (Sump Pit) อาคาร 1", "job": "ดูดตะกอนในบ่อพักน้ำเสีย",
      "day": 1, "from": "08:00", "to": "12:00", "cday": -1, "ctime": "11:10", "resp": "resp1", "area": "area1",
      "reason": "ผู้ช่วยเหลือมีเพียง 1 คน และยังไม่ได้แนบผลสอบเทียบเครื่องวัดก๊าซ (Gas detector) กรุณาแก้ไขแล้วยื่นใหม่" }
  ],
  // optional notes the approvers wrote
  "notes": {
    "resp": ["ตรวจหน้างานแล้ว ผู้รับเหมามีอุปกรณ์ครบ", "", "อนุมัติ — ให้ประสานหัวหน้ากะก่อนเริ่มงาน", ""],
    "area": ["", "แจ้งพนักงานในพื้นที่แล้ว", "", "ให้กั้นพื้นที่ทางเดินให้ชัดเจน"],
    "safety": ["อนุมัติ ให้มีผู้เฝ้าระวังตลอดการปฏิบัติงาน", "", "อนุมัติ — ตรวจสอบอุปกรณ์ดับเพลิงก่อนเริ่มงาน", ""]
  }
};
