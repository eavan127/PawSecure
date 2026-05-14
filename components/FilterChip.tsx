import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface FilterChipProps {
    label: string;
    selected?: boolean;
    onPress?: () => void;
    icon?: keyof typeof Ionicons.glyphMap;
    dropdown?: boolean;
    style?: ViewStyle;
}

export const FilterChip: React.FC<FilterChipProps> = ({
    label,
    selected = false,
    onPress,
    icon,
    dropdown = false,
    style,
}) => {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                { opacity: pressed ? 0.7 : 1 },
                style,
            ]}
            onPress={onPress}
        >
            {icon && (
                <Ionicons
                    name={icon}
                    size={16}
                    color={selected ? theme.colors.textDark : theme.colors.textPrimary}
                    style={styles.icon}
                />
            )}
            <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
            {dropdown && (
                <Ionicons
                    name="chevron-down"
                    size={16}
                    color={selected ? theme.colors.textDark : theme.colors.textPrimary}
                    style={styles.dropdownIcon}
                />
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.surfaceDark,
        marginRight: theme.spacing.sm,
    },
    chipSelected: {
        backgroundColor: theme.colors.primary,
    },
    icon: {
        marginRight: theme.spacing.xs,
    },
    text: {
        ...theme.textStyles.body,
        color: theme.colors.textPrimary,
        fontWeight: '500',
    },
    textSelected: {
        color: theme.colors.textDark,
    },
    dropdownIcon: {
        marginLeft: theme.spacing.xs,
    },
});
