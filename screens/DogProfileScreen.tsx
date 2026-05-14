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

interface ActivityItem {
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    icon: keyof typeof Ionicons.glyphMap;
}

const mockActivities: ActivityItem[] = [
    {
        id: '1',
        type: 'location',
        title: 'Downtown Metro - Gate 4',
        description: 'Spotted by Volunteer Sarah near the west entrance. Appeared calm but slightly dehydrated.',
        timestamp: 'Last seen • 2 hours ago',
        icon: 'location',
    },
    {
        id: '2',
        type: 'medical',
        title: 'Rabies Vaccination',
        description: 'Administered at PawGuard Field Clinic #2. Batch: RX-9921',
        timestamp: 'Medical log • Sept 15',
        icon: 'medical',
    },
    {
        id: '3',
        type: 'intake',
        title: 'Profile Created via AI Scan',
        description: 'Initial recognition profile generated from mobile upload.',
        timestamp: 'Initial intake • Sept 10',
        icon: 'camera',
    },
];

export const DogProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { user } = useAuth();
    const isNGO = user?.role === 'ngo';
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Back and Share Buttons */}
                <View style={styles.headerButtons}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.minimalist.textDark} />
                    </Pressable>
                    <Pressable style={styles.iconButton}>
                        <Ionicons name="share-social" size={24} color={colors.minimalist.textDark} />
                    </Pressable>
                </View>

                {/* Image Card */}
                <FloatingCard style={styles.imageCard} shadow="medium">
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="paw" size={80} color={colors.minimalist.textLight} />
                    </View>
                </FloatingCard>

                {/* Profile Content */}
                <View style={styles.content}>
                    {/* Status Badges */}
                    <View style={styles.badgeRow}>
                        <MinimalistStatusBadge label="High Priority" variant="atRisk" />
                    </View>

                    {/* Name & ID */}
                    <Text style={styles.name}>Buddy</Text>
                    <Text style={styles.id}>
                        ID: <Text style={styles.idValue}>#PG-8821</Text> • Spotted 2h ago
                    </Text>

                    {/* Status Row */}
                    <View style={styles.statusRow}>
                        <MinimalistStatusBadge label="At Risk" variant="atRisk" icon="alert-circle" />
                        <MinimalistStatusBadge label="Vaccinated" variant="vaccinated" icon="checkmark-circle" />
                        <MinimalistStatusBadge label="Neutered" variant="neutered" icon="checkmark-circle" />
                    </View>

                    {/* AI Identity Section */}
                    <FloatingCard style={styles.section} shadow="soft">
                        <View style={styles.sectionHeader}>
                            <Ionicons name="sparkles" size={20} color={isNGO ? '#0891B2' : colors.minimalist.coral} />
                            <Text style={styles.sectionTitle}>AI-Generated  Identity</Text>
                        </View>

                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Breed</Text>
                                <Text style={styles.infoValue}>Labrador Mix</Text>
                                <Text style={styles.infoSubtitle}>94% Match</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Size</Text>
                                <Text style={styles.infoValue}>Medium</Text>
                                <Text style={styles.infoSubtitle}>~18.5 kg</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Color</Text>
                                <Text style={styles.infoValue}>Golden Tan</Text>
                            </View>
                        </View>
                    </FloatingCard>

                    {/* Activity History */}
                    <Text style={styles.activityTitle}>Activity & Medical History</Text>
                    {mockActivities.map((activity) => (
                        <FloatingCard key={activity.id} style={styles.activityCard} shadow="soft">
                            <View style={styles.activityRow}>
                                <View style={styles.activityIcon}>
                                    <Ionicons name={activity.icon} size={20} color={isNGO ? '#0891B2' : colors.minimalist.coral} />
                                </View>
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityTitle}>{activity.title}</Text>
                                    <Text style={styles.activityDescription}>{activity.description}</Text>
                                    <Text style={styles.activityTimestamp}>{activity.timestamp}</Text>
                                </View>
                            </View>
                        </FloatingCard>
                    ))}

                    {/* Action Buttons */}
                    <Pressable style={styles.primaryButton}>
                        <LinearGradient
                            colors={isNGO ? ['#A5E5ED', '#BBF3DE'] : [colors.minimalist.coral, colors.minimalist.mutedOrange]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Ionicons name="shield-checkmark" size={20} color={isNGO ? '#0891B2' : colors.minimalist.white} />
                            <Text style={[styles.buttonText, isNGO && { color: '#0891B2' }]}>Initiate Rescue</Text>
                        </LinearGradient>
                    </Pressable>

                    <Pressable style={[styles.secondaryButton, isNGO && { borderColor: '#A5E5ED' }]}>
                        <Ionicons name="heart" size={20} color={isNGO ? '#0891B2' : colors.minimalist.coral} />
                        <Text style={[styles.secondaryButtonText, isNGO && { color: '#0891B2' }]}>Adoption</Text>
                    </Pressable>
                </View>
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
        paddingBottom: spacing.xxxl,
    },
    headerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.minimalist.white,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    imageCard: {
        marginHorizontal: spacing.lg,
        padding: 0,
        overflow: 'hidden',
        marginBottom: spacing.lg,
    },
    imagePlaceholder: {
        height: 300,
        backgroundColor: colors.minimalist.bgLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        paddingHorizontal: spacing.lg,
    },
    badgeRow: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    name: {
        ...serifTextStyles.serifHeading,
        color: colors.minimalist.textDark,
        marginBottom: 4,
    },
    id: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        marginBottom: spacing.lg,
    },
    idValue: {
        color: '#0891B2',
        fontWeight: '600',
    },
    statusRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.xl,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginLeft: spacing.sm,
    },
    infoGrid: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    infoItem: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.minimalist.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: 2,
    },
    infoSubtitle: {
        fontSize: 12,
        color: colors.minimalist.textMedium,
    },
    activityTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: spacing.md,
    },
    activityCard: {
        marginBottom: spacing.sm,
    },
    activityRow: {
        flexDirection: 'row',
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(165, 229, 237, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    activityContent: {
        flex: 1,
    },
    activityDescription: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        lineHeight: 20,
        marginTop: 2,
    },
    activityTimestamp: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.minimalist.textLight,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: spacing.xs,
    },
    primaryButton: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: spacing.xl,
    },
    buttonGradient: {
        flexDirection: 'row',
        paddingVertical: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.white,
    },
    secondaryButton: {
        flexDirection: 'row',
        backgroundColor: colors.minimalist.white,
        paddingVertical: spacing.lg,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        marginTop: spacing.md,
        borderWidth: 2,
        borderColor: colors.minimalist.coral,
    },
    secondaryButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.coral,
    },
});
