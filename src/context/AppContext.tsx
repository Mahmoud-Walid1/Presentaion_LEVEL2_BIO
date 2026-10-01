import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PresentationSlot } from '../types/slot';
import { Team } from '../types/team';
import { ActiveTab, ToastMessage } from '../types/state';
import { getAllSlots } from '../services/slotService';
import { getAllTeams, getTeamByPin } from '../services/teamService';
import { getGlobalMaxSlots, setGlobalMaxSlots, setTeamCustomLimit } from '../services/settingsService';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { subscribeToLocalSync } from '../lib/storage';
import { STORAGE_KEYS } from '../constants/defaults';

interface AppContextValue {
  slots: PresentationSlot[];
  teams: Team[];
  activeTeam: Team | null;
  activeTab: ActiveTab;
  isAdmin: boolean;
  isLoading: boolean;
  globalMaxSlots: number;
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  setActiveTeam: (team: Team | null) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setIsAdmin: (status: boolean) => void;
  updateGlobalMaxSlots: (limit: number) => void;
  updateTeamMaxSlots: (teamId: string, limit: number | null) => Promise<boolean>;
  refreshData: () => Promise<void>;
  authenticateByPin: (pin: string) => Promise<boolean>;
  logoutTeam: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [slots, setSlots] = useState<PresentationSlot[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('register');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN) === 'true';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [globalMaxSlots, setGlobalMaxSlotsState] = useState<number>(() => getGlobalMaxSlots());
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ id: `${Date.now()}`, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const updateGlobalMaxSlots = useCallback((limit: number) => {
    setGlobalMaxSlots(limit);
    setGlobalMaxSlotsState(limit);
    showToast(`تم تغيير الحد الأقصى للحجز إلى ${limit} محميات لكل فريق`, 'success');
  }, [showToast]);

  const updateTeamMaxSlots = useCallback(async (teamId: string, limit: number | null) => {
    const success = await setTeamCustomLimit(teamId, limit);
    if (success) {
      await refreshData();
      showToast('تم تحديث حد المحميات المخصص للفريق بنجاح', 'success');
      return true;
    }
    showToast('فشل تعديل حد الفريق', 'error');
    return false;
  }, [showToast]);

  const refreshData = useCallback(async () => {
    try {
      const [fetchedSlots, fetchedTeams] = await Promise.all([
        getAllSlots(),
        getAllTeams(),
      ]);
      setSlots(fetchedSlots);
      setTeams(fetchedTeams);
      setGlobalMaxSlotsState(getGlobalMaxSlots());

      // If active team exists, update its reference
      if (activeTeam) {
        const updated = fetchedTeams.find((t) => t.id === activeTeam.id);
        if (updated) setActiveTeam(updated);
      }
    } catch (err) {
      console.error('Error refreshing app data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTeam]);

  const authenticateByPin = async (pin: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const team = await getTeamByPin(pin);
      if (team) {
        setActiveTeam(team);
        localStorage.setItem(STORAGE_KEYS.ACTIVE_TEAM_PIN, pin);
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logoutTeam = () => {
    setActiveTeam(null);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TEAM_PIN);
  };

  useEffect(() => {
    const savedPin = localStorage.getItem(STORAGE_KEYS.ACTIVE_TEAM_PIN);
    if (savedPin) {
      authenticateByPin(savedPin);
    }
    refreshData();
  }, []);

  // Real-time listener: Supabase or Local Broadcast Channel
  useEffect(() => {
    const unsubLocal = subscribeToLocalSync((data) => {
      if (data.type === 'GLOBAL_MAX_SLOTS_UPDATED') {
        setGlobalMaxSlotsState(data.payload as number);
      }
      refreshData();
    });

    let channel: RealtimeChannel | null = null;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          () => {
            refreshData();
          }
        )
        .subscribe();
    }

    return () => {
      unsubLocal();
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [refreshData]);

  const handleSetIsAdmin = (status: boolean) => {
    setIsAdmin(status);
    if (status) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, 'true');
    } else {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
    }
  };

  return (
    <AppContext.Provider
      value={{
        slots,
        teams,
        activeTeam,
        activeTab,
        isAdmin,
        isLoading,
        globalMaxSlots,
        toast,
        showToast,
        hideToast,
        setActiveTeam,
        setActiveTab,
        setIsAdmin: handleSetIsAdmin,
        updateGlobalMaxSlots,
        updateTeamMaxSlots,
        refreshData,
        authenticateByPin,
        logoutTeam,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
