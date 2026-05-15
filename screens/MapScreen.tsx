import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WebMap } from '../components/WebMap';
import { getPendingAnimals } from '../services/animalService';
import type { PendingAnimal } from '../lib/supabaseTypes';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

// Malaysia overview
const MALAYSIA_CENTER: [number, number] = [3.8077, 108.9477];

export default function MapScreen() {
    const router = useRouter();
    const [animals, setAnimals] = useState<PendingAnimal[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAnimals = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getPendingAnimals();
            setAnimals(data);
        } catch (error) {
            console.error('Error fetching animals for map:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAnimals(); }, [fetchAnimals]);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Malaysia — Live Animal Map</Text>
                <Pressable style={styles.refreshBtn} onPress={fetchAnimals}>
                    <Ionicons name="refresh" size={18} color={colors.minimalist.textDark} />
                </Pressable>
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                {[
                    { label: 'None', color: '#22c55e' },
                    { label: 'Mild', color: '#eab308' },
                    { label: 'Moderate', color: '#f97316' },
                    { label: 'Severe', color: '#ef4444' },
                    { label: 'Critical', color: '#7c3aed' },
                ].map(item => (
                    <View key={item.label} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                        <Text style={styles.legendText}>{item.label}</Text>
                    </View>
                ))}
            </View>

            {/* Map */}
            <View style={styles.mapContainer}>
                {loading ? (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color={colors.minimalist.coral} />
                        <Text style={styles.loaderText}>Loading animals...</Text>
                    </View>
                ) : (
                    <WebMap
                        animals={animals}
                        height="100%"
                        onMarkerPress={(animal) =>
                            router.push({ pathname: '/ngo-report-detail', params: { animalId: animal.id } })
                        }
                    />
                )}
            </View>

            {/* Count badge */}
            <View style={styles.countBadge}>
                <Text style={styles.countText}>
                    {animals.length} animal{animals.length !== 1 ? 's' : ''} pending rescue
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container:    { flex: 1, backgroundColor: colors.minimalist.bgLight },
    header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.minimalist.borderLight },
    title:        { fontSize: 18, fontWeight: '700', color: colors.minimalist.textDark },
    refreshBtn:   { padding: 8, borderRadius: 8, backgroundColor: colors.minimalist.warmGray },
    legend:       { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: colors.minimalist.borderLight },
    legendItem:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot:    { width: 10, height: 10, borderRadius: 5 },
    legendText:   { fontSize: 12, color: colors.minimalist.textMedium },
    mapContainer: { flex: 1 },
    loader:       { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    loaderText:   { fontSize: 14, color: colors.minimalist.textMedium },
    countBadge:   { padding: spacing.md, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: colors.minimalist.borderLight, alignItems: 'center' },
    countText:    { fontSize: 13, color: colors.minimalist.textMedium, fontWeight: '600' },
});
