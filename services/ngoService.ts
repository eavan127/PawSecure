/**
 * NGO Service for PawGuard AI
 * Handles NGO profile creation, verification, and contact retrieval
 */

import { supabase } from '../lib/supabase';
import { DbNgoProfile, DbNgoProfileInsert, NgoProfile, dbToNgoProfile } from '../lib/supabaseTypes';

// ============= CREATE OPERATIONS =============

interface CreateNgoProfileParams {
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
    operatingHours?: string;
    capacity?: number;
    speciesHandled?: string[];
}

/**
 * Create an NGO profile for a user
 */
export async function createNgoProfile(params: CreateNgoProfileParams): Promise<NgoProfile | null> {
    try {

        const dbProfile: DbNgoProfileInsert = {
            user_id: params.userId,
            organization_name: params.organizationName,
            registration_number: params.registrationNumber,
            license_document_url: params.licenseDocumentUrl,
            office_address: params.officeAddress,
            office_phone: params.officePhone,
            emergency_phone: params.emergencyPhone,
            email: params.email,
            website: params.website,
            latitude: params.latitude,
            longitude: params.longitude,
            operating_hours: params.operatingHours,
            capacity: params.capacity,
            species_handled: params.speciesHandled,
        };

        const { data, error } = await supabase
            .from('ngo_profiles')
            .insert(dbProfile)
            .select()
            .single();

        if (error) throw error;

        console.log('✅ NGO profile created:', data.organization_name);
        return dbToNgoProfile(data);
    } catch (error) {
        console.error('❌ Error creating NGO profile:', error);
        return null;
    }
}

// ============= READ OPERATIONS =============

/**
 * Get NGO profile by user ID
 */
export async function getNgoProfileByUserId(userId: string): Promise<NgoProfile | null> {
    try {
        const { data, error } = await supabase
            .from('ngo_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        return data ? dbToNgoProfile(data) : null;
    } catch (error) {
        console.error('❌ Error fetching NGO profile:', error);
        return null;
    }
}

/**
 * Get NGO profile by profile ID
 */
export async function getNgoProfileById(profileId: string): Promise<NgoProfile | null> {
    try {
        const { data, error } = await supabase
            .from('ngo_profiles')
            .select('*')
            .eq('id', profileId)
            .single();

        if (error) throw error;

        return data ? dbToNgoProfile(data) : null;
    } catch (error) {
        console.error('❌ Error fetching NGO profile:', error);
        return null;
    }
}

/**
 * Get all verified NGO profiles
 */
export async function getVerifiedNgos(): Promise<NgoProfile[]> {
    try {
        const { data, error } = await supabase
            .from('ngo_profiles')
            .select('*')
            .eq('is_verified', true)
            .order('organization_name', { ascending: true });

        if (error) throw error;

        return (data || []).map(dbToNgoProfile);
    } catch (error) {
        console.error('❌ Error fetching verified NGOs:', error);
        return [];
    }
}

/**
 * Get all NGO profiles (for admin)
 */
export async function getAllNgoProfiles(): Promise<NgoProfile[]> {
    try {
        const { data, error } = await supabase
            .from('ngo_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(dbToNgoProfile);
    } catch (error) {
        console.error('❌ Error fetching all NGOs:', error);
        return [];
    }
}

/**
 * Get NGO contact info for adoption inquiries
 */
export async function getNgoContact(ngoId: string): Promise<{
    name: string;
    phone: string;
    emergencyPhone?: string;
    email: string;
    address: string;
    latitude?: number;
    longitude?: number;
} | null> {
    try {
        const { data, error } = await supabase
            .from('ngo_profiles')
            .select('organization_name, office_phone, emergency_phone, email, office_address, latitude, longitude')
            .eq('id', ngoId)
            .single();

        if (error) throw error;

        return data ? {
            name: data.organization_name,
            phone: data.office_phone,
            emergencyPhone: data.emergency_phone ?? undefined,
            email: data.email,
            address: data.office_address,
            latitude: data.latitude ?? undefined,
            longitude: data.longitude ?? undefined,
        } : null;
    } catch (error) {
        console.error('❌ Error fetching NGO contact:', error);
        return null;
    }
}

// ============= UPDATE OPERATIONS =============

/**
 * Update NGO profile
 */
export async function updateNgoProfile(
    profileId: string,
    updates: Partial<CreateNgoProfileParams>
): Promise<boolean> {
    try {
        const updateData: Partial<DbNgoProfile> = {};

        if (updates.organizationName) updateData.organization_name = updates.organizationName;
        if (updates.registrationNumber) updateData.registration_number = updates.registrationNumber;
        if (updates.licenseDocumentUrl) updateData.license_document_url = updates.licenseDocumentUrl;
        if (updates.officeAddress) updateData.office_address = updates.officeAddress;
        if (updates.officePhone) updateData.office_phone = updates.officePhone;
        if (updates.emergencyPhone !== undefined) updateData.emergency_phone = updates.emergencyPhone;
        if (updates.email) updateData.email = updates.email;
        if (updates.website !== undefined) updateData.website = updates.website;
        if (updates.latitude !== undefined) updateData.latitude = updates.latitude;
        if (updates.longitude !== undefined) updateData.longitude = updates.longitude;
        if (updates.operatingHours !== undefined) updateData.operating_hours = updates.operatingHours;
        if (updates.capacity !== undefined) updateData.capacity = updates.capacity;
        if (updates.speciesHandled !== undefined) updateData.species_handled = updates.speciesHandled;

        updateData.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from('ngo_profiles')
            .update(updateData)
            .eq('id', profileId);

        if (error) throw error;

        console.log('✅ NGO profile updated');
        return true;
    } catch (error) {
        console.error('❌ Error updating NGO profile:', error);
        return false;
    }
}

/**
 * Verify an NGO (admin function)
 */
export async function verifyNgo(profileId: string, verifiedBy: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('ngo_profiles')
            .update({
                is_verified: true,
                verified_at: new Date().toISOString(),
                verified_by: verifiedBy,
            })
            .eq('id', profileId);

        if (error) throw error;

        console.log('✅ NGO verified');
        return true;
    } catch (error) {
        console.error('❌ Error verifying NGO:', error);
        return false;
    }
}

export default {
    createNgoProfile,
    getNgoProfileByUserId,
    getNgoProfileById,
    getVerifiedNgos,
    getAllNgoProfiles,
    getNgoContact,
    updateNgoProfile,
    verifyNgo,
};
