import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { FloatingCard } from '../components/FloatingCard';

export default function DisasterEvacuationScreen() {
    const router = useRouter();

    const zones = [
        { id: '1', name: 'Northern Marina', status: 'Evacuating', animals: 12, priority: 'Critical' },
        { id: '2', name: 'West Orchard', status: 'Standby', animals: 5, priority: 'High' },
        { id: '3', name: 'Central Hub', status: 'Clear', animals: 0, priority: 'Safe' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.minimalist.white} />
                </Pressable>
                <Text style={styles.headerTitle}>Evacuation Protocol</Text>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Active Evacuation Zones</Text>

                {zones.map(zone => (
                    <FloatingCard key={zone.id} shadow="soft" style={styles.zoneCard}>
                        <View style={styles.zoneHeader}>
                            <View>
                                <Text style={styles.zoneName}>{zone.name}</Text>
                                <Text style={styles.zoneStatus}>{zone.status}</Text>
                            </View>
                            <View style={[styles.priorityBadge, { backgroundColor: zone.priority === 'Critical' ? colors.minimalist.errorRed : colors.minimalist.successGreen }]}>
                                <Text style={styles.priorityText}>{zone.priority}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.zoneFooter}>
                            <Text style={styles.animalCount}>{zone.animals} Animals for relocation</Text>
                            <Pressable style={styles.actionButton}>
                                <Text style={styles.actionButtonText}>View Layout</Text>
                            </Pressable>
                        </View>
                    </FloatingCard>
                ))}

                <Pressable style={styles.addTaskButton}>
                    <Ionicons name="add" size={24} color={colors.minimalist.white} />
                    <Text style={styles.addTaskText}>Add Evacuation Task</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#111',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
    },
    backButton: {
        marginRight: spacing.md,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.minimalist.white,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.white,
        marginBottom: spacing.lg,
    },
    zoneCard: {
        padding: spacing.lg,
        backgroundColor: colors.minimalist.white,
        marginBottom: spacing.md,
        borderRadius: 16,
    },
    zoneHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    zoneName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.minimalist.textDark,
    },
    zoneStatus: {
        fontSize: 13,
        color: colors.minimalist.errorRed,
        marginTop: 2,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    priorityText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '800',
    },
    divider: {
        height: 1,
        backgroundColor: colors.minimalist.warmGray,
        marginVertical: spacing.md,
    },
    zoneFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    animalCount: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
    },
    actionButton: {
        backgroundColor: colors.minimalist.coral,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    addTaskButton: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: spacing.lg,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.xl,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: 'rgba(255,255,255,0.3)',
    },
    addTaskText: {
        color: colors.minimalist.white,
        fontSize: 16,
        fontWeight: '600',
    },
});
