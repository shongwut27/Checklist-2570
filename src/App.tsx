import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ChecklistForm } from './components/ChecklistForm';
import { HistoryTable } from './components/HistoryTable';
import { LoadingOverlay } from './components/LoadingOverlay';
import { PdfCoverSheet } from './components/PdfCoverSheet';
import { ConfigModal } from './components/ConfigModal';
import { EditRecordModal } from './components/EditRecordModal';
import { MfuLogo } from './components/MfuLogo';
import { ChecklistRecord, FormDataState, WebhookConfig } from './types';
import { Settings, FileText, History, ExternalLink, ShieldAlert, Sparkles, Building2, Code2, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { initAuth, googleSignIn, logout, getAccessToken } from './lib/firebase';
import { appendRecordToSheet, fetchRecordsFromSheet, updateRecordInSheet } from './lib/workspace';
import { User } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [records, setRecords] = useState<ChecklistRecord[]>([]);
  const [userEmail, setUserEmail] = useState<string>('shongwut.tab@mfu.ac.th');
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRocketLoading, setIsRocketLoading] = useState<boolean>(false);
  
  // Selected Record to view/print Cover Sheet
  const [selectedRecordForPdf, setSelectedRecordForPdf] = useState<ChecklistRecord | null>(null);

  // Selected Record for Editing
  const [editingRecord, setEditingRecord] = useState<ChecklistRecord | null>(null);

  // Webhook / Google Sheets Settings
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig>({
    spreadsheetId: '1Uxci-m9YhP7SFYF098f-kVdYgyXyRQ0gTuIUYghX3Fc',
    sheetName: '(2570)CHECKLIST',
    gasWebhookUrl: localStorage.getItem('gasWebhookUrl') || '',
  });

  useEffect(() => {
    // Initialize Firebase Google Auth listener
    const unsubscribe = initAuth(
      async (user, token) => {
        const email = user.email || '';
        if (!email.toLowerCase().endsWith('@mfu.ac.th')) {
          await logout();
          setGoogleUser(null);
          setGoogleToken(null);
          setIsAuthChecking(false);
          return;
        }
        setGoogleUser(user);
        setGoogleToken(token);
        setUserEmail(email);
        setIsAuthChecking(false);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
        setIsAuthChecking(false);
      }
    );
    const timeout = setTimeout(() => {
      setIsAuthChecking(false);
    }, 1500);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        const email = res.user.email || '';
        if (!email.toLowerCase().endsWith('@mfu.ac.th')) {
          await logout();
          setGoogleUser(null);
          setGoogleToken(null);
          alert(`ขออภัย บัญชี ${email} ไม่สามารถเข้าใช้งานได้\nระบบกำหนดสิทธิ์เฉพาะผู้ใช้งานอีเมล @mfu.ac.th เท่านั้น`);
          return;
        }
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        setUserEmail(email);
        alert(`เข้าสู่ระบบด้วย Google เรียบร้อยแล้ว (${email})`);
      }
    } catch (err: any) {
      console.error('Google login failed:', err);
      alert('เข้าสู่ระบบด้วย Google ไม่สำเร็จ: ' + err.message);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setGoogleUser(null);
    setGoogleToken(null);
  };

  const handleSaveConfig = async (newConfig: WebhookConfig) => {
    setWebhookConfig(newConfig);
    if (newConfig.gasWebhookUrl) {
      localStorage.setItem('gasWebhookUrl', newConfig.gasWebhookUrl);
    }
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
    } catch (e) {
      console.warn('Failed to persist config to server:', e);
    }
  };

  const handleUpdateGasWebhookUrl = (url: string) => {
    localStorage.setItem('gasWebhookUrl', url);
    setWebhookConfig((prev) => {
      const updated = { ...prev, gasWebhookUrl: url };
      fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      }).catch(() => null);
      return updated;
    });
  };

  // Fetch History from API or Sheet
  const fetchHistory = async (emailFilter: string) => {
    setIsLoading(true);
    try {
      const currentToken = googleToken || getAccessToken();
      if (currentToken) {
        // Fetch from Google Sheet directly
        const sheetRecords = await fetchRecordsFromSheet(currentToken, webhookConfig.spreadsheetId, webhookConfig.sheetName);
        if (sheetRecords) {
          // Sync with local server
          fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ records: [...sheetRecords].reverse() }) // server wants chronological
          }).catch(() => null);

          let list = sheetRecords;
          if (emailFilter.trim()) {
            list = list.filter(r => r.clientEmail.toLowerCase() === emailFilter.trim().toLowerCase());
          }
          setRecords(list);
          setIsLoading(false);
          return;
        }
      }

      // Fallback to local server API
      const url = emailFilter ? `/api/history?email=${encodeURIComponent(emailFilter)}` : '/api/history';
      const res = await fetch(url);
      if (!res.ok) {
        console.warn('API status:', res.status);
        return;
      }
      const json = await res.json();
      const recordsList = json.records || json.data;
      if (json && json.status === 'success' && Array.isArray(recordsList)) {
        setRecords(recordsList);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Config & History on Load
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/config');
        if (res.ok) {
          const json = await res.json();
          if (json && json.status === 'success' && json.config) {
            setWebhookConfig((prev) => ({
              spreadsheetId: json.config.spreadsheetId || prev.spreadsheetId,
              sheetName: json.config.sheetName || prev.sheetName,
              gasWebhookUrl: json.config.gasWebhookUrl || prev.gasWebhookUrl || localStorage.getItem('gasWebhookUrl') || '',
            }));
          }
        }
      } catch (err) {
        console.warn('Failed to load server config:', err);
      }
    };

    fetchConfig();
    fetchHistory(userEmail);
  }, []);

  // Handle Form Submit with Rocket Loading and Confetti
  const handleSubmitForm = async (formData: FormDataState) => {
    setIsRocketLoading(true);

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          gasWebhookUrl: webhookConfig.gasWebhookUrl,
        }),
      });

      // Artificial wait time (1.8s) for rocket flight experience as requested
      await new Promise((r) => setTimeout(r, 1800));

      let json: any = null;
      try {
        json = await res.json();
      } catch (parseErr) {
        console.warn('Response was not JSON:', parseErr);
      }

      if (json && json.status === 'success' && json.record) {
        let rec: ChecklistRecord = json.record;

        // Direct Google Workspace API sync if signed in
        let currentToken = googleToken || getAccessToken();
        if (currentToken) {
          try {
            // Append row in Google Sheet
            let appendSuccess = await appendRecordToSheet(rec, currentToken, webhookConfig.spreadsheetId, webhookConfig.sheetName);
            if (!appendSuccess) {
              return {
                status: 'error',
                msg: 'ไม่สามารถบันทึกข้อมูลลง Google Sheet ได้ (สิทธิ์การเข้าถึงชีตไม่เพียงพอหรือหมดอายุ กรุณากดออกจากระบบแล้วเข้าสู่ระบบ Google ใหม่อีกครั้ง)',
              };
            }
          } catch (wsErr: any) {
            console.warn('Workspace sync error:', wsErr);
            return {
              status: 'error',
              msg: 'เกิดข้อผิดพลาดในการบันทึกลง Google Sheet: ' + (wsErr?.message || 'โปรดลองใหม่อีกครั้ง'),
            };
          }
        } else if (!webhookConfig.gasWebhookUrl) {
          return {
            status: 'error',
            msg: 'กรุณาเข้าสู่ระบบ Google (@mfu.ac.th) เพื่อบันทึกข้อมูลลง Google Sheet',
          };
        }

        // Trigger celebratory confetti!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#800000', '#f59e0b', '#10b981', '#ffffff'],
        });

        // Add record directly to local state
        setRecords(prev => [rec, ...prev]);
        return { status: 'success', record: rec };
      } else {
        return { status: 'error', msg: json?.msg || (!res.ok ? `เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (สถานะ ${res.status})` : 'ไม่สามารถสร้างบันทึกได้') };
      }
    } catch (err: any) {
      return { status: 'error', msg: err.message };
    } finally {
      setIsRocketLoading(false);
    }
  };

  const handleSaveEditedRecord = async (updatedRecord: ChecklistRecord): Promise<boolean> => {
    try {
      const oldRecord = records.find(r => r.id === updatedRecord.id);
      let diffText = "";
      if (oldRecord) {
        const changes = [];
        if (oldRecord.type !== updatedRecord.type) changes.push(`ประเภท: ${oldRecord.type} -> ${updatedRecord.type}`);
        if (oldRecord.dept !== updatedRecord.dept) changes.push(`หน่วยงาน: ${oldRecord.dept} -> ${updatedRecord.dept}`);
        if (oldRecord.avNumber !== updatedRecord.avNumber) changes.push(`เลข อว: ${oldRecord.avNumber || '-'} -> ${updatedRecord.avNumber}`);
        if (oldRecord.docNumbers !== updatedRecord.docNumbers) changes.push(`เลขที่เอกสาร: ${oldRecord.docNumbers || '-'} -> ${updatedRecord.docNumbers}`);
        if (oldRecord.description !== updatedRecord.description) changes.push(`เรื่อง: ${oldRecord.description || '-'} -> ${updatedRecord.description}`);
        const oldAttach = Array.isArray(oldRecord.attachments) ? oldRecord.attachments.join(',') : oldRecord.attachments;
        const newAttach = Array.isArray(updatedRecord.attachments) ? updatedRecord.attachments.join(',') : updatedRecord.attachments;
        if (oldAttach !== newAttach) changes.push(`เอกสารแนบ: ${oldAttach || '-'} -> ${newAttach || '-'}`);
        if (changes.length > 0) {
          diffText = ` (${changes.join(', ')})`;
        }
      }

      const editTimestamp = new Date().toLocaleString('th-TH');
      const newLog = `[${editTimestamp}] แก้ไขโดย ${userEmail}${diffText}`;
      updatedRecord.editLog = updatedRecord.editLog ? `${updatedRecord.editLog}\n${newLog}` : newLog;

      const currentToken = googleToken || getAccessToken();
      if (currentToken) {
        const updateSuccess = await updateRecordInSheet(updatedRecord, currentToken, webhookConfig.spreadsheetId, webhookConfig.sheetName);
        if (!updateSuccess) {
          console.warn('Could not update Google Sheet directly');
        }
      }
      const res = await fetch(`/api/history/${encodeURIComponent(updatedRecord.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updatedRecord,
          gasWebhookUrl: webhookConfig.gasWebhookUrl,
          spreadsheetId: webhookConfig.spreadsheetId,
          sheetName: webhookConfig.sheetName,
        }),
      });

      const json = await res.json();
      if (json.status === 'success') {
        const savedRec = json.record || updatedRecord;
        setRecords(prev => prev.map(r => r.id === savedRec.id ? savedRec : r));
        return true;
      } else {
        alert('เกิดข้อผิดพลาดในการบันทึกแก้ไข: ' + (json.msg || ''));
        return false;
      }
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการบันทึก: ' + err.message);
      return false;
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('คุณต้องการล้างประวัติการทดสอบทั้งหมดใช่หรือไม่?')) {
      try {
        await fetch('/api/history', { method: 'DELETE' });
        setRecords([]);
      } catch (err) {
        alert('Failed to clear history');
      }
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#800000] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500 font-medium">กำลังตรวจสอบข้อมูลการเข้าสู่ระบบ...</p>
        </div>
      </div>
    );
  }

  if (!googleUser) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col justify-between">
        {/* Top Header Banner in MFU Deep Maroon */}
        <header className="bg-[#800000] text-white px-4 sm:px-6 py-4 sm:py-5 shadow-md shrink-0">
          <div className="max-w-6xl mx-auto flex items-center gap-4 sm:gap-6">
            <MfuLogo className="h-16 sm:h-20 md:h-24 w-auto object-contain" />
            <div className="flex flex-col justify-center text-[#FFD700]">
              <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-widest leading-tight">CHECKLIST</h1>
              <h2 className="text-xs sm:text-base md:text-lg font-medium leading-snug">ส่วนการเงินและบัญชี มหาวิทยาลัยแม่ฟ้าหลวง</h2>
              <h3 className="text-[9px] sm:text-xs md:text-sm font-light tracking-wide leading-snug">DIVISION OF FINANCE AND ACCOUNTING MAE FAH LUANG UNIVERSITY</h3>
            </div>
          </div>
        </header>

        {/* Center Registration Card (Enlarged) */}
        <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-16">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden text-center">
            <div className="bg-[#800000] py-8 px-6 sm:py-10 sm:px-8 text-white text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white/20 shadow-inner">
                <LogIn className="w-10 h-10 text-[#FFD700]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">เข้าสู่ระบบ / ลงทะเบียน</h2>
              <p className="text-sm sm:text-base text-amber-200 mt-2 font-medium">ระบบ CHECKLIST ตรวจสอบเอกสารการเงินและบัญชี</p>
            </div>

            <div className="p-8 sm:p-12 space-y-8">
              <div className="space-y-3">
                <p className="text-lg sm:text-xl font-bold text-gray-800">
                  กรุณาลงทะเบียนหรือเข้าสู่ระบบด้วยอีเมล Google
                </p>
                <div className="inline-block bg-red-50 text-[#800000] border border-red-200 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold">
                  กำหนดสิทธิ์ผู้ใช้งานต้องเป็นอีเมล @mfu.ac.th เท่านั้น
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 bg-[#800000] hover:bg-[#660000] active:scale-[0.99] text-white font-bold py-4 sm:py-5 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer border border-[#800000] text-base sm:text-lg"
                >
                  <LogIn className="w-6 h-6 text-[#FFD700]" />
                  <span>ลงทะเบียนด้วยอีเมล Google (@mfu.ac.th)</span>
                </button>
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-3.5 text-left text-sm sm:text-base text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-[#800000] font-bold text-xs shrink-0 mt-0.5">
                    1
                  </span>
                  <span className="leading-snug font-medium">
                    สำหรับการบันทึกข้อมูลเข้าระบบ Checklist ส่วนการเงินฯ
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-[#800000] font-bold text-xs shrink-0 mt-0.5">
                    2
                  </span>
                  <span className="leading-snug font-medium">
                    ตรวจสอบประวัติและแก้ไขข้อมูลเอกสารย้อนหลัง
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-[#800000] font-bold text-xs shrink-0 mt-0.5">
                    3
                  </span>
                  <span className="leading-snug font-medium">
                    รองรับการดาวน์โหลดหรือสั่งพิมพ์แบบฟอร์ม Checklist
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-xs sm:text-sm text-gray-400 space-y-1">
          <p>ส่วนการเงินและบัญชี มหาวิทยาลัยแม่ฟ้าหลวง DIVISION OF FINANCE AND ACCOUNTING MAE FAH LUANG UNIVERSITY</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Rocket Flight Overlay */}
      <LoadingOverlay isVisible={isRocketLoading} />

      {/* Main Container Card matching GAS design */}
      <div className="w-full h-full min-h-screen mx-auto bg-white shadow-xl flex flex-col">
        
        {/* Top Header Banner in MFU Deep Maroon */}
        <div className="bg-[#800000] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-4 sm:gap-6">
            <MfuLogo className="h-20 sm:h-24 md:h-28 w-auto object-contain" />
            <div className="flex flex-col justify-center text-[#FFD700]">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-widest leading-tight">CHECKLIST</h1>
              <h2 className="text-sm sm:text-base md:text-lg font-medium leading-snug">ส่วนการเงินและบัญชี มหาวิทยาลัยแม่ฟ้าหลวง</h2>
              <h3 className="text-[10px] sm:text-xs md:text-sm font-light tracking-wide leading-snug">DIVISION OF FINANCE AND ACCOUNTING MAE FAH LUANG UNIVERSITY</h3>
            </div>
          </div>

          {/* User Account / Logout Header Menu */}
          <div className="flex items-center gap-3">
            {googleUser ? (
              <div className="flex items-center gap-3">
                <span className="text-xs sm:text-sm text-amber-200 font-medium truncate max-w-[180px] sm:max-w-none">
                  {googleUser.email}
                </span>
                <button
                  onClick={handleGoogleLogout}
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/20 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-amber-300" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Custom Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-4 text-center font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 border-b-3 cursor-pointer ${
              activeTab === 'form'
                ? 'border-[#800000] text-[#800000] bg-red-50/20'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>สร้าง Checklist</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              fetchHistory(userEmail);
            }}
            className={`flex-1 py-4 text-center font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 border-b-3 cursor-pointer ${
              activeTab === 'history'
                ? 'border-[#800000] text-[#800000] bg-red-50/20'
                : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <History className="w-4 h-4" />
            <span>ประวัติ & แก้ไขข้อมูล / REPRINT</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-4 sm:p-6 bg-gray-50/50">
          {activeTab === 'form' ? (
            <ChecklistForm
              initialEmail={userEmail}
              gasWebhookUrl={webhookConfig.gasWebhookUrl}
              onUpdateGasWebhookUrl={handleUpdateGasWebhookUrl}
              onSubmitForm={handleSubmitForm}
              onOpenPdf={(rec) => setSelectedRecordForPdf(rec)}
            />
          ) : (
            <HistoryTable
              records={records}
              filterEmail={userEmail}
              onEmailChange={(newEmail) => {
                setUserEmail(newEmail);
                fetchHistory(newEmail);
              }}
              onSelectRecordToPrint={(rec) => setSelectedRecordForPdf(rec)}
              onEditRecord={(rec) => setEditingRecord(rec)}
              onClearHistory={handleClearHistory}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>

      {/* Edit Record Modal */}
      <EditRecordModal
        isOpen={!!editingRecord}
        record={editingRecord}
        onClose={() => setEditingRecord(null)}
        onSave={handleSaveEditedRecord}
      />

      {/* PDF Cover Sheet Modal */}
      {selectedRecordForPdf && (
        <PdfCoverSheet
          record={selectedRecordForPdf}
          onClose={() => setSelectedRecordForPdf(null)}
        />
      )}

      {/* Configuration Settings Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={webhookConfig}
        onSaveConfig={handleSaveConfig}
      />

      {/* App Footer */}
      <footer className="max-w-4xl mx-auto mt-6 text-center text-xs text-gray-400 space-y-1">
        <p>ส่วนการเงินและบัญชี มหาวิทยาลัยแม่ฟ้าหลวง DIVISION OF FINANCE AND ACCOUNTING MAE FAH LUANG UNIVERSITY</p>
      </footer>
    </div>
  );
}
