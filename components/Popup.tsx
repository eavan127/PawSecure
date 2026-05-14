import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FloatingCard } from './FloatingCard';
import { colors } from '../theme/colors';

interface PopupProps {
    visible: boolean;
    title: string;
    message: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    onClose: () => void;
}

export const Popup: React.FC<PopupProps> = ({
    visible,
    title,
    message,
    icon = 'checkmark-circle',
    iconColor = colors.minimalist.successGreen,
    onClose,
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <FloatingCard shadow="large" style={styles.popup}>
                    <Ionicons name={icon} size={56} color={iconColor} style={styles.icon} />
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    <Pressable onPress={onClose} style={styles.button}>
                        {({ pressed }) => (
                            <View style={[styles.buttonInner, pressed && styles.buttonPressed]}>
                                <Text style={styles.buttonText}>OK</Text>
                            </View>
                        )}
                    </Pressable>
                </FloatingCard>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    popup: {
        width: '100%',
        maxWidth: 340,
        padding: 32,
        alignItems: 'center',
    },
    icon: {
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 15,
        color: colors.minimalist.textMedium,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    button: {
        width: '100%',
    },
    buttonInner: {
        backgroundColor: colors.minimalist.coral,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonPressed: {
        opacity: 0.8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.white,
    },
});
