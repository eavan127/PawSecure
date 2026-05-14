import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    TextInput,
    Alert,
    Dimensions,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { serifTextStyles } from '../theme/typography';
import { FloatingCard } from '../components/FloatingCard';
import { ReportStatusBadge } from '../components/ReportStatusBadge';
import { SeverityIndicator } from '../components/SeverityIndicator';
import { ContactModal } from '../components/ContactModal';
import { getReportById, updateReportStatus, addNgoNotes, subscribeToReportUpdates } from '../services/reportService';
import { AnimalReport, ReportStatus } from '../lib/supabaseTypes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const NGOReportDetailScreen: React.FC = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ reportId: string }>();

    const [report, setReport] = useState<AnimalReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showContactModal, setShowContactModal] = useState(false);
    const [ngoNotes, setNgoNotes] = useState('');
    const [activePhotoIndex, setActivePhotoIndex] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Fetch report on mount
    useEffect(() => {
        loadReport();
    }, [params.reportId]);

    // Subscribe to real-time updates
    useEffect(() => {
        if (!params.reportId) return;

        const unsubscribe = subscribeToReportUpdates((updated) => {
            if (updated.id === params.reportId) {
                setReport(updated);
                setNgoNotes(updated.ngoNotes || '');
                console.log('📡 Report updated in real-time');
            }
        });

        return () => unsubscribe();
    }, [params.reportId]);

    const loadReport = async () => {
        if (!params.reportId) {
            Alert.alert('Error', 'No report ID provided');
            router.back();
            return;
        }

        setIsLoading(true);
        try {
            const data = await getReportById(params.reportId);
            if (data) {
                setReport(data);
                setNgoNotes(data.ngoNotes || '');
            } else {
                Alert.alert('Error', 'Report not found');
                router.back();
            }
        } catch (error) {
            console.error('Error loading report:', error);
            Alert.alert('Error', 'Failed to load report');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleStatusUpdate = async (newStatus: ReportStatus) => {
        if (!report) return;

        Alert.alert(
            'Update Status',
            `Mark this report as "${newStatus.replace('_', ' ')}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setIsUpdatingStatus(true);
                        try {
                            await updateReportStatus(report.id, newStatus, 'ngo-user-id', 'NGO User'); // TODO: Use real NGO info
                            Alert.alert('Success', 'Report status updated!');
                        } catch (error) {
                            console.error('Error updating status:', error);
                            Alert.alert('Error', 'Failed to update status');
                        } finally {
                            setIsUpdatingStatus(false);
                        }
                    },
                },
            ]
        );
    };

    const handleToggleField = async (field: 'isRescued' | 'isVaccinated' | 'isNeutered') => {
        if (!report) return;

        const newValue = !report[field];
        setIsUpdatingStatus(true);
        try {
            // Use the specific update function based on field
            if (field === 'isVaccinated') {
                const { updateVaccinationStatus } = await import('../services/reportService');
                await updateVaccinationStatus(report.id, newValue, 'ngo-user-id', 'NGO User');
            } else if (field === 'isNeutered') {
                const { updateNeuteringStatus } = await import('../services/reportService');
                await updateNeuteringStatus(report.id, newValue, 'ngo-user-id', 'NGO User');
            } else if (field === 'isRescued') {
                const { updateRescueStatus } = await import('../services/reportService');
                await updateRescueStatus(report.id, newValue, 'ngo-user-id', 'NGO User');
            }
            // Optimistic update
            setReport(prev => prev ? { ...prev, [field]: newValue } : null);
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            Alert.alert('Error', `Failed to update ${field}`);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!report) return;

        setIsSaving(true);
        try {
            await addNgoNotes(report.id, ngoNotes);
            Alert.alert('Notes Saved', 'Internal notes have been updated.');
        } catch (error) {
            console.error('Error saving notes:', error);
            Alert.alert('Error', 'Failed to save notes');
        } finally {
            setIsSaving(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#0891B2" />
                    <Text style={{ marginTop: 12, color: colors.minimalist.textMedium }}>Loading report...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!report) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="alert-circle-outline" size={48} color={colors.minimalist.textLight} />
                    <Text style={{ marginTop: 12, color: colors.minimalist.textMedium }}>Report not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const photos = report.imageUrl ? [report.imageUrl] : [];
    const coordinates = report.latitude && report.longitude
        ? { lat: report.latitude, lng: report.longitude }
        : null;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.minimalist.textDark} />
                </Pressable>
                <Text style={styles.headerTitle}>Report Details</Text>
                <View style={styles.reportIdBadge}>
                    <Text style={styles.reportIdText}>{report.reportId}</Text>
                </View>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Photo Gallery */}
                <View style={styles.galleryContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                            setActivePhotoIndex(index);
                        }}
                    >
                        {photos.length > 0 ? (
                            photos.map((photo: string, index: number) => (
                                <Image
                                    key={index}
                                    source={{ uri: photo }}
                                    style={styles.galleryImage}
                                    resizeMode="cover"
                                />
                            ))
                        ) : (
                            <View style={[styles.galleryImage, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="paw" size={48} color="#9CA3AF" />
                                <Text style={{ color: '#9CA3AF', marginTop: 8 }}>No photo available</Text>
                            </View>
                        )}
                    </ScrollView>
                    {/* Photo Indicators */}
                    {photos.length > 1 && (
                        <View style={styles.photoIndicators}>
                            {photos.map((_: string, index: number) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.indicator,
                                        activePhotoIndex === index && styles.indicatorActive
                                    ]}
                                />
                            ))}
                        </View>
                    )}
                    {/* Photo Counter */}
                    {photos.length > 0 && (
                        <View style={styles.photoCounter}>
                            <Text style={styles.photoCounterText}>
                                {activePhotoIndex + 1}/{photos.length}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Status & Emergency Row */}
                <View style={styles.statusRow}>
                    <ReportStatusBadge status={report.status as any} />
                    {report.isEmergency && (
                        <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="alert-circle" size={16} color="#DC2626" />
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#DC2626' }}>EMERGENCY</Text>
                        </View>
                    )}
                </View>

                {/* Animal Information */}
                <FloatingCard shadow="soft" style={styles.section}>
                    <Text style={styles.sectionTitle}>Animal Information</Text>
                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Type</Text>
                            <Text style={styles.infoValue}>
                                {report.species === 'dog' ? '🐕' : '🐱'} {report.species.charAt(0).toUpperCase() + report.species.slice(1)}
                            </Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Breed</Text>
                            <Text style={styles.infoValue}>{report.breed || 'Unknown'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Color</Text>
                            <Text style={styles.infoValue}>{report.color || 'Unknown'}</Text>
                        </View>
                    </View>
                </FloatingCard>

                {/* Health Notes */}
                <FloatingCard shadow="soft" style={styles.section}>
                    <Text style={styles.sectionTitle}>Health Notes</Text>
                    <Text style={styles.descriptionText}>{report.healthNotes || 'No health notes provided'}</Text>
                </FloatingCard>

                {/* Location */}
                <FloatingCard shadow="soft" style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    {coordinates && (
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: coordinates.lat,
                                    longitude: coordinates.lng,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                            >
                                <Marker
                                    coordinate={{
                                        latitude: coordinates.lat,
                                        longitude: coordinates.lng,
                                    }}
                                />
                            </MapView>
                        </View>
                    )}
                    <View style={styles.addressRow}>
                        <Ionicons name="location" size={18} color="#0891B2" />
                        <Text style={styles.addressText}>{report.address}</Text>
                    </View>
                </FloatingCard>

                {/* Reporter Information */}
                <FloatingCard shadow="soft" style={styles.section}>
                    <Text style={styles.sectionTitle}>Reporter Information</Text>
                    <View style={styles.reporterCard}>
                        <View style={styles.reporterAvatar}>
                            <Ionicons name="person" size={24} color="#0891B2" />
                        </View>
                        <View style={styles.reporterInfo}>
                            <Text style={styles.reporterName}>{report.reporterName}</Text>
                            <Text style={styles.reportTime}>
                                Reported on {formatDateTime(report.createdAt)}
                            </Text>
                        </View>
                    </View>
                    {report.reporterPhone && (
                        <Pressable
                            style={styles.contactButton}
                            onPress={() => setShowContactModal(true)}
                        >
                            <Ionicons name="chatbubble-ellipses" size={20} color={colors.minimalist.white} />
                            <Text style={styles.contactButtonText}>Contact Reporter</Text>
                        </Pressable>
                    )}
                </FloatingCard>

                {/* NGO Actions */}
                <FloatingCard shadow="soft" style={styles.section}>
                    <Text style={styles.sectionTitle}>Update Status</Text>
                    <View style={styles.actionsRow}>
                        {report.status !== 'in_progress' && (
                            <Pressable
                                style={[styles.actionButton, styles.inProgressButton]}
                                onPress={() => handleStatusUpdate('in_progress')}
                                disabled={isUpdatingStatus}
                            >
                                <Ionicons name="time" size={18} color="#D97706" />
                                <Text style={[styles.actionButtonText, { color: '#D97706' }]}>
                                    Mark In Progress
                                </Text>
                            </Pressable>
                        )}
                        {report.status !== 'rescued' && (
                            <Pressable
                                style={[styles.actionButton, { backgroundColor: '#DBEAFE' }]}
                                onPress={() => handleStatusUpdate('rescued')}
                                disabled={isUpdatingStatus}
                            >
                                <Ionicons name="heart" size={18} color="#2563EB" />
                                <Text style={[styles.actionButtonText, { color: '#2563EB' }]}>
                                    Mark Rescued
                                </Text>
                            </Pressable>
                        )}
                        {report.status !== 'resolved' && (
                            <Pressable
                                style={[styles.actionButton, styles.resolvedButton]}
                                onPress={() => handleStatusUpdate('resolved')}
                                disabled={isUpdatingStatus}
                            >
                                <Ionicons name="checkmark-circle" size={18} color="#059669" />
                                <Text style={[styles.actionButtonText, { color: '#059669' }]}>
                                    Mark Resolved
                                </Text>
                            </Pressable>
                        )}
                    </View>
                </FloatingCard>

                {/* Animal Welfare Status */}
                <FloatingCard shadow="soft" style={styles.section}>
                    <Text style={styles.sectionTitle}>Animal Welfare</Text>

                    {/* Rescued Toggle */}
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Ionicons name="heart" size={20} color="#2563EB" />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.toggleLabel}>Rescued</Text>
                                <Text style={styles.toggleDescription}>Animal has been rescued</Text>
                            </View>
                        </View>
                        <Switch
                            value={report.isRescued}
                            onValueChange={() => handleToggleField('isRescued')}
                            trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                            thumbColor={report.isRescued ? '#2563EB' : '#9CA3AF'}
                            disabled={isUpdatingStatus}
                        />
                    </View>

                    {/* Vaccinated Toggle */}
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Ionicons name="medkit" size={20} color="#059669" />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.toggleLabel}>Vaccinated</Text>
                                <Text style={styles.toggleDescription}>Vaccinations administered</Text>
                            </View>
                        </View>
                        <Switch
                            value={report.isVaccinated}
                            onValueChange={() => handleToggleField('isVaccinated')}
                            trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
                            thumbColor={report.isVaccinated ? '#059669' : '#9CA3AF'}
                            disabled={isUpdatingStatus}
                        />
                    </View>

                    {/* Neutered Toggle */}
                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Ionicons name="cut" size={20} color="#7C3AED" />
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.toggleLabel}>Neutered/Spayed</Text>
                                <Text style={styles.toggleDescription}>Sterilization completed</Text>
                            </View>
                        </View>
                        <Switch
                            value={report.isNeutered}
                            onValueChange={() => handleToggleField('isNeutered')}
                            trackColor={{ false: '#E5E7EB', true: '#DDD6FE' }}
                            thumbColor={report.isNeutered ? '#7C3AED' : '#9CA3AF'}
                            disabled={isUpdatingStatus}
                        />
                    </View>

                    {isUpdatingStatus && (
                        <View style={{ alignItems: 'center', marginTop: 8 }}>
                            <ActivityIndicator size="small" color="#0891B2" />
                        </View>
                    )}
                </FloatingCard>

                {/* Rescue Outcome - Only show when rescued */}
                {(report.isRescued || report.status === 'rescued') && (
                    <FloatingCard shadow="soft" style={styles.section}>
                        <Text style={styles.sectionTitle}>Rescue Outcome</Text>
                        <Text style={styles.outcomeDescription}>
                            Select the final outcome for this rescued animal:
                        </Text>
                        <View style={styles.outcomeButtonsRow}>
                            <Pressable
                                style={[
                                    styles.outcomeButton,
                                    styles.releaseButton,
                                    report.rescueOutcome === 'released_to_nature' && styles.outcomeButtonActive,
                                ]}
                                onPress={async () => {
                                    Alert.alert(
                                        'Release to Nature',
                                        'Mark this animal as released back to nature?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            {
                                                text: 'Confirm',
                                                onPress: async () => {
                                                    setIsUpdatingStatus(true);
                                                    try {
                                                        const { supabase } = await import('../lib/supabase');
                                                        await supabase
                                                            .from('animal_reports')
                                                            .update({
                                                                rescue_outcome: 'released_to_nature',
                                                                // Keep tracking enabled - animal may be re-spotted
                                                                is_tracking_enabled: true,
                                                                updated_at: new Date().toISOString()
                                                            })
                                                            .eq('id', report.id);
                                                        Alert.alert('Success', 'Animal marked as released to nature. Tracking remains active.');
                                                    } catch (error) {
                                                        console.error('Error:', error);
                                                        Alert.alert('Error', 'Failed to update outcome');
                                                    } finally {
                                                        setIsUpdatingStatus(false);
                                                    }
                                                },
                                            },
                                        ]
                                    );
                                }}
                                disabled={isUpdatingStatus}
                            >
                                <Ionicons name="leaf" size={22} color="#059669" />
                                <Text style={styles.releaseButtonText}>Release to Nature</Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.outcomeButton,
                                    styles.shelterButton,
                                    report.rescueOutcome === 'shelter_recovery' && styles.outcomeButtonActive,
                                ]}
                                onPress={async () => {
                                    Alert.alert(
                                        'Send to Shelter',
                                        'Place this animal in shelter for recovery? You can create an adoption post later.',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            {
                                                text: 'Confirm',
                                                onPress: async () => {
                                                    setIsUpdatingStatus(true);
                                                    try {
                                                        const { supabase } = await import('../lib/supabase');
                                                        await supabase
                                                            .from('animal_reports')
                                                            .update({
                                                                rescue_outcome: 'shelter_recovery',
                                                                updated_at: new Date().toISOString()
                                                            })
                                                            .eq('id', report.id);
                                                        Alert.alert('Success', 'Animal is now in shelter recovery. You can create an adoption post when ready.');
                                                    } catch (error) {
                                                        console.error('Error:', error);
                                                        Alert.alert('Error', 'Failed to update outcome');
                                                    } finally {
                                                        setIsUpdatingStatus(false);
                                                    }
                                                },
                                            },
                                        ]
                                    );
                                }}
                                disabled={isUpdatingStatus}
                            >
                                <Ionicons name="home" size={22} color="#6366F1" />
                                <Text style={styles.shelterButtonText}>Send to Shelter</Text>
                            </Pressable>
                        </View>

                        {/* Create Adoption Post - only show if in shelter */}
                        {report.rescueOutcome === 'shelter_recovery' && (
                            <Pressable
                                style={styles.adoptionPostButton}
                                onPress={() => {
                                    router.push({
                                        pathname: '/ngo-create-adoption',
                                        params: {
                                            reportId: report.id,
                                            animalId: report.animalId,
                                            species: report.species,
                                            breed: report.breed || '',
                                            color: report.color || '',
                                            imageUrl: report.imageUrl,
                                        },
                                    });
                                }}
                            >
                                <Ionicons name="add-circle" size={20} color="#fff" />
                                <Text style={styles.adoptionPostButtonText}>
                                    Create Adoption Post
                                </Text>
                            </Pressable>
                        )}
                    </FloatingCard>
                )}

                {/* Internal Notes */}
                <FloatingCard shadow="soft" style={styles.section}>
                    <View style={styles.notesHeader}>
                        <Text style={styles.sectionTitle}>Internal Notes</Text>
                        <View style={styles.privateTag}>
                            <Ionicons name="lock-closed" size={12} color={colors.minimalist.textMedium} />
                            <Text style={styles.privateText}>Private</Text>
                        </View>
                    </View>
                    <TextInput
                        style={styles.notesInput}
                        placeholder="Add notes for volunteers..."
                        placeholderTextColor={colors.minimalist.textLight}
                        multiline
                        numberOfLines={4}
                        value={ngoNotes}
                        onChangeText={setNgoNotes}
                        textAlignVertical="top"
                    />
                    <Pressable
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                        onPress={handleSaveNotes}
                        disabled={isSaving}
                    >
                        <Text style={styles.saveButtonText}>
                            {isSaving ? 'Saving...' : 'Save Notes'}
                        </Text>
                    </Pressable>
                </FloatingCard>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Contact Modal */}
            <ContactModal
                visible={showContactModal}
                onClose={() => setShowContactModal(false)}
                contactName={report.reporterName}
                phone={report.reporterPhone}
                email={undefined} // AnimalReport doesn't have email field
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.minimalist.bgLight,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.minimalist.white,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.minimalist.bgLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...serifTextStyles.serifSubheading,
        color: colors.minimalist.textDark,
        flex: 1,
        textAlign: 'center',
    },
    reportIdBadge: {
        backgroundColor: colors.minimalist.peachLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 8,
    },
    reportIdText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#0891B2',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    galleryContainer: {
        position: 'relative',
        height: 280,
    },
    galleryImage: {
        width: SCREEN_WIDTH,
        height: 280,
    },
    photoIndicators: {
        position: 'absolute',
        bottom: spacing.md,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    indicatorActive: {
        backgroundColor: colors.minimalist.white,
        width: 20,
    },
    photoCounter: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    photoCounterText: {
        color: colors.minimalist.white,
        fontSize: 12,
        fontWeight: '600',
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.md,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.lg,
    },
    section: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        marginBottom: spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    infoItem: {
        flex: 1,
        minWidth: '30%',
    },
    infoLabel: {
        fontSize: 12,
        color: colors.minimalist.textLight,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
        color: colors.minimalist.textMedium,
    },
    mapContainer: {
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: spacing.sm,
    },
    map: {
        flex: 1,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.xs,
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        color: colors.minimalist.textMedium,
        lineHeight: 20,
    },
    reporterCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    reporterAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.minimalist.peachLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    reporterInfo: {
        flex: 1,
    },
    reporterName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    reportTime: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
        marginTop: 2,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#A5E5ED',
        paddingVertical: spacing.md,
        borderRadius: 12,
        gap: spacing.sm,
    },
    contactButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.minimalist.white,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: 12,
        gap: spacing.xs,
    },
    inProgressButton: {
        backgroundColor: '#FEF3C7',
    },
    resolvedButton: {
        backgroundColor: '#D1FAE5',
    },
    actionButtonText: {
        fontSize: 13,
        fontWeight: '600',
    },
    notesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    privateTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.minimalist.bgLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    privateText: {
        fontSize: 11,
        color: colors.minimalist.textMedium,
    },
    notesInput: {
        backgroundColor: colors.minimalist.bgLight,
        borderRadius: 12,
        padding: spacing.md,
        minHeight: 100,
        fontSize: 15,
        color: colors.minimalist.textDark,
        marginBottom: spacing.md,
    },
    saveButton: {
        backgroundColor: '#A5E5ED',
        paddingVertical: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.minimalist.white,
    },
    bottomSpacing: {
        height: 40,
    },
    // Toggle styles for animal welfare section
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    toggleLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    toggleDescription: {
        fontSize: 12,
        color: colors.minimalist.textLight,
        marginTop: 2,
    },
    // Rescue Outcome styles
    outcomeDescription: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
        marginBottom: spacing.md,
    },
    outcomeButtonsRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    outcomeButton: {
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    releaseButton: {
        backgroundColor: '#D1FAE5',
    },
    shelterButton: {
        backgroundColor: '#E0E7FF',
    },
    outcomeButtonActive: {
        borderWidth: 2,
        borderColor: '#059669',
    },
    releaseButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
    },
    shelterButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6366F1',
    },
    adoptionPostButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#7C3AED',
        paddingVertical: spacing.md,
        borderRadius: 12,
        marginTop: spacing.md,
        gap: spacing.sm,
    },
    adoptionPostButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
});

export default NGOReportDetailScreen;
