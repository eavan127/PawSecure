import React from 'react';
import { View, StyleSheet, ViewStyle, Platform, StyleProp } from 'react-native';
import { colors } from '../theme/colors';

type ShadowLevel = 'soft' | 'medium' | 'large';

interface FloatingCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    shadow?: ShadowLevel;
    backgroundColor?: string;
}

export const FloatingCard: React.FC<FloatingCardProps> = ({
    children,
    style,
    shadow = 'soft',
    backgroundColor
}) => {
    const shadowStyle = shadows[shadow];

    return (
        <View style={[styles.card, shadowStyle, backgroundColor && { backgroundColor }, style]}>
            {children}
        </View>
    );
};

const shadows = {
    soft: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
        },
        android: {
            elevation: 2,
        },
    }),
    medium: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
        },
        android: {
            elevation: 4,
        },
    }),
    large: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.16,
            shadowRadius: 16,
        },
        android: {
            elevation: 8,
        },
    }),
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.minimalist.white,
        borderRadius: 16,
        padding: 16,
    },
});
