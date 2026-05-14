-- ============================================================
-- PawGuard AI - Supabase Database Schema
-- ============================================================
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable the pgvector extension for CLIP embedding storage
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('citizen', 'ngo')) NOT NULL DEFAULT 'citizen',
    phone TEXT,
    ngo_name TEXT, -- Only for NGO users
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. ANIMAL REPORTS TABLE (Main reports from users)
-- ============================================================
CREATE TABLE IF NOT EXISTS animal_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id TEXT UNIQUE NOT NULL, -- e.g., "RPT-2024-0001"
    
    -- Reporter Info
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_name TEXT NOT NULL,
    reporter_phone TEXT,
    
    -- Animal Info (from YOLO + CLIP + Gemini AI)
    species TEXT CHECK (species IN ('dog', 'cat', 'unknown')) NOT NULL,
    breed TEXT,
    color TEXT,
    distinctive_features TEXT,
    health_notes TEXT,
    is_emergency BOOLEAN DEFAULT FALSE,
    
    -- Image & Identity
    image_url TEXT NOT NULL,
    animal_id TEXT NOT NULL, -- Unique animal ID like "DOG-XXXX"
    
    -- Location
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    
    -- Weather at time of report
    weather_condition TEXT,
    temperature DOUBLE PRECISION,
    weather_alert TEXT,
    
    -- Care Status (multiple options - all editable by NGO)
    is_vaccinated BOOLEAN DEFAULT FALSE,
    vaccination_date DATE,
    vaccination_notes TEXT,
    is_neutered BOOLEAN DEFAULT FALSE,
    neutered_date DATE,
    is_rescued BOOLEAN DEFAULT FALSE,
    rescue_date DATE,
    rescue_notes TEXT,
    
    -- Status (real-time updates)
    status TEXT CHECK (status IN ('new', 'in_progress', 'rescued', 'resolved', 'adopted')) DEFAULT 'new',
    disaster_mode BOOLEAN DEFAULT FALSE,
    
    -- NGO Assignment
    assigned_ngo_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_ngo_name TEXT,
    ngo_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- ============================================================
-- 3. ANIMAL EMBEDDINGS TABLE (CLIP vectors for identity matching)
-- ============================================================
CREATE TABLE IF NOT EXISTS animal_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_id TEXT UNIQUE NOT NULL, -- Links to animal_reports.animal_id
    embedding VECTOR(512), -- 512-dimension CLIP embedding
    image_url TEXT NOT NULL,
    species TEXT CHECK (species IN ('dog', 'cat')) NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    sighting_count INTEGER DEFAULT 1
);

-- ============================================================
-- 4. DISASTER ZONES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS disaster_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Geographic bounds
    center_latitude DOUBLE PRECISION NOT NULL,
    center_longitude DOUBLE PRECISION NOT NULL,
    radius_km DOUBLE PRECISION DEFAULT 50,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    
    -- Timestamps
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ,
    
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. STATUS HISTORY TABLE (for real-time tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES animal_reports(id) ON DELETE CASCADE,
    
    old_status TEXT,
    new_status TEXT NOT NULL,
    action_type TEXT CHECK (action_type IN ('status_change', 'vaccination', 'neutering', 'rescue', 'assignment')) NOT NULL,
    changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_by_name TEXT,
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES for faster queries
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_reports_status ON animal_reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_disaster ON animal_reports(disaster_mode);
CREATE INDEX IF NOT EXISTS idx_reports_location ON animal_reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON animal_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_ngo ON animal_reports(assigned_ngo_id);
CREATE INDEX IF NOT EXISTS idx_reports_animal_id ON animal_reports(animal_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_animal ON animal_embeddings(animal_id);
CREATE INDEX IF NOT EXISTS idx_status_history_report ON status_history(report_id);
CREATE INDEX IF NOT EXISTS idx_disaster_zones_active ON disaster_zones(is_active);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for animal_reports
-- Drop existing policies first (for re-running)
DROP POLICY IF EXISTS "Anyone can view reports" ON animal_reports;
DROP POLICY IF EXISTS "Anyone can insert reports" ON animal_reports;
DROP POLICY IF EXISTS "Anyone can update reports" ON animal_reports;

-- Anyone can view all reports
CREATE POLICY "Anyone can view reports" ON animal_reports 
FOR SELECT USING (true);

-- Anyone can insert reports (for now, you can restrict later)
CREATE POLICY "Anyone can insert reports" ON animal_reports 
FOR INSERT WITH CHECK (true);

-- Anyone can update reports (for now, you can restrict to NGOs later)
CREATE POLICY "Anyone can update reports" ON animal_reports 
FOR UPDATE USING (true);

-- RLS Policies for other tables (drop first)
DROP POLICY IF EXISTS "Anyone can view embeddings" ON animal_embeddings;
DROP POLICY IF EXISTS "Anyone can insert embeddings" ON animal_embeddings;
DROP POLICY IF EXISTS "Anyone can view disaster_zones" ON disaster_zones;
DROP POLICY IF EXISTS "Anyone can insert disaster_zones" ON disaster_zones;
DROP POLICY IF EXISTS "Anyone can update disaster_zones" ON disaster_zones;
DROP POLICY IF EXISTS "Anyone can view status_history" ON status_history;
DROP POLICY IF EXISTS "Anyone can insert status_history" ON status_history;
DROP POLICY IF EXISTS "Anyone can view users" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;

CREATE POLICY "Anyone can view embeddings" ON animal_embeddings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert embeddings" ON animal_embeddings FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view disaster_zones" ON disaster_zones FOR SELECT USING (true);
CREATE POLICY "Anyone can insert disaster_zones" ON disaster_zones FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update disaster_zones" ON disaster_zones FOR UPDATE USING (true);

CREATE POLICY "Anyone can view status_history" ON status_history FOR SELECT USING (true);
CREATE POLICY "Anyone can insert status_history" ON status_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view users" ON users FOR SELECT USING (true);
CREATE POLICY "Anyone can insert users" ON users FOR INSERT WITH CHECK (true);

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================
-- Enable realtime for report status updates (ignore if already added)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE animal_reports;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE status_history;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE disaster_zones;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- MOCK DISASTER DATA FOR SABAH EARTHQUAKE DEMO
-- ============================================================
INSERT INTO disaster_zones (name, description, center_latitude, center_longitude, radius_km, is_active, severity)
VALUES 
    ('Sabah Earthquake Zone - Ranau', 'Earthquake affected area near Mount Kinabalu. Multiple aftershocks reported.', 5.9631, 116.6661, 50, true, 'critical'),
    ('Sabah Earthquake Zone - Kundasang', 'Highland area with stranded animals due to landslides.', 6.0167, 116.5667, 30, true, 'high'),
    ('Kota Kinabalu Coastal Alert', 'Coastal flooding risk. Monitor beach areas for strays.', 5.9804, 116.0735, 40, false, 'medium')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 6. UPDATE USERS TABLE WITH CONTACT FIELDS
-- ============================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- ============================================================
-- 7. UPDATE ANIMAL REPORTS FOR ADOPTION TRACKING
-- ============================================================
ALTER TABLE animal_reports ADD COLUMN IF NOT EXISTS rescue_outcome TEXT 
    CHECK (rescue_outcome IN ('released_to_nature', 'shelter_recovery', 'adopted', 'deceased'));
ALTER TABLE animal_reports ADD COLUMN IF NOT EXISTS shelter_ngo_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE animal_reports ADD COLUMN IF NOT EXISTS is_tracking_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE animal_reports ADD COLUMN IF NOT EXISTS adopted_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE animal_reports ADD COLUMN IF NOT EXISTS adoption_date TIMESTAMPTZ;

-- ============================================================
-- 8. NGO PROFILES TABLE (Verification & Contact)
-- ============================================================
CREATE TABLE IF NOT EXISTS ngo_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Organization Info
    organization_name TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    license_document_url TEXT,
    
    -- Contact Info
    office_address TEXT NOT NULL,
    office_phone TEXT NOT NULL,
    emergency_phone TEXT,
    email TEXT NOT NULL,
    website TEXT,
    
    -- Location (for map display)
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    
    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by TEXT,
    
    -- Operating Info
    operating_hours TEXT,
    capacity INTEGER,
    species_handled TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. ADOPTION POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS adoption_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Link to original report
    report_id UUID REFERENCES animal_reports(id) ON DELETE CASCADE,
    animal_id TEXT NOT NULL,
    
    -- NGO Info
    ngo_id UUID REFERENCES ngo_profiles(id) NOT NULL,
    ngo_name TEXT NOT NULL,
    
    -- Animal Details
    name TEXT,
    species TEXT NOT NULL,
    breed TEXT,
    age_estimate TEXT,
    gender TEXT CHECK (gender IN ('male', 'female', 'unknown')),
    size TEXT CHECK (size IN ('small', 'medium', 'large')),
    
    -- Health & Behavior
    health_status TEXT,
    temperament TEXT,
    good_with_children BOOLEAN,
    good_with_pets BOOLEAN,
    is_vaccinated BOOLEAN DEFAULT FALSE,
    is_neutered BOOLEAN DEFAULT FALSE,
    special_needs TEXT,
    
    -- Media
    photos TEXT[],
    video_url TEXT,
    
    -- Adoption Info
    adoption_fee DECIMAL(10,2),
    requirements TEXT,
    
    -- Status
    status TEXT CHECK (status IN ('available', 'pending', 'adopted', 'withdrawn')) DEFAULT 'available',
    views_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. LOST & FOUND POSTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS lost_found_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Post Type
    post_type TEXT CHECK (post_type IN ('lost', 'found')) NOT NULL,
    
    -- User Info (both citizen and NGO can post)
    user_id UUID REFERENCES users(id) NOT NULL,
    user_name TEXT NOT NULL,
    user_role TEXT CHECK (user_role IN ('citizen', 'ngo')) DEFAULT 'citizen',
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    
    -- Animal Info
    species TEXT CHECK (species IN ('dog', 'cat', 'other')) NOT NULL,
    breed TEXT,
    color TEXT,
    size TEXT CHECK (size IN ('small', 'medium', 'large')),
    distinctive_features TEXT,
    name TEXT,
    
    -- AI Matching
    animal_id TEXT,
    
    -- Location
    last_seen_address TEXT NOT NULL,
    last_seen_latitude DOUBLE PRECISION,
    last_seen_longitude DOUBLE PRECISION,
    last_seen_date DATE,
    
    -- Media
    photos TEXT[],
    
    -- Status
    status TEXT CHECK (status IN ('active', 'resolved', 'expired')) DEFAULT 'active',
    resolved_at TIMESTAMPTZ,
    resolved_note TEXT,
    
    -- Reward
    reward_offered DECIMAL(10,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMMUNITY INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_adoption_status ON adoption_posts(status);
CREATE INDEX IF NOT EXISTS idx_adoption_species ON adoption_posts(species);
CREATE INDEX IF NOT EXISTS idx_adoption_ngo ON adoption_posts(ngo_id);
CREATE INDEX IF NOT EXISTS idx_lostfound_type ON lost_found_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_lostfound_status ON lost_found_posts(status);
CREATE INDEX IF NOT EXISTS idx_lostfound_location ON lost_found_posts(last_seen_latitude, last_seen_longitude);
CREATE INDEX IF NOT EXISTS idx_ngo_profiles_user ON ngo_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_tracking ON animal_reports(is_tracking_enabled);

-- ============================================================
-- COMMUNITY RLS POLICIES
-- ============================================================
ALTER TABLE ngo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE adoption_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_found_posts ENABLE ROW LEVEL SECURITY;

-- Drop existing community policies first (for re-running)
DROP POLICY IF EXISTS "Anyone can view ngo_profiles" ON ngo_profiles;
DROP POLICY IF EXISTS "Anyone can insert ngo_profiles" ON ngo_profiles;
DROP POLICY IF EXISTS "Anyone can update ngo_profiles" ON ngo_profiles;
DROP POLICY IF EXISTS "Anyone can view adoption_posts" ON adoption_posts;
DROP POLICY IF EXISTS "Anyone can insert adoption_posts" ON adoption_posts;
DROP POLICY IF EXISTS "Anyone can update adoption_posts" ON adoption_posts;
DROP POLICY IF EXISTS "Anyone can view lost_found_posts" ON lost_found_posts;
DROP POLICY IF EXISTS "Anyone can insert lost_found_posts" ON lost_found_posts;
DROP POLICY IF EXISTS "Anyone can update lost_found_posts" ON lost_found_posts;

CREATE POLICY "Anyone can view ngo_profiles" ON ngo_profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert ngo_profiles" ON ngo_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update ngo_profiles" ON ngo_profiles FOR UPDATE USING (true);

CREATE POLICY "Anyone can view adoption_posts" ON adoption_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert adoption_posts" ON adoption_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update adoption_posts" ON adoption_posts FOR UPDATE USING (true);

CREATE POLICY "Anyone can view lost_found_posts" ON lost_found_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert lost_found_posts" ON lost_found_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update lost_found_posts" ON lost_found_posts FOR UPDATE USING (true);

-- ============================================================
-- COMMUNITY REALTIME
-- ============================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE adoption_posts;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE lost_found_posts;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE ngo_profiles;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- DONE! Your database is ready for PawGuard AI Community Features
-- ============================================================

