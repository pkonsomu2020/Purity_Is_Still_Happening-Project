-- ============================================================
-- PISH — Purity Is Still Happening
-- Supabase Database Setup Script
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================


-- ============================================================
-- SECTION 1: EXTENSIONS
-- ============================================================

-- UUID generation for primary keys
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- SECTION 2: TABLES
-- ============================================================

-- ── past_sessions ────────────────────────────────────────────
-- Completed sessions with recordings and posters.

CREATE TABLE IF NOT EXISTS public.past_sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  description   TEXT,
  session_date  DATE        NOT NULL,
  poster_url    TEXT,
  recording_url TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.past_sessions IS
  'Completed PISH sessions with optional poster images and audio recordings.';

-- ── upcoming_sessions ────────────────────────────────────────
-- Announced future sessions (no recording yet).

CREATE TABLE IF NOT EXISTS public.upcoming_sessions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT        NOT NULL,
  description  TEXT,
  session_date DATE        NOT NULL,
  poster_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.upcoming_sessions IS
  'Upcoming PISH sessions that have been announced but not yet held.';

-- ── user_roles ───────────────────────────────────────────────
-- Maps authenticated users to their role (admin or user).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

COMMENT ON TABLE public.user_roles IS
  'Stores the role (admin/user) for each authenticated Supabase user.';


-- ============================================================
-- SECTION 3: AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_past_sessions_updated_at
  BEFORE UPDATE ON public.past_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_upcoming_sessions_updated_at
  BEFORE UPDATE ON public.upcoming_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- ============================================================
-- SECTION 4: HELPER FUNCTION — has_role
-- ============================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role    = _role
  );
$$;


-- ============================================================
-- SECTION 5: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.past_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upcoming_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles        ENABLE ROW LEVEL SECURITY;

-- ── past_sessions policies ───────────────────────────────────

-- Anyone (including anonymous visitors) can read past sessions
CREATE POLICY "Public can read past_sessions"
  ON public.past_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can insert
CREATE POLICY "Admins can insert past_sessions"
  ON public.past_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update past_sessions"
  ON public.past_sessions
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete past_sessions"
  ON public.past_sessions
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ── upcoming_sessions policies ───────────────────────────────

CREATE POLICY "Public can read upcoming_sessions"
  ON public.upcoming_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert upcoming_sessions"
  ON public.upcoming_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update upcoming_sessions"
  ON public.upcoming_sessions
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete upcoming_sessions"
  ON public.upcoming_sessions
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ── user_roles policies ──────────────────────────────────────

-- Users can only read their own role
CREATE POLICY "Users can read own role"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only admins can manage roles
CREATE POLICY "Admins can manage user_roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));


-- ============================================================
-- SECTION 6: STORAGE BUCKETS
-- ============================================================

-- Create the 'posters' bucket (public — anyone can view images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('posters', 'posters', true)
ON CONFLICT (id) DO NOTHING;

-- Create the 'recordings' bucket (public — anyone can stream/download)
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', true)
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS policies ─────────────────────────────────────

-- Anyone can view files in posters bucket
CREATE POLICY "Public can view posters"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'posters');

-- Only admins can upload posters
CREATE POLICY "Admins can upload posters"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'posters'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Only admins can delete posters
CREATE POLICY "Admins can delete posters"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'posters'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Anyone can view files in recordings bucket
CREATE POLICY "Public can view recordings"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'recordings');

-- Only admins can upload recordings
CREATE POLICY "Admins can upload recordings"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'recordings'
    AND public.has_role(auth.uid(), 'admin')
  );

-- Only admins can delete recordings
CREATE POLICY "Admins can delete recordings"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'recordings'
    AND public.has_role(auth.uid(), 'admin')
  );


-- ============================================================
-- SECTION 7: REALTIME
-- Enable realtime subscriptions for the user website
-- so new uploads appear instantly without a page refresh.
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.past_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.upcoming_sessions;


-- ============================================================
-- SECTION 8: ADMIN USER
-- ============================================================
-- STEP 1 — This script creates the admin role assignment.
-- STEP 2 — You must FIRST create the user account via:
--           Supabase Dashboard → Authentication → Users → Add User
--           Email:    admin@pish.org
--           Password: PISH@2026!
-- STEP 3 — Then run the INSERT below (it will find the user by email).

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'admin@pish.org'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';


-- ============================================================
-- DONE
-- ============================================================
-- Tables:   past_sessions, upcoming_sessions, user_roles
-- Storage:  posters (public), recordings (public)
-- Auth:     RLS enabled — public read, admin-only write
-- Realtime: enabled on past_sessions and upcoming_sessions
-- ============================================================
