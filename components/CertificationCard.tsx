import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface CertificationCardProps {
    title: string;
    subtitle: string;
    signedBy: string;
}

export const CertificationCard: React.FC<CertificationCardProps> = ({
    title,
    subtitle,
    signedBy,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={32} color={theme.colors.greenPrimary} />
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
                <View style={styles.signature}>
                    <Ionicons name="pencil" size={14} color={theme.colors.textMuted} />
                    <Text style={styles.signedBy}>Signed by: {signedBy}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.card,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderGlass,
        gap: theme.spacing.md,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: `${theme.colors.greenPrimary}20`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        ...theme.textStyles.body,
        color: theme.colors.textPrimary,
        fontWeight: '600',
        fontSize: 15,
        marginBottom: 4,
    },
    subtitle: {
        ...theme.textStyles.caption,
        color: theme.colors.textSecondary,
        fontSize: 13,
        marginBottom: theme.spacing.sm,
    },
    signature: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    signedBy: {
        ...theme.textStyles.caption,
        color: theme.colors.textMuted,
        fontSize: 12,
        fontStyle: 'italic',
    },
});
