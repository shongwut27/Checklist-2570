import React, { useState } from 'react';
import { X, HelpCircle, CheckCircle2, AlertTriangle, FileText, Maximize2, Minimize2 } from 'lucide-react';
import guideImg from '../assets/doc_guide.png';

interface DocGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocGuideModal: React.FC<DocGuideModalProps> = ({ isOpen, onClose }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>('https://drive.google.com/thumbnail?id=1d1-P6cv4fnycKtpSvHP737un0ykAYIlz&sz=w1200');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-amber-200/60 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#800000] text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-400 text-gray-900 rounded-lg font-bold shadow-sm">
              <HelpCircle className="w-5 h-5 text-[#800000]" />
            </div>
            <div>
              <h3 className="text-lg font-bold">คู่มือคำแนะนำวิธีการกรอกเลขที่เอกสาร</h3>
              <p className="text-xs text-amber-200">ส่วนการเงินและบัญชี มหาวิทยาลัยแม่ฟ้าหลวง</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50">
          {/* Main Visual Image Guide from Google Drive */}
          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm relative group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#800000]" />
                รูปภาพตัวอย่างหลักเกณฑ์การระบุเลขที่เอกสาร
              </span>
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold px-2.5 py-1 rounded-md flex items-center gap-1 transition cursor-pointer"
              >
                {isZoomed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{isZoomed ? 'ย่อขนาดภาพ' : 'ขยายภาพใหญ่'}</span>
              </button>
            </div>

            <div className={`overflow-auto transition-all duration-300 ${isZoomed ? 'max-h-none' : 'max-h-[420px]'}`}>
              <img
                src={imgSrc}
                alt="คู่มือวิธีการกรอกเลขที่เอกสาร"
                className="w-full h-auto object-contain rounded-lg border border-gray-100 shadow-inner"
                onError={() => {
                  if (imgSrc.includes('thumbnail')) {
                    setImgSrc('https://lh3.googleusercontent.com/d/1d1-P6cv4fnycKtpSvHP737un0ykAYIlz=s1200');
                  } else if (imgSrc.includes('lh3.googleusercontent')) {
                    setImgSrc(guideImg);
                  } else if (imgSrc === guideImg) {
                    setImgSrc('/doc_guide.png');
                  }
                }}
              />
            </div>
          </div>

          {/* Guidelines & Rules Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rule 1 & 2 */}
            <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ข้อกำหนดที่ถูกต้องในการกรอก</span>
              </div>
              <ul className="text-xs text-emerald-950 space-y-2 pl-2">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-700">1.</span>
                  <span><strong>ต้องมี 10 หลักเท่านั้น:</strong> เลขที่เอกสารทุกชุดต้องมีความยาวตัวเลขตรง 10 หลักพอดี</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-700">2.</span>
                  <span><strong>กรณีมีหลายเอกสาร:</strong> ให้กด <kbd className="bg-emerald-200 px-1.5 py-0.5 rounded font-mono text-[10px] text-emerald-900 font-bold">Enter</kbd> ขึ้นบรรทัดใหม่ และระบุ 10 หลักในทุกบรรทัด</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-emerald-700">3.</span>
                  <span><strong>จำเป็นต้องกรอก:</strong> ระบบไม่อนุญาตให้เว้นว่าง ต้องกรอกเลขที่เอกสารอย่างน้อย 1 ชุด</span>
                </li>
              </ul>
            </div>

            {/* Example Box */}
            <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>ตัวอย่างการระบุบรรทัด (กด Enter)</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <p className="text-gray-700 font-medium">✅ <strong>ตัวอย่างที่ถูกต้อง (3 ชุด):</strong></p>
                <div className="bg-white p-2.5 rounded-lg border border-amber-300 font-mono text-xs text-gray-800 leading-relaxed shadow-inner">
                  6701001234<br />
                  6701001235<br />
                  6701001236
                </div>
                <p className="text-red-600 text-[11px] font-medium mt-1">
                  ❌ ไม่ใส่เครื่องหมายเว้นวรรค หรือจุลภาค (,) ในบรรทัดเดียวกัน
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-100 border-t border-gray-200 px-5 py-3 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-[#800000] hover:bg-[#660000] text-white font-semibold text-sm px-5 py-2 rounded-lg transition cursor-pointer shadow-sm"
          >
            รับทราบและปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
