// TypeScript type definitions for PawGuard AI

export type UserRole = 'citizen' | 'ngo';

export type AlertStatus = 'critical' | 'review' | 'active';

export interface Alert {
    id: string;
    title: string;
    description: string;
    location: string;
    timestamp: string;
    status: AlertStatus;
    icon: string;
}

export interface Stat {
    label: string;
    value: number;
    icon: string;
    positive: boolean;
}

export interface AnimalProfile {
    id: string;
    name: string;
    species: 'dog' | 'cat';
    breed: string;
    size: string;
    color: string;
    imageUrl: string;
    priority: 'high' | 'medium' | 'low';
    vaccinated: boolean;
    neutered: boolean;
    atRisk: boolean;
    lastSeen: string;
    location: string;
}

export interface ActivityItem {
    id: string;
    type: 'location' | 'medical' | 'intake' | 'rescue';
    title: string;
    description: string;
    timestamp: string;
    icon: string;
}

export interface MapMarker {
    id: string;
    latitude: number;
    longitude: number;
    type: 'critical' | 'canine' | 'feline' | 'drowning';
    label: string;
}

// ============= NEW TYPES FOR ANIMAL RECOGNITION SYSTEM =============

export type AnimalStatus = 'waiting' | 'in_care' | 'rescued' | 'adopted';

export interface AnimalIdentity {
    id: string;
    systemId: string;                    // Unique system ID (e.g., "PG-2024-0001")
    species: 'dog' | 'cat';
    breed: string;
    color: string;
    distinctiveFeatures: string[];       // AI-detected marks
    featureHash: string;                 // Searchable hash for matching
    primaryImageUrl: string;
    embedding?: number[];                // 512-number fingerprint for identity matching

    // Status tracking
    status: AnimalStatus;
    isVaccinated: boolean;
    vaccinationDate?: string;
    isNeutered: boolean;

    // NGO tracking
    assignedNgoId?: string;
    assignedNgoName?: string;
    ngoAssignedDate?: string;

    // Timeline
    firstReportedAt: string;
    firstReportedBy: string;
    createdBy: string;                   // User ID who created this animal
    lastSeenAt: string;
    lastSeenLocation: string;

    // History
    reportHistory: ReportEntry[];
    careHistory: CareEntry[];
}

export interface ReportEntry {
    id: string;
    reporterId: string;
    reporterName: string;
    location: string;
    coordinates?: { lat: number; lng: number };
    imageUrl: string;
    condition: string;
    notes: string;
    timestamp: string;
    embedding?: number[];
}

export type CareAction = 'intake' | 'vaccination' | 'neutering' | 'treatment' | 'release' | 'adoption';

export interface CareEntry {
    id: string;
    ngoId: string;
    ngoName: string;
    action: CareAction;
    notes: string;
    timestamp: string;
}

// ============= NGO REPORT MANAGEMENT TYPES =============

export type ReportStatus = 'new' | 'in_progress' | 'resolved';
export type InjurySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface NGOReport {
    id: string;
    reportId: string;                    // Display ID (e.g., "RPT-2024-0001")

    // Animal Information
    animalType: 'dog' | 'cat' | 'other';
    animalBreed?: string;
    animalColor?: string;
    injurySeverity: InjurySeverity;
    injuryDescription: string;

    // Media
    photos: string[];                    // Array of image URLs

    // Location
    location: string;                    // Address or description
    coordinates?: { lat: number; lng: number };

    // Reporter Information
    reporterName: string;
    reporterPhone?: string;
    reporterEmail?: string;
    reporterUserId?: string;

    // Status & Timestamps
    status: ReportStatus;
    reportedAt: string;                  // ISO date string
    updatedAt: string;
    resolvedAt?: string;

    // NGO Tracking
    assignedNgoId?: string;
    assignedVolunteer?: string;
    internalNotes?: string;
}

// ============= NGO ADOPTION TYPES =============

export type AdoptionStatus = 'available' | 'pending' | 'adopted';
export type PersonalityTrait = 'friendly' | 'calm' | 'active' | 'shy' | 'playful' | 'independent' | 'affectionate' | 'protective';

export interface AdoptionPost {
    id: string;
    postId: string;                      // Display ID (e.g., "ADOPT-2024-0001")

    // Animal Information
    name: string;
    species: 'dog' | 'cat';
    breed: string;
    age: string;                         // e.g., "2 years", "6 months"
    gender: 'male' | 'female';
    size: 'small' | 'medium' | 'large';
    color: string;

    // Health & Personality
    isVaccinated: boolean;
    isNeutered: boolean;
    isHealthy: boolean;
    healthNotes?: string;
    personalityTraits: PersonalityTrait[];

    // Media
    photos: string[];

    // Adoption Details
    adoptionRequirements: string;
    adoptionFee?: number;

    // Status
    status: AdoptionStatus;

    // NGO Information
    ngoId: string;
    ngoName: string;
    contactPhone?: string;
    contactEmail?: string;

    // Engagement
    interestedCount: number;
    commentCount: number;

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

export interface AdoptionInquiry {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    userPhone?: string;
    userEmail?: string;
    message: string;
    createdAt: string;
}
