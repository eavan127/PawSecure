import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FloatingCard } from './FloatingCard';
import { colors } from '../theme/colors';

interface ActionCardProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    iconColor?: string;
    onPress: () => void;
    style?: ViewStyle;
}

export const ActionCard: React.FC<ActionCardProps> = ({
    icon,
    title,
    description,
    iconColor = colors.minimalist.coral,
    onPress,
    style,
}) => {
    return (
        <Pressable onPress={onPress} style={[styles.container, style]}>
            {({ pressed }) => (
                <FloatingCard shadow="medium" style={[styles.card, pressed && styles.pressed]}>
                    <Ionicons name={icon} size={40} color={iconColor} style={styles.icon} />
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.description}>{description}</Text>
                </FloatingCard>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        alignItems: 'center',
        padding: 24,
        minHeight: 160,
        justifyContent: 'center',
    },
    pressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },
    icon: {
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: 6,
        textAlign: 'center',
    },
    description: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
        textAlign: 'center',
        lineHeight: 18,
    },
});
