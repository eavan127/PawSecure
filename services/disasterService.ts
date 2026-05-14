/**
 * Disaster Service for PawGuard AI
 * Manages disaster zones and emergency mode operations
 */

import { supabase } from '../lib/supabase';
import { DbDisasterZone, DbDisasterZoneInsert, DisasterZone, dbToDisasterZone } from '../lib/supabaseTypes';
import { setDisasterModeForZone } from './reportService';

// ============= MOCK DISASTER DATA FOR SABAH EARTHQUAKE DEMO =============

export const MOCK_DISASTER_ZONES: Omit<DisasterZone, 'id'>[] = [
    {
        name: 'Sabah Earthquake Zone - Ranau',
        description: 'Earthquake affected area near Mount Kinabalu. Multiple aftershocks reported.',
        centerLatitude: 5.9631,
        centerLongitude: 116.6661,
        radiusKm: 50,
        isActive: true,
        severity: 'critical',
        activatedAt: new Date().toISOString(),
    },
    {
        name: 'Sabah Earthquake Zone - Kundasang',
        description: 'Highland area with stranded animals due to landslides.',
        centerLatitude: 6.0167,
        centerLongitude: 116.5667,
        radiusKm: 30,
        isActive: true,
        severity: 'high',
        activatedAt: new Date().toISOString(),
    },
    {
        name: 'Kota Kinabalu Coastal Alert',
        description: 'Coastal flooding risk. Monitor beach areas for strays.',
        centerLatitude: 5.9804,
        centerLongitude: 116.0735,
        radiusKm: 40,
        isActive: false,
        severity: 'medium',
        activatedAt: new Date().toISOString(),
    },
];

// ============= CREATE OPERATIONS =============

/**
 * Create a new disaster zone
 */
export async function createDisasterZone(zone: Omit<DisasterZone, 'id'>): Promise<DisasterZone | null> {
    try {
        const dbZone: DbDisasterZoneInsert = {
            name: zone.name,
            description: zone.description,
            center_latitude: zone.centerLatitude,
            center_longitude: zone.centerLongitude,
            radius_km: zone.radiusKm,
            is_active: zone.isActive,
            severity: zone.severity,
            activated_at: zone.activatedAt,
        };

        const { data, error } = await supabase
            .from('disaster_zones')
            .insert(dbZone)
            .select()
            .single();

        if (error) throw error;

        console.log('✅ Disaster zone created:', data.name);

        // If active, set disaster mode for reports in the zone
        if (zone.isActive) {
            await setDisasterModeForZone(
                zone.centerLatitude,
                zone.centerLongitude,
                zone.radiusKm,
                true
            );
        }

        return dbToDisasterZone(data);
    } catch (error) {
        console.error('❌ Error creating disaster zone:', error);
        return null;
    }
}

/**
 * Initialize mock disaster data for demo
 */
export async function initializeMockDisasterData(): Promise<void> {
    try {
        // Check if zones already exist
        const { count } = await supabase
            .from('disaster_zones')
            .select('*', { count: 'exact', head: true });

        if (count && count > 0) {
            console.log('📍 Disaster zones already initialized');
            return;
        }

        console.log('🌋 Initializing mock disaster zones for Sabah...');

        for (const zone of MOCK_DISASTER_ZONES) {
            await createDisasterZone(zone);
        }

        console.log('✅ Mock disaster data initialized');
    } catch (error) {
        console.error('❌ Error initializing mock data:', error);
    }
}

// ============= READ OPERATIONS =============

/**
 * Get all disaster zones
 */
export async function getAllDisasterZones(activeOnly: boolean = false): Promise<DisasterZone[]> {
    try {
        let query = supabase
            .from('disaster_zones')
            .select('*')
            .order('activated_at', { ascending: false });

        if (activeOnly) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        return (data || []).map(dbToDisasterZone);
    } catch (error) {
        console.error('❌ Error fetching disaster zones:', error);
        return [];
    }
}

/**
 * Get active disaster zones only
 */
export async function getActiveDisasterZones(): Promise<DisasterZone[]> {
    return getAllDisasterZones(true);
}

/**
 * Get disaster zone by ID
 */
export async function getDisasterZoneById(zoneId: string): Promise<DisasterZone | null> {
    try {
        const { data, error } = await supabase
            .from('disaster_zones')
            .select('*')
            .eq('id', zoneId)
            .single();

        if (error) throw error;

        return data ? dbToDisasterZone(data) : null;
    } catch (error) {
        console.error('❌ Error fetching disaster zone:', error);
        return null;
    }
}

/**
 * Check if a location is in any active disaster zone
 */
export async function isLocationInDisasterZone(
    latitude: number,
    longitude: number
): Promise<{ inZone: boolean; zone?: DisasterZone }> {
    try {
        const activeZones = await getActiveDisasterZones();

        for (const zone of activeZones) {
            const distance = calculateDistance(
                latitude, longitude,
                zone.centerLatitude, zone.centerLongitude
            );

            if (distance <= zone.radiusKm) {
                return { inZone: true, zone };
            }
        }

        return { inZone: false };
    } catch (error) {
        console.error('❌ Error checking location:', error);
        return { inZone: false };
    }
}

// ============= UPDATE OPERATIONS =============

/**
 * Activate a disaster zone
 */
export async function activateDisasterZone(
    zoneId: string,
    ngoId?: string
): Promise<boolean> {
    try {
        const zone = await getDisasterZoneById(zoneId);
        if (!zone) return false;

        const { error } = await supabase
            .from('disaster_zones')
            .update({
                is_active: true,
                activated_at: new Date().toISOString(),
            })
            .eq('id', zoneId);

        if (error) throw error;

        // Set disaster mode for all reports in the zone
        await setDisasterModeForZone(
            zone.centerLatitude,
            zone.centerLongitude,
            zone.radiusKm,
            true
        );

        console.log('🚨 Disaster zone activated:', zone.name);
        return true;
    } catch (error) {
        console.error('❌ Error activating disaster zone:', error);
        return false;
    }
}

/**
 * Deactivate a disaster zone
 */
export async function deactivateDisasterZone(zoneId: string): Promise<boolean> {
    try {
        const zone = await getDisasterZoneById(zoneId);
        if (!zone) return false;

        const { error } = await supabase
            .from('disaster_zones')
            .update({
                is_active: false,
                deactivated_at: new Date().toISOString(),
            })
            .eq('id', zoneId);

        if (error) throw error;

        // Remove disaster mode from reports in the zone
        await setDisasterModeForZone(
            zone.centerLatitude,
            zone.centerLongitude,
            zone.radiusKm,
            false
        );

        console.log('✅ Disaster zone deactivated:', zone.name);
        return true;
    } catch (error) {
        console.error('❌ Error deactivating disaster zone:', error);
        return false;
    }
}

/**
 * Update disaster zone severity
 */
export async function updateDisasterZoneSeverity(
    zoneId: string,
    severity: 'low' | 'medium' | 'high' | 'critical'
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('disaster_zones')
            .update({ severity })
            .eq('id', zoneId);

        if (error) throw error;

        console.log('✅ Disaster severity updated to:', severity);
        return true;
    } catch (error) {
        console.error('❌ Error updating severity:', error);
        return false;
    }
}

// ============= REAL-TIME SUBSCRIPTIONS =============

/**
 * Subscribe to disaster zone changes
 */
export function subscribeToDisasterZones(
    callback: (zone: DisasterZone) => void
): () => void {
    const subscription = supabase
        .channel('disaster-zones')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'disaster_zones',
            },
            (payload: { new: unknown; old: unknown }) => {
                console.log('📡 Disaster zone update:', payload);
                if (payload.new) {
                    callback(dbToDisasterZone(payload.new as DbDisasterZone));
                }
            }
        )
        .subscribe();

    return () => {
        subscription.unsubscribe();
    };
}

// ============= HELPER FUNCTIONS =============

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Get severity color for UI
 */
export function getSeverityColor(severity: string): { bg: string; text: string } {
    switch (severity) {
        case 'critical':
            return { bg: '#FEE2E2', text: '#DC2626' };
        case 'high':
            return { bg: '#FEF3C7', text: '#D97706' };
        case 'medium':
            return { bg: '#FEF9C3', text: '#CA8A04' };
        case 'low':
            return { bg: '#D1FAE5', text: '#059669' };
        default:
            return { bg: '#F3F4F6', text: '#6B7280' };
    }
}

export default {
    createDisasterZone,
    initializeMockDisasterData,
    getAllDisasterZones,
    getActiveDisasterZones,
    getDisasterZoneById,
    isLocationInDisasterZone,
    activateDisasterZone,
    deactivateDisasterZone,
    updateDisasterZoneSeverity,
    subscribeToDisasterZones,
    getSeverityColor,
    MOCK_DISASTER_ZONES,
};
