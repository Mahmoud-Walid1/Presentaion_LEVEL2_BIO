export interface PresentationSlot {
  id: number; // 1 to 10
  title: string; // 'بريزنتيشن 1' ...
  is_booked: boolean;
  booked_at?: string | null;
  team_id?: string | null;
  team_name?: string;
  leader_name?: string;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  slot_number?: number;
}
