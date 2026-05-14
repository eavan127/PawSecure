import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CertificationCard, SwitchRow } from '../components';
import { theme } from '../theme';

// Mock data for the pet
const MOCK_PET = {
    id: 'AI-90210',
    name: 'Buddy',
    status: 'Ready for Forever Home',
    imageUri: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
};

// Mock data for the adopter
const MOCK_ADOPTER = {
    name: 'Sarah Jenkins',
    id: 'AD-5592',
    verified: true,
    imageUri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
};

interface AdoptionExitScreenProps {
    navigation: any;
    route?: any;
}

export const AdoptionExitScreen: React.FC<AdoptionExitScreenProps> = ({ navigation }) => {
    const [deactivateAI, setDeactivateAI] = useState(true);
    const [archiveProfile, setArchiveProfile] = useState(true);

    const handleConfirm = () => {
        console.log('Confirming adoption exit:', {
            petId: MOCK_PET.id,
            adopterId: MOCK_ADOPTER.id,
            deactivateAI,
            archiveProfile,
        });
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.textPrimary} />
                </Pressable>
                <Text style={styles.headerTitle}>Adoption Exit</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Pet Avatar */}
                <View style={styles.petAvatarContainer}>
                    <View style={styles.petAvatarBorder}>
                        <Image
                            source={{ uri: MOCK_PET.imageUri }}
                            style={styles.petAvatar}
                        />
                    </View>
                    <Text style={styles.petName}>{MOCK_PET.name}</Text>
                    <Text style={styles.petId}>
                        ID: #{MOCK_PET.id} | {MOCK_PET.status}
                    </Text>
                </View>

                {/* Adopter Verification */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Adopter Verification</Text>
                    <View style={styles.adopterRow}>
                        <View style={styles.adopterAvatarContainer}>
                            <Image
                                source={{ uri: MOCK_ADOPTER.imageUri }}
                                style={styles.adopterAvatar}
                            />
                        </View>
                        <View style={styles.adopterInfo}>
                            <Text style={styles.adopterName}>{MOCK_ADOPTER.name}</Text>
                            <Text style={styles.adopterDetails}>
                                Verified Adopter • ID: {MOCK_ADOPTER.id}
                            </Text>
                        </View>
                        {MOCK_ADOPTER.verified && (
                            <View style={styles.verifiedBadge}>
                                <Ionicons name="checkmark-circle" size={24} color={theme.colors.greenPrimary} />
                            </View>
                        )}
                    </View>
                </View>

                {/* Official Certification */}
                <View style={styles.section}>
                    <CertificationCard
                        title="Official Certification"
                        subtitle="NGO Approval Stamp"
                        signedBy="PawGuard Admin"
                    />
                </View>

                {/* Privacy & Data Exit */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Privacy & Data Exit</Text>
                    <SwitchRow
                        title="Deactivate AI Monitoring"
                        description="Stops real-time rescue tracking for this ID"
                        value={deactivateAI}
                        onValueChange={setDeactivateAI}
                    />
                    <SwitchRow
                        title="Archive Profile"
                        description="Moves all records to the permanent NGO archive"
                        value={archiveProfile}
                        onValueChange={setArchiveProfile}
                    />
                </View>

                {/* Disclaimer */}
                <View style={styles.disclaimerBox}>
                    <Ionicons name="information-circle" size={16} color={theme.colors.textMuted} />
                    <Text style={styles.disclaimerText}>
                        By confirming, you acknowledge that {MOCK_PET.name} is leaving the
                        active rescue system. This action is logged for compliance
                        and cannot be undone via this dashboard.
                    </Text>
                </View>
            </ScrollView>

            {/* Confirm Button */}
            <View style={styles.buttonContainer}>
                <Pressable onPress={handleConfirm} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
                    <LinearGradient
                        colors={[theme.colors.greenPrimary, theme.colors.greenLight]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.confirmButton}
                    >
                        <Text style={styles.confirmButtonText}>Confirm Adoption & Exit System</Text>
                        <Ionicons name="paw" size={20} color={theme.colors.textPrimary} />
                    </LinearGradient>
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...theme.textStyles.h4,
        color: theme.colors.textPrimary,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: 120,
    },
    petAvatarContainer: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
    },
    petAvatarBorder: {
        width: 130,
        height: 130,
        borderRadius: 65,
        borderWidth: 3,
        borderColor: theme.colors.greenPrimary,
        padding: 4,
        marginBottom: theme.spacing.lg,
    },
    petAvatar: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    petName: {
        ...theme.textStyles.h3,
        color: theme.colors.textPrimary,
        fontWeight: 'bold',
        marginBottom: theme.spacing.xs,
    },
    petId: {
        ...theme.textStyles.body,
        color: theme.colors.greenPrimary,
        fontSize: 13,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        ...theme.textStyles.h4,
        color: theme.colors.textPrimary,
        fontWeight: '600',
        marginBottom: theme.spacing.md,
    },
    adopterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.card,
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.borderGlass,
    },
    adopterAvatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: 'hidden',
        marginRight: theme.spacing.md,
    },
    adopterAvatar: {
        width: '100%',
        height: '100%',
    },
    adopterInfo: {
        flex: 1,
    },
    adopterName: {
        ...theme.textStyles.body,
        color: theme.colors.textPrimary,
        fontWeight: '600',
        fontSize: 15,
    },
    adopterDetails: {
        ...theme.textStyles.caption,
        color: theme.colors.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
    verifiedBadge: {
        marginLeft: theme.spacing.sm,
    },
    disclaimerBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.borderGlass,
    },
    disclaimerText: {
        ...theme.textStyles.caption,
        color: theme.colors.textMuted,
        fontSize: 12,
        lineHeight: 18,
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.borderGlass,
    },
    confirmButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: theme.spacing.lg,
        borderRadius: theme.borderRadius.button,
        gap: theme.spacing.sm,
    },
    confirmButtonText: {
        ...theme.textStyles.button,
        color: theme.colors.textPrimary,
        fontWeight: '600',
        fontSize: 15,
    },
});
