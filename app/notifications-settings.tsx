import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Switch,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FloatingCard } from '../components/FloatingCard';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface NotificationSetting {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
    icon: keyof typeof Ionicons.glyphMap;
}

export default function NotificationsSettingsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const isNGO = user?.role === 'ngo';
    const accentColor = isNGO ? '#0891B2' : colors.minimalist.coral;
    const accentBg = isNGO ? 'rgba(165, 229, 237, 0.2)' : 'rgba(255, 180, 162, 0.15)';
    const trackColorTrue = isNGO ? '#A5E5ED' : colors.minimalist.peachLight;

    const [settings, setSettings] = useState<NotificationSetting[]>([
        {
            id: 'push',
            title: 'Push Notifications',
            description: 'Receive alerts on your device',
            enabled: true,
            icon: 'notifications',
        },
        {
            id: 'sightings',
            title: 'New Sightings',
            description: 'When pets are spotted in your area',
            enabled: true,
            icon: 'eye',
        },
        {
            id: 'matches',
            title: 'Match Alerts',
            description: 'When a lost pet matches found reports',
            enabled: true,
            icon: 'heart',
        },
        {
            id: 'community',
            title: 'Community Updates',
            description: 'Posts and comments activity',
            enabled: false,
            icon: 'people',
        },
        {
            id: 'email',
            title: 'Email Notifications',
            description: 'Weekly summary and important updates',
            enabled: true,
            icon: 'mail',
        },
        {
            id: 'emergency',
            title: 'Emergency Alerts',
            description: 'Disaster mode and urgent announcements',
            enabled: true,
            icon: 'warning',
        },
    ]);

    // Animation
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    const toggleSetting = (id: string) => {
        setSettings(prev =>
            prev.map(setting =>
                setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
            )
        );
    };

    const renderSettingItem = (setting: NotificationSetting, index: number) => {
        const itemAnim = new Animated.Value(0);

        Animated.timing(itemAnim, {
            toValue: 1,
            duration: 300,
            delay: index * 80,
            useNativeDriver: true,
        }).start();

        return (
            <Animated.View
                key={setting.id}
                style={{
                    opacity: fadeAnim,
                    transform: [{
                        translateX: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0],
                        })
                    }],
                }}
            >
                <Pressable
                    onPress={() => toggleSetting(setting.id)}
                    style={({ pressed }) => [
                        styles.settingItem,
                        pressed && styles.settingItemPressed
                    ]}
                >
                    <View style={[styles.iconContainer, setting.enabled && { backgroundColor: isNGO ? 'rgba(165, 229, 237, 0.25)' : 'rgba(255, 180, 162, 0.15)' }]}>
                        <Ionicons
                            name={setting.icon}
                            size={22}
                            color={setting.enabled ? accentColor : colors.minimalist.textLight}
                        />
                    </View>
                    <View style={styles.settingContent}>
                        <Text style={styles.settingTitle}>{setting.title}</Text>
                        <Text style={styles.settingDescription}>{setting.description}</Text>
                    </View>
                    <Switch
                        value={setting.enabled}
                        onValueChange={() => toggleSetting(setting.id)}
                        trackColor={{
                            false: colors.minimalist.borderLight,
                            true: trackColorTrue,
                        }}
                        thumbColor={colors.minimalist.white}
                        ios_backgroundColor={colors.minimalist.borderLight}
                    />
                </Pressable>
            </Animated.View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [
                        styles.backButton,
                        pressed && styles.buttonPressed
                    ]}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.minimalist.textDark} />
                </Pressable>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Info Banner */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <FloatingCard shadow="soft" style={[styles.infoBanner, { backgroundColor: accentBg }]}>
                        <Ionicons name="information-circle" size={24} color={accentColor} />
                        <Text style={styles.infoText}>
                            Customize which notifications you'd like to receive from PawGuard.
                        </Text>
                    </FloatingCard>
                </Animated.View>

                {/* Settings List */}
                <FloatingCard shadow="soft" style={styles.settingsCard}>
                    {settings.map((setting, index) => renderSettingItem(setting, index))}
                </FloatingCard>

                {/* Quiet Hours */}
                <Animated.View style={{ opacity: fadeAnim }}>
                    <FloatingCard shadow="soft" style={styles.quietHoursCard}>
                        <View style={styles.quietHoursHeader}>
                            <Ionicons name="moon" size={24} color={colors.minimalist.textMedium} />
                            <Text style={styles.quietHoursTitle}>Quiet Hours</Text>
                        </View>
                        <Text style={styles.quietHoursDescription}>
                            Set a schedule to pause notifications during specific hours.
                        </Text>
                        <Pressable style={styles.configureButton}>
                            <Text style={[styles.configureButtonText, { color: accentColor }]}>Configure</Text>
                            <Ionicons name="chevron-forward" size={18} color={accentColor} />
                        </Pressable>
                    </FloatingCard>
                </Animated.View>

                <View style={styles.bottomSpacing} />
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
        justifyContent: 'space-between',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        backgroundColor: colors.minimalist.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.minimalist.borderLight,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    buttonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.96 }],
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    headerSpacer: {
        width: 44,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.xl,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.lg,
        marginBottom: spacing.xl,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: colors.minimalist.textMedium,
        lineHeight: 20,
    },
    settingsCard: {
        marginBottom: spacing.xl,
        padding: 0,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.minimalist.borderLight,
    },
    settingItemPressed: {
        backgroundColor: colors.minimalist.bgLight,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.minimalist.bgLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
    },
    iconContainerActive: {
        opacity: 1,
    },
    settingContent: {
        flex: 1,
        marginRight: spacing.md,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 13,
        color: colors.minimalist.textLight,
    },
    quietHoursCard: {
        marginBottom: spacing.xl,
    },
    quietHoursHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.sm,
    },
    quietHoursTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    quietHoursDescription: {
        fontSize: 14,
        color: colors.minimalist.textLight,
        marginBottom: spacing.lg,
        lineHeight: 20,
    },
    configureButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.minimalist.bgLight,
        paddingVertical: spacing.md + 4,
        paddingHorizontal: spacing.lg,
        borderRadius: 12,
    },
    configureButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    bottomSpacing: {
        height: spacing.xxl,
    },
});
