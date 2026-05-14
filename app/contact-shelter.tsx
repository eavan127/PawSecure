import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FloatingCard } from '../components/FloatingCard';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { serifTextStyles } from '../theme/typography';

export default function ContactShelterScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams();

    const isNGO = user?.role === 'ngo';
    const accentColor = isNGO ? '#0891B2' : colors.minimalist.coral;
    const subtleAccentBg = isNGO ? 'rgba(165, 229, 237, 0.25)' : '#FFF7F5';
    const shelterIconBg = isNGO ? '#A5E5ED' : colors.minimalist.mutedOrange;

    const shelterName = (params.name as string) || 'Happy Tails Sanctuary';
    const shelterPhone = (params.phone as string) || '+65 6789 0123';
    const shelterAddress = (params.address as string) || '123 Animal Rescue Lane, Singapore 567890';

    const handleCall = () => {
        Linking.openURL(`tel:${shelterPhone}`);
    };

    const handleDirections = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shelterAddress)}`;
        Linking.openURL(url);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color={colors.minimalist.textDark} />
                </Pressable>
                <Text style={styles.title}>Contact Shelter</Text>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <FloatingCard shadow="medium" style={styles.shelterCard}>
                    <View style={[styles.shelterIcon, { backgroundColor: shelterIconBg }]}>
                        <Ionicons name="business" size={48} color={colors.minimalist.white} />
                    </View>
                    <Text style={styles.shelterName}>{shelterName}</Text>
                    <Text style={styles.role}>Registered NGO & Shelter</Text>

                    <View style={styles.divider} />

                    <View style={styles.infoItem}>
                        <Ionicons name="location" size={20} color={accentColor} />
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>Address</Text>
                            <Text style={styles.infoValue}>{shelterAddress}</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="time" size={20} color={accentColor} />
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>Operating Hours</Text>
                            <Text style={styles.infoValue}>Daily: 9:00 AM - 6:00 PM</Text>
                        </View>
                    </View>
                </FloatingCard>

                <View style={styles.actionSection}>
                    <Pressable onPress={handleCall} style={[styles.callButton, { backgroundColor: accentColor }]}>
                        <Ionicons name="call" size={24} color={colors.minimalist.white} />
                        <Text style={styles.callButtonText}>Call Shelter</Text>
                    </Pressable>

                    <Pressable onPress={handleDirections} style={[styles.directionButton, { borderColor: accentColor }]}>
                        <Ionicons name="map" size={24} color={accentColor} />
                        <Text style={[styles.directionButtonText, { color: accentColor }]}>Get Directions</Text>
                    </Pressable>
                </View>

                <FloatingCard shadow="soft" style={[styles.messageCard, { backgroundColor: subtleAccentBg }]}>
                    <Text style={styles.messageTitle}>Send a Message</Text>
                    <Text style={styles.messageText}>
                        Inquire about adoption or report an animal directly to this shelter.
                    </Text>
                    <Pressable style={[styles.secondaryMessageButton, { borderBottomColor: accentColor }]}>
                        <Text style={[styles.secondaryMessageButtonText, { color: accentColor }]}>Open Chat</Text>
                    </Pressable>
                </FloatingCard>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.minimalist.bgLight,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.minimalist.border,
    },
    backButton: {
        marginRight: spacing.md,
    },
    title: {
        ...serifTextStyles.serifHeading,
        fontSize: 20,
        color: colors.minimalist.textDark,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.xl,
    },
    shelterCard: {
        alignItems: 'center',
        padding: spacing.xl,
        marginBottom: spacing.xl,
    },
    shelterIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.minimalist.mutedOrange,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    shelterName: {
        ...serifTextStyles.serifHeading,
        fontSize: 24,
        color: colors.minimalist.textDark,
        textAlign: 'center',
        marginBottom: 4,
    },
    role: {
        fontSize: 16,
        color: colors.minimalist.textMedium,
        marginBottom: spacing.md,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: colors.minimalist.border,
        marginVertical: spacing.lg,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: spacing.md,
        gap: spacing.md,
    },
    infoText: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.minimalist.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        color: colors.minimalist.textDark,
        lineHeight: 22,
    },
    actionSection: {
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    callButton: {
        flexDirection: 'row',
        backgroundColor: colors.minimalist.coral,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    callButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.white,
    },
    directionButton: {
        flexDirection: 'row',
        backgroundColor: colors.minimalist.white,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        borderWidth: 2,
        borderColor: colors.minimalist.coral,
    },
    directionButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.coral,
    },
    messageCard: {
        padding: spacing.lg,
        backgroundColor: '#FFF7F5', // Very light tint
    },
    messageTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: 4,
    },
    messageText: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    secondaryMessageButton: {
        alignSelf: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: colors.minimalist.coral,
    },
    secondaryMessageButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.minimalist.coral,
        paddingBottom: 2,
    },
});
