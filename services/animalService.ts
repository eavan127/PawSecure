import { supabase } from '../lib/supabase';
import type {
    PendingAnimal,
    PendingAnimalInsert,
    RescuedAnimal,
    RescuedAnimalInsert,
    AnimalEmbeddingInsert,
} from '../lib/supabaseTypes';

//  Pending Animals 

export async function getPendingAnimals(): Promise<PendingAnimal[]> {
    const { data, error } = await supabase
        .from('pending_animals')
        .select('*')
        .order('spotted_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
}

/** Fetch animals near an org location using a bounding box (~50km default). */
export async function getPendingAnimalsNearby(
    lat: number,
    lng: number,
    radiusKm = 50
): Promise<PendingAnimal[]> {
    const delta = radiusKm / 111; // 1 degree ≈ 111km

    const { data, error } = await supabase
        .from('pending_animals')
        .select('*')
        .gte('latitude',  lat - delta)
        .lte('latitude',  lat + delta)
        .gte('longitude', lng - delta)
        .lte('longitude', lng + delta)
        .order('spotted_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function getPendingAnimalById(id: string): Promise<PendingAnimal | null> {
    const { data, error } = await supabase
        .from('pending_animals')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function addPendingAnimal(animal: PendingAnimalInsert): Promise<PendingAnimal> {
    const { data, error } = await supabase
        .from('pending_animals')
        .insert(animal)
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

/** NGO presses "Go to Rescue" — marks the animal as claimed by their org. */
export async function claimAnimal(animalId: string, orgId: string): Promise<void> {
    const { error } = await supabase
        .from('pending_animals')
        .update({
            claimed_by_org_id: orgId,
            claimed_at:        new Date().toISOString(),
            status:            'claimed',
        })
        .eq('id', animalId);

    if (error) throw new Error(error.message);
}

// Rescue Confirmation 

/**
 * NGO has rescued the animal and taken a post-rescue photo.
 * Inserts into rescued_animals (permanent archive) then deletes
 * from pending_animals (rescue queue).
 */
export async function confirmRescue(
    pending: PendingAnimal,
    orgId: string,
    orgName: string,
    rescueImageUrl: string,
    healthNotes?: string
): Promise<RescuedAnimal> {
    const record: RescuedAnimalInsert = {
        animal_code:         pending.animal_code,
        species:             pending.species,
        injury_severity:     pending.injury_severity,
        injury_signals:      pending.injury_signals,
        cctv_image_url:      pending.image_url,
        rescue_image_url:    rescueImageUrl,
        address:             pending.address,
        latitude:            pending.latitude,
        longitude:           pending.longitude,
        rescued_by_org_id:   orgId,
        rescued_by_org_name: orgName,
        rescued_at:          new Date().toISOString(),
        health_notes:        healthNotes ?? null,
        is_vaccinated:       false,
        is_neutered:         false,
        outcome:             'in_care',
        outcome_date:        null,
        outcome_notes:       null,
    };

    const { data, error: insertError } = await supabase
        .from('rescued_animals')
        .insert(record)
        .select()
        .single();

    if (insertError) throw new Error(insertError.message);

    const { error: deleteError } = await supabase
        .from('pending_animals')
        .delete()
        .eq('id', pending.id);

    if (deleteError) throw new Error(deleteError.message);

    return data;
}

// Rescued Archive 

export async function getRescuedAnimals(orgId: string): Promise<RescuedAnimal[]> {
    const { data, error } = await supabase
        .from('rescued_animals')
        .select('*')
        .eq('rescued_by_org_id', orgId)
        .order('rescued_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function getRescueStats(orgId: string) {
    const { data, error } = await supabase
        .from('rescued_animals')
        .select('species, injury_severity, outcome, rescued_at')
        .eq('rescued_by_org_id', orgId);

    if (error) throw new Error(error.message);
    const animals = data ?? [];

    return {
        total:   animals.length,
        dogs:    animals.filter(a => a.species === 'dog').length,
        cats:    animals.filter(a => a.species === 'cat').length,
        severe:  animals.filter(a => a.injury_severity === 'severe' || a.injury_severity === 'critical').length,
        inCare:  animals.filter(a => a.outcome === 'in_care').length,
        rehomed: animals.filter(a => a.outcome === 'rehomed').length,
    };
}

// CLIP Embeddings 

export async function saveEmbedding(embedding: AnimalEmbeddingInsert): Promise<void> {
    const { error } = await supabase
        .from('animal_embeddings')
        .insert(embedding);

    if (error) throw new Error(error.message);
}
