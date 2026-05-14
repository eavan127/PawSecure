import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { InjurySeverity } from '../types';

interface SeverityIndicatorProps {
    severity: InjurySeverity;
    showLabel?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export const SeverityIndicator: React.FC<SeverityIndicatorProps> = ({
    severity,
    showLabel = true,
    size = 'medium',
}) => {
    const getSeverityConfig = () => {
        switch (severity) {
            case 'low':
                return {
                    bg: '#D1FAE5',
                    text: '#059669',
                    label: 'Low',
                    icon: 'medical' as const,
                };
            case 'medium':
                return {
                    bg: '#FEF3C7',
                    text: '#D97706',
                    label: 'Medium',
                    icon: 'medical' as const,
                };
            case 'high':
                return {
                    bg: '#FED7AA',
                    text: '#EA580C',
                    label: 'High',
                    icon: 'warning' as const,
                };
            case 'critical':
                return {
                    bg: '#FECACA',
                    text: '#DC2626',
                    label: 'Critical',
                    icon: 'alert-circle' as const,
                };
            default:
                return {
                    bg: colors.gray200,
                    text: colors.minimalist.textMedium,
                    label: 'Unknown',
                    icon: 'help-circle' as const,
                };
        }
    };

    const config = getSeverityConfig();

    const sizeStyles = {
        small: { padding: 4, fontSize: 10, iconSize: 12 },
        medium: { padding: 6, fontSize: 12, iconSize: 14 },
        large: { padding: 8, fontSize: 14, iconSize: 16 },
    };

    const currentSize = sizeStyles[size];

    return (
        <View style={[
            styles.container,
            { backgroundColor: config.bg, padding: currentSize.padding }
        ]}>
            <Ionicons
                name={config.icon}
                size={currentSize.iconSize}
                color={config.text}
            />
            {showLabel && (
                <Text style={[
                    styles.text,
                    { color: config.text, fontSize: currentSize.fontSize }
                ]}>
                    {config.label}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        gap: 4,
    },
    text: {
        fontWeight: '600',
    },
});
