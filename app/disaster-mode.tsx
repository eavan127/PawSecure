import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { serifTextStyles } from '../theme/typography';
import { FloatingCard } from '../components/FloatingCard';
import { useData } from '../contexts/DataContext';

export default function DisasterModeScreen() {
    const router = useRouter();
    const {
        isDisasterModeActive,
        activeAlert,
        disasterResources,
        setDisasterMode,
        updateResources
    } = useData();

    const [showDisableModal, setShowDisableModal] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        // Default alert if none active (for demo)
        if (!activeAlert) {
            setDisasterMode(true, {
                title: 'Ipoh Flash Flood Emergency',
                description: 'Severe flash flooding in Ipoh city center due to heavy monsoon rainfall. Multiple animals spotted stranded in affected areas requiring immediate rescue. Flood waters rising in low-lying residential areas.',
                severity: 'Critical',
                status: 'Ongoing'
            });
        }
    }, []);

    const handleDisableAlert = () => {
        setDisasterMode(false);
        setShowDisableModal(false);
        router.back();
    };

    const getResourceColor = (value: number) => {
        if (value > 80) return colors.minimalist.errorRed;
        if (value > 50) return colors.minimalist.warningOrange;
        return colors.minimalist.successGreen;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.minimalist.white} />
                </Pressable>
                <Text style={styles.headerTitle}>Emergency Mode</Text>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {/* Active Alert Card */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <FloatingCard shadow="medium" style={styles.alertCard}>
                        <View style={styles.alertHeader}>
                            <Ionicons name="alert-circle" size={24} color={colors.minimalist.errorRed} />
                            <Text style={styles.alertTitle}>Active Alert: {activeAlert?.title}</Text>
                        </View>
                        <Text style={styles.alertDescription}>
                            {activeAlert?.description}
                        </Text>
                        <View style={styles.severityBadge}>
                            <Text style={styles.severityText}>{activeAlert?.severity?.toUpperCase()} LEVEL</Text>
                        </View>
                    </FloatingCard>
                </Animated.View>

                {/* NGO Action Center */}
                <Text style={styles.sectionTitle}>NGO Action Center</Text>
                <View style={styles.actionGrid}>
                    <Pressable
                        style={styles.actionCard}
                        onPress={() => router.push('/disaster-evacuation')}
                    >
                        <Ionicons name="bus-outline" size={32} color={colors.minimalist.coral} />
                        <Text style={styles.actionText}>Evacuation Protocol</Text>
                    </Pressable>

                    <Pressable
                        style={styles.actionCard}
                        onPress={() => router.push('/disaster-triage')}
                    >
                        <Ionicons name="medical-outline" size={32} color={colors.minimalist.coral} />
                        <Text style={styles.actionText}>Field Triage</Text>
                    </Pressable>

                    <Pressable
                        style={styles.actionCard}
                        onPress={() => router.push('/disaster-teams')}
                    >
                        <Ionicons name="people-outline" size={32} color={colors.minimalist.coral} />
                        <Text style={styles.actionText}>Assign Teams</Text>
                    </Pressable>

                    <Pressable
                        style={styles.actionCard}
                        onPress={() => router.push('/disaster-broadcast')}
                    >
                        <Ionicons name="radio-outline" size={32} color={colors.minimalist.coral} />
                        <Text style={styles.actionText}>Broadcasting</Text>
                    </Pressable>
                </View>

                {/* Resource Tracking */}
                <FloatingCard shadow="soft" style={styles.resourceCard}>
                    <Text style={styles.resourceTitle}>Resource Tracking</Text>

                    <View style={styles.resourceItem}>
                        <View style={styles.resourceHeader}>
                            <Text style={styles.resourceLabel}>Shelter Capacity</Text>
                            <Text style={styles.resourceValue}>{disasterResources.shelter}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${disasterResources.shelter}%`,
                                        backgroundColor: getResourceColor(disasterResources.shelter)
                                    }
                                ]}
                            />
                        </View>
                    </View>

                    <View style={styles.resourceItem}>
                        <View style={styles.resourceHeader}>
                            <Text style={styles.resourceLabel}>Food Supplies</Text>
                            <Text style={styles.resourceValue}>{disasterResources.food}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: `${disasterResources.food}%`,
                                        backgroundColor: getResourceColor(100 - disasterResources.food) // Inverted for supplies
                                    }
                                ]}
                            />
                        </View>
                    </View>
                </FloatingCard>
            </ScrollView>

            {/* Disable Button */}
            <View style={styles.footer}>
                <Pressable
                    onPress={() => setShowDisableModal(true)}
                    style={styles.disableButton}
                >
                    <Text style={styles.disableButtonText}>Disable Active Alert</Text>
                </Pressable>
            </View>

            {/* Confirmation Modal */}
            <Modal
                visible={showDisableModal}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Disable Emergency Mode?</Text>
                        <Text style={styles.modalDescription}>
                            This will notify all teams that the immediate threat has passed and return the system to normal operations.
                        </Text>
                        <View style={styles.modalButtons}>
                            <Pressable
                                onPress={() => setShowDisableModal(false)}
                                style={[styles.modalButton, styles.cancelButton]}
                            >
                                <Text style={styles.cancelButtonText}>Keep Active</Text>
                            </Pressable>
                            <Pressable
                                onPress={handleDisableAlert}
                                style={[styles.modalButton, styles.confirmButton]}
                            >
                                <Text style={styles.confirmButtonText}>Confirm Completion</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#111', // Dark focused background
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        paddingTop: spacing.md,
    },
    backButton: {
        marginRight: spacing.md,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.minimalist.white,
    },
    alertCard: {
        padding: spacing.xl,
        borderRadius: 20,
        backgroundColor: colors.minimalist.white,
        marginBottom: spacing.xl,
    },
    alertHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    alertTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.minimalist.textDark,
    },
    alertDescription: {
        fontSize: 15,
        color: colors.minimalist.textMedium,
        lineHeight: 22,
        marginBottom: spacing.lg,
    },
    severityBadge: {
        alignSelf: 'flex-start',
        borderWidth: 1.5,
        borderColor: colors.minimalist.errorRed,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: 6,
    },
    severityText: {
        color: colors.minimalist.errorRed,
        fontSize: 13,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.minimalist.white,
        marginBottom: spacing.lg,
        marginLeft: 4,
    },
    actionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    actionCard: {
        width: '47.5%',
        backgroundColor: colors.minimalist.white,
        borderRadius: 20,
        padding: spacing.xl,
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.md,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        textAlign: 'center',
    },
    resourceCard: {
        padding: spacing.xl,
        borderRadius: 24,
        backgroundColor: colors.minimalist.white,
        marginBottom: 100,
    },
    resourceTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        marginBottom: spacing.xl,
    },
    resourceItem: {
        marginBottom: spacing.xl,
    },
    resourceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    resourceLabel: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        fontWeight: '600',
    },
    resourceValue: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.minimalist.textDark,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: colors.minimalist.warmGray,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#111',
        padding: spacing.lg,
        paddingBottom: 40,
    },
    disableButton: {
        backgroundColor: colors.minimalist.errorRed,
        paddingVertical: spacing.lg,
        borderRadius: 12,
        alignItems: 'center',
    },
    disableButtonText: {
        color: colors.minimalist.white,
        fontSize: 18,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    modalContent: {
        backgroundColor: colors.minimalist.white,
        borderRadius: 24,
        padding: spacing.xl,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        marginBottom: spacing.md,
    },
    modalDescription: {
        fontSize: 15,
        color: colors.minimalist.textMedium,
        lineHeight: 22,
        marginBottom: spacing.xxl,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    modalButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: colors.minimalist.warmGray,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    confirmButton: {
        backgroundColor: colors.minimalist.errorRed,
    },
    confirmButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.minimalist.white,
    },
});
