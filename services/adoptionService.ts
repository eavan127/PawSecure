/**
 * Adoption Service for PawGuard AI
 * Handles adoption post creation, listing, and status management
 */

import { supabase } from '../lib/supabase';
import { DbAdoptionPost, DbAdoptionPostInsert, DbNgoProfile, AdoptionPost, dbToAdoptionPost, dbToNgoProfile } from '../lib/supabaseTypes';

// ============= CREATE OPERATIONS =============

interface CreateAdoptionPostParams {
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
    isVaccinated?: boolean;
    isNeutered?: boolean;
    specialNeeds?: string;
    photos: string[];
    videoUrl?: string;
    adoptionFee?: number;
    requirements?: string;
}

/**
 * Create an adoption post
 */
export async function createAdoptionPost(params: CreateAdoptionPostParams): Promise<AdoptionPost | null> {
    try {
        const dbPost: DbAdoptionPostInsert = {
            report_id: params.reportId,
            animal_id: params.animalId,
            ngo_id: params.ngoId,
            ngo_name: params.ngoName,
            name: params.name,
            species: params.species,
            breed: params.breed,
            age_estimate: params.ageEstimate,
            gender: params.gender,
            size: params.size,
            health_status: params.healthStatus,
            temperament: params.temperament,
            good_with_children: params.goodWithChildren,
            good_with_pets: params.goodWithPets,
            is_vaccinated: params.isVaccinated || false,
            is_neutered: params.isNeutered || false,
            special_needs: params.specialNeeds,
            photos: params.photos,
            video_url: params.videoUrl,
            adoption_fee: params.adoptionFee,
            requirements: params.requirements,
            status: 'available',
        };

        const { data, error } = await supabase
            .from('adoption_posts')
            .insert(dbPost)
            .select()
            .single();

        if (error) throw error;

        console.log('✅ Adoption post created:', data.name || data.animal_id);
        return dbToAdoptionPost(data);
    } catch (error) {
        console.error('❌ Error creating adoption post:', error);
        return null;
    }
}

// ============= READ OPERATIONS =============

/**
 * Get all available adoption posts
 */
export async function getAvailableAdoptionPosts(): Promise<AdoptionPost[]> {
    try {
        const { data, error } = await supabase
            .from('adoption_posts')
            .select('*')
            .eq('status', 'available')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(dbToAdoptionPost);
    } catch (error) {
        console.error('❌ Error fetching adoption posts:', error);
        return [];
    }
}

/**
 * Get adoption posts with NGO profile joined
 */
export async function getAdoptionPostsWithNgo(): Promise<AdoptionPost[]> {
    try {
        const { data, error } = await supabase
            .from('adoption_posts')
            .select(`
                *,
                ngo_profiles:ngo_id (*)
            `)
            .eq('status', 'available')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((item: DbAdoptionPost & { ngo_profiles?: DbNgoProfile }) => {
            const post = dbToAdoptionPost(item);
            if (item.ngo_profiles) {
                post.ngoProfile = dbToNgoProfile(item.ngo_profiles);
            }
            return post;
        });
    } catch (error) {
        console.error('❌ Error fetching adoption posts with NGO:', error);
        return [];
    }
}

/**
 * Get adoption post by ID
 */
export async function getAdoptionPostById(postId: string): Promise<AdoptionPost | null> {
    try {
        const { data, error } = await supabase
            .from('adoption_posts')
            .select(`
                *,
                ngo_profiles:ngo_id (*)
            `)
            .eq('id', postId)
            .single();

        if (error) throw error;

        if (!data) return null;

        const post = dbToAdoptionPost(data);
        if (data.ngo_profiles) {
            post.ngoProfile = dbToNgoProfile(data.ngo_profiles);
        }
        return post;
    } catch (error) {
        console.error('❌ Error fetching adoption post:', error);
        return null;
    }
}

/**
 * Get adoption posts by NGO
 */
export async function getAdoptionPostsByNgo(ngoId: string): Promise<AdoptionPost[]> {
    try {
        const { data, error } = await supabase
            .from('adoption_posts')
            .select('*')
            .eq('ngo_id', ngoId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(dbToAdoptionPost);
    } catch (error) {
        console.error('❌ Error fetching NGO adoption posts:', error);
        return [];
    }
}

/**
 * Filter adoption posts
 */
export async function filterAdoptionPosts(filters: {
    species?: string;
    size?: string;
    gender?: string;
}): Promise<AdoptionPost[]> {
    try {
        let query = supabase
            .from('adoption_posts')
            .select('*')
            .eq('status', 'available');

        if (filters.species) {
            query = query.eq('species', filters.species);
        }
        if (filters.size) {
            query = query.eq('size', filters.size as any);
        }
        if (filters.gender) {
            query = query.eq('gender', filters.gender as any);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(dbToAdoptionPost);
    } catch (error) {
        console.error('❌ Error filtering adoption posts:', error);
        return [];
    }
}

// ============= UPDATE OPERATIONS =============

/**
 * Update adoption post status
 */
export async function updateAdoptionStatus(
    postId: string,
    status: 'available' | 'pending' | 'adopted' | 'withdrawn'
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('adoption_posts')
            .update({
                status,
                updated_at: new Date().toISOString(),
            })
            .eq('id', postId);

        if (error) throw error;

        console.log('✅ Adoption status updated to:', status);
        return true;
    } catch (error) {
        console.error('❌ Error updating adoption status:', error);
        return false;
    }
}

/**
 * Mark animal as adopted and update report
 */
export async function markAsAdopted(
    postId: string,
    reportId: string,
    adoptedByUserId: string
): Promise<boolean> {
    try {
        // Update adoption post
        await supabase
            .from('adoption_posts')
            .update({
                status: 'adopted',
                updated_at: new Date().toISOString(),
            })
            .eq('id', postId);

        // Update animal report - stop tracking (privacy)
        await supabase
            .from('animal_reports')
            .update({
                status: 'adopted',
                rescue_outcome: 'adopted',
                is_tracking_enabled: false,
                adopted_by_user_id: adoptedByUserId,
                adoption_date: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', reportId);

        console.log('✅ Animal marked as adopted, tracking disabled');
        return true;
    } catch (error) {
        console.error('❌ Error marking as adopted:', error);
        return false;
    }
}

/**
 * Increment view count
 */
export async function incrementViews(postId: string): Promise<void> {
    try {
        await supabase.rpc('increment_adoption_views', { post_id: postId });
    } catch (error) {
        // Non-critical, log and continue
        console.warn('⚠️ Could not increment views:', error);
    }
}

/**
 * Increment inquiry count
 */
export async function incrementInquiries(postId: string): Promise<void> {
    try {
        await supabase.rpc('increment_adoption_inquiries', { post_id: postId });
    } catch (error) {
        console.warn('⚠️ Could not increment inquiries:', error);
    }
}

// ============= REAL-TIME SUBSCRIPTIONS =============

/**
 * Subscribe to adoption post updates
 */
export function subscribeToAdoptionPosts(
    callback: (post: AdoptionPost) => void
): () => void {
    const subscription = supabase
        .channel('adoption-posts')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'adoption_posts',
            },
            (payload: { new: unknown; old: unknown }) => {
                console.log('📡 Adoption post update:', payload);
                if (payload.new) {
                    callback(dbToAdoptionPost(payload.new as DbAdoptionPost));
                }
            }
        )
        .subscribe();

    return () => {
        subscription.unsubscribe();
    };
}

export default {
    createAdoptionPost,
    getAvailableAdoptionPosts,
    getAdoptionPostsWithNgo,
    getAdoptionPostById,
    getAdoptionPostsByNgo,
    filterAdoptionPosts,
    updateAdoptionStatus,
    markAsAdopted,
    incrementViews,
    incrementInquiries,
    subscribeToAdoptionPosts,
};
