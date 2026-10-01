import { Team } from '../types/team';
import { PresentationSlot } from '../types/slot';
import { INITIAL_SLOTS, STORAGE_KEYS } from '../constants/defaults';

const syncChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('presentation_sync_bus')
  : null;

export const broadcastLocalChange = (type: string, payload?: unknown) => {
  try {
    syncChannel?.postMessage({ type, payload, timestamp: Date.now() });
  } catch (err) {
    console.warn('Failed to broadcast change', err);
  }
};

export const subscribeToLocalSync = (callback: (data: { type: string; payload?: unknown }) => void) => {
  if (!syncChannel) return () => {};
  const handler = (event: MessageEvent) => {
    if (event.data?.type) callback(event.data);
  };
  syncChannel.addEventListener('message', handler);
  return () => syncChannel.removeEventListener('message', handler);
};

export const getStoredTeams = (): Team[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const setStoredTeams = (teams: Team[]) => {
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  broadcastLocalChange('TEAMS_UPDATED', teams);
};

export const getStoredSlots = (): PresentationSlot[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SLOTS);
    return raw ? JSON.parse(raw) : INITIAL_SLOTS;
  } catch {
    return INITIAL_SLOTS;
  }
};

export const setStoredSlots = (slots: PresentationSlot[]) => {
  localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
  broadcastLocalChange('SLOTS_UPDATED', slots);
};
