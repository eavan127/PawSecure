/**
 * Rescued Tab — Archive & Analytics Dashboard
 *
 * Shows a permanent record of all animals this organisation has rescued.
 * Includes:
 *  - Total rescued count
 *  - Breakdown by species (dog / cat)
 *  - Breakdown by injury severity
 *  - Monthly rescue trend chart
 *  - Searchable list of individual rescued animals
 *
 * Data source: Supabase `rescued_animals` table filtered by org_id
 * This data is PERMANENT — animals are never deleted from here.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function RescuedTab() {
    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.heading}>Rescue Archive</Text>
                <Text style={styles.sub}>
                    Permanent record of every animal your organisation has rescued.
                </Text>

                {/* Placeholder — analytics dashboard goes here */}
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>
                        Analytics dashboard coming soon.{'\n'}
                        Connect Supabase to load your rescue data.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.minimalist.bgLight },
    container: { padding: spacing.xl },
    heading: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        marginBottom: spacing.xs,
    },
    sub: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        marginBottom: spacing.xl,
    },
    placeholder: {
        backgroundColor: colors.minimalist.white,
        borderRadius: 12,
        padding: spacing.xl,
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        textAlign: 'center',
        lineHeight: 22,
    },
});
