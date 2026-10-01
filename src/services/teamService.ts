import { Team, TeamMember, CreateTeamPayload } from '../types/team';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getStoredTeams, setStoredTeams, getStoredSlots, setStoredSlots } from '../lib/storage';
import { getTeamCustomLimitsMap } from './settingsService';

export const generatePinCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createTeam = async (payload: CreateTeamPayload): Promise<{ success: boolean; team?: Team; message?: string }> => {
  const pin = generatePinCode();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: teamData, error: teamErr } = await supabase
        .from('teams')
        .insert([{ pin_code: pin }])
        .select()
        .single();

      if (teamErr) throw teamErr;

      const membersPayload = [
        {
          team_id: teamData.id,
          full_name: payload.leader_name.trim(),
          is_leader: true,
          member_order: 1,
        },
        ...payload.member_names.map((name, idx) => ({
          team_id: teamData.id,
          full_name: name.trim(),
          is_leader: false,
          member_order: idx + 2,
        })),
      ];

      const { data: membersData, error: memberErr } = await supabase
        .from('team_members')
        .insert(membersPayload)
        .select();

      if (memberErr) throw memberErr;

      return {
        success: true,
        team: { ...teamData, slot_numbers: [], members: membersData },
      };
    } catch (err: unknown) {
      const error = err as Error;
      return { success: false, message: error.message || 'فشل في حفظ بيانات الفريق' };
    }
  }

  // Fallback Local Storage Mode
  const teams = getStoredTeams();
  const newTeamId = `team-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const members: TeamMember[] = [
    {
      id: `m-1-${Date.now()}`,
      team_id: newTeamId,
      full_name: payload.leader_name.trim(),
      is_leader: true,
      member_order: 1,
    },
    ...payload.member_names.map((name, idx) => ({
      id: `m-${idx + 2}-${Date.now()}`,
      team_id: newTeamId,
      full_name: name.trim(),
      is_leader: false,
      member_order: idx + 2,
    })),
  ];

  const newTeam: Team = {
    id: newTeamId,
    pin_code: pin,
    slot_number: null,
    slot_numbers: [],
    created_at: new Date().toISOString(),
    members,
  };

  teams.push(newTeam);
  setStoredTeams(teams);

  return { success: true, team: newTeam };
};

export const getTeamByPin = async (pin: string): Promise<Team | null> => {
  const cleanPin = pin.trim();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: team, error } = await supabase
        .from('teams')
        .select('*, members:team_members(*)')
        .eq('pin_code', cleanPin)
        .single();
      if (error || !team) return null;

      // Enrich with booked slots from presentation_slots
      const { data: teamSlots } = await supabase
        .from('presentation_slots')
        .select('id, booked_at')
        .eq('team_id', team.id);

      const slotNumbers = teamSlots?.map((s) => s.id) || [];
      team.slot_numbers = slotNumbers;

      if (slotNumbers.length > 0 && !team.team_number) {
        // Calculate chronological team number
        const { data: allBookedSlots } = await supabase
          .from('presentation_slots')
          .select('team_id, booked_at')
          .not('team_id', 'is', null)
          .order('booked_at', { ascending: true });

        const uniqueTeamsOrdered: string[] = [];
        allBookedSlots?.forEach((s) => {
          if (s.team_id && !uniqueTeamsOrdered.includes(s.team_id)) {
            uniqueTeamsOrdered.push(s.team_id);
          }
        });

        const rank = uniqueTeamsOrdered.indexOf(team.id);
        if (rank !== -1) {
          team.team_number = rank + 1;
        }
      }

      const customLimits = getTeamCustomLimitsMap();
      if (customLimits[team.id] !== undefined) {
        team.max_slots = customLimits[team.id];
      }

      return team as Team;
    } catch {
      return null;
    }
  }

  const teams = getStoredTeams();
  return teams.find((t) => t.pin_code === cleanPin) || null;
};

export const getAllTeams = async (): Promise<Team[]> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*, members:team_members(*)')
        .order('created_at', { ascending: true });
      if (error) throw error;

      // Fetch all booked slots to map slot_numbers and compute team_number
      const { data: allSlots } = await supabase
        .from('presentation_slots')
        .select('id, team_id, booked_at')
        .not('team_id', 'is', null)
        .order('booked_at', { ascending: true });

      const uniqueTeamsChronological: string[] = [];
      allSlots?.forEach((s) => {
        if (s.team_id && !uniqueTeamsChronological.includes(s.team_id)) {
          uniqueTeamsChronological.push(s.team_id);
        }
      });

      const customLimits = getTeamCustomLimitsMap();

      return (data || []).map((t) => {
        const teamSlots = allSlots?.filter((s) => s.team_id === t.id).map((s) => s.id) || [];
        const rank = uniqueTeamsChronological.indexOf(t.id);
        return {
          ...t,
          slot_numbers: teamSlots,
          team_number: t.team_number || (rank !== -1 ? rank + 1 : null),
          max_slots: customLimits[t.id] !== undefined ? customLimits[t.id] : t.max_slots,
        };
      }) as Team[];
    } catch {
      return [];
    }
  }
  return getStoredTeams();
};

export const updateTeamMember = async (
  teamId: string,
  memberId: string,
  newName: string
): Promise<boolean> => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ full_name: newName.trim() })
        .eq('id', memberId);
      return !error;
    } catch {
      return false;
    }
  }

  const teams = getStoredTeams();
  const team = teams.find((t) => t.id === teamId);
  if (!team || !team.members) return false;
  const member = team.members.find((m) => m.id === memberId);
  if (member) {
    member.full_name = newName.trim();
    setStoredTeams(teams);
    return true;
  }
  return false;
};

export const deleteTeam = async (teamId: string): Promise<boolean> => {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('presentation_slots').update({ is_booked: false, team_id: null, booked_at: null }).eq('team_id', teamId);
      const { error } = await supabase.from('teams').delete().eq('id', teamId);
      return !error;
    } catch {
      return false;
    }
  }

  const teams = getStoredTeams();
  const slots = getStoredSlots();
  slots.forEach((s) => {
    if (s.team_id === teamId) {
      s.is_booked = false;
      s.team_id = null;
      s.booked_at = null;
    }
  });
  setStoredSlots(slots);

  const filtered = teams.filter((t) => t.id !== teamId);
  setStoredTeams(filtered);
  return true;
};
