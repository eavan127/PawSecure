import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActionCard } from '../../components/ActionCard';
import { FloatingCard } from '../../components/FloatingCard';
import { Popup } from '../../components/Popup';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuth } from '../../contexts/AuthContext';
import { NGOReportListScreen } from '../../screens/NGOReportListScreen';

export default function ReportScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    // If user is NGO, show the NGO Report Management screen
    if (user?.role === 'ngo') {
        return <NGOReportListScreen />;
    }

    const handleCreateReport = () => {
        // Navigate to AI Camera screen for photo capture and analysis
        router.push('/AIReportCamera');
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Report</Text>
                    <Text style={styles.subtitle}>Help protect animals in your area</Text>
                </View>

                {/* Main Actions */}
                <View style={styles.actionsGrid}>
                    <Pressable style={styles.largeAction} onPress={handleCreateReport}>
                        {({ pressed }) => (
                            <FloatingCard shadow="medium" style={[styles.largeCard, pressed && styles.cardPressed]}>
                                <Ionicons name="camera" size={56} color={colors.minimalist.coral} />
                                <Text style={styles.largeCardTitle}>Create New Report</Text>
                                <Text style={styles.largeCardDescription}>
                                    Use your camera to report an animal in need
                                </Text>
                            </FloatingCard>
                        )}
                    </Pressable>

                    <Pressable style={styles.largeAction} onPress={() => router.push('/report-history')}>
                        {({ pressed }) => (
                            <FloatingCard shadow="medium" style={[styles.largeCard, pressed && styles.cardPressed]}>
                                <Ionicons name="list" size={56} color={colors.minimalist.mutedOrange} />
                                <Text style={styles.largeCardTitle}>View Report History</Text>
                                <Text style={styles.largeCardDescription}>
                                    Check the status of your submitted reports
                                </Text>
                            </FloatingCard>
                        )}
                    </Pressable>
                </View>

                {/* Information Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Reporting Guidelines</Text>

                    <FloatingCard shadow="soft" style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="camera" size={20} color={colors.minimalist.coral} />
                            </View>
                            <View style={styles.infoText}>
                                <Text style={styles.infoTitle}>Take Clear Photos</Text>
                                <Text style={styles.infoDescription}>
                                    Capture the animal and surroundings clearly
                                </Text>
                            </View>
                        </View>
                    </FloatingCard>

                    <FloatingCard shadow="soft" style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="location" size={20} color={colors.minimalist.mutedOrange} />
                            </View>
                            <View style={styles.infoText}>
                                <Text style={styles.infoTitle}>Enable Location</Text>
                                <Text style={styles.infoDescription}>
                                    Location helps responders find the animal quickly
                                </Text>
                            </View>
                        </View>
                    </FloatingCard>

                    <FloatingCard shadow="soft" style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="information-circle" size={20} color={colors.minimalist.successGreen} />
                            </View>
                            <View style={styles.infoText}>
                                <Text style={styles.infoTitle}>Provide Details</Text>
                                <Text style={styles.infoDescription}>
                                    Include any visible injuries or behavior
                                </Text>
                            </View>
                        </View>
                    </FloatingCard>
                </View>

                {/* Recent Reports */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Reports</Text>

                    <FloatingCard shadow="soft" style={styles.reportCard}>
                        <View style={styles.reportHeader}>
                            <Text style={styles.reportTitle}>Injured Dog - Marina Bay</Text>
                            <View style={[styles.statusBadge, styles.statusSubmitted]}>
                                <Text style={styles.statusText}>Submitted</Text>
                            </View>
                        </View>
                        <Text style={styles.reportTime}>Today at 2:30 PM</Text>
                    </FloatingCard>

                    <FloatingCard shadow="soft" style={styles.reportCard}>
                        <View style={styles.reportHeader}>
                            <Text style={styles.reportTitle}>Lost Cat - Orchard Road</Text>
                            <View style={[styles.statusBadge, styles.statusVerified]}>
                                <Text style={styles.statusText}>Verified</Text>
                            </View>
                        </View>
                        <Text style={styles.reportTime}>Yesterday at 10:15 AM</Text>
                    </FloatingCard>
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Success Popup */}
            <Popup
                visible={showSuccessPopup}
                title="Report Submitted Successfully"
                message="Thank you for helping animals. We'll notify local responders immediately."
                icon="checkmark-circle"
                iconColor={colors.minimalist.successGreen}
                onClose={() => setShowSuccessPopup(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.minimalist.bgLight,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.xl,
    },
    header: {
        marginBottom: spacing.xl,
    },
    title: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 28,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: colors.minimalist.textMedium,
    },
    actionsGrid: {
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    largeAction: {
        width: '100%',
    },
    largeCard: {
        padding: spacing.xl,
        alignItems: 'center',
        minHeight: 180,
        justifyContent: 'center',
    },
    cardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    largeCardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    largeCardDescription: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        textAlign: 'center',
        lineHeight: 20,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontFamily: 'PlayfairDisplay_600SemiBold',
        fontSize: 20,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: spacing.md,
    },
    infoCard: {
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.minimalist.warmGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: 4,
    },
    infoDescription: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
        lineHeight: 18,
    },
    reportCard: {
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    reportHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    reportTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusSubmitted: {
        backgroundColor: `${colors.minimalist.warningOrange}20`,
    },
    statusVerified: {
        backgroundColor: `${colors.minimalist.successGreen}20`,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    reportTime: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
    },
    bottomSpacing: {
        height: spacing.xxl,
    },
});
