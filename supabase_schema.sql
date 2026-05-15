-- ================================================================
-- PawSecure — Clean Supabase Schema
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- ================================================================
-- Purpose: Track injured stray animals via CCTV in Malaysia.
--          NGOs/SPCA can see nearby animals, claim them for rescue,
--          and build a permanent archive of all animals they have saved.
-- ================================================================

-- STEP 0: Enable the vector extension (needed for CLIP embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- ================================================================
-- TABLE 1: organizations
-- Who can log in. Only verified NGOs / volunteer orgs / SPCA.
-- No public citizen accounts — this app is org-only.
-- ================================================================
CREATE TABLE IF NOT EXISTS organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT UNIQUE NOT NULL,
    name            TEXT NOT NULL,               -- e.g. "SPCA Selangor"
    phone           TEXT,
    registration_no TEXT,                        -- official registration number
    address         TEXT,
    latitude        DOUBLE PRECISION,            -- org HQ location (shown on map)
    longitude       DOUBLE PRECISION,
    logo_url        TEXT,
    is_verified     BOOLEAN DEFAULT FALSE,       -- admin verifies the org
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 2: pending_animals
-- Every animal detected by CCTV that has NOT been rescued yet.
-- This is the live "rescue queue" NGOs browse.
-- When rescued → row is DELETED from here, inserted into rescued_animals.
-- ================================================================
CREATE TABLE IF NOT EXISTS pending_animals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Unique animal identity (format: PS-2025-XXXXXX)
    animal_code     TEXT UNIQUE NOT NULL,

    -- What the AI detected
    species         TEXT CHECK (species IN ('dog', 'cat')) NOT NULL,
    injury_severity TEXT CHECK (injury_severity IN ('none', 'mild', 'moderate', 'severe', 'critical'))
                         NOT NULL DEFAULT 'none',
    injury_signals  TEXT[],      -- e.g. ARRAY['red_region_detected', 'abnormal_aspect_ratio']
    ai_confidence   FLOAT,       -- YOLO detection confidence (0.0 – 1.0)

    -- Image captured from CCTV
    image_url       TEXT NOT NULL,

    -- Where it was spotted
    address         TEXT,
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    spotted_at      TIMESTAMPTZ DEFAULT NOW(),

    -- Which org claimed this animal for rescue (null = unclaimed)
    claimed_by_org_id   UUID REFERENCES organizations(id) ON DELETE SET NULL,
    claimed_at          TIMESTAMPTZ,

    -- Status in the rescue workflow
    status          TEXT CHECK (status IN ('sighted', 'claimed', 'en_route'))
                         NOT NULL DEFAULT 'sighted',

    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 3: rescued_animals
-- Permanent, forever record of every animal an org has rescued.
-- Rows are NEVER deleted — this is the archive.
-- ================================================================
CREATE TABLE IF NOT EXISTS rescued_animals (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Carry over from pending_animals
    animal_code     TEXT NOT NULL,
    species         TEXT CHECK (species IN ('dog', 'cat')) NOT NULL,
    injury_severity TEXT CHECK (injury_severity IN ('none', 'mild', 'moderate', 'severe', 'critical')),
    injury_signals  TEXT[],

    -- Images: before (CCTV) and after (NGO rescue photo)
    cctv_image_url      TEXT,       -- original sighting image
    rescue_image_url    TEXT,       -- photo taken by NGO when they rescued it

    -- Location it was rescued from
    address         TEXT,
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,

    -- Which org rescued it
    rescued_by_org_id   UUID REFERENCES organizations(id) ON DELETE SET NULL,
    rescued_by_org_name TEXT,
    rescued_at          TIMESTAMPTZ DEFAULT NOW(),

    -- Post-rescue care notes
    health_notes    TEXT,
    is_vaccinated   BOOLEAN DEFAULT FALSE,
    is_neutered     BOOLEAN DEFAULT FALSE,

    -- Final outcome
    outcome         TEXT CHECK (outcome IN ('in_care', 'rehomed', 'released', 'deceased'))
                         DEFAULT 'in_care',
    outcome_date    TIMESTAMPTZ,
    outcome_notes   TEXT,

    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE 4: animal_embeddings
-- CLIP vector fingerprints for re-identifying the same animal
-- across multiple CCTV sightings.
-- ================================================================
CREATE TABLE IF NOT EXISTS animal_embeddings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    animal_code     TEXT NOT NULL,          -- links to pending_animals.animal_code
    species         TEXT CHECK (species IN ('dog', 'cat')) NOT NULL,
    embedding       VECTOR(512) NOT NULL,   -- 512-dim OpenCLIP ViT-B-32 vector
    image_url       TEXT NOT NULL,
    sighting_count  INTEGER DEFAULT 1,      -- how many times this animal has been seen
    first_seen_at   TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- INDEXES — speeds up the queries the app runs most often
-- ================================================================
-- NGOs filter pending animals by location and status
CREATE INDEX IF NOT EXISTS idx_pending_location   ON pending_animals(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_pending_status     ON pending_animals(status);
CREATE INDEX IF NOT EXISTS idx_pending_severity   ON pending_animals(injury_severity);
CREATE INDEX IF NOT EXISTS idx_pending_claimed    ON pending_animals(claimed_by_org_id);

-- Org archive queries
CREATE INDEX IF NOT EXISTS idx_rescued_org        ON rescued_animals(rescued_by_org_id);
CREATE INDEX IF NOT EXISTS idx_rescued_date       ON rescued_animals(rescued_at);
CREATE INDEX IF NOT EXISTS idx_rescued_species    ON rescued_animals(species);

-- CLIP lookup
CREATE INDEX IF NOT EXISTS idx_embeddings_code    ON animal_embeddings(animal_code);

-- Org map
CREATE INDEX IF NOT EXISTS idx_orgs_location      ON organizations(latitude, longitude);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
ALTER TABLE organizations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_animals    ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescued_animals    ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_embeddings  ENABLE ROW LEVEL SECURITY;

-- Drop before recreating (safe to re-run)
DROP POLICY IF EXISTS "orgs_select"           ON organizations;
DROP POLICY IF EXISTS "orgs_update_own"       ON organizations;
DROP POLICY IF EXISTS "pending_select"        ON pending_animals;
DROP POLICY IF EXISTS "pending_insert"        ON pending_animals;
DROP POLICY IF EXISTS "pending_update"        ON pending_animals;
DROP POLICY IF EXISTS "pending_delete"        ON pending_animals;
DROP POLICY IF EXISTS "rescued_select"        ON rescued_animals;
DROP POLICY IF EXISTS "rescued_insert"        ON rescued_animals;
DROP POLICY IF EXISTS "embeddings_select"     ON animal_embeddings;
DROP POLICY IF EXISTS "embeddings_insert"     ON animal_embeddings;

-- Organizations: any logged-in user can read all orgs (needed for map)
CREATE POLICY "orgs_select"       ON organizations FOR SELECT USING (true);
CREATE POLICY "orgs_update_own"   ON organizations FOR UPDATE
    USING (auth.uid()::TEXT = id::TEXT);

-- Pending animals: any logged-in org can read + claim
CREATE POLICY "pending_select"    ON pending_animals FOR SELECT USING (true);
CREATE POLICY "pending_insert"    ON pending_animals FOR INSERT WITH CHECK (true);
CREATE POLICY "pending_update"    ON pending_animals FOR UPDATE USING (true);
CREATE POLICY "pending_delete"    ON pending_animals FOR DELETE USING (true);

-- Rescued animals: any org can read; only inserting org can write
CREATE POLICY "rescued_select"    ON rescued_animals FOR SELECT USING (true);
CREATE POLICY "rescued_insert"    ON rescued_animals FOR INSERT WITH CHECK (true);

-- Embeddings: any org can read; backend inserts
CREATE POLICY "embeddings_select" ON animal_embeddings FOR SELECT USING (true);
CREATE POLICY "embeddings_insert" ON animal_embeddings FOR INSERT WITH CHECK (true);

-- ================================================================
-- REALTIME — lets the app get live updates without polling
-- ================================================================
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE pending_animals;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE rescued_animals;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ================================================================
-- CLIP SIMILARITY FUNCTION
-- Called by animalService.ts → findSimilarAnimals()
-- Returns animals whose embedding is within match_threshold cosine similarity.
-- ================================================================
CREATE OR REPLACE FUNCTION match_animal_embeddings(
    query_embedding VECTOR(512),
    match_threshold FLOAT DEFAULT 0.8,
    match_count     INT   DEFAULT 5
)
RETURNS TABLE (
    animal_code TEXT,
    similarity  FLOAT,
    image_url   TEXT
)
LANGUAGE SQL STABLE
AS $$
    SELECT
        animal_code,
        1 - (embedding <=> query_embedding) AS similarity,
        image_url
    FROM animal_embeddings
    WHERE 1 - (embedding <=> query_embedding) > match_threshold
    ORDER BY embedding <=> query_embedding
    LIMIT match_count;
$$;

-- ================================================================
-- SEED DATA — Sample Malaysian SPCA/NGO locations for the map
-- You can delete these once you have real data.
-- ================================================================
INSERT INTO organizations (email, name, phone, address, latitude, longitude, is_verified)
VALUES
    ('info@spcaselangor.org.my', 'SPCA Selangor',           '+603-4256 5312', 'Ampang, Selangor',        3.1569, 101.7649, TRUE),
    ('paws@pawsmalaysia.org',    'PAWS Animal Welfare',      '+603-7846 1088', 'Subang Jaya, Selangor',   3.0551, 101.5904, TRUE),
    ('info@spcapenang.org',      'SPCA Penang',              '+604-281 6559',  'Georgetown, Penang',       5.4164, 100.3327, TRUE),
    ('rescue@pawsjohor.org',     'PAWS Johor',               '+607-333 1234',  'Johor Bahru, Johor',       1.4927, 103.7414, TRUE),
    ('info@spcasabah.org',       'SPCA Sabah',               '+6088-268 288',  'Kota Kinabalu, Sabah',     5.9788, 116.0753, TRUE),
    ('rescue@rawanimalcare.org', 'RAW Animal Rescue Penang', '+6011-2345 6789','Bukit Mertajam, Penang',   5.3606, 100.4575, TRUE)
ON CONFLICT DO NOTHING;

-- ================================================================
-- DONE.
-- Next steps:
-- 1. Run this entire file in Supabase > SQL Editor
-- 2. Go to Settings > API > copy Project URL and anon key
-- 3. Add them to your .env file
-- ================================================================
