import React, { useState } from 'react';
import { MFU_DEPARTMENTS, getCabinetId } from '../data/departments';
import { DOCUMENT_TYPES, ITEMS_CONFIG, getKeypass } from '../data/checklists';
import { ChecklistRecord } from '../types';
import { Edit3, X, Save, AlertCircle, Sparkles, Building2, HelpCircle } from 'lucide-react';
import { DocGuideModal } from './DocGuideModal';

interface EditRecordModalProps {
  isOpen: boolean;
  record: ChecklistRecord | null;
  onClose: () => void;
  onSave: (updatedRecord: ChecklistRecord) => Promise<boolean>;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  isOpen,
  record,
  onClose,
  onSave,
}) => {
  if (!isOpen || !record) return null;

  const [formData, setFormData] = useState({
    name: record.name || '',
    phone: record.phone || '',
    clientEmail: record.clientEmail || '',
    dept: record.dept || '',
    avNumber: record.avNumber || '',
    docNumbers: record.docNumbers || '',
    type: record.type || '',
    attachments: record.attachments || [],
    other: record.other || '',
    description: record.description || '',
  });

  const [deptSearch, setDeptSearch] = useState(record.dept || '');
  const [isDeptFocused, setIsDeptFocused] = useState(false);
  const [deptError, setDeptError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDocGuide, setShowDocGuide] = useState(false);

  const computedCabinetId = formData.dept ? getCabinetId(formData.dept) : record.cabinetId;
  const computedKeypass = formData.type ? getKeypass(formData.type) : record.keypass;
  const checklistItems = formData.type ? ITEMS_CONFIG[formData.type] || [] : [];

  const handleDeptBlur = () => {
    setTimeout(() => {
      setIsDeptFocused(false);
      if (deptSearch.trim() !== '') {
        const isMatch = MFU_DEPARTMENTS.includes(deptSearch.trim());
        if (!isMatch) {
          setDeptError('กรุณาเลือกชื่อหน่วยงานจากรายการที่กำหนดให้เท่านั้นครับ');
          setFormData((prev) => ({ ...prev, dept: '' }));
          setDeptSearch('');
        } else {
          setDeptError('');
          setFormData((prev) => ({ ...prev, dept: deptSearch.trim() }));
        }
      }
    }, 200);
  };

  const handleSelectDept = (deptName: string) => {
    setDeptSearch(deptName);
    setFormData((prev) => ({ ...prev, dept: deptName }));
    setDeptError('');
    setIsDeptFocused(false);
  };

  const handleCheckboxToggle = (itemText: string) => {
    setFormData((prev) => {
      const exists = prev.attachments.includes(itemText);
      if (exists) {
        return {
          ...prev,
          attachments: prev.attachments.filter((a) => a !== itemText),
        };
      } else {
        return {
          ...prev,
          attachments: [...prev.attachments, itemText],
        };
      }
    });
  };

  const handleSelectType = (typeVal: string) => {
    setFormData((prev) => ({
      ...prev,
      type: typeVal,
      attachments: [], // reset on type change
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.dept) {
      setDeptError('กรุณาเลือกหน่วยงานให้ถูกต้อง');
      return;
    }

    // Validate document numbers (Required & 10 digits per line)
    const rawDocNumbers = formData.docNumbers.trim();
    if (!rawDocNumbers) {
      alert('กรุณาระบุเลขที่เอกสาร (บังคับกรอก)');
      return;
    }

    const docLines = rawDocNumbers
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (docLines.length === 0) {
      alert('กรุณาระบุเลขที่เอกสาร 10 หลัก');
      return;
    }

    const invalidLines = docLines.filter((l) => l.length !== 10);
    if (invalidLines.length > 0) {
      alert(
        `เลขที่เอกสารต้องมี 10 หลักเท่านั้นในทุกบรรทัด\n\nบรรทัดที่ไม่ถูกต้อง (${invalidLines.length} รายการ):\n` +
          invalidLines.map((l) => `• "${l}" (ยาว ${l.length} หลัก)`).join('\n') +
          `\n\nโปรดตรวจสอบและแก้ไขให้ครบ 10 หลักในทุกบรรทัดก่อนบันทึกข้อมูลครับ`
      );
      return;
    }

    if (!formData.type) {
      alert('กรุณาเลือกประเภทเอกสาร');
      return;
    }

    setIsSaving(true);
    try {
      const updatedRecordItem: ChecklistRecord = {
        ...record,
        name: formData.name,
        phone: formData.phone,
        clientEmail: formData.clientEmail,
        dept: formData.dept,
        avNumber: formData.avNumber,
        docNumbers: formData.docNumbers,
        type: formData.type,
        attachments: formData.attachments,
        other: formData.other,
        description: formData.description,
        cabinetId: computedCabinetId,
        keypass: computedKeypass,
        status: 'แก้ไขแล้ว',
      };

      const success = await onSave(updatedRecordItem);
      if (success) {
        onClose();
      }
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDepts = MFU_DEPARTMENTS.filter((d) =>
    d.toLowerCase().includes(deptSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 animate-fadeIn my-8">
        <div className="bg-[#800000] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-bold text-base">แก้ไขข้อมูล CHECKLIST (ID: {record.id})</h3>
              <p className="text-[11px] text-amber-200">เวลาที่สร้าง: {record.formattedTime}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sender Name */}
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                ผู้ส่งเอกสาร <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                โทรศัพท์ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
              />
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-800 mb-1">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
              />
            </div>

            {/* Department */}
            <div className="sm:col-span-2 relative">
              <label className="block font-bold text-gray-800 mb-1 flex justify-between items-center">
                <span>หน่วยงาน <span className="text-red-500">*</span></span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ตู้: {computedCabinetId}
                </span>
              </label>
              <input
                type="text"
                required
                value={deptSearch}
                onChange={(e) => {
                  setDeptSearch(e.target.value);
                  setDeptError('');
                  setIsDeptFocused(true);
                }}
                onFocus={() => setIsDeptFocused(true)}
                onBlur={handleDeptBlur}
                className={`w-full px-3 py-2 text-xs border ${
                  deptError ? 'border-red-500 bg-red-50/30' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none`}
                placeholder="ค้นหาหน่วยงาน..."
                autoComplete="off"
              />
              {deptError && (
                <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {deptError}
                </p>
              )}

              {isDeptFocused && filteredDepts.length > 0 && (
                <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-gray-100">
                  {filteredDepts.map((d, i) => (
                    <div
                      key={i}
                      onMouseDown={() => handleSelectDept(d)}
                      className="px-3 py-2 hover:bg-red-50 hover:text-[#800000] cursor-pointer font-medium transition flex items-center justify-between"
                    >
                      <span>{d}</span>
                      <span className="text-[10px] text-gray-400 font-mono">ตู้: {getCabinetic(d)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AV Number */}
            <div>
              <label className="block font-bold text-gray-800 mb-1">
                เลขที่ อว. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.avNumber}
                onChange={(e) => setFormData({ ...formData, avNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
              />
            </div>

            {/* Document Type */}
            <div>
              <label className="block font-bold text-gray-800 mb-1 flex justify-between items-center">
                <span>ประเภทเอกสาร <span className="text-red-500">*</span></span>
                <span className="text-red-800 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  KP: {computedKeypass}
                </span>
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => handleSelectType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white"
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Document Numbers */}
            <div className="sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                <label className="block font-bold text-gray-800">
                  เลขที่เอกสาร <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowDocGuide(true)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3" />
                  <span>วิธีการกรอกเลขที่เอกสาร</span>
                </button>
              </div>
              <textarea
                rows={3}
                required
                value={formData.docNumbers}
                onChange={(e) => setFormData({ ...formData, docNumbers: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none font-mono"
                placeholder="ระบุเลขที่เอกสาร 10 หลัก (กรณีมีหลายชุด ให้กด Enter ขึ้นบรรทัดใหม่)"
              />
              <div className="mt-1 flex flex-wrap items-center justify-between text-[11px] text-gray-500 gap-1">
                <span>* บังคับ 10 หลักในทุกบรรทัด (กด Enter ขึ้นบรรทัดใหม่)</span>
                {(() => {
                  const docLinesList = formData.docNumbers
                    .split('\n')
                    .map((l) => l.trim())
                    .filter((l) => l.length > 0);
                  const docLinesCount = docLinesList.length;
                  const isDocNumbersValid =
                    docLinesCount > 0 && docLinesList.every((l) => l.length === 10);
                  if (docLinesCount === 0) return null;
                  return (
                    <span
                      className={`font-semibold ${
                        isDocNumbersValid ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {isDocNumbersValid
                        ? `✓ ถูกต้อง (${docLinesCount} ชุด)`
                        : `! มีบรรทัดไม่ครบ 10 หลัก`}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Description (คำอธิบายเอกสาร) */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-800 mb-1 flex justify-between items-center">
                <span>คำอธิบายเกี่ยวกับเอกสารฉบับนี้ <span className="text-gray-500 font-normal">(เช่น ค่าไฟฟ้า 08/69)</span></span>
                <span className={`text-[11px] ${formData.description.length > 40 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                  {formData.description.length}/40
                </span>
              </label>
              <input
                type="text"
                maxLength={40}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
                placeholder="ระบุคำอธิบายสั้นๆ ไม่เกิน 40 ตัวอักษร"
              />
            </div>
          </div>

          {/* Checklist Items */}
          {formData.type && (
            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 space-y-2">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="font-bold text-xs text-[#800000] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> รายการแนบ (Checklist Items):
                </span>
                <span className="text-[11px] text-gray-500">
                  เลือกแล้ว {formData.attachments.length} รายการ
                </span>
              </div>

              {checklistItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {checklistItems.map((item, idx) => {
                    const isChecked = formData.attachments.includes(item);
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-2 p-1.5 rounded border text-[11px] cursor-pointer transition ${
                          isChecked
                            ? 'bg-red-50 border-[#800000]/30 text-gray-900 font-medium'
                            : 'bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxToggle(item)}
                          className="mt-0.5 rounded text-[#800000] w-3.5 h-3.5"
                        />
                        <span className="leading-tight">{item}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-gray-500 italic py-1">ไม่มีรายการแนบย่อย</p>
              )}

              <div className="pt-2 border-t border-gray-200">
                <label className="block font-bold text-gray-700 mb-1">อื่นๆ:</label>
                <input
                  type="text"
                  value={formData.other}
                  onChange={(e) => setFormData({ ...formData, other: e.target.value })}
                  placeholder="ระบุเพิ่มเติม (ถ้ามี)"
                  className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white"
                />
              </div>
            </div>
          )}

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-red-900 rounded-lg transition shadow flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Guide Popup Modal */}
      <DocGuideModal isOpen={showDocGuide} onClose={() => setShowDocGuide(false)} />
    </div>
  );
};

function getCabinetic(deptName: string) {
  return getCabinetId(deptName);
}
