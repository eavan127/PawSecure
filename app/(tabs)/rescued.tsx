/**
 * Rescued Tab — Archive of all animals this org has rescued.
 *
 * Fetches from `rescued_animals` table filtered by the logged-in org's ID.
 * Refreshes every time the tab comes into focus (e.g. after confirming a rescue).
 */

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { getRescuedAnimals } from '../../services/animalService';
import { useAuth } from '../../contexts/AuthContext';
import type { RescuedAnimal } from '../../lib/supabaseTypes';

const OUTCOME_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    in_care:  { label: 'In Care',   color: '#0891B2', bg: '#e0f2fe' },
    rehomed:  { label: 'Rehomed',   color: '#059669', bg: '#d1fae5' },
    released: { label: 'Released',  color: '#7c3aed', bg: '#ede9fe' },
    deceased: { label: 'Deceased',  color: '#6b7280', bg: '#f3f4f6' },
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-MY', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

export default function RescuedTab() {
    const { user } = useAuth();
    const [animals,    setAnimals]    = useState<RescuedAnimal[]>([]);
    const [loading,    setLoading]    = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error,      setError]      = useState('');

    const load = useCallback(async () => {
        if (!user) return;
        try {
            const data = await getRescuedAnimals(user.id);
            setAnimals(data);
            setError('');
        } catch (e: any) {
            setError(e.message ?? 'Failed to load rescued animals.');
        }
    }, [user]);

    // Re-fetch every time this tab comes into focus
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            load().finally(() => setLoading(false));
        }, [load])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    // Stats
    const total  = animals.length;
    const dogs   = animals.filter(a => a.species === 'dog').length;
    const cats   = animals.filter(a => a.species === 'cat').length;
    const inCare = animals.filter(a => a.outcome === 'in_care').length;
    const rehomed = animals.filter(a => a.outcome === 'rehomed').length;

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Rescue Archive</Text>
                <Text style={styles.headerSub}>Animals your org has rescued</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#0891B2" />
                    <Text style={styles.loadingText}>Loading archive...</Text>
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable onPress={onRefresh} style={styles.retryBtn}>
                        <Text style={styles.retryText}>Retry</Text>
                    </Pressable>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0891B2" />
                    }
                >
                    {/* Stats row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{total}</Text>
                            <Text style={styles.statLabel}>Total Rescued</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>🐕 {dogs}</Text>
                            <Text style={styles.statLabel}>Dogs</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>🐱 {cats}</Text>
                            <Text style={styles.statLabel}>Cats</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={[styles.statNumber, { color: '#059669' }]}>{rehomed}</Text>
                            <Text style={styles.statLabel}>Rehomed</Text>
                        </View>
                    </View>

                    {/* List */}
                    {animals.length === 0 ? (
                        <View style={styles.empty}>
                            <Text style={styles.emptyEmoji}>🏠</Text>
                            <Text style={styles.emptyTitle}>No rescued animals yet</Text>
                            <Text style={styles.emptyText}>
                                After you confirm a rescue from the queue,{'\n'}it will appear here permanently.
                            </Text>
                        </View>
                    ) : (
                        animals.map(animal => {
                            const outcome = OUTCOME_CONFIG[animal.outcome] ?? OUTCOME_CONFIG['in_care'];
                            return (
                                <View key={animal.id} style={styles.card}>
                                    {/* Image */}
                                    <View style={styles.cardImageWrap}>
                                        {animal.rescue_image_url ? (
                                            <Image
                                                source={{ uri: animal.rescue_image_url }}
                                                style={styles.cardImage}
                                                resizeMode="cover"
                                            />
                                        ) : animal.cctv_image_url ? (
                                            <Image
                                                source={{ uri: animal.cctv_image_url }}
                                                style={styles.cardImage}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View style={[styles.cardImage, styles.noImage]}>
                                                <Ionicons name="paw" size={32} color="#9CA3AF" />
                                            </View>
                                        )}
                                    </View>

                                    {/* Info */}
                                    <View style={styles.cardBody}>
                                        <View style={styles.cardRow}>
                                            <Text style={styles.cardSpecies}>
                                                {animal.species === 'dog' ? '🐕' : '🐱'}{' '}
                                                {animal.species.charAt(0).toUpperCase() + animal.species.slice(1)}
                                            </Text>
                                            <Text style={styles.cardCode}>{animal.animal_code}</Text>
                                        </View>

                                        <View style={styles.cardMeta}>
                                            <Ionicons name="calendar" size={12} color={colors.minimalist.textLight} />
                                            <Text style={styles.cardMetaText}>
                                                Rescued {formatDate(animal.rescued_at)}
                                            </Text>
                                        </View>

                                        {animal.address && (
                                            <View style={styles.cardMeta}>
                                                <Ionicons name="location" size={12} color={colors.minimalist.textLight} />
                                                <Text style={styles.cardMetaText} numberOfLines={1}>
                                                    {animal.address}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Outcome badge */}
                                        <View style={[styles.outcomeBadge, { backgroundColor: outcome.bg }]}>
                                            <Text style={[styles.outcomeText, { color: outcome.color }]}>
                                                {outcome.label}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}

                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe:         { flex: 1, backgroundColor: '#FAFBFC' },
    header:       { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, backgroundColor: '#fff' },
    headerTitle:  { fontSize: 24, fontWeight: '700', color: colors.minimalist.textDark },
    headerSub:    { fontSize: 13, color: colors.minimalist.textLight, marginTop: 2 },
    center:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    loadingText:  { marginTop: 12, color: colors.minimalist.textMedium },
    errorText:    { marginTop: 12, color: '#ef4444', textAlign: 'center' },
    retryBtn:     { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#0891B2', borderRadius: 10 },
    retryText:    { color: '#fff', fontWeight: '700' },
    scroll:       { padding: spacing.lg },

    // Stats
    statsRow:     { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
    statCard:     { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: '#F0F0F0' },
    statNumber:   { fontSize: 20, fontWeight: '800', color: colors.minimalist.textDark },
    statLabel:    { fontSize: 11, color: colors.minimalist.textMedium, marginTop: 2, textAlign: 'center' },

    // Empty
    empty:        { alignItems: 'center', paddingVertical: 60 },
    emptyEmoji:   { fontSize: 48, marginBottom: 12 },
    emptyTitle:   { fontSize: 18, fontWeight: '700', color: colors.minimalist.textDark },
    emptyText:    { fontSize: 14, color: colors.minimalist.textMedium, marginTop: 4, textAlign: 'center', lineHeight: 22 },

    // Card
    card:         { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, marginBottom: spacing.md, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F0F0' },
    cardImageWrap:{ width: 100 },
    cardImage:    { width: 100, height: 100 },
    noImage:      { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    cardBody:     { flex: 1, padding: spacing.md, justifyContent: 'center', gap: 4 },
    cardRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardSpecies:  { fontSize: 15, fontWeight: '700', color: colors.minimalist.textDark },
    cardCode:     { fontSize: 11, color: '#0891B2', fontWeight: '600' },
    cardMeta:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardMetaText: { flex: 1, fontSize: 12, color: colors.minimalist.textMedium },
    outcomeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 2 },
    outcomeText:  { fontSize: 11, fontWeight: '700' },
});
