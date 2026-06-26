-- ============================================================
-- PISH — Purity Is Still Happening
-- Data Seed Script
-- Run this AFTER uploading the files to Supabase Storage
-- (see instructions below the SQL)
-- ============================================================
--
-- FILE UPLOAD CHECKLIST (do this first in Supabase Dashboard):
--
-- Storage → posters bucket → Upload file:
--   [x] Gurding_your_morning_season.png
--   [x] Enemy_within.png
--
-- Storage → recordings bucket → Upload file:
--   [x] GUARDING YOUR MORNING SEASON.mp3
--   [x] THE ENEMY WITHIN.mp3
--
-- ============================================================


-- ── Past Sessions ─────────────────────────────────────────────

INSERT INTO public.past_sessions
  (id, title, description, session_date, poster_url, recording_url)
VALUES
  (
    gen_random_uuid(),
    'Guarding Your Morning Season',
    'A powerful session on protecting your early season of life with purpose, discipline, and intentional living.',
    '2026-01-01',
    'https://uloklutvbspeqgulhdez.supabase.co/storage/v1/object/public/posters/Gurding_your_morning_season.png',
    'https://uloklutvbspeqgulhdez.supabase.co/storage/v1/object/public/recordings/GUARDING YOUR MORNING SEASON.mp3'
  ),
  (
    gen_random_uuid(),
    'The Enemy Within',
    'An honest look at the internal battles youth face — and how to overcome them through faith and self-awareness.',
    '2026-01-15',
    'https://uloklutvbspeqgulhdez.supabase.co/storage/v1/object/public/posters/Enemy_within.png',
    'https://uloklutvbspeqgulhdez.supabase.co/storage/v1/object/public/recordings/THE ENEMY WITHIN.mp3'
  );


-- ============================================================
-- DONE — 2 past sessions inserted.
-- ============================================================
