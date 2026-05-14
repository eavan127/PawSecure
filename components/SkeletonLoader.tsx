import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '../theme';

export const SkeletonLoader: React.FC<{ variant?: 'card' | 'stat' | 'list' }> = ({
    variant = 'card',
}) => {
    if (variant === 'stat') {
        return (
            <View style={styles.statContainer}>
                <View style={[styles.skeleton, styles.iconSkeleton]} />
                <View style={[styles.skeleton, styles.textSkeleton, { width: '60%' }]} />
                <View style={[styles.skeleton, styles.textSkeleton, { width: '40%', height: 32 }]} />
            </View>
        );
    }

    if (variant === 'list') {
        return (
            <View style={styles.listContainer}>
                <View style={[styles.skeleton, styles.circleIcon]} />
                <View style={{ flex: 1 }}>
                    <View style={[styles.skeleton, styles.textSkeleton, { width: '70%' }]} />
                    <View style={[styles.skeleton, styles.textSkeleton, { width: '90%', marginTop: 8 }]} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.cardContainer}>
            <View style={[styles.skeleton, styles.imageSkeleton]} />
            <View style={[styles.skeleton, styles.textSkeleton]} />
            <View style={[styles.skeleton, styles.textSkeleton, { width: '70%' }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: theme.colors.gray300,
        borderRadius: theme.radius.sm,
    },
    statContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.card,
        padding: theme.spacing.lg,
        ...theme.shadows.base,
        flex: 1,
    },
    cardContainer: {
        backgroundColor: theme.colors.surfaceDark,
        borderRadius: theme.borderRadius.card,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
    },
    listContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        gap: theme.spacing.md,
    },
    iconSkeleton: {
        width: 48,
        height: 48,
        borderRadius: theme.radius.lg,
        marginBottom: theme.spacing.md,
    },
    circleIcon: {
        width: 48,
        height: 48,
        borderRadius: theme.radius.full,
    },
    imageSkeleton: {
        width: '100%',
        height: 100,
        marginBottom: theme.spacing.md,
    },
    textSkeleton: {
        width: '100%',
        height: 16,
        marginBottom: theme.spacing.xs,
    },
});
