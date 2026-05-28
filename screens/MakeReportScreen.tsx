/**
 * MakeReportScreen
 *
 * NGO uploads a CCTV image or video frame → AI analyses it (YOLO + CLIP + injury)
 * → NGO confirms location → saved to pending_animals queue.
 *
 * Flow:
 *   1. Upload image OR extract a frame from a video
 *   2. Press "Analyse with AI" → calls FastAPI /pipeline
 *   3. Review results (species, injury severity, signals)
 *   4. Enter location (auto-detected or typed manually)
 *   5. Press "Submit to Rescue Queue" → addPendingAnimal()
 */

import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    Image, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { yoloBackendService } from '../services/yoloBackendService';
import { addPendingAnimal } from '../services/animalService';
import { getCurrentLocation } from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';
import type { PipelineAnimal } from '../services/yoloBackendService';
import type { InjurySeverity, Species } from '../lib/supabaseTypes';

const SEVERITY_COLOR: Record<string, string> = {
    none:     '#22c55e',
    mild:     '#eab308',
    moderate: '#f97316',
    severe:   '#ef4444',
    critical: '#7c3aed',
};

function generateAnimalCode(): string {
    const year = new Date().getFullYear();
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PS-${year}-${rand}`;
}

export default function MakeReportScreen() {
    const router = useRouter();
    const { user } = useAuth();

    // Upload state
    const [imageUri,    setImageUri]    = useState<string | null>(null);
    const [videoUri,    setVideoUri]    = useState<string | null>(null);
    const [isVideo,     setIsVideo]     = useState(false);

    // AI result state
    const [analysing,   setAnalysing]   = useState(false);
    const [aiAnimals,   setAiAnimals]   = useState<PipelineAnimal[]>([]);
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [aiError,     setAiError]     = useState('');
    const [backendOffline, setBackendOffline] = useState(false);

    // Manual override / location
    const [address,     setAddress]     = useState('');
    const [latitude,    setLatitude]    = useState<number | null>(null);
    const [longitude,   setLongitude]   = useState<number | null>(null);
    const [gettingLoc,  setGettingLoc]  = useState(false);

    // Submission
    const [submitting,  setSubmitting]  = useState(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // ── File picker ─────────────────────────────────────────────────────────

    const pickImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
                setImageUri(URL.createObjectURL(file));
                setVideoUri(null);
                setIsVideo(false);
                setAiAnimals([]);
                setAiError('');
            }
        };
        input.click();
    };

    const pickVideo = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
                setVideoUri(URL.createObjectURL(file));
                setImageUri(null);
                setIsVideo(true);
                setAiAnimals([]);
                setAiError('');
            }
        };
        input.click();
    };

    // Extract the current video frame as an image for AI analysis
    const captureFrameFromVideo = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas) {
                reject(new Error('Video or canvas not ready'));
                return;
            }
            canvas.width  = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) { reject(new Error('Canvas context not available')); return; }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
                if (!blob) { reject(new Error('Failed to capture frame')); return; }
                resolve(URL.createObjectURL(blob));
            }, 'image/jpeg', 0.9);
        });
    };

    // ── AI Analysis ─────────────────────────────────────────────────────────

    const runAnalysis = async () => {
        setAiError('');
        setAiAnimals([]);

        let frameUri = imageUri;

        if (isVideo && videoUri) {
            try {
                frameUri = await captureFrameFromVideo();
                setImageUri(frameUri); // show the captured frame
            } catch (e: any) {
                setAiError('Could not extract video frame. Try pausing the video first.');
                return;
            }
        }

        if (!frameUri) {
            setAiError('Please upload an image or video first.');
            return;
        }

        setAnalysing(true);
        try {
            const result = await yoloBackendService.runPipeline(frameUri);
            if (!result.success || result.animal_count === 0) {
                setAiError('No animals detected in this image. Try a clearer photo.');
            } else {
                setAiAnimals(result.animals);
                setSelectedIdx(0);
            }
        } catch (e: any) {
            if (e.message?.includes('not reachable')) {
                setBackendOffline(true);
                setAiError('AI backend is offline. You can still submit manually below.');
            } else {
                setAiError(e.message || 'Analysis failed.');
            }
        } finally {
            setAnalysing(false);
        }
    };

    // ── Location ────────────────────────────────────────────────────────────

    const detectLocation = async () => {
        setGettingLoc(true);
        try {
            const loc = await getCurrentLocation();
            if (!loc.success || !loc.coordinates) {
                Alert.alert('Location unavailable', loc.error ?? 'Enter the address manually.');
                return;
            }
            setLatitude(loc.coordinates.latitude);
            setLongitude(loc.coordinates.longitude);
            setAddress(
                loc.address ??
                `${loc.coordinates.latitude.toFixed(4)}, ${loc.coordinates.longitude.toFixed(4)}`
            );
        } catch {
            Alert.alert('Location unavailable', 'Enter the address manually.');
        } finally {
            setGettingLoc(false);
        }
    };

    // ── Submit ───────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!imageUri) {
            Alert.alert('No image', 'Please upload a CCTV image or video frame first.');
            return;
        }
        if (!latitude || !longitude) {
            Alert.alert('No location', 'Please detect your location or enter coordinates.');
            return;
        }

        const selected = aiAnimals[selectedIdx];
        const species: Species       = (selected?.class_name as Species) ?? 'dog';
        const severity: InjurySeverity = (selected?.injury?.severity as InjurySeverity) ?? 'none';
        const signals                = selected?.injury?.signals ?? [];
        const confidence             = selected?.confidence ?? null;

        setSubmitting(true);
        try {
            await addPendingAnimal({
                animal_code:       generateAnimalCode(),
                species,
                injury_severity:   severity,
                injury_signals:    signals.length > 0 ? signals : null,
                ai_confidence:     confidence,
                image_url:         imageUri,
                address:           address || null,
                latitude,
                longitude,
                spotted_at:        new Date().toISOString(),
                claimed_by_org_id: null,
                claimed_at:        null,
                status:            'sighted',
            });

            Alert.alert(
                'Submitted!',
                'Animal added to the rescue queue. NGOs can now see it on the map.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const selected = aiAnimals[selectedIdx];

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color={colors.minimalist.textDark} />
                </Pressable>
                <Text style={styles.headerTitle}>CCTV Animal Report</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Step 1 — Upload */}
                <View style={styles.stepCard}>
                    <View style={styles.stepHeader}>
                        <View style={styles.stepNum}><Text style={styles.stepNumText}>1</Text></View>
                        <Text style={styles.stepTitle}>Upload CCTV footage</Text>
                    </View>
                    <Text style={styles.stepHint}>
                        Upload a photo from a CCTV camera, or a video clip. For video, pause on the clearest frame before analysing.
                    </Text>

                    <View style={styles.uploadRow}>
                        <Pressable style={styles.uploadBtn} onPress={pickImage}>
                            <Ionicons name="image" size={24} color="#0891B2" />
                            <Text style={styles.uploadBtnText}>Upload Image</Text>
                        </Pressable>
                        <Pressable style={styles.uploadBtn} onPress={pickVideo}>
                            <Ionicons name="videocam" size={24} color="#7c3aed" />
                            <Text style={[styles.uploadBtnText, { color: '#7c3aed' }]}>Upload Video</Text>
                        </Pressable>
                    </View>

                    {/* Image preview */}
                    {imageUri && !isVideo && (
                        <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
                    )}

                    {/* Video preview */}
                    {videoUri && isVideo && (
                        <View style={styles.videoContainer}>
                            <video
                                ref={videoRef}
                                src={videoUri}
                                controls
                                style={{ width: '100%', borderRadius: 10, maxHeight: 240 }}
                            />
                            <Text style={styles.videoHint}>
                                Pause on the clearest frame of the animal, then press "Analyse with AI"
                            </Text>
                        </View>
                    )}

                    {/* Hidden canvas for frame capture */}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </View>

                {/* Step 2 — AI Analysis */}
                <View style={styles.stepCard}>
                    <View style={styles.stepHeader}>
                        <View style={styles.stepNum}><Text style={styles.stepNumText}>2</Text></View>
                        <Text style={styles.stepTitle}>AI Analysis</Text>
                    </View>

                    <Pressable
                        onPress={runAnalysis}
                        disabled={analysing || (!imageUri && !videoUri)}
                        style={[styles.analyseWrap, (!imageUri && !videoUri) && { opacity: 0.4 }]}
                    >
                        <LinearGradient
                            colors={['#7c3aed', '#6d28d9']}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={styles.analyseBtn}
                        >
                            {analysing
                                ? <><ActivityIndicator color="#fff" /><Text style={styles.analyseBtnText}>Analysing...</Text></>
                                : <><Ionicons name="sparkles" size={18} color="#fff" /><Text style={styles.analyseBtnText}>Analyse with AI</Text></>
                            }
                        </LinearGradient>
                    </Pressable>

                    {!!aiError && (
                        <View style={styles.errorBox}>
                            <Ionicons name="alert-circle" size={16} color={backendOffline ? '#f97316' : '#ef4444'} />
                            <Text style={[styles.errorText, backendOffline && { color: '#f97316' }]}>{aiError}</Text>
                        </View>
                    )}

                    {/* AI Results */}
                    {aiAnimals.length > 0 && (
                        <View style={styles.resultsBox}>
                            <Text style={styles.resultsTitle}>
                                {aiAnimals.length} animal{aiAnimals.length !== 1 ? 's' : ''} detected
                            </Text>

                            {/* Animal selector tabs if multiple */}
                            {aiAnimals.length > 1 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.animalTabs}>
                                    {aiAnimals.map((a, i) => (
                                        <Pressable
                                            key={i}
                                            style={[styles.animalTab, selectedIdx === i && styles.animalTabActive]}
                                            onPress={() => setSelectedIdx(i)}
                                        >
                                            <Text style={[styles.animalTabText, selectedIdx === i && styles.animalTabTextActive]}>
                                                {a.class_name === 'dog' ? '🐕' : '🐱'} Animal {i + 1}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </ScrollView>
                            )}

                            {selected && (
                                <View style={styles.animalResult}>
                                    <View style={styles.resultRow}>
                                        <Text style={styles.resultLabel}>Species</Text>
                                        <Text style={styles.resultValue}>
                                            {selected.class_name === 'dog' ? '🐕 Dog' : '🐱 Cat'}
                                        </Text>
                                    </View>
                                    <View style={styles.resultRow}>
                                        <Text style={styles.resultLabel}>Confidence</Text>
                                        <Text style={styles.resultValue}>
                                            {Math.round(selected.confidence * 100)}%
                                        </Text>
                                    </View>
                                    <View style={styles.resultRow}>
                                        <Text style={styles.resultLabel}>Injury</Text>
                                        <View style={[styles.sevBadge, { backgroundColor: SEVERITY_COLOR[selected.injury.severity] + '22' }]}>
                                            <Text style={[styles.sevBadgeText, { color: SEVERITY_COLOR[selected.injury.severity] }]}>
                                                {selected.injury.severity.charAt(0).toUpperCase() + selected.injury.severity.slice(1)}
                                            </Text>
                                        </View>
                                    </View>
                                    {selected.injury.signals.length > 0 && (
                                        <View style={styles.resultRow}>
                                            <Text style={styles.resultLabel}>Signals</Text>
                                            <Text style={styles.resultValue}>{selected.injury.signals.join(', ')}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Manual entry when backend is offline */}
                    {backendOffline && (
                        <Text style={styles.offlineNote}>
                            You can still submit without AI — start the FastAPI backend to enable AI analysis.
                        </Text>
                    )}
                </View>

                {/* Step 3 — Location */}
                <View style={styles.stepCard}>
                    <View style={styles.stepHeader}>
                        <View style={styles.stepNum}><Text style={styles.stepNumText}>3</Text></View>
                        <Text style={styles.stepTitle}>Location of animal</Text>
                    </View>

                    <Pressable style={styles.locBtn} onPress={detectLocation} disabled={gettingLoc}>
                        {gettingLoc
                            ? <ActivityIndicator size="small" color="#0891B2" />
                            : <Ionicons name="locate" size={18} color="#0891B2" />
                        }
                        <Text style={styles.locBtnText}>
                            {gettingLoc ? 'Detecting...' : 'Use my current location'}
                        </Text>
                    </Pressable>

                    <TextInput
                        style={styles.input}
                        placeholder="Or type address / area name (e.g. Ampang, Selangor)"
                        placeholderTextColor={colors.minimalist.textLight}
                        value={address}
                        onChangeText={setAddress}
                    />

                    {latitude && longitude && (
                        <Text style={styles.coordsText}>
                            GPS: {latitude.toFixed(5)}, {longitude.toFixed(5)}
                        </Text>
                    )}
                </View>

                {/* Submit */}
                <Pressable
                    onPress={handleSubmit}
                    disabled={submitting || !imageUri}
                    style={[styles.submitWrap, (!imageUri) && { opacity: 0.4 }]}
                >
                    <LinearGradient
                        colors={['#0891B2', '#0E7490']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.submitBtn}
                    >
                        {submitting
                            ? <ActivityIndicator color="#fff" />
                            : <><Ionicons name="paw" size={20} color="#fff" /><Text style={styles.submitBtnText}>Submit to Rescue Queue</Text></>
                        }
                    </LinearGradient>
                </Pressable>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe:        { flex: 1, backgroundColor: '#FAFBFC' },
    header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: colors.minimalist.textDark },
    scroll:      { padding: spacing.lg },
    stepCard:    { backgroundColor: '#fff', borderRadius: 14, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: '#F0F0F0' },
    stepHeader:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: spacing.sm },
    stepNum:     { width: 28, height: 28, borderRadius: 14, backgroundColor: '#0891B2', justifyContent: 'center', alignItems: 'center' },
    stepNumText: { fontSize: 13, fontWeight: '800', color: '#fff' },
    stepTitle:   { fontSize: 16, fontWeight: '700', color: colors.minimalist.textDark },
    stepHint:    { fontSize: 13, color: colors.minimalist.textMedium, lineHeight: 20, marginBottom: spacing.md },
    uploadRow:   { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
    uploadBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F0F9FF', borderWidth: 1.5, borderColor: '#BAE6FD', borderRadius: 10, paddingVertical: 14, borderStyle: 'dashed' },
    uploadBtnText: { fontSize: 13, fontWeight: '600', color: '#0891B2' },
    preview:     { width: '100%', height: 220, borderRadius: 10 },
    videoContainer: { borderRadius: 10, overflow: 'hidden' },
    videoHint:   { fontSize: 12, color: colors.minimalist.textMedium, marginTop: 6, textAlign: 'center', fontStyle: 'italic' },
    analyseWrap: { marginBottom: spacing.md },
    analyseBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: 12 },
    analyseBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
    errorBox:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fef2f2', borderRadius: 8, padding: spacing.md, marginBottom: spacing.sm },
    errorText:   { flex: 1, fontSize: 13, color: '#ef4444', lineHeight: 18 },
    offlineNote: { fontSize: 13, color: '#f97316', fontStyle: 'italic', textAlign: 'center', marginTop: spacing.sm },
    resultsBox:  { backgroundColor: '#F0F9FF', borderRadius: 10, padding: spacing.md },
    resultsTitle: { fontSize: 14, fontWeight: '700', color: '#0891B2', marginBottom: spacing.sm },
    animalTabs:  { marginBottom: spacing.sm },
    animalTab:   { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#E0F2FE', marginRight: 8 },
    animalTabActive: { backgroundColor: '#0891B2' },
    animalTabText:   { fontSize: 13, fontWeight: '600', color: '#0369A1' },
    animalTabTextActive: { color: '#fff' },
    animalResult: { gap: 8 },
    resultRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    resultLabel: { fontSize: 13, color: colors.minimalist.textMedium },
    resultValue: { fontSize: 14, fontWeight: '600', color: colors.minimalist.textDark },
    sevBadge:    { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
    sevBadgeText: { fontSize: 13, fontWeight: '700' },
    locBtn:      { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E0F2FE', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, marginBottom: spacing.md },
    locBtnText:  { fontSize: 14, fontWeight: '600', color: '#0891B2' },
    input:       { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: spacing.md, height: 48, fontSize: 14, color: colors.minimalist.textDark, backgroundColor: '#fff', marginBottom: spacing.xs },
    coordsText:  { fontSize: 12, color: colors.minimalist.textLight, marginTop: 4 },
    submitWrap:  { marginTop: spacing.sm },
    submitBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, borderRadius: 14 },
    submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
