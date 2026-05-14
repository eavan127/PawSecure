/**
 * Lost & Found Service for PawGuard AI
 * Handles lost pet and found animal posts for both users and NGOs
 */

import { supabase } from '../lib/supabase';
import { DbLostFoundPost, DbLostFoundPostInsert, LostFoundPost, dbToLostFoundPost } from '../lib/supabaseTypes';

// ============= CREATE OPERATIONS =============

interface CreateLostFoundPostParams {
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
    rewardOffered?: number;
}

/**
 * Create a lost pet post
 */
export async function createLostPost(params: CreateLostFoundPostParams): Promise<LostFoundPost | null> {
    return createLostFoundPost({ ...params, postType: 'lost' });
}

/**
 * Create a found animal post
 */
export async function createFoundPost(params: CreateLostFoundPostParams): Promise<LostFoundPost | null> {
    return createLostFoundPost({ ...params, postType: 'found' });
}

/**
 * Create a lost or found post
 */
async function createLostFoundPost(params: CreateLostFoundPostParams): Promise<LostFoundPost | null> {
    try {
        const dbPost: DbLostFoundPostInsert = {
            post_type: params.postType,
            user_id: params.userId,
            user_name: params.userName,
            user_role: params.userRole,
            contact_phone: params.contactPhone,
            contact_email: params.contactEmail,
            species: params.species,
            breed: params.breed,
            color: params.color,
            size: params.size,
            distinctive_features: params.distinctiveFeatures,
            name: params.name,
            animal_id: params.animalId,
            last_seen_address: params.lastSeenAddress,
            last_seen_latitude: params.lastSeenLatitude,
            last_seen_longitude: params.lastSeenLongitude,
            last_seen_date: params.lastSeenDate,
            photos: params.photos,
            reward_offered: params.rewardOffered,
            status: 'active',
        };

        const { data, error } = await supabase
            .from('lost_found_posts')
            .insert(dbPost)
            .select()
            .single();

        if (error) throw error;

        console.log(`✅ ${params.postType.toUpperCase()} post created`);
        return dbToLostFoundPost(data);
    } catch (error) {
        console.error('❌ Error creating lost/found post:', error);
        return null;
    }
}

// ============= READ OPERATIONS =============

/**
 * Get all active lost & found posts (for community feed)
 */
export async function getActiveLostFoundPosts(): Promise<LostFoundPost[]> {
    try {
        const { data, error } = await supabase
            .from('lost_found_posts')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(dbToLostFoundPost);
    } catch (error) {
        console.error('❌ Error fetching lost/found posts:', error);
        return [];
    }
}

/**
 * Get lost posts only
 */
export async function getLostPosts(): Promise<LostFoundPost[]> {
    try {
        const { data, error } = await supabase
            .from('lost_found_posts')
            .select('*')
            .eq('post_type', 'lost')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(dbToLostFoundPost);
    } catch (error) {
        console.error('❌ Error fetching lost posts:', error);
        return [];
    }
}

/**
 * Get found posts only
 */
export async function getFoundPosts(): Promise<LostFoundPost[]> {
    try {
        const { data, error } = await supabase
            .from('lost_found_posts')
            .select('*')
            .eq('post_type', 'found')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(dbToLostFoundPost);
    } catch (error) {
        console.error('❌ Error fetching found posts:', error);
        return [];
    }
}

/**
 * Get post by ID
 */
export async function getLostFoundPostById(postId: string): Promise<LostFoundPost | null> {
    try {
        const { data, error } = await supabase
            .from('lost_found_posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error) throw error;

        return data ? dbToLostFoundPost(data) : null;
    } catch (error) {
        console.error('❌ Error fetching post:', error);
        return null;
    }
}

/**
 * Get posts by user
 */
export async function getLostFoundPostsByUser(userId: string): Promise<LostFoundPost[]> {
    try {
        const { data, error } = await supabase
            .from('lost_found_posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map(dbToLostFoundPost);
    } catch (error) {
        console.error('❌ Error fetching user posts:', error);
        return [];
    }
}

/**
 * Search posts by animal ID for matching
 */
export async function searchByAnimalId(animalId: string): Promise<LostFoundPost[]> {
    try {
        const { data, error } = await supabase
            .from('lost_found_posts')
            .select('*')
            .eq('animal_id', animalId)
            .eq('status', 'active');

        if (error) throw error;

        return (data || []).map(dbToLostFoundPost);
    } catch (error) {
        console.error('❌ Error searching by animal ID:', error);
        return [];
    }
}

/**
 * Get contact info for a post
 */
export async function getPostContactInfo(postId: string): Promise<{
    userName: string;
    contactPhone: string;
    contactEmail?: string;
} | null> {
    try {
        const { data, error } = await supabase
            .from('lost_found_posts')
            .select('user_name, contact_phone, contact_email')
            .eq('id', postId)
            .single();

        if (error) throw error;

        return data ? {
            userName: data.user_name,
            contactPhone: data.contact_phone,
            contactEmail: data.contact_email ?? undefined,
        } : null;
    } catch (error) {
        console.error('❌ Error getting contact info:', error);
        return null;
    }
}

// ============= UPDATE OPERATIONS =============

/**
 * Mark post as resolved (reunited)
 */
export async function resolvePost(postId: string, note?: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('lost_found_posts')
            .update({
                status: 'resolved',
                resolved_at: new Date().toISOString(),
                resolved_note: note || 'Reunited',
                updated_at: new Date().toISOString(),
            })
            .eq('id', postId);

        if (error) throw error;

        console.log('✅ Post marked as resolved');
        return true;
    } catch (error) {
        console.error('❌ Error resolving post:', error);
        return false;
    }
}

/**
 * Expire old posts (can be run as a cron job)
 */
export async function expireOldPosts(daysOld: number = 30): Promise<number> {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const { data, error } = await supabase
            .from('lost_found_posts')
            .update({
                status: 'expired',
                updated_at: new Date().toISOString(),
            })
            .eq('status', 'active')
            .lt('created_at', cutoffDate.toISOString())
            .select('id');

        if (error) throw error;

        const count = data?.length || 0;
        console.log(`✅ Expired ${count} old posts`);
        return count;
    } catch (error) {
        console.error('❌ Error expiring posts:', error);
        return 0;
    }
}

// ============= REAL-TIME SUBSCRIPTIONS =============

/**
 * Subscribe to lost & found post updates
 */
export function subscribeToLostFoundPosts(
    callback: (post: LostFoundPost) => void
): () => void {
    const subscription = supabase
        .channel('lost-found-posts')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'lost_found_posts',
            },
            (payload: { new: unknown; old: unknown }) => {
                console.log('📡 Lost/Found post update:', payload);
                if (payload.new) {
                    callback(dbToLostFoundPost(payload.new as DbLostFoundPost));
                }
            }
        )
        .subscribe();

    return () => {
        subscription.unsubscribe();
    };
}

export default {
    createLostPost,
    createFoundPost,
    getActiveLostFoundPosts,
    getLostPosts,
    getFoundPosts,
    getLostFoundPostById,
    getLostFoundPostsByUser,
    searchByAnimalId,
    getPostContactInfo,
    resolvePost,
    expireOldPosts,
    subscribeToLostFoundPosts,
};
