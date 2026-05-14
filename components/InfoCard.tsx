import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

interface InfoCardProps {
    label: string;
    value: string;
    subtitle?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ label, value, subtitle }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{value}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surfaceDark,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    label: {
        ...theme.textStyles.caption,
        color: theme.colors.textSecondary,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    value: {
        ...theme.textStyles.bodyLarge,
        color: theme.colors.textPrimary,
        fontWeight: '600',
    },
    subtitle: {
        ...theme.textStyles.caption,
        color: theme.colors.primary,
        marginTop: 2,
    },
});
