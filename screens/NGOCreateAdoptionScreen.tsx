/**
 * NGO Create Adoption Screen
 * Screen for NGOs to create adoption posts from rescued animals in shelter
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useAuth } from '../contexts/AuthContext';
import adoptionService from '../services/adoptionService';
import ngoService from '../services/ngoService';

type Gender = 'male' | 'female' | 'unknown';
type Size = 'small' | 'medium' | 'large';

export default function NGOCreateAdoptionScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const params = useLocalSearchParams<{
        reportId?: string;
        animalId?: string;
        species?: string;
        breed?: string;
        color?: string;
        imageUrl?: string;
    }>();

    // Form state
    const [name, setName] = useState('');
    const [ageEstimate, setAgeEstimate] = useState('');
    const [gender, setGender] = useState<Gender>('unknown');
    const [size, setSize] = useState<Size>('medium');
    const [healthStatus, setHealthStatus] = useState('');
    const [temperament, setTemperament] = useState('');
    const [goodWithChildren, setGoodWithChildren] = useState(false);
    const [goodWithPets, setGoodWithPets] = useState(false);
    const [isVaccinated, setIsVaccinated] = useState(false);
    const [isNeutered, setIsNeutered] = useState(false);
    const [specialNeeds, setSpecialNeeds] = useState('');
    const [adoptionFee, setAdoptionFee] = useState('');
    const [requirements, setRequirements] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Required Field', 'Please enter a name for the animal.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Get NGO profile
            let ngoProfile = null;
            if (user?.id) {
                ngoProfile = await ngoService.getNgoProfileByUserId(user.id);
            }

            const post = await adoptionService.createAdoptionPost({
                reportId: params.reportId,
                animalId: params.animalId || `ANIMAL-${Date.now()}`,
                ngoId: ngoProfile?.id || 'default-ngo',
                ngoName: ngoProfile?.organizationName || user?.name || 'NGO',
                name: name.trim(),
                species: params.species || 'dog',
                breed: params.breed,
                ageEstimate: ageEstimate.trim() || undefined,
                gender,
                size,
                healthStatus: healthStatus.trim() || undefined,
                temperament: temperament.trim() || undefined,
                goodWithChildren,
                goodWithPets,
                isVaccinated,
                isNeutered,
                specialNeeds: specialNeeds.trim() || undefined,
                photos: params.imageUrl ? [params.imageUrl] : [],
                adoptionFee: adoptionFee ? parseFloat(adoptionFee) : undefined,
                requirements: requirements.trim() || undefined,
            });

            if (post) {
                Alert.alert(
                    '🎉 Success!',
                    'Adoption post created successfully! It will now appear in the community feed.',
                    [{ text: 'OK', onPress: () => router.back() }]
                );
            } else {
                throw new Error('Failed to create post');
            }
        } catch (error) {
            console.error('Error creating adoption post:', error);
            Alert.alert('Error', 'Failed to create adoption post. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.minimalist.textDark} />
                </Pressable>
                <Text style={styles.headerTitle}>Create Adoption Post</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Animal Preview */}
                {params.imageUrl && (
                    <View style={styles.imagePreview}>
                        <Image source={{ uri: params.imageUrl }} style={styles.previewImage} />
                        <View style={styles.animalIdBadge}>
                            <Text style={styles.animalIdText}>{params.animalId || 'New Animal'}</Text>
                        </View>
                    </View>
                )}

                {/* Basic Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Give the animal a name"
                            placeholderTextColor={colors.minimalist.textLight}
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Estimated Age</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., 2 years, 6 months, puppy"
                            placeholderTextColor={colors.minimalist.textLight}
                            value={ageEstimate}
                            onChangeText={setAgeEstimate}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.buttonGroup}>
                            {(['male', 'female', 'unknown'] as Gender[]).map((g) => (
                                <Pressable
                                    key={g}
                                    style={[styles.selectButton, gender === g && styles.selectButtonActive]}
                                    onPress={() => setGender(g)}
                                >
                                    <Text style={[styles.selectButtonText, gender === g && styles.selectButtonTextActive]}>
                                        {g === 'male' ? '♂ Male' : g === 'female' ? '♀ Female' : '? Unknown'}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Size</Text>
                        <View style={styles.buttonGroup}>
                            {(['small', 'medium', 'large'] as Size[]).map((s) => (
                                <Pressable
                                    key={s}
                                    style={[styles.selectButton, size === s && styles.selectButtonActive]}
                                    onPress={() => setSize(s)}
                                >
                                    <Text style={[styles.selectButtonText, size === s && styles.selectButtonTextActive]}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Health & Behavior Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Health & Behavior</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Health Status</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Fully recovered, Special needs"
                            placeholderTextColor={colors.minimalist.textLight}
                            value={healthStatus}
                            onChangeText={setHealthStatus}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Temperament</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Friendly, Shy, Playful"
                            placeholderTextColor={colors.minimalist.textLight}
                            value={temperament}
                            onChangeText={setTemperament}
                        />
                    </View>

                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Ionicons name="medkit" size={20} color="#059669" />
                            <Text style={styles.toggleLabel}>Vaccinated</Text>
                        </View>
                        <Switch
                            value={isVaccinated}
                            onValueChange={setIsVaccinated}
                            trackColor={{ false: '#E5E7EB', true: '#A7F3D0' }}
                            thumbColor={isVaccinated ? '#059669' : '#9CA3AF'}
                        />
                    </View>

                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Ionicons name="cut" size={20} color="#7C3AED" />
                            <Text style={styles.toggleLabel}>Neutered/Spayed</Text>
                        </View>
                        <Switch
                            value={isNeutered}
                            onValueChange={setIsNeutered}
                            trackColor={{ false: '#E5E7EB', true: '#DDD6FE' }}
                            thumbColor={isNeutered ? '#7C3AED' : '#9CA3AF'}
                        />
                    </View>

                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Ionicons name="happy" size={20} color="#F59E0B" />
                            <Text style={styles.toggleLabel}>Good with Children</Text>
                        </View>
                        <Switch
                            value={goodWithChildren}
                            onValueChange={setGoodWithChildren}
                            trackColor={{ false: '#E5E7EB', true: '#FDE68A' }}
                            thumbColor={goodWithChildren ? '#F59E0B' : '#9CA3AF'}
                        />
                    </View>

                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Ionicons name="paw" size={20} color="#EC4899" />
                            <Text style={styles.toggleLabel}>Good with Other Pets</Text>
                        </View>
                        <Switch
                            value={goodWithPets}
                            onValueChange={setGoodWithPets}
                            trackColor={{ false: '#E5E7EB', true: '#FBCFE8' }}
                            thumbColor={goodWithPets ? '#EC4899' : '#9CA3AF'}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Special Needs (if any)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe any special care requirements..."
                            placeholderTextColor={colors.minimalist.textLight}
                            value={specialNeeds}
                            onChangeText={setSpecialNeeds}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Adoption Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Adoption Details</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Adoption Fee (RM)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00 (Leave empty if free)"
                            placeholderTextColor={colors.minimalist.textLight}
                            value={adoptionFee}
                            onChangeText={setAdoptionFee}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Adoption Requirements</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="e.g., Home visit required, Yard preferred..."
                            placeholderTextColor={colors.minimalist.textLight}
                            value={requirements}
                            onChangeText={setRequirements}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Submit Button */}
            <View style={styles.footer}>
                <Pressable
                    style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="heart" size={20} color="#fff" />
                            <Text style={styles.submitButtonText}>Create Adoption Post</Text>
                        </>
                    )}
                </Pressable>
            </View>
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
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.minimalist.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.minimalist.borderLight,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    container: {
        flex: 1,
    },
    imagePreview: {
        height: 200,
        margin: spacing.md,
        borderRadius: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    animalIdBadge: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    animalIdText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        backgroundColor: colors.minimalist.white,
        marginHorizontal: spacing.md,
        marginBottom: spacing.md,
        borderRadius: 16,
        padding: spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        marginBottom: spacing.md,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.minimalist.bgLight,
        borderRadius: 12,
        padding: spacing.md,
        fontSize: 15,
        color: colors.minimalist.textDark,
    },
    textArea: {
        minHeight: 80,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    selectButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 10,
        backgroundColor: colors.minimalist.bgLight,
        alignItems: 'center',
    },
    selectButtonActive: {
        backgroundColor: '#7C3AED',
    },
    selectButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
    },
    selectButtonTextActive: {
        color: '#fff',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.minimalist.borderLight,
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    toggleLabel: {
        fontSize: 15,
        color: colors.minimalist.textDark,
    },
    bottomSpacing: {
        height: 100,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.minimalist.white,
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.minimalist.borderLight,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#7C3AED',
        paddingVertical: spacing.md,
        borderRadius: 12,
        gap: spacing.sm,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});
