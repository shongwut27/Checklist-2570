import { ChecklistRecord } from '../types';

const TEMPLATE_SLIDE_ID = '1H0Ka4w-cNHpb-nXEdLbzpqq2PJodYsRLjgqS0rcwGFU';
const FOLDER_ID = '1uCP6AOi-d2JhHFsouZJhnu0_zNZquTSj';

function getValueForPlaceholderKey(key: string, record: ChecklistRecord): string {
  const normalized = key.trim().toLowerCase();
  const attachmentText = Array.isArray(record.attachments)
    ? record.attachments.join(', ')
    : record.attachments || '-';

  if (normalized.includes('หน่วยงาน') || normalized.includes('dept')) {
    return record.dept || '-';
  }
  if (normalized.includes('ทะเบียนรับ') || normalized.includes('เลขรับ') || normalized === 'id' || normalized === 'displaydocid') {
    return record.id || '-';
  }
  if (normalized.includes('อว') || normalized.includes('av')) {
    return record.avNumber || '-';
  }
  if (normalized.includes('รหัสตู้') || normalized === 'ตู้' || normalized.includes('cabinet')) {
    return record.cabinetId || '-';
  }
  if (normalized.includes('แนบ') || normalized.includes('attachment')) {
    return attachmentText;
  }
  if (normalized.includes('เลขที่เอกสาร') || normalized.includes('รายการเลขที่') || normalized.includes('docnumber')) {
    return record.docNumbers || '-';
  }
  if (normalized.includes('ประเภท') || normalized === 'type') {
    return record.type || '-';
  }
  if (normalized.includes('ผู้ส่ง') || normalized.includes('ชื่อ') || normalized === 'name') {
    return record.name || '-';
  }
  if (normalized.includes('โทร') || normalized.includes('phone')) {
    return record.phone || '-';
  }
  if (normalized.includes('อีเมล') || normalized.includes('email')) {
    return record.clientEmail || '-';
  }
  if (normalized.includes('keypass')) {
    return record.keypass || '-';
  }
  if (normalized.includes('เวลา') || normalized.includes('วัน') || normalized.includes('time') || normalized.includes('date')) {
    return record.formattedTime || '-';
  }
  if (normalized.includes('อื่นๆ') || normalized.includes('other')) {
    return record.other || '-';
  }
  if (normalized.includes('อธิบาย') || normalized.includes('description')) {
    return record.description || '-';
  }
  if (normalized.includes('|') || normalized.includes('barcode') || normalized.includes('บาร์โค้ด')) {
    return record.id || '-';
  }
  return '';
}

/**
 * Append a row to Google Sheet (2570)CHECKLIST using Google Sheets API
 */
export async function appendRecordToSheet(record: ChecklistRecord, accessToken: string, spreadsheetId: string, sheetName: string) {
  try {
    const rowValues = [
      record.id,
      record.formattedTime || new Date().toLocaleString('th-TH'),
      record.clientEmail,
      record.name,
      record.phone,
      record.dept,
      record.avNumber || '-',
      record.type,
      record.docNumbers || '-',
      Array.isArray(record.attachments) ? record.attachments.join(', ') : record.attachments || '-',
      record.cabinetId,
      record.keypass,
      record.pdfUrl || '-',
      record.description || '-',
      record.editLog || '-',
    ];

    const targetRange = `'${sheetName.replace(/'/g, "''")}'!A:O`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(targetRange)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      console.warn('Google Sheet append error:', errJson);
      if (res.status === 401) {
        localStorage.removeItem('google_access_token');
      }
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to append to Google Sheet:', err);
    return false;
  }
}

export async function updateRecordInSheet(record: ChecklistRecord, accessToken: string, spreadsheetId: string, sheetName: string) {
  try {
    const getRange = `'${sheetName.replace(/'/g, "''")}'!A:A`;
    const getUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(getRange)}?t=${Date.now()}`;
    const getRes = await fetch(getUrl, { 
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Cache-Control': 'no-cache'
      } 
    });
    if (!getRes.ok) return false;
    const getData = await getRes.json();
    const rows = getData.values || [];
    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === String(record.id)) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) return false;
    
    const rowValues = [
      record.id,
      record.formattedTime || new Date().toLocaleString('th-TH'),
      record.clientEmail,
      record.name,
      record.phone,
      record.dept,
      record.avNumber || '-',
      record.type,
      record.docNumbers || '-',
      Array.isArray(record.attachments) ? record.attachments.join(', ') : record.attachments || '-',
      record.cabinetId,
      record.keypass,
      record.pdfUrl || '-',
      record.description || '-',
      record.editLog || '-',
    ];
    
    const updateRange = `'${sheetName.replace(/'/g, "''")}'!A${rowIndex}:O${rowIndex}`;
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(updateRange)}?valueInputOption=USER_ENTERED`;
    const updateRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [rowValues] }),
    });
    
    return updateRes.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function fetchRecordsFromSheet(accessToken: string, spreadsheetId: string, sheetName: string): Promise<ChecklistRecord[] | null> {
  try {
    const fetchRange = `'${sheetName.replace(/'/g, "''")}'!A:O`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(fetchRange)}?t=${Date.now()}`;
    const res = await fetch(url, { 
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Cache-Control': 'no-cache'
      } 
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.values) return [];
    
    const records: ChecklistRecord[] = [];
    for (let i = 0; i < data.values.length; i++) {
      const r = data.values[i];
      if (!r[0] || String(r[0]).toLowerCase() === 'id' || String(r[0]).includes('ทะเบียน')) continue;
      
      const rawAtt = r[9] || '';
      const attachments = rawAtt ? String(rawAtt).split(',').map((s: string) => s.trim()).filter(Boolean) : [];

      records.push({
        id: String(r[0]),
        formattedTime: r[1] || '',
        timestamp: new Date().toISOString(),
        clientEmail: r[2] || '',
        name: r[3] || '',
        phone: r[4] || '',
        dept: r[5] || '',
        avNumber: r[6] || '',
        type: r[7] || '',
        docNumbers: r[8] || '',
        attachments: attachments,
        cabinetId: r[10] || 'N/A',
        keypass: r[11] || '1',
        pdfUrl: r[12] || '',
        description: r[13] || '',
        editLog: r[14] || '',
        status: 'ดึงข้อมูลจาก Sheet',
        other: ''
      });
    }
    return records.reverse();
  } catch (err) {
    console.error(err);
    return null;
  }
}

/**
 * Copy Google Slide Template, replace placeholders, export to Drive Folder as PDF
 */
export async function generatePdfInDrive(record: ChecklistRecord, accessToken: string): Promise<string | null> {
  try {
    // 1. Copy Template Slide
    const copyRes = await fetch(`https://www.googleapis.com/drive/v3/files/${TEMPLATE_SLIDE_ID}/copy`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `CHECKLIST_${record.id}_${record.name}`,
        parents: [FOLDER_ID],
      }),
    });

    if (!copyRes.ok) {
      console.warn('Failed to copy slide template:', await copyRes.text());
      return null;
    }

    const copyData = await copyRes.json();
    const newPresentationId = copyData.id;

    // 2. Fetch presentation structure to scan exact placeholder text
    const presRes = await fetch(`https://www.googleapis.com/slides/v1/presentations/${newPresentationId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const requests: any[] = [];
    const foundPlaceholders = new Set<string>();

    if (presRes.ok) {
      const presData = await presRes.json();
      const allTextSnippets: string[] = [];

      const scanTextContent = (tc: any) => {
        if (!tc?.textElements) return;
        for (const el of tc.textElements) {
          if (el.textRun?.content) {
            allTextSnippets.push(el.textRun.content);
          }
        }
      };

      const scanElement = (el: any) => {
        if (el.shape?.text) scanTextContent(el.shape.text);
        if (el.table) {
          for (const row of el.table.tableRows || []) {
            for (const cell of row.tableCells || []) {
              if (cell.text) scanTextContent(cell.text);
            }
          }
        }
        if (el.elementGroup) {
          for (const child of el.elementGroup.children || []) {
            scanElement(child);
          }
        }
      };

      for (const slide of presData.slides || []) {
        for (const element of slide.pageElements || []) {
          scanElement(element);
        }
      }

      const fullText = allTextSnippets.join(' ');
      const matches = fullText.match(/(<<[^>]+>>|\{\{[^}]+\}\}|\$\{[^}]+\})/g) || [];

      matches.forEach((ph) => {
        if (!foundPlaceholders.has(ph)) {
          foundPlaceholders.add(ph);
          const rawInner = ph.replace(/^(<<|\{\{|\$\{)/, '').replace(/(>>|\}\})$/, '');
          const val = getValueForPlaceholderKey(rawInner, record);
          if (val !== undefined && val !== null) {
            requests.push({
              replaceAllText: {
                containsText: { text: ph, matchCase: false },
                replaceText: val,
              },
            });
          }
        }
      });
    }

    // Fallback/Comprehensive replacements list in case scan missed any text run split
    const attachmentText = Array.isArray(record.attachments)
      ? record.attachments.join(', ')
      : record.attachments || '-';

    const fallbackFields: Array<{ keys: string[]; val: string }> = [
      { keys: ['displayDocId', 'id', 'เลขทะเบียนรับ', 'เลขรับ', 'เลขทะเบียนรับ '], val: record.id || '' },
      { keys: ['formattedTime', 'timestamp', 'ประทับเวลา', 'วันเวลา'], val: record.formattedTime || '' },
      { keys: ['name', 'ผู้ส่ง', 'ผู้ส่งเอกสาร', 'ชื่อ', 'ชื่อผู้ส่ง'], val: record.name || '' },
      { keys: ['dept', 'หน่วยงาน', 'ฝ่าย', 'ชื่อหน่วยงาน', 'ชื่อหน่วยงาน '], val: record.dept || '' },
      { keys: ['phone', 'โทรศัพท์', 'เบอร์โทร'], val: record.phone || '-' },
      { keys: ['clientEmail', 'email', 'อีเมล'], val: record.clientEmail || '-' },
      { keys: ['type', 'ประเภท', 'ประเภทเอกสาร', 'ประเภทเอกสาร '], val: record.type || '' },
      { keys: ['avNumber', 'เลขที่ อว.', 'เลขที่ อว', 'เลข อว.'], val: record.avNumber || '-' },
      { keys: ['docNumbers', 'เลขที่เอกสาร', 'รายการเลขที่เอกสาร'], val: record.docNumbers || '-' },
      { keys: ['attachments', 'เอกสารแนบ', 'เอกสารที่แนบมา', 'รายการแนบ'], val: attachmentText },
      { keys: ['other', 'อื่นๆ'], val: record.other || '-' },
      { keys: ['description', 'คำอธิบาย'], val: record.description || '-' },
      { keys: ['cabinetId', 'รหัสตู้', 'ตู้'], val: record.cabinetId || '' },
      { keys: ['keypass', 'KEYPASS', 'key pass'], val: record.keypass || '' },
      { keys: [' |||||||||||||||| '], val: record.id || '' },
    ];

    fallbackFields.forEach(({ keys, val }) => {
      keys.forEach((k) => {
        const phs = [`<<${k}>>`, `<< ${k} >>`, `<<${k} >>`, `<< ${k}>>`, `{{${k}}}`, `\${${k}}`];
        phs.forEach((p) => {
          if (!foundPlaceholders.has(p)) {
            foundPlaceholders.add(p);
            requests.push({
              replaceAllText: {
                containsText: { text: p, matchCase: false },
                replaceText: val,
              },
            });
          }
        });
      });
    });

    if (requests.length > 0) {
      await fetch(`https://slides.googleapis.com/v4/presentations/${newPresentationId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      });
    }

    // 3. Move presentation file into target Google Drive Folder
    await fetch(`https://www.googleapis.com/drive/v3/files/${newPresentationId}?addParents=${FOLDER_ID}&enforceSingleParent=true`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch(() => null);

    // 4. Set share permissions so file can be downloaded as PDF & viewed
    await fetch(`https://www.googleapis.com/drive/v3/files/${newPresentationId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    }).catch(() => null);

    // Return the Google Presentation PDF export & preview link
    return `https://docs.google.com/presentation/d/${newPresentationId}/export/pdf`;
  } catch (err) {
    console.error('Error generating PDF in Google Drive:', err);
    return null;
  }
}
