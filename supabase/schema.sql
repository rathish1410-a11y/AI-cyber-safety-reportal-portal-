-- ============================================================
-- CyberSafe India Portal — Complete Database Schema
-- SIH Problem Statement: SIH25183
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── STEP 1: Enable UUID extension ───────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── STEP 2: Create PROFILES table ───────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('admin', 'citizen')),
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── STEP 3: Create INCIDENTS table ──────────────────────────
CREATE TABLE IF NOT EXISTS public.incidents (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  incident_type         TEXT NOT NULL CHECK (incident_type IN ('phishing','fraud','hacking','harassment','identity_theft','malware','other')),
  severity              TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  description           TEXT NOT NULL,
  phone_number          TEXT,
  platform              TEXT,
  incident_date         DATE,
  financial_loss        TEXT,
  file_url              TEXT,
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_review','resolved')),
  ai_risk_score         INTEGER CHECK (ai_risk_score >= 0 AND ai_risk_score <= 100),
  ai_suggested_category TEXT,
  admin_notes           TEXT,
  location              TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── STEP 4: Create ALERTS table ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.alerts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  severity   TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── STEP 5: Create AI_ANALYSES table ────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id   UUID NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  risk_score    INTEGER,
  incident_type TEXT,
  severity      TEXT,
  reasoning     TEXT,
  keywords      TEXT[],
  recommendations TEXT[],
  confidence    INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── STEP 6: Auto-update updated_at trigger ──────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_incidents_updated_at
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER set_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── STEP 7: Auto-create profile on signup ───────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── STEP 8: Row Level Security (RLS) ────────────────────────
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (safe re-run)
DROP POLICY IF EXISTS "profiles_select_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own"   ON public.profiles;
DROP POLICY IF EXISTS "incidents_select_own"  ON public.incidents;
DROP POLICY IF EXISTS "incidents_select_admin" ON public.incidents;
DROP POLICY IF EXISTS "incidents_insert_own"  ON public.incidents;
DROP POLICY IF EXISTS "incidents_update_admin" ON public.incidents;
DROP POLICY IF EXISTS "alerts_select_active"  ON public.alerts;
DROP POLICY IF EXISTS "alerts_all_admin"      ON public.alerts;
DROP POLICY IF EXISTS "ai_analyses_own"       ON public.ai_analyses;

-- PROFILES policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- INCIDENTS policies
-- Citizens see only their own incidents
CREATE POLICY "incidents_select_own" ON public.incidents
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Citizens can report incidents
CREATE POLICY "incidents_insert_own" ON public.incidents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only admins can update incident status
CREATE POLICY "incidents_update_admin" ON public.incidents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ALERTS policies
-- All authenticated users can see active alerts
CREATE POLICY "alerts_select_active" ON public.alerts
  FOR SELECT USING (
    is_active = true
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can create/update/delete alerts
CREATE POLICY "alerts_all_admin" ON public.alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- AI analyses readable by owner or admin
CREATE POLICY "ai_analyses_own" ON public.ai_analyses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.incidents i
      WHERE i.id = incident_id
      AND (
        i.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      )
    )
  );

-- ─── STEP 9: Useful indexes for performance ───────────────────
CREATE INDEX IF NOT EXISTS idx_incidents_user_id    ON public.incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status     ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity   ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_is_active     ON public.alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at    ON public.alerts(created_at DESC);

-- ─── STEP 10: Seed admin account helper ──────────────────────
-- After creating your admin user via Supabase Auth,
-- run this to promote them to admin role:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-admin@email.com';

-- ============================================================
-- ✅ Schema complete! All tables, triggers, RLS, and indexes created.
-- ============================================================
