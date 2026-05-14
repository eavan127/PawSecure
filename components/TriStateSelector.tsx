import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { theme } from '../theme';

interface TriStateSelectorProps {
    value: 'unknown' | 'yes' | 'no';
    onChange: (value: 'unknown' | 'yes' | 'no') => void;
    labels?: {
        unknown?: string;
        yes?: string;
        no?: string;
    };
    style?: ViewStyle;
}

export const TriStateSelector: React.FC<TriStateSelectorProps> = ({
    value,
    onChange,
    labels = { unknown: 'Unknown', yes: 'Appears Yes', no: 'No' },
    style,
}) => {
    return (
        <View style={[styles.container, style]}>
            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    styles.buttonUnknown,
                    value === 'unknown' && styles.buttonUnknownSelected,
                    { opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => onChange('unknown')}
            >
                <Text style={[
                    styles.text,
                    value === 'unknown' && styles.textSelected,
                ]}>
                    {labels.unknown}
                </Text>
            </Pressable>

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    value === 'yes' && styles.buttonSelected,
                    { opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => onChange('yes')}
            >
                <Text style={[
                    styles.text,
                    value === 'yes' && styles.textMuted,
                ]}>
                    {labels.yes}
                </Text>
            </Pressable>

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    value === 'no' && styles.buttonSelected,
                    { opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => onChange('no')}
            >
                <Text style={[
                    styles.text,
                    value === 'no' && styles.textMuted,
                ]}>
                    {labels.no}
                </Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    button: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        backgroundColor: 'transparent',
    },
    buttonUnknown: {
        backgroundColor: 'transparent',
    },
    buttonUnknownSelected: {
        backgroundColor: theme.colors.greenPrimary,
    },
    buttonSelected: {
        backgroundColor: 'transparent',
    },
    text: {
        ...theme.textStyles.body,
        color: theme.colors.textMuted,
        fontSize: 13,
    },
    textSelected: {
        color: theme.colors.textPrimary,
        fontWeight: '600',
    },
    textMuted: {
        color: theme.colors.textMuted,
    },
});
