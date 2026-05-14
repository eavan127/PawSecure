import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FloatingCard } from '../components/FloatingCard';
import { StatusBadge } from '../components/StatusBadge';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { serifTextStyles } from '../theme/typography';
import { getReportsByUser, subscribeToReportUpdates } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import { AnimalReport } from '../lib/supabaseTypes';

export default function ReportHistoryScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const isNGO = user?.role === 'ngo';
    const accentColor = isNGO ? '#0891B2' : colors.minimalist.coral;
    const [reports, setReports] = useState<AnimalReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadUserReports();
    }, [user]);

    // Subscribe to real-time updates
    useEffect(() => {
        if (!user) return;

        const unsubscribe = subscribeToReportUpdates((updatedReport) => {
            // Only update if this report belongs to the current user
            if (updatedReport.reporterId === user.id) {
                setReports(prev =>
                    prev.map(r => r.id === updatedReport.id ? updatedReport : r)
                );
                console.log('📡 Real-time update received for:', updatedReport.reportId);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [user]);

    const loadUserReports = async () => {
        if (!user) {
            setReports([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            console.log('📥 Loading reports for user:', user.id);
            const userReports = await getReportsByUser(user.id);
            console.log('✅ Loaded', userReports.length, 'reports');
            setReports(userReports);
        } catch (error) {
            console.error('❌ Error loading reports:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.minimalist.textDark} />
                </Pressable>
                <Text style={styles.title}>Report History</Text>
            </View>


            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {isLoading ? (
                    <View style={styles.loadingState}>
                        <ActivityIndicator size="large" color={accentColor} />
                        <Text style={styles.loadingText}>Loading your animals...</Text>
                    </View>
                ) : reports.length > 0 ? (
                    reports.map((report) => (
                        <Pressable
                            key={report.id}
                            onPress={() => router.push({
                                pathname: '/animal-profile',
                                params: { id: report.id }
                            })}
                        >
                            {({ pressed }) => (
                                <FloatingCard shadow="soft" style={[styles.reportCard, pressed && styles.pressed]}>
                                    <View style={styles.cardContent}>
                                        {report.imageUrl && (
                                            <Image
                                                source={{ uri: report.imageUrl }}
                                                style={styles.thumbnail}
                                            />
                                        )}
                                        <View style={styles.cardInfo}>
                                            <View style={styles.cardHeader}>
                                                <View style={styles.animalInfo}>
                                                    <Text style={styles.animalName}>
                                                        {report.species === 'dog' ? '🐕' : '🐈'} {report.breed || 'Unknown breed'}
                                                    </Text>
                                                    <Text style={[styles.animalId, { color: accentColor }]}>
                                                        ID: {report.animalId}
                                                    </Text>
                                                    <Text style={styles.reportDate}>
                                                        {new Date(report.createdAt).toLocaleDateString()} • {report.address}
                                                    </Text>
                                                </View>
                                                <StatusBadge status={report.status as any} />
                                            </View>

                                            {report.color && (
                                                <Text style={styles.colorText}>Color: {report.color}</Text>
                                            )}

                                            {/* Status progression indicators */}
                                            <View style={styles.statusRow}>
                                                {report.isRescued && (
                                                    <View style={[styles.statusPill, { backgroundColor: 'rgba(167, 243, 208, 0.5)' }]}>
                                                        <Ionicons name="checkmark-circle" size={12} color={colors.minimalist.greenDark} />
                                                        <Text style={[styles.statusPillText, { color: colors.minimalist.greenDark }]}>Rescued</Text>
                                                    </View>
                                                )}
                                                {report.isVaccinated && (
                                                    <View style={[styles.statusPill, { backgroundColor: 'rgba(147, 197, 253, 0.3)' }]}>
                                                        <Ionicons name="medkit" size={12} color="#2563EB" />
                                                        <Text style={[styles.statusPillText, { color: '#2563EB' }]}>Vaccinated</Text>
                                                    </View>
                                                )}
                                                {report.isNeutered && (
                                                    <View style={[styles.statusPill, { backgroundColor: 'rgba(196, 181, 253, 0.3)' }]}>
                                                        <Ionicons name="cut" size={12} color="#7C3AED" />
                                                        <Text style={[styles.statusPillText, { color: '#7C3AED' }]}>Neutered</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.divider} />

                                    <View style={styles.cardFooter}>
                                        <Text style={[styles.viewDetails, { color: accentColor }]}>View Details</Text>
                                        <Ionicons name="chevron-forward" size={16} color={accentColor} />
                                    </View>
                                </FloatingCard>
                            )}
                        </Pressable>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-text-outline" size={64} color={colors.minimalist.textLight} />
                        <Text style={styles.emptyText}>No animals scanned yet</Text>
                        <Pressable
                            style={[styles.ctaButton, { backgroundColor: accentColor }]}
                            onPress={() => router.push('/AIReportCamera')}
                        >
                            <Text style={styles.ctaText}>Scan Your First Animal</Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.minimalist.bgLight,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: colors.minimalist.white,
    },
    backButton: {
        marginRight: spacing.md,
    },
    title: {
        ...serifTextStyles.serifHeading,
        fontSize: 22,
        color: colors.minimalist.textDark,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    reportCard: {
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    pressed: {
        opacity: 0.9,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    animalInfo: {
        flex: 1,
        marginRight: spacing.sm,
    },
    animalName: {
        fontSize: 17,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: 4,
    },
    reportDate: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
    },
    divider: {
        height: 1,
        backgroundColor: colors.minimalist.border,
        marginVertical: spacing.md,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    viewDetails: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.coral,
        marginRight: 4,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        color: colors.minimalist.textMedium,
        marginTop: spacing.md,
        marginBottom: spacing.xl,
    },
    ctaButton: {
        backgroundColor: colors.minimalist.coral,
        paddingHorizontal: spacing.xl,
        paddingVertical: 12,
        borderRadius: 25,
    },
    ctaText: {
        color: colors.minimalist.white,
        fontWeight: '600',
        fontSize: 16,
    },
    cardContent: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: colors.gray200,
    },
    cardInfo: {
        flex: 1,
    },
    colorText: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
        marginTop: 4,
    },
    loadingState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    loadingText: {
        fontSize: 16,
        color: colors.minimalist.textMedium,
        marginTop: spacing.md,
    },
    animalId: {
        fontSize: 12,
        color: colors.minimalist.coral,
        fontWeight: '600',
        marginBottom: 2,
    },
    embeddingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 6,
        backgroundColor: colors.minimalist.peachLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    embeddingText: {
        fontSize: 11,
        color: colors.minimalist.coral,
        fontWeight: '600',
    },
    statusRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 8,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusPillText: {
        fontSize: 11,
        fontWeight: '600',
    },
});
