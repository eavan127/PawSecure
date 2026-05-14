// Location Service - GPS and geocoding utilities
import * as Location from 'expo-location';

export interface LocationResult {
    success: boolean;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    address?: string;
    error?: string;
}

export interface PermissionResult {
    granted: boolean;
    canAskAgain: boolean;
}

/**
 * Request location permission from the user
 */
export async function requestLocationPermission(): Promise<PermissionResult> {
    try {
        const { status, canAskAgain } = await Location.requestForegroundPermissionsAsync();
        return {
            granted: status === 'granted',
            canAskAgain
        };
    } catch (error) {
        console.error('Error requesting location permission:', error);
        return { granted: false, canAskAgain: false };
    }
}

/**
 * Check current location permission status
 */
export async function checkLocationPermission(): Promise<PermissionResult> {
    try {
        const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
        return {
            granted: status === 'granted',
            canAskAgain
        };
    } catch (error) {
        console.error('Error checking location permission:', error);
        return { granted: false, canAskAgain: false };
    }
}

/**
 * Get current GPS coordinates
 */
export async function getCurrentLocation(): Promise<LocationResult> {
    try {
        // Check permission first
        const permission = await checkLocationPermission();
        if (!permission.granted) {
            return {
                success: false,
                error: 'Location permission not granted'
            };
        }

        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced
        });

        // Reverse geocode to get address
        const [address] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
        });

        let addressString = 'Unknown location';
        if (address) {
            const parts = [
                address.street,
                address.district,
                address.city,
                address.region,
                address.country
            ].filter(Boolean);
            addressString = parts.join(', ');
        }

        return {
            success: true,
            coordinates: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            },
            address: addressString
        };
    } catch (error) {
        console.error('Error getting current location:', error);
        return {
            success: false,
            error: String(error)
        };
    }
}

/**
 * Geocode an address string to coordinates
 */
export async function geocodeAddress(address: string): Promise<LocationResult> {
    try {
        const results = await Location.geocodeAsync(address);

        if (results.length === 0) {
            return {
                success: false,
                error: 'No results found for this address'
            };
        }

        const { latitude, longitude } = results[0];

        return {
            success: true,
            coordinates: { latitude, longitude },
            address
        };
    } catch (error) {
        console.error('Error geocoding address:', error);
        return {
            success: false,
            error: String(error)
        };
    }
}

/**
 * Calculate distance between two coordinates in kilometers
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in km
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
    requestLocationPermission,
    checkLocationPermission,
    getCurrentLocation,
    geocodeAddress,
    calculateDistance
};
