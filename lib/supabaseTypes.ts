/**
 * PawSecure — Supabase type definitions
 * Matches supabase_schema.sql exactly.
 *
 * Tables:
 *   organizations    — NGO / SPCA accounts (the only users)
 *   pending_animals  — animals detected, waiting for rescue
 *   rescued_animals  — permanent archive after rescue
 *   animal_embeddings — CLIP vectors for re-identification
 */

export type Species        = 'dog' | 'cat';
export type InjurySeverity = 'none' | 'mild' | 'moderate' | 'severe' | 'critical';
export type AnimalStatus   = 'sighted' | 'claimed' | 'en_route';
export type RescueOutcome  = 'in_care' | 'rehomed' | 'released' | 'deceased';

// ── organizations ─────────────────────────────────────────────────────────────

export interface Organization {
    id:               string;
    email:            string;
    name:             string;          // e.g. "SPCA Selangor"
    phone:            string | null;
    registration_no:  string | null;
    address:          string | null;
    latitude:         number | null;   // HQ location shown on map
    longitude:        number | null;
    logo_url:         string | null;
    is_verified:      boolean;
    created_at:       string;
    updated_at:       string;
}

export type OrganizationInsert = Omit<Organization, 'id' | 'created_at' | 'updated_at'>;

// ── pending_animals ───────────────────────────────────────────────────────────

export interface PendingAnimal {
    id:                  string;
    animal_code:         string;         // PS-2025-XXXXXX
    species:             Species;
    injury_severity:     InjurySeverity;
    injury_signals:      string[] | null; // e.g. ["red_region_detected"]
    ai_confidence:       number | null;   // 0.0 – 1.0 from YOLO
    image_url:           string;
    address:             string | null;
    latitude:            number;
    longitude:           number;
    spotted_at:          string;
    claimed_by_org_id:   string | null;   // null = unclaimed
    claimed_at:          string | null;
    status:              AnimalStatus;
    created_at:          string;
    updated_at:          string;
}

export type PendingAnimalInsert = Omit<PendingAnimal, 'id' | 'created_at' | 'updated_at'>;

// ── rescued_animals ───────────────────────────────────────────────────────────

export interface RescuedAnimal {
    id:                   string;
    animal_code:          string;
    species:              Species;
    injury_severity:      InjurySeverity | null;
    injury_signals:       string[] | null;
    cctv_image_url:       string | null;    // original sighting photo
    rescue_image_url:     string | null;    // photo taken by NGO at rescue
    address:              string | null;
    latitude:             number | null;
    longitude:            number | null;
    rescued_by_org_id:    string | null;
    rescued_by_org_name:  string | null;
    rescued_at:           string;
    health_notes:         string | null;
    is_vaccinated:        boolean;
    is_neutered:          boolean;
    outcome:              RescueOutcome;
    outcome_date:         string | null;
    outcome_notes:        string | null;
    created_at:           string;
}

export type RescuedAnimalInsert = Omit<RescuedAnimal, 'id' | 'created_at'>;

// ── animal_embeddings ─────────────────────────────────────────────────────────

export interface AnimalEmbedding {
    id:             string;
    animal_code:    string;
    species:        Species;
    embedding:      number[];   // 512 floats from CLIP ViT-B-32
    image_url:      string;
    sighting_count: number;
    first_seen_at:  string;
    last_seen_at:   string;
}

export type AnimalEmbeddingInsert = Omit<AnimalEmbedding, 'id'>;
