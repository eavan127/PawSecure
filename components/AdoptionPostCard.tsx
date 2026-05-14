import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { FloatingCard } from './FloatingCard';
import { AdoptionPost, AdoptionStatus } from '../types';

interface AdoptionPostCardProps {
    post: AdoptionPost;
    onPress?: () => void;
    onInterested?: () => void;
}

export const AdoptionPostCard: React.FC<AdoptionPostCardProps> = ({
    post,
    onPress,
    onInterested,
}) => {
    const [isLiked, setIsLiked] = useState(false);
    const scaleAnim = new Animated.Value(1);

    const handleLike = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.3,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();

        setIsLiked(!isLiked);
        onInterested?.();
    };

    const getStatusBadge = (status: AdoptionStatus) => {
        switch (status) {
            case 'available':
                return { bg: '#D1FAE5', text: '#059669', label: 'Available' };
            case 'pending':
                return { bg: '#FEF3C7', text: '#D97706', label: 'Pending' };
            case 'adopted':
                return { bg: '#E0F2FE', text: '#0369A1', label: 'Adopted' };
        }
    };

    const statusConfig = getStatusBadge(post.status);

    return (
        <Pressable onPress={onPress}>
            {({ pressed }) => (
                <FloatingCard
                    shadow="soft"
                    style={[styles.card, pressed && styles.cardPressed]}
                >
                    {/* Image Section */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: post.photos[0] || 'https://via.placeholder.com/300' }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        {/* Status Badge */}
                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                            <Text style={[styles.statusText, { color: statusConfig.text }]}>
                                {statusConfig.label}
                            </Text>
                        </View>
                        {/* Like Button */}
                        <Pressable style={styles.likeButton} onPress={handleLike}>
                            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                <Ionicons
                                    name={isLiked ? 'heart' : 'heart-outline'}
                                    size={24}
                                    color={isLiked ? '#EF4444' : colors.minimalist.white}
                                />
                            </Animated.View>
                        </Pressable>
                    </View>

                    {/* Content Section */}
                    <View style={styles.content}>
                        {/* Name and Breed */}
                        <View style={styles.headerRow}>
                            <View style={styles.nameSection}>
                                <Text style={styles.name}>{post.name}</Text>
                                <Text style={styles.breed}>
                                    {post.breed} • {post.age}
                                </Text>
                            </View>
                            <View style={styles.genderBadge}>
                                <Ionicons
                                    name={post.gender === 'male' ? 'male' : 'female'}
                                    size={16}
                                    color={post.gender === 'male' ? '#3B82F6' : '#EC4899'}
                                />
                            </View>
                        </View>

                        {/* Health Tags */}
                        <View style={styles.tagsRow}>
                            {post.isVaccinated && (
                                <View style={[styles.tag, styles.vaccinatedTag]}>
                                    <Ionicons name="checkmark-circle" size={12} color="#059669" />
                                    <Text style={styles.vaccinatedText}>Vaccinated</Text>
                                </View>
                            )}
                            {post.isNeutered && (
                                <View style={[styles.tag, styles.neuteredTag]}>
                                    <Ionicons name="checkmark-circle" size={12} color="#6366F1" />
                                    <Text style={styles.neuteredText}>Neutered</Text>
                                </View>
                            )}
                        </View>

                        {/* Personality Traits */}
                        <View style={styles.traitsRow}>
                            {post.personalityTraits.slice(0, 3).map((trait, index) => (
                                <View key={index} style={styles.traitChip}>
                                    <Text style={styles.traitText}>
                                        {trait.charAt(0).toUpperCase() + trait.slice(1)}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <View style={styles.ngoInfo}>
                                <Ionicons name="business-outline" size={14} color={colors.minimalist.textMedium} />
                                <Text style={styles.ngoName}>{post.ngoName}</Text>
                            </View>
                            <View style={styles.engagement}>
                                <Ionicons name="heart" size={14} color={colors.minimalist.coral} />
                                <Text style={styles.engagementText}>{post.interestedCount}</Text>
                            </View>
                        </View>
                    </View>
                </FloatingCard>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: 0,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    cardPressed: {
        opacity: 0.95,
        transform: [{ scale: 0.98 }],
    },
    imageContainer: {
        position: 'relative',
        height: 180,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    statusBadge: {
        position: 'absolute',
        top: spacing.sm,
        left: spacing.sm,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    likeButton: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        padding: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    nameSection: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.minimalist.textDark,
    },
    breed: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        marginTop: 2,
    },
    genderBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.minimalist.bgLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tagsRow: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginBottom: spacing.sm,
    },
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    vaccinatedTag: {
        backgroundColor: '#D1FAE5',
    },
    vaccinatedText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#059669',
    },
    neuteredTag: {
        backgroundColor: '#E0E7FF',
    },
    neuteredText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#6366F1',
    },
    traitsRow: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    traitChip: {
        backgroundColor: colors.minimalist.peachLight,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    traitText: {
        fontSize: 12,
        color: colors.minimalist.coral,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.minimalist.border,
    },
    ngoInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ngoName: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
    },
    engagement: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    engagementText: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
        fontWeight: '600',
    },
});
