import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type StatusType = 'vaccinated' | 'neutered' | 'at-risk' | 'lost' | 'found' | 'rescued' | 'verified' | 'resolved' | 'pending' | 'atRisk';

interface StatusBadgeProps {
    status: StatusType;
    style?: ViewStyle;
}

const statusConfig: Record<StatusType, { label: string; color: string; icon?: keyof typeof Ionicons.glyphMap }> = {
    vaccinated: { label: 'Vaccinated', color: colors.minimalist.vaccinated, icon: 'shield-checkmark' },
    neutered: { label: 'Neutered', color: colors.minimalist.neutered, icon: 'checkmark-circle' },
    'at-risk': { label: 'At Risk', color: colors.minimalist.atRisk, icon: 'alert-circle' },
    atRisk: { label: 'At Risk', color: colors.minimalist.atRisk, icon: 'alert-circle' },
    lost: { label: 'Lost', color: colors.minimalist.lost, icon: 'location' },
    found: { label: 'Found', color: colors.minimalist.found, icon: 'checkmark-circle' },
    rescued: { label: 'Rescued', color: colors.minimalist.successGreen, icon: 'heart' },
    verified: { label: 'Verified', color: colors.minimalist.successGreen, icon: 'checkmark-circle' },
    resolved: { label: 'Resolved', color: colors.minimalist.greenDark, icon: 'checkmark-done' },
    pending: { label: 'Pending', color: colors.minimalist.orange, icon: 'time' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, style }) => {
    const config = statusConfig[status];

    // Safety check for undefined config
    if (!config) {
        return (
            <View style={[styles.badge, { backgroundColor: colors.gray200 }, style]}>
                <Text style={[styles.label, { color: colors.minimalist.textMedium }]}>{status}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.badge, { backgroundColor: `${config.color}20` }, style]}>
            {config.icon && (
                <Ionicons name={config.icon} size={14} color={config.color} />
            )}
            <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
    },
});
