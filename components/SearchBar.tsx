import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { minimalistShadows } from '../theme/shadows';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface SearchBarProps {
    placeholder?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    onFocus?: () => void;
    onBlur?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Search for pets, tips, or alerts...',
    value,
    onChangeText,
    onFocus,
    onBlur,
}) => {
    return (
        <View style={styles.container}>
            <Ionicons
                name="search"
                size={20}
                color={colors.minimalist.textLight}
                style={styles.icon}
            />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={colors.minimalist.textLight}
                value={value}
                onChangeText={onChangeText}
                onFocus={onFocus}
                onBlur={onBlur}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.minimalist.white,
        borderRadius: 16,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        ...minimalistShadows.cardSoft,
    },
    icon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: typography.fontSize.base,
        color: colors.minimalist.textDark,
        fontWeight: typography.fontWeight.regular,
    },
});
