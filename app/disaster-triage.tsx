import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { FloatingCard } from '../components/FloatingCard';

export default function DisasterTriageScreen() {
    const router = useRouter();

    const cases = [
        { id: '1', name: 'Stray Golden', location: 'Marina Bay', severity: 'Critical', issue: 'Trapped in rising water' },
        { id: '2', name: 'Cat (Tabby)', location: 'Orchard Rd', severity: 'High', issue: 'Possible fracture' },
        { id: '3', name: 'Pack of 3', location: 'East Coast', severity: 'Medium', issue: 'Needs relocation' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.minimalist.white} />
                </Pressable>
                <Text style={styles.headerTitle}>Field Triage</Text>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Prioritized Rescue Cases</Text>

                {cases.map(item => (
                    <FloatingCard key={item.id} shadow="soft" style={styles.caseCard}>
                        <View style={styles.caseHeader}>
                            <View style={styles.info}>
                                <Text style={styles.caseName}>{item.name}</Text>
                                <Text style={styles.caseLocation}>{item.location}</Text>
                            </View>
                            <View style={[styles.severityBadge, { backgroundColor: item.severity === 'Critical' ? colors.minimalist.errorRed : colors.minimalist.warningOrange }]}>
                                <Text style={styles.severityText}>{item.severity}</Text>
                            </View>
                        </View>
                        <Text style={styles.issueText}>{item.issue}</Text>
                        <View style={styles.actions}>
                            <Pressable style={styles.primaryAction}>
                                <Text style={styles.primaryActionText}>Dispatch Team</Text>
                            </Pressable>
                            <Pressable style={styles.secondaryAction}>
                                <Text style={styles.secondaryActionText}>Update Status</Text>
                            </Pressable>
                        </View>
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
    caseCard: { padding: spacing.lg, backgroundColor: colors.minimalist.white, marginBottom: spacing.md, borderRadius: 16 },
    caseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
    info: { flex: 1 },
    caseName: { fontSize: 16, fontWeight: '700', color: colors.minimalist.textDark },
    caseLocation: { fontSize: 12, color: colors.minimalist.textLight },
    severityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    severityText: { color: 'white', fontSize: 10, fontWeight: '800' },
    issueText: { fontSize: 14, color: colors.minimalist.textMedium, marginBottom: spacing.lg },
    actions: { flexDirection: 'row', gap: spacing.sm },
    primaryAction: { flex: 1, backgroundColor: colors.minimalist.errorRed, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    primaryActionText: { color: 'white', fontSize: 13, fontWeight: '700' },
    secondaryAction: { flex: 1, backgroundColor: colors.minimalist.warmGray, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    secondaryActionText: { color: colors.minimalist.textDark, fontSize: 13, fontWeight: '600' },
});
