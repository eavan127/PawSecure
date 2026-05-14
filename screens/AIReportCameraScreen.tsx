import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { serifTextStyles } from '../theme/typography';
import { FloatingCard } from '../components/FloatingCard';
import { AnimalIdentificationResult } from '../types/yolo';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { yoloBackendService } from '../services/yoloBackendService';

export const AIReportCameraScreen = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnimalIdentificationResult | null>(null);

    const isNGO = user?.role === 'ngo';
    const accentColor = isNGO ? '#0891B2' : colors.minimalist.coral;
    const subtleAccentBg = isNGO ? 'rgba(165, 229, 237, 0.2)' : 'rgba(245, 164, 145, 0.15)';
    const gradientColors = (isNGO ? ['#A5E5ED', '#BBF3DE'] : [colors.minimalist.coral, colors.minimalist.peach]) as [string, string, ...string[]];
    const secondaryBorderColor = isNGO ? '#A5E5ED' : colors.minimalist.coral;
    const secondaryTextColor = isNGO ? '#0891B2' : colors.minimalist.coral;

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Camera permission is required to identify animals.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled) {
                analyzeImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to open camera');
            console.error(error);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: true,
                quality: 0.5,
            });

            if (!result.canceled) {
                analyzeImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
            console.error(error);
        }
    };

    const analyzeImage = async (uri: string) => {
        setImageUri(uri);
        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            console.log('🎯 Starting YOLO AI analysis...');

            // Use YOLO Backend Service for detection
            const yoloResult = await yoloBackendService.detectAnimals(uri);

            // Check if any animal was detected
            if (!yoloResult.success || !yoloResult.primary_detection) {
                console.log('⚠️ YOLO: No dog/cat detected');
                Alert.alert('No Animal Detected', 'Please try taking a clearer photo of a dog or cat.');
                setIsAnalyzing(false);
                return;
            }

            const detection = yoloResult.primary_detection;
            console.log('✅ YOLO detected:', detection.class_name, 'with confidence:', detection.confidence);

            // Map YOLO response to AnimalIdentificationResult
            const result: AnimalIdentificationResult = {
                species: detection.class_name as 'dog' | 'cat',
                breed: 'Unknown', // YOLO doesn't detect breed
                color: 'Unknown', // YOLO doesn't detect color
                distinctiveFeatures: [`Detected by YOLO with ${(detection.confidence * 100).toFixed(1)}% confidence`],
                healthNotes: 'Visual analysis only - no health concerns detected',
                isEmergency: false,
                confidence: detection.confidence,
                embedding: yoloResult.embedding || undefined, // Store CLIP embedding if available
            };

            setAnalysisResult(result);
            setIsAnalyzing(false);

        } catch (error: any) {
            const errorMsg = error?.message || 'Unknown error';
            console.error('❌ YOLO analysis failed:', errorMsg);
            Alert.alert(
                'Analysis Failed',
                `Could not analyze the image. Please check your YOLO server connection.\n\nError: ${errorMsg}`
            );
            setIsAnalyzing(false);
        }
    };

    const handleContinue = () => {
        if (imageUri && analysisResult) {
            router.push({
                pathname: '/ReportSighting',
                params: {
                    imageUri,
                    aiResult: JSON.stringify(analysisResult)
                }
            });
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="close" size={24} color={colors.minimalist.textDark} />
                </Pressable>
                <Text style={styles.headerTitle}>AI Identification</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {!imageUri ? (
                    <View style={styles.placeholderContainer}>
                        <View style={[styles.illustrationCircle, { backgroundColor: subtleAccentBg }]}>
                            <Ionicons name="scan-outline" size={64} color={accentColor} />
                        </View>
                        <Text style={styles.title}>Identify Animal</Text>
                        <Text style={styles.subtitle}>
                            Take a photo or upload an image. PawGuard AI will identify the species, breed, and health concerns.
                        </Text>

                        <View style={styles.buttonRow}>
                            <Pressable style={styles.actionButton} onPress={takePhoto}>
                                <LinearGradient
                                    colors={gradientColors}
                                    style={styles.gradient}
                                >
                                    <Ionicons name="camera" size={24} color={colors.minimalist.white} />
                                    <Text style={styles.buttonText}>Camera</Text>
                                </LinearGradient>
                            </Pressable>

                            <Pressable style={styles.actionButton} onPress={pickImage}>
                                <View style={[styles.secondaryButton, { borderColor: secondaryBorderColor }]}>
                                    <Ionicons name="images" size={24} color={secondaryTextColor} />
                                    <Text style={[styles.secondaryButtonText, { color: secondaryTextColor }]}>Gallery</Text>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                ) : (
                    <View style={styles.resultContainer}>
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />

                        {isAnalyzing ? (
                            <View style={styles.analyzingOverlay}>
                                <ActivityIndicator size="large" color={colors.minimalist.white} />
                                <Text style={styles.analyzingText}>Analyzing image...</Text>
                            </View>
                        ) : analysisResult ? (
                            <View style={styles.resultCard}>
                                <FloatingCard shadow="medium">
                                    <View style={styles.resultHeader}>
                                        <Ionicons
                                            name={analysisResult.isEmergency ? "alert-circle" : "checkmark-circle"}
                                            size={32}
                                            color={analysisResult.isEmergency ? colors.minimalist.errorRed : colors.minimalist.greenDark}
                                        />
                                        <Text style={styles.resultTitle}>
                                            {analysisResult.isEmergency ? '⚠️ Emergency Case' : 'Scan Complete'}
                                        </Text>
                                    </View>

                                    {analysisResult.species !== 'unknown' && (
                                        <View style={styles.attributesList}>
                                            <View style={styles.attributeRow}>
                                                <Text style={styles.attributeLabel}>Species:</Text>
                                                <Text style={styles.attributeValue}>{analysisResult.species.toUpperCase()}</Text>
                                            </View>
                                            <View style={styles.attributeRow}>
                                                <Text style={styles.attributeLabel}>Breed:</Text>
                                                <Text style={styles.attributeValue}>{analysisResult.breed}</Text>
                                            </View>
                                            <View style={styles.attributeRow}>
                                                <Text style={styles.attributeLabel}>Color:</Text>
                                                <Text style={styles.attributeValue}>{analysisResult.color}</Text>
                                            </View>
                                            <View style={styles.attributeRow}>
                                                <Text style={styles.attributeLabel}>Health Status:</Text>
                                                <Text style={[
                                                    styles.attributeValue,
                                                    analysisResult.isEmergency && { color: colors.minimalist.errorRed }
                                                ]}>
                                                    {analysisResult.healthNotes}
                                                </Text>
                                            </View>
                                            {analysisResult.distinctiveFeatures && (
                                                <View style={styles.attributeRow}>
                                                    <Text style={styles.attributeLabel}>Features:</Text>
                                                    <Text style={styles.attributeValue}>{analysisResult.distinctiveFeatures}</Text>
                                                </View>
                                            )}
                                        </View>
                                    )}

                                    <Pressable
                                        style={[styles.continueButton, { backgroundColor: isNGO ? '#A5E5ED' : colors.minimalist.coral }]}
                                        onPress={handleContinue}
                                    >
                                        <Text style={[styles.continueButtonText, { color: isNGO ? '#0891B2' : colors.minimalist.white }]}>Create Report with this Data</Text>
                                        <Ionicons name="arrow-forward" size={20} color={isNGO ? '#0891B2' : colors.minimalist.white} />
                                    </Pressable>

                                    <Pressable
                                        style={styles.retakeButton}
                                        onPress={() => setImageUri(null)}
                                    >
                                        <Text style={styles.retakeButtonText}>Retake Photo</Text>
                                    </Pressable>
                                </FloatingCard>
                            </View>
                        ) : null}
                    </View>
                )}
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
    },
    headerTitle: {
        ...serifTextStyles.serifSubheading,
        flex: 1,
        textAlign: 'center',
        marginRight: 32, // Balance back button
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.lg,
    },
    placeholderContainer: {
        alignItems: 'center',
    },
    illustrationCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(165, 229, 237, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.minimalist.textDark,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: colors.minimalist.textMedium,
        textAlign: 'center',
        marginBottom: spacing.xxl,
        lineHeight: 24,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
    },
    actionButton: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    gradient: {
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
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        gap: spacing.sm,
        backgroundColor: colors.minimalist.white,
        borderWidth: 1,
        borderColor: '#A5E5ED',
        borderRadius: 16,
    },
    secondaryButtonText: {
        color: '#0891B2',
        fontWeight: '600',
        fontSize: 16,
    },
    resultContainer: {
        flex: 1,
        width: '100%',
    },
    previewImage: {
        width: '100%',
        height: 300,
        borderRadius: 24,
        marginBottom: spacing.lg,
    },
    analyzingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 24,
    },
    analyzingText: {
        color: colors.minimalist.white,
        marginTop: spacing.md,
        fontSize: 16,
        fontWeight: '600',
    },
    resultCard: {
        width: '100%',
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.minimalist.textDark,
    },
    attributesList: {
        marginBottom: spacing.xl,
    },
    attributeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    attributeLabel: {
        color: colors.minimalist.textMedium,
        fontSize: 15,
    },
    attributeValue: {
        color: colors.minimalist.textDark,
        fontWeight: '600',
        fontSize: 15,
        flex: 1,
        textAlign: 'right',
    },
    continueButton: {
        backgroundColor: '#A5E5ED',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.md,
        gap: spacing.xs,
    },
    continueButtonText: {
        color: '#0891B2',
        fontWeight: '600',
        fontSize: 16,
    },
    retakeButton: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    retakeButtonText: {
        color: colors.minimalist.textMedium,
        fontSize: 14,
    },
});
