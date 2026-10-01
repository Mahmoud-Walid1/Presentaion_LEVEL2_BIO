import { PresentationSlot, BookingResponse } from '../types/slot';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getStoredSlots, setStoredSlots, getStoredTeams, setStoredTeams } from '../lib/storage';
import { INITIAL_SLOTS } from '../constants/defaults';
import { getGlobalMaxSlots, getTeamCustomLimitsMap } from './settingsService';

export const getAllSlots = async (): Promise<PresentationSlot[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('presentation_slots')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return (data || []) as PresentationSlot[];
    } catch {
      return getStoredSlots();
    }
  }
  return getStoredSlots();
};

export const bookSlot = async (
  teamId: string,
  slotNumber: number
): Promise<BookingResponse> => {
  const timestamp = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Fetch team info
      const { data: teamData, error: teamErr } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamErr || !teamData) {
        return { success: false, message: 'الفريق غير موجود بالنظام' };
      }

      // 2. Check team current booked slots count directly from presentation_slots
      const { data: teamCurrentSlots } = await supabase
        .from('presentation_slots')
        .select('id')
        .eq('team_id', teamId);

      const currentCount = teamCurrentSlots?.length || 0;
      const customLimits = getTeamCustomLimitsMap();
      const allowedLimit = customLimits[teamId] ?? teamData.max_slots ?? getGlobalMaxSlots();

      if (currentCount >= allowedLimit) {
        return {
          success: false,
          message: `فريقكم وصل للحد الأقصى المسموح به (${allowedLimit} محميات)`,
        };
      }

      // 3. Check if target slot is already booked
      const { data: targetSlot } = await supabase
        .from('presentation_slots')
        .select('*')
        .eq('id', slotNumber)
        .single();

      if (targetSlot?.is_booked && targetSlot.team_id !== teamId) {
        return { success: false, message: 'عذراً، هذه المحمية تم حجزها للتو من فريق آخر' };
      }

      // 4. Update the presentation_slot (Source of Truth)
      const { error: slotUpdateErr } = await supabase
        .from('presentation_slots')
        .update({ is_booked: true, team_id: teamId, booked_at: timestamp })
        .eq('id', slotNumber);

      if (slotUpdateErr) {
        return { success: false, message: slotUpdateErr.message || 'فشل في حجز المحمية' };
      }

      const remainingSlots = allowedLimit - (currentCount + 1);

      return {
        success: true,
        message: remainingSlots > 0
          ? `تم حجز المحمية بنجاح! متبقي لفريقكم حجز ${remainingSlots} محمية إضافية.`
          : `تم تأكيد حجز المحمية! اكتملت الحصص المخصصة لفريقكم (${allowedLimit} محميات).`,
        slot_number: slotNumber,
      };
    } catch (err: unknown) {
      const error = err as Error;
      return { success: false, message: error.message || 'فشل في إتمام عملية الحجز' };
    }
  }

  // Local storage atomic multi-booking
  const slots = getStoredSlots();
  const teams = getStoredTeams();

  const team = teams.find((t) => t.id === teamId);
  if (!team) {
    return { success: false, message: 'الفريق غير موجود بالنظام' };
  }

  const currentSlots = slots.filter((s) => s.team_id === teamId);
  const allowedLimit = team.max_slots || getGlobalMaxSlots();

  if (currentSlots.length >= allowedLimit) {
    return {
      success: false,
      message: `فريقكم وصل للحد الأقصى المسموح به (${allowedLimit} محميات)`,
    };
  }

  const slot = slots.find((s) => s.id === slotNumber);
  if (!slot) {
    return { success: false, message: 'المحمية المحددة غير صالحة' };
  }

  if (slot.is_booked && slot.team_id !== teamId) {
    return { success: false, message: 'عذراً، هذه المحمية تم حجزها للتو' };
  }

  // Assign team number if this is their first booking
  if (!team.team_number) {
    const teamsWithNumber = teams.filter((t) => t.team_number !== null && t.team_number !== undefined);
    team.team_number = teamsWithNumber.length + 1;
    team.booked_at = timestamp;
  }

  slot.is_booked = true;
  slot.team_id = teamId;
  slot.booked_at = timestamp;

  if (!team.slot_numbers) team.slot_numbers = [];
  if (!team.slot_numbers.includes(slotNumber)) {
    team.slot_numbers.push(slotNumber);
  }
  team.slot_number = slotNumber;

  setStoredSlots(slots);
  setStoredTeams(teams);

  const remaining = allowedLimit - (currentSlots.length + 1);

  return {
    success: true,
    message: remaining > 0
      ? `تم حجز المحمية بنجاح! متبقي لفريقكم حجز ${remaining} محمية إضافية.`
      : `تم تأكيد حجز المحمية! اكتملت الحصص المخصصة لفريقكم (${allowedLimit} محميات).`,
    slot_number: slotNumber,
  };
};

export const releaseSlot = async (slotNumber: number): Promise<boolean> => {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('presentation_slots')
        .update({ is_booked: false, team_id: null, booked_at: null })
        .eq('id', slotNumber);

      return true;
    } catch {
      return false;
    }
  }

  const slots = getStoredSlots();
  const teams = getStoredTeams();
  const slot = slots.find((s) => s.id === slotNumber);
  if (!slot) return false;

  if (slot.team_id) {
    const team = teams.find((t) => t.id === slot.team_id);
    if (team?.slot_numbers) {
      team.slot_numbers = team.slot_numbers.filter((n) => n !== slotNumber);
      team.slot_number = team.slot_numbers[0] || null;
    }
  }

  slot.is_booked = false;
  slot.team_id = null;
  slot.booked_at = null;

  setStoredSlots(slots);
  setStoredTeams(teams);
  return true;
};

export const resetAllData = async (): Promise<boolean> => {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('presentation_slots').update({ is_booked: false, team_id: null, booked_at: null }).neq('id', 0);
      return true;
    } catch {
      return false;
    }
  }

  setStoredTeams([]);
  setStoredSlots(INITIAL_SLOTS);
  return true;
};
