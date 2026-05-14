// Disaster Mode Types and Interfaces

export type AnimalCondition = 'injured' | 'critical' | 'missing' | 'safe' | 'rescued';
export type AnimalType = 'cat' | 'dog';
export type SortOption = 'nearest' | 'mostCritical' | 'latest';
export type FilterOption = 'all' | 'cats' | 'dogs' | 'critical';

export interface DisasterLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    isActive: boolean;
    animalCount: number;
    lastUpdated: Date;
}

export interface ReporterInfo {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    isVerified: boolean;
}

export interface DisasterAnimal {
    id: string;
    animalType: AnimalType;
    condition: AnimalCondition;
    photos: string[];
    locationName: string;
    latitude: number;
    longitude: number;
    description?: string;
    reporterNotes?: string;
    reporter: ReporterInfo;
    reportedAt: Date;
    lastUpdated: Date;
    isAssigned: boolean;
    assignedTeam?: string;
}

export interface MapPin {
    id: string;
    animalId: string;
    latitude: number;
    longitude: number;
    condition: AnimalCondition;
    animalType: AnimalType;
}

// Helper to get pin color based on condition
export const getPinColor = (condition: AnimalCondition): string => {
    switch (condition) {
        case 'injured':
        case 'critical':
            return '#DC2626'; // Red
        case 'missing':
            return '#F97316'; // Orange
        case 'rescued':
        case 'safe':
            return '#6B7280'; // Gray
        default:
            return '#6B7280';
    }
};

// Helper to get condition label
export const getConditionLabel = (condition: AnimalCondition): string => {
    switch (condition) {
        case 'injured':
            return 'Injured';
        case 'critical':
            return 'Critical';
        case 'missing':
            return 'Missing';
        case 'safe':
            return 'Safe';
        case 'rescued':
            return 'Rescued';
        default:
            return 'Unknown';
    }
};

// Helper to get condition badge color
export const getConditionBadgeColor = (condition: AnimalCondition): { bg: string; text: string } => {
    switch (condition) {
        case 'critical':
            return { bg: '#FEE2E2', text: '#DC2626' };
        case 'injured':
            return { bg: '#FEF3C7', text: '#D97706' };
        case 'missing':
            return { bg: '#FFEDD5', text: '#EA580C' };
        case 'safe':
            return { bg: '#D1FAE5', text: '#059669' };
        case 'rescued':
            return { bg: '#E0E7FF', text: '#4F46E5' };
        default:
            return { bg: '#F3F4F6', text: '#6B7280' };
    }
};
