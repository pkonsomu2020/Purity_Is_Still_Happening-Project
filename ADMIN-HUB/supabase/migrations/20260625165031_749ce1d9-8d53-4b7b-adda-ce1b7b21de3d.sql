
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Past sessions
CREATE TABLE public.past_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  session_date DATE NOT NULL,
  description TEXT,
  poster_url TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.past_sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.past_sessions TO authenticated;
GRANT ALL ON public.past_sessions TO service_role;
ALTER TABLE public.past_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view past sessions" ON public.past_sessions FOR SELECT USING (true);
CREATE POLICY "Admins can insert past sessions" ON public.past_sessions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update past sessions" ON public.past_sessions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete past sessions" ON public.past_sessions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Upcoming sessions
CREATE TABLE public.upcoming_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  session_date DATE NOT NULL,
  description TEXT,
  poster_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.upcoming_sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.upcoming_sessions TO authenticated;
GRANT ALL ON public.upcoming_sessions TO service_role;
ALTER TABLE public.upcoming_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view upcoming sessions" ON public.upcoming_sessions FOR SELECT USING (true);
CREATE POLICY "Admins can insert upcoming sessions" ON public.upcoming_sessions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update upcoming sessions" ON public.upcoming_sessions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete upcoming sessions" ON public.upcoming_sessions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER set_past_sessions_updated_at BEFORE UPDATE ON public.past_sessions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER set_upcoming_sessions_updated_at BEFORE UPDATE ON public.upcoming_sessions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
