export interface TeamMember {
  id: string;
  team_id?: string;
  full_name: string;
  is_leader: boolean;
  member_order: number;
}

export interface Team {
  id: string;
  pin_code: string;
  slot_number: number | null;
  team_number?: number | null; // رقم الفريق حسب أسبقية الحجز (تيم 1، تيم 2 ...)
  booked_at?: string | null;
  created_at: string;
  members?: TeamMember[];
}

export interface CreateTeamPayload {
  leader_name: string;
  member_names: string[];
}
