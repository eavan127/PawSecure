import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { DisasterLocation } from '../../types/disaster';

interface DisasterLocationTabsProps {
    locations: DisasterLocation[];
    activeLocationId: string;
    onLocationChange: (locationId: string) => void;
}

export const DisasterLocationTabs: React.FC<DisasterLocationTabsProps> = ({
    locations,
    activeLocationId,
    onLocationChange,
}) => {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {locations.map((location) => {
                    const isActive = location.id === activeLocationId;
                    return (
                        <Pressable
                            key={location.id}
                            style={[styles.tab, isActive && styles.activeTab]}
                            onPress={() => onLocationChange(location.id)}
                        >
                            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                                {location.name}
                            </Text>
                            {location.isActive && (
                                <View style={styles.activeDot} />
                            )}
                            {isActive && <View style={styles.underline} />}
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.minimalist.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.minimalist.border,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        gap: spacing.lg,
    },
    tab: {
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    activeTab: {},
    tabText: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.minimalist.textMedium,
    },
    activeTabText: {
        color: colors.minimalist.textDark,
        fontWeight: '600',
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.minimalist.disasterRed,
    },
    underline: {
        position: 'absolute',
        bottom: 0,
        left: spacing.sm,
        right: spacing.sm,
        height: 3,
        backgroundColor: colors.minimalist.disasterOrange,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
    },
});
