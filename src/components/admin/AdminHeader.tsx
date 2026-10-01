import React, { useState } from 'react';
import { Download, RefreshCw, LogOut, Trash2, ShieldCheck, AlertTriangle, Sliders } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { exportTeamsToCsv } from '../../lib/export';
import { resetAllData } from '../../services/slotService';

export const AdminHeader: React.FC = () => {
  const { teams, slots, globalMaxSlots, updateGlobalMaxSlots, setIsAdmin, refreshData, showToast } = useApp();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [selectedLimit, setSelectedLimit] = useState(globalMaxSlots);
  const [isResetting, setIsResetting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleExport = () => {
    if (teams.length === 0) {
      showToast('لا توجد فرق مسجلة لتصديرها', 'info');
      return;
    }
    exportTeamsToCsv(teams, slots);
    showToast('تم تصدير ملف الجدول بنجاح', 'success');
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
    showToast('تم تحديث البيانات بنجاح', 'info');
  };

  const handleSaveGlobalLimit = () => {
    updateGlobalMaxSlots(selectedLimit);
    setIsLimitModalOpen(false);
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    const success = await resetAllData();
    setIsResetting(false);
    setIsResetModalOpen(false);

    if (success) {
      await refreshData();
      showToast('تم تصفير جميع بيانات الفرق والحجوزات بنجاح', 'success');
    } else {
      showToast('فشل تصفير البيانات', 'error');
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white">لوحة تحكم المشرف العام</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              الحد العام الحالي: <strong className="text-brand-300 font-bold">{globalMaxSlots} محميات لكل فريق</strong>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-brand-500/30 text-brand-300 hover:bg-brand-500/10"
            onClick={() => {
              setSelectedLimit(globalMaxSlots);
              setIsLimitModalOpen(true);
            }}
            icon={<Sliders className="w-4 h-4" />}
          >
            حد الحجز العام ({globalMaxSlots})
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleManualRefresh}
            isLoading={isRefreshing}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            تحديث
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleExport}
            icon={<Download className="w-4 h-4" />}
          >
            تصدير كشف Excel
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() => setIsResetModalOpen(true)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            تصفير النظام
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsAdmin(false)}
            icon={<LogOut className="w-4 h-4" />}
          >
            خروج الأدمن
          </Button>
        </div>
      </div>

      {/* Global Limit Configuration Modal */}
      <Modal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        title="تحديد الحد الأقصى للمحميات لكل فريق"
        maxWidth="sm"
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-400 leading-relaxed">
            حدد عدد المحميات المسموح لكل فريق باختيارها وحجزها في النظام (افتراضياً: 2 محميات):
          </p>

          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setSelectedLimit(num)}
                className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                  selectedLimit === num
                    ? 'bg-brand-600 border-brand-400 text-white shadow-lg shadow-brand-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {num} {num === 1 ? 'محمية' : num === 2 ? 'محميتين' : 'محميات'}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsLimitModalOpen(false)}>
              إلغاء
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveGlobalLimit}>
              حفظ وتطبيق فوراً
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="تأكيد تصفير النظام بالكامل"
        maxWidth="md"
      >
        <div className="space-y-4 py-2">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
            <div>
              <strong className="block font-bold">تحذير أمني هام:</strong>
              هذا الإجراء سيقوم بحذف كافة الفرق المسجلة وتفريغ جميع المحميات المحجوزة.
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="outline" size="sm" onClick={() => setIsResetModalOpen(false)}>
              إلغاء التراجع
            </Button>
            <Button variant="danger" size="sm" isLoading={isResetting} onClick={handleConfirmReset}>
              نعم، تصفير كافة البيانات
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
