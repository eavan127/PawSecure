import React from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { serifTextStyles } from '../theme/typography';
import { FloatingCard } from '../components/FloatingCard';
import { AnimalIdentity } from '../types';
import { AnimalIdentificationResult } from '../types/yolo';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

interface AnimalMatchResultScreenParams {
    capturedImage: string;
    aiResult: AnimalIdentificationResult;
    matches: AnimalIdentity[];
}

export const AnimalMatchResultScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const { user } = useAuth();
    const isNGO = user?.role === 'ngo';
    const { capturedImage, aiResult, matches } = route.params as AnimalMatchResultScreenParams;

    const matchedAnimal = matches[0]; // Display top match for now

    const handleConfirmMatch = () => {
        // Navigate to existing animal profile
        navigation.navigate('AnimalProfile', { animalId: matchedAnimal.id });
    };

    const handleDenyMatch = () => {
        // Create new report with captured data
        navigation.navigate('ReportSighting', {
            prefilledData: {
                imageUri: capturedImage,
                aiResult: aiResult
            }
        });
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.minimalist.textDark} />
                </Pressable>
                <Text style={styles.headerTitle}>Potential Match Found</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.description}>
                    We found an existing animal record that looks very similar to your photo.
                </Text>

                {/* Comparison View */}
                <View style={styles.comparisonContainer}>
                    <View style={styles.imageColumn}>
                        <Text style={styles.imageLabel}>Your Photo</Text>
                        <Image source={{ uri: capturedImage }} style={styles.compareImage} />
                    </View>

                    <View style={styles.matchIconResult}>
                        <View style={styles.matchBadge}>
                            <Text style={styles.matchPercentage}>High Match</Text>
                        </View>
                        <Ionicons name="git-compare-outline" size={24} color={colors.minimalist.textMedium} />
                    </View>

                    <View style={styles.imageColumn}>
                        <Text style={styles.imageLabel}>System Record</Text>
                        <Image source={{ uri: matchedAnimal.primaryImageUrl }} style={styles.compareImage} />
                    </View>
                </View>

                {/* Matched Animal Details */}
                <FloatingCard shadow="medium" style={styles.detailsCard}>
                    <View style={styles.idBadge}>
                        <Text style={styles.idText}>ID: {matchedAnimal.systemId}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Last Seen:</Text>
                        <Text style={styles.detailValue}>{new Date(matchedAnimal.lastSeenAt).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Location:</Text>
                        <Text style={styles.detailValue}>{matchedAnimal.lastSeenLocation}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Status:</Text>
                        <View style={[
                            styles.statusBadge,
                            matchedAnimal.status === 'rescued' && { backgroundColor: colors.minimalist.peachLight }, // Using peachLight as a safe background
                            matchedAnimal.status === 'waiting' && { backgroundColor: colors.minimalist.warmGray }
                        ]}>
                            <Text style={[
                                styles.statusText,
                                matchedAnimal.status === 'rescued' && { color: isNGO ? '#059669' : colors.minimalist.greenDark },
                                matchedAnimal.status === 'waiting' && { color: isNGO ? '#0891B2' : colors.minimalist.orange }
                            ]}>
                                {matchedAnimal.status.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </FloatingCard>

                <View style={styles.actionContainer}>
                    <Text style={styles.questionText}>Is this the same animal?</Text>

                    <Pressable style={styles.confirmButton} onPress={handleConfirmMatch}>
                        <LinearGradient
                            colors={isNGO ? ['#0891B2', '#A5E5ED'] : [colors.minimalist.greenDark, '#4CAF50']}
                            style={styles.gradientButton}
                        >
                            <Ionicons name="checkmark-circle" size={24} color={colors.minimalist.white} />
                            <Text style={styles.buttonText}>Yes, Same Animal</Text>
                        </LinearGradient>
                    </Pressable>

                    <Pressable style={styles.denyButton} onPress={handleDenyMatch}>
                        <Text style={styles.denyButtonText}>No, Create New Report</Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backButton: {
        padding: spacing.xs,
        marginRight: spacing.md,
    },
    headerTitle: {
        ...serifTextStyles.serifHeading,
        fontSize: 20,
        flex: 1,
        color: colors.minimalist.textDark,
    },
    content: {
        padding: spacing.lg,
    },
    description: {
        fontSize: 16,
        color: colors.minimalist.textMedium,
        marginBottom: spacing.xl,
        textAlign: 'center',
        lineHeight: 22,
    },
    comparisonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    imageColumn: {
        flex: 1,
        alignItems: 'center',
    },
    imageLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
        marginBottom: spacing.xs,
    },
    compareImage: {
        width: 120,
        height: 120,
        borderRadius: 16,
        backgroundColor: colors.gray200,
    },
    matchIconResult: {
        alignItems: 'center',
        paddingHorizontal: spacing.xs,
    },
    matchBadge: {
        backgroundColor: colors.minimalist.peachLight,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 4,
    },
    matchPercentage: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#0891B2',
    },
    detailsCard: {
        marginBottom: spacing.xxl,
    },
    idBadge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.gray200,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: spacing.md,
    },
    idText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    detailLabel: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        maxWidth: '60%',
        textAlign: 'right',
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    actionContainer: {
        gap: spacing.md,
        alignItems: 'center',
    },
    questionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.minimalist.textDark,
        marginBottom: spacing.sm,
    },
    confirmButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    gradientButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        gap: spacing.sm,
    },
    buttonText: {
        color: colors.minimalist.white,
        fontWeight: '600',
        fontSize: 16,
    },
    denyButton: {
        paddingVertical: spacing.md,
    },
    denyButtonText: {
        color: colors.minimalist.textMedium,
        fontSize: 16,
        fontWeight: '500',
    },
});
