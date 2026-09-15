import React, { useState } from 'react';
import { Settings, FileSpreadsheet, ExternalLink, Link2, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { WebhookConfig } from '../types';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WebhookConfig;
  onSaveConfig: (newConfig: WebhookConfig) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [gasUrl, setGasUrl] = useState(config.gasWebhookUrl || '');
  const [spreadsheetId, setSpreadsheetId] = useState(config.spreadsheetId || '1Uxci-m9YhP7SFYF098f-kVdYgyXyRQ0gTuIUYghX3Fc');
  const [sheetName, setSheetName] = useState(config.sheetName || '(2570)CHECKLIST');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (gasUrl.trim()) {
      localStorage.setItem('gasWebhookUrl', gasUrl.trim());
    }
    onSaveConfig({
      gasWebhookUrl: gasUrl.trim(),
      spreadsheetId: spreadsheetId.trim(),
      sheetName: sheetName.trim(),
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
        <div className="bg-[#800000] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-base">ตั้งค่าการเชื่อมต่อ Google Sheets & Apps Script</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="bg-amber-50 p-3.5 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Google Sheet เป้าหมาย:</p>
              <p className="font-mono text-[11px] break-all text-amber-900 mt-0.5">
                https://docs.google.com/spreadsheets/d/{spreadsheetId}
              </p>
              <p className="mt-1 font-semibold">ชื่อชีท: <span className="text-[#800000]">{sheetName}</span></p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Google Sheet ID
            </label>
            <input
              type="text"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
              placeholder="1Uxci-m9YhP7SFYF098f-kVdYgyXyRQ0gTuIUYghX3Fc"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ชื่อชีท (Sheet Name)
            </label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
              placeholder="(2570)CHECKLIST"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
              <span>Google Apps Script Web App URL (ถ้ามี)</span>
              <span className="text-[10px] text-gray-400 font-normal">Optional</span>
            </label>
            <input
              type="url"
              value={gasUrl}
              onChange={(e) => setGasUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none font-mono"
              placeholder="https://script.google.com/macros/s/.../exec"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              หากใส่ URL Web App ของ GAS ระบบจะส่งข้อมูลไปบันทึกลง Google Sheet จริงทันทีทุกครั้ง
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 pb-2">
              <div>
                <p className="font-bold text-[#800000]">ขั้นตอนการเชื่อมต่อกับ Google Sheet (ทำครั้งเดียว):</p>
                <p className="text-[11px] text-gray-500">เพื่อให้อัปเดตข้อมูลลงชีท "(2570)CHECKLIST" อัตโนมัติ</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const gasCode = `// ===== Google Apps Script สำหรับ FIN.MFU Checklist =====
// Spreadsheet ID: ${spreadsheetId}
// Sheet Name: ${sheetName}
// Template Slide ID: 1H0Ka4w-cNHpb-nXEdLbzpqq2PJodYsRLjgqS0rcwGFU
// Drive Folder ID: 1uCP6AOi-d2JhHFsouZJhnu0_zNZquTSj

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "MFU Finance Checklist Web App is active!"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter || {};
    }

    var SPREADSHEET_ID = '${spreadsheetId}';
    var SHEET_NAME = '${sheetName}';
    var TEMPLATE_SLIDE_ID = '1H0Ka4w-cNHpb-nXEdLbzpqq2PJodYsRLjgqS0rcwGFU';
    var FOLDER_ID = '1uCP6AOi-d2JhHFsouZJhnu0_zNZquTSj';

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    // กรณีแก้ไขข้อมูล (action === 'update')
    if (data.action === "update") {
      var searchId = String(data.id || data.displayDocId || "").trim();
      var values = sheet.getDataRange().getValues();
      var foundIndex = -1;
      for (var i = 0; i < values.length; i++) {
        if (String(values[i][0] || "").trim() === searchId) {
          foundIndex = i + 1;
          break;
        }
      }
      if (foundIndex > 0) {
        var rowData = [
          searchId,
          data.formattedTime || values[foundIndex-1][1] || '',
          data.clientEmail || '',
          data.name || '',
          data.phone || '',
          data.dept || '',
          data.avNumber || '',
          data.type || '',
          data.docNumbers || '',
          Array.isArray(data.attachments) ? data.attachments.join(', ') : (data.attachments || ''),
          data.cabinetId || '',
          data.keypass || '',
          data.pdfUrl || values[foundIndex-1][12] || '',
          data.description || '',
          data.editLog || ''
        ];
        sheet.getRange(foundIndex, 1, 1, 15).setValues([rowData]);
        return ContentService.createTextOutput(JSON.stringify({ status: "success", id: searchId, action: "update" })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    var timestamp = new Date();
    var timeStr = data.formattedTime || Utilities.formatDate(timestamp, "GMT+7", "dd/MM/yyyy HH:mm:ss");
    var thaiMonthStr = Utilities.formatDate(timestamp, "GMT+7", "MM");
    var displayDocId = data.displayDocId || data.id || ('70' + thaiMonthStr + '0001');
    var pdfUrl = '';

    // บันทึกข้อมูลลง Google Sheet ทันที (Columns A:M)
    sheet.appendRow([
      displayDocId,
      timeStr,
      data.clientEmail || '',
      data.name || '',
      data.phone || '',
      data.dept || '',
      data.avNumber || '',
      data.type || '',
      data.docNumbers || '',
      (data.attachments || []).join(', ') + (data.other ? ' (อื่นๆ: ' + data.other + ')' : ''),
      data.cabinetId || '',
      data.keypass || '',
      pdfUrl
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      id: displayDocId,
      pdfUrl: pdfUrl
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
                  navigator.clipboard.writeText(gasCode);
                  alert('คัดลอกโค้ด Google Apps Script เรียบร้อยแล้ว!\n\nทำตามขั้นตอน 1-4 ด้านล่างเพื่อรับ Web App URL มาใส่ในช่องด้านบนครับ');
                }}
                className="text-xs bg-[#800000] hover:bg-red-900 text-white px-3 py-1.5 rounded-lg font-bold shadow transition cursor-pointer flex items-center gap-1"
              >
                📋 คัดลอกโค้ด GAS
              </button>
            </div>

            <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-600 leading-relaxed font-medium">
              <li>เปิด <a href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">Google Sheet (1Uxci...3Fc)</a></li>
              <li>ไปที่เมนู <span className="font-bold text-gray-800">Extensions (ส่วนขยาย) → Apps Script</span></li>
              <li>ลบโค้ดเดิมทั้งหมด แล้วกดวาง (<span className="font-mono">Ctrl+V</span>) โค้ดที่คัดลอก</li>
              <li>กด <span className="font-bold text-emerald-700">Deploy (การทำให้ใช้งานได้) → New deployment</span> เลือกประเภทเป็น <span className="font-bold">Web App</span>
                <ul className="list-disc list-inside ml-4 text-[10px] text-gray-500">
                  <li>Execute as: <span className="font-bold">Me (ฉัน)</span></li>
                  <li>Who has access: <span className="font-bold text-[#800000]">Anyone (ทุกคน)</span></li>
                </ul>
              </li>
              <li>คัดลอก Web App URL ที่ได้ นำมาวางลงในช่อง <span className="font-bold">Google Apps Script Web App URL</span> ด้านบน แล้วกดบันทึก</li>
            </ol>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <a
              href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" /> เปิด Google Sheet
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-red-900 rounded-lg transition shadow flex items-center gap-1.5"
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> บันทึกแล้ว!
                  </>
                ) : (
                  'บันทึกการตั้งค่า'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
