import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FloatingCard } from '../components/FloatingCard';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { serifTextStyles } from '../theme/typography';

export default function ContactReporterScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams();

    const isNGO = user?.role === 'ngo';
    const accentColor = isNGO ? '#0891B2' : colors.minimalist.coral;
    const avatarBg = isNGO ? '#A5E5ED' : colors.minimalist.peach;

    const reporterName = params.name || 'Sarah Miller';
    const reporterPhone = params.phone || '+65 9123 4567';
    const animalName = params.animalName || 'Buddy';

    const handleCall = () => {
        Linking.openURL(`tel:${reporterPhone}`);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={28} color={colors.minimalist.textDark} />
                </Pressable>
                <Text style={styles.title}>Contact Reporter</Text>
            </View>

            <View style={styles.container}>
                <FloatingCard shadow="medium" style={styles.profileCard}>
                    <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                        <Text style={styles.avatarText}>{reporterName[0]}</Text>
                    </View>
                    <Text style={styles.reporterName}>{reporterName}</Text>
                    <Text style={styles.role}>Citizen Reporter</Text>

                    <View style={styles.divider} />

                    <Text style={styles.infoLabel}>Regarding</Text>
                    <Text style={styles.infoValue}>{animalName} (Labrador Mix)</Text>

                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>Marina Bay Sands, near North Entrance</Text>
                </FloatingCard>

                <View style={styles.actionSection}>
                    <Pressable onPress={handleCall} style={[styles.callButton, { backgroundColor: accentColor }]}>
                        <Ionicons name="call" size={24} color={colors.minimalist.white} />
                        <Text style={styles.callButtonText}>Call {reporterName}</Text>
                    </Pressable>

                    <Pressable style={[styles.messageButton, { borderColor: accentColor }]}>
                        <Ionicons name="chatbubble" size={24} color={accentColor} />
                        <Text style={[styles.messageButtonText, { color: accentColor }]}>Send Message</Text>
                    </Pressable>
                </View>

                <Text style={styles.note}>
                    Your contact information will be shared with the reporter for coordination purposes.
                </Text>
            </View>
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
        padding: spacing.xl,
    },
    profileCard: {
        alignItems: 'center',
        padding: spacing.xl,
        marginBottom: spacing.xxl,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.minimalist.peach,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '700',
        color: colors.minimalist.white,
    },
    reporterName: {
        ...serifTextStyles.serifHeading,
        fontSize: 24,
        color: colors.minimalist.textDark,
        marginBottom: 4,
    },
    role: {
        fontSize: 16,
        color: colors.minimalist.textMedium,
        marginBottom: spacing.lg,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: colors.minimalist.border,
        marginVertical: spacing.lg,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.minimalist.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
        alignSelf: 'flex-start',
    },
    infoValue: {
        fontSize: 16,
        color: colors.minimalist.textDark,
        marginBottom: spacing.md,
        alignSelf: 'flex-start',
    },
    actionSection: {
        gap: spacing.md,
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
    messageButton: {
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
    messageButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.coral,
    },
    note: {
        marginTop: spacing.xl,
        fontSize: 13,
        color: colors.minimalist.textLight,
        textAlign: 'center',
        lineHeight: 18,
    },
});
