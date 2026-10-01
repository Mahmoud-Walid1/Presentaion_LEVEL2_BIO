import { STORAGE_KEYS, DEFAULT_MAX_SLOTS_PER_TEAM } from '../constants/defaults';
import { broadcastLocalChange, getStoredTeams, setStoredTeams } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const getGlobalMaxSlots = (): number => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GLOBAL_MAX_SLOTS);
    return raw ? parseInt(raw, 10) || DEFAULT_MAX_SLOTS_PER_TEAM : DEFAULT_MAX_SLOTS_PER_TEAM;
  } catch {
    return DEFAULT_MAX_SLOTS_PER_TEAM;
  }
};

export const setGlobalMaxSlots = (limit: number): void => {
  const safeLimit = Math.max(1, Math.min(10, limit));
  localStorage.setItem(STORAGE_KEYS.GLOBAL_MAX_SLOTS, safeLimit.toString());
  broadcastLocalChange('GLOBAL_MAX_SLOTS_UPDATED', safeLimit);
};

export const setTeamCustomLimit = async (
  teamId: string,
  limit: number | null
): Promise<boolean> => {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('teams')
        .update({ max_slots: limit })
        .eq('id', teamId);
      return true;
    } catch {
      return false;
    }
  }

  const teams = getStoredTeams();
  const team = teams.find((t) => t.id === teamId);
  if (!team) return false;

  team.max_slots = limit;
  setStoredTeams(teams);
  return true;
};
