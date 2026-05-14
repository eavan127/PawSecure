// Animal Service - Database operations for animal identities
import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    Timestamp,
    GeoPoint
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { AnimalIdentity, ReportEntry, CareEntry } from '../types';
import { AnimalIdentificationResult } from '../types/yolo';
import * as FileSystem from 'expo-file-system/legacy';




const ANIMALS_COLLECTION = 'animalIdentities';
const REPORTS_COLLECTION = 'reports';

/**
 * Generate a unique system ID for a new animal
 */
function generateAnimalId(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `PG-${year}-${random}`;
}

/**
 * Generate a simple feature hash for animal identification
 */
function generateFeatureHash(aiResult: AnimalIdentificationResult): string {
    const features = `${aiResult.species}-${aiResult.breed}-${aiResult.color}`.toLowerCase();
    let hash = 0;
    for (let i = 0; i < features.length; i++) {
        const char = features.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
}

/**
 * Upload an image to Firebase Storage and get the URL
 */
export async function uploadAnimalImage(imageUri: string, animalId: string): Promise<string> {
    try {
        const response = await fetch(imageUri);
        const blob = await response.blob();

        const timestamp = Date.now();
        const storageRef = ref(storage, `animals/${animalId}/${timestamp}.jpg`);

        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);

        return downloadUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

/**
 * Search for existing animals with similar features
 */
export async function searchSimilarAnimals(
    species: 'dog' | 'cat',
    breed: string,
    color: string,
    region?: string
): Promise<AnimalIdentity[]> {
    try {
        const animalsRef = collection(db, ANIMALS_COLLECTION);

        // Query by species first (most selective)
        let q = query(
            animalsRef,
            where('species', '==', species),
            orderBy('lastSeenAt', 'desc'),
            limit(20)
        );

        const snapshot = await getDocs(q);
        const animals: AnimalIdentity[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data() as AnimalIdentity;
            animals.push({ ...data, id: doc.id });
        });

        // Filter by breed/color similarity (case-insensitive partial match)
        const breedLower = breed.toLowerCase();
        const colorLower = color.toLowerCase();

        return animals.filter(animal => {
            const animalBreed = animal.breed.toLowerCase();
            const animalColor = animal.color.toLowerCase();

            // Check for breed similarity
            const breedMatch = animalBreed.includes(breedLower) || breedLower.includes(animalBreed);
            // Check for color similarity
            const colorMatch = animalColor.includes(colorLower) || colorLower.includes(animalColor);

            // Filter by region if provided
            if (region) {
                const regionMatch = animal.lastSeenLocation?.toLowerCase().includes(region.toLowerCase());
                return (breedMatch || colorMatch) && regionMatch;
            }

            return breedMatch || colorMatch;
        });
    } catch (error) {
        console.error('Error searching animals:', error);
        return [];
    }
}

/**
 * Get animals by region for filtering
 */
export async function getAnimalsByRegion(region: string): Promise<AnimalIdentity[]> {
    try {
        const animalsRef = collection(db, ANIMALS_COLLECTION);
        const snapshot = await getDocs(animalsRef);
        const animals: AnimalIdentity[] = [];

        snapshot.forEach((doc) => {
            const data = doc.data() as AnimalIdentity;
            if (data.lastSeenLocation?.toLowerCase().includes(region.toLowerCase())) {
                animals.push({ ...data, id: doc.id });
            }
        });

        return animals;
    } catch (error) {
        console.error('Error getting animals by region:', error);
        return [];
    }
}

/**
 * Create a new animal identity in the database
 */
export async function createAnimalIdentity(
    aiResult: AnimalIdentificationResult,
    imageUrl: string,
    reporterInfo: { userId: string; userName: string },
    location: { address: string; coordinates?: { lat: number; lng: number } }
): Promise<AnimalIdentity> {
    const systemId = generateAnimalId();
    const now = new Date().toISOString();

    const animalData: Omit<AnimalIdentity, 'id'> = {
        systemId,
        species: aiResult.species === 'unknown' ? 'dog' : aiResult.species,
        breed: aiResult.breed,
        color: aiResult.color,
        distinctiveFeatures: [aiResult.distinctiveFeatures],
        featureHash: generateFeatureHash(aiResult),
        primaryImageUrl: imageUrl,

        status: 'waiting',
        isVaccinated: false,
        isNeutered: false,

        firstReportedAt: now,
        firstReportedBy: reporterInfo.userName,
        createdBy: reporterInfo.userId,
        lastSeenAt: now,
        lastSeenLocation: location.address,

        reportHistory: [],
        careHistory: []
    };

    try {
        const docRef = await addDoc(collection(db, ANIMALS_COLLECTION), animalData);
        return { ...animalData, id: docRef.id };
    } catch (error) {
        console.error('Error creating animal identity:', error);
        throw error;
    }
}

/**
 * Get an animal by ID
 */
export async function getAnimalById(animalId: string): Promise<AnimalIdentity | null> {
    try {
        const docRef = doc(db, ANIMALS_COLLECTION, animalId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { ...docSnap.data(), id: docSnap.id } as AnimalIdentity;
        }
        return null;
    } catch (error) {
        console.error('Error getting animal:', error);
        return null;
    }
}

/**
 * Add a report to an existing animal's history
 */
export async function addReportToAnimal(
    animalId: string,
    report: ReportEntry
): Promise<void> {
    try {
        const animalRef = doc(db, ANIMALS_COLLECTION, animalId);
        const animalDoc = await getDoc(animalRef);

        if (!animalDoc.exists()) {
            throw new Error('Animal not found');
        }

        const currentData = animalDoc.data() as AnimalIdentity;
        const updatedHistory = [...(currentData.reportHistory || []), report];

        await updateDoc(animalRef, {
            reportHistory: updatedHistory,
            lastSeenAt: report.timestamp,
            lastSeenLocation: report.location
        });
    } catch (error) {
        console.error('Error adding report to animal:', error);
        throw error;
    }
}

/**
 * Update animal status (for NGO users)
 */
export async function updateAnimalStatus(
    animalId: string,
    updates: Partial<Pick<AnimalIdentity, 'status' | 'isVaccinated' | 'vaccinationDate' | 'isNeutered' | 'assignedNgoId' | 'assignedNgoName' | 'ngoAssignedDate'>>
): Promise<void> {
    try {
        const animalRef = doc(db, ANIMALS_COLLECTION, animalId);
        await updateDoc(animalRef, updates);
    } catch (error) {
        console.error('Error updating animal status:', error);
        throw error;
    }
}

/**
 * Add a care entry to animal's history (NGO actions)
 */
export async function addCareEntry(
    animalId: string,
    careEntry: CareEntry
): Promise<void> {
    try {
        const animalRef = doc(db, ANIMALS_COLLECTION, animalId);
        const animalDoc = await getDoc(animalRef);

        if (!animalDoc.exists()) {
            throw new Error('Animal not found');
        }

        const currentData = animalDoc.data() as AnimalIdentity;
        const updatedHistory = [...(currentData.careHistory || []), careEntry];

        await updateDoc(animalRef, {
            careHistory: updatedHistory
        });
    } catch (error) {
        console.error('Error adding care entry:', error);
        throw error;
    }
}

/**
 * Get all animals (with optional status filter)
 */
export async function getAllAnimals(statusFilter?: string): Promise<AnimalIdentity[]> {
    try {
        const animalsRef = collection(db, ANIMALS_COLLECTION);
        let q = query(animalsRef, orderBy('lastSeenAt', 'desc'));

        if (statusFilter) {
            q = query(animalsRef, where('status', '==', statusFilter), orderBy('lastSeenAt', 'desc'));
        }

        const snapshot = await getDocs(q);
        const animals: AnimalIdentity[] = [];

        snapshot.forEach((doc) => {
            animals.push({ ...doc.data(), id: doc.id } as AnimalIdentity);
        });

        return animals;
    } catch (error) {
        console.error('Error getting all animals:', error);
        return [];
    }
}

/**
 * Get all animals created by a specific user
 */
export async function getAnimalsByUser(userId: string): Promise<AnimalIdentity[]> {
    try {
        const animalsRef = collection(db, ANIMALS_COLLECTION);
        const q = query(
            animalsRef,
            where('createdBy', '==', userId),
            orderBy('lastSeenAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const animals: AnimalIdentity[] = [];

        snapshot.forEach((doc) => {
            animals.push({ ...doc.data(), id: doc.id } as AnimalIdentity);
        });

        return animals;
    } catch (error) {
        console.error('Error getting user animals:', error);
        return [];
    }
}

import { File } from 'expo-file-system';

export const analyzeAnimalWithGemini = async (imageUri: string): Promise<AnimalIdentificationResult> => {
    try {
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
        });

        const response = await fetch(
            'https://us-central1-pawguardai-4ee35.cloudfunctions.net/analyzeAnimal',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64 }),
            }
        );

        const data = await response.json();

        // Map Gemini's JSON response to your App's Type
        return {
            species: data.species || 'unknown',
            breed: data.breed || 'Mixed',
            color: data.color || 'Unknown',
            distinctiveFeatures: data.distinctiveFeatures || 'None',
            healthNotes: data.healthStatus, // Mapping Gemini field to your app
            isEmergency: data.isEmergency || false,
            confidence: 1.0, // Gemini doesn't provide a 0-1 score like YOLO, so we default to 1.0
        };
    } catch (err) {
        console.error('Gemini analysis failed:', err);
        throw err;
    }
};


export default {
    uploadAnimalImage,
    searchSimilarAnimals,
    getAnimalsByRegion,
    createAnimalIdentity,
    getAnimalById,
    addReportToAnimal,
    updateAnimalStatus,
    addCareEntry,
    getAllAnimals,
    getAnimalsByUser
};
