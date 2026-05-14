import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ActionCard } from '../../components/ActionCard';
import { FloatingCard } from '../../components/FloatingCard';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { NGOHomeScreen } from '../../screens/NGOHomeScreen';

export default function HomeScreen() {
    const router = useRouter();
    const { user } = useAuth();

    // If user is NGO, show the NGO Home Screen
    if (user?.role === 'ngo') {
        return <NGOHomeScreen />;
    }

    const firstName = user?.name ? user.name.split(' ')[0] : 'there';

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Greeting Header */}
                <View style={styles.header}>
                    <Text style={styles.greeting}>Hello, {firstName}</Text>
                    <Text style={styles.welcomeText}>How can we help animals today?</Text>
                </View>

                {/* Disaster Alert Card (conditional) */}
                <FloatingCard shadow="medium" style={styles.alertCard}>
                    <View style={[styles.statusDot, { backgroundColor: colors.minimalist.successGreen }]} />
                    <View style={styles.alertContent}>
                        <Text style={styles.alertTitle}>Normal Day Mode</Text>
                        <Text style={styles.alertText}>All systems monitoring. No immediate threats detected.</Text>
                    </View>
                </FloatingCard>

                {/* Action Cards Grid */}
                <View style={styles.actionsGrid}>
                    <ActionCard
                        icon="camera"
                        title="Report Animal"
                        description="Report a lost, injured, or at-risk animal"
                        iconColor={colors.minimalist.coral}
                        onPress={() => router.push('/(tabs)/report')}
                    />

                    <ActionCard
                        icon="people"
                        title="Community"
                        description="Connect with local helpers and shelters"
                        iconColor={colors.minimalist.mutedOrange}
                        onPress={() => router.push('/(tabs)/community')}
                    />
                </View>

                <View style={styles.actionsGrid}>
                    <ActionCard
                        icon="heart"
                        title="Adopt"
                        description="Browse adoptable pets near you"
                        iconColor={colors.minimalist.softRed}
                        onPress={() => router.push('/(tabs)/community')}
                    />

                    <ActionCard
                        icon="alert-circle"
                        title="Disaster Mode"
                        description="Emergency rescue coordination"
                        iconColor={colors.minimalist.warningOrange}
                        onPress={() => router.push('/disaster-mode')}
                    />
                </View>

                {/* Recent Activity Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>

                    <FloatingCard shadow="soft" style={styles.activityCard}>
                        <View style={styles.activityRow}>
                            <View style={styles.activityIcon}>
                                <Text style={styles.activityEmoji}>🐕</Text>
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityTitle}>Lost Dog Reported</Text>
                                <Text style={styles.activityTime}>2 hours ago • Marina Bay</Text>
                            </View>
                        </View>
                    </FloatingCard>

                    <FloatingCard shadow="soft" style={styles.activityCard}>
                        <View style={styles.activityRow}>
                            <View style={styles.activityIcon}>
                                <Text style={styles.activityEmoji}>😺</Text>
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityTitle}>Cat Found Safe</Text>
                                <Text style={styles.activityTime}>5 hours ago • Orchard Road</Text>
                            </View>
                        </View>
                    </FloatingCard>
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
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
    greeting: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 28,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        marginBottom: spacing.xs,
    },
    welcomeText: {
        fontSize: 16,
        color: colors.minimalist.textMedium,
    },
    alertCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        marginBottom: spacing.xl,
    },
    statusDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: spacing.md,
    },
    alertContent: {
        flex: 1,
    },
    alertTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: 4,
    },
    alertText: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
        lineHeight: 18,
    },
    actionsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    section: {
        marginTop: spacing.lg,
    },
    sectionTitle: {
        fontFamily: 'PlayfairDisplay_600SemiBold',
        fontSize: 20,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: spacing.md,
    },
    activityCard: {
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    activityIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.minimalist.warmGray,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    activityEmoji: {
        fontSize: 24,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
    },
    bottomSpacing: {
        height: spacing.xxl,
    },
});
