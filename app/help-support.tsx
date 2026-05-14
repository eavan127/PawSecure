import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    Linking,
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

interface FAQItem {
    question: string;
    answer: string;
    isExpanded: boolean;
}

interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
}

export default function HelpSupportScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const isNGO = user?.role === 'ngo';
    const accentColor = isNGO ? '#0891B2' : colors.minimalist.coral;
    const fadeAnim = useState(new Animated.Value(0))[0];

    const [faqs, setFaqs] = useState<FAQItem[]>([
        {
            question: 'How do I report a lost pet?',
            answer: 'Go to the Report tab in the bottom navigation and select "Report Lost Pet". Fill in the required details including a photo, description, and last known location. Our AI will help match your pet with any found reports.',
            isExpanded: false,
        },
        {
            question: 'How does the AI detection work?',
            answer: 'Our AI uses advanced image recognition (YOLOv8) to detect dogs and cats in photos. When you submit a report, the AI analyzes the image to identify the animal and helps match it with other reports in the system.',
            isExpanded: false,
        },
        {
            question: 'Can I edit a report after submitting?',
            answer: 'Yes! Go to your Profile, tap on "Reports" to see your report history. Select the report you want to edit and tap the edit button. You can update the photo, description, and status.',
            isExpanded: false,
        },
        {
            question: 'What is Disaster Mode?',
            answer: 'Disaster Mode is a special feature activated during emergencies like floods or earthquakes. It prioritizes emergency pet relocations and helps coordinate rescue efforts with local shelters and volunteers.',
            isExpanded: false,
        },
        {
            question: 'How do I contact a shelter?',
            answer: 'When viewing a pet profile, tap the "Contact Shelter" button to send a message or call the shelter directly. You can also browse all shelters in the Community tab.',
            isExpanded: false,
        },
    ]);

    const quickActions: QuickAction[] = [
        {
            id: 'chat',
            title: 'Live Chat',
            description: 'Chat with our support team',
            icon: 'chatbubbles',
            color: accentColor,
        },
        {
            id: 'email',
            title: 'Email Us',
            description: 'support@pawguard.ai',
            icon: 'mail',
            color: colors.minimalist.successGreen,
        },
        {
            id: 'call',
            title: 'Call Support',
            description: '+1 (800) PAW-HELP',
            icon: 'call',
            color: colors.minimalist.infoBlue,
        },
    ];

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    const toggleFAQ = (index: number) => {
        setFaqs(prev =>
            prev.map((faq, i) =>
                i === index ? { ...faq, isExpanded: !faq.isExpanded } : faq
            )
        );
    };

    const handleQuickAction = (action: QuickAction) => {
        if (action.id === 'email') {
            Linking.openURL('mailto:support@pawguard.ai');
        } else if (action.id === 'call') {
            Linking.openURL('tel:+18007294357');
        }
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
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Search Bar */}
                    <Pressable style={styles.searchBar}>
                        <Ionicons name="search" size={20} color={colors.minimalist.textLight} />
                        <Text style={styles.searchPlaceholder}>Search help articles...</Text>
                    </Pressable>

                    {/* Quick Actions */}
                    <Text style={styles.sectionTitle}>Get in Touch</Text>
                    <View style={styles.quickActionsGrid}>
                        {quickActions.map((action, index) => (
                            <Pressable
                                key={action.id}
                                onPress={() => handleQuickAction(action)}
                                style={({ pressed }) => [
                                    styles.quickActionCard,
                                    pressed && styles.quickActionPressed
                                ]}
                            >
                                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
                                    <Ionicons name={action.icon} size={24} color={action.color} />
                                </View>
                                <Text style={styles.quickActionTitle}>{action.title}</Text>
                                <Text style={styles.quickActionDescription}>{action.description}</Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* FAQ Section */}
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    <FloatingCard shadow="soft" style={styles.faqCard}>
                        {faqs.map((faq, index) => (
                            <View key={index}>
                                <Pressable
                                    onPress={() => toggleFAQ(index)}
                                    style={({ pressed }) => [
                                        styles.faqItem,
                                        pressed && styles.faqItemPressed,
                                        index < faqs.length - 1 && !faq.isExpanded && styles.faqItemBorder
                                    ]}
                                >
                                    <Text style={styles.faqQuestion}>{faq.question}</Text>
                                    <Animated.View style={{
                                        transform: [{
                                            rotate: faq.isExpanded ? '180deg' : '0deg'
                                        }]
                                    }}>
                                        <Ionicons
                                            name="chevron-down"
                                            size={20}
                                            color={colors.minimalist.textLight}
                                        />
                                    </Animated.View>
                                </Pressable>
                                {faq.isExpanded && (
                                    <View style={[
                                        styles.faqAnswer,
                                        index < faqs.length - 1 && styles.faqItemBorder
                                    ]}>
                                        <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </FloatingCard>

                    {/* Additional Resources */}
                    <Text style={styles.sectionTitle}>Additional Resources</Text>
                    <FloatingCard shadow="soft" style={styles.resourcesCard}>
                        <Pressable style={styles.resourceItem}>
                            <View style={[styles.resourceIcon, { backgroundColor: isNGO ? 'rgba(165, 229, 237, 0.25)' : 'rgba(255, 180, 162, 0.15)' }]}>
                                <Ionicons name="book" size={20} color={accentColor} />
                            </View>
                            <View style={styles.resourceContent}>
                                <Text style={styles.resourceTitle}>User Guide</Text>
                                <Text style={styles.resourceDescription}>Complete app documentation</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.minimalist.textLight} />
                        </Pressable>

                        <Pressable style={styles.resourceItem}>
                            <View style={[styles.resourceIcon, { backgroundColor: isNGO ? 'rgba(165, 229, 237, 0.25)' : 'rgba(255, 180, 162, 0.15)' }]}>
                                <Ionicons name="videocam" size={20} color={accentColor} />
                            </View>
                            <View style={styles.resourceContent}>
                                <Text style={styles.resourceTitle}>Video Tutorials</Text>
                                <Text style={styles.resourceDescription}>Step-by-step guides</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.minimalist.textLight} />
                        </Pressable>

                        <Pressable style={[styles.resourceItem, { borderBottomWidth: 0 }]}>
                            <View style={[styles.resourceIcon, { backgroundColor: isNGO ? 'rgba(165, 229, 237, 0.25)' : 'rgba(255, 180, 162, 0.15)' }]}>
                                <Ionicons name="document-text" size={20} color={accentColor} />
                            </View>
                            <View style={styles.resourceContent}>
                                <Text style={styles.resourceTitle}>Terms & Privacy</Text>
                                <Text style={styles.resourceDescription}>Legal information</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={colors.minimalist.textLight} />
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
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.minimalist.white,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md + 4,
        borderRadius: 14,
        marginBottom: spacing.xxl,
        borderWidth: 1,
        borderColor: colors.minimalist.borderLight,
    },
    searchPlaceholder: {
        fontSize: 15,
        color: colors.minimalist.textLight,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.minimalist.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.lg,
        marginLeft: spacing.xs,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xxl,
    },
    quickActionCard: {
        flex: 1,
        backgroundColor: colors.minimalist.white,
        borderRadius: 16,
        padding: spacing.lg,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    quickActionPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.96 }],
    },
    quickActionIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    quickActionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: 2,
    },
    quickActionDescription: {
        fontSize: 11,
        color: colors.minimalist.textLight,
        textAlign: 'center',
    },
    faqCard: {
        padding: 0,
        marginBottom: spacing.xxl,
        overflow: 'hidden',
    },
    faqItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.lg,
    },
    faqItemPressed: {
        backgroundColor: colors.minimalist.bgLight,
    },
    faqItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.minimalist.borderLight,
    },
    faqQuestion: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: colors.minimalist.textDark,
        marginRight: spacing.md,
    },
    faqAnswer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        backgroundColor: colors.minimalist.bgLight,
    },
    faqAnswerText: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        lineHeight: 22,
    },
    resourcesCard: {
        padding: 0,
        overflow: 'hidden',
    },
    resourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.minimalist.borderLight,
    },
    resourceIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
    },
    resourceContent: {
        flex: 1,
    },
    resourceTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.minimalist.textDark,
    },
    resourceDescription: {
        fontSize: 13,
        color: colors.minimalist.textLight,
        marginTop: 2,
    },
    bottomSpacing: {
        height: spacing.xxl,
    },
});
