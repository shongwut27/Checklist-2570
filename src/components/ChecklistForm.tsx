import React, { useState, useEffect } from 'react';
import { MFU_DEPARTMENTS, getCabinetId } from '../data/departments';
import { DOCUMENT_TYPES, ITEMS_CONFIG, getKeypass } from '../data/checklists';
import { FormDataState, ChecklistRecord } from '../types';
import { Printer, CheckCircle2, Rocket, Info, Building2, Sparkles, AlertCircle, HelpCircle, PlusCircle } from 'lucide-react';
import { DocGuideModal } from './DocGuideModal';

interface ChecklistFormProps {
  initialEmail: string;
  gasWebhookUrl?: string;
  onUpdateGasWebhookUrl?: (url: string) => void;
  onSubmitForm: (formData: FormDataState) => Promise<{ status: string; record?: ChecklistRecord; msg?: string }>;
  onOpenPdf: (record: ChecklistRecord) => void;
}

export const ChecklistForm: React.FC<ChecklistFormProps> = ({
  initialEmail,
  gasWebhookUrl = '',
  onUpdateGasWebhookUrl,
  onSubmitForm,
  onOpenPdf,
}) => {
  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    phone: '',
    clientEmail: initialEmail || 'info.finance@mfu.ac.th',
    dept: '',
    avNumber: '',
    docNumbers: '',
    type: '',
    attachments: [],
    other: '',
    description: '',
  });

  const [deptSearch, setDeptSearch] = useState('');
  const [isDeptFocused, setIsDeptFocused] = useState(false);
  const [deptError, setDeptError] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState<ChecklistRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputWebhookUrl, setInputWebhookUrl] = useState(gasWebhookUrl);
  const [showDocGuide, setShowDocGuide] = useState(false);

  useEffect(() => {
    setInputWebhookUrl(gasWebhookUrl);
  }, [gasWebhookUrl]);

  // Sync initial email if updated
  useEffect(() => {
    if (initialEmail && !formData.clientEmail) {
      setFormData((prev) => ({ ...prev, clientEmail: initialEmail }));
    }
  }, [initialEmail]);

  // Derived Values
  const computedCabinetId = formData.dept ? getCabinetId(formData.dept) : 'N/A';
  const computedKeypass = formData.type ? getKeypass(formData.type) : '1';
  const checklistItems = formData.type ? ITEMS_CONFIG[formData.type] || [] : [];

  // Department Validation logic matching GAS
  const handleDeptBlur = () => {
    setTimeout(() => {
      setIsDeptFocused(false);
      if (deptSearch.trim() !== '') {
        const query = deptSearch.trim().toLowerCase();
        const matched = MFU_DEPARTMENTS.find((d) => {
          const lower = d.toLowerCase();
          const dashVersion = lower.replace('\n', ' - ');
          const spaceVersion = lower.replace('\n', ' ');
          const firstLine = d.split('\n')[0].trim().toLowerCase();
          const secondLine = d.split('\n')[1] ? d.split('\n')[1].trim().toLowerCase() : '';

          return (
            lower === query ||
            dashVersion === query ||
            spaceVersion === query ||
            firstLine === query ||
            secondLine === query ||
            dashVersion.includes(query) ||
            spaceVersion.includes(query) ||
            lower.includes(query)
          );
        });

        if (!matched) {
          setDeptError('กรุณาเลือกชื่อหน่วยงานจากรายการที่กำหนดให้เท่านั้นครับ');
          setFormData((prev) => ({ ...prev, dept: '' }));
          setDeptSearch('');
        } else {
          setDeptError('');
          setFormData((prev) => ({ ...prev, dept: matched }));
          setDeptSearch(matched.replace('\n', ' - '));
        }
      }
    }, 200);
  };

  const handleSelectDept = (deptName: string) => {
    setDeptSearch(deptName.replace('\n', ' - '));
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
      attachments: [], // reset checklist items on type change
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate department
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

    setIsSubmitting(true);
    try {
      const res = await onSubmitForm(formData);
      if (res.status === 'success' && res.record) {
        setSubmittedRecord(res.record);
      } else {
        alert('เกิดข้อผิดพลาด: ' + (res.msg || 'ไม่สามารถบันทึกได้'));
      }
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedRecord(null);
    setFormData({
      name: '',
      phone: '',
      clientEmail: initialEmail || 'info.finance@mfu.ac.th',
      dept: '',
      avNumber: '',
      docNumbers: '',
      type: '',
      attachments: [],
      other: '',
      description: '',
    });
    setDeptSearch('');
    setDeptError('');
  };

  // Filtered department list for autocomplete
  const filteredDepts = MFU_DEPARTMENTS.filter((d) => {
    const query = deptSearch.toLowerCase().trim();
    if (!query) return true;
    const lower = d.toLowerCase();
    const dashVersion = lower.replace('\n', ' - ');
    const spaceVersion = lower.replace('\n', ' ');
    return lower.includes(query) || dashVersion.includes(query) || spaceVersion.includes(query);
  });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* If Form is successfully submitted, show Success Screen */}
      {submittedRecord ? (
        <div className="p-8 sm:p-12 text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-emerald-700">
              บันทึกข้อมูลสำเร็จ!
            </h2>
          </div>

          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 max-w-md mx-auto space-y-3">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              เลขทะเบียนรับ (Registration ID)
            </div>
            <div className="inline-block bg-[#800000] text-white font-mono font-bold text-2xl sm:text-3xl px-6 py-2 rounded-full shadow-md">
              {submittedRecord.id}
            </div>
          </div>

          <div className="space-y-3 pt-2 max-w-md mx-auto">
            <div className="flex flex-col items-center gap-3">
              {/* Single Main Action Button: Print / Download Checklist */}
              <button
                type="button"
                onClick={() => onOpenPdf(submittedRecord)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2.5 text-sm sm:text-base cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Printer className="w-5 h-5" />
                <span>พิมพ์ / ดาวน์โหลด Checklist</span>
              </button>

              {/* New Checklist Transaction Button */}
              <button
                type="button"
                onClick={handleReset}
                className="w-full bg-white hover:bg-gray-50 text-[#800000] border-2 border-[#800000]/30 hover:border-[#800000] font-bold px-6 py-3 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <PlusCircle className="w-5 h-5 text-[#800000]" />
                <span>ทำรายการใหม่</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Form View */
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Sender Name */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                ผู้ส่งเอกสาร <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent focus:outline-none transition"
                placeholder="ชื่อ-นามสกุล ผู้ส่งเอกสาร"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                โทรศัพท์ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent focus:outline-none transition"
                placeholder="เบอร์โทรศัพท์ติดต่อ"
              />
            </div>

            {/* Department (หน่วยงาน with Autocomplete & Strict Match Validation) */}
            <div className="md:col-span-2 relative">
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                <span>หน่วยงาน <span className="text-red-500">*</span></span>
                {formData.dept && (
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    รหัสตู้: {computedCabinetId}
                  </span>
                )}
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
                className={`w-full px-3.5 py-2.5 text-sm border ${
                  deptError ? 'border-red-500 bg-red-50/30' : 'border-gray-300'
                } rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none transition`}
                placeholder="ค้นหาหน่วยงาน..."
                autoComplete="off"
              />

              {deptError && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {deptError}
                </p>
              )}

              {/* Autocomplete Dropdown List */}
              {isDeptFocused && filteredDepts.length > 0 && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-100 text-xs">
                  {filteredDepts.map((d, i) => {
                    const parts = d.split('\n');
                    return (
                      <div
                        key={i}
                        onMouseDown={() => handleSelectDept(d)}
                        className="px-4 py-2.5 hover:bg-red-50 hover:text-[#800000] cursor-pointer font-medium transition flex items-center justify-between gap-2"
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-semibold text-gray-900">{parts[0]}</span>
                          {parts[1] && <span className="text-[11px] text-gray-500 font-normal">{parts[1]}</span>}
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono shrink-0">ตู้: {getCabinetId(d)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* AV Number (เลขที่ อว.) */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5">
                เลขที่ อว. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.avNumber}
                onChange={(e) => setFormData({ ...formData, avNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent focus:outline-none transition"
                placeholder="เช่น 7700/0000"
              />
            </div>

            {/* Document Numbers (เลขที่เอกสาร) */}
            <div className="md:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                <label className="block text-xs sm:text-sm font-bold text-gray-800">
                  เลขที่เอกสาร <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowDocGuide(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>วิธีการกรอกเลขที่เอกสาร</span>
                </button>
              </div>
              <textarea
                rows={3}
                required
                value={formData.docNumbers}
                onChange={(e) => setFormData({ ...formData, docNumbers: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent focus:outline-none transition font-mono"
                placeholder="ระบุเลขที่เอกสาร 10 หลัก (กรณีมีหลายชุด ให้กด Enter ขึ้นบรรทัดใหม่)"
              />
              <div className="mt-1 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-1">
                <span>* บังคับ 10 หลักในทุกบรรทัด (กด Enter ขึ้นบรรทัดใหม่สำหรับชุดถัดไป)</span>
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

            {/* Document Type (ประเภทเอกสาร) */}
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                <span>ประเภทเอกสาร <span className="text-red-500">*</span></span>
                {formData.type && (
                  <span className="text-xs text-red-800 font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    KEYPASS: {computedKeypass}
                  </span>
                )}
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => handleSelectType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white transition"
              >
                <option value="" disabled>
                  -- เลือกประเภทเอกสาร --
                </option>
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Description (คำอธิบายเอกสาร) */}
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                <span>คำอธิบายเกี่ยวกับเอกสารฉบับนี้ <span className="text-gray-500 font-normal">(เช่น ค่าไฟฟ้า 08/69)</span></span>
                <span className={`text-xs ${formData.description.length > 40 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                  {formData.description.length}/40
                </span>
              </label>
              <input
                type="text"
                maxLength={40}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent focus:outline-none transition"
                placeholder="ระบุคำอธิบายสั้นๆ ไม่เกิน 40 ตัวอักษร"
              />
            </div>
          </div>

          {/* Dynamic Checklist Area (`#checkArea`) */}
          {formData.type && (
            <div className="bg-gray-50/80 p-5 rounded-xl border border-gray-200 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="font-bold text-sm text-[#800000] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> รายการแนบ (Checklist Items):
                </span>
                <span className="text-xs text-gray-500 font-medium">
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
                        className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                          isChecked
                            ? 'bg-red-50/80 border-[#800000]/30 text-gray-900 font-medium shadow-2xs'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100/70'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxToggle(item)}
                          className="mt-0.5 rounded text-[#800000] focus:ring-[#800000] w-4 h-4"
                        />
                        <span className="leading-tight">{item}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic py-2">
                  ประเภทเอกสารนี้ไม่มีรายการแนบย่อย
                </p>
              )}

              {/* Other Custom Attachments Field */}
              <div className="pt-2 border-t border-gray-200">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  อื่นๆ:
                </label>
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

          {/* Submit Button matching MFU Deep Red Pill Design */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#800000] hover:bg-red-900 text-white font-bold text-base py-3.5 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Rocket className="w-5 h-5 text-amber-300" />
            <span>ยืนยันความถูกต้องและบันทึกข้อมูล</span>
          </button>
        </form>
      )}

      {/* Document Numbering Guide Popup Modal */}
      <DocGuideModal isOpen={showDocGuide} onClose={() => setShowDocGuide(false)} />
    </div>
  );
};

// Helper inside component
function getCabinetic(deptName: string) {
  return getCabinetId(deptName);
}
