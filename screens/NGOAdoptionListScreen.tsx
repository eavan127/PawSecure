import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Image,
    RefreshControl,
    Animated,
    Dimensions,
    Platform,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { serifTextStyles } from '../theme/typography';
import { AdoptionPost, AdoptionStatus } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.lg * 2;

// Mock data - NGO's own posts only
const mockAdoptionPosts: AdoptionPost[] = [
    {
        id: '1',
        postId: 'ADOPT-2026-0001',
        name: 'Buddy',
        species: 'dog',
        breed: 'Golden Retriever',
        age: '2 years',
        gender: 'male',
        size: 'large',
        color: 'Golden',
        isVaccinated: true,
        isNeutered: true,
        isHealthy: true,
        personalityTraits: ['friendly', 'playful', 'active'],
        photos: ['https://images.unsplash.com/photo-1552053831-71594a27632d?w=600'],
        adoptionRequirements: 'Large yard preferred, active family',
        status: 'available',
        ngoId: 'ngo-1',
        ngoName: 'Happy Paws Shelter',
        interestedCount: 12,
        commentCount: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '2',
        postId: 'ADOPT-2026-0002',
        name: 'Whiskers',
        species: 'cat',
        breed: 'Persian',
        age: '1 year',
        gender: 'female',
        size: 'medium',
        color: 'White',
        isVaccinated: true,
        isNeutered: false,
        isHealthy: true,
        personalityTraits: ['calm', 'affectionate', 'independent'],
        photos: ['https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600'],
        adoptionRequirements: 'Indoor only home',
        status: 'pending',
        ngoId: 'ngo-1',
        ngoName: 'Happy Paws Shelter',
        interestedCount: 8,
        commentCount: 3,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '3',
        postId: 'ADOPT-2026-0003',
        name: 'Max',
        species: 'dog',
        breed: 'German Shepherd',
        age: '3 years',
        gender: 'male',
        size: 'large',
        color: 'Black & Tan',
        isVaccinated: true,
        isNeutered: true,
        isHealthy: true,
        personalityTraits: ['protective', 'active', 'friendly'],
        photos: ['https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600'],
        adoptionRequirements: 'Experienced dog owner',
        status: 'available',
        ngoId: 'ngo-1',
        ngoName: 'Happy Paws Shelter',
        interestedCount: 15,
        commentCount: 7,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: '4',
        postId: 'ADOPT-2026-0004',
        name: 'Luna',
        species: 'cat',
        breed: 'Tabby',
        age: '6 months',
        gender: 'female',
        size: 'small',
        color: 'Orange',
        isVaccinated: true,
        isNeutered: false,
        isHealthy: true,
        personalityTraits: ['playful', 'shy', 'affectionate'],
        photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600'],
        adoptionRequirements: 'Patient adopter, quiet home',
        status: 'adopted',
        ngoId: 'ngo-1',
        ngoName: 'Happy Paws Shelter',
        interestedCount: 20,
        commentCount: 10,
        createdAt: new Date(Date.now() - 604800000).toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

type StatusFilter = 'all' | AdoptionStatus;

const statusFilters: { key: StatusFilter; label: string; color: string; bgColor: string }[] = [
    { key: 'all', label: 'All', color: colors.minimalist.textDark, bgColor: colors.minimalist.bgLight },
    { key: 'available', label: 'Available', color: '#059669', bgColor: '#D1FAE5' },
    { key: 'pending', label: 'Pending', color: '#D97706', bgColor: '#FEF3C7' },
    { key: 'adopted', label: 'Adopted', color: '#6B7280', bgColor: '#F3F4F6' },
];

// Skeleton Card Component
const SkeletonCard: React.FC = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                Animated.timing(shimmerAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View style={[styles.skeletonCard, { opacity }]}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonContent}>
                <View style={styles.skeletonTitle} />
                <View style={styles.skeletonSubtitle} />
                <View style={styles.skeletonBadge} />
            </View>
        </Animated.View>
    );
};

// Adoption Post Card Component
const AdoptionCard: React.FC<{
    post: AdoptionPost;
    index: number;
    onEdit: () => void;
    onUpdateStatus: () => void;
    isNew?: boolean;
}> = ({ post, index, onEdit, onUpdateStatus, isNew }) => {
    const scaleAnim = useRef(new Animated.Value(isNew ? 0.9 : 1)).current;
    const opacityAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
    const glowAnim = useRef(new Animated.Value(isNew ? 1 : 0)).current;
    const translateY = useRef(new Animated.Value(isNew ? 30 : 0)).current;

    useEffect(() => {
        if (isNew) {
            Animated.parallel([
                Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }),
                Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
                    Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: false }),
                ]),
            ]).start();
        }
    }, [isNew]);

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
        ]).start();
    };

    const getStatusConfig = (status: AdoptionStatus) => {
        switch (status) {
            case 'available':
                return { color: '#166534', bg: '#BBF3DE', icon: 'checkmark-circle', label: 'Available' };
            case 'pending':
                return { color: '#92400E', bg: '#F9F8D9', icon: 'time', label: 'Pending' };
            case 'adopted':
                return { color: '#4D7C4D', bg: '#C7DEB1', icon: 'heart', label: 'Adopted' };
            default:
                return { color: '#6B7280', bg: '#F3F4F6', icon: 'help-circle', label: 'Unknown' };
        }
    };

    const statusConfig = getStatusConfig(post.status);

    const glowStyle = {
        shadowColor: '#A5E5ED',
        shadowOpacity: glowAnim,
        shadowRadius: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [8, 20],
        }),
    };

    return (
        <Animated.View
            style={[
                styles.cardContainer,
                {
                    transform: [{ scale: scaleAnim }, { translateY }],
                    opacity: opacityAnim,
                },
                isNew && glowStyle,
            ]}
        >
            <Pressable onPress={handlePress} style={styles.cardPressable}>
                {/* Image with Gradient Overlay */}
                <View style={styles.imageContainer}>
                    <Image source={{ uri: post.photos[0] }} style={styles.cardImage} resizeMode="cover" />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.imageGradient}
                    />

                    {/* Status Badge */}
                    <Animated.View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                        <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {statusConfig.label}
                        </Text>
                    </Animated.View>

                    {/* Animal Info Overlay */}
                    <View style={styles.imageOverlay}>
                        <Text style={styles.animalName}>{post.name}</Text>
                        <Text style={styles.animalBreed}>{post.breed} • {post.age}</Text>
                    </View>
                </View>

                {/* Card Actions */}
                <View style={styles.cardActions}>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Ionicons name="heart" size={16} color="#0891B2" />
                            <Text style={styles.statText}>{post.interestedCount} interested</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Ionicons name="chatbubble" size={14} color={colors.minimalist.textLight} />
                            <Text style={styles.statText}>{post.commentCount}</Text>
                        </View>
                    </View>

                    {post.status !== 'adopted' && (
                        <View style={styles.actionButtons}>
                            <Pressable
                                style={[styles.actionBtn, styles.actionBtnPrimary, styles.actionBtnFull]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    onUpdateStatus();
                                }}
                            >
                                <Ionicons name="sync-outline" size={18} color="#0891B2" />
                                <Text style={[styles.actionBtnText, styles.actionBtnTextPrimary]}>Update Status</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            </Pressable>
        </Animated.View>
    );
};

export const NGOAdoptionListScreen: React.FC = () => {
    const router = useRouter();
    const scrollViewRef = useRef<ScrollView>(null);
    const [posts, setPosts] = useState(mockAdoptionPosts);
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [newPostId, setNewPostId] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState<AdoptionPost | null>(null);

    // Filter indicator animation
    const indicatorPosition = useRef(new Animated.Value(0)).current;
    const successOpacity = useRef(new Animated.Value(0)).current;

    const filteredPosts = posts.filter(post =>
        statusFilter === 'all' || post.status === statusFilter
    );

    const handleFilterChange = (filter: StatusFilter, index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setStatusFilter(filter);

        // Animate indicator
        Animated.spring(indicatorPosition, {
            toValue: index * (SCREEN_WIDTH - spacing.lg * 2) / 4,
            friction: 8,
            tension: 80,
            useNativeDriver: true,
        }).start();
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRefreshing(false);
    };

    const handleCreatePost = () => {
        router.push('/ngo-create-adoption');
    };

    const handleUpdateStatus = (postId: string, newStatus: AdoptionStatus) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPosts(posts.map(post =>
            post.id === postId
                ? { ...post, status: newStatus, updatedAt: new Date().toISOString() }
                : post
        ));
        setShowStatusModal(false);
        setSelectedPost(null);

        // Show success feedback
        setShowSuccess(true);
        Animated.sequence([
            Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.delay(2000),
            Animated.timing(successOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => setShowSuccess(false));
    };

    const openStatusModal = (post: AdoptionPost) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedPost(post);
        setShowStatusModal(true);
    };

    // Simulate new post creation success
    const simulateNewPost = () => {
        const newPost: AdoptionPost = {
            id: Date.now().toString(),
            postId: `ADOPT-2026-${String(posts.length + 1).padStart(4, '0')}`,
            name: 'New Pet',
            species: 'dog',
            breed: 'Mixed Breed',
            age: '1 year',
            gender: 'male',
            size: 'medium',
            color: 'Brown',
            isVaccinated: true,
            isNeutered: false,
            isHealthy: true,
            personalityTraits: ['friendly'],
            photos: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600'],
            adoptionRequirements: 'Loving home',
            status: 'available',
            ngoId: 'ngo-1',
            ngoName: 'Happy Paws Shelter',
            interestedCount: 0,
            commentCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        setNewPostId(newPost.id);
        setPosts([newPost, ...posts]);
        setShowSuccess(true);

        // Show success message
        Animated.sequence([
            Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.delay(2500),
            Animated.timing(successOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start(() => {
            setShowSuccess(false);
            setNewPostId(null);
        });

        // Scroll to top
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Adoption Posts</Text>
                <Text style={styles.headerSubtitle}>{filteredPosts.length} animals looking for homes</Text>
            </View>

            {/* Success Toast */}
            {showSuccess && (
                <Animated.View style={[styles.successToast, { opacity: successOpacity }]}>
                    <Text style={styles.successEmoji}>🐾</Text>
                    <Text style={styles.successText}>New adoption post published successfully!</Text>
                </Animated.View>
            )}

            {/* Status Filter Tabs */}
            <View style={styles.filterContainer}>
                <View style={styles.filterTabs}>
                    <Animated.View
                        style={[
                            styles.filterIndicator,
                            { transform: [{ translateX: indicatorPosition }] },
                        ]}
                    />
                    {statusFilters.map((filter, index) => (
                        <Pressable
                            key={filter.key}
                            style={styles.filterTab}
                            onPress={() => handleFilterChange(filter.key, index)}
                        >
                            <Text
                                style={[
                                    styles.filterTabText,
                                    statusFilter === filter.key && styles.filterTabTextActive,
                                ]}
                            >
                                {filter.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>

            {/* Posts List */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#0891B2"
                    />
                }
            >
                {isLoading ? (
                    // Skeleton Loading
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : filteredPosts.length === 0 ? (
                    // Empty State
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIllustration}>
                            <Text style={styles.emptyEmoji}>🐾</Text>
                        </View>
                        <Text style={styles.emptyTitle}>No adoption posts yet</Text>
                        <Text style={styles.emptyText}>
                            Let's help an animal find a home 💛
                        </Text>
                        <Pressable style={styles.emptyButton} onPress={handleCreatePost}>
                            <LinearGradient
                                colors={['#A5E5ED', '#BBF3DE']}
                                style={styles.emptyButtonGradient}
                            >
                                <Ionicons name="add" size={20} color="#fff" />
                                <Text style={styles.emptyButtonText}>Create First Post</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                ) : (
                    // Posts List
                    filteredPosts.map((post, index) => (
                        <AdoptionCard
                            key={post.id}
                            post={post}
                            index={index}
                            isNew={post.id === newPostId}
                            onEdit={() => { }}
                            onUpdateStatus={() => openStatusModal(post)}
                        />
                    ))
                )}

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* FAB - Create New Post */}
            <Pressable
                style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
                onPress={handleCreatePost}
            >
                <LinearGradient
                    colors={['#A5E5ED', '#BBF3DE']}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                </LinearGradient>
            </Pressable>

            {/* Status Update Modal */}
            <Modal
                visible={showStatusModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowStatusModal(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowStatusModal(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Status</Text>
                        {selectedPost && (
                            <Text style={styles.modalSubtitle}>
                                {selectedPost.name} • Current: {selectedPost.status}
                            </Text>
                        )}

                        <View style={styles.statusOptions}>
                            <Pressable
                                style={[styles.statusOption, styles.statusAvailable]}
                                onPress={() => selectedPost && handleUpdateStatus(selectedPost.id, 'available')}
                            >
                                <View style={[styles.statusDot, { backgroundColor: '#166534' }]} />
                                <Text style={styles.statusOptionText}>Available</Text>
                                <Text style={styles.statusDesc}>Ready for adoption</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.statusOption, styles.statusPending]}
                                onPress={() => selectedPost && handleUpdateStatus(selectedPost.id, 'pending')}
                            >
                                <View style={[styles.statusDot, { backgroundColor: '#92400E' }]} />
                                <Text style={styles.statusOptionText}>Pending</Text>
                                <Text style={styles.statusDesc}>Adoption in progress</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.statusOption, styles.statusAdopted]}
                                onPress={() => selectedPost && handleUpdateStatus(selectedPost.id, 'adopted')}
                            >
                                <View style={[styles.statusDot, { backgroundColor: '#4D7C4D' }]} />
                                <Text style={styles.statusOptionText}>Adopted</Text>
                                <Text style={styles.statusDesc}>Found a home! 🎉</Text>
                            </Pressable>
                        </View>

                        <Pressable
                            style={styles.modalCancel}
                            onPress={() => setShowStatusModal(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAFBFC',
    },
    header: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        backgroundColor: '#fff',
    },
    headerTitle: {
        ...serifTextStyles.serifSubheading,
        fontSize: 22,
        color: colors.minimalist.textDark,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.minimalist.textLight,
        marginTop: 2,
    },
    successToast: {
        position: 'absolute',
        top: 100,
        left: spacing.lg,
        right: spacing.lg,
        backgroundColor: '#D1FAE5',
        borderRadius: 16,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 100,
        ...Platform.select({
            ios: { shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12 },
            android: { elevation: 8 },
        }),
    },
    successEmoji: {
        fontSize: 20,
        marginRight: spacing.sm,
    },
    successText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
    },
    filterContainer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.lg,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    filterTabs: {
        flexDirection: 'row',
        backgroundColor: 'rgba(165, 229, 237, 0.4)',
        borderRadius: 14,
        padding: 2,
        position: 'relative',
    },
    filterIndicator: {
        position: 'absolute',
        top: 2,
        left: 2,
        width: (SCREEN_WIDTH - spacing.xl * 2 - 4) / 4,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 12,
        ...Platform.select({
            ios: {
                shadowColor: '#0891B2',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8
            },
            android: { elevation: 4 },
        }),
    },
    filterTab: {
        flex: 1,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    filterTabText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.minimalist.textLight,
    },
    filterTabTextActive: {
        color: '#0891B2',
    },
    filterDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.xl,
    },
    // Adoption Card
    cardContainer: {
        marginBottom: spacing.xxl,
        borderRadius: 20,
        backgroundColor: '#fff',
        overflow: 'hidden',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16 },
            android: { elevation: 4 },
        }),
    },
    cardPressable: {
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        height: 200,
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    imageGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    statusBadge: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: spacing.md,
        left: spacing.md,
    },
    animalName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    animalBreed: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 2,
    },
    cardActions: {
        padding: spacing.md,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        marginBottom: spacing.md,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
    },
    actionBtnPrimary: {
        backgroundColor: 'rgba(165, 229, 237, 0.25)',
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
    },
    actionBtnTextPrimary: {
        color: '#0891B2',
    },
    actionBtnFull: {
        flex: undefined,
        width: '100%',
    },
    // Skeleton Styles
    skeletonCard: {
        height: 280,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        marginBottom: spacing.lg,
        overflow: 'hidden',
    },
    skeletonImage: {
        height: 200,
        backgroundColor: '#E5E7EB',
    },
    skeletonContent: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    skeletonTitle: {
        height: 20,
        width: '60%',
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    skeletonSubtitle: {
        height: 14,
        width: '40%',
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    skeletonBadge: {
        height: 28,
        width: 80,
        backgroundColor: '#E5E7EB',
        borderRadius: 14,
    },
    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIllustration: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    emptyEmoji: {
        fontSize: 48,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        marginBottom: spacing.xs,
    },
    emptyText: {
        fontSize: 15,
        color: colors.minimalist.textMedium,
        marginBottom: spacing.xl,
    },
    emptyButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    emptyButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
    },
    emptyButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    bottomSpacing: {
        height: 100,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        borderRadius: 28,
        ...Platform.select({
            ios: { shadowColor: '#A5E5ED', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 12 },
            android: { elevation: 8 },
        }),
    },
    fabPressed: {
        transform: [{ scale: 0.95 }],
    },
    fabGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: spacing.xl,
        width: '100%',
        maxWidth: 340,
    },
    modalTitle: {
        ...serifTextStyles.serifSubheading,
        fontSize: 20,
        color: colors.minimalist.textDark,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        color: colors.minimalist.textLight,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: spacing.lg,
    },
    statusOptions: {
        gap: spacing.sm,
    },
    statusOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 16,
        gap: spacing.md,
    },
    statusAvailable: {
        backgroundColor: '#BBF3DE',
    },
    statusPending: {
        backgroundColor: '#F9F8D9',
    },
    statusAdopted: {
        backgroundColor: '#C7DEB1',
    },
    statusDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    statusOptionText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        flex: 1,
    },
    statusDesc: {
        fontSize: 12,
        color: colors.minimalist.textLight,
    },
    modalCancel: {
        marginTop: spacing.lg,
        padding: spacing.md,
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.minimalist.textLight,
    },
});

export default NGOAdoptionListScreen;
