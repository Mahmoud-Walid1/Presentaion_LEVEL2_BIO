import React, { useState } from 'react';
import { Download, RefreshCw, LogOut, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { exportTeamsToCsv } from '../../lib/export';
import { resetAllData } from '../../services/slotService';

export const AdminHeader: React.FC = () => {
  const { teams, slots, setIsAdmin, refreshData, showToast } = useApp();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">لوحة تحكم المشرف العام</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              مراقبة الحجوزات اللحظية، تعديل الفرق وتصدير التقارير
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
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

      {/* High Friction Reset Confirmation Modal (UX Rule 16) */}
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
              هذا الإجراء سيقوم بحذف كافة الفرق المسجلة (الأعضاء والليدرز) وتفريغ جميع أدوار البريزنتيشن المحجوزة.
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            هل أنت متأكد تماماً من رغبتك في تصفير قاعدة البيانات؟ لن يمكنك استرجاع أي بيانات بعد هذا الإجراء.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(false)}
            >
              إلغاء التراجع
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isResetting}
              onClick={handleConfirmReset}
            >
              نعم، تصفير كافة البيانات
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
