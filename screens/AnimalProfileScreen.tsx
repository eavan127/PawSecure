import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { serifTextStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { FloatingCard } from '../components/FloatingCard';
import { MinimalistStatusBadge } from '../components/MinimalistStatusBadge';
import { useAuth } from '../contexts/AuthContext';

interface AnimalProfileScreenProps {
    navigation: any;
    route?: any;
}

export const AnimalProfileScreen: React.FC<AnimalProfileScreenProps> = ({ navigation }) => {
    const { user } = useAuth();
    const isNGO = user?.role === 'ngo';
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Back Button */}
                <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.minimalist.textDark} />
                </Pressable>

                {/* Large Image Card */}
                <FloatingCard style={styles.imageCard} shadow="medium">
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop' }}
                        style={styles.animalImage}
                        resizeMode="cover"
                    />
                </FloatingCard>

                {/* Animal Name */}
                <Text style={styles.animalName}>Max</Text>
                <Text style={styles.systemId}>System ID #A-2047</Text>

                {/* Status Badges */}
                <View style={styles.badgeRow}>
                    <MinimalistStatusBadge label="Vaccinated" variant="vaccinated" icon="checkmark-circle" />
                    <MinimalistStatusBadge label="Neutered" variant="neutered" icon="checkmark-circle" />
                    <MinimalistStatusBadge label="At Risk" variant="atRisk" icon="alert-circle" />
                </View>

                {/* Info Cards */}
                <FloatingCard style={styles.infoCard} shadow="soft">
                    <View style={styles.infoRow}>
                        <View style={[styles.iconCircle, { backgroundColor: isNGO ? 'rgba(165, 229, 237, 0.25)' : colors.minimalist.peachLight }]}>
                            <Ionicons name="location" size={20} color={isNGO ? '#0891B2' : colors.minimalist.coral} />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>Last seen location</Text>
                            <Text style={styles.infoValue}>Central Park, NY, near the Belvedere Castle entrance. Oct 26, 2024, 4:30 PM.</Text>
                        </View>
                    </View>
                </FloatingCard>

                <FloatingCard style={styles.infoCard} shadow="soft">
                    <View style={styles.infoRow}>
                        <View style={[styles.iconCircle, { backgroundColor: isNGO ? 'rgba(165, 229, 237, 0.25)' : colors.minimalist.peachLight }]}>
                            <Ionicons name="heart" size={20} color={isNGO ? '#0891B2' : colors.minimalist.coral} />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>Health status</Text>
                            <Text style={styles.infoValue}>Stable. Minor injury on left hind leg, currently under observation. Requires follow-up check.</Text>
                        </View>
                    </View>
                </FloatingCard>

                <FloatingCard style={styles.infoCard} shadow="soft">
                    <View style={styles.infoRow}>
                        <View style={[styles.iconCircle, { backgroundColor: isNGO ? 'rgba(165, 229, 237, 0.25)' : colors.minimalist.peachLight }]}>
                            <Ionicons name="time" size={20} color={isNGO ? '#0891B2' : colors.minimalist.coral} />
                        </View>
                        <View style={styles.infoText}>
                            <Text style={styles.infoLabel}>Rescue history</Text>
                            <Text style={styles.infoValue}>Found: Oct 26, 2024 by Good Samaritan. Intake: Oct 27, 2024 at City Shelter. Pending NGO Evaluation.</Text>
                        </View>
                    </View>
                </FloatingCard>

                {/* NGO Action Button */}
                <Pressable style={styles.actionButton}>
                    <LinearGradient
                        colors={isNGO ? ['#A5E5ED', '#BBF3DE'] : [colors.minimalist.coral, colors.minimalist.orange]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={[styles.actionButtonText, isNGO && { color: '#0891B2' }]}>Rescue Decision (NGO-only)</Text>
                    </LinearGradient>
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
        backgroundColor: colors.minimalist.bgLight,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.minimalist.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    imageCard: {
        padding: 0,
        marginBottom: spacing.lg,
        overflow: 'hidden',
    },
    animalImage: {
        width: '100%',
        aspectRatio: 4 / 3,
    },
    animalName: {
        ...serifTextStyles.serifHeading,
        color: colors.minimalist.textDark,
        marginBottom: 4,
    },
    systemId: {
        fontSize: 14,
        color: colors.minimalist.textLight,
        marginBottom: spacing.lg,
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.xl,
    },
    infoCard: {
        marginBottom: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.minimalist.peachLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    infoText: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        lineHeight: 20,
    },
    actionButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: spacing.xl,
    },
    buttonGradient: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.white,
    },
    footer: {
        height: spacing.xxl,
    },
});
