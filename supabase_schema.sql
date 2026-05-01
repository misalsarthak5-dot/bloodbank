-- ============================================
-- Blood Bank System - Supabase PostgreSQL Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  password_hash TEXT,
  blood_group TEXT,
  role TEXT DEFAULT 'user',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  city TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. ADMINS
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('hospital_admin', 'ngo_admin', 'super_admin')),
  is_super_admin BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. HOSPITALS
-- ============================================
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  phone TEXT,
  email TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  reliability_score INTEGER DEFAULT 100,
  total_updates INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. BLOOD_INVENTORY
-- ============================================
CREATE TABLE IF NOT EXISTS blood_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  blood_group TEXT NOT NULL,
  units_available INTEGER DEFAULT 0,
  units_reserved INTEGER DEFAULT 0,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'critical', 'out_of_stock')),
  last_updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  UNIQUE (hospital_id, blood_group)
);

-- ============================================
-- 5. BLOOD_REQUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS blood_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blood_group TEXT NOT NULL,
  units_needed INTEGER NOT NULL,
  urgency TEXT DEFAULT 'standard' CHECK (urgency IN ('critical', 'urgent', 'standard')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'fulfilled', 'expired', 'cancelled')),
  req_lat DOUBLE PRECISION,
  req_lng DOUBLE PRECISION,
  city TEXT,
  notes TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 6. REQUEST_MATCHES
-- ============================================
CREATE TABLE IF NOT EXISTS request_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  units_matched INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'fulfilled')),
  matched_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);

-- ============================================
-- 7. INVENTORY_AUDIT_LOG
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
  blood_inventory_id UUID REFERENCES blood_inventory(id) ON DELETE SET NULL,
  blood_group TEXT NOT NULL,
  old_units INTEGER,
  new_units INTEGER,
  change_reason TEXT,
  changed_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 8. SESSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('user', 'admin')),
  token_hash TEXT NOT NULL,
  ip_address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_blood_inventory_hospital ON blood_inventory(hospital_id);
CREATE INDEX IF NOT EXISTS idx_blood_inventory_group ON blood_inventory(blood_group);
CREATE INDEX IF NOT EXISTS idx_blood_requests_user ON blood_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_request_matches_request ON request_matches(request_id);
CREATE INDEX IF NOT EXISTS idx_request_matches_hospital ON request_matches(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospitals_admin ON hospitals(admin_id);
CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_audit_log_hospital ON inventory_audit_log(hospital_id);
