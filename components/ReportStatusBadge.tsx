import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { ReportStatus } from '../types';

interface ReportStatusBadgeProps {
    status: ReportStatus;
    size?: 'small' | 'medium';
}

export const ReportStatusBadge: React.FC<ReportStatusBadgeProps> = ({
    status,
    size = 'medium',
}) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'new':
                return {
                    bg: '#E0F2FE',
                    text: '#0369A1',
                    label: 'New',
                    icon: 'alert-circle' as const,
                };
            case 'in_progress':
                return {
                    bg: '#FEF3C7',
                    text: '#D97706',
                    label: 'In Progress',
                    icon: 'time' as const,
                };
            case 'resolved':
                return {
                    bg: '#D1FAE5',
                    text: '#059669',
                    label: 'Resolved',
                    icon: 'checkmark-circle' as const,
                };
            default:
                return {
                    bg: colors.gray200,
                    text: colors.minimalist.textMedium,
                    label: 'Unknown',
                    icon: 'help-circle' as const,
                };
        }
    };

    const config = getStatusConfig();
    const isSmall = size === 'small';

    return (
        <View style={[
            styles.badge,
            { backgroundColor: config.bg },
            isSmall && styles.badgeSmall
        ]}>
            <Ionicons
                name={config.icon}
                size={isSmall ? 12 : 14}
                color={config.text}
                style={styles.icon}
            />
            <Text style={[
                styles.text,
                { color: config.text },
                isSmall && styles.textSmall
            ]}>
                {config.label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeSmall: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
    },
    icon: {
        marginRight: 4,
    },
    text: {
        fontSize: 13,
        fontWeight: '600',
    },
    textSmall: {
        fontSize: 11,
    },
});
