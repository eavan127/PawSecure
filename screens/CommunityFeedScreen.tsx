import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Animated, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { serifTextStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { FloatingCard } from '../components/FloatingCard';
import { MinimalistStatusBadge } from '../components/MinimalistStatusBadge';
import { useAuth } from '../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CommunityFeedScreenProps {
    navigation: any;
}

const communityPosts = [
    {
        id: '1',
        type: 'lost',
        animal: 'Golden Retriever Mix, "Rusty"',
        description: 'Wearing a red bandana. Friendly but shy. Last seen near Central Park entrance.',
        location: 'Today, 8:30 AM',
        image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=600&fit=crop', // Real Golden Retriever
        verified: false
    },
    {
        id: '2',
        type: 'found',
        animal: 'Stray Calico Cat',
        description: 'Found sheltering under a car. Has a notched ear (neutered). Currently at City Animal Shelter.',
        location: 'Yesterday, 6:15 PM',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&fit=crop', // Real Cat
        verified: true
    },
    {
        id: '3',
        type: 'lost',
        animal: 'Black Lab, "Shadow"',
        description: 'Very energetic, loves balls. Slipped collar near the river.',
        location: 'Oct 24, 2:50 PM',
        image: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600&fit=crop', // Real Black Dog
        verified: false
    },
    {
        id: '4',
        type: 'found',
        animal: 'Scruffy Terrier Mix',
        description: 'Found wandering near the market. No chip detected. Safe with foster family.',
        location: 'Oct 24, 9:00 AM',
        image: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9205?w=600&fit=crop', // Scruffy stray dog
        verified: true
    },
];

export const CommunityFeedScreen: React.FC<CommunityFeedScreenProps> = ({ navigation }) => {
    const { user } = useAuth();
    const isNGO = user?.role === 'ngo';
    const [activeFilter, setActiveFilter] = useState('Lost');

    const filters = ['Lost', 'Found', 'Nearby'];

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={isNGO ? styles.header : undefined}>
                    <Text style={styles.headerTitle}>Community & Lost Pets</Text>
                    {isNGO && (
                        <Text style={styles.headerSubtitle}>Browse sightings and community posts</Text>
                    )}
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterRow}>
                    <Animated.View
                        style={[
                            styles.slidingIndicator,
                            {
                                transform: [{
                                    translateX: useRef(new Animated.Value(0)).current.interpolate({
                                        inputRange: [0, 1, 2],
                                        outputRange: [0, (SCREEN_WIDTH - spacing.xl * 2 - spacing.md * 2) / 3 + 12, ((SCREEN_WIDTH - spacing.xl * 2 - spacing.md * 2) / 3 + 12) * 2]
                                    })
                                }]
                            },
                        ]}
                    />
                    {filters.map((filter, index) => (
                        <Pressable
                            key={filter}
                            style={styles.filterTab}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setActiveFilter(filter);
                                // For simplicity in this demo, we'll use a direct state update for the active filter
                                // In a full implementation, we'd animate the indicator position
                            }}
                        >
                            <Text style={[
                                styles.filterText,
                                activeFilter === filter && styles.filterTextActive,
                                activeFilter === filter && isNGO && { color: '#0891B2' }
                            ]}>
                                {filter}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* Community Feed */}
                {communityPosts.map((post) => (
                    <FloatingCard
                        key={post.id}
                        style={[
                            styles.postCard,
                            {
                                backgroundColor: post.verified
                                    ? (isNGO ? '#BBF3DE' : colors.minimalist.peachLight)
                                    : colors.minimalist.white
                            }
                        ]}
                        shadow="soft"
                    >
                        <View style={styles.postContent}>
                            {/* Post Image */}
                            <Image
                                source={{ uri: post.image }}
                                style={styles.postImage}
                                resizeMode="cover"
                            />

                            {/* Post Details */}
                            <View style={styles.postDetails}>
                                {/* Badge Row */}
                                <View style={styles.badgeRow}>
                                    <MinimalistStatusBadge
                                        label={post.type.toUpperCase()}
                                        variant={post.type as 'lost' | 'found'}
                                    />
                                    {post.verified && (
                                        <MinimalistStatusBadge
                                            label="Verified"
                                            variant="verified"
                                            icon="checkmark-circle"
                                        />
                                    )}
                                </View>

                                {/* Animal Description */}
                                <Text style={styles.animalText}>{post.animal}</Text>
                                <Text style={styles.descriptionText}>{post.description}</Text>

                                {/* Location and Time */}
                                <View style={styles.metaRow}>
                                    <Ionicons name="location-outline" size={16} color={colors.minimalist.textLight} />
                                    <Text style={styles.metaText}>{post.location}</Text>
                                </View>

                                {/* Contact Button */}
                                <View style={[styles.contactButton, isNGO && { backgroundColor: '#A5E5ED' }]}>
                                    <Ionicons
                                        name="chatbubble-ellipses"
                                        size={16}
                                        color={isNGO ? '#0891B2' : colors.minimalist.white}
                                    />
                                    <Text style={[styles.contactButtonText, isNGO && { color: '#0891B2' }]}>
                                        {post.verified ? 'Contact Shelter' : 'Contact Reporter'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </FloatingCard>
                ))}

                {/* Footer Spacing */}
                <View style={styles.footer} />
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
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xxl,
    },
    headerTitle: {
        ...serifTextStyles.serifHeading,
        color: colors.minimalist.textDark,
        fontSize: 28,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.minimalist.textLight,
        marginBottom: spacing.lg,
    },
    header: {
        marginBottom: spacing.xl,
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: spacing.xxl,
        backgroundColor: 'rgba(165, 229, 237, 0.4)',
        borderRadius: 14,
        padding: 4,
        position: 'relative',
    },
    slidingIndicator: {
        position: 'absolute',
        top: 4,
        left: 4,
        width: (SCREEN_WIDTH - spacing.xl * 2 - 40) / 3, // Approximate width
        height: 36,
        backgroundColor: '#fff',
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#0891B2',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.1,
                shadowRadius: 6
            },
            android: { elevation: 3 },
        }),
    },
    filterTab: {
        flex: 1,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        zIndex: 1,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.minimalist.textMedium,
    },
    filterTextActive: {
        color: colors.minimalist.textDark,
    },
    postCard: {
        marginBottom: spacing.xl,
        padding: 0,
        overflow: 'hidden',
    },
    postContent: {
        flexDirection: 'row',
    },
    postImage: {
        width: 100,
        height: 100,
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    postDetails: {
        flex: 1,
        padding: spacing.lg,
    },
    badgeRow: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    animalText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: 4,
    },
    descriptionText: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        lineHeight: 20,
        marginBottom: spacing.sm,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    metaText: {
        fontSize: 13,
        color: colors.minimalist.textLight,
        marginLeft: 4,
    },
    contactButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.minimalist.coral,
        paddingVertical: spacing.sm,
        borderRadius: 12,
    },
    contactButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.white,
        marginLeft: 6,
    },
    footer: {
        height: spacing.xxl,
    },
});
