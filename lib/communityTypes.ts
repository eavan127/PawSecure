/**
 * Community Types for PawGuard AI
 * Types for adoption posts, lost & found, and NGO profiles
 */

// ============= DATABASE TYPES =============

export interface DbNgoProfile {
    id: string;
    user_id: string;
    organization_name: string;
    registration_number: string;
    license_document_url?: string;
    office_address: string;
    office_phone: string;
    emergency_phone?: string;
    email: string;
    website?: string;
    latitude?: number;
    longitude?: number;
    is_verified: boolean;
    verified_at?: string;
    verified_by?: string;
    operating_hours?: string;
    capacity?: number;
    species_handled?: string[];
    created_at: string;
    updated_at: string;
}

export interface DbAdoptionPost {
    id: string;
    report_id?: string;
    animal_id: string;
    ngo_id: string;
    ngo_name: string;
    name?: string;
    species: string;
    breed?: string;
    age_estimate?: string;
    gender?: 'male' | 'female' | 'unknown';
    size?: 'small' | 'medium' | 'large';
    health_status?: string;
    temperament?: string;
    good_with_children?: boolean;
    good_with_pets?: boolean;
    is_vaccinated: boolean;
    is_neutered: boolean;
    special_needs?: string;
    photos: string[];
    video_url?: string;
    adoption_fee?: number;
    requirements?: string;
    status: 'available' | 'pending' | 'adopted' | 'withdrawn';
    views_count: number;
    inquiries_count: number;
    created_at: string;
    updated_at: string;
}

export interface DbLostFoundPost {
    id: string;
    post_type: 'lost' | 'found';
    user_id: string;
    user_name: string;
    user_role: 'citizen' | 'ngo';
    contact_phone: string;
    contact_email?: string;
    species: 'dog' | 'cat' | 'other';
    breed?: string;
    color?: string;
    size?: 'small' | 'medium' | 'large';
    distinctive_features?: string;
    name?: string;
    animal_id?: string;
    last_seen_address: string;
    last_seen_latitude?: number;
    last_seen_longitude?: number;
    last_seen_date?: string;
    photos: string[];
    status: 'active' | 'resolved' | 'expired';
    resolved_at?: string;
    resolved_note?: string;
    reward_offered?: number;
    created_at: string;
    updated_at: string;
}

// ============= FRONTEND TYPES =============

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
    // Joined data
    ngoProfile?: NgoProfile;
}

export interface LostFoundPost {
    id: string;
    postType: 'lost' | 'found';
    userId: string;
    userName: string;
    userRole: 'citizen' | 'ngo';
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

export type RescueOutcome = 'released_to_nature' | 'shelter_recovery' | 'adopted' | 'deceased';

// ============= CONVERTER FUNCTIONS =============

export function dbToNgoProfile(db: DbNgoProfile): NgoProfile {
    return {
        id: db.id,
        userId: db.user_id,
        organizationName: db.organization_name,
        registrationNumber: db.registration_number,
        licenseDocumentUrl: db.license_document_url,
        officeAddress: db.office_address,
        officePhone: db.office_phone,
        emergencyPhone: db.emergency_phone,
        email: db.email,
        website: db.website,
        latitude: db.latitude,
        longitude: db.longitude,
        isVerified: db.is_verified,
        verifiedAt: db.verified_at,
        verifiedBy: db.verified_by,
        operatingHours: db.operating_hours,
        capacity: db.capacity,
        speciesHandled: db.species_handled,
        createdAt: db.created_at,
        updatedAt: db.updated_at,
    };
}

export function dbToAdoptionPost(db: DbAdoptionPost): AdoptionPost {
    return {
        id: db.id,
        reportId: db.report_id,
        animalId: db.animal_id,
        ngoId: db.ngo_id,
        ngoName: db.ngo_name,
        name: db.name,
        species: db.species,
        breed: db.breed,
        ageEstimate: db.age_estimate,
        gender: db.gender,
        size: db.size,
        healthStatus: db.health_status,
        temperament: db.temperament,
        goodWithChildren: db.good_with_children,
        goodWithPets: db.good_with_pets,
        isVaccinated: db.is_vaccinated,
        isNeutered: db.is_neutered,
        specialNeeds: db.special_needs,
        photos: db.photos || [],
        videoUrl: db.video_url,
        adoptionFee: db.adoption_fee,
        requirements: db.requirements,
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
        contactEmail: db.contact_email,
        species: db.species,
        breed: db.breed,
        color: db.color,
        size: db.size,
        distinctiveFeatures: db.distinctive_features,
        name: db.name,
        animalId: db.animal_id,
        lastSeenAddress: db.last_seen_address,
        lastSeenLatitude: db.last_seen_latitude,
        lastSeenLongitude: db.last_seen_longitude,
        lastSeenDate: db.last_seen_date,
        photos: db.photos || [],
        status: db.status,
        resolvedAt: db.resolved_at,
        resolvedNote: db.resolved_note,
        rewardOffered: db.reward_offered,
        createdAt: db.created_at,
        updatedAt: db.updated_at,
    };
}
