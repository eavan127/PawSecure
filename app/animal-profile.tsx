import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { serifTextStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { FloatingCard } from '../components/FloatingCard';
import { MinimalistStatusBadge } from '../components/MinimalistStatusBadge';
import { useAuth } from '../contexts/AuthContext';
import { getAnimalById } from '../services/animalService';
import { AnimalIdentity } from '../types';

interface ActivityItem {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const mockActivities: ActivityItem[] = [
    {
        id: '1',
        type: 'location',
        title: 'Downtown Metro - Gate 4',
        description: 'Spotted by Volunteer Sarah near the west entrance. Appeared calm but slightly dehydrated.',
        timestamp: 'Last seen • 2 hours ago',
        icon: 'location',
    },
    {
        id: '2',
        type: 'medical',
        title: 'Rabies Vaccination',
        description: 'Administered at PawGuard Field Clinic #2. Batch: RX-9921',
        timestamp: 'Medical log • Sept 15',
        icon: 'medical',
    },
    {
        id: '3',
        type: 'intake',
        title: 'Profile Created via AI Scan',
        description: 'Initial recognition profile generated from mobile upload.',
        timestamp: 'Initial intake • Sept 10',
        icon: 'camera',
    },
];

export default function AnimalProfileScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams();
    const isNGO = user?.role === 'ngo';
    const accentColor = isNGO ? '#0891B2' : colors.minimalist.coral;
    const subtleAccentBg = isNGO ? 'rgba(165, 229, 237, 0.25)' : colors.minimalist.peachLight;
    const animalId = params.id as string;

    const [animal, setAnimal] = useState<AnimalIdentity | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadAnimal();
    }, [animalId]);

    const loadAnimal = async () => {
        if (!animalId) {
            console.error('❌ No animal ID provided');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            console.log('📥 Loading animal:', animalId);
            const animalData = await getAnimalById(animalId);

            if (animalData) {
                console.log('✅ Animal loaded:', animalData.systemId);
                setAnimal(animalData);
            } else {
                console.error('❌ Animal not found');
            }
        } catch (error) {
            console.error('❌ Error loading animal:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={accentColor} />
                    <Text style={styles.loadingText}>Loading animal profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!animal) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <Ionicons name="alert-circle" size={64} color={colors.minimalist.textLight} />
                    <Text style={styles.loadingText}>Animal not found</Text>
                    <Pressable style={[styles.backButtonAlt, { backgroundColor: accentColor }]} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Back and Share Buttons */}
                <View style={styles.headerButtons}>
                    <Pressable onPress={() => router.back()} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.minimalist.textDark} />
                    </Pressable>
                    <Pressable style={styles.iconButton}>
                        <Ionicons name="share-social" size={24} color={colors.minimalist.textDark} />
                    </Pressable>
                </View>

                {/* Image Card */}
                <FloatingCard style={styles.imageCard} shadow="medium">
                    {animal.primaryImageUrl ? (
                        <Image
                            source={{ uri: animal.primaryImageUrl }}
                            style={styles.animalImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="paw" size={80} color={colors.minimalist.textLight} />
                        </View>
                    )}
                </FloatingCard>

                {/* Profile Content */}
                <View style={styles.content}>
                    {/* Status Badges */}
                    <View style={styles.badgeRow}>
                        <MinimalistStatusBadge
                            label={animal.status === 'waiting' ? 'High Priority' : animal.status}
                            variant="atRisk"
                        />
                    </View>

                    {/* Name & ID */}
                    <Text style={styles.name}>{animal.breed || 'Unknown'}</Text>
                    <Text style={styles.id}>
                        ID: <Text style={[styles.idValue, { color: accentColor }]}>#{animal.systemId}</Text> • Spotted {new Date(animal.lastSeenAt).toLocaleDateString()}
                    </Text>

                    {/* Status Row */}
                    <View style={styles.statusRow}>
                        {animal.status === 'waiting' && (
                            <MinimalistStatusBadge label="At Risk" variant="atRisk" icon="alert-circle" />
                        )}
                        {animal.isVaccinated && (
                            <MinimalistStatusBadge label="Vaccinated" variant="vaccinated" icon="checkmark-circle" />
                        )}
                        {animal.isNeutered && (
                            <MinimalistStatusBadge label="Neutered" variant="neutered" icon="checkmark-circle" />
                        )}
                    </View>

                    {/* AI Identity Section */}
                    <FloatingCard style={styles.section} shadow="soft">
                        <View style={styles.sectionHeader}>
                            <Ionicons name="sparkles" size={20} color={accentColor} />
                            <Text style={styles.sectionTitle}>AI-Generated Identity</Text>
                        </View>

                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Breed</Text>
                                <Text style={styles.infoValue}>{animal.breed}</Text>
                                {animal.embedding && (
                                    <Text style={styles.infoSubtitle}>AI Verified ✓</Text>
                                )}
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Species</Text>
                                <Text style={styles.infoValue}>{animal.species === 'dog' ? 'Dog 🐕' : 'Cat 🐈'}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Color</Text>
                                <Text style={styles.infoValue}>{animal.color}</Text>
                            </View>
                        </View>

                        {animal.embedding && (
                            <View style={[styles.embeddingInfo, { backgroundColor: subtleAccentBg }]}>
                                <Ionicons name="finger-print" size={16} color={accentColor} />
                                <Text style={[styles.embeddingText, { color: accentColor }]}>
                                    Identity fingerprint saved ({animal.embedding.length} features)
                                </Text>
                            </View>
                        )}
                    </FloatingCard>

                    {/* Activity History */}
                    <Text style={styles.activityTitle}>Activity & Medical History</Text>
                    {mockActivities.map((activity) => (
                        <FloatingCard key={activity.id} style={styles.activityCard} shadow="soft">
                            <View style={styles.activityRow}>
                                <View style={[styles.activityIcon, { backgroundColor: subtleAccentBg }]}>
                                    <Ionicons name={activity.icon} size={20} color={accentColor} />
                                </View>
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityTitle}>{activity.title}</Text>
                                    <Text style={styles.activityDescription}>{activity.description}</Text>
                                    <Text style={styles.activityTimestamp}>{activity.timestamp}</Text>
                                </View>
                            </View>
                        </FloatingCard>
                    ))}

                    {/* Action Buttons */}
                    <Pressable style={styles.primaryButton}>
                        <LinearGradient
                            colors={isNGO ? ['#A5E5ED', '#BBF3DE'] : [colors.minimalist.coral, colors.minimalist.mutedOrange]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Ionicons name="shield-checkmark" size={20} color={isNGO ? '#0891B2' : colors.minimalist.white} />
                            <Text style={[styles.buttonText, isNGO && { color: '#0891B2' }]}>Initiate Rescue</Text>
                        </LinearGradient>
                    </Pressable>

                    <Pressable style={[styles.secondaryButton, isNGO && { borderColor: '#A5E5ED' }]}>
                        <Ionicons name="heart" size={20} color={accentColor} />
                        <Text style={[styles.secondaryButtonText, { color: accentColor }]}>Adoption</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.minimalist.bgLight,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.xxxl,
    },
    headerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.minimalist.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    imageCard: {
        marginHorizontal: spacing.lg,
        padding: 0,
        overflow: 'hidden',
        marginBottom: spacing.lg,
    },
    imagePlaceholder: {
        height: 300,
        backgroundColor: colors.minimalist.bgLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingHorizontal: spacing.lg,
    },
    badgeRow: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    name: {
        ...serifTextStyles.serifHeading,
        color: colors.minimalist.textDark,
        marginBottom: 4,
    },
    id: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        marginBottom: spacing.lg,
    },
    idValue: {
        color: colors.minimalist.coral,
        fontWeight: '600',
    },
    statusRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.xl,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginLeft: spacing.sm,
    },
    infoGrid: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    infoItem: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.minimalist.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: 2,
    },
    infoSubtitle: {
        fontSize: 12,
        color: colors.minimalist.textMedium,
    },
    activityTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: spacing.md,
    },
    activityCard: {
        marginBottom: spacing.sm,
    },
    activityRow: {
        flexDirection: 'row',
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.minimalist.peachLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    activityContent: {
        flex: 1,
    },
    activityDescription: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        lineHeight: 20,
        marginTop: 2,
    },
    activityTimestamp: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.minimalist.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: spacing.xs,
    },
    primaryButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: spacing.xl,
    },
    buttonGradient: {
        flexDirection: 'row',
        paddingVertical: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.white,
    },
    secondaryButton: {
        flexDirection: 'row',
        backgroundColor: colors.minimalist.white,
        paddingVertical: spacing.lg,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        marginTop: spacing.md,
        borderWidth: 2,
        borderColor: colors.minimalist.coral,
    },
    secondaryButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.coral,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    loadingText: {
        fontSize: 16,
        color: colors.minimalist.textMedium,
        marginTop: spacing.md,
    },
    animalImage: {
        width: '100%',
        height: 300,
    },
    embeddingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: spacing.md,
        padding: spacing.sm,
        backgroundColor: colors.minimalist.peachLight,
        borderRadius: 8,
    },
    embeddingText: {
        fontSize: 12,
        color: colors.minimalist.coral,
        fontWeight: '600',
    },
    backButtonAlt: {
        marginTop: spacing.lg,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        backgroundColor: colors.minimalist.coral,
        borderRadius: 12,
    },
    backButtonText: {
        color: colors.minimalist.white,
        fontWeight: '600',
        fontSize: 16,
    },
});
