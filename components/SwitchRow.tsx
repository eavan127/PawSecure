import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { theme } from '../theme';

interface SwitchRowProps {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
}

export const SwitchRow: React.FC<SwitchRowProps> = ({
    title,
    description,
    value,
    onValueChange,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{
                    false: theme.colors.borderGlass,
                    true: theme.colors.greenPrimary,
                }}
                thumbColor="#ffffff"
                ios_backgroundColor={theme.colors.borderGlass}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.card,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderGlass,
        marginBottom: theme.spacing.md,
    },
    textContainer: {
        flex: 1,
        marginRight: theme.spacing.md,
    },
    title: {
        ...theme.textStyles.body,
        color: theme.colors.textPrimary,
        fontWeight: '600',
        fontSize: 15,
        marginBottom: 4,
    },
    description: {
        ...theme.textStyles.caption,
        color: theme.colors.textMuted,
        fontSize: 12,
        lineHeight: 16,
    },
});
