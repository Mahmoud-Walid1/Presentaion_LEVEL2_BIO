import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_URL = 'https://rqovncasebxriywrnlih.supabase.co';
const DEFAULT_ANON_KEY = 'sb_publishable_yyzTNjc0TJiYG1Pv0_k6Ig_XX2_v040';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  DEFAULT_URL;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  DEFAULT_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl.trim() &&
  supabaseAnonKey.trim() &&
  !supabaseUrl.includes('placeholder')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl.trim(), supabaseAnonKey.trim())
  : null;
