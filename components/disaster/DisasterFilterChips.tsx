import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { FilterOption, SortOption } from '../../types/disaster';

interface DisasterFilterChipsProps {
    activeFilter: FilterOption;
    activeSort: SortOption;
    onFilterChange: (filter: FilterOption) => void;
    onSortChange: (sort: SortOption) => void;
}

const FILTER_OPTIONS: { key: FilterOption; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'cats', label: 'Cats' },
    { key: 'dogs', label: 'Dogs' },
    { key: 'critical', label: 'Critical' },
];

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
    { key: 'latest', label: 'Latest' },
    { key: 'mostCritical', label: 'Most Critical' },
    { key: 'nearest', label: 'Nearest' },
];

export const DisasterFilterChips: React.FC<DisasterFilterChipsProps> = ({
    activeFilter,
    activeSort,
    onFilterChange,
    onSortChange,
}) => {
    const [showSortMenu, setShowSortMenu] = useState(false);

    const currentSortLabel = SORT_OPTIONS.find(s => s.key === activeSort)?.label || 'Sort';

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {FILTER_OPTIONS.map((option) => {
                    const isActive = option.key === activeFilter;
                    return (
                        <Pressable
                            key={option.key}
                            style={[styles.chip, isActive && styles.chipActive]}
                            onPress={() => onFilterChange(option.key)}
                        >
                            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                                {option.label}
                            </Text>
                        </Pressable>
                    );
                })}

                <View style={styles.divider} />

                <Pressable
                    style={styles.sortButton}
                    onPress={() => setShowSortMenu(!showSortMenu)}
                >
                    <Ionicons
                        name="swap-vertical"
                        size={16}
                        color={colors.minimalist.textMedium}
                    />
                    <Text style={styles.sortText}>{currentSortLabel}</Text>
                    <Ionicons
                        name={showSortMenu ? 'chevron-up' : 'chevron-down'}
                        size={14}
                        color={colors.minimalist.textMedium}
                    />
                </Pressable>
            </ScrollView>

            {showSortMenu && (
                <View style={styles.sortMenu}>
                    {SORT_OPTIONS.map((option) => {
                        const isActive = option.key === activeSort;
                        return (
                            <Pressable
                                key={option.key}
                                style={[styles.sortOption, isActive && styles.sortOptionActive]}
                                onPress={() => {
                                    onSortChange(option.key);
                                    setShowSortMenu(false);
                                }}
                            >
                                <Text style={[
                                    styles.sortOptionText,
                                    isActive && styles.sortOptionTextActive
                                ]}>
                                    {option.label}
                                </Text>
                                {isActive && (
                                    <Ionicons
                                        name="checkmark"
                                        size={16}
                                        color={colors.minimalist.disasterOrange}
                                    />
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.minimalist.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.minimalist.border,
        paddingVertical: spacing.sm,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
        alignItems: 'center',
    },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.minimalist.bgLight,
    },
    chipActive: {
        backgroundColor: colors.minimalist.disasterOrangeLight,
    },
    chipText: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.minimalist.textMedium,
    },
    chipTextActive: {
        color: colors.minimalist.disasterOrange,
        fontWeight: '600',
    },
    divider: {
        width: 1,
        height: 24,
        backgroundColor: colors.minimalist.border,
        marginHorizontal: spacing.xs,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.minimalist.bgLight,
    },
    sortText: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.minimalist.textMedium,
    },
    sortMenu: {
        position: 'absolute',
        top: '100%',
        right: spacing.lg,
        backgroundColor: colors.minimalist.white,
        borderRadius: 12,
        padding: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 100,
        minWidth: 150,
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 8,
    },
    sortOptionActive: {
        backgroundColor: colors.minimalist.disasterOrangeLight,
    },
    sortOptionText: {
        fontSize: 14,
        color: colors.minimalist.textDark,
    },
    sortOptionTextActive: {
        color: colors.minimalist.disasterOrange,
        fontWeight: '600',
    },
});
