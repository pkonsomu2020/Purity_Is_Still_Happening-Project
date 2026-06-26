import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Shared DB types ──────────────────────────────────────────────────────────

export type PastSession = {
  id: string;
  title: string;
  description: string | null;
  session_date: string;       // "YYYY-MM-DD"
  poster_url: string | null;
  recording_url: string | null;
  created_at: string;
  updated_at: string;
};

export type UpcomingSession = {
  id: string;
  title: string;
  description: string | null;
  session_date: string;       // "YYYY-MM-DD"
  poster_url: string | null;
  created_at: string;
  updated_at: string;
};
