import { Team, TeamMember, CreateTeamPayload } from '../types/team';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getStoredTeams, setStoredTeams, getStoredSlots, setStoredSlots } from '../lib/storage';

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
        team: { ...teamData, members: membersData },
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
      return (data || []) as Team[];
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
      // Free slot if booked
      await supabase.from('presentation_slots').update({ is_booked: false, team_id: null, booked_at: null }).eq('team_id', teamId);
      const { error } = await supabase.from('teams').delete().eq('id', teamId);
      return !error;
    } catch {
      return false;
    }
  }

  const teams = getStoredTeams();
  const targetTeam = teams.find((t) => t.id === teamId);
  if (targetTeam?.slot_number) {
    const slots = getStoredSlots();
    const slot = slots.find((s) => s.id === targetTeam.slot_number);
    if (slot) {
      slot.is_booked = false;
      slot.team_id = null;
      slot.booked_at = null;
      setStoredSlots(slots);
    }
  }
  const filtered = teams.filter((t) => t.id !== teamId);
  setStoredTeams(filtered);
  return true;
};
