/**
 * Adoption Detail Screen
 * Shows adoption post details with NGO contact information
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    Linking,
    Alert,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { FloatingCard } from '../components/FloatingCard';
import { ContactModal } from '../components/ContactModal';
import adoptionService from '../services/adoptionService';
import ngoService from '../services/ngoService';
import { AdoptionPost as AdoptionPostType, NgoProfile } from '../lib/communityTypes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AdoptionDetailScreen() {
    const router = useRouter();
    const { postId } = useLocalSearchParams<{ postId: string }>();

    const [post, setPost] = useState<AdoptionPostType | null>(null);
    const [ngoProfile, setNgoProfile] = useState<NgoProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showContactModal, setShowContactModal] = useState(false);

    useEffect(() => {
        loadData();
    }, [postId]);

    const loadData = async () => {
        if (!postId) return;

        try {
            setIsLoading(true);
            // For now, use mock data since the actual service might not return real data
            // In production, this would fetch from Supabase
            const mockPost: AdoptionPostType = {
                id: postId,
                animalId: `ANIMAL-${postId}`,
                ngoId: 'ngo-1',
                ngoName: 'Happy Paws Shelter',
                name: 'Buddy',
                species: 'dog',
                breed: 'Golden Retriever Mix',
                ageEstimate: '2 years',
                gender: 'male',
                size: 'large',
                healthStatus: 'Healthy and active',
                temperament: 'Friendly, playful, loves people',
                isVaccinated: true,
                isNeutered: true,
                goodWithChildren: true,
                goodWithPets: true,
                photos: ['https://placedog.net/500'],
                adoptionFee: 150,
                requirements: 'Home visit required. Yard preferred.',
                status: 'available',
                viewsCount: 45,
                inquiriesCount: 12,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const mockNgo: NgoProfile = {
                id: 'ngo-1',
                userId: 'user-1',
                organizationName: 'Happy Paws Shelter',
                registrationNumber: 'NGO-2024-0001',
                isVerified: true,
                verifiedAt: new Date().toISOString(),
                officePhone: '+60123456789',
                email: 'contact@happypaws.org',
                officeAddress: '123 Animal Haven Road, Kuala Lumpur',
                website: 'https://happypaws.org',
                operatingHours: 'Mon-Sat: 9AM - 6PM',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            setPost(mockPost);
            setNgoProfile(mockNgo);
        } catch (error) {
            console.error('Error loading adoption details:', error);
            Alert.alert('Error', 'Failed to load adoption details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCall = () => {
        if (ngoProfile?.officePhone) {
            Linking.openURL(`tel:${ngoProfile.officePhone}`);
        }
    };

    const handleEmail = () => {
        if (ngoProfile?.email) {
            Linking.openURL(`mailto:${ngoProfile.email}?subject=Adoption Inquiry: ${post?.name}`);
        }
    };

    const handleInterest = () => {
        Alert.alert(
            '❤️ Interest Registered!',
            `We've notified ${ngoProfile?.organizationName} about your interest in adopting ${post?.name}. They will contact you soon!`,
            [{ text: 'OK' }]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#7C3AED" />
                    <Text style={styles.loadingText}>Loading adoption details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!post) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color={colors.minimalist.textLight} />
                    <Text style={styles.errorText}>Adoption post not found</Text>
                    <Pressable style={styles.backButtonError} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
            <StatusBar style="light" />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: post.photos?.[0] || 'https://placedog.net/500' }}
                        style={styles.heroImage}
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.imageGradient}
                    />

                    {/* Back Button */}
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <BlurView intensity={80} tint="light" style={styles.backButtonBlur}>
                            <Ionicons name="arrow-back" size={24} color="#000" />
                        </BlurView>
                    </Pressable>

                    {/* Status Badge */}
                    <View style={[styles.statusBadge,
                    post.status === 'available' && { backgroundColor: '#10B981' },
                    post.status === 'pending' && { backgroundColor: '#F59E0B' },
                    post.status === 'adopted' && { backgroundColor: '#6B7280' },
                    ]}>
                        <Text style={styles.statusText}>
                            {post.status === 'available' ? '🏠 Available for Adoption' :
                                post.status === 'pending' ? '⏳ Pending' : '✅ Adopted'}
                        </Text>
                    </View>

                    {/* Name Overlay */}
                    <View style={styles.nameOverlay}>
                        <Text style={styles.animalName}>{post.name}</Text>
                        <Text style={styles.animalBreed}>
                            {post.species === 'dog' ? '🐕' : '🐱'} {post.breed || 'Unknown Breed'}
                        </Text>
                    </View>
                </View>

                {/* Quick Info */}
                <View style={styles.quickInfo}>
                    <View style={styles.quickInfoItem}>
                        <Ionicons name="calendar" size={20} color="#7C3AED" />
                        <Text style={styles.quickInfoText}>{post.ageEstimate || 'Unknown'}</Text>
                    </View>
                    <View style={styles.quickInfoDivider} />
                    <View style={styles.quickInfoItem}>
                        <Ionicons name={post.gender === 'male' ? 'male' : post.gender === 'female' ? 'female' : 'help'} size={20} color="#7C3AED" />
                        <Text style={styles.quickInfoText}>{post.gender}</Text>
                    </View>
                    <View style={styles.quickInfoDivider} />
                    <View style={styles.quickInfoItem}>
                        <Ionicons name="resize" size={20} color="#7C3AED" />
                        <Text style={styles.quickInfoText}>{post.size}</Text>
                    </View>
                </View>

                {/* About Section */}
                <FloatingCard shadow="soft" style={styles.section}>
                    <Text style={styles.sectionTitle}>About {post.name}</Text>

                    {post.healthStatus && (
                        <View style={styles.infoRow}>
                            <Ionicons name="fitness" size={18} color="#10B981" />
                            <Text style={styles.infoLabel}>Health:</Text>
                            <Text style={styles.infoValue}>{post.healthStatus}</Text>
                        </View>
                    )}

                    {post.temperament && (
                        <View style={styles.infoRow}>
                            <Ionicons name="happy" size={18} color="#F59E0B" />
                            <Text style={styles.infoLabel}>Temperament:</Text>
                            <Text style={styles.infoValue}>{post.temperament}</Text>
                        </View>
                    )}

                    <View style={styles.tagsRow}>
                        {post.isVaccinated && (
                            <View style={[styles.tag, { backgroundColor: '#D1FAE5' }]}>
                                <Ionicons name="medkit" size={14} color="#059669" />
                                <Text style={[styles.tagText, { color: '#059669' }]}>Vaccinated</Text>
                            </View>
                        )}
                        {post.isNeutered && (
                            <View style={[styles.tag, { backgroundColor: '#EDE9FE' }]}>
                                <Ionicons name="cut" size={14} color="#7C3AED" />
                                <Text style={[styles.tagText, { color: '#7C3AED' }]}>Neutered</Text>
                            </View>
                        )}
                        {post.goodWithChildren && (
                            <View style={[styles.tag, { backgroundColor: '#FEF3C7' }]}>
                                <Ionicons name="happy" size={14} color="#D97706" />
                                <Text style={[styles.tagText, { color: '#D97706' }]}>Kid-Friendly</Text>
                            </View>
                        )}
                        {post.goodWithPets && (
                            <View style={[styles.tag, { backgroundColor: '#FCE7F3' }]}>
                                <Ionicons name="paw" size={14} color="#DB2777" />
                                <Text style={[styles.tagText, { color: '#DB2777' }]}>Pet-Friendly</Text>
                            </View>
                        )}
                    </View>
                </FloatingCard>

                {/* Adoption Fee */}
                {post.adoptionFee !== undefined && (
                    <FloatingCard shadow="soft" style={styles.section}>
                        <Text style={styles.sectionTitle}>Adoption Fee</Text>
                        <View style={styles.feeContainer}>
                            <Text style={styles.feeAmount}>
                                {post.adoptionFee === 0 ? 'FREE' : `RM ${post.adoptionFee.toFixed(2)}`}
                            </Text>
                            <Text style={styles.feeNote}>
                                Includes: Vaccination, Neutering, Microchip
                            </Text>
                        </View>
                    </FloatingCard>
                )}

                {/* Requirements */}
                {post.requirements && (
                    <FloatingCard shadow="soft" style={styles.section}>
                        <Text style={styles.sectionTitle}>Adoption Requirements</Text>
                        <Text style={styles.requirementsText}>{post.requirements}</Text>
                    </FloatingCard>
                )}

                {/* NGO Information */}
                {ngoProfile && (
                    <FloatingCard shadow="soft" style={styles.section}>
                        <Text style={styles.sectionTitle}>Shelter Information</Text>

                        <View style={styles.ngoHeader}>
                            <View style={styles.ngoLogo}>
                                <Ionicons name="home" size={28} color="#7C3AED" />
                            </View>
                            <View style={styles.ngoInfo}>
                                <View style={styles.ngoNameRow}>
                                    <Text style={styles.ngoName}>{ngoProfile.organizationName}</Text>
                                    {ngoProfile.isVerified && (
                                        <View style={styles.verifiedBadge}>
                                            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                            <Text style={styles.verifiedText}>Verified</Text>
                                        </View>
                                    )}
                                </View>
                                {ngoProfile.operatingHours && (
                                    <Text style={styles.ngoHours}>
                                        🕐 {ngoProfile.operatingHours}
                                    </Text>
                                )}
                            </View>
                        </View>

                        <View style={styles.ngoStats}>
                            <View style={styles.ngoStatItem}>
                                <Text style={styles.ngoStatValue}>{ngoProfile.capacity || 50}</Text>
                                <Text style={styles.ngoStatLabel}>Shelter Capacity</Text>
                            </View>
                        </View>

                        {ngoProfile.officeAddress && (
                            <View style={styles.addressRow}>
                                <Ionicons name="location" size={18} color="#7C3AED" />
                                <Text style={styles.addressText}>{ngoProfile.officeAddress}</Text>
                            </View>
                        )}

                        {/* Contact Buttons */}
                        <View style={styles.contactButtons}>
                            <Pressable style={styles.callButton} onPress={handleCall}>
                                <Ionicons name="call" size={20} color="#fff" />
                                <Text style={styles.callButtonText}>Call</Text>
                            </Pressable>
                            <Pressable style={styles.emailButton} onPress={handleEmail}>
                                <Ionicons name="mail" size={20} color="#7C3AED" />
                                <Text style={styles.emailButtonText}>Email</Text>
                            </Pressable>
                        </View>
                    </FloatingCard>
                )}

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Bottom CTA */}
            {post.status === 'available' && (
                <View style={styles.bottomCta}>
                    <Pressable style={styles.interestButton} onPress={handleInterest}>
                        <Ionicons name="heart" size={22} color="#fff" />
                        <Text style={styles.interestButtonText}>I'm Interested in Adopting</Text>
                    </Pressable>
                </View>
            )}

            {/* Contact Modal */}
            {ngoProfile && (
                <ContactModal
                    visible={showContactModal}
                    onClose={() => setShowContactModal(false)}
                    contactName={ngoProfile.organizationName}
                    phone={ngoProfile.officePhone}
                    email={ngoProfile.email}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.minimalist.bgLight,
    },
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
        color: colors.minimalist.textMedium,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    errorText: {
        fontSize: 16,
        color: colors.minimalist.textMedium,
        marginTop: spacing.md,
    },
    backButtonError: {
        marginTop: spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: '#7C3AED',
        borderRadius: 12,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    imageContainer: {
        width: SCREEN_WIDTH,
        height: 350,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 150,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: spacing.md,
        zIndex: 10,
    },
    backButtonBlur: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    statusBadge: {
        position: 'absolute',
        top: 50,
        right: spacing.md,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    nameOverlay: {
        position: 'absolute',
        bottom: spacing.lg,
        left: spacing.md,
        right: spacing.md,
    },
    animalName: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
    },
    animalBreed: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    quickInfo: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.minimalist.white,
        marginHorizontal: spacing.md,
        marginTop: -20,
        borderRadius: 16,
        padding: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    quickInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    quickInfoText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        textTransform: 'capitalize',
    },
    quickInfoDivider: {
        width: 1,
        height: 20,
        backgroundColor: colors.minimalist.borderLight,
        marginHorizontal: spacing.md,
    },
    section: {
        marginHorizontal: spacing.md,
        marginTop: spacing.md,
        padding: spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        gap: spacing.sm,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
    },
    infoValue: {
        flex: 1,
        fontSize: 14,
        color: colors.minimalist.textDark,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    tagText: {
        fontSize: 12,
        fontWeight: '600',
    },
    feeContainer: {
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: '#F3E8FF',
        borderRadius: 12,
    },
    feeAmount: {
        fontSize: 28,
        fontWeight: '700',
        color: '#7C3AED',
    },
    feeNote: {
        fontSize: 12,
        color: colors.minimalist.textMedium,
        marginTop: 4,
    },
    requirementsText: {
        fontSize: 14,
        color: colors.minimalist.textDark,
        lineHeight: 22,
    },
    ngoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    ngoLogo: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F3E8FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ngoInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    ngoNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    ngoName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.minimalist.textDark,
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    verifiedText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#059669',
    },
    ngoHours: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
        marginTop: 4,
    },
    ngoStats: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginBottom: spacing.md,
    },
    ngoStatItem: {
        alignItems: 'center',
    },
    ngoStatValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#7C3AED',
    },
    ngoStatLabel: {
        fontSize: 12,
        color: colors.minimalist.textMedium,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.minimalist.borderLight,
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        color: colors.minimalist.textDark,
        lineHeight: 20,
    },
    contactButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },
    callButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10B981',
        paddingVertical: spacing.md,
        borderRadius: 12,
        gap: spacing.sm,
    },
    callButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    emailButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3E8FF',
        paddingVertical: spacing.md,
        borderRadius: 12,
        gap: spacing.sm,
    },
    emailButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#7C3AED',
    },
    bottomSpacing: {
        height: 100,
    },
    bottomCta: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.minimalist.white,
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.minimalist.borderLight,
    },
    interestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#7C3AED',
        paddingVertical: spacing.md,
        borderRadius: 12,
        gap: spacing.sm,
    },
    interestButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
