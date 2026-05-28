/**
 * NGOReportDetailScreen
 *
 * Shows full details for a pending animal (from the rescue queue).
 * Workflow:
 *   1. NGO sees animal details (species, injury, location, CCTV image)
 *   2. Press "Go to Rescue" → claimAnimal() marks it claimed
 *   3. After rescue, upload a rescue photo → confirmRescue() moves it to permanent archive
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { getPendingAnimalById, claimAnimal, confirmRescue } from '../services/animalService';
import { useAuth } from '../contexts/AuthContext';
import type { PendingAnimal } from '../lib/supabaseTypes';

const SEVERITY_COLOR: Record<string, string> = {
    none:     '#22c55e',
    mild:     '#eab308',
    moderate: '#f97316',
    severe:   '#ef4444',
    critical: '#7c3aed',
};

const SEVERITY_BG: Record<string, string> = {
    none:     '#f0fdf4',
    mild:     '#fefce8',
    moderate: '#fff7ed',
    severe:   '#fef2f2',
    critical: '#f5f3ff',
};

export const NGOReportDetailScreen: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams<{ animalId: string }>();

    const [animal,       setAnimal]       = useState<PendingAnimal | null>(null);
    const [isLoading,    setIsLoading]    = useState(true);
    const [isClaiming,   setIsClaiming]   = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [rescueImageUri, setRescueImageUri] = useState<string | null>(null);
    const [healthNotes,  setHealthNotes]  = useState('');
    const [showRescueForm, setShowRescueForm] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        loadAnimal();
    }, [params.animalId]);

    const loadAnimal = async () => {
        if (!params.animalId) {
            Alert.alert('Error', 'No animal ID provided');
            router.back();
            return;
        }
        setIsLoading(true);
        try {
            const data = await getPendingAnimalById(params.animalId);
            if (!data) {
                Alert.alert('Not found', 'This animal may have already been rescued.');
                router.back();
                return;
            }
            setAnimal(data);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClaim = async () => {
        if (!user) {
            alert('You must be logged in to claim an animal. Please sign up or log in first.');
            return;
        }
        if (!animal) return;
        if (animal.claimed_by_org_id && animal.claimed_by_org_id !== user.id) {
            Alert.alert('Already Claimed', 'Another organisation has already claimed this animal.');
            return;
        }
        setIsClaiming(true);
        try {
            await claimAnimal(animal.id, user.id);
            setAnimal(prev => prev ? { ...prev, status: 'claimed', claimed_by_org_id: user.id, claimed_at: new Date().toISOString() } : prev);
            setShowRescueForm(true);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setIsClaiming(false);
        }
    };

    const pickRescuePhoto = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.setAttribute('capture', 'environment');
        input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (file) setRescueImageUri(URL.createObjectURL(file));
        };
        input.click();
    };

    const handleConfirmRescue = async () => {
        if (!animal || !user) return;
        if (!rescueImageUri) {
            Alert.alert('Photo required', 'Please take a post-rescue photo of the animal first.');
            return;
        }
        setIsConfirming(true);
        try {
            await confirmRescue(animal, user.id, user.name, rescueImageUri, healthNotes || undefined);
            Alert.alert(
                'Rescue Confirmed!',
                `${animal.animal_code} has been moved to the permanent rescue archive.`,
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setIsConfirming(false);
        }
    };

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleString('en-MY', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#0891B2" />
                    <Text style={styles.loadingText}>Loading animal details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!animal) return null;

    const sev = animal.injury_severity;
    const isClaimed = !!animal.claimed_by_org_id;
    const isOwnClaim = animal.claimed_by_org_id === user?.id;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color={colors.minimalist.textDark} />
                </Pressable>
                <Text style={styles.headerTitle}>Animal Detail</Text>
                <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{animal.animal_code}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* BEFORE — CCTV Image */}
                <View style={styles.imageContainer}>
                    <View style={styles.imageLabel}>
                        <Ionicons name="videocam" size={12} color="#fff" />
                        <Text style={styles.imageLabelText}>BEFORE RESCUE — CCTV Photo</Text>
                    </View>
                    {animal.image_url ? (
                        <Image source={{ uri: animal.image_url }} style={styles.animalImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.animalImage, styles.noImage]}>
                            <Ionicons name="paw" size={56} color="#9CA3AF" />
                            <Text style={styles.noImageText}>No image available</Text>
                        </View>
                    )}
                    <View style={[styles.severityOverlay, { backgroundColor: SEVERITY_COLOR[sev] }]}>
                        <Text style={styles.severityLabel}>{sev.toUpperCase()}</Text>
                    </View>
                </View>

                {/* Core Info */}
                <View style={styles.card}>
                    <View style={styles.infoRow}>
                        <Ionicons name="paw" size={18} color="#0891B2" />
                        <Text style={styles.infoLabel}>Species</Text>
                        <Text style={styles.infoValue}>{animal.species === 'dog' ? '🐕 Dog' : '🐱 Cat'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Ionicons name="medkit" size={18} color={SEVERITY_COLOR[sev]} />
                        <Text style={styles.infoLabel}>Injury</Text>
                        <View style={[styles.sevBadge, { backgroundColor: SEVERITY_BG[sev] }]}>
                            <Text style={[styles.sevBadgeText, { color: SEVERITY_COLOR[sev] }]}>
                                {sev.charAt(0).toUpperCase() + sev.slice(1)}
                            </Text>
                        </View>
                    </View>
                    {animal.injury_signals && animal.injury_signals.length > 0 && (
                        <View style={styles.infoRow}>
                            <Ionicons name="warning" size={18} color="#f97316" />
                            <Text style={styles.infoLabel}>Signals</Text>
                            <Text style={styles.infoValue}>{animal.injury_signals.join(', ')}</Text>
                        </View>
                    )}
                    {animal.ai_confidence && (
                        <View style={styles.infoRow}>
                            <Ionicons name="analytics" size={18} color="#8b5cf6" />
                            <Text style={styles.infoLabel}>AI Confidence</Text>
                            <Text style={styles.infoValue}>{Math.round(animal.ai_confidence * 100)}%</Text>
                        </View>
                    )}
                    <View style={styles.infoRow}>
                        <Ionicons name="time" size={18} color="#6b7280" />
                        <Text style={styles.infoLabel}>Spotted</Text>
                        <Text style={styles.infoValue}>{formatDate(animal.spotted_at)}</Text>
                    </View>
                </View>

                {/* Location */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Location</Text>
                    {animal.latitude && animal.longitude && (
                        <View style={styles.mapEmbed}>
                            <iframe
                                title="animal-location"
                                style={{ width: '100%', height: '100%', border: 'none', borderRadius: 8 } as React.CSSProperties}
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${animal.longitude - 0.01},${animal.latitude - 0.01},${animal.longitude + 0.01},${animal.latitude + 0.01}&layer=mapnik&marker=${animal.latitude},${animal.longitude}`}
                            />
                        </View>
                    )}
                    <View style={styles.addressRow}>
                        <Ionicons name="location" size={16} color="#0891B2" />
                        <Text style={styles.addressText}>{animal.address ?? 'Location unknown'}</Text>
                    </View>
                </View>

                {/* Status */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Rescue Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: isClaimed ? '#fef3c7' : '#d1fae5' }]}>
                        <Ionicons
                            name={isClaimed ? 'time' : 'radio-button-on'}
                            size={16}
                            color={isClaimed ? '#d97706' : '#059669'}
                        />
                        <Text style={[styles.statusText, { color: isClaimed ? '#d97706' : '#059669' }]}>
                            {isClaimed
                                ? isOwnClaim ? 'Claimed by you' : 'Claimed by another org'
                                : 'Unclaimed — needs rescue'}
                        </Text>
                    </View>
                </View>

                {/* Rescue Action */}
                {!isClaimed && (
                    <Pressable onPress={handleClaim} disabled={isClaiming} style={styles.claimWrap}>
                        <LinearGradient
                            colors={['#0891B2', '#0E7490']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.claimBtn}
                        >
                            {isClaiming
                                ? <ActivityIndicator color="#fff" />
                                : <>
                                    <Ionicons name="car" size={20} color="#fff" />
                                    <Text style={styles.claimBtnText}>Go to Rescue</Text>
                                  </>
                            }
                        </LinearGradient>
                    </Pressable>
                )}

                {/* Rescue Confirmation Form */}
                {isOwnClaim && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Confirm Rescue</Text>
                        <Text style={styles.rescueHint}>
                            Upload an AFTER photo of the animal once rescued. This gets saved to the permanent archive.
                        </Text>

                        {/* AFTER — Rescue Photo */}
                        <Pressable onPress={pickRescuePhoto} style={styles.photoBox}>
                            {rescueImageUri ? (
                                <>
                                    <View style={[styles.imageLabel, { backgroundColor: '#059669' }]}>
                                        <Ionicons name="checkmark-circle" size={12} color="#fff" />
                                        <Text style={styles.imageLabelText}>AFTER RESCUE — Your Photo</Text>
                                    </View>
                                    <Image source={{ uri: rescueImageUri }} style={styles.rescuePhoto} resizeMode="cover" />
                                </>
                            ) : (
                                <View style={styles.photoPlaceholder}>
                                    <Ionicons name="camera" size={32} color="#9CA3AF" />
                                    <Text style={styles.photoPlaceholderText}>📷 Upload AFTER rescue photo</Text>
                                </View>
                            )}
                        </Pressable>

                        {/* Health Notes */}
                        <TextInput
                            style={styles.notesInput}
                            placeholder="Health notes (optional) — injuries treated, vet visit, etc."
                            placeholderTextColor={colors.minimalist.textLight}
                            multiline
                            numberOfLines={3}
                            value={healthNotes}
                            onChangeText={setHealthNotes}
                            textAlignVertical="top"
                        />

                        {/* Confirm Button */}
                        <Pressable onPress={handleConfirmRescue} disabled={isConfirming} style={styles.confirmWrap}>
                            <LinearGradient
                                colors={['#059669', '#047857']}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.confirmBtn}
                            >
                                {isConfirming
                                    ? <ActivityIndicator color="#fff" />
                                    : <>
                                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                        <Text style={styles.confirmBtnText}>Confirm Rescue</Text>
                                      </>
                                }
                            </LinearGradient>
                        </Pressable>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safe:         { flex: 1, backgroundColor: colors.minimalist.bgLight },
    center:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText:  { marginTop: 12, color: colors.minimalist.textMedium },
    header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: '#fff' },
    backBtn:      { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.minimalist.bgLight, justifyContent: 'center', alignItems: 'center' },
    headerTitle:  { flex: 1, fontSize: 17, fontWeight: '700', color: colors.minimalist.textDark, textAlign: 'center' },
    codeBadge:    { backgroundColor: 'rgba(8,145,178,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    codeText:     { fontSize: 11, fontWeight: '700', color: '#0891B2' },
    scroll:       { padding: spacing.lg },
    imageContainer: { position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: spacing.md },
    imageLabel:   { position: 'absolute', top: 10, left: 10, zIndex: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    imageLabelText: { fontSize: 10, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
    animalImage:  { width: '100%', height: 240 },
    noImage:      { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    noImageText:  { marginTop: 8, color: '#9CA3AF', fontSize: 14 },
    severityOverlay: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    severityLabel: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
    card:         { backgroundColor: '#fff', borderRadius: 14, padding: spacing.lg, marginBottom: spacing.md },
    cardTitle:    { fontSize: 13, fontWeight: '700', color: colors.minimalist.textDark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
    infoRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    infoLabel:    { flex: 1, fontSize: 14, color: colors.minimalist.textMedium },
    infoValue:    { fontSize: 14, fontWeight: '600', color: colors.minimalist.textDark },
    sevBadge:     { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
    sevBadgeText: { fontSize: 13, fontWeight: '700' },
    mapEmbed:     { height: 160, borderRadius: 10, overflow: 'hidden', marginBottom: spacing.sm },
    addressRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
    addressText:  { flex: 1, fontSize: 14, color: colors.minimalist.textMedium, lineHeight: 20 },
    statusBadge:  { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
    statusText:   { fontSize: 14, fontWeight: '600' },
    claimWrap:    { marginBottom: spacing.md },
    claimBtn:     { height: 54, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    claimBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
    rescueHint:   { fontSize: 13, color: colors.minimalist.textMedium, marginBottom: spacing.md, lineHeight: 20 },
    photoBox:     { borderRadius: 12, overflow: 'hidden', marginBottom: spacing.md, borderWidth: 1.5, borderColor: colors.minimalist.borderLight, borderStyle: 'dashed' },
    rescuePhoto:  { width: '100%', height: 200 },
    photoPlaceholder: { height: 160, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
    photoPlaceholderText: { marginTop: 8, fontSize: 14, color: '#9CA3AF' },
    notesInput:   { backgroundColor: colors.minimalist.bgLight, borderRadius: 10, padding: spacing.md, minHeight: 80, fontSize: 14, color: colors.minimalist.textDark, marginBottom: spacing.md },
    confirmWrap:  {},
    confirmBtn:   { height: 52, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    confirmBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default NGOReportDetailScreen;
