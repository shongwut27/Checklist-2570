import React, { useState } from 'react';
import { ChecklistRecord } from '../types';
import { ITEMS_CONFIG } from '../data/checklists';
import {
  X,
  Printer,
  ExternalLink,
  Sliders,
  CheckSquare,
  Square
} from 'lucide-react';
import mfuHeaderBanner from '../assets/mfu_header_banner.png';

interface PdfCoverSheetProps {
  record: ChecklistRecord;
  onClose: () => void;
}

// SVG Barcode Generator Component (Standard Code 39 for 100% reliable scanner compatibility)
const CODE39_MAP: Record<string, string> = {
  '0': '000110100',
  '1': '100100001',
  '2': '001100001',
  '3': '101100000',
  '4': '000110001',
  '5': '100110000',
  '6': '001110000',
  '7': '000100101',
  '8': '100100100',
  '9': '001100100',
  'A': '100001001',
  'B': '001001001',
  'C': '101001000',
  'D': '000011001',
  'E': '100011000',
  'F': '001011000',
  'G': '000001101',
  'H': '100001100',
  'I': '001001100',
  'J': '000011100',
  'K': '100000011',
  'L': '001000011',
  'M': '101000010',
  'N': '000010011',
  'O': '100010010',
  'P': '001010010',
  'Q': '000000111',
  'R': '100000110',
  'S': '001000110',
  'T': '000010110',
  'U': '110000001',
  'V': '011000001',
  'W': '111000000',
  'X': '010010001',
  'Y': '110010000',
  'Z': '011010000',
  '-': '010000101',
  '.': '110000100',
  ' ': '011000100',
  '$': '010101000',
  '/': '010100010',
  '+': '010001010',
  '%': '000101010',
  '*': '010010100',
};

const SVGBarcode: React.FC<{ value: string }> = ({ value }) => {
  const cleanVal = (value || '00000000').toUpperCase().replace(/[^0-9A-Z\-.\s$/+%]/g, '');
  const encodedText = `*${cleanVal}*`;

  const narrowWidth = 1.8;
  const wideWidth = 4.5;
  const interCharGap = 1.8;
  const quietZone = 10;

  const rects: { x: number; width: number }[] = [];
  let currentX = quietZone;

  for (let c = 0; c < encodedText.length; c++) {
    const char = encodedText[c];
    const pattern = CODE39_MAP[char] || CODE39_MAP['*'];

    for (let i = 0; i < 9; i++) {
      const isBar = i % 2 === 0;
      const isWide = pattern[i] === '1';
      const width = isWide ? wideWidth : narrowWidth;

      if (isBar) {
        rects.push({ x: currentX, width });
      }
      currentX += width;
    }

    if (c < encodedText.length - 1) {
      currentX += interCharGap;
    }
  }

  currentX += quietZone;
  const totalWidth = currentX;

  return (
    <div className="flex items-center justify-center w-full my-0.5">
      <svg
        className="w-full max-w-[210px] h-9 sm:h-10 mx-auto"
        viewBox={`0 0 ${totalWidth} 36`}
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
      >
        <rect x="0" y="0" width={totalWidth} height="36" fill="#ffffff" />
        {rects.map((r, idx) => (
          <rect
            key={idx}
            x={r.x}
            y={0}
            width={r.width}
            height={36}
            fill="#000000"
          />
        ))}
      </svg>
    </div>
  );
};

const getDocBgNumber = (docType: string): string => {
  if (!docType) return '1';
  if (docType.includes('คืนเงินยืม')) return '3';
  if (docType.includes('ปิดโครงการ')) return '4';
  if (
    docType.includes('สวัสดิการ') ||
    docType.includes('ค่าอาหาร') ||
    docType.includes('ค่าแรง') ||
    docType.includes('ทุนการศึกษา') ||
    docType.includes('เงินเดือน') ||
    docType.includes('เงินลงทุน') ||
    docType.includes('โอนเงิน')
  ) {
    return '2';
  }
  return '1';
};

export const PdfCoverSheet: React.FC<PdfCoverSheetProps> = ({ record, onClose }) => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [marginSize, setMarginSize] = useState<'narrow' | 'normal' | 'wide'>('narrow');
  const [zoomLevel, setZoomLevel] = useState<number>(85);
  const [viewMode, setViewMode] = useState<'rendered' | 'drive'>('rendered');
  const [logoUrl, setLogoUrl] = useState<string>('https://drive.google.com/thumbnail?id=1bhA5XYYkM9NSja1dl5oQeRts-GRNw97t&sz=w1000');

  // All checklist items configured for this document type
  const allTypeItems = ITEMS_CONFIG[record.type] || record.attachments || [];
  const selectedAttachments = new Set(record.attachments || []);

  const handlePrint = () => {
    executePrint();
  };

  const executePrint = () => {
    window.focus();
    try {
      window.print();
    } catch (e) {
      console.warn("Direct print failed, invoking popout print:", e);
    }
    handlePopoutPrint();
  };

  const handlePopoutPrint = () => {
    const printElem = document.getElementById('printable-a4-sheet');
    if (!printElem) {
      window.print();
      return;
    }
    const win = window.open('', '_blank', 'width=950,height=1200');
    if (!win) {
      window.focus();
      window.print();
      return;
    }
    win.document.write(`
      <!DOCTYPE html>
      <html lang="th">
        <head>
          <meta charset="UTF-8" />
          <title>พิมพ์เอกสาร Checklist - ${record.id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4 portrait; margin: 5mm; }
            body { background: #ffffff !important; color: #000000 !important; margin: 0; padding: 0; font-family: sans-serif; }
            .no-print {
              background: #0f172a;
              color: #ffffff;
              padding: 12px;
              text-align: center;
              font-family: sans-serif;
              border-bottom: 2px solid #334155;
            }
            .no-print button {
              background: #059669;
              color: white;
              padding: 10px 24px;
              font-size: 16px;
              font-weight: bold;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);
            }
            .no-print button:hover {
              background: #10b981;
            }
            @media print {
              .no-print { display: none !important; }
              body { padding: 0 !important; }
            }
            #printable-container {
              display: flex;
              justify-content: center;
              padding: 8mm;
            }
            #printable-a4-sheet {
              width: 210mm !important;
              min-height: 297mm !important;
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              background: white !important;
            }
          </style>
        </head>
        <body>
          <div class="no-print">
            <button onclick="window.focus(); window.print();">🖨️ คลิกที่นี่เพื่อสั่งพิมพ์เอกสาร (Print Document)</button>
          </div>
          <div id="printable-container">
            <div id="printable-a4-sheet">
              ${printElem.innerHTML}
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const getMarginClass = () => {
    switch (marginSize) {
      case 'narrow':
        return 'p-4 sm:p-6';
      case 'wide':
        return 'p-8 sm:p-12';
      case 'normal':
      default:
        return 'p-6 sm:p-8';
    }
  };

  // Extract Drive Embed URL if available
  const getDriveEmbedUrl = (url?: string) => {
    if (!url) return 'https://docs.google.com/presentation/d/1H0Ka4w-cNHpb-nXEdLbzpqq2PJodYsRLjgqS0rcwGFU/preview?rm=minimal';
    const presMatch = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
    if (presMatch && presMatch[1]) {
      return `https://docs.google.com/presentation/d/${presMatch[1]}/preview?rm=minimal`;
    }
    const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    }
    return 'https://docs.google.com/presentation/d/1H0Ka4w-cNHpb-nXEdLbzpqq2PJodYsRLjgqS0rcwGFU/preview?rm=minimal';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950 flex flex-col md:flex-row text-slate-100 animate-fadeIn">
      {/* Print-Only CSS Styles */}
      <style>{`
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Hide all UI elements except printable sheet */
          body * {
            visibility: hidden !important;
          }
          #printable-a4-sheet, #printable-a4-sheet * {
            visibility: visible !important;
          }
          #printable-a4-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 10mm !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
            background: white !important;
            color: black !important;
          }
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
        }
      `}</style>

      {/* LEFT SIDEBAR: Word-Style Print Studio Control Panel */}
      <div className="w-full md:w-[360px] lg:w-[400px] bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 z-20 shadow-2xl">
        {/* Studio Header */}
        <div className="bg-[#800000] px-5 py-4 flex items-center justify-between border-b border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400 text-gray-950 rounded-xl font-bold shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-snug">
                ตั้งค่าและพิมพ์เอกสาร
              </h2>
              <p className="text-xs text-amber-200/90 font-medium">
                Word-Style Print Studio (2570-CHECKLIST)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Controls Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Main Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handlePrint}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-3.5 px-5 rounded-2xl shadow-lg shadow-emerald-950/50 transition flex flex-col items-center justify-center gap-1 group cursor-pointer border border-emerald-400/30"
            >
              <div className="flex items-center gap-2 text-base sm:text-lg">
                <Printer className="w-6 h-6 group-hover:scale-110 transition-transform text-amber-300" />
                <span>พิมพ์ออกทางเครื่องพิมพ์ (Print)</span>
              </div>
              <span className="text-xs font-normal text-emerald-100 opacity-90">
                รวมทั้งหมด 1 หน้า (ระบบพิมพ์เบราว์เซอร์)
              </span>
            </button>

            <button
              onClick={handlePopoutPrint}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs border border-slate-700 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-amber-400" />
              <span>เปิดพิมพ์ใน Pop-up Window (กรณีปุ่มข้างบนไม่ตอบสนอง)</span>
            </button>
          </div>

          <hr className="border-slate-800" />

          {/* Page Orientation */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              การวางแนวกระดาษ (ORIENTATION)
            </label>
            <div className="w-full">
              <div className="w-full py-2.5 px-4 rounded-xl bg-amber-400 text-gray-950 font-bold border border-amber-300 shadow-md flex items-center justify-between text-xs">
                <span>แนวตั้ง (Portrait)</span>
                <span className="text-[10px] bg-slate-900 text-amber-300 px-2 py-0.5 rounded-md font-mono">A4 Standard</span>
              </div>
            </div>
          </div>

          {/* Margins */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              ระยะขอบกระดาษ (MARGINS)
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'narrow', name: 'แคบ (1.0 ซม.)' },
                  { id: 'normal', name: 'ปกติ (2.0 ซม.)' },
                  { id: 'wide', name: 'กว้าง (3.0 ซม.)' }
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMarginSize(m.id)}
                  className={`py-2 px-2 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
                    marginSize === m.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50 font-bold'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Level Slider */}
          <div className="space-y-2.5 bg-slate-850 p-3.5 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                ระดับการซูมตัวอย่าง
              </span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {zoomLevel}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="120"
              step="5"
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-700 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="grid grid-cols-5 gap-1 pt-1">
              {[50, 75, 85, 100, 110].map((z) => (
                <button
                  key={z}
                  onClick={() => setZoomLevel(z)}
                  className={`py-1 rounded text-[10px] font-bold transition ${
                    zoomLevel === z
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {z}%
                </button>
              ))}
            </div>
          </div>

          {/* Document Summary Info Card */}
          <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-xs space-y-2 text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">ขนาดกระดาษพิมพ์:</span>
              <span className="font-bold text-white">A4 (21.0 x 29.7 ซม.)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">โต๊ะคัดกรอง:</span>
              <span className="font-bold text-amber-300">{record.cabinetId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">KEYPASS:</span>
              <span className="font-bold text-emerald-300">{record.keypass}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">เลขทะเบียนรับ:</span>
              <span className="font-mono font-bold text-white">{record.id}</span>
            </div>
          </div>
        </div>

        {/* Footer Close Button */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 px-4 rounded-xl transition text-xs cursor-pointer text-center"
          >
            ปิดหน้าต่างนี้ (Close)
          </button>
        </div>
      </div>

      {/* RIGHT STUDIO WORKSPACE Area */}
      <div className="flex-1 bg-[#0d1527] overflow-auto p-4 sm:p-8 flex flex-col items-center justify-start relative">
        {/* Scalable Container for A4 Paper */}
        <div
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out'
          }}
          className="mb-12"
        >
          {/* THE OFFICIAL PRINTABLE A4 SHEET WITH FULL REPLACED VALUES */}
          <div
            id="printable-a4-sheet"
            className={`w-[210mm] min-h-[297mm] bg-white text-black shadow-2xl rounded-sm border border-gray-300 flex flex-col justify-between font-sans ${getMarginClass()}`}
          >
            {/* DOCUMENT TOP HEADER */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-black pb-1.5 mb-2 gap-3">
                {/* Left Header Banner (Image from Drive link) */}
                <div className="flex items-center flex-1 max-w-[72%]">
                  <img
                    src={logoUrl}
                    alt="CHECKLIST ส่วนการเงินและบัญชี มหาวิทยาลัยแม่ฟ้าหลวง"
                    className="w-full h-auto max-h-32 sm:max-h-36 object-contain object-left py-0"
                    onError={() => {
                      if (logoUrl.includes('thumbnail')) {
                        setLogoUrl('https://lh3.googleusercontent.com/d/1bhA5XYYkM9NSja1dl5oQeRts-GRNw97t=s1000');
                      } else if (logoUrl.includes('lh3.googleusercontent')) {
                        setLogoUrl(mfuHeaderBanner);
                      } else if (logoUrl === mfuHeaderBanner) {
                        setLogoUrl('/mfu_header_banner.png');
                      }
                    }}
                  />
                </div>

                {/* Right Registration Barcode Box */}
                <div className="bg-white border-2 border-black rounded-lg p-1.5 text-center w-64 shadow-sm flex flex-col items-center justify-between shrink-0">
                  <div className="w-full text-xs font-bold bg-[#b4c6e7] text-black py-0.5 px-1 border-b border-black uppercase tracking-wider font-sans mb-0.5">
                    เลขทะเบียนรับ (REGISTER NO.)
                  </div>
                  <SVGBarcode value={record.id} />
                  <div className="text-2xl sm:text-3xl font-black tracking-widest text-black font-mono leading-none my-0.5">
                    {record.id}
                  </div>
                </div>
              </div>

                {/* PRIMARY METADATA GRID TABLE MATCHING SLIDE TEMPLATE 1H0Ka4w-cNHpb-nXEdLbzpqq2PJodYsRLjgqS0rcwGFU */}
                <div className="border-2 border-black text-xs sm:text-sm">
                  {/* Row 1: หน่วยงาน & เลขที่เอกสาร */}
                  <div className="grid grid-cols-12 border-b-2 border-black">
                    <div className="col-span-7 border-r-2 border-black">
                      <div className="bg-[#b4c6e7] font-bold text-black px-2.5 py-1 border-b border-black text-xs uppercase flex items-center justify-between">
                        <span>หน่วยงาน</span>
                        <span className="font-mono text-xs font-black text-amber-950">({record.cabinetId})</span>
                      </div>
                      <div className="p-2.5 text-base sm:text-lg font-black text-black leading-snug">
                        {record.dept || '-'}
                      </div>
                    </div>
                    <div className="col-span-5">
                      <div className="bg-[#b4c6e7] font-bold text-black px-2.5 py-1 border-b border-black text-xs uppercase flex items-center justify-between">
                        <span>เลขที่เอกสาร</span>
                        {(() => {
                          const docList = (record.docNumbers || '')
                            .split('\n')
                            .map((s) => s.trim())
                            .filter(Boolean);
                          if (docList.length > 1) {
                            return (
                              <span className="text-[10px] font-sans bg-slate-900 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                                {docList.length} ชุด
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <div className="p-2 sm:p-2.5">
                        {(() => {
                          const docList = (record.docNumbers || '')
                            .split('\n')
                            .map((s) => s.trim())
                            .filter(Boolean);
                          if (docList.length === 0) return <span className="text-gray-400 font-mono text-sm sm:text-base">-</span>;
                          if (docList.length === 1) {
                            return (
                              <div className="text-sm sm:text-base font-mono font-bold text-black tracking-wide">
                                {docList[0]}
                              </div>
                            );
                          }
                          return (
                            <div className="space-y-1">
                              {docList.map((docNum, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 font-mono text-xs sm:text-sm font-bold text-black">
                                  <span className="text-gray-600 font-sans text-[11px] font-bold min-w-[18px]">
                                    {idx + 1})
                                  </span>
                                  <span className="bg-gray-50 border border-gray-300 px-1.5 py-0.5 rounded text-black tracking-wider">
                                    {docNum}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: เลขที่ อว. & ประเภทเอกสาร */}
                  <div className="grid grid-cols-12">
                    <div className="col-span-7 border-r-2 border-black">
                      <div className="bg-[#b4c6e7] font-bold text-black px-2.5 py-1 border-b border-black text-xs uppercase">
                        เลขที่ อว.
                      </div>
                      <div className="p-2 text-sm sm:text-base font-mono font-bold text-black">
                        {record.avNumber || '-'}
                      </div>
                    </div>
                    <div className="col-span-5">
                      <div className="bg-[#b4c6e7] font-bold text-black px-2.5 py-1 border-b border-black text-xs uppercase">
                        <span>ประเภทเอกสาร</span>
                      </div>
                      <div className="p-2 text-base sm:text-lg font-black text-emerald-950">
                        {record.type || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* MAIN CONTENT SPLIT GRID */}
                <div className="grid grid-cols-12 border-2 border-black text-xs min-h-[420px] relative">
                  {/* LEFT COLUMN (7 Cols): Checklist Items, Work Log, & Note */}
                  <div className="col-span-7 border-r-2 border-black flex flex-col justify-between">
                    <div>
                      <div className="bg-[#b4c6e7] text-black font-black px-2.5 py-1.5 border-b border-black text-xs sm:text-sm uppercase flex items-center justify-between">
                        <span>เอกสารที่แนบมา</span>
                        <span className="text-[11px] font-bold text-slate-900">
                          {record.attachments?.length || 0} รายการ
                        </span>
                      </div>

                      <div className="p-2 space-y-1.5">
                        {allTypeItems.map((itemLabel, idx) => {
                          const isChecked = selectedAttachments.has(itemLabel);
                          return (
                            <div
                              key={idx}
                              className={`flex items-start gap-2 p-1 rounded transition ${
                                isChecked ? 'font-bold text-black bg-emerald-50/90 border border-emerald-300' : 'text-gray-600'
                              }`}
                            >
                              <span className="mt-0.5 shrink-0">
                                {isChecked ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-800" />
                                ) : (
                                  <Square className="w-4 h-4 text-gray-400" />
                                )}
                              </span>
                              <span className="text-xs sm:text-sm leading-snug">
                                {itemLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="relative z-10 mt-2">
                      {/* Note Box */}
                      <div className="border-t-2 border-black">
                        <div className="bg-[#b4c6e7] font-bold text-black px-2.5 py-1.5 border-b border-black text-xs uppercase">
                          หมายเหตุ
                        </div>
                        <div className="p-3 text-xs sm:text-sm text-gray-900 font-medium min-h-[100px] sm:min-h-[120px] whitespace-pre-wrap leading-relaxed">
                          {record.other || '-'}
                        </div>
                      </div>

                      {/* Audit Work Log Box (งานตรวจจ่าย) */}
                      <div className="border-t-2 border-black bg-slate-50/80 p-2">
                        <div className="font-bold text-xs text-black mb-1 bg-[#b4c6e7] text-center py-0.5 border border-black">
                          (งานตรวจจ่าย)
                        </div>
                        <div className="space-y-1 text-[11px]">
                          {[1, 2, 3, 4, 5].map((round) => (
                            <div key={round} className="flex items-center justify-between border-b border-gray-300 pb-0.5">
                              <span className="font-bold w-12 text-black">ครั้งที่ {round}</span>
                              <label className="flex items-center gap-1 text-gray-700">
                                <input type="checkbox" className="w-3 h-3 rounded" disabled /> เสนออนุมัติ
                              </label>
                              <label className="flex items-center gap-1 text-gray-700">
                                <input type="checkbox" className="w-3 h-3 rounded" disabled /> แก้ไข/อื่น ๆ
                              </label>
                              <label className="flex items-center gap-1 text-gray-700">
                                <input type="checkbox" className="w-3 h-3 rounded" disabled /> นำเสนอ
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN (5 Cols): Administration & Desk Staff Directory */}
                  <div className="col-span-5 flex flex-col justify-between">
                    {/* Upper: Admin Receipt (งานธุรการรับ) */}
                    <div className="border-b-2 border-black relative overflow-hidden">
                      {/* Background Watermark Number for Admin Receipt */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 pt-5">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[5px] sm:border-[6px] border-[#c0d4f6] flex items-center justify-center bg-white/40">
                          <span className="text-6xl sm:text-7xl font-black text-[#8eb0eb] leading-none">
                            {getDocBgNumber(record.type)}
                          </span>
                        </div>
                      </div>

                      <div className="relative z-10">
                        <div className="bg-[#b4c6e7] font-bold text-black text-center text-xs py-1 border-b border-black uppercase">
                          (งานธุรการรับ)
                        </div>
                        <table className="w-full text-xs text-center border-collapse">
                          <thead>
                            <tr className="bg-gray-100/70 font-bold border-b border-black">
                              <th className="p-1 border-r border-black w-24">ครั้งที่</th>
                              <th className="p-1">วันที่</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[1, 2, 3, 4, 5].map((num) => (
                              <tr key={num} className="border-b border-gray-300">
                                <td className="p-1 border-r border-black font-bold">ครั้งที่ {num}</td>
                                <td className="p-1 h-6 font-mono text-xs font-semibold text-gray-900">
                                  {/* Blank for manual intake entry / date stamp */}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Lower: Service Desk Personnel Directory (สำหรับส่วนการเงินและบัญชีเท่านั้น) */}
                    <div className="text-[10px] leading-tight flex-1 flex flex-col">
                      <div className="bg-[#b4c6e7] font-bold text-center text-black py-1 border-b border-black">
                        (สำหรับส่วนการเงินและบัญชีเท่านั้น)
                      </div>
                      <div className="p-1 space-y-0.5 text-gray-900 flex-1">
                        <div className="grid grid-cols-12 font-bold bg-gray-100 border-b border-gray-300 py-0.5 text-[9px] text-center">
                          <span className="col-span-2">โต๊ะ</span>
                          <span className="col-span-5 text-left pl-1">ผู้ให้บริการ</span>
                          <span className="col-span-3">งาน</span>
                          <span className="col-span-2">โทร.</span>
                        </div>
                        {[
                          { id: '1', name: 'อภิญญา โพธิคำ', role: 'ตรวจจ่าย', ext: '6005' },
                          { id: '2', name: 'พรนัชชา ศรีวงค์', role: 'ตรวจจ่าย', ext: '6005' },
                          { id: '3', name: 'ดารารัตน์ กันแสงแก้ว', role: 'ตรวจจ่าย', ext: '6572' },
                          { id: '4', name: 'สาโรจน์ แก้วประสม', role: 'ตรวจจ่าย', ext: '6572' },
                          { id: '5', name: 'ละอองดาว เรือนยา', role: 'ตรวจจ่าย', ext: '6465' },
                          { id: '6', name: 'ธนัฏพร ใจนวล', role: 'ตรวจจ่าย', ext: '6465' },
                          { id: '7', name: 'ภาคินี พรมมี', role: 'ตรวจจ่าย', ext: '6465' },
                          { id: '8', name: 'ทรงวุฒิ ทาบุญสม', role: 'ตรวจจ่าย', ext: '6465' },
                          { id: '9', name: 'ดุษฎา ใจผาวัง', role: 'ตรวจจ่าย', ext: '6465' },
                          { id: '10', name: 'ทิพาธร สมหมาย', role: 'สวัสดิการ', ext: '6462' },
                          { id: 'C1', name: 'สิริลักษ์ ต๊ะวิโล', role: 'สอบทาน', ext: '6462' },
                          { id: 'C2', name: 'กาญจนา สิงห์สุริยะ', role: 'สอบทาน', ext: '6462' },
                          { id: 'C3', name: 'ณัฐนันท์ สุวรรณศักดิ์', role: 'สอบทาน', ext: '6462' },
                          { id: 'C4', name: 'พรพิไล ปันปูนทราย', role: 'สอบทาน', ext: '6010' },
                          { id: 'S1', name: 'จารุวรรณ มหาวงศ์', role: 'งานเงินเดือน', ext: '6004' },
                          { id: 'S2', name: 'จิรวรรณ วงศ์คำอ้าย', role: 'งานเงินเดือน', ext: '6466' },
                          { id: 'F1', name: 'กมลลักษณ์ วงศ์อุดมวิชา', role: 'การเงินจ่าย', ext: '6013' },
                          { id: 'F2', name: 'รุ่งนภา วิยาพร้าว', role: 'การเงินจ่าย', ext: '6460' },
                          { id: 'F3', name: 'ธัญชนก หมั่นผดุง', role: 'การเงินจ่าย', ext: '6461' },
                          { id: 'F4', name: 'บุญญาพร สิงห์คำ', role: 'การเงินจ่าย', ext: '6006' },
                          { id: 'F5', name: 'พรปวีณ์ ตรีภิราช', role: 'การเงินจ่าย', ext: '6006' },
                          { id: 'F6', name: 'สุกัญญา สุวรรณ', role: 'การเงินรับ', ext: '6016' },
                          { id: 'F7', name: 'กฤษณา การะวงค์', role: 'การเงินรับ', ext: '6016' },
                          { id: 'F8', name: 'ประกายมาศ ใจวงค์', role: 'เงินลงทุน', ext: '6460' },
                        ].map((staff) => (
                          <div key={staff.id} className="grid grid-cols-12 items-center border-b border-gray-200 py-0.5 text-[9.5px]">
                            <span className="col-span-2 flex items-center justify-center gap-1 font-bold">
                              <Square className="w-2.5 h-2.5 text-gray-400" />
                              {staff.id}
                            </span>
                            <span className="col-span-5 font-semibold truncate pl-0.5">{staff.name}</span>
                            <span className="col-span-3 text-center text-gray-700">{staff.role}</span>
                            <span className="col-span-2 text-center font-mono">{staff.ext}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-1.5 pt-1 text-[9px] text-gray-700 font-medium">
                          <Square className="w-2.5 h-2.5 text-gray-400" />
                          <span>อื่น ๆ ........................................................................</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SENDER & SYSTEM TIMESTAMP FOOTER INFO */}
                <div className="border-2 border-black p-3 bg-gray-50/90 text-xs sm:text-sm grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div><strong className="text-black">ผู้ส่งเอกสาร:</strong> <span className="font-bold text-gray-900">{record.name}</span></div>
                    <div><strong className="text-black">โทรศัพท์:</strong> <span className="font-bold text-gray-900">{record.phone}</span></div>
                    <div><strong className="text-black">E-mail:</strong> <span className="font-bold text-gray-900">{record.clientEmail}</span></div>
                  </div>
                  <div className="text-right space-y-1">
                    <div>
                      <strong className="text-black">บันทึกข้อมูลผ่านระบบออนไลน์:</strong>
                    </div>
                    <div className="font-mono font-black text-amber-950 text-base">
                      {record.formattedTime}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};
