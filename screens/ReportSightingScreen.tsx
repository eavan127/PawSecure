import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import { PhotoUploadBox } from '../components';
import { colors } from '../theme/colors';
import { serifTextStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { FloatingCard } from '../components/FloatingCard';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useReports } from '../contexts/ReportContext';
import { getCurrentLocation } from '../services/locationService';
import { createReport } from '../services/reportService';
import { getCurrentWeather, WeatherData } from '../services/weatherService';
import { useAuth } from '../contexts/AuthContext';

export const ReportSightingScreen = () => {
    const router = useRouter();
    const { addReport } = useReports();
    const { user } = useAuth();
    const params = useLocalSearchParams<{ imageUri?: string; aiResult?: string }>();

    // Parse AI result from JSON string if provided
    const aiResult = params.aiResult ? JSON.parse(params.aiResult) : null;

    // Initialize state with AI data if available
    const [photoUri, setPhotoUri] = useState<string>(params.imageUri || '');
    const [animalType, setAnimalType] = useState<string>(
        aiResult?.species === 'cat' ? 'cat' : 'dog'
    );
    const [condition, setCondition] = useState<string>(
        aiResult?.condition === 'injured' ? 'injured' : 'not_injured'
    );

    // Construct initial details based on AI analysis
    const initialDetails = aiResult ?
        `Breed: ${aiResult.breed}\nColor: ${aiResult.color}\nFeatures: ${aiResult.distinctiveFeatures?.join(', ') || 'N/A'}`
        : '';

    const [temperament, setTemperament] = useState<string>('calm');
    const [vaccinationStatus, setVaccinationStatus] = useState<'unknown' | 'yes' | 'no'>('unknown');
    const [neuteringStatus, setNeuteringStatus] = useState<'unknown' | 'yes' | 'no'>('unknown');
    const [additionalDetails, setAdditionalDetails] = useState<string>(initialDetails);
    const [isDetectingLocation, setIsDetectingLocation] = useState(true);
    const [location, setLocation] = useState({
        latitude: 37.7749,
        longitude: -122.4194,
    });
    const [locationName, setLocationName] = useState('Detecting location...');
    const [manualAddress, setManualAddress] = useState('');

    const handleEditAddress = () => {
        Alert.prompt(
            'Edit Address',
            'Enter the location manually:',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Save',
                    onPress: (text?: string) => {
                        if (text && text.trim()) {
                            setManualAddress(text.trim());
                            setLocationName(text.trim());
                        }
                    }
                }
            ],
            'plain-text',
            manualAddress || locationName
        );
    };

    useEffect(() => {
        // Get real GPS location on mount
        const fetchLocation = async () => {
            try {
                const result = await getCurrentLocation();
                if (result && result.coordinates) {
                    setLocation({
                        latitude: result.coordinates.latitude,
                        longitude: result.coordinates.longitude
                    });
                    setLocationName(`${result.coordinates.latitude.toFixed(4)}, ${result.coordinates.longitude.toFixed(4)}`);
                }
            } catch (error) {
                console.log('Location permission denied, using default');
                setLocationName('Location unavailable');
            } finally {
                setIsDetectingLocation(false);
            }
        };

        fetchLocation();
    }, []);

    // Fetch weather when location is available
    useEffect(() => {
        const fetchWeather = async () => {
            if (location.latitude && location.longitude && !isDetectingLocation) {
                const weatherData = await getCurrentWeather(location.latitude, location.longitude);
                if (weatherData) {
                    setWeather(weatherData);
                    console.log('🌤️ Weather fetched:', weatherData.condition, weatherData.temperature + '°C');
                }
            }
        };
        fetchWeather();
    }, [location, isDetectingLocation]);

    const [reportId, setReportId] = useState('Generating...');
    const [isSaving, setIsSaving] = useState(false);
    const [weather, setWeather] = useState<WeatherData | null>(null);

    const handleSubmit = async () => {
        if (!photoUri) {
            Alert.alert('Missing Photo', 'Please upload a photo of the animal');
            return;
        }

        if (!aiResult) {
            Alert.alert('Missing AI Analysis', 'Please use AI identification first');
            return;
        }

        if (!user) {
            Alert.alert('Not Logged In', 'Please log in to submit reports');
            return;
        }

        setIsSaving(true);

        try {
            console.log('📤 Creating report in Supabase...');

            // Create report in Supabase
            const newReport = await createReport({
                reporterId: user.id,
                reporterName: user.name,
                reporterPhone: user.phone,
                species: aiResult.species as 'dog' | 'cat' | 'unknown',
                breed: aiResult.breed,
                color: aiResult.color,
                distinctiveFeatures: aiResult.distinctiveFeatures,
                healthNotes: aiResult.healthNotes,
                isEmergency: aiResult.isEmergency || condition === 'injured',
                imageUrl: photoUri, // For now use local URI, can upload to storage later
                embedding: aiResult.embedding, // CLIP embedding from YOLO backend
                address: manualAddress || locationName,
                latitude: location.latitude,
                longitude: location.longitude,
                weatherCondition: weather?.condition,
                temperature: weather?.temperature,
                weatherAlert: weather?.alerts?.[0]?.event,
            });

            if (!newReport) {
                throw new Error('Failed to create report');
            }

            console.log('✅ Report created with ID:', newReport.reportId);
            setReportId(newReport.animalId);

            // Also save to context for local viewing
            addReport({
                animalType: animalType as 'dog' | 'cat',
                breed: aiResult?.breed || 'Unknown',
                color: aiResult?.color || 'Unknown',
                location: manualAddress || locationName,
                imageUri: photoUri,
                aiData: aiResult
            });

            Alert.alert(
                'Success! 🎉',
                `Report submitted with Animal ID: ${newReport.animalId}\n\nNGOs will be notified and can update the status.`,
                [
                    {
                        text: 'View Reports',
                        onPress: () => router.push('/report-history')
                    }
                ]
            );
        } catch (error: any) {
            console.error('❌ Error saving report:', error);
            Alert.alert(
                'Save Failed',
                `Could not save the report.\n\nError: ${error.message || 'Unknown error'}`
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.minimalist.textDark} />
                </Pressable>
                <Text style={styles.headerTitle}>Report a Sighting</Text>
                <View style={styles.reportIdBadge}>
                    <Text style={styles.reportIdText}>{reportId}</Text>
                </View>
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Photo Upload */}
                <FloatingCard shadow="soft" style={styles.section}>
                    <Text style={styles.sectionLabel}>Photo Evidence</Text>
                    <PhotoUploadBox
                        onImageSelected={setPhotoUri}
                        imageUri={photoUri}
                        required
                    />
                    {aiResult && (
                        <View style={[styles.aiBadge, { backgroundColor: colors.minimalist.coral }]}>
                            <Ionicons name="sparkles" size={14} color={colors.minimalist.white} />
                            <Text style={[styles.aiBadgeText, { color: colors.minimalist.white }]}>AI Analyzed</Text>
                        </View>
                    )}
                </FloatingCard>

                {/* AI Analysis Summary if available */}
                {aiResult && (
                    <View style={styles.section}>
                        <FloatingCard shadow="soft" style={{ backgroundColor: 'rgba(245, 164, 145, 0.1)' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <Ionicons name="scan-circle" size={24} color={colors.minimalist.coral} />
                                <Text style={{ fontWeight: 'bold', color: colors.minimalist.textDark }}>Gemini Analysis</Text>
                            </View>
                            <Text style={styles.aiSummaryText}>
                                Identified as {aiResult.size} {aiResult.color} {aiResult.breed}.
                                Confidence: {(aiResult.confidence * 100).toFixed(0)}%
                            </Text>
                        </FloatingCard>
                    </View>
                )}

                {/* Animal Type */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Animal Type</Text>
                    <FloatingCard shadow="soft">
                        <View style={styles.animalTypeContainer}>
                            <Ionicons name="paw" size={20} color={colors.minimalist.coral} />
                            <Text style={styles.animalTypeText}>
                                {animalType === 'dog' ? 'Dog' : 'Cat'}
                            </Text>
                            <Ionicons name="lock-closed" size={16} color={colors.minimalist.textLight} />
                        </View>
                    </FloatingCard>
                </View>

                {/* Location Detection */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Detection Location</Text>
                    <FloatingCard shadow="soft">
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    ...location,
                                    latitudeDelta: 0.1,
                                    longitudeDelta: 0.1,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                            >
                                <Marker coordinate={location} />
                            </MapView>
                        </View>
                        <View style={styles.locationRow}>
                            <View style={styles.locationStatus}>
                                <View
                                    style={[
                                        styles.statusDot,
                                        {
                                            backgroundColor: isDetectingLocation
                                                ? colors.minimalist.gentleYellow
                                                : colors.minimalist.greenDark,
                                        },
                                    ]}
                                />
                                <Text style={styles.locationText}>
                                    {isDetectingLocation ? 'Detecting location...' : 'Location detected'}
                                </Text>
                            </View>
                            <Pressable onPress={handleEditAddress}>
                                <Text style={styles.editAddressText}>Edit Address</Text>
                            </Pressable>
                        </View>
                    </FloatingCard>
                </View>

                {/* Condition & Temperament */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Condition & Temperament</Text>
                    <View style={styles.toggleRow}>
                        <Pressable
                            style={[styles.toggleButton, condition === 'injured' && styles.toggleButtonActive]}
                            onPress={() => setCondition('injured')}
                        >
                            <Ionicons
                                name="medical"
                                size={20}
                                color={
                                    condition === 'injured' ? colors.minimalist.white : colors.minimalist.textMedium
                                }
                            />
                            <Text
                                style={[styles.toggleText, condition === 'injured' && styles.toggleTextActive]}
                            >
                                Injured
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.toggleButton,
                                condition === 'not_injured' && styles.toggleButtonActive,
                            ]}
                            onPress={() => setCondition('not_injured')}
                        >
                            <Ionicons
                                name="checkmark-circle"
                                size={20}
                                color={
                                    condition === 'not_injured'
                                        ? colors.minimalist.white
                                        : colors.minimalist.textMedium
                                }
                            />
                            <Text
                                style={[
                                    styles.toggleText,
                                    condition === 'not_injured' && styles.toggleTextActive,
                                ]}
                            >
                                Not Injured
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.toggleRow}>
                        <Pressable
                            style={[styles.toggleButton, temperament === 'calm' && styles.toggleButtonActive]}
                            onPress={() => setTemperament('calm')}
                        >
                            <Ionicons
                                name="happy"
                                size={20}
                                color={
                                    temperament === 'calm' ? colors.minimalist.white : colors.minimalist.textMedium
                                }
                            />
                            <Text style={[styles.toggleText, temperament === 'calm' && styles.toggleTextActive]}>
                                Calm
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.toggleButton,
                                temperament === 'aggressive' && styles.toggleButtonActive,
                            ]}
                            onPress={() => setTemperament('aggressive')}
                        >
                            <Ionicons
                                name="warning"
                                size={20}
                                color={
                                    temperament === 'aggressive'
                                        ? colors.minimalist.white
                                        : colors.minimalist.textMedium
                                }
                            />
                            <Text
                                style={[
                                    styles.toggleText,
                                    temperament === 'aggressive' && styles.toggleTextActive,
                                ]}
                            >
                                Aggressive
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* Vaccination Status */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Vaccination Status</Text>
                    <Text style={styles.sectionHint}>Visible tags or marks</Text>
                    <View style={styles.triStateRow}>
                        {(['unknown', 'yes', 'no'] as const).map((value) => (
                            <Pressable
                                key={value}
                                style={[
                                    styles.triStateButton,
                                    vaccinationStatus === value && styles.triStateButtonActive,
                                ]}
                                onPress={() => setVaccinationStatus(value)}
                            >
                                <Text
                                    style={[
                                        styles.triStateText,
                                        vaccinationStatus === value && styles.triStateTextActive,
                                    ]}
                                >
                                    {value === 'unknown' ? 'Unknown' : value === 'yes' ? 'Yes' : 'No'}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Neutering / Spaying */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Neutering / Spaying</Text>
                    <Text style={styles.sectionHint}>Ear-tip notch or scar</Text>
                    <View style={styles.triStateRow}>
                        {(['unknown', 'yes', 'no'] as const).map((value) => (
                            <Pressable
                                key={value}
                                style={[
                                    styles.triStateButton,
                                    neuteringStatus === value && styles.triStateButtonActive,
                                ]}
                                onPress={() => setNeuteringStatus(value)}
                            >
                                <Text
                                    style={[
                                        styles.triStateText,
                                        neuteringStatus === value && styles.triStateTextActive,
                                    ]}
                                >
                                    {value === 'unknown' ? 'Unknown' : value === 'yes' ? 'Yes' : 'No'}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                    <View style={styles.hintRow}>
                        <Ionicons
                            name="information-circle-outline"
                            size={14}
                            color={colors.minimalist.textLight}
                        />
                        <Text style={styles.hintText}>If unsure, select Unknown</Text>
                    </View>
                </View>

                {/* Additional Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Additional Details</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Distinctive marks, specific behavior, collar color..."
                        placeholderTextColor={colors.minimalist.textLight}
                        multiline
                        numberOfLines={4}
                        value={additionalDetails}
                        onChangeText={setAdditionalDetails}
                        textAlignVertical="top"
                    />
                </View>

                {/* Info Disclaimer */}
                <View style={styles.disclaimerRow}>
                    <Ionicons name="information-circle" size={16} color={colors.minimalist.textMedium} />
                    <Text style={styles.disclaimerText}>
                        Information will be reviewed by verified rescue NGOs
                    </Text>
                </View>
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.submitContainer}>
                <Pressable onPress={handleSubmit} disabled={isSaving}>
                    <LinearGradient
                        colors={[colors.minimalist.coral, colors.minimalist.peach]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.submitButton, isSaving && { opacity: 0.6 }]}
                    >
                        {isSaving ? (
                            <>
                                <Text style={styles.submitButtonText}>Saving to Supabase...</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="send" size={20} color={colors.minimalist.white} />
                                <Text style={styles.submitButtonText}>Submit Report</Text>
                            </>
                        )}
                    </LinearGradient>
                </Pressable>
            </View>
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
        backgroundColor: colors.minimalist.white,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.minimalist.bgLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        ...serifTextStyles.serifSubheading,
        color: colors.minimalist.textDark,
        flex: 1,
        textAlign: 'center',
    },
    reportIdBadge: {
        backgroundColor: colors.minimalist.peachLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: 6,
        borderRadius: 8,
    },
    reportIdText: {
        fontSize: 11,
        color: colors.minimalist.coral,
        fontWeight: '600',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: 120,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: spacing.sm,
    },
    sectionHint: {
        fontSize: 12,
        color: colors.minimalist.textLight,
        marginBottom: spacing.sm,
    },
    animalTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    animalTypeText: {
        fontSize: 16,
        color: colors.minimalist.textDark,
        flex: 1,
        fontWeight: '500',
    },
    mapContainer: {
        height: 120,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: spacing.sm,
    },
    map: {
        flex: 1,
    },
    locationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    locationStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    locationText: {
        fontSize: 14,
        color: colors.minimalist.textDark,
        fontWeight: '500',
    },
    editAddressText: {
        fontSize: 14,
        color: colors.minimalist.coral,
        fontWeight: '600',
    },
    toggleRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        backgroundColor: colors.minimalist.white,
        paddingVertical: spacing.md,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.gray200,
    },
    toggleButtonActive: {
        backgroundColor: colors.minimalist.coral,
        borderColor: colors.minimalist.coral,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
    },
    toggleTextActive: {
        color: colors.minimalist.white,
    },
    triStateRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    triStateButton: {
        flex: 1,
        backgroundColor: colors.minimalist.white,
        paddingVertical: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.gray200,
    },
    triStateButtonActive: {
        backgroundColor: 'rgba(245, 164, 145, 0.15)',
        borderColor: colors.minimalist.coral,
    },
    triStateText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
    },
    triStateTextActive: {
        color: colors.minimalist.coral,
    },
    hintRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    hintText: {
        fontSize: 12,
        color: colors.minimalist.textLight,
    },
    textArea: {
        backgroundColor: colors.minimalist.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray200,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minHeight: 100,
        color: colors.minimalist.textDark,
        fontSize: 16,
    },
    disclaimerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.md,
    },
    disclaimerText: {
        fontSize: 12,
        color: colors.minimalist.textMedium,
        flex: 1,
    },
    submitContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        backgroundColor: colors.minimalist.white,
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
    },
    submitButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        borderRadius: 16,
        gap: spacing.sm,
    },
    submitButtonText: {
        fontSize: 18,
        color: colors.minimalist.white,
        fontWeight: '600',
    },
    aiBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: colors.minimalist.coral,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        zIndex: 10,
    },
    aiBadgeText: {
        color: colors.minimalist.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    aiSummaryText: {
        color: colors.minimalist.textDark,
        fontSize: 14,
        lineHeight: 20,
    },
});
