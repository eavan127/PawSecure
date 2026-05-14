/**
 * Supabase Database Types for PawGuard AI
 * Complete type definitions matching supabase_schema.sql
 */

// ============= BASE TYPES =============
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type ReportStatus = 'new' | 'in_progress' | 'rescued' | 'resolved' | 'adopted';
export type InjurySeverity = 'low' | 'medium' | 'high' | 'critical';
export type DisasterSeverity = 'low' | 'medium' | 'high' | 'critical';
export type UserRole = 'citizen' | 'ngo';
export type RescueOutcome = 'released_to_nature' | 'shelter_recovery' | 'adopted' | 'deceased';

// ============= DATABASE INTERFACE (Supabase v2 format) =============
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    name: string
                    role: UserRole
                    phone: string | null
                    ngo_name: string | null
                    created_at: string
                    updated_at: string
                    phone_verified: boolean | null
                    address: string | null
                    profile_image_url: string | null
                }
                Insert: {
                    id: string
                    email: string
                    name: string
                    role?: UserRole
                    phone?: string | null
                    ngo_name?: string | null
                    created_at?: string
                    updated_at?: string
                    phone_verified?: boolean | null
                    address?: string | null
                    profile_image_url?: string | null
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string
                    role?: UserRole
                    phone?: string | null
                    ngo_name?: string | null
                    created_at?: string
                    updated_at?: string
                    phone_verified?: boolean | null
                    address?: string | null
                    profile_image_url?: string | null
                }
                Relationships: []
            }
            animal_reports: {
                Row: {
                    id: string
                    report_id: string
                    reporter_id: string
                    reporter_name: string
                    reporter_phone: string | null
                    species: 'dog' | 'cat' | 'unknown'
                    breed: string | null
                    color: string | null
                    distinctive_features: string | null
                    health_notes: string | null
                    is_emergency: boolean
                    image_url: string
                    animal_id: string
                    address: string
                    latitude: number | null
                    longitude: number | null
                    weather_condition: string | null
                    temperature: number | null
                    weather_alert: string | null
                    is_vaccinated: boolean
                    vaccination_date: string | null
                    vaccination_notes: string | null
                    is_neutered: boolean
                    neutered_date: string | null
                    is_rescued: boolean
                    rescue_date: string | null
                    rescue_notes: string | null
                    status: ReportStatus
                    disaster_mode: boolean
                    assigned_ngo_id: string | null
                    assigned_ngo_name: string | null
                    ngo_notes: string | null
                    created_at: string
                    updated_at: string
                    resolved_at: string | null
                    rescue_outcome: RescueOutcome | null
                    shelter_ngo_id: string | null
                    is_tracking_enabled: boolean | null
                    adopted_by_user_id: string | null
                    adoption_date: string | null
                }
                Insert: {
                    id?: string
                    report_id: string
                    reporter_id: string
                    reporter_name: string
                    reporter_phone?: string | null
                    species?: 'dog' | 'cat' | 'unknown'
                    breed?: string | null
                    color?: string | null
                    distinctive_features?: string | null
                    health_notes?: string | null
                    is_emergency?: boolean
                    image_url: string
                    animal_id: string
                    address: string
                    latitude?: number | null
                    longitude?: number | null
                    weather_condition?: string | null
                    temperature?: number | null
                    weather_alert?: string | null
                    is_vaccinated?: boolean
                    vaccination_date?: string | null
                    vaccination_notes?: string | null
                    is_neutered?: boolean
                    neutered_date?: string | null
                    is_rescued?: boolean
                    rescue_date?: string | null
                    rescue_notes?: string | null
                    status?: ReportStatus
                    disaster_mode?: boolean
                    assigned_ngo_id?: string | null
                    assigned_ngo_name?: string | null
                    ngo_notes?: string | null
                    created_at?: string
                    updated_at?: string
                    resolved_at?: string | null
                    rescue_outcome?: RescueOutcome | null
                    shelter_ngo_id?: string | null
                    is_tracking_enabled?: boolean | null
                    adopted_by_user_id?: string | null
                    adoption_date?: string | null
                }
                Update: {
                    id?: string
                    report_id?: string
                    reporter_id?: string
                    reporter_name?: string
                    reporter_phone?: string | null
                    species?: 'dog' | 'cat' | 'unknown'
                    breed?: string | null
                    color?: string | null
                    distinctive_features?: string | null
                    health_notes?: string | null
                    is_emergency?: boolean
                    image_url?: string
                    animal_id?: string
                    address?: string
                    latitude?: number | null
                    longitude?: number | null
                    weather_condition?: string | null
                    temperature?: number | null
                    weather_alert?: string | null
                    is_vaccinated?: boolean
                    vaccination_date?: string | null
                    vaccination_notes?: string | null
                    is_neutered?: boolean
                    neutered_date?: string | null
                    is_rescued?: boolean
                    rescue_date?: string | null
                    rescue_notes?: string | null
                    status?: ReportStatus
                    disaster_mode?: boolean
                    assigned_ngo_id?: string | null
                    assigned_ngo_name?: string | null
                    ngo_notes?: string | null
                    created_at?: string
                    updated_at?: string
                    resolved_at?: string | null
                    rescue_outcome?: RescueOutcome | null
                    shelter_ngo_id?: string | null
                    is_tracking_enabled?: boolean | null
                    adopted_by_user_id?: string | null
                    adoption_date?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "animal_reports_reporter_id_fkey",
                        columns: ["reporter_id"],
                        referencedRelation: "users",
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "animal_reports_assigned_ngo_id_fkey",
                        columns: ["assigned_ngo_id"],
                        referencedRelation: "ngo_profiles",
                        referencedColumns: ["id"]
                    }
                ]
            }
            animal_embeddings: {
                Row: {
                    id: string
                    animal_id: string
                    embedding: number[] | null
                    image_url: string
                    species: 'dog' | 'cat'
                    created_by: string
                    created_at: string
                    last_seen_at: string
                    sighting_count: number
                }
                Insert: {
                    id?: string
                    animal_id: string
                    embedding?: number[] | null
                    image_url: string
                    species: 'dog' | 'cat'
                    created_by: string
                    created_at?: string
                    last_seen_at?: string
                    sighting_count?: number
                }
                Update: {
                    id?: string
                    animal_id?: string
                    embedding?: number[] | null
                    image_url?: string
                    species?: 'dog' | 'cat'
                    created_by?: string
                    created_at?: string
                    last_seen_at?: string
                    sighting_count?: number
                }
                Relationships: []
            }
            disaster_zones: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    center_latitude: number
                    center_longitude: number
                    radius_km: number
                    is_active: boolean
                    severity: DisasterSeverity
                    activated_at: string
                    deactivated_at: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    center_latitude: number
                    center_longitude: number
                    radius_km?: number
                    is_active?: boolean
                    severity?: DisasterSeverity
                    activated_at?: string
                    deactivated_at?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    center_latitude?: number
                    center_longitude?: number
                    radius_km?: number
                    is_active?: boolean
                    severity?: DisasterSeverity
                    activated_at?: string
                    deactivated_at?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            status_history: {
                Row: {
                    id: string
                    report_id: string
                    old_status: string | null
                    new_status: string
                    action_type: 'status_change' | 'vaccination' | 'neutering' | 'rescue' | 'assignment'
                    changed_by: string
                    changed_by_name: string
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    report_id: string
                    old_status?: string | null
                    new_status: string
                    action_type: 'status_change' | 'vaccination' | 'neutering' | 'rescue' | 'assignment'
                    changed_by: string
                    changed_by_name: string
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    report_id?: string
                    old_status?: string | null
                    new_status?: string
                    action_type?: 'status_change' | 'vaccination' | 'neutering' | 'rescue' | 'assignment'
                    changed_by?: string
                    changed_by_name?: string
                    notes?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            ngo_profiles: {
                Row: {
                    id: string
                    user_id: string
                    organization_name: string
                    registration_number: string
                    license_document_url: string | null
                    office_address: string
                    office_phone: string
                    emergency_phone: string | null
                    email: string
                    website: string | null
                    latitude: number | null
                    longitude: number | null
                    is_verified: boolean
                    verified_at: string | null
                    verified_by: string | null
                    operating_hours: string | null
                    capacity: number | null
                    species_handled: string[] | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    organization_name: string
                    registration_number: string
                    license_document_url?: string | null
                    office_address: string
                    office_phone: string
                    emergency_phone?: string | null
                    email: string
                    website?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    is_verified?: boolean
                    verified_at?: string | null
                    verified_by?: string | null
                    operating_hours?: string | null
                    capacity?: number | null
                    species_handled?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    organization_name?: string
                    registration_number?: string
                    license_document_url?: string | null
                    office_address?: string
                    office_phone?: string
                    emergency_phone?: string | null
                    email?: string
                    website?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    is_verified?: boolean
                    verified_at?: string | null
                    verified_by?: string | null
                    operating_hours?: string | null
                    capacity?: number | null
                    species_handled?: string[] | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "ngo_profiles_user_id_fkey",
                        columns: ["user_id"],
                        referencedRelation: "users",
                        referencedColumns: ["id"]
                    }
                ]
            }
            adoption_posts: {
                Row: {
                    id: string
                    report_id: string | null
                    animal_id: string
                    ngo_id: string
                    ngo_name: string
                    name: string | null
                    species: string
                    breed: string | null
                    age_estimate: string | null
                    gender: 'male' | 'female' | 'unknown' | null
                    size: 'small' | 'medium' | 'large' | null
                    health_status: string | null
                    temperament: string | null
                    good_with_children: boolean | null
                    good_with_pets: boolean | null
                    is_vaccinated: boolean
                    is_neutered: boolean
                    special_needs: string | null
                    photos: string[]
                    video_url: string | null
                    adoption_fee: number | null
                    requirements: string | null
                    status: 'available' | 'pending' | 'adopted' | 'withdrawn'
                    views_count: number
                    inquiries_count: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    report_id?: string | null
                    animal_id: string
                    ngo_id: string
                    ngo_name: string
                    name?: string | null
                    species: string
                    breed?: string | null
                    age_estimate?: string | null
                    gender?: 'male' | 'female' | 'unknown' | null
                    size?: 'small' | 'medium' | 'large' | null
                    health_status?: string | null
                    temperament?: string | null
                    good_with_children?: boolean | null
                    good_with_pets?: boolean | null
                    is_vaccinated?: boolean
                    is_neutered?: boolean
                    special_needs?: string | null
                    photos: string[]
                    video_url?: string | null
                    adoption_fee?: number | null
                    requirements?: string | null
                    status?: 'available' | 'pending' | 'adopted' | 'withdrawn'
                    views_count?: number
                    inquiries_count?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    report_id?: string | null
                    animal_id?: string
                    ngo_id?: string
                    ngo_name?: string
                    name?: string | null
                    species?: string
                    breed?: string | null
                    age_estimate?: string | null
                    gender?: 'male' | 'female' | 'unknown' | null
                    size?: 'small' | 'medium' | 'large' | null
                    health_status?: string | null
                    temperament?: string | null
                    good_with_children?: boolean | null
                    good_with_pets?: boolean | null
                    is_vaccinated?: boolean
                    is_neutered?: boolean
                    special_needs?: string | null
                    photos?: string[]
                    video_url?: string | null
                    adoption_fee?: number | null
                    requirements?: string | null
                    status?: 'available' | 'pending' | 'adopted' | 'withdrawn'
                    views_count?: number
                    inquiries_count?: number
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "adoption_posts_ngo_id_fkey",
                        columns: ["ngo_id"],
                        referencedRelation: "ngo_profiles",
                        referencedColumns: ["id"]
                    }
                ]
            }
            lost_found_posts: {
                Row: {
                    id: string
                    post_type: 'lost' | 'found'
                    user_id: string
                    user_name: string
                    user_role: UserRole
                    contact_phone: string
                    contact_email: string | null
                    species: 'dog' | 'cat' | 'other'
                    breed: string | null
                    color: string | null
                    size: 'small' | 'medium' | 'large' | null
                    distinctive_features: string | null
                    name: string | null
                    animal_id: string | null
                    last_seen_address: string
                    last_seen_latitude: number | null
                    last_seen_longitude: number | null
                    last_seen_date: string | null
                    photos: string[]
                    status: 'active' | 'resolved' | 'expired'
                    resolved_at: string | null
                    resolved_note: string | null
                    reward_offered: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    post_type: 'lost' | 'found'
                    user_id: string
                    user_name: string
                    user_role?: UserRole
                    contact_phone: string
                    contact_email?: string | null
                    species: 'dog' | 'cat' | 'other'
                    breed?: string | null
                    color?: string | null
                    size?: 'small' | 'medium' | 'large' | null
                    distinctive_features?: string | null
                    name?: string | null
                    animal_id?: string | null
                    last_seen_address: string
                    last_seen_latitude?: number | null
                    last_seen_longitude?: number | null
                    last_seen_date?: string | null
                    photos: string[]
                    status?: 'active' | 'resolved' | 'expired'
                    resolved_at?: string | null
                    resolved_note?: string | null
                    reward_offered?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    post_type?: 'lost' | 'found'
                    user_id?: string
                    user_name?: string
                    user_role?: UserRole
                    contact_phone?: string
                    contact_email?: string | null
                    species?: 'dog' | 'cat' | 'other'
                    breed?: string | null
                    color?: string | null
                    size?: 'small' | 'medium' | 'large' | null
                    distinctive_features?: string | null
                    name?: string | null
                    animal_id?: string | null
                    last_seen_address?: string
                    last_seen_latitude?: number | null
                    last_seen_longitude?: number | null
                    last_seen_date?: string | null
                    photos?: string[]
                    status?: 'active' | 'resolved' | 'expired'
                    resolved_at?: string | null
                    resolved_note?: string | null
                    reward_offered?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            increment_adoption_views: {
                Args: { post_id: string }
                Returns: void
            }
            increment_adoption_inquiries: {
                Args: { post_id: string }
                Returns: void
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

// ============= TYPE ALIASES FOR CONVENIENCE =============
export type DbUser = Database['public']['Tables']['users']['Row'];
export type DbUserInsert = Database['public']['Tables']['users']['Insert'];
export type DbUserUpdate = Database['public']['Tables']['users']['Update'];

export type DbAnimalReport = Database['public']['Tables']['animal_reports']['Row'];
export type DbAnimalReportInsert = Database['public']['Tables']['animal_reports']['Insert'];
export type DbAnimalReportUpdate = Database['public']['Tables']['animal_reports']['Update'];

export type DbAnimalEmbedding = Database['public']['Tables']['animal_embeddings']['Row'];
export type DbAnimalEmbeddingInsert = Database['public']['Tables']['animal_embeddings']['Insert'];
export type DbAnimalEmbeddingUpdate = Database['public']['Tables']['animal_embeddings']['Update'];

export type DbDisasterZone = Database['public']['Tables']['disaster_zones']['Row'];
export type DbDisasterZoneInsert = Database['public']['Tables']['disaster_zones']['Insert'];
export type DbDisasterZoneUpdate = Database['public']['Tables']['disaster_zones']['Update'];

export type DbStatusHistory = Database['public']['Tables']['status_history']['Row'];
export type DbStatusHistoryInsert = Database['public']['Tables']['status_history']['Insert'];
export type DbStatusHistoryUpdate = Database['public']['Tables']['status_history']['Update'];

export type DbNgoProfile = Database['public']['Tables']['ngo_profiles']['Row'];
export type DbNgoProfileInsert = Database['public']['Tables']['ngo_profiles']['Insert'];
export type DbNgoProfileUpdate = Database['public']['Tables']['ngo_profiles']['Update'];

export type DbAdoptionPost = Database['public']['Tables']['adoption_posts']['Row'];
export type DbAdoptionPostInsert = Database['public']['Tables']['adoption_posts']['Insert'];
export type DbAdoptionPostUpdate = Database['public']['Tables']['adoption_posts']['Update'];

export type DbLostFoundPost = Database['public']['Tables']['lost_found_posts']['Row'];
export type DbLostFoundPostInsert = Database['public']['Tables']['lost_found_posts']['Insert'];
export type DbLostFoundPostUpdate = Database['public']['Tables']['lost_found_posts']['Update'];

// ============= FRONTEND-FRIENDLY TYPES =============

export interface AnimalReport {
    id: string;
    reportId: string;
    reporterId: string;
    reporterName: string;
    reporterPhone?: string;
    species: 'dog' | 'cat' | 'unknown';
    breed?: string;
    color?: string;
    distinctiveFeatures?: string;
    healthNotes?: string;
    isEmergency: boolean;
    imageUrl: string;
    animalId: string;
    address: string;
    latitude?: number;
    longitude?: number;
    weatherCondition?: string;
    temperature?: number;
    weatherAlert?: string;
    isVaccinated: boolean;
    vaccinationDate?: string;
    vaccinationNotes?: string;
    isNeutered: boolean;
    neuteredDate?: string;
    isRescued: boolean;
    rescueDate?: string;
    rescueNotes?: string;
    status: ReportStatus;
    disasterMode: boolean;
    assignedNgoId?: string;
    assignedNgoName?: string;
    ngoNotes?: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    rescueOutcome?: RescueOutcome;
    shelterNgoId?: string;
    isTrackingEnabled?: boolean;
    adoptedByUserId?: string;
    adoptionDate?: string;
}

export interface DisasterZone {
    id: string;
    name: string;
    description?: string;
    centerLatitude: number;
    centerLongitude: number;
    radiusKm: number;
    isActive: boolean;
    severity: DisasterSeverity;
    activatedAt: string;
    deactivatedAt?: string;
}

export interface StatusHistoryEntry {
    id: string;
    reportId: string;
    oldStatus?: string;
    newStatus: string;
    actionType: 'status_change' | 'vaccination' | 'neutering' | 'rescue' | 'assignment';
    changedBy: string;
    changedByName: string;
    notes?: string;
    createdAt: string;
}

export interface NgoProfile {
    id: string;
    userId: string;
    organizationName: string;
    registrationNumber: string;
    licenseDocumentUrl?: string;
    officeAddress: string;
    officePhone: string;
    emergencyPhone?: string;
    email: string;
    website?: string;
    latitude?: number;
    longitude?: number;
    isVerified: boolean;
    verifiedAt?: string;
    verifiedBy?: string;
    operatingHours?: string;
    capacity?: number;
    speciesHandled?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface AdoptionPost {
    id: string;
    reportId?: string;
    animalId: string;
    ngoId: string;
    ngoName: string;
    name?: string;
    species: string;
    breed?: string;
    ageEstimate?: string;
    gender?: 'male' | 'female' | 'unknown';
    size?: 'small' | 'medium' | 'large';
    healthStatus?: string;
    temperament?: string;
    goodWithChildren?: boolean;
    goodWithPets?: boolean;
    isVaccinated: boolean;
    isNeutered: boolean;
    specialNeeds?: string;
    photos: string[];
    videoUrl?: string;
    adoptionFee?: number;
    requirements?: string;
    status: 'available' | 'pending' | 'adopted' | 'withdrawn';
    viewsCount: number;
    inquiriesCount: number;
    createdAt: string;
    updatedAt: string;
    ngoProfile?: NgoProfile;
}

export interface LostFoundPost {
    id: string;
    postType: 'lost' | 'found';
    userId: string;
    userName: string;
    userRole: UserRole;
    contactPhone: string;
    contactEmail?: string;
    species: 'dog' | 'cat' | 'other';
    breed?: string;
    color?: string;
    size?: 'small' | 'medium' | 'large';
    distinctiveFeatures?: string;
    name?: string;
    animalId?: string;
    lastSeenAddress: string;
    lastSeenLatitude?: number;
    lastSeenLongitude?: number;
    lastSeenDate?: string;
    photos: string[];
    status: 'active' | 'resolved' | 'expired';
    resolvedAt?: string;
    resolvedNote?: string;
    rewardOffered?: number;
    createdAt: string;
    updatedAt: string;
}

// ============= CONVERTER FUNCTIONS =============

export function dbToAnimalReport(db: DbAnimalReport): AnimalReport {
    return {
        id: db.id,
        reportId: db.report_id,
        reporterId: db.reporter_id,
        reporterName: db.reporter_name,
        reporterPhone: db.reporter_phone ?? undefined,
        species: db.species,
        breed: db.breed ?? undefined,
        color: db.color ?? undefined,
        distinctiveFeatures: db.distinctive_features ?? undefined,
        healthNotes: db.health_notes ?? undefined,
        isEmergency: db.is_emergency,
        imageUrl: db.image_url,
        animalId: db.animal_id,
        address: db.address,
        latitude: db.latitude ?? undefined,
        longitude: db.longitude ?? undefined,
        weatherCondition: db.weather_condition ?? undefined,
        temperature: db.temperature ?? undefined,
        weatherAlert: db.weather_alert ?? undefined,
        isVaccinated: db.is_vaccinated,
        vaccinationDate: db.vaccination_date ?? undefined,
        vaccinationNotes: db.vaccination_notes ?? undefined,
        isNeutered: db.is_neutered,
        neuteredDate: db.neutered_date ?? undefined,
        isRescued: db.is_rescued,
        rescueDate: db.rescue_date ?? undefined,
        rescueNotes: db.rescue_notes ?? undefined,
        status: db.status,
        disasterMode: db.disaster_mode,
        assignedNgoId: db.assigned_ngo_id ?? undefined,
        assignedNgoName: db.assigned_ngo_name ?? undefined,
        ngoNotes: db.ngo_notes ?? undefined,
        createdAt: db.created_at,
        updatedAt: db.updated_at,
        resolvedAt: db.resolved_at ?? undefined,
        rescueOutcome: db.rescue_outcome ?? undefined,
        shelterNgoId: db.shelter_ngo_id ?? undefined,
        isTrackingEnabled: db.is_tracking_enabled ?? undefined,
        adoptedByUserId: db.adopted_by_user_id ?? undefined,
        adoptionDate: db.adoption_date ?? undefined,
    };
}

export function animalReportToDb(report: Partial<AnimalReport>): DbAnimalReportUpdate {
    const result: DbAnimalReportUpdate = {};
    if (report.reportId !== undefined) result.report_id = report.reportId;
    if (report.reporterId !== undefined) result.reporter_id = report.reporterId;
    if (report.reporterName !== undefined) result.reporter_name = report.reporterName;
    if (report.reporterPhone !== undefined) result.reporter_phone = report.reporterPhone;
    if (report.species !== undefined) result.species = report.species;
    if (report.breed !== undefined) result.breed = report.breed;
    if (report.color !== undefined) result.color = report.color;
    if (report.distinctiveFeatures !== undefined) result.distinctive_features = report.distinctiveFeatures;
    if (report.healthNotes !== undefined) result.health_notes = report.healthNotes;
    if (report.isEmergency !== undefined) result.is_emergency = report.isEmergency;
    if (report.imageUrl !== undefined) result.image_url = report.imageUrl;
    if (report.animalId !== undefined) result.animal_id = report.animalId;
    if (report.address !== undefined) result.address = report.address;
    if (report.latitude !== undefined) result.latitude = report.latitude;
    if (report.longitude !== undefined) result.longitude = report.longitude;
    if (report.isVaccinated !== undefined) result.is_vaccinated = report.isVaccinated;
    if (report.isNeutered !== undefined) result.is_neutered = report.isNeutered;
    if (report.isRescued !== undefined) result.is_rescued = report.isRescued;
    if (report.status !== undefined) result.status = report.status;
    if (report.disasterMode !== undefined) result.disaster_mode = report.disasterMode;
    if (report.assignedNgoId !== undefined) result.assigned_ngo_id = report.assignedNgoId;
    if (report.assignedNgoName !== undefined) result.assigned_ngo_name = report.assignedNgoName;
    if (report.ngoNotes !== undefined) result.ngo_notes = report.ngoNotes;
    return result;
}

export function dbToDisasterZone(db: DbDisasterZone): DisasterZone {
    return {
        id: db.id,
        name: db.name,
        description: db.description ?? undefined,
        centerLatitude: db.center_latitude,
        centerLongitude: db.center_longitude,
        radiusKm: db.radius_km,
        isActive: db.is_active,
        severity: db.severity,
        activatedAt: db.activated_at,
        deactivatedAt: db.deactivated_at ?? undefined,
    };
}

export function dbToNgoProfile(db: DbNgoProfile): NgoProfile {
    return {
        id: db.id,
        userId: db.user_id,
        organizationName: db.organization_name,
        registrationNumber: db.registration_number,
        licenseDocumentUrl: db.license_document_url ?? undefined,
        officeAddress: db.office_address,
        officePhone: db.office_phone,
        emergencyPhone: db.emergency_phone ?? undefined,
        email: db.email,
        website: db.website ?? undefined,
        latitude: db.latitude ?? undefined,
        longitude: db.longitude ?? undefined,
        isVerified: db.is_verified,
        verifiedAt: db.verified_at ?? undefined,
        verifiedBy: db.verified_by ?? undefined,
        operatingHours: db.operating_hours ?? undefined,
        capacity: db.capacity ?? undefined,
        speciesHandled: db.species_handled ?? undefined,
        createdAt: db.created_at,
        updatedAt: db.updated_at,
    };
}

export function dbToAdoptionPost(db: DbAdoptionPost): AdoptionPost {
    return {
        id: db.id,
        reportId: db.report_id ?? undefined,
        animalId: db.animal_id,
        ngoId: db.ngo_id,
        ngoName: db.ngo_name,
        name: db.name ?? undefined,
        species: db.species,
        breed: db.breed ?? undefined,
        ageEstimate: db.age_estimate ?? undefined,
        gender: db.gender ?? undefined,
        size: db.size ?? undefined,
        healthStatus: db.health_status ?? undefined,
        temperament: db.temperament ?? undefined,
        goodWithChildren: db.good_with_children ?? undefined,
        goodWithPets: db.good_with_pets ?? undefined,
        isVaccinated: db.is_vaccinated,
        isNeutered: db.is_neutered,
        specialNeeds: db.special_needs ?? undefined,
        photos: db.photos || [],
        videoUrl: db.video_url ?? undefined,
        adoptionFee: db.adoption_fee ?? undefined,
        requirements: db.requirements ?? undefined,
        status: db.status,
        viewsCount: db.views_count,
        inquiriesCount: db.inquiries_count,
        createdAt: db.created_at,
        updatedAt: db.updated_at,
    };
}

export function dbToLostFoundPost(db: DbLostFoundPost): LostFoundPost {
    return {
        id: db.id,
        postType: db.post_type,
        userId: db.user_id,
        userName: db.user_name,
        userRole: db.user_role,
        contactPhone: db.contact_phone,
        contactEmail: db.contact_email ?? undefined,
        species: db.species,
        breed: db.breed ?? undefined,
        color: db.color ?? undefined,
        size: db.size ?? undefined,
        distinctiveFeatures: db.distinctive_features ?? undefined,
        name: db.name ?? undefined,
        animalId: db.animal_id ?? undefined,
        lastSeenAddress: db.last_seen_address,
        lastSeenLatitude: db.last_seen_latitude ?? undefined,
        lastSeenLongitude: db.last_seen_longitude ?? undefined,
        lastSeenDate: db.last_seen_date ?? undefined,
        photos: db.photos || [],
        status: db.status,
        resolvedAt: db.resolved_at ?? undefined,
        resolvedNote: db.resolved_note ?? undefined,
        rewardOffered: db.reward_offered ?? undefined,
        createdAt: db.created_at,
        updatedAt: db.updated_at,
    };
}
