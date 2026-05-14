import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface CustomInputProps extends TextInputProps {
    label: string;
    icon?: keyof typeof Ionicons.glyphMap;
    error?: string;
    variant?: 'glass' | 'minimalist';
}

export const CustomInput: React.FC<CustomInputProps> = ({
    label,
    icon,
    error,
    secureTextEntry,
    variant = 'glass',
    ...props
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = secureTextEntry;

    const isMinimalist = variant === 'minimalist';

    return (
        <View style={styles.container}>
            <Text style={[styles.label, isMinimalist && styles.labelMinimalist]}>{label}</Text>
            <View style={[
                styles.inputContainer,
                isMinimalist ? styles.inputContainerMinimalist : theme.glassEffect,
                isFocused && (isMinimalist ? styles.inputContainerFocusedMinimalist : styles.inputContainerFocused),
                error && styles.inputContainerError,
            ]}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={isFocused ? theme.colors.textAccent : theme.colors.textMuted}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={[styles.input, isMinimalist && styles.inputMinimalist]}
                    placeholderTextColor={isMinimalist ? theme.colors.minimalist.textLight : theme.colors.textMuted}
                    secureTextEntry={isPassword && !isPasswordVisible}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />
                {isPassword && (
                    <Pressable
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.eyeIcon}
                    >
                        <Ionicons
                            name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
                            size={20}
                            color={theme.colors.textMuted}
                        />
                    </Pressable>
                )}
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        ...theme.textStyles.label,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
        textTransform: 'uppercase',
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 1,
    },
    labelMinimalist: {
        fontSize: 12,
        color: theme.colors.minimalist.textMedium,
        letterSpacing: 0.5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: theme.borderRadius.input,
        paddingHorizontal: theme.spacing.md,
        height: 44,
        borderWidth: 1,
        borderColor: theme.colors.borderGlass,
    },
    inputContainerFocused: {
        borderColor: theme.colors.borderGradient,
        borderWidth: 2,
    },
    inputContainerMinimalist: {
        backgroundColor: theme.colors.minimalist.white,
        borderWidth: 1,
        borderColor: theme.colors.gray200,
        height: 50, // Slightly taller for minimalist
        borderRadius: 12, // Match minimalist radius
    },
    inputContainerFocusedMinimalist: {
        borderColor: theme.colors.minimalist.coral,
        borderWidth: 1,
    },
    inputContainerError: {
        borderColor: theme.colors.danger,
        borderWidth: 1.5,
    },
    icon: {
        marginRight: theme.spacing.sm,
    },
    input: {
        flex: 1,
        ...theme.textStyles.body,
        color: theme.colors.textPrimary,
        fontSize: 14,
    },
    inputMinimalist: {
        fontSize: 16,
        color: theme.colors.minimalist.textDark,
    },
    eyeIcon: {
        padding: theme.spacing.xs,
    },
    error: {
        ...theme.textStyles.caption,
        color: theme.colors.danger,
        marginTop: theme.spacing.xs,
    },
});
