/**
 * NGOReportListScreen
 *
 * Lists all pending animals (sighted but not yet rescued) from Supabase.
 * Tap a card to open NGOReportDetailScreen where the org can claim + confirm rescue.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { getPendingAnimals } from '../services/animalService';
import type { PendingAnimal, AnimalStatus, InjurySeverity } from '../lib/supabaseTypes';

const SEVERITY_COLOR: Record<InjurySeverity, string> = {
    none:     '#22c55e',
    mild:     '#eab308',
    moderate: '#f97316',
    severe:   '#ef4444',
    critical: '#7c3aed',
};

const SEVERITY_BG: Record<InjurySeverity, string> = {
    none:     '#f0fdf4',
    mild:     '#fefce8',
    moderate: '#fff7ed',
    severe:   '#fef2f2',
    critical: '#f5f3ff',
};

const STATUS_CONFIG: Record<AnimalStatus, { label: string; color: string; bg: string }> = {
    sighted:  { label: 'Needs Rescue', color: '#059669', bg: '#d1fae5' },
    claimed:  { label: 'Claimed',      color: '#d97706', bg: '#fef3c7' },
    en_route: { label: 'En Route',     color: '#0891B2', bg: '#e0f2fe' },
};

type Filter = 'all' | AnimalStatus;
const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all',      label: 'All'          },
    { key: 'sighted',  label: 'Needs Rescue' },
    { key: 'claimed',  label: 'Claimed'      },
    { key: 'en_route', label: 'En Route'     },
];

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

const AnimalCard: React.FC<{ animal: PendingAnimal; onPress: () => void }> = ({ animal, onPress }) => {
    const sev = animal.injury_severity;
    const st  = STATUS_CONFIG[animal.status];

    return (
        <Pressable style={styles.card} onPress={onPress}>
            {/* Image */}
            <View style={styles.cardImageWrap}>
                {animal.image_url ? (
                    <Image source={{ uri: animal.image_url }} style={styles.cardImage} resizeMode="cover" />
                ) : (
                    <View style={[styles.cardImage, styles.noImage]}>
                        <Ionicons name="paw" size={36} color="#9CA3AF" />
                    </View>
                )}
                {/* Severity tag */}
                <View style={[styles.sevTag, { backgroundColor: SEVERITY_BG[sev] }]}>
                    <View style={[styles.sevDot, { backgroundColor: SEVERITY_COLOR[sev] }]} />
                    <Text style={[styles.sevText, { color: SEVERITY_COLOR[sev] }]}>
                        {sev.charAt(0).toUpperCase() + sev.slice(1)}
                    </Text>
                </View>
                {/* Status tag */}
                <View style={[styles.statusTag, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusTagText, { color: st.color }]}>{st.label}</Text>
                </View>
            </View>

            {/* Info */}
            <View style={styles.cardBody}>
                <View style={styles.cardRow}>
                    <Text style={styles.cardSpecies}>
                        {animal.species === 'dog' ? '🐕' : '🐱'} {animal.species.charAt(0).toUpperCase() + animal.species.slice(1)}
                    </Text>
                    <Text style={styles.cardCode}>{animal.animal_code}</Text>
                </View>
                <View style={styles.cardMeta}>
                    <Ionicons name="location" size={13} color={colors.minimalist.textLight} />
                    <Text style={styles.cardLocation} numberOfLines={1}>
                        {animal.address ?? 'Location unknown'}
                    </Text>
                </View>
                <View style={styles.cardMeta}>
                    <Ionicons name="time" size={13} color={colors.minimalist.textLight} />
                    <Text style={styles.cardTime}>{timeAgo(animal.spotted_at)}</Text>
                </View>
            </View>

            {/* Arrow */}
            <View style={styles.cardArrow}>
                <Ionicons name="chevron-forward" size={20} color={colors.minimalist.textLight} />
            </View>
        </Pressable>
    );
};

export const NGOReportListScreen: React.FC = () => {
    const router = useRouter();
    const [animals,   setAnimals]   = useState<PendingAnimal[]>([]);
    const [loading,   setLoading]   = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filter,    setFilter]    = useState<Filter>('all');
    const [error,     setError]     = useState('');

    const load = useCallback(async () => {
        try {
            const data = await getPendingAnimals();
            setAnimals(data);
            setError('');
        } catch (e: any) {
            setError(e.message);
        }
    }, []);

    useEffect(() => {
        load().finally(() => setLoading(false));
    }, [load]);

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const filtered = filter === 'all' ? animals : animals.filter(a => a.status === filter);

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Rescue Queue</Text>
                <Text style={styles.headerSub}>
                    {filtered.length} animal{filtered.length !== 1 ? 's' : ''} pending
                </Text>
            </View>

            {/* Filters */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersRow}
            >
                {FILTERS.map(f => (
                    <Pressable
                        key={f.key}
                        style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text style={[styles.filterChipText, filter === f.key && styles.filterChipTextActive]}>
                            {f.label}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* List */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#0891B2" />
                    <Text style={styles.loadingText}>Loading animals...</Text>
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
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0891B2" />
                    }
                >
                    {filtered.length === 0 ? (
                        <View style={styles.empty}>
                            <Text style={styles.emptyEmoji}>🐾</Text>
                            <Text style={styles.emptyTitle}>No animals found</Text>
                            <Text style={styles.emptyText}>
                                {filter === 'all'
                                    ? 'No pending animals right now. Pull to refresh.'
                                    : `No "${filter.replace('_', ' ')}" animals at the moment.`}
                            </Text>
                        </View>
                    ) : (
                        filtered.map(animal => (
                            <AnimalCard
                                key={animal.id}
                                animal={animal}
                                onPress={() => router.push({
                                    pathname: '/ngo-report-detail',
                                    params: { animalId: animal.id },
                                })}
                            />
                        ))
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe:        { flex: 1, backgroundColor: '#FAFBFC' },
    header:      { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, backgroundColor: '#fff' },
    headerTitle: { fontSize: 24, fontWeight: '700', color: colors.minimalist.textDark },
    headerSub:   { fontSize: 13, color: colors.minimalist.textLight, marginTop: 2 },
    filtersRow:  { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, gap: spacing.sm, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    filterChip:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F3F4F6' },
    filterChipActive: { backgroundColor: '#0891B2' },
    filterChipText:       { fontSize: 13, fontWeight: '600', color: colors.minimalist.textMedium },
    filterChipTextActive: { color: '#fff' },
    center:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
    loadingText: { marginTop: 12, color: colors.minimalist.textMedium },
    errorText:   { marginTop: 12, color: '#ef4444', textAlign: 'center' },
    retryBtn:    { marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: '#0891B2', borderRadius: 10 },
    retryText:   { color: '#fff', fontWeight: '700' },
    list:        { padding: spacing.lg },
    empty:       { alignItems: 'center', paddingVertical: 60 },
    emptyEmoji:  { fontSize: 48, marginBottom: 12 },
    emptyTitle:  { fontSize: 18, fontWeight: '700', color: colors.minimalist.textDark },
    emptyText:   { fontSize: 14, color: colors.minimalist.textMedium, marginTop: 4, textAlign: 'center' },
    // Card
    card:        { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, marginBottom: spacing.md, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F0F0' },
    cardImageWrap: { position: 'relative', width: 110 },
    cardImage:   { width: 110, height: 110 },
    noImage:     { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    sevTag:      { position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
    sevDot:      { width: 5, height: 5, borderRadius: 3 },
    sevText:     { fontSize: 10, fontWeight: '700' },
    statusTag:   { position: 'absolute', bottom: 6, left: 6, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
    statusTagText: { fontSize: 10, fontWeight: '700' },
    cardBody:    { flex: 1, padding: spacing.md, justifyContent: 'center', gap: 4 },
    cardRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardSpecies: { fontSize: 16, fontWeight: '700', color: colors.minimalist.textDark },
    cardCode:    { fontSize: 11, color: '#0891B2', fontWeight: '600' },
    cardMeta:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
    cardLocation: { flex: 1, fontSize: 12, color: colors.minimalist.textMedium },
    cardTime:    { fontSize: 12, color: colors.minimalist.textLight },
    cardArrow:   { justifyContent: 'center', paddingRight: spacing.md },
});

export default NGOReportListScreen;
