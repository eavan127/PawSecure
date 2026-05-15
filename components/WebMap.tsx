/**
 * WebMap — Leaflet-based interactive map for web.
 * Replaces react-native-maps which only works on iOS/Android.
 *
 * Usage:
 *   <WebMap
 *     animals={pendingAnimals}
 *     onMarkerPress={(animal) => router.push(`/animal-profile?id=${animal.id}`)}
 *   />
 */

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { PendingAnimal } from '../lib/supabaseTypes';

// Malaysia centre
const DEFAULT_CENTER: [number, number] = [4.2105, 108.9758];
const DEFAULT_ZOOM = 6;

// Restrict map panning to Malaysia bounds
const MALAYSIA_BOUNDS: [[number, number], [number, number]] = [
    [0.8, 99.5],   // SW corner
    [7.5, 119.5],  // NE corner
];

const SEVERITY_COLORS: Record<string, string> = {
    none:     '#22c55e',
    mild:     '#eab308',
    moderate: '#f97316',
    severe:   '#ef4444',
    critical: '#7c3aed',
};

interface WebMapProps {
    animals?: PendingAnimal[];
    onMarkerPress?: (animal: PendingAnimal) => void;
    height?: string | number;
}

export function WebMap({ animals = [], onMarkerPress, height = '100%' }: WebMapProps) {
    useEffect(() => {
        if (document.getElementById('leaflet-css')) return;
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }, []);

    return (
        <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            minZoom={5}
            maxZoom={18}
            maxBounds={MALAYSIA_BOUNDS}
            maxBoundsViscosity={1.0}
            style={{ width: '100%', height }}
            scrollWheelZoom
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {animals
                .filter(a => a.latitude && a.longitude)
                .map(animal => (
                    <Marker
                        key={animal.id}
                        position={[animal.latitude, animal.longitude]}
                    >
                        <Popup>
                            <div style={{ minWidth: 160 }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 6,
                                }}>
                                    <strong style={{ fontSize: 14, textTransform: 'capitalize' }}>
                                        {animal.species}
                                    </strong>
                                    <span style={{
                                        fontSize: 11,
                                        color: '#fff',
                                        background: SEVERITY_COLORS[animal.injury_severity] ?? '#6b7280',
                                        borderRadius: 4,
                                        padding: '2px 6px',
                                        textTransform: 'capitalize',
                                    }}>
                                        {animal.injury_severity}
                                    </span>
                                </div>
                                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                                    {animal.address ?? 'Unknown location'}
                                </div>
                                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>
                                    {animal.animal_code}
                                </div>
                                {onMarkerPress && (
                                    <button
                                        onClick={() => onMarkerPress(animal)}
                                        style={{
                                            width: '100%',
                                            padding: '6px 0',
                                            background: '#0891b2',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: 6,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        View Animal
                                    </button>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
        </MapContainer>
    );
}
