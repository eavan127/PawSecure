import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { FloatingCard } from '../components/FloatingCard';

export default function DisasterTeamsScreen() {
    const router = useRouter();

    const teams = [
        { id: '1', name: 'Alpha Team', status: 'On Route', location: 'Marina Bay', count: 4 },
        { id: '2', name: 'Bravo Team', status: 'At Base', location: 'Main Shelter', count: 6 },
        { id: '3', name: 'Volunteer Group A', status: 'Deploying', location: 'East Coast', count: 12 },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.minimalist.white} />
                </Pressable>
                <Text style={styles.headerTitle}>Assign Teams</Text>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Live Team Deployment</Text>

                {teams.map(team => (
                    <FloatingCard key={team.id} shadow="soft" style={styles.teamCard}>
                        <View style={styles.teamHeader}>
                            <View>
                                <Text style={styles.teamName}>{team.name}</Text>
                                <Text style={styles.teamCount}>{team.count} Staff/Volunteers</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: team.status === 'On Route' ? colors.minimalist.warningOrange : team.status === 'At Base' ? colors.minimalist.successGreen : colors.minimalist.infoBlue }]}>
                                <Text style={styles.statusText}>{team.status}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.locationRow}>
                            <Ionicons name="location" size={16} color={colors.minimalist.textLight} />
                            <Text style={styles.locationText}>{team.location}</Text>
                        </View>
                        <Pressable style={styles.assignButton}>
                            <Text style={styles.assignButtonText}>Assign New Task</Text>
                        </Pressable>
                    </FloatingCard>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#111' },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
    backButton: { marginRight: spacing.md },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.minimalist.white },
    container: { flex: 1 },
    scrollContent: { padding: spacing.lg },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.minimalist.white, marginBottom: spacing.lg },
    teamCard: { padding: spacing.lg, backgroundColor: colors.minimalist.white, marginBottom: spacing.md, borderRadius: 16 },
    teamHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    teamName: { fontSize: 16, fontWeight: '700', color: colors.minimalist.textDark },
    teamCount: { fontSize: 12, color: colors.minimalist.textMedium },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { color: 'white', fontSize: 10, fontWeight: '800' },
    divider: { height: 1, backgroundColor: colors.minimalist.warmGray, marginVertical: spacing.md },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.lg },
    locationText: { fontSize: 13, color: colors.minimalist.textMedium },
    assignButton: { backgroundColor: colors.minimalist.textDark, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    assignButtonText: { color: 'white', fontSize: 13, fontWeight: '600' },
});
