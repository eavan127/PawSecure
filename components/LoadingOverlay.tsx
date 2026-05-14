import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { theme } from '../theme';

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message }) => {
    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.container}>
                <View style={styles.content}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    {message && <Text style={styles.message}>{message}</Text>}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.blackOverlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        backgroundColor: theme.colors.surfaceDark,
        borderRadius: theme.borderRadius.card,
        padding: theme.spacing.xxxl,
        alignItems: 'center',
        minWidth: 150,
    },
    message: {
        ...theme.textStyles.body,
        color: theme.colors.textPrimary,
        marginTop: theme.spacing.md,
        textAlign: 'center',
    },
});
