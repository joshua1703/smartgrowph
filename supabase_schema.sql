-- ============================================================================
-- SMARTGROW — SUPABASE POSTGRESQL SCHEMA & CLERK AUTH INTEGRATION
-- ============================================================================
-- Target Database: Supabase PostgreSQL (Postgres 15+)
-- Auth Provider: Clerk Authentication (Google OAuth)
-- Features: Tables, Helper Functions, RLS Policies, Indexes, Complete Seed Data
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. CORE TABLES (Created first so functions & foreign keys resolve cleanly)
-- ============================================================================

-- A. USERS / PROFILES TABLE (Synced with Clerk)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY, -- Clerk User ID (e.g. 'user_2xyz...') or System ID
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer', 'technician')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  avatar TEXT,
  avatar_gradient TEXT DEFAULT 'from-emerald-500 to-teal-600',
  zone TEXT DEFAULT 'Zone A',
  last_active TIMESTAMPTZ DEFAULT now(),
  sessions_today INTEGER NOT NULL DEFAULT 1,
  actions_this_week INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- B. SENSOR READINGS (DHT22 & IoT Telemetry from ESP32)
CREATE TABLE IF NOT EXISTS public.sensor_readings (
  id TEXT PRIMARY KEY, -- e.g. 'SR-00001' or UUID
  sensor_id TEXT NOT NULL,
  sensor_name TEXT NOT NULL,
  zone TEXT NOT NULL,
  temperature NUMERIC(5,2) NOT NULL,    -- °C
  humidity NUMERIC(5,2) NOT NULL,       -- % RH
  soil_moisture NUMERIC(5,2) NOT NULL,  -- %
  co2_level INTEGER NOT NULL,           -- ppm
  light_intensity INTEGER NOT NULL,     -- lux
  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- C. GROWTH BATCHES (Oyster Mushroom Cultivation Batches)
CREATE TABLE IF NOT EXISTS public.growth_batches (
  id TEXT PRIMARY KEY, -- e.g. 'BATCH-001'
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  batch_name TEXT NOT NULL,
  substrate TEXT NOT NULL,
  variety TEXT NOT NULL,
  zone TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_stage TEXT NOT NULL DEFAULT 'inoculation' 
    CHECK (current_stage IN ('inoculation', 'incubation', 'primordia', 'fruiting', 'harvest', 'completed')),
  days_since_start INTEGER NOT NULL DEFAULT 0,
  estimated_harvest_date TIMESTAMPTZ,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  yield INTEGER, -- grams, null if not yet harvested
  expected_yield INTEGER NOT NULL DEFAULT 1000,
  health_score INTEGER NOT NULL DEFAULT 90 CHECK (health_score >= 0 AND health_score <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- D. DAILY GROWTH LOGS (Batch Monitoring Metrics)
CREATE TABLE IF NOT EXISTS public.daily_growth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT NOT NULL REFERENCES public.growth_batches(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  height NUMERIC(5,2) NOT NULL DEFAULT 0,        -- cm
  cap_diameter NUMERIC(5,2) NOT NULL DEFAULT 0,  -- cm
  primordia_density INTEGER NOT NULL DEFAULT 0,  -- pins per cluster
  moisture_level NUMERIC(5,2) NOT NULL DEFAULT 0,-- %
  contamination BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- E. ACTUATORS (Hardware Device States)
CREATE TABLE IF NOT EXISTS public.actuators (
  id TEXT PRIMARY KEY, -- e.g. 'FAN-01', 'FOG-01', 'SPR-01', 'LED-01'
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fan', 'fogger', 'sprinkler', 'led')),
  zone TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'error', 'maintenance')),
  watt_base INTEGER NOT NULL DEFAULT 45,
  last_toggled_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- F. ACTUATOR LOGS (Operational Events & Telemetry)
CREATE TABLE IF NOT EXISTS public.actuator_logs (
  id TEXT PRIMARY KEY, -- e.g. 'AL-00001' or UUID
  actuator_id TEXT NOT NULL,
  actuator_name TEXT NOT NULL,
  actuator_type TEXT NOT NULL CHECK (actuator_type IN ('fan', 'fogger', 'sprinkler', 'led')),
  zone TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('activated', 'deactivated', 'error', 'maintenance')),
  trigger TEXT NOT NULL CHECK (trigger IN ('auto', 'manual', 'schedule', 'emergency')),
  duration INTEGER, -- minutes
  reason TEXT NOT NULL,
  power_consumption INTEGER NOT NULL DEFAULT 0, -- watts
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- G. DEVICE AUTOMATIONS (Threshold-based Trigger Rules)
CREATE TABLE IF NOT EXISTS public.device_automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  device TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  operator TEXT NOT NULL CHECK (operator IN ('>', '<', '>=', '<=', '==')),
  threshold NUMERIC(6,2) NOT NULL,
  action TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- H. DEVICE SCHEDULES (Scheduled Device Timers)
CREATE TABLE IF NOT EXISTS public.device_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  device TEXT NOT NULL,
  start_time TEXT NOT NULL, -- e.g. '08:00'
  end_time TEXT NOT NULL,   -- e.g. '18:00'
  days TEXT[] NOT NULL DEFAULT ARRAY['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- I. SYSTEM SETTINGS (Greenhouse Climate Setpoints)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  auto_mode BOOLEAN NOT NULL DEFAULT true,
  temp_target NUMERIC(5,2) NOT NULL DEFAULT 26.0,
  humidity_target NUMERIC(5,2) NOT NULL DEFAULT 88.0,
  co2_threshold INTEGER NOT NULL DEFAULT 600,
  email_alerts BOOLEAN NOT NULL DEFAULT true,
  push_alerts BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 3. CLERK JWT & AUTH HELPER FUNCTIONS (Defined after tables exist)
-- ============================================================================

-- Extracts the Clerk User ID ('user_xxx') from auth headers / JWT
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(
    COALESCE(
      auth.jwt() ->> 'sub',
      (current_setting('request.jwt.claims', true)::jsonb) ->> 'sub'
    ),
    ''
  );
$$;

-- Helper function to check if caller is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = public.requesting_user_id()
    AND role = 'admin'
    AND status = 'active'
  );
$$;

-- ============================================================================
-- 4. PERFORMANCE INDEXES (Supabase Postgres Best Practices)
-- ============================================================================

-- Users Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users (status);

-- Sensor Readings
CREATE INDEX IF NOT EXISTS idx_sensor_readings_created_at ON public.sensor_readings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_zone_created ON public.sensor_readings (zone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_created ON public.sensor_readings (sensor_id, created_at DESC);

-- Growth Batches
CREATE INDEX IF NOT EXISTS idx_growth_batches_user_id ON public.growth_batches (user_id);
CREATE INDEX IF NOT EXISTS idx_growth_batches_zone ON public.growth_batches (zone);
CREATE INDEX IF NOT EXISTS idx_growth_batches_stage ON public.growth_batches (current_stage);

-- Daily Growth Logs
CREATE INDEX IF NOT EXISTS idx_daily_growth_logs_batch_date ON public.daily_growth_logs (batch_id, date DESC);

-- Actuator Logs
CREATE INDEX IF NOT EXISTS idx_actuator_logs_created_at ON public.actuator_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_actuator_logs_actuator_created ON public.actuator_logs (actuator_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_actuator_logs_zone ON public.actuator_logs (zone);

-- Automations & Schedules
CREATE INDEX IF NOT EXISTS idx_device_automations_user_id ON public.device_automations (user_id);
CREATE INDEX IF NOT EXISTS idx_device_schedules_user_id ON public.device_schedules (user_id);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_growth_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actuators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.actuator_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Users can view all system users" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user creation on sign-up" ON public.users;
DROP POLICY IF EXISTS "Allow user profile sync" ON public.users;

DROP POLICY IF EXISTS "Anyone authenticated can view sensor readings" ON public.sensor_readings;
DROP POLICY IF EXISTS "Allow sensor telemetry insertion" ON public.sensor_readings;

DROP POLICY IF EXISTS "View growth batches" ON public.growth_batches;
DROP POLICY IF EXISTS "Authenticated users can create batches" ON public.growth_batches;
DROP POLICY IF EXISTS "Users or Admins can update batches" ON public.growth_batches;
DROP POLICY IF EXISTS "Users or Admins can delete batches" ON public.growth_batches;

DROP POLICY IF EXISTS "View daily growth logs" ON public.daily_growth_logs;
DROP POLICY IF EXISTS "Authenticated users can insert daily growth logs" ON public.daily_growth_logs;
DROP POLICY IF EXISTS "Authenticated users can update daily growth logs" ON public.daily_growth_logs;

DROP POLICY IF EXISTS "View actuators" ON public.actuators;
DROP POLICY IF EXISTS "Control actuators" ON public.actuators;

DROP POLICY IF EXISTS "View actuator logs" ON public.actuator_logs;
DROP POLICY IF EXISTS "Insert actuator logs" ON public.actuator_logs;

DROP POLICY IF EXISTS "View automations" ON public.device_automations;
DROP POLICY IF EXISTS "Manage automations" ON public.device_automations;

DROP POLICY IF EXISTS "View schedules" ON public.device_schedules;
DROP POLICY IF EXISTS "Manage schedules" ON public.device_schedules;

DROP POLICY IF EXISTS "View system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Update system settings" ON public.system_settings;

-- ----------------------------------------------------------------------------
-- USERS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view all system users" ON public.users
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Allow user profile sync" ON public.users
  FOR ALL TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- SENSOR READINGS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone authenticated can view sensor readings" ON public.sensor_readings
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Allow sensor telemetry insertion" ON public.sensor_readings
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- GROWTH BATCHES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "View growth batches" ON public.growth_batches
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create batches" ON public.growth_batches
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users or Admins can update batches" ON public.growth_batches
  FOR UPDATE TO authenticated
  USING (user_id = public.requesting_user_id() OR public.is_admin() OR user_id IS NULL)
  WITH CHECK (user_id = public.requesting_user_id() OR public.is_admin() OR user_id IS NULL);

CREATE POLICY "Users or Admins can delete batches" ON public.growth_batches
  FOR DELETE TO authenticated
  USING (user_id = public.requesting_user_id() OR public.is_admin() OR user_id IS NULL);

-- ----------------------------------------------------------------------------
-- DAILY GROWTH LOGS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "View daily growth logs" ON public.daily_growth_logs
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert daily growth logs" ON public.daily_growth_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update daily growth logs" ON public.daily_growth_logs
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- ACTUATORS & ACTUATOR LOGS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "View actuators" ON public.actuators
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Control actuators" ON public.actuators
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- ACTUATOR LOGS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "View actuator logs" ON public.actuator_logs
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Insert actuator logs" ON public.actuator_logs
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- AUTOMATIONS & SCHEDULES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "View automations" ON public.device_automations
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Manage automations" ON public.device_automations
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "View schedules" ON public.device_schedules
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Manage schedules" ON public.device_schedules
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- SYSTEM SETTINGS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "View system settings" ON public.system_settings
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "Update system settings" ON public.system_settings
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 6. DATA API PERMISSION GRANTS
-- ============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- ============================================================================
-- 7. INITIAL CONFIGURATION (Default hardware definitions & system defaults)
-- ============================================================================

-- A. Default System Settings
INSERT INTO public.system_settings (id, auto_mode, temp_target, humidity_target, co2_threshold, email_alerts, push_alerts)
VALUES ('default', true, 26.0, 88.0, 600, true, true)
ON CONFLICT (id) DO UPDATE SET
  temp_target = EXCLUDED.temp_target,
  humidity_target = EXCLUDED.humidity_target;

-- B. Default Actuator Hardware Definitions (Hardware pin mappings)
INSERT INTO public.actuators (id, name, type, zone, is_active, status, watt_base)
VALUES
  ('FAN-01', 'Exhaust Fan A', 'fan', 'Zone A', false, 'normal', 45),
  ('FAN-02', 'Exhaust Fan B', 'fan', 'Zone B', false, 'normal', 45),
  ('FOG-01', 'Fogger Unit 1', 'fogger', 'Zone A', false, 'normal', 35),
  ('FOG-02', 'Fogger Unit 2', 'fogger', 'Zone C', false, 'normal', 35),
  ('SPR-01', 'Sprinkler System', 'sprinkler', 'Zone D', false, 'normal', 60),
  ('LED-01', 'LED Grow Light A', 'led', 'Zone A', false, 'normal', 120),
  ('LED-02', 'LED Grow Light B', 'led', 'Zone B', false, 'normal', 120)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- OPTIONAL: RUN THIS TO PURGE ANY EXISTING DUMMY DATA FROM PREVIOUS RUNS
-- ============================================================================
-- TRUNCATE TABLE public.sensor_readings CASCADE;
-- TRUNCATE TABLE public.growth_batches CASCADE;
-- TRUNCATE TABLE public.daily_growth_logs CASCADE;
-- TRUNCATE TABLE public.actuator_logs CASCADE;
-- TRUNCATE TABLE public.device_automations CASCADE;
-- TRUNCATE TABLE public.device_schedules CASCADE;