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

type SettingType = 'toggle' | 'navigation' | 'action';

interface SettingItem {
    id: string;
    title: string;
    description?: string;
    type: SettingType;
    enabled?: boolean;
    icon: keyof typeof Ionicons.glyphMap;
    danger?: boolean;
}

interface SettingSection {
    title: string;
    items: SettingItem[];
}

export default function AppSettingsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const isNGO = user?.role === 'ngo';
    const accentColor = isNGO ? '#0891B2' : colors.minimalist.coral;
    const trackColorTrue = isNGO ? '#A5E5ED' : colors.minimalist.peachLight;
    const fadeAnim = useState(new Animated.Value(0))[0];

    const [sections, setSections] = useState<SettingSection[]>([
        {
            title: 'Preferences',
            items: [
                {
                    id: 'darkMode',
                    title: 'Dark Mode',
                    description: 'Use dark theme',
                    type: 'toggle',
                    enabled: false,
                    icon: 'moon',
                },
                {
                    id: 'language',
                    title: 'Language',
                    description: 'English',
                    type: 'navigation',
                    icon: 'language',
                },
                {
                    id: 'location',
                    title: 'Location Services',
                    description: 'Allow location access for nearby sightings',
                    type: 'toggle',
                    enabled: true,
                    icon: 'location',
                },
            ],
        },
        {
            title: 'Privacy & Security',
            items: [
                {
                    id: 'privacy',
                    title: 'Privacy Settings',
                    type: 'navigation',
                    icon: 'shield-checkmark',
                },
                {
                    id: 'password',
                    title: 'Change Password',
                    type: 'navigation',
                    icon: 'key',
                },
                {
                    id: 'twoFactor',
                    title: 'Two-Factor Authentication',
                    description: 'Add extra security to your account',
                    type: 'toggle',
                    enabled: false,
                    icon: 'lock-closed',
                },
            ],
        },
        {
            title: 'Data & Storage',
            items: [
                {
                    id: 'cache',
                    title: 'Clear Cache',
                    description: 'Free up storage space',
                    type: 'action',
                    icon: 'trash-bin',
                },
                {
                    id: 'download',
                    title: 'Download Data',
                    description: 'Get a copy of your data',
                    type: 'navigation',
                    icon: 'download',
                },
            ],
        },
        {
            title: 'Account',
            items: [
                {
                    id: 'delete',
                    title: 'Delete Account',
                    description: 'Permanently remove your account',
                    type: 'action',
                    icon: 'trash',
                    danger: true,
                },
            ],
        },
    ]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    const toggleSetting = (sectionIndex: number, itemId: string) => {
        setSections(prev => {
            const newSections = [...prev];
            const section = { ...newSections[sectionIndex] };
            section.items = section.items.map(item =>
                item.id === itemId ? { ...item, enabled: !item.enabled } : item
            );
            newSections[sectionIndex] = section;
            return newSections;
        });
    };

    const handleItemPress = (item: SettingItem, sectionIndex: number) => {
        if (item.type === 'toggle') {
            toggleSetting(sectionIndex, item.id);
        } else if (item.type === 'navigation') {
            // Handle navigation
        } else if (item.type === 'action') {
            // Handle action
        }
    };

    const renderSettingItem = (item: SettingItem, sectionIndex: number) => (
        <Pressable
            key={item.id}
            onPress={() => handleItemPress(item, sectionIndex)}
            style={({ pressed }) => [
                styles.settingItem,
                pressed && styles.settingItemPressed
            ]}
        >
            <View style={[
                styles.iconContainer,
                item.danger && styles.iconContainerDanger
            ]}>
                <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.danger ? colors.minimalist.errorRed : colors.minimalist.textMedium}
                />
            </View>
            <View style={styles.settingContent}>
                <Text style={[
                    styles.settingTitle,
                    item.danger && styles.settingTitleDanger
                ]}>
                    {item.title}
                </Text>
                {item.description && (
                    <Text style={styles.settingDescription}>{item.description}</Text>
                )}
            </View>
            {item.type === 'toggle' && (
                <Switch
                    value={item.enabled}
                    onValueChange={() => toggleSetting(sectionIndex, item.id)}
                    trackColor={{
                        false: colors.minimalist.borderLight,
                        true: trackColorTrue,
                    }}
                    thumbColor={colors.minimalist.white}
                    ios_backgroundColor={colors.minimalist.borderLight}
                />
            )}
            {item.type === 'navigation' && (
                <Ionicons name="chevron-forward" size={20} color={colors.minimalist.textLight} />
            )}
        </Pressable>
    );

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
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    {sections.map((section, sectionIndex) => (
                        <View key={section.title} style={styles.section}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <FloatingCard shadow="soft" style={styles.sectionCard}>
                                {section.items.map(item => renderSettingItem(item, sectionIndex))}
                            </FloatingCard>
                        </View>
                    ))}

                    {/* App Version */}
                    <View style={styles.versionContainer}>
                        <Ionicons name="paw" size={24} color={accentColor} />
                        <Text style={styles.versionText}>PawGuard AI</Text>
                        <Text style={styles.versionNumber}>Version 1.0.0</Text>
                    </View>
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
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.minimalist.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.md,
        marginLeft: spacing.xs,
    },
    sectionCard: {
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
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.minimalist.bgLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
    },
    iconContainerDanger: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    settingContent: {
        flex: 1,
        marginRight: spacing.md,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.minimalist.textDark,
    },
    settingTitleDanger: {
        color: colors.minimalist.errorRed,
    },
    settingDescription: {
        fontSize: 13,
        color: colors.minimalist.textLight,
        marginTop: 2,
    },
    versionContainer: {
        alignItems: 'center',
        paddingVertical: spacing.xxxl,
        gap: spacing.xs,
    },
    versionText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
    },
    versionNumber: {
        fontSize: 13,
        color: colors.minimalist.textLight,
    },
    bottomSpacing: {
        height: spacing.xxl,
    },
});
