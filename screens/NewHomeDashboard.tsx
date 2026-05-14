import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { serifTextStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { FloatingCard } from '../components/FloatingCard';
import { SearchBar } from '../components/SearchBar';
import { FilterChip } from '../components/FilterChip';

export const NewHomeDashboard: React.FC = () => {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');

    const filters = ['All', 'Dogs', 'Cats', 'Injured', 'At Risk'];

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Greeting Header */}
                <Text style={styles.greeting}>Hello, Alex</Text>

                {/* Search Bar */}
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search for pets, tips, or alerts..."
                />

                {/* Status Cards */}
                <View style={styles.statusRow}>
                    <FloatingCard style={styles.statusCard} shadow="soft">
                        <View style={styles.statusIndicator}>
                            <View style={[styles.dot, { backgroundColor: colors.minimalist.greenDark }]} />
                        </View>
                        <Text style={styles.statusTitle}>Normal Day Mode</Text>
                        <Text style={styles.statusDescription}>All systems monitoring.</Text>
                    </FloatingCard>

                    <FloatingCard style={styles.statusCard} shadow="soft">
                        <View style={styles.statusIndicator}>
                            <View style={[styles.dot, { backgroundColor: colors.gray400 }]} />
                        </View>
                        <Text style={styles.statusTitle}>Disaster Alert Mode</Text>
                        <Text style={styles.statusDescription}>Inactive. No immediate threats.</Text>
                    </FloatingCard>
                </View>

                {/* Category Filter */}
                <Text style={styles.sectionLabel}>Category filter</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScrollView}
                    contentContainerStyle={styles.filterContainer}
                >
                    {filters.map((filter) => (
                        <FilterChip
                            key={filter}
                            label={filter}
                            selected={selectedFilter === filter}
                            onPress={() => setSelectedFilter(filter)}
                        />
                    ))}
                </ScrollView>

                {/* Quick Access Cards */}
                <View style={styles.quickAccessRow}>
                    <Pressable
                        style={styles.quickAccessCard}
                        onPress={() => router.push('/Community')}
                    >
                        <FloatingCard style={styles.quickCardInner} shadow="medium">
                            <Ionicons name="people" size={32} color={colors.minimalist.coral} />
                            <Text style={styles.quickCardTitle}>Community</Text>
                            <Text style={styles.quickCardDescription}>
                                Connect with local pet owners and shelters.
                            </Text>
                        </FloatingCard>
                    </Pressable>

                    <Pressable
                        style={styles.quickAccessCard}
                        onPress={() => router.push({
                            pathname: '/ReportSighting',
                            params: { type: 'lost' }
                        })}
                    >
                        <FloatingCard style={styles.quickCardInner} shadow="medium">
                            <Ionicons name="megaphone" size={32} color={colors.minimalist.orange} />
                            <Text style={styles.quickCardTitle}>Report Lost Pet</Text>
                            <Text style={styles.quickCardDescription}>
                                Post a lost alert for your missing pet.
                            </Text>
                        </FloatingCard>
                    </Pressable>
                </View>

                {/* Footer Spacing */}
                <View style={styles.footer} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.minimalist.bgLight,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
    },
    greeting: {
        ...serifTextStyles.serifHeading,
        color: colors.minimalist.textDark,
        marginBottom: spacing.lg,
    },
    statusRow: {
        flexDirection: 'row',
        marginTop: spacing.xl,
        marginBottom: spacing.xl,
        gap: spacing.md,
    },
    statusCard: {
        flex: 1,
        padding: spacing.lg,
    },
    statusIndicator: {
        marginBottom: spacing.sm,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: 4,
    },
    statusDescription: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    filterScrollView: {
        marginBottom: spacing.xl,
    },
    filterContainer: {
        paddingRight: spacing.xl,
    },
    quickAccessRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    quickAccessCard: {
        flex: 1,
    },
    quickCardInner: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    quickCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginTop: spacing.sm,
        marginBottom: 4,
    },
    quickCardDescription: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
        textAlign: 'center',
        lineHeight: 18,
    },
    footer: {
        height: spacing.xxl,
    },
});
