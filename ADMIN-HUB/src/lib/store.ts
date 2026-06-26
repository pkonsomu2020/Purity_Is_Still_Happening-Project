/**
 * All data operations go through Supabase.
 * No localStorage is used for session data.
 *
 * Tables used (already exist in Supabase):
 *   past_sessions     — completed sessions with recordings
 *   upcoming_sessions — announced future sessions
 *
 * Storage buckets (create these in Supabase dashboard):
 *   posters    — session poster images (public)
 *   recordings — audio files (public)
 */
export { supabase } from "@/integrations/supabase/client";
