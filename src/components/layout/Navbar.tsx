import React from 'react';
import { Presentation, UserPlus, Calendar, Shield, Radio, LogOut, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { isSupabaseConfigured } from '../../lib/supabase';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, activeTeam, logoutTeam } = useApp();

  return (
    <>
      {/* Top Main Bar */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-[#090d16]/90 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white shrink-0">
                <Presentation className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white block leading-tight">
                  منظومة عروض الفرق
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 block -mt-0.5">
                  حجز المحميات الطبيعية (30 محمية)
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('register')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  activeTab === 'register'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span>تسجيل فريق</span>
              </button>

              <button
                onClick={() => setActiveTab('booking')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  activeTab === 'booking'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>حجز المحمية</span>
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  activeTab === 'admin'
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>لوحة الإدارة</span>
              </button>
            </nav>

            {/* Realtime & Active Team Badges */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-xs font-semibold">
                <Radio className="w-3 h-3 animate-pulse" />
                <span className="hidden sm:inline">{isSupabaseConfigured ? 'سحابة Supabase متصلة' : 'تزامن لحظي نشط'}</span>
                <span className="sm:hidden">مباشر</span>
              </div>

              {activeTeam && (
                <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-brand-400" />
                  <span className="text-slate-200 font-bold">
                    {activeTeam.team_number ? `فريق ${activeTeam.team_number}` : 'فريقك'}
                  </span>
                  <button
                    onClick={logoutTeam}
                    className="text-slate-400 hover:text-rose-400 p-0.5"
                    title="تسجيل الخروج"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (App-like ergonomic navigation on phones) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#090d16]/95 backdrop-blur-lg border-t border-slate-800/90 px-3 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl text-[11px] font-semibold transition-all min-h-[46px] ${
            activeTab === 'register'
              ? 'text-brand-400 bg-brand-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserPlus className="w-5 h-5 mb-0.5" />
          <span>تسجيل فريق</span>
        </button>

        <button
          onClick={() => setActiveTab('booking')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl text-[11px] font-semibold transition-all min-h-[46px] ${
            activeTab === 'booking'
              ? 'text-brand-400 bg-brand-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>حجز المحمية</span>
        </button>

        <button
          onClick={() => setActiveTab('admin')}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2 rounded-xl text-[11px] font-semibold transition-all min-h-[46px] ${
            activeTab === 'admin'
              ? 'text-brand-400 bg-brand-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-5 h-5 mb-0.5" />
          <span>لوحة الإدارة</span>
        </button>
      </nav>
    </>
  );
};
