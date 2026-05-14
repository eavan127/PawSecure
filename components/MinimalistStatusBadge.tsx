import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type MinimalistBadgeVariant = 'vaccinated' | 'neutered' | 'atRisk' | 'lost' | 'found' | 'verified';

interface MinimalistStatusBadgeProps {
    label: string;
    variant: MinimalistBadgeVariant;
    icon?: keyof typeof Ionicons.glyphMap;
}

export const MinimalistStatusBadge: React.FC<MinimalistStatusBadgeProps> = ({
    label,
    variant,
    icon,
}) => {
    const getColors = () => {
        switch (variant) {
            case 'vaccinated':
                return {
                    bg: colors.minimalist.green,
                    text: colors.minimalist.textDark,
                };
            case 'neutered':
                return {
                    bg: colors.minimalist.blue,
                    text: colors.minimalist.textDark,
                };
            case 'atRisk':
                return {
                    bg: colors.minimalist.orange,
                    text: colors.minimalist.white,
                };
            case 'lost':
                return {
                    bg: colors.minimalist.coral,
                    text: colors.minimalist.white,
                };
            case 'found':
                return {
                    bg: colors.minimalist.greenDark,
                    text: colors.minimalist.white,
                };
            case 'verified':
                return {
                    bg: colors.minimalist.peachLight,
                    text: colors.minimalist.textDark,
                };
            default:
                return {
                    bg: colors.minimalist.bgLight,
                    text: colors.minimalist.textMedium,
                };
        }
    };

    const badgeColors = getColors();

    return (
        <View style={[styles.badge, { backgroundColor: badgeColors.bg }]}>
            {icon && (
                <Ionicons name={icon} size={14} color={badgeColors.text} style={styles.icon} />
            )}
            <Text style={[styles.text, { color: badgeColors.text }]}>{label}</Text>
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
        marginRight: spacing.xs,
    },
    icon: {
        marginRight: 4,
    },
    text: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
    },
});
