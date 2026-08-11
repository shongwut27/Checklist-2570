import React, { useState } from 'react';
import { ChecklistRecord } from '../types';
import { Printer, Search, RefreshCw, Filter, FileText, Trash2, Edit3, RefreshCcw } from 'lucide-react';

interface HistoryTableProps {
  records: ChecklistRecord[];
  filterEmail: string;
  onEmailChange: (email: string) => void;
  onSelectRecordToPrint: (record: ChecklistRecord) => void;
  onEditRecord?: (record: ChecklistRecord) => void;
  onClearHistory?: () => void;
  isLoading?: boolean;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  records,
  filterEmail,
  onEmailChange,
  onSelectRecordToPrint,
  onEditRecord,
  onClearHistory,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Filter records based on email, search term, and document type
  const filteredRecords = records.filter((rec) => {
    // Email check (case insensitive substring match)
    if (filterEmail.trim()) {
      const emailMatch = rec.clientEmail
        .toLowerCase()
        .includes(filterEmail.trim().toLowerCase());
      if (!emailMatch) return false;
    }

    // Type filter check
    if (typeFilter && rec.type !== typeFilter) {
      return false;
    }

    // General search term check
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const matchId = rec.id.toLowerCase().includes(q);
      const matchDept = rec.dept.toLowerCase().includes(q);
      const matchName = rec.name.toLowerCase().includes(q);
      const matchAv = rec.avNumber.toLowerCase().includes(q);
      const matchDoc = rec.docNumbers.toLowerCase().includes(q);
      const matchType = rec.type.toLowerCase().includes(q);
      const matchCabinet = rec.cabinetId.toLowerCase().includes(q);
      const matchDesc = rec.description && rec.description.toLowerCase().includes(q);
      return matchId || matchDept || matchName || matchAv || matchDoc || matchType || matchCabinet || matchDesc;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* General Keyword Search */}
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-[#800000]" /> ค้นหาทั่วไป (เลขทะเบียน/เรื่อง/คำอธิบาย)
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="พิมพ์คำที่ต้องการค้นหา..."
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <div className="w-full md:w-48">
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#800000]" /> ประเภทเอกสาร
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:outline-none bg-white"
            >
              <option value="">-- ทั้งหมด --</option>
              <option value="ยืมเงินทดรองจ่าย">ยืมเงินทดรองจ่าย</option>
              <option value="คืนเงินยืมทดรอง">คืนเงินยืมทดรอง</option>
              <option value="เบิกสำรองจ่าย">เบิกสำรองจ่าย</option>
              <option value="เบิกจ่ายทั่วไป">เบิกจ่ายทั่วไป</option>
              <option value="เบิกจ่ายตรวจรับพัสดุ">เบิกจ่ายตรวจรับพัสดุ</option>
              <option value="สวัสดิการ">สวัสดิการ</option>
              <option value="ค่าอาหารทำการนอกเวลา">ค่าอาหารทำการนอกเวลา</option>
              <option value="เบิกจ่ายค่าแรง">เบิกจ่ายค่าแรง</option>
              <option value="ทุนการศึกษา">ทุนการศึกษา</option>
              <option value="เอกสารปิดโครงการ">เอกสารปิดโครงการ</option>
              <option value="งานเงินเดือน">งานเงินเดือน</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs text-gray-500">
          <div>
            พบข้อมูลทั้งหมด <span className="font-bold text-[#800000]">{filteredRecords.length}</span> รายการ
          </div>
          {onClearHistory && records.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-red-600 hover:text-red-800 flex items-center gap-1 text-[11px] font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> ล้างประวัติทดสอบ
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                <th className="py-3 px-4 min-w-[140px]">ทะเบียน/เวลา/ตู้</th>
                <th className="py-3 px-4 min-w-[180px] text-red-700">ประเภท / อว. / เลขที่</th>
                <th className="py-3 px-4 min-w-[200px]">เรื่อง</th>
                <th className="py-3 px-4 min-w-[180px]">หน่วยงาน/ผู้ส่ง</th>
                <th className="py-3 px-4 min-w-[160px] text-center">จัดการ / พิมพ์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#800000]" />
                      <span>กำลังโหลดข้อมูลประวัติ...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="font-bold text-gray-600">ไม่พบประวัติรายการ Checklist</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {filterEmail ? `ไม่มีรายการสำหรับอีเมล: ${filterEmail}` : 'ยังไม่มีการสร้างรายการใหม่'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-50/40 transition">
                    {/* Register ID & Timestamp */}
                    <td className="py-3 px-4 align-top">
                      <div className="font-bold text-gray-900 text-sm">{item.id}</div>
                      <div className="text-[11px] text-gray-500 font-medium">{item.formattedTime}</div>
                      <div className="text-[10px] text-gray-400 mt-1 flex flex-wrap gap-1">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded border">ตู้: {item.cabinetId}</span>
                        <span className="bg-[#800000]/10 text-[#800000] px-1.5 py-0.5 rounded font-bold">
                          KP: {item.keypass}
                        </span>
                        {item.status && (
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                            {item.status}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Type, AV Number & Doc Numbers */}
                    <td className="py-3 px-4 align-top">
                      <span className="inline-block bg-gray-100 text-gray-800 text-[11px] font-semibold px-2 py-0.5 rounded border border-gray-200 shadow-2xs mb-1">
                        {item.type}
                      </span>
                      <div className="font-semibold text-gray-800 text-sm mt-0.5">{item.avNumber}</div>
                      <div className="text-[11px] text-gray-500 whitespace-pre-line truncate max-w-[160px]" title={item.docNumbers}>
                        {item.docNumbers || '-'}
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 align-top">
                      <div className="text-sm text-gray-800 break-words max-w-[200px]" title={item.description}>
                        {item.description || '-'}
                      </div>
                    </td>

                    {/* Department & Sender */}
                    <td className="py-3 px-4 align-top">
                      <div className="font-semibold text-gray-800 leading-snug">{item.dept}</div>
                      <div className="text-gray-600 mt-0.5 font-medium">{item.name}</div>
                      {item.phone && (
                        <div className="text-[10px] text-gray-400 mt-0.5">โทร: {item.phone}</div>
                      )}
                    </td>

                    {/* Actions: Edit & REPRINT */}
                    <td className="py-3 px-4 align-top">
                      <div className="flex items-center justify-center gap-1.5">
                        {onEditRecord && (
                          <button
                            onClick={() => onEditRecord(item)}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-[11px] px-2.5 py-1.5 rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer"
                            title="แก้ไขข้อมูล Checklist"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>แก้ไข</span>
                          </button>
                        )}
                        <button
                          onClick={() => onSelectRecordToPrint(item)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] px-2.5 py-1.5 rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer"
                          title="REPRINT / พิมพ์ PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>REPRINT / พิมพ์ PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
