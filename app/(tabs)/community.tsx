import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Animated,
    Dimensions,
    Modal,
    TextInput,
    Platform,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAuth } from '../../contexts/AuthContext';
import { NGOAdoptionListScreen } from '../../screens/NGOAdoptionListScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type FilterType = 'all' | 'missing' | 'found' | 'adoption' | 'nearby';
type MessageType = 'missing' | 'found' | 'adoption' | 'chat';
type UserRole = 'citizen' | 'ngo' | 'shelter';

interface CommunityMessage {
    id: string;
    type: MessageType;
    user: {
        name: string;
        role: UserRole;
        avatar?: string;
        verified?: boolean;
    };
    pet?: {
        name: string;
        breed: string;
        color: string;
        size: string;
        age?: string;
        gender?: string;
        vaccinated?: boolean;
        image?: string;
    };
    location?: {
        name: string;
        distance: string;
        lastSeen?: string;
    };
    content: string;
    timestamp: string;
    replies?: number;
    isEmergency?: boolean;
    isPinned?: boolean;
}

const mockMessages: CommunityMessage[] = [
    {
        id: '1',
        type: 'missing',
        user: { name: 'Sarah Chen', role: 'citizen' },
        pet: { name: 'Max', breed: 'Golden Retriever', color: 'Golden', size: 'Large', image: '🐕' },
        location: { name: 'Marina Bay', distance: '3km', lastSeen: '2 hours ago' },
        content: 'Please help! Max went missing near Marina Bay playground. He\'s wearing a red collar with a bone tag. Very friendly and responds to treats. 🙏',
        timestamp: '2h ago',
        replies: 5,
        isEmergency: true,
    },
    {
        id: '2',
        type: 'found',
        user: { name: 'SPCA Singapore', role: 'shelter', verified: true },
        pet: { name: 'Unknown', breed: 'Orange Tabby', color: 'Orange', size: 'Medium', image: '🐱' },
        location: { name: 'Orchard Road', distance: '5km' },
        content: 'Found this friendly tabby cat wandering near Orchard MRT. Now safe at our facility. Please contact us if this is your cat! 😺',
        timestamp: '5h ago',
        replies: 12,
    },
    {
        id: '3',
        type: 'adoption',
        user: { name: 'Paws & Hearts', role: 'ngo', verified: true },
        pet: { name: 'Luna', breed: 'Mixed Breed', color: 'Black & White', size: 'Small', age: '2 years', gender: 'Female', vaccinated: true, image: '🐶' },
        location: { name: 'Tampines', distance: '8km' },
        content: 'Luna is ready for her forever home! 🏠 Fully vaccinated, neutered, and loves cuddles. Perfect for families. ❤️',
        timestamp: '1d ago',
        replies: 23,
    },
];

const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'missing', label: 'Missing' },
    { key: 'found', label: 'Found' },
    { key: 'adoption', label: 'Adoption' },
];

export default function CommunityScreen() {
    const router = useRouter();
    const { user } = useAuth();

    // All hooks MUST be declared before any conditional returns
    const scrollViewRef = useRef<ScrollView>(null);
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const [messages] = useState<CommunityMessage[]>(mockMessages);
    const [showNewPostModal, setShowNewPostModal] = useState(false);
    const [isLive, setIsLive] = useState(true);

    // Animations
    const messageAnimations = useRef(messages.map(() => new Animated.Value(0))).current;
    const bellPulse = useRef(new Animated.Value(1)).current;
    const livePulse = useRef(new Animated.Value(1)).current;
    const headerIconScale = useRef(new Animated.Value(1)).current;
    const bannerFade = useRef(new Animated.Value(0)).current;
    const [isScrolled, setIsScrolled] = useState(false);

    // If user is NGO, show the NGO Adoption List screen
    // (moved after hooks to comply with Rules of Hooks)
    if (user?.role === 'ngo') {
        return <NGOAdoptionListScreen />;
    }

    useEffect(() => {
        // Stagger message entry
        Animated.stagger(100, messageAnimations.map(anim =>
            Animated.spring(anim, {
                toValue: 1,
                friction: 8,
                tension: 50,
                useNativeDriver: true,
            })
        )).start();

        // Bell pulse once on load
        Animated.sequence([
            Animated.timing(bellPulse, { toValue: 1.15, duration: 200, useNativeDriver: true }),
            Animated.timing(bellPulse, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();

        // Live indicator single pulse on load
        Animated.sequence([
            Animated.timing(livePulse, { toValue: 1.3, duration: 300, useNativeDriver: true }),
            Animated.timing(livePulse, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();

        // Banner fade in
        Animated.timing(bannerFade, {
            toValue: 1,
            duration: 400,
            delay: 200,
            useNativeDriver: true,
        }).start();
    }, []);

    const filteredMessages = messages.filter(msg => {
        if (selectedFilter === 'all') return true;
        if (selectedFilter === 'nearby') return parseFloat(msg.location?.distance || '999') <= 5;
        return msg.type === selectedFilter;
    });

    const handleFilterPress = (filter: FilterType) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedFilter(filter);
    };

    const handleIconPress = (callback?: () => void) => {
        Animated.sequence([
            Animated.timing(headerIconScale, { toValue: 0.85, duration: 100, useNativeDriver: true }),
            Animated.timing(headerIconScale, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        callback?.();
    };

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        setIsScrolled(scrollY > 10);
    };

    const getStatusConfig = (type: MessageType) => {
        switch (type) {
            case 'missing':
                return { label: 'MISSING', color: '#DC2626', bgColor: 'rgba(220, 38, 38, 0.08)', glowColor: 'rgba(220, 38, 38, 0.15)' };
            case 'found':
                return { label: 'FOUND', color: '#059669', bgColor: 'rgba(5, 150, 105, 0.08)', glowColor: 'rgba(5, 150, 105, 0.15)' };
            case 'adoption':
                return { label: 'ADOPT', color: '#7C3AED', bgColor: 'rgba(124, 58, 237, 0.08)', glowColor: 'rgba(124, 58, 237, 0.15)' };
            default:
                return { label: 'CHAT', color: '#6B7280', bgColor: 'rgba(107, 114, 128, 0.08)', glowColor: 'rgba(107, 114, 128, 0.15)' };
        }
    };

    const renderMessageCard = (message: CommunityMessage, index: number) => {
        const statusConfig = getStatusConfig(message.type);
        const animation = messageAnimations[index] || new Animated.Value(1);

        // Trigger haptic for urgent posts
        if (message.isEmergency && index === 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }

        return (
            <Animated.View
                key={message.id}
                style={{
                    opacity: animation,
                    transform: [{
                        translateY: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [40, 0],
                        }),
                    }],
                }}
            >
                <Pressable
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        // Navigate based on post type
                        if (message.type === 'adoption') {
                            router.push({ pathname: '/adoption-detail', params: { postId: message.id } });
                        } else {
                            router.push({ pathname: '/animal-profile', params: { id: message.id } });
                        }
                    }}
                    style={({ pressed }) => [
                        styles.messageCard,
                        message.isEmergency && styles.emergencyCard,
                        pressed && styles.cardPressed,
                    ]}
                >
                    {/* Urgent Badge - Softer */}
                    {message.isEmergency && (
                        <LinearGradient
                            colors={['#FCA5A5', '#EF4444']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.urgentBadge}
                        >
                            <Text style={styles.urgentBadgeText}>URGENT</Text>
                        </LinearGradient>
                    )}

                    {/* Header */}
                    <View style={styles.messageHeader}>
                        <View style={styles.userInfo}>
                            <View style={[
                                styles.avatar,
                                message.user.role === 'shelter' && styles.avatarShelter,
                                message.user.role === 'ngo' && styles.avatarNgo,
                            ]}>
                                {message.user.role === 'citizen' ? (
                                    <Ionicons name="person" size={16} color={colors.minimalist.textMedium} />
                                ) : (
                                    <Ionicons name="shield-checkmark" size={16} color="#fff" />
                                )}
                            </View>
                            <View>
                                <View style={styles.nameRow}>
                                    <Text style={styles.userName}>{message.user.name}</Text>
                                    {message.user.verified && (
                                        <Ionicons name="checkmark-circle" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
                                    )}
                                </View>
                                <Text style={styles.userRole}>
                                    {message.user.role === 'citizen' ? 'Citizen' :
                                        message.user.role === 'ngo' ? 'Verified NGO' : 'Verified Shelter'}
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
                            <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
                            <Text style={[styles.statusText, { color: statusConfig.color }]}>
                                {statusConfig.label}
                            </Text>
                        </View>
                    </View>

                    {/* Pet Image */}
                    {message.pet && (
                        <View style={styles.petImageContainer}>
                            <View style={styles.petImage}>
                                <Text style={styles.petEmoji}>{message.pet.image}</Text>
                            </View>
                            {message.type === 'adoption' && message.pet.vaccinated && (
                                <View style={styles.vaccinatedBadge}>
                                    <Ionicons name="checkmark" size={10} color="#fff" />
                                    <Text style={styles.vaccinatedText}>Vaccinated</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Pet Info */}
                    {message.pet && (
                        <View style={styles.petInfo}>
                            <Text style={styles.petName}>{message.pet.name}</Text>
                            <View style={styles.petTags}>
                                <View style={styles.petTag}>
                                    <Text style={styles.petTagText}>{message.pet.breed}</Text>
                                </View>
                                <View style={styles.petTag}>
                                    <Text style={styles.petTagText}>{message.pet.color}</Text>
                                </View>
                                <View style={styles.petTag}>
                                    <Text style={styles.petTagText}>{message.pet.size}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Content */}
                    <Text style={styles.messageContent}>{message.content}</Text>

                    {/* Location & Time */}
                    <View style={styles.metaRow}>
                        {message.location && (
                            <View style={styles.locationInfo}>
                                <Ionicons name="location" size={13} color={colors.minimalist.coral} />
                                <Text style={styles.locationText}>
                                    {message.location.name} · {message.location.distance}
                                </Text>
                            </View>
                        )}
                        <Text style={styles.timestamp}>{message.timestamp}</Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsRow}>
                        <Pressable style={styles.actionButton}>
                            <Ionicons name="chatbubble-outline" size={16} color={colors.minimalist.textLight} />
                            <Text style={styles.actionText}>{message.replies || 0}</Text>
                        </Pressable>
                        <Pressable style={styles.actionButton}>
                            <Ionicons name="share-outline" size={16} color={colors.minimalist.textLight} />
                        </Pressable>
                        <Pressable style={styles.actionButton}>
                            <Ionicons name="bookmark-outline" size={16} color={colors.minimalist.textLight} />
                        </Pressable>
                        <Pressable
                            style={styles.contactAction}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            }}
                        >
                            <Text style={styles.contactActionText}>Contact</Text>
                            <Ionicons name="arrow-forward" size={14} color="#fff" />
                        </Pressable>
                    </View>
                </Pressable>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            {/* Header - Premium Frosted Glass */}
            {Platform.OS === 'ios' && isScrolled ? (
                <BlurView intensity={80} tint="light" style={styles.headerBlur}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerTop}>
                            <View style={styles.titleRow}>
                                <Text style={styles.title}>Community</Text>
                                {isLive && (
                                    <Animated.View style={[styles.liveBadge, { transform: [{ scale: livePulse }] }]}>
                                        <View style={styles.liveDot} />
                                        <Text style={styles.liveText}>LIVE</Text>
                                    </Animated.View>
                                )}
                            </View>
                            <View style={styles.headerActions}>
                                <Pressable style={styles.headerButton} onPress={() => handleIconPress()}>
                                    <Ionicons name="search-outline" size={18} color={colors.minimalist.textDark} />
                                </Pressable>
                                <Pressable style={styles.headerButton} onPress={() => handleIconPress()}>
                                    <Ionicons name="notifications-outline" size={18} color={colors.minimalist.textDark} />
                                    <View style={styles.notificationDot} />
                                </Pressable>
                            </View>
                        </View>
                        {/* Filter Tabs - Segmented Control */}
                        <View style={styles.filterContainer}>
                            {filters.map((filter, index) => (
                                <Pressable
                                    key={filter.key}
                                    onPress={() => handleFilterPress(filter.key)}
                                    style={({ pressed }) => [
                                        styles.filterTab,
                                        selectedFilter === filter.key && styles.filterTabActive,
                                        pressed && styles.filterTabPressed,
                                    ]}
                                >
                                    <Text style={[
                                        styles.filterText,
                                        selectedFilter === filter.key && styles.filterTextActive,
                                    ]}>
                                        {filter.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </BlurView>
            ) : (
                <View style={[styles.header, isScrolled && styles.headerScrolled]}>
                    <View style={styles.headerContent}>
                        <View style={styles.headerTop}>
                            <View style={styles.titleRow}>
                                <Text style={styles.title}>Community</Text>
                                {isLive && (
                                    <Animated.View style={[styles.liveBadge, { transform: [{ scale: livePulse }] }]}>
                                        <View style={styles.liveDot} />
                                        <Text style={styles.liveText}>LIVE</Text>
                                    </Animated.View>
                                )}
                            </View>
                            <View style={styles.headerActions}>
                                <Pressable style={styles.headerButton} onPress={() => handleIconPress()}>
                                    <Ionicons name="search-outline" size={18} color={colors.minimalist.textDark} />
                                </Pressable>
                                <Pressable style={styles.headerButton} onPress={() => handleIconPress()}>
                                    <Ionicons name="notifications-outline" size={18} color={colors.minimalist.textDark} />
                                    <View style={styles.notificationDot} />
                                </Pressable>
                            </View>
                        </View>
                        {/* Filter Tabs - Segmented Control */}
                        <View style={styles.filterContainer}>
                            {filters.map((filter, index) => (
                                <Pressable
                                    key={filter.key}
                                    onPress={() => handleFilterPress(filter.key)}
                                    style={({ pressed }) => [
                                        styles.filterTab,
                                        selectedFilter === filter.key && styles.filterTabActive,
                                        pressed && styles.filterTabPressed,
                                    ]}
                                >
                                    <Text style={[
                                        styles.filterText,
                                        selectedFilter === filter.key && styles.filterTextActive,
                                    ]}>
                                        {filter.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </View>
            )}

            {/* Messages Feed */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.feed}
                contentContainerStyle={styles.feedContent}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Emergency Banner - Refined */}
                <Animated.View style={[styles.emergencyBanner, { opacity: bannerFade }]}>
                    <Animated.View style={{ transform: [{ scale: bellPulse }] }}>
                        <Ionicons name="flash" size={14} color={colors.minimalist.coral} />
                    </Animated.View>
                    <Text style={styles.emergencyBannerText}>
                        Emergency Boost active · Missing pets prioritized
                    </Text>
                </Animated.View>

                {filteredMessages.map((message, index) => renderMessageCard(message, index))}

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Floating New Post Button - Refined */}
            <Pressable
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowNewPostModal(true);
                }}
                style={({ pressed }) => [
                    styles.fabButton,
                    pressed && styles.fabPressed,
                ]}
            >
                <LinearGradient
                    colors={['#FFB088', '#FF8C5A']}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={26} color="#fff" />
                </LinearGradient>
            </Pressable>

            {/* New Post Modal */}
            <Modal
                visible={showNewPostModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowNewPostModal(false)}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Pressable onPress={() => setShowNewPostModal(false)}>
                            <Text style={styles.modalCancel}>Cancel</Text>
                        </Pressable>
                        <Text style={styles.modalTitle}>New Post</Text>
                        <Pressable style={styles.modalPostButton}>
                            <Text style={styles.modalPostText}>Post</Text>
                        </Pressable>
                    </View>

                    <View style={styles.postTypeSelector}>
                        <Pressable style={[styles.postTypeButton, styles.postTypeActive]}>
                            <Text style={styles.postTypeIcon}>🔴</Text>
                            <Text style={styles.postTypeLabel}>Missing</Text>
                        </Pressable>
                        <Pressable style={styles.postTypeButton}>
                            <Text style={styles.postTypeIcon}>🟢</Text>
                            <Text style={styles.postTypeLabel}>Found</Text>
                        </Pressable>
                        <Pressable style={styles.postTypeButton}>
                            <Text style={styles.postTypeIcon}>💬</Text>
                            <Text style={styles.postTypeLabel}>Update</Text>
                        </Pressable>
                    </View>

                    <TextInput
                        style={styles.postInput}
                        placeholder="What's happening? Share a sighting, ask for help..."
                        placeholderTextColor={colors.minimalist.textLight}
                        multiline
                        autoFocus
                    />

                    <View style={styles.postActions}>
                        <Pressable style={styles.postActionButton}>
                            <Ionicons name="camera-outline" size={22} color={colors.minimalist.coral} />
                            <Text style={styles.postActionText}>Photo</Text>
                        </Pressable>
                        <Pressable style={styles.postActionButton}>
                            <Ionicons name="location-outline" size={22} color={colors.minimalist.coral} />
                            <Text style={styles.postActionText}>Location</Text>
                        </Pressable>
                        <Pressable style={styles.postActionButton}>
                            <Ionicons name="paw-outline" size={22} color={colors.minimalist.coral} />
                            <Text style={styles.postActionText}>Pet Info</Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        paddingTop: spacing.sm,
        paddingBottom: spacing.xs,
        backgroundColor: '#FAFAFA',
    },
    headerScrolled: {
        backgroundColor: 'rgba(250, 250, 250, 0.95)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
            },
            android: { elevation: 2 },
        }),
    },
    headerBlur: {
        paddingTop: spacing.sm,
        paddingBottom: spacing.xs,
    },
    headerContent: {
        paddingHorizontal: spacing.xl,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        letterSpacing: -0.3,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    liveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
    },
    liveDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#22C55E',
    },
    liveText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#22C55E',
        letterSpacing: 0.5,
    },
    headerActions: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    headerButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#EF4444',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        gap: spacing.sm,
    },
    filterTab: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 16,
    },
    filterTabActive: {
        backgroundColor: colors.minimalist.textDark,
    },
    filterTabPressed: {
        opacity: 0.7,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.minimalist.textLight,
    },
    filterTextActive: {
        color: colors.minimalist.white,
        fontWeight: '600',
    },
    feed: {
        flex: 1,
    },
    feedContent: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xs,
    },
    emergencyBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: 'rgba(245, 164, 145, 0.08)',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 2,
        borderRadius: 10,
        marginBottom: spacing.md,
    },
    emergencyBannerText: {
        flex: 1,
        fontSize: 12,
        color: colors.minimalist.textMedium,
        fontWeight: '500',
    },
    messageCard: {
        backgroundColor: colors.minimalist.white,
        borderRadius: 16,
        padding: spacing.md + 2,
        marginBottom: spacing.md,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 10,
            },
            android: { elevation: 2 },
        }),
    },
    emergencyCard: {
        backgroundColor: 'rgba(254, 242, 242, 0.6)',
        ...Platform.select({
            ios: {
                shadowColor: '#EF4444',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
            },
        }),
    },
    cardPressed: {
        opacity: 0.95,
        transform: [{ scale: 0.985 }],
    },
    urgentBadge: {
        position: 'absolute',
        top: -8,
        right: spacing.md,
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: 3,
        borderRadius: 10,
    },
    urgentBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.8,
    },
    messageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.minimalist.warmGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarShelter: {
        backgroundColor: '#059669',
    },
    avatarNgo: {
        backgroundColor: '#7C3AED',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    userRole: {
        fontSize: 11,
        color: colors.minimalist.textLight,
        marginTop: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 5,
    },
    statusDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    petImageContainer: {
        position: 'relative',
        marginBottom: spacing.sm,
    },
    petImage: {
        width: '100%',
        height: 160,
        backgroundColor: colors.minimalist.warmGray,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    petEmoji: {
        fontSize: 56,
    },
    vaccinatedBadge: {
        position: 'absolute',
        bottom: spacing.sm,
        right: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#059669',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    vaccinatedText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#fff',
    },
    petInfo: {
        marginBottom: spacing.sm,
    },
    petName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        marginBottom: spacing.xs,
    },
    petTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    petTag: {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        paddingHorizontal: spacing.sm + 2,
        paddingVertical: 3,
        borderRadius: 10,
    },
    petTagText: {
        fontSize: 11,
        color: colors.minimalist.textMedium,
        fontWeight: '500',
    },
    messageContent: {
        fontSize: 14,
        color: colors.minimalist.textDark,
        lineHeight: 21,
        marginBottom: spacing.sm,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 12,
        color: colors.minimalist.textLight,
    },
    timestamp: {
        fontSize: 11,
        color: colors.minimalist.textLight,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.04)',
        paddingTop: spacing.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 4,
    },
    actionText: {
        fontSize: 12,
        color: colors.minimalist.textLight,
        fontWeight: '500',
    },
    contactAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.minimalist.coral,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: 16,
        marginLeft: 'auto',
    },
    contactActionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    bottomSpacing: {
        height: 100,
    },
    fabButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#FF8C5A',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: { elevation: 6 },
        }),
    },
    fabGradient: {
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabPressed: {
        transform: [{ scale: 0.92 }],
    },
    modalContainer: {
        flex: 1,
        backgroundColor: colors.minimalist.white,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    },
    modalCancel: {
        fontSize: 15,
        color: colors.minimalist.textMedium,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    modalPostButton: {
        backgroundColor: colors.minimalist.coral,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: 14,
    },
    modalPostText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    postTypeSelector: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    postTypeButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderRadius: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.03)',
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    postTypeActive: {
        borderColor: colors.minimalist.coral,
        backgroundColor: 'rgba(245, 164, 145, 0.08)',
    },
    postTypeIcon: {
        fontSize: 20,
        marginBottom: 2,
    },
    postTypeLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    postInput: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        fontSize: 16,
        color: colors.minimalist.textDark,
        textAlignVertical: 'top',
    },
    postActions: {
        flexDirection: 'row',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.05)',
        gap: spacing.xl,
    },
    postActionButton: {
        alignItems: 'center',
        gap: 3,
    },
    postActionText: {
        fontSize: 11,
        color: colors.minimalist.textMedium,
    },
});
