import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    Pressable,
    Linking,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface ContactModalProps {
    visible: boolean;
    onClose: () => void;
    contactName: string;
    phone?: string;
    email?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
    visible,
    onClose,
    contactName,
    phone,
    email,
}) => {
    const handleCall = () => {
        if (phone) {
            Linking.openURL(`tel:${phone}`).catch(() => {
                Alert.alert('Error', 'Unable to make phone call');
            });
        }
    };

    const handleSMS = () => {
        if (phone) {
            Linking.openURL(`sms:${phone}`).catch(() => {
                Alert.alert('Error', 'Unable to send SMS');
            });
        }
    };

    const handleEmail = () => {
        if (email) {
            Linking.openURL(`mailto:${email}`).catch(() => {
                Alert.alert('Error', 'Unable to open email app');
            });
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={styles.modalContainer}>
                    {/* Handle bar */}
                    <View style={styles.handleBar} />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.avatarCircle}>
                            <Ionicons name="person" size={32} color={colors.minimalist.coral} />
                        </View>
                        <Text style={styles.contactName}>{contactName}</Text>
                        <Text style={styles.subtitle}>Contact Reporter</Text>
                    </View>

                    {/* Contact Options */}
                    <View style={styles.optionsContainer}>
                        {phone && (
                            <>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.optionButton,
                                        styles.callButton,
                                        pressed && styles.optionPressed
                                    ]}
                                    onPress={handleCall}
                                >
                                    <View style={[styles.iconCircle, { backgroundColor: '#D1FAE5' }]}>
                                        <Ionicons name="call" size={24} color="#059669" />
                                    </View>
                                    <View style={styles.optionText}>
                                        <Text style={styles.optionLabel}>Call</Text>
                                        <Text style={styles.optionValue}>{phone}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
                                </Pressable>

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.optionButton,
                                        pressed && styles.optionPressed
                                    ]}
                                    onPress={handleSMS}
                                >
                                    <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                                        <Ionicons name="chatbubble" size={24} color="#0369A1" />
                                    </View>
                                    <View style={styles.optionText}>
                                        <Text style={styles.optionLabel}>Message</Text>
                                        <Text style={styles.optionValue}>Send SMS</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
                                </Pressable>
                            </>
                        )}

                        {email && (
                            <Pressable
                                style={({ pressed }) => [
                                    styles.optionButton,
                                    pressed && styles.optionPressed
                                ]}
                                onPress={handleEmail}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
                                    <Ionicons name="mail" size={24} color="#D97706" />
                                </View>
                                <View style={styles.optionText}>
                                    <Text style={styles.optionLabel}>Email</Text>
                                    <Text style={styles.optionValue}>{email}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
                            </Pressable>
                        )}

                        {!phone && !email && (
                            <View style={styles.noContactInfo}>
                                <Ionicons name="alert-circle-outline" size={48} color={colors.gray400} />
                                <Text style={styles.noContactText}>No contact information available</Text>
                            </View>
                        )}
                    </View>

                    {/* Close Button */}
                    <Pressable style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: colors.minimalist.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: spacing.lg,
        paddingBottom: 40,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: colors.gray300,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatarCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.minimalist.peachLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    contactName: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
    },
    optionsContainer: {
        gap: spacing.sm,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.minimalist.bgLight,
        padding: spacing.md,
        borderRadius: 16,
        gap: spacing.md,
    },
    callButton: {},
    optionPressed: {
        opacity: 0.7,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionText: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    optionValue: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        marginTop: 2,
    },
    noContactInfo: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    noContactText: {
        fontSize: 16,
        color: colors.minimalist.textMedium,
        marginTop: spacing.md,
    },
    closeButton: {
        backgroundColor: colors.gray200,
        paddingVertical: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
    },
});
