/**
 * Report Service for PawGuard AI
 * Handles all Supabase operations for animal reports
 */

import { supabase } from '../lib/supabase';
import {
    DbAnimalReport,
    DbAnimalReportInsert,
    DbAnimalEmbedding,
    DbAnimalEmbeddingInsert,
    DbStatusHistory,
    DbStatusHistoryInsert,
    AnimalReport,
    StatusHistoryEntry,
    ReportStatus,
    dbToAnimalReport,
    animalReportToDb,
} from '../lib/supabaseTypes';

// ============= REPORT ID GENERATION =============

/**
 * Generate a unique report ID like "RPT-2024-0001"
 */
export async function generateReportId(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `RPT-${year}`;

    // Get the count of reports this year
    const { count, error } = await supabase
        .from('animal_reports')
        .select('*', { count: 'exact', head: true })
        .like('report_id', `${prefix}%`);

    const nextNum = (count || 0) + 1;
    return `${prefix}-${nextNum.toString().padStart(4, '0')}`;
}

/**
 * Generate a unique animal ID based on species and timestamp
 * Format: "DOG-XXXX" or "CAT-XXXX"
 */
export function generateAnimalId(species: 'dog' | 'cat'): string {
    const prefix = species.toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
}

// ============= CREATE OPERATIONS =============

interface CreateReportParams {
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
    embedding?: number[];
    address: string;
    latitude?: number;
    longitude?: number;
    weatherCondition?: string;
    temperature?: number;
    weatherAlert?: string;
}

/**
 * Create a new animal report
 */
export async function createReport(params: CreateReportParams): Promise<AnimalReport | null> {
    try {
        const reportId = await generateReportId();
        const animalId = generateAnimalId(params.species === 'unknown' ? 'dog' : params.species);

        const dbReport: DbAnimalReportInsert = {
            report_id: reportId,
            reporter_id: params.reporterId,
            reporter_name: params.reporterName,
            reporter_phone: params.reporterPhone,
            species: params.species,
            breed: params.breed,
            color: params.color,
            distinctive_features: params.distinctiveFeatures,
            health_notes: params.healthNotes,
            is_emergency: params.isEmergency,
            image_url: params.imageUrl,
            animal_id: animalId,
            address: params.address,
            latitude: params.latitude,
            longitude: params.longitude,
            weather_condition: params.weatherCondition,
            temperature: params.temperature,
            weather_alert: params.weatherAlert,
            is_vaccinated: false,
            is_neutered: false,
            is_rescued: false,
            status: 'new',
            disaster_mode: false,
        };

        console.log('📝 Creating report:', reportId);

        const { data, error } = await supabase
            .from('animal_reports')
            .insert(dbReport)
            .select()
            .single();

        if (error) {
            console.error('❌ Failed to create report:', error);
            throw error;
        }

        // Store embedding separately if provided
        if (params.embedding && params.embedding.length > 0) {
            await storeAnimalEmbedding({
                animalId,
                embedding: params.embedding,
                imageUrl: params.imageUrl,
                species: params.species === 'unknown' ? 'dog' : params.species,
                createdBy: params.reporterId,
            });
        }

        console.log('✅ Report created:', data.report_id);
        return dbToAnimalReport(data);
    } catch (error) {
        console.error('❌ Error creating report:', error);
        return null;
    }
}

/**
 * Store CLIP embedding for animal identity matching
 */
async function storeAnimalEmbedding(params: {
    animalId: string;
    embedding: number[];
    imageUrl: string;
    species: 'dog' | 'cat';
    createdBy: string;
}): Promise<void> {
    try {
        const embeddingData: DbAnimalEmbeddingInsert = {
            animal_id: params.animalId,
            embedding: params.embedding,
            image_url: params.imageUrl,
            species: params.species,
            created_by: params.createdBy,
            sighting_count: 1,
        };

        const { error } = await supabase
            .from('animal_embeddings')
            .insert(embeddingData);

        if (error) {
            console.error('⚠️ Failed to store embedding:', error);
        } else {
            console.log('✅ Embedding stored for:', params.animalId);
        }
    } catch (error) {
        console.error('❌ Error storing embedding:', error);
    }
}

// ============= READ OPERATIONS =============

/**
 * Get all reports (for NGO dashboard)
 */
export async function getAllReports(options?: {
    status?: ReportStatus;
    disasterMode?: boolean;
    limit?: number;
}): Promise<AnimalReport[]> {
    try {
        let query = supabase
            .from('animal_reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (options?.status) {
            query = query.eq('status', options.status);
        }
        if (options?.disasterMode !== undefined) {
            query = query.eq('disaster_mode', options.disasterMode);
        }
        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;

        return (data || []).map(dbToAnimalReport);
    } catch (error) {
        console.error('❌ Error fetching reports:', error);
        return [];
    }
}

/**
 * Get reports by user (for user's report history)
 */
export async function getReportsByUser(userId: string): Promise<AnimalReport[]> {
    try {
        const { data, error } = await supabase
            .from('animal_reports')
            .select('*')
            .eq('reporter_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(dbToAnimalReport);
    } catch (error) {
        console.error('❌ Error fetching user reports:', error);
        return [];
    }
}

/**
 * Get a single report by ID
 */
export async function getReportById(reportId: string): Promise<AnimalReport | null> {
    try {
        const { data, error } = await supabase
            .from('animal_reports')
            .select('*')
            .eq('id', reportId)
            .single();

        if (error) throw error;

        return data ? dbToAnimalReport(data) : null;
    } catch (error) {
        console.error('❌ Error fetching report:', error);
        return null;
    }
}

/**
 * Get reports in a disaster zone (by coordinates and radius)
 */
export async function getReportsInZone(
    centerLat: number,
    centerLng: number,
    radiusKm: number
): Promise<AnimalReport[]> {
    try {
        // For now, fetch all reports and filter client-side
        // In production, use PostGIS for proper geo queries
        const reports = await getAllReports({ disasterMode: true });

        return reports.filter(report => {
            if (!report.latitude || !report.longitude) return false;

            const distance = calculateDistance(
                centerLat, centerLng,
                report.latitude, report.longitude
            );

            return distance <= radiusKm;
        });
    } catch (error) {
        console.error('❌ Error fetching zone reports:', error);
        return [];
    }
}

// ============= UPDATE OPERATIONS =============

/**
 * Update report status (for NGO)
 */
export async function updateReportStatus(
    reportId: string,
    newStatus: ReportStatus,
    ngoId: string,
    ngoName: string,
    notes?: string
): Promise<boolean> {
    try {
        // Get current status for history
        const current = await getReportById(reportId);
        if (!current) return false;

        const updates: Partial<DbAnimalReport> = {
            status: newStatus,
            updated_at: new Date().toISOString(),
        };

        if (newStatus === 'resolved') {
            updates.resolved_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('animal_reports')
            .update(updates)
            .eq('id', reportId);

        if (error) throw error;

        // Log status change
        await logStatusChange(reportId, current.status, newStatus, ngoId, ngoName, 'status_change', notes);

        console.log('✅ Status updated:', reportId, '->', newStatus);
        return true;
    } catch (error) {
        console.error('❌ Error updating status:', error);
        return false;
    }
}

/**
 * Update vaccination status
 */
export async function updateVaccinationStatus(
    reportId: string,
    isVaccinated: boolean,
    ngoId: string,
    ngoName: string,
    notes?: string
): Promise<boolean> {
    try {
        const updates: Partial<DbAnimalReport> = {
            is_vaccinated: isVaccinated,
            vaccination_date: isVaccinated ? new Date().toISOString().split('T')[0] : undefined,
            vaccination_notes: notes,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('animal_reports')
            .update(updates)
            .eq('id', reportId);

        if (error) throw error;

        await logStatusChange(reportId, undefined, isVaccinated ? 'vaccinated' : 'not_vaccinated', ngoId, ngoName, 'vaccination', notes);

        console.log('✅ Vaccination updated:', reportId);
        return true;
    } catch (error) {
        console.error('❌ Error updating vaccination:', error);
        return false;
    }
}

/**
 * Update neutering status
 */
export async function updateNeuteringStatus(
    reportId: string,
    isNeutered: boolean,
    ngoId: string,
    ngoName: string,
    notes?: string
): Promise<boolean> {
    try {
        const updates: Partial<DbAnimalReport> = {
            is_neutered: isNeutered,
            neutered_date: isNeutered ? new Date().toISOString().split('T')[0] : undefined,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('animal_reports')
            .update(updates)
            .eq('id', reportId);

        if (error) throw error;

        await logStatusChange(reportId, undefined, isNeutered ? 'neutered' : 'not_neutered', ngoId, ngoName, 'neutering', notes);

        console.log('✅ Neutering updated:', reportId);
        return true;
    } catch (error) {
        console.error('❌ Error updating neutering:', error);
        return false;
    }
}

/**
 * Update rescue status
 */
export async function updateRescueStatus(
    reportId: string,
    isRescued: boolean,
    ngoId: string,
    ngoName: string,
    notes?: string
): Promise<boolean> {
    try {
        const updates: Partial<DbAnimalReport> = {
            is_rescued: isRescued,
            rescue_date: isRescued ? new Date().toISOString().split('T')[0] : undefined,
            rescue_notes: notes,
            updated_at: new Date().toISOString(),
        };

        // Also update status if rescued
        if (isRescued) {
            updates.status = 'rescued';
        }

        const { error } = await supabase
            .from('animal_reports')
            .update(updates)
            .eq('id', reportId);

        if (error) throw error;

        await logStatusChange(reportId, undefined, isRescued ? 'rescued' : 'not_rescued', ngoId, ngoName, 'rescue', notes);

        console.log('✅ Rescue status updated:', reportId);
        return true;
    } catch (error) {
        console.error('❌ Error updating rescue:', error);
        return false;
    }
}

/**
 * Assign report to NGO
 */
export async function assignReportToNgo(
    reportId: string,
    ngoId: string,
    ngoName: string
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('animal_reports')
            .update({
                assigned_ngo_id: ngoId,
                assigned_ngo_name: ngoName,
                status: 'in_progress',
                updated_at: new Date().toISOString(),
            })
            .eq('id', reportId);

        if (error) throw error;

        await logStatusChange(reportId, 'new', 'in_progress', ngoId, ngoName, 'assignment', `Assigned to ${ngoName}`);

        console.log('✅ Report assigned to:', ngoName);
        return true;
    } catch (error) {
        console.error('❌ Error assigning report:', error);
        return false;
    }
}

/**
 * Add or update NGO notes for a report
 */
export async function addNgoNotes(
    reportId: string,
    notes: string
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('animal_reports')
            .update({
                ngo_notes: notes,
                updated_at: new Date().toISOString(),
            })
            .eq('id', reportId);

        if (error) throw error;

        console.log('✅ NGO notes updated:', reportId);
        return true;
    } catch (error) {
        console.error('❌ Error updating NGO notes:', error);
        return false;
    }
}

/**
 * Set disaster mode for reports in a zone
 */
export async function setDisasterModeForZone(
    centerLat: number,
    centerLng: number,
    radiusKm: number,
    enabled: boolean
): Promise<number> {
    try {
        // Get all reports in the zone
        const reports = await getReportsInZone(centerLat, centerLng, Infinity);

        let count = 0;
        for (const report of reports) {
            if (!report.latitude || !report.longitude) continue;

            const distance = calculateDistance(centerLat, centerLng, report.latitude, report.longitude);

            if (distance <= radiusKm) {
                await supabase
                    .from('animal_reports')
                    .update({ disaster_mode: enabled })
                    .eq('id', report.id);
                count++;
            }
        }

        console.log(`✅ Set disaster mode (${enabled}) for ${count} reports`);
        return count;
    } catch (error) {
        console.error('❌ Error setting disaster mode:', error);
        return 0;
    }
}

/**
 * Get all reports within a disaster zone by zone ID
 * Uses the zone's center coordinates and radius
 */
export async function getReportsInDisasterZone(
    zoneId: string
): Promise<AnimalReport[]> {
    try {
        // First get the zone details
        const { data: zone, error: zoneError } = await supabase
            .from('disaster_zones')
            .select('*')
            .eq('id', zoneId)
            .single();

        if (zoneError || !zone) {
            console.error('❌ Disaster zone not found:', zoneId);
            return [];
        }

        // Get all reports with location data
        const allReports = await getReportsInZone(
            zone.center_latitude,
            zone.center_longitude,
            zone.radius_km
        );

        console.log(`📍 Found ${allReports.length} reports in zone: ${zone.name}`);
        return allReports;
    } catch (error) {
        console.error('❌ Error getting reports in disaster zone:', error);
        return [];
    }
}

/**
 * Get all reports marked with disaster mode
 */
export async function getDisasterModeReports(): Promise<AnimalReport[]> {
    try {
        const { data, error } = await supabase
            .from('animal_reports')
            .select('*')
            .eq('disaster_mode', true)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(dbToAnimalReport);
    } catch (error) {
        console.error('❌ Error fetching disaster mode reports:', error);
        return [];
    }
}

// ============= STATUS HISTORY =============

async function logStatusChange(
    reportId: string,
    oldStatus: string | undefined,
    newStatus: string,
    changedBy: string,
    changedByName: string,
    actionType: 'status_change' | 'vaccination' | 'neutering' | 'rescue' | 'assignment',
    notes?: string
): Promise<void> {
    try {
        await supabase.from('status_history').insert({
            report_id: reportId,
            old_status: oldStatus,
            new_status: newStatus,
            action_type: actionType,
            changed_by: changedBy,
            changed_by_name: changedByName,
            notes,
        });
    } catch (error) {
        console.error('⚠️ Failed to log status change:', error);
    }
}

/**
 * Get status history for a report
 */
export async function getStatusHistory(reportId: string): Promise<StatusHistoryEntry[]> {
    try {
        const { data, error } = await supabase
            .from('status_history')
            .select('*')
            .eq('report_id', reportId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((item: DbStatusHistory) => ({
            id: item.id,
            reportId: item.report_id,
            oldStatus: item.old_status ?? undefined,
            newStatus: item.new_status,
            actionType: item.action_type,
            changedBy: item.changed_by,
            changedByName: item.changed_by_name,
            notes: item.notes ?? undefined,
            createdAt: item.created_at,
        }));
    } catch (error) {
        console.error('❌ Error fetching status history:', error);
        return [];
    }
}

// ============= REAL-TIME SUBSCRIPTIONS =============

/**
 * Subscribe to real-time report updates
 */
export function subscribeToReportUpdates(
    callback: (report: AnimalReport) => void
): () => void {
    const subscription = supabase
        .channel('report-updates')
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'animal_reports',
            },
            (payload: { new: unknown; old: unknown }) => {
                console.log('📡 Real-time update:', payload);
                if (payload.new) {
                    callback(dbToAnimalReport(payload.new as DbAnimalReport));
                }
            }
        )
        .subscribe();

    // Return unsubscribe function
    return () => {
        subscription.unsubscribe();
    };
}

/**
 * Subscribe to a specific report's updates
 */
export function subscribeToReport(
    reportId: string,
    callback: (report: AnimalReport) => void
): () => void {
    const subscription = supabase
        .channel(`report-${reportId}`)
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'animal_reports',
                filter: `id=eq.${reportId}`,
            },
            (payload: { new: unknown; old: unknown }) => {
                console.log('📡 Report update:', payload);
                if (payload.new) {
                    callback(dbToAnimalReport(payload.new as DbAnimalReport));
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

export default {
    createReport,
    generateReportId,
    generateAnimalId,
    getAllReports,
    getReportsByUser,
    getReportById,
    getReportsInZone,
    getReportsInDisasterZone,
    getDisasterModeReports,
    updateReportStatus,
    updateVaccinationStatus,
    updateNeuteringStatus,
    updateRescueStatus,
    assignReportToNgo,
    addNgoNotes,
    setDisasterModeForZone,
    getStatusHistory,
    subscribeToReportUpdates,
    subscribeToReport,
};
