import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, PressableProps, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface CustomButtonProps extends Omit<PressableProps, 'style'> {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'glass';
    size?: 'small' | 'medium' | 'large';
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    style?: ViewStyle;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
    title,
    variant = 'primary',
    size = 'medium',
    icon,
    iconPosition = 'right',
    loading = false,
    style,
    disabled,
    ...pressableProps
}) => {
    const getHeight = () => {
        switch (size) {
            case 'small': return 44;
            case 'large': return 64;
            default: return 56;
        }
    };

    if (variant === 'primary') {
        return (
            <Pressable
                {...pressableProps}
                disabled={disabled || loading}
                style={({ pressed }) => [
                    { opacity: pressed || disabled ? 0.8 : 1 },
                    style,
                ]}
            >
                <LinearGradient
                    colors={theme.gradients.primary}
                    start={theme.gradientPositions.horizontal.start}
                    end={theme.gradientPositions.horizontal.end}
                    style={[
                        styles.button,
                        { height: getHeight() },
                        theme.shadows.md,
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.textPrimary} />
                    ) : (
                        <>
                            {icon && iconPosition === 'left' && (
                                <Ionicons
                                    name={icon}
                                    size={22}
                                    color={theme.colors.textPrimary}
                                    style={styles.iconLeft}
                                />
                            )}
                            <Text style={styles.textPrimary}>{title}</Text>
                            {icon && iconPosition === 'right' && (
                                <Ionicons
                                    name={icon}
                                    size={22}
                                    color={theme.colors.textPrimary}
                                    style={styles.iconRight}
                                />
                            )}
                        </>
                    )}
                </LinearGradient>
            </Pressable>
        );
    }

    if (variant === 'secondary') {
        return (
            <Pressable
                {...pressableProps}
                disabled={disabled || loading}
                style={({ pressed }) => [
                    { opacity: pressed || disabled ? 0.8 : 1 },
                    style,
                ]}
            >
                <LinearGradient
                    colors={theme.gradients.secondary}
                    start={theme.gradientPositions.horizontal.start}
                    end={theme.gradientPositions.horizontal.end}
                    style={[
                        styles.button,
                        { height: getHeight() },
                        theme.shadows.md,
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.textPrimary} />
                    ) : (
                        <>
                            {icon && iconPosition === 'left' && (
                                <Ionicons
                                    name={icon}
                                    size={22}
                                    color={theme.colors.textPrimary}
                                    style={styles.iconLeft}
                                />
                            )}
                            <Text style={styles.textPrimary}>{title}</Text>
                            {icon && iconPosition === 'right' && (
                                <Ionicons
                                    name={icon}
                                    size={22}
                                    color={theme.colors.textPrimary}
                                    style={styles.iconRight}
                                />
                            )}
                        </>
                    )}
                </LinearGradient>
            </Pressable>
        );
    }

    if (variant === 'glass') {
        return (
            <Pressable
                {...pressableProps}
                disabled={disabled || loading}
                style={({ pressed }) => [
                    styles.button,
                    styles.buttonGlass,
                    theme.glassEffect,
                    { height: getHeight(), opacity: pressed || disabled ? 0.8 : 1 },
                    style,
                ]}
            >
                {loading ? (
                    <ActivityIndicator color={theme.colors.textPrimary} />
                ) : (
                    <>
                        {icon && iconPosition === 'left' && (
                            <Ionicons
                                name={icon}
                                size={22}
                                color={theme.colors.textPrimary}
                                style={styles.iconLeft}
                            />
                        )}
                        <Text style={styles.textSecondary}>{title}</Text>
                        {icon && iconPosition === 'right' && (
                            <Ionicons
                                name={icon}
                                size={22}
                                color={theme.colors.textPrimary}
                                style={styles.iconRight}
                            />
                        )}
                    </>
                )}
            </Pressable>
        );
    }

    // Outline variant
    return (
        <Pressable
            {...pressableProps}
            disabled={disabled || loading}
            style={({ pressed }) => [
                styles.button,
                styles.buttonOutline,
                { height: getHeight(), opacity: pressed || disabled ? 0.8 : 1 },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={theme.colors.textAccent} />
            ) : (
                <>
                    {icon && iconPosition === 'left' && (
                        <Ionicons
                            name={icon}
                            size={22}
                            color={theme.colors.textAccent}
                            style={styles.iconLeft}
                        />
                    )}
                    <Text style={styles.textOutline}>{title}</Text>
                    {icon && iconPosition === 'right' && (
                        <Ionicons
                            name={icon}
                            size={22}
                            color={theme.colors.textAccent}
                            style={styles.iconRight}
                        />
                    )}
                </>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: theme.borderRadius.button,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    buttonGlass: {
    },
    buttonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.borderGradient,
    },
    textPrimary: {
        ...theme.textStyles.button,
        color: theme.colors.textPrimary,
        fontWeight: '700',
        fontSize: 16,
    },
    textSecondary: {
        ...theme.textStyles.button,
        color: theme.colors.textPrimary,
        fontWeight: '600',
        fontSize: 16,
    },
    textOutline: {
        ...theme.textStyles.button,
        color: theme.colors.textAccent,
        fontWeight: '600',
        fontSize: 16,
    },
    iconLeft: {
        marginRight: theme.spacing.sm,
    },
    iconRight: {
        marginLeft: theme.spacing.sm,
    },
});
