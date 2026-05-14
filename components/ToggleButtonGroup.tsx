import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface ToggleOption {
    label: string;
    value: string;
    icon?: keyof typeof Ionicons.glyphMap;
}

interface ToggleButtonGroupProps {
    options: ToggleOption[];
    selectedValue: string;
    onSelect: (value: string) => void;
    multiSelect?: boolean;
    selectedValues?: string[];
    onMultiSelect?: (values: string[]) => void;
    style?: ViewStyle;
}

export const ToggleButtonGroup: React.FC<ToggleButtonGroupProps> = ({
    options,
    selectedValue,
    onSelect,
    multiSelect = false,
    selectedValues = [],
    onMultiSelect,
    style,
}) => {
    const handlePress = (value: string) => {
        if (multiSelect && onMultiSelect) {
            if (selectedValues.includes(value)) {
                onMultiSelect(selectedValues.filter(v => v !== value));
            } else {
                onMultiSelect([...selectedValues, value]);
            }
        } else {
            onSelect(value);
        }
    };

    const isSelected = (value: string) => {
        if (multiSelect) {
            return selectedValues.includes(value);
        }
        return selectedValue === value;
    };

    return (
        <View style={[styles.container, style]}>
            {options.map((option, index) => (
                <Pressable
                    key={option.value}
                    style={({ pressed }) => [
                        styles.button,
                        isSelected(option.value) && styles.buttonSelected,
                        { opacity: pressed ? 0.8 : 1 },
                        index < options.length - 1 && styles.buttonMargin,
                    ]}
                    onPress={() => handlePress(option.value)}
                >
                    {option.icon && (
                        <Ionicons
                            name={option.icon}
                            size={16}
                            color={isSelected(option.value) ? theme.colors.textPrimary : theme.colors.textSecondary}
                            style={styles.icon}
                        />
                    )}
                    <Text style={[
                        styles.text,
                        isSelected(option.value) && styles.textSelected,
                    ]}>
                        {option.label}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.full,
        borderWidth: 1.5,
        borderColor: theme.colors.borderGlass,
        backgroundColor: 'transparent',
    },
    buttonSelected: {
        backgroundColor: theme.colors.greenPrimary,
        borderColor: theme.colors.greenPrimary,
    },
    buttonMargin: {
        marginRight: theme.spacing.sm,
    },
    icon: {
        marginRight: theme.spacing.xs,
    },
    text: {
        ...theme.textStyles.body,
        color: theme.colors.textSecondary,
        fontWeight: '500',
        fontSize: 13,
    },
    textSelected: {
        color: theme.colors.textPrimary,
        fontWeight: '600',
    },
});
