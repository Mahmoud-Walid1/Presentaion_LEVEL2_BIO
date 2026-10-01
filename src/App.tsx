import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { RegistrationView } from './components/registration/RegistrationView';
import { BookingView } from './components/booking/BookingView';
import { AdminView } from './components/admin/AdminView';
import { Toast } from './components/common/Toast';

const AppContent: React.FC = () => {
  const { activeTab, toast, hideToast } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-brand-500 selection:text-white">
      <Navbar />

      <main className="flex-1 w-full pb-16">
        {activeTab === 'register' && <RegistrationView />}
        {activeTab === 'booking' && <BookingView />}
        {activeTab === 'admin' && <AdminView />}
      </main>

      <Footer />
      <Toast toast={toast} onClose={hideToast} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
