import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface StatCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: number;
    positive?: boolean;
    iconBackgroundColor?: string;
    iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    icon,
    label,
    value,
    positive = true,
}) => {
    return (
        <View style={[styles.container, theme.glassEffect]}>
            <LinearGradient
                colors={positive ? [theme.colors.peach, theme.colors.coral] : [theme.colors.danger, theme.colors.sunset]}
                start={theme.gradientPositions.diagonal.start}
                end={theme.gradientPositions.diagonal.end}
                style={styles.iconContainer}
            >
                <Ionicons name={icon} size={20} color={theme.colors.textPrimary} />
            </LinearGradient>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.value, { color: positive ? theme.colors.lightTeal : theme.colors.danger }]}>
                {value.toLocaleString()}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: theme.borderRadius.card,
        padding: theme.spacing.md,
        alignItems: 'flex-start',
        ...theme.shadows.base,
        flex: 1,
        minHeight: 110,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: theme.radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    label: {
        ...theme.textStyles.caption,
        color: theme.colors.textMuted,
        marginBottom: theme.spacing.xxs,
        textTransform: 'uppercase',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.0,
    },
    value: {
        ...theme.textStyles.h2,
        fontWeight: 'bold',
        fontSize: 24,
    },
});
