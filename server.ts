import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory or File-persisted Store for Checklist Records & Config
const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
const DATA_FILE = isVercel
  ? path.join("/tmp", "checklist_records.json")
  : path.join(process.cwd(), "checklist_records.json");
const CONFIG_FILE = isVercel
  ? path.join("/tmp", "webhook_config.json")
  : path.join(process.cwd(), "webhook_config.json");

interface ServerConfig {
  spreadsheetId: string;
  sheetName: string;
  gasWebhookUrl: string;
}

function loadConfig(): ServerConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error loading webhook config:", err);
  }
  return {
    spreadsheetId: "1Uxci-m9YhP7SFYF098f-kVdYgyXyRQ0gTuIUYghX3Fc",
    sheetName: "(2570)CHECKLIST",
    gasWebhookUrl: process.env.GAS_WEBHOOK_URL || "",
  };
}

function saveConfig(cfg: ServerConfig) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving webhook config:", err);
  }
}

let currentConfig: ServerConfig = loadConfig();

interface RecordItem {
  id: string; // e.g. 70070001
  timestamp: string;
  formattedTime: string;
  clientEmail: string;
  name: string;
  phone: string;
  dept: string;
  avNumber: string;
  type: string;
  docNumbers: string;
  attachments: string[];
  other: string;
  cabinetId: string;
  keypass: string;
  pdfUrl?: string;
  status: string;
  description: string;
  editLog?: string;
}

function loadRecords(): RecordItem[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error loading records:", err);
  }
  return [];
}

function saveRecords(records: RecordItem[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving records:", err);
  }
}

// Initial seed records if empty for rich testing
let dbRecords: RecordItem[] = loadRecords();
if (dbRecords.length === 0) {
  dbRecords = [
    {
      id: "69070001",
      timestamp: new Date("2026-07-01T07:51:00").toISOString(),
      formattedTime: "01/07/26 07:51",
      clientEmail: "shongwut.tab@mfu.ac.th",
      name: "ทรงวุฒิ",
      phone: "053-916000",
      dept: "ผลิตภัณฑ์จากผลงานการวิจัยมหาวิทยาลัยแม่ฟ้าหลวง",
      avNumber: "7700/0000",
      type: "คืนเงินยืมทดรอง",
      docNumbers: "11111 11111",
      attachments: ["1.สำเนาบันทึกที่ได้รับอนุมัติแล้ว", "2.สำเนาประมาณการรายจ่าย"],
      other: "",
      cabinetId: "N/A",
      keypass: "3",
      status: "สร้างสำเร็จ", description: "",
    },
    {
      id: "69060965",
      timestamp: new Date("2026-06-13T14:25:00").toISOString(),
      formattedTime: "13/06/26 14:25",
      clientEmail: "info.finance@mfu.ac.th",
      name: "ทดสอบ 11",
      phone: "053-916001",
      dept: "สถาบันศิลปวัฒนธรรมและอารยธรรมลุ่มน้ำโขง",
      avNumber: "1111/1111",
      type: "คืนเงินยืมทดรอง",
      docNumbers: "12313456465",
      attachments: ["1.สำเนาบันทึกที่ได้รับอนุมัติแล้ว"],
      other: "",
      cabinetId: "A12",
      keypass: "3",
      status: "สร้างสำเร็จ", description: "",
    },
    {
      id: "69050453",
      timestamp: new Date("2026-05-07T09:47:00").toISOString(),
      formattedTime: "07/05/26 09:47",
      clientEmail: "shongwut.tab@mfu.ac.th",
      name: "ทรงวุฒิ",
      phone: "053-916002",
      dept: "ศูนย์ความเป็นเลิศด้านนวัตกรรมผลิตภัณฑ์ธรรมชาติ",
      avNumber: "7700/0000",
      type: "งานเงินเดือน",
      docNumbers: "21221232",
      attachments: [],
      other: "",
      cabinetId: "A7",
      keypass: "2",
      status: "สร้างสำเร็จ", description: "",
    },
  ];
  saveRecords(dbRecords);
}

// Keypass mapping helper
const keyPassMap: Record<string, string> = {
  "ยืมเงินทดรองจ่าย": "1",
  "เบิกสำรองจ่าย": "1",
  "เบิกจ่ายทั่วไป": "1",
  "เบิกจ่ายตรวจรับพัสดุ": "1",
  "คืนเงินยืมทดรอง": "3",
  "สวัสดิการ": "2",
  "ค่าอาหารทำการนอกเวลา": "2",
  "เบิกจ่ายค่าแรง": "2",
  "ทุนการศึกษา": "2",
  "เอกสารปิดโครงการ": "4",
  "งานเงินเดือน": "2",
  "เงินลงทุน": "1",
};

// Cabinet map
const cabinetMap: Record<string, string> = {
  "ส่วนทรัพยากรบุคคล": "A1",
  "ส่วนนิติการ": "A1",
  "ศูนย์กีฬามหาวิทยาลัยแม่ฟ้าหลวง": "A2",
  "สถาบันชาและกาแฟ แห่งมหาวิทยาลัยแม่ฟ้าหลวง": "A2",
  "หน่วยความร่วมมือทางวิชาการฝรั่งเศส-อนุภูมิภาคลุ่มแม่น้ำโขง": "A3",
  "โครงการจัดตั้งหน่วยความร่วมมือทางวิชาการฝรั่งเศส-อนุภูมิภาคลุ่มแม่น้ำโขง": "A3",
  "ศูนย์ความเป็นเลิศทางด้านการวิจัยเชื้อรา": "A4",
  "หน่วยตรวจสอบภายใน": "A4",
  "ศูนย์เทคโนโลยีดิจิทัลและสารสนเทศ": "A5",
  "ศูนย์บริการสุขภาพแบบครบวงจรแห่งภาคเหนือ และอนุภูมิภาคลุ่มแม่น้ำโขง": "A6",
  "ศูนย์นวัตกรรมสมุนไพรครบวงจร มหาวิทยาลัยแม่ฟ้าหลวง": "A7",
  "ศูนย์ความเป็นเลิศด้านนวัตกรรมผลิตภัณฑ์ธรรมชาติ": "A7",
  "สถาบันนวัตกรรมการเรียนรู้มหาวิทยาลัยแม่ฟ้าหลวง": "A8",
  "สถาบันอนุรักษ์ พัฒนาทรัพยากรธรรมชาติและสิ่งแวดล้อม เพื่อความยั่งยืน": "A9",
  "ศูนย์จัดการทรัพยากรธรรมชาติและสิ่งแวดล้อม": "A9",
  "สำนักงานบัณฑิตศึกษา": "A10",
  "ส่วนจัดการทรัพย์สินทางปัญญาและนวัตกรรม": "A11",
  "ผลิตภัณฑ์จากผลงานการวิจัยมหาวิทยาลัยแม่ฟ้าหลวง": "A11",
  "สำนักงานจัดการทรัพย์สินและรายได้": "A12",
  "สถาบันศิลปวัฒนธรรมและอารยธรรมลุ่มน้ำโขง": "A12",
  "ศูนย์หนังสือ": "A12",
  "ศูนย์บริการที่พัก": "A12",
  "ศูนย์บริการอาหาร": "A12",
  "โรงพยาบาลศูนย์การแพทย์มหาวิทยาลัยแม่ฟ้าหลวง": "A13",
  "สำนักงานให้คำปรึกษาและช่วยเหลือนักศึกษา": "A14",
  "โรงพยาบาลมหาวิทยาลัยแม่ฟ้าหลวง กรุงเทพมหานคร": "A14",
  "หน่วยประสานงานมหาวิทยาลัยแม่ฟ้าหลวง กรุงเทพฯ": "A15",
  "ศูนย์บรรณสารและสื่อการศึกษา (ห้องสมุด)": "B1",
  "ศูนย์บริการวิชาการ": "B2",
  "ศูนย์เครื่องมือวิทยาศาสตร์และเทคโนโลยี": "B3",
  "ศูนย์ภาษาและวัฒนธรรมจีนสิรินธร": "B4",
  "ส่วนสารบรรณและอำนวยการ": "B5",
  "สำนักงานสภามหาวิทยาลัย": "B5",
  "ส่วนนโยบายและแผน": "B6",
  "ส่วนอาคารสถานที่": "B7",
  "ส่วนประชาสัมพันธ์": "B8",
  "ส่วนพัสดุ": "B9",
  "ส่วนทะเบียนและประมวลผล": "B10",
  "ฝ่ายรับนักศึกษา": "B10",
  "ส่วนบริหารงานวิจัย": "B11",
  "ศูนย์วิจัยและนวัตกรรมสังคมเชิงพื้นที่ เพื่อการพัฒนาอย่างยั่งยืน": "B11",
  "ส่วนพัฒนานักศึกษา": "B12",
  "หน่วยงานส่งเสริมการบริการนักศึกษาเบ็ดเสร็จ (M for U Centre)": "B12",
  "ส่วนพัฒนาความสัมพันธ์ระหว่างประเทศ": "B13",
  "ส่วนประกันคุณภาพการศึกษาและพัฒนาหลักสูตร": "B14",
  "ส่วนจัดหางานและฝึกงานของนักศึกษา": "B15",
  "ส่วนการเงินและบัญชี": "B16",
  "สำนักวิชาศิลปศาสตร์": "C1",
  "สำนักวิชาเทคโนโลยีดิจิทัลประยุกต์": "C2",
  "สำนักวิชาเทคโนโลยีสารสนเทศ": "C2",
  "สำนักวิชานิติศาสตร์": "C3",
  "สำนักวิชาวิทยาศาสตร์": "C4",
  "สำนักวิชาอุตสาหกรรมเกษตร": "C5",
  "สำนักวิชาวิทยาศาสตร์สุขภาพ": "C6",
  "สำนักวิชาวิทยาศาสตร์เครื่องสำอาง": "C7",
  "สำนักวิชาการจัดการ": "C8",
  "สำนักวิชาพยาบาลศาสตร์": "C9",
  "สำนักวิชาเวชศาสตร์ชะลอวัยและฟื้นฟูสุขภาพ": "C10",
  "สำนักวิชาแพทยศาสตร์": "C11",
  "สำนักวิชาทันตแพทยศาสตร์": "C12",
  "สำนักวิชานวัตกรรมสังคม": "C13",
  "สำนักวิชาจีนวิทยา": "C14",
  "สำนักวิชาการแพทย์บูรณาการ": "C15",
};

function getCabinetIdServer(deptName: string): string {
  if (!deptName) return "N/A";
  const trimmed = deptName.trim();
  if (cabinetMap[trimmed]) return cabinetMap[trimmed];

  const lines = trimmed.split("\n").map((s) => s.trim());
  if (lines[0] && cabinetMap[lines[0]]) return cabinetMap[lines[0]];

  const match = trimmed.match(/^([\u0E00-\u0E7F0-9\s()/\-.,]+?)([A-Za-z].*)?$/);
  if (match && match[1]) {
    const thaiPart = match[1].trim();
    if (cabinetMap[thaiPart]) return cabinetMap[thaiPart];
  }

  for (const key in cabinetMap) {
    if (trimmed.includes(key) || key.includes(trimmed)) {
      return cabinetMap[key];
    }
  }

  return "N/A";
}

// Helper to fetch live records directly from Google Sheet via gviz endpoint
async function fetchSheetRecordsServer(): Promise<RecordItem[] | null> {
  try {
    const spreadsheetId = currentConfig.spreadsheetId || "1Uxci-m9YhP7SFYF098f-kVdYgyXyRQ0gTuIUYghX3Fc";
    const sheetName = currentConfig.sheetName || "(2570)CHECKLIST";
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
    const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
    if (!res.ok) return null;
    const t = await res.text();
    const jsonStr = t.substring(t.indexOf("{"), t.lastIndexOf("}") + 1);
    const data = JSON.parse(jsonStr);
    const rows = data.table.rows || [];
    const parsed: RecordItem[] = [];
    for (const row of rows) {
      const c = row.c || [];
      const getVal = (idx: number) => {
        if (!c[idx]) return "";
        if (c[idx].f !== undefined && c[idx].f !== null) return String(c[idx].f);
        if (c[idx].v !== undefined && c[idx].v !== null) return String(c[idx].v);
        return "";
      };
      const id = getVal(0);
      if (!id || id.toLowerCase() === "id" || id.includes("ทะเบียน")) continue;

      const rawAtt = getVal(9);
      const attachments = rawAtt ? rawAtt.split(",").map((s: string) => s.trim()).filter(Boolean) : [];

      parsed.push({
        id: id,
        formattedTime: getVal(1) || new Date().toLocaleString("th-TH"),
        timestamp: new Date().toISOString(),
        clientEmail: getVal(2),
        name: getVal(3),
        phone: getVal(4),
        dept: getVal(5),
        avNumber: getVal(6),
        type: getVal(7),
        docNumbers: getVal(8),
        attachments: attachments,
        cabinetId: getVal(10) || getCabinetIdServer(getVal(5)) || "N/A",
        keypass: getVal(11) || keyPassMap[getVal(7)] || "1",
        pdfUrl: getVal(12) || "",
        description: getVal(13),
        editLog: getVal(14),
        status: "ดึงข้อมูลจาก Google Sheet",
        other: ""
      });
    }
    return parsed;
  } catch (err) {
    console.warn("Failed to fetch Google Sheet via gviz:", err);
    return null;
  }
}

// GET /api/history (Fetch directly from Google Sheet with fallback to local db)
app.get(["/api/history", "/history"], async (req, res) => {
  const sheetRecords = await fetchSheetRecordsServer();
  if (sheetRecords && sheetRecords.length > 0) {
    if (dbRecords && dbRecords.length > 0) {
      const sheetIds = new Set(sheetRecords.map((s) => String(s.id).trim()));
      const merged = sheetRecords.map((sRec) => {
        const localRec = dbRecords.find((l) => String(l.id).trim() === String(sRec.id).trim());
        if (localRec && localRec.status === "แก้ไขแล้ว") {
          return {
            ...sRec,
            name: localRec.name || sRec.name,
            phone: localRec.phone || sRec.phone,
            clientEmail: localRec.clientEmail || sRec.clientEmail,
            dept: localRec.dept || sRec.dept,
            avNumber: localRec.avNumber || sRec.avNumber,
            type: localRec.type || sRec.type,
            docNumbers: localRec.docNumbers || sRec.docNumbers,
            attachments: (localRec.attachments && localRec.attachments.length > 0) ? localRec.attachments : sRec.attachments,
            description: localRec.description || sRec.description,
            cabinetId: localRec.cabinetId || sRec.cabinetId,
            keypass: localRec.keypass || sRec.keypass,
            editLog: localRec.editLog || sRec.editLog,
            status: localRec.status,
          };
        }
        return sRec;
      });
      const localOnly = dbRecords.filter((l) => !sheetIds.has(String(l.id).trim()));
      dbRecords = [...merged, ...localOnly];
    } else {
      dbRecords = sheetRecords;
    }
    saveRecords(dbRecords);
  }

  let list = dbRecords.slice().reverse(); // return newest first
  const email = req.query.email ? String(req.query.email).trim().toLowerCase() : "";
  if (email) {
    list = list.filter((r) => r.clientEmail.toLowerCase() === email);
  }
  res.json({ status: "success", records: list });
});

// POST /api/sync (Sync from Google Sheet to local server)
app.post(["/api/sync", "/sync"], (req, res) => {
  if (req.body && req.body.records) {
    dbRecords = req.body.records;
    saveRecords(dbRecords);
  }
  res.json({ status: "success" });
});

// Helper to send POST requests to Google Apps Script Webhook handling redirects
async function sendPostToGas(url: string, payload: any) {
  if (!url) return null;
  try {
    const jsonBody = JSON.stringify(payload);
    let res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: jsonBody,
      redirect: "manual",
    });

    if (res.status >= 300 && res.status < 400) {
      const redirectUrl = res.headers.get("location");
      if (redirectUrl) {
        res = await fetch(redirectUrl, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: jsonBody,
        });
      }
    }
    return res;
  } catch (err) {
    console.warn("GAS Webhook POST error:", err);
    return null;
  }
}

// POST /api/process
app.post(["/api/process", "/process"], async (req, res) => {
  try {
    const formData = req.body;
    const timestamp = new Date();

    // If client sent a new gasWebhookUrl, persist it
    if (formData.gasWebhookUrl && formData.gasWebhookUrl.trim() !== currentConfig.gasWebhookUrl) {
      currentConfig.gasWebhookUrl = formData.gasWebhookUrl.trim();
      saveConfig(currentConfig);
    }

    // Generate Thailand Time (Asia/Bangkok GMT+7)
    const nowUtc = new Date();
    const thaiDate = new Date(nowUtc.toLocaleString("en-US", { timeZone: "Asia/Bangkok" }));
    
    // Format Month (2 digits) & Thailand formatted string e.g. 03/08/26 14:32:05
    const month = ("0" + (thaiDate.getMonth() + 1)).slice(-2);
    const day = ("0" + thaiDate.getDate()).slice(-2);
    const yearStr = ("" + thaiDate.getFullYear()).slice(-2);
    const hours = ("0" + thaiDate.getHours()).slice(-2);
    const mins = ("0" + thaiDate.getMinutes()).slice(-2);
    const secs = ("0" + thaiDate.getSeconds()).slice(-2);
    const formattedTime = `${day}/${month}/${yearStr} ${hours}:${mins}:${secs}`;

    const prefix = "70" + month;

    // Sync latest records from Google Sheet to ensure sequence number is accurate
    const liveSheetRecords = await fetchSheetRecordsServer();
    if (liveSheetRecords && liveSheetRecords.length > 0) {
      dbRecords = liveSheetRecords;
      saveRecords(dbRecords);
    }

    // Calculate sequence for current month
    const currentMonthRecords = dbRecords.filter((r) => r.id.startsWith(prefix));
    let nextNum = 1;
    if (currentMonthRecords.length > 0) {
      const lastId = currentMonthRecords[currentMonthRecords.length - 1].id;
      const lastSeq = parseInt(lastId.substring(4)) || 0;
      nextNum = lastSeq + 1;
    }
    const displayDocId = prefix + ("000" + nextNum).slice(-4);

    const kp = keyPassMap[formData.type] || "1";
    const cabId = getCabinetIdServer(formData.dept);

    const newRecord: RecordItem = {
      id: displayDocId,
      timestamp: timestamp.toISOString(),
      formattedTime: formattedTime,
      clientEmail: formData.clientEmail || "info.finance@mfu.ac.th",
      name: formData.name || "",
      phone: formData.phone || "",
      dept: formData.dept || "",
      avNumber: formData.avNumber || "",
      type: formData.type || "",
      docNumbers: formData.docNumbers || "",
      attachments: Array.isArray(formData.attachments) ? formData.attachments : [],
      other: formData.other || "",
      description: formData.description || "",
      cabinetId: cabId,
      keypass: kp,
      status: "สร้างสำเร็จ",
      editLog: "",
    };

    newRecord.pdfUrl = "";
    dbRecords.push(newRecord);
    saveRecords(dbRecords);

    // Forward to Google Apps Script Webhook if configured
    const targetWebhookUrl = formData.gasWebhookUrl || currentConfig.gasWebhookUrl || process.env.GAS_WEBHOOK_URL || "";
    if (targetWebhookUrl) {
      try {
        const gasResponse = await sendPostToGas(targetWebhookUrl, {
          ...formData,
          displayDocId,
          id: displayDocId,
          formattedTime,
          timestamp: newRecord.timestamp,
          cabinetId: cabId,
          keypass: kp,
          spreadsheetId: currentConfig.spreadsheetId || "1Uxci-m9YhP7SFYF098f-kVdYgyXyRQ0gTuIUYghX3Fc",
          sheetName: currentConfig.sheetName || "(2570)CHECKLIST",
        });

        if (gasResponse) {
          const gasJson = await gasResponse.json().catch(() => null);
          if (gasJson && gasJson.pdfUrl) {
            newRecord.pdfUrl = gasJson.pdfUrl;
            saveRecords(dbRecords);
          }
        }
      } catch (e) {
        console.warn("Webhook forward failed, stored locally:", e);
      }
    }
    res.json({
      status: "success",
      id: displayDocId,
      record: newRecord,
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", msg: err.message });
  }
});

// PUT /api/history/:id (Edit checklist record)
app.put(["/api/history/:id", "/history/:id"], async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const index = dbRecords.findIndex((r) => String(r.id).trim() === String(id).trim());
    if (index === -1) {
      return res.status(404).json({ status: "error", msg: "Record not found" });
    }

    const kp = updatedData.type ? (keyPassMap[updatedData.type] || "1") : dbRecords[index].keypass;
    const cabId = updatedData.dept ? getCabinetIdServer(updatedData.dept) : dbRecords[index].cabinetId;

    const existing = dbRecords[index];
    const updatedRecord: RecordItem = {
      ...existing,
      name: updatedData.name ?? existing.name,
      phone: updatedData.phone ?? existing.phone,
      clientEmail: updatedData.clientEmail ?? existing.clientEmail,
      dept: updatedData.dept ?? existing.dept,
      avNumber: updatedData.avNumber ?? existing.avNumber,
      type: updatedData.type ?? existing.type,
      docNumbers: updatedData.docNumbers ?? existing.docNumbers,
      attachments: Array.isArray(updatedData.attachments) ? updatedData.attachments : existing.attachments,
      other: updatedData.other ?? existing.other,
      description: updatedData.description ?? existing.description,
      cabinetId: cabId,
      keypass: kp,
      status: "แก้ไขแล้ว",
      editLog: updatedData.editLog ?? existing.editLog,
    };

    dbRecords[index] = updatedRecord;
    saveRecords(dbRecords);

    // Forward updated record to GAS Webhook if provided
    const targetWebhookUrl = updatedData.gasWebhookUrl || currentConfig.gasWebhookUrl || process.env.GAS_WEBHOOK_URL || "";
    if (targetWebhookUrl) {
      try {
        await sendPostToGas(targetWebhookUrl, {
          ...updatedRecord,
          action: "update",
          displayDocId: updatedRecord.id,
          id: updatedRecord.id,
          spreadsheetId: updatedData.spreadsheetId || currentConfig.spreadsheetId || "1Uxci-m9YhP7SFYF098f-kVdYgyXyRQ0gTuIUYghX3Fc",
          sheetName: updatedData.sheetName || currentConfig.sheetName || "(2570)CHECKLIST",
        });
      } catch (e) {
        console.warn("GAS update forward warning:", e);
      }
    }

    res.json({ status: "success", record: updatedRecord });
  } catch (err: any) {
    res.status(500).json({ status: "error", msg: err.message });
  }
});

// DELETE /api/history (Reset test data)
app.delete(["/api/history", "/history"], (req, res) => {
  dbRecords = [];
  saveRecords(dbRecords);
  res.json({ status: "success", message: "History cleared" });
});

// Only run local dev / static file server when not in Vercel Serverless environment
if (!isVercel) {
  async function startServer() {
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  startServer();
}

export default app;
