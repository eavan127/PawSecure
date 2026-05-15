/**
 * Location Service — uses browser Geolocation API (web-compatible).
 * Replaces expo-location which is mobile-only.
 */

export interface LocationResult {
    success: boolean;
    coordinates?: { latitude: number; longitude: number };
    address?: string;
    error?: string;
}

export async function getCurrentLocation(): Promise<LocationResult> {
    if (!navigator.geolocation) {
        return { success: false, error: 'Geolocation not supported in this browser' };
    }

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key)
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );
                    const data = await res.json();
                    resolve({
                        success: true,
                        coordinates: { latitude, longitude },
                        address: data.display_name ?? 'Unknown location',
                    });
                } catch {
                    resolve({
                        success: true,
                        coordinates: { latitude, longitude },
                        address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
                    });
                }
            },
            (error) => resolve({ success: false, error: error.message }),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
}

/** Calculate straight-line distance between two GPS points in kilometres. */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number) { return deg * (Math.PI / 180); }
