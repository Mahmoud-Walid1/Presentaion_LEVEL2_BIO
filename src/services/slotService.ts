import { PresentationSlot, BookingResponse } from '../types/slot';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getStoredSlots, setStoredSlots, getStoredTeams, setStoredTeams } from '../lib/storage';
import { INITIAL_SLOTS } from '../constants/defaults';

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
      const { data, error } = await supabase.rpc('book_presentation_slot', {
        p_team_id: teamId,
        p_slot_number: slotNumber,
      });

      if (error) {
        // Direct fallback query
        const { count } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true })
          .not('slot_number', 'is', null);

        const teamNumber = (count || 0) + 1;

        await supabase
          .from('presentation_slots')
          .update({ is_booked: true, team_id: teamId, booked_at: timestamp })
          .eq('id', slotNumber);

        await supabase
          .from('teams')
          .update({ slot_number: slotNumber, team_number: teamNumber, booked_at: timestamp })
          .eq('id', teamId);

        return {
          success: true,
          message: `تم تأكيد الحجز بنجاح! أصبحتم رسمياً: تيم ${teamNumber}`,
          slot_number: slotNumber,
        };
      }

      return data as BookingResponse;
    } catch (err: unknown) {
      const error = err as Error;
      return { success: false, message: error.message || 'فشل في إتمام عملية الحجز' };
    }
  }

  // Local storage atomic booking
  const slots = getStoredSlots();
  const teams = getStoredTeams();

  const team = teams.find((t) => t.id === teamId);
  if (!team) {
    return { success: false, message: 'الفريق غير موجود بالنظام' };
  }

  if (team.slot_number) {
    return { success: false, message: 'الفريق قام بحجز موضوع مسبقاً' };
  }

  const slot = slots.find((s) => s.id === slotNumber);
  if (!slot) {
    return { success: false, message: 'المحمية المحددة غير صالحة' };
  }

  if (slot.is_booked) {
    return { success: false, message: 'عذراً، هذه المحمية تم حجزها للتو' };
  }

  // Calculate chronological team number based on previous bookings
  const bookedTeamsCount = teams.filter((t) => t.slot_number !== null).length;
  const assignedTeamNumber = bookedTeamsCount + 1;

  slot.is_booked = true;
  slot.team_id = teamId;
  slot.booked_at = timestamp;

  team.slot_number = slotNumber;
  team.team_number = assignedTeamNumber;
  team.booked_at = timestamp;

  setStoredSlots(slots);
  setStoredTeams(teams);

  return {
    success: true,
    message: `تم تأكيد الحجز بنجاح! أصبحتم رسمياً: تيم ${assignedTeamNumber}`,
    slot_number: slotNumber,
  };
};

export const releaseSlot = async (slotNumber: number): Promise<boolean> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: slot } = await supabase
        .from('presentation_slots')
        .select('team_id')
        .eq('id', slotNumber)
        .single();

      if (slot?.team_id) {
        await supabase
          .from('teams')
          .update({ slot_number: null, team_number: null, booked_at: null })
          .eq('id', slot.team_id);
      }

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
    if (team) {
      team.slot_number = null;
      team.team_number = null;
      team.booked_at = null;
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
