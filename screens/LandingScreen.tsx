import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { serifTextStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { FloatingCard } from '../components/FloatingCard';

interface LandingScreenProps {
    navigation: any;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* App Name */}
                <Text style={styles.appName}>PawGuard AI</Text>

                {/* Mission Tagline */}
                <Text style={styles.tagline}>
                    Compassionate AI for animal rescue and protection
                </Text>

                {/* Hero Card */}
                <FloatingCard style={styles.heroCard} shadow="medium">
                    <Image
                        source={require('../assets/icon.png')}
                        style={styles.heroImage}
                        resizeMode="contain"
                    />
                    <View style={styles.shieldIcon}>
                        <Text style={styles.shieldEmoji}>🛡️</Text>
                    </View>
                </FloatingCard>

                {/* Description */}
                <Text style={styles.description}>
                    Join NGOs and compassionate citizens in protecting animals through AI-powered identification, rescue coordination, and community support.
                </Text>

                {/* Primary Actions */}
                <Pressable
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('Auth')}
                >
                    <LinearGradient
                        colors={[colors.minimalist.coral, colors.minimalist.orange]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.primaryButtonText}>Report an Animal</Text>
                    </LinearGradient>
                </Pressable>

                <Pressable
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('Auth')}
                >
                    <Text style={styles.secondaryButtonText}>NGO Login</Text>
                </Pressable>

                {/* Footer Spacing */}
                <View style={styles.footer} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.minimalist.white,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xxl,
    },
    appName: {
        ...serifTextStyles.serifHero,
        color: colors.minimalist.textDark,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    tagline: {
        fontSize: 18,
        color: colors.minimalist.textMedium,
        textAlign: 'center',
        marginBottom: spacing.xxl,
        lineHeight: 26,
    },
    heroCard: {
        alignItems: 'center',
        backgroundColor: colors.minimalist.peachLight,
        marginBottom: spacing.xl,
        paddingVertical: spacing.xxl,
    },
    heroImage: {
        width: 200,
        height: 200,
        opacity: 0.3,
    },
    shieldIcon: {
        position: 'absolute',
        top: '50%',
        marginTop: -40,
    },
    shieldEmoji: {
        fontSize: 80,
    },
    description: {
        fontSize: 16,
        color: colors.minimalist.textMedium,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: spacing.xxl,
    },
    primaryButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    buttonGradient: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.white,
    },
    secondaryButton: {
        backgroundColor: colors.minimalist.orange,
        paddingVertical: spacing.lg,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    secondaryButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.white,
    },
    footer: {
        height: spacing.xxl,
    },
});
