import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Modal,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FloatingCard } from '../../components/FloatingCard';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MenuItem {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    route: string;
}

const menuItems: MenuItem[] = [
    { id: 'edit', icon: 'person-outline', label: 'Edit Profile', route: '/edit-profile' },
    { id: 'notifications', icon: 'notifications-outline', label: 'Notifications', route: '/notifications-settings' },
    { id: 'settings', icon: 'settings-outline', label: 'Settings', route: '/app-settings' },
    { id: 'help', icon: 'help-circle-outline', label: 'Help & Support', route: '/help-support' },
];

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Animation values
    const avatarScale = useRef(new Animated.Value(0.3)).current;
    const avatarOpacity = useRef(new Animated.Value(0)).current;
    const statsAnimations = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;
    const menuAnimations = useRef(
        menuItems.map(() => new Animated.Value(0))
    ).current;
    const logoutButtonAnim = useRef(new Animated.Value(0)).current;
    const modalBackdropAnim = useRef(new Animated.Value(0)).current;
    const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
    const logoutShakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Avatar animation
        Animated.parallel([
            Animated.spring(avatarScale, {
                toValue: 1,
                friction: 6,
                tension: 100,
                useNativeDriver: true,
            }),
            Animated.timing(avatarOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();

        // Stats stagger animation
        Animated.stagger(100, statsAnimations.map(anim =>
            Animated.spring(anim, {
                toValue: 1,
                friction: 8,
                tension: 80,
                useNativeDriver: true,
            })
        )).start();

        // Menu items slide-in animation
        Animated.stagger(80, menuAnimations.map(anim =>
            Animated.spring(anim, {
                toValue: 1,
                friction: 8,
                tension: 60,
                useNativeDriver: true,
            })
        )).start();

        // Logout button fade in
        Animated.timing(logoutButtonAnim, {
            toValue: 1,
            duration: 500,
            delay: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    const openLogoutModal = () => {
        setShowLogoutModal(true);
        Animated.parallel([
            Animated.timing(modalBackdropAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.spring(modalScaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 100,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeLogoutModal = () => {
        Animated.parallel([
            Animated.timing(modalBackdropAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(modalScaleAnim, {
                toValue: 0.8,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowLogoutModal(false);
        });
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
        closeLogoutModal();
        router.replace('/(auth)/landing');
    };

    const isNGO = user?.role === 'ngo';
    const accentColor = isNGO ? '#0891B2' : colors.minimalist.coral;
    const avatarBg = isNGO ? '#A5E5ED' : '#FFD7D0'; // Fresh Blue for NGO, Soft Peach for Citizen

    const handleLogoutPress = () => {
        // Shake animation on press
        Animated.sequence([
            Animated.timing(logoutShakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(logoutShakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(logoutShakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
            Animated.timing(logoutShakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
            Animated.timing(logoutShakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start(() => {
            openLogoutModal();
        });
    };

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const handleMenuPress = (route: string) => {
        router.push(route as any);
    };

    const stats = [
        { label: 'Reports', value: '12' },
        { label: 'Helped', value: '5' },
        { label: 'Points', value: '48' },
    ];

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Animated.View style={[
                        styles.avatar,
                        {
                            opacity: avatarOpacity,
                            transform: [{ scale: avatarScale }],
                            backgroundColor: avatarBg,
                            shadowColor: avatarBg,
                        }
                    ]}>
                        <Text style={[styles.avatarText, !isNGO && { color: colors.minimalist.coral }]}>
                            {getInitials(user?.name || '')}
                        </Text>
                    </Animated.View>
                    <Animated.Text style={[styles.name, { opacity: avatarOpacity }]}>
                        {user?.name || 'User Name'}
                    </Animated.Text>
                    <Animated.Text style={[styles.role, { opacity: avatarOpacity }]}>
                        {user?.role === 'ngo' ? 'NGO / Shelter' : 'Citizen'}
                    </Animated.Text>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    {stats.map((stat, index) => (
                        <Animated.View
                            key={stat.label}
                            style={[
                                styles.statCardContainer,
                                {
                                    opacity: statsAnimations[index],
                                    transform: [{
                                        translateY: statsAnimations[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [30, 0],
                                        }),
                                    }],
                                }
                            ]}
                        >
                            <Pressable
                                onPress={() => router.push('/report-history')}
                                style={({ pressed }) => pressed && styles.cardPressed}
                            >
                                <FloatingCard shadow="medium" style={styles.statCard}>
                                    <Text style={styles.statNumber}>{stat.value}</Text>
                                    <Text style={styles.statLabel}>{stat.label}</Text>
                                </FloatingCard>
                            </Pressable>
                        </Animated.View>
                    ))}
                </View>

                {/* Menu Items */}
                <View style={styles.section}>
                    {menuItems.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            style={{
                                opacity: menuAnimations[index],
                                transform: [{
                                    translateX: menuAnimations[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0],
                                    }),
                                }],
                            }}
                        >
                            <Pressable
                                onPress={() => handleMenuPress(item.route)}
                                style={({ pressed }) => [
                                    pressed && styles.menuItemPressedContainer
                                ]}
                            >
                                {({ pressed }) => (
                                    <Animated.View style={pressed && { transform: [{ scale: 0.96 }] }}>
                                        <FloatingCard shadow="soft" style={[styles.menuItem, pressed && styles.menuItemPressed]}>
                                            <View style={[styles.menuIconContainer, { backgroundColor: isNGO ? 'rgba(165, 229, 237, 0.25)' : 'rgba(255, 180, 162, 0.15)' }]}>
                                                <Ionicons name={item.icon} size={24} color={accentColor} />
                                            </View>
                                            <Text style={styles.menuText}>{item.label}</Text>
                                            <Ionicons name="chevron-forward" size={20} color={colors.minimalist.textLight} />
                                        </FloatingCard>
                                    </Animated.View>
                                )}
                            </Pressable>
                        </Animated.View>
                    ))}
                </View>

                {/* Logout Button */}
                <Animated.View style={{
                    opacity: logoutButtonAnim,
                    transform: [{ translateX: logoutShakeAnim }],
                }}>
                    <Pressable
                        onPress={handleLogoutPress}
                        style={({ pressed }) => [
                            styles.logoutButton,
                            pressed && styles.logoutButtonPressed
                        ]}
                    >
                        <Ionicons name="log-out-outline" size={22} color={colors.minimalist.errorRed} />
                        <Text style={styles.logoutText}>Log Out</Text>
                    </Pressable>
                </Animated.View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Logout Confirmation Modal */}
            <Modal
                visible={showLogoutModal}
                transparent
                animationType="none"
                onRequestClose={closeLogoutModal}
            >
                <Animated.View style={[
                    styles.modalBackdrop,
                    { opacity: modalBackdropAnim }
                ]}>
                    <Pressable style={styles.modalBackdropPress} onPress={closeLogoutModal}>
                        <Animated.View
                            style={[
                                styles.modalContent,
                                {
                                    opacity: modalBackdropAnim,
                                    transform: [{ scale: modalScaleAnim }],
                                }
                            ]}
                        >
                            <Pressable>
                                <View style={styles.modalIconContainer}>
                                    <Ionicons name="log-out" size={32} color={colors.minimalist.errorRed} />
                                </View>
                                <Text style={styles.modalTitle}>Log Out?</Text>
                                <Text style={styles.modalMessage}>
                                    Are you sure you want to log out of your account?
                                </Text>
                                <View style={styles.modalButtons}>
                                    <Pressable
                                        onPress={closeLogoutModal}
                                        style={({ pressed }) => [
                                            styles.modalButton,
                                            styles.modalButtonCancel,
                                            pressed && styles.modalButtonPressed
                                        ]}
                                    >
                                        <Text style={styles.modalButtonCancelText}>Cancel</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={handleLogout}
                                        disabled={isLoggingOut}
                                        style={({ pressed }) => [
                                            styles.modalButton,
                                            styles.modalButtonConfirm,
                                            pressed && styles.modalButtonPressed,
                                            isLoggingOut && styles.modalButtonDisabled
                                        ]}
                                    >
                                        <Text style={styles.modalButtonConfirmText}>
                                            {isLoggingOut ? 'Logging out...' : 'Log Out'}
                                        </Text>
                                    </Pressable>
                                </View>
                            </Pressable>
                        </Animated.View>
                    </Pressable>
                </Animated.View>
            </Modal>
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
    scrollContent: {
        padding: spacing.xl,
        paddingTop: spacing.xxxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxxl,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#A5E5ED',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
        shadowColor: '#A5E5ED',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '700',
        color: colors.minimalist.white,
    },
    name: {
        fontSize: 26,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        marginBottom: spacing.xs,
        letterSpacing: 0.3,
    },
    role: {
        fontSize: 15,
        color: colors.minimalist.textMedium,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xxxl,
    },
    statCardContainer: {
        flex: 1,
    },
    cardPressed: {
        transform: [{ scale: 0.96 }],
    },
    statCard: {
        padding: spacing.lg + 4,
        alignItems: 'center',
        borderRadius: 16,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.minimalist.textDark,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.minimalist.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    section: {
        gap: spacing.md,
        marginBottom: spacing.xxxl,
    },
    menuItemPressedContainer: {
        transform: [{ scale: 0.98 }],
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        gap: spacing.lg,
        borderRadius: 16,
    },
    menuItemPressed: {
        backgroundColor: colors.minimalist.bgLight,
    },
    menuIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: 'rgba(165, 229, 237, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: 16,
        borderRadius: 14,
        backgroundColor: colors.minimalist.white,
        borderWidth: 1.5,
        borderColor: colors.minimalist.errorRed,
        shadowColor: colors.minimalist.errorRed,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    logoutButtonPressed: {
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        transform: [{ scale: 0.98 }],
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.minimalist.errorRed,
    },
    bottomSpacing: {
        height: spacing.mega,
    },
    // Modal Styles
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBackdropPress: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: SCREEN_WIDTH - 48,
        backgroundColor: colors.minimalist.white,
        borderRadius: 24,
        padding: spacing.xxxl,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 40,
        elevation: 20,
    },
    modalIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
        alignSelf: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 15,
        color: colors.minimalist.textMedium,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.xxl,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalButtonCancel: {
        backgroundColor: colors.minimalist.bgLight,
        borderWidth: 1,
        borderColor: colors.minimalist.borderLight,
    },
    modalButtonConfirm: {
        backgroundColor: colors.minimalist.errorRed,
    },
    modalButtonPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    modalButtonDisabled: {
        opacity: 0.6,
    },
    modalButtonCancelText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
    },
    modalButtonConfirmText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.minimalist.white,
    },
});
