/**
 * Weather Service for PawGuard AI
 * Uses OpenWeatherMap API to fetch current weather and alerts
 */

const WEATHER_API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
    condition: string;
    description: string;
    temperature: number; // Celsius
    humidity: number;
    windSpeed: number;
    icon: string;
    alerts?: WeatherAlert[];
}

export interface WeatherAlert {
    event: string;
    sender: string;
    description: string;
    start: number;
    end: number;
}

export interface DisasterIndicator {
    type: 'earthquake' | 'flood' | 'storm' | 'heatwave' | 'none';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
}

/**
 * Get current weather for a location
 */
export async function getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData | null> {
    if (!WEATHER_API_KEY) {
        console.warn('⚠️ Weather API key not configured');
        return null;
    }

    try {
        const url = `${BASE_URL}/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`;
        console.log('🌤️ Fetching weather...');

        const response = await fetch(url);

        if (!response.ok) {
            console.error('❌ Weather API error:', response.status);
            return null;
        }

        const data = await response.json();

        const weatherData: WeatherData = {
            condition: data.weather[0]?.main || 'Unknown',
            description: data.weather[0]?.description || '',
            temperature: Math.round(data.main.temp),
            humidity: data.main.humidity,
            windSpeed: data.wind?.speed || 0,
            icon: data.weather[0]?.icon || '01d',
        };

        console.log('✅ Weather fetched:', weatherData);
        return weatherData;
    } catch (error) {
        console.error('❌ Failed to fetch weather:', error);
        return null;
    }
}

/**
 * Get weather alerts for a location (uses One Call API 3.0)
 * Note: Requires subscription for alerts, fallback to mock for demo
 */
export async function getWeatherAlerts(latitude: number, longitude: number): Promise<WeatherAlert[]> {
    // For demo purposes, we'll check extreme weather conditions
    // In production, use One Call API 3.0 which requires subscription

    const weather = await getCurrentWeather(latitude, longitude);
    if (!weather) return [];

    const alerts: WeatherAlert[] = [];

    // Check for severe conditions
    if (weather.windSpeed > 20) {
        alerts.push({
            event: 'High Wind Warning',
            sender: 'Weather Service',
            description: `Wind speeds of ${weather.windSpeed} m/s detected. Secure loose animals.`,
            start: Date.now(),
            end: Date.now() + 86400000, // 24 hours
        });
    }

    if (weather.temperature > 38) {
        alerts.push({
            event: 'Heat Advisory',
            sender: 'Weather Service',
            description: `Extreme heat of ${weather.temperature}°C. Ensure animals have water and shade.`,
            start: Date.now(),
            end: Date.now() + 86400000,
        });
    }

    if (weather.condition.toLowerCase().includes('storm') ||
        weather.condition.toLowerCase().includes('thunderstorm')) {
        alerts.push({
            event: 'Storm Warning',
            sender: 'Weather Service',
            description: 'Thunderstorm activity detected. Animals may be frightened.',
            start: Date.now(),
            end: Date.now() + 43200000, // 12 hours
        });
    }

    return alerts;
}

/**
 * Check for disaster conditions based on weather and location
 * This is used to trigger disaster mode for NGOs
 */
export function checkDisasterConditions(
    weather: WeatherData,
    location: { name: string; latitude: number; longitude: number }
): DisasterIndicator {
    // Sabah earthquake zone (mock data for demo)
    const SABAH_ZONES = [
        { name: 'Ranau', lat: 5.9631, lng: 116.6661, radius: 50 },
        { name: 'Kundasang', lat: 6.0167, lng: 116.5667, radius: 30 },
        { name: 'Kota Kinabalu', lat: 5.9804, lng: 116.0735, radius: 40 },
    ];

    // Check if location is in known earthquake zone
    for (const zone of SABAH_ZONES) {
        const distance = calculateDistance(
            location.latitude, location.longitude,
            zone.lat, zone.lng
        );

        if (distance <= zone.radius) {
            // This location is in a known seismic zone
            // In real app, you'd check actual seismic data
            return {
                type: 'earthquake',
                severity: 'high',
                message: `Location is in ${zone.name} seismic zone. Earthquake preparedness recommended.`,
            };
        }
    }

    // Check weather-based disasters
    if (weather.condition.toLowerCase().includes('thunderstorm') && weather.windSpeed > 25) {
        return {
            type: 'storm',
            severity: 'high',
            message: 'Severe storm conditions detected. Animals may need rescue.',
        };
    }

    if (weather.condition.toLowerCase().includes('rain') && weather.humidity > 90) {
        return {
            type: 'flood',
            severity: 'medium',
            message: 'Heavy rainfall detected. Monitor low-lying areas for stranded animals.',
        };
    }

    if (weather.temperature > 40) {
        return {
            type: 'heatwave',
            severity: 'high',
            message: 'Extreme heat emergency. Prioritize water and shade for strays.',
        };
    }

    return {
        type: 'none',
        severity: 'low',
        message: 'No disaster conditions detected.',
    };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

/**
 * Get weather icon URL
 */
export function getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

export default {
    getCurrentWeather,
    getWeatherAlerts,
    checkDisasterConditions,
    getWeatherIconUrl,
};
