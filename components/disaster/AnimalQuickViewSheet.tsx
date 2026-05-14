import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { DisasterAnimal } from '../../types/disaster';
import { getConditionLabel, getConditionBadgeColor } from '../../types/disaster';
import { AnimalPinIcon } from './AnimalMapPin';

interface AnimalQuickViewSheetProps {
    animal: DisasterAnimal | null;
    onViewDetails: (animal: DisasterAnimal) => void;
    onContactReporter: (animal: DisasterAnimal) => void;
    onClose: () => void;
}

export const AnimalQuickViewSheet = forwardRef<BottomSheet, AnimalQuickViewSheetProps>(({
    animal,
    onViewDetails,
    onContactReporter,
    onClose,
}, ref) => {
    const snapPoints = useMemo(() => ['35%'], []);

    const handleSheetChanges = useCallback((index: number) => {
        if (index === -1) {
            onClose();
        }
    }, [onClose]);

    if (!animal) return null;

    const conditionColors = getConditionBadgeColor(animal.condition);

    return (
        <BottomSheet
            ref={ref}
            index={-1}
            snapPoints={snapPoints}
            onChange={handleSheetChanges}
            enablePanDownToClose
            backgroundStyle={styles.sheetBackground}
            handleIndicatorStyle={styles.handleIndicator}
        >
            <BottomSheetView style={styles.content}>
                <View style={styles.previewContainer}>
                    {animal.photos.length > 0 ? (
                        <Image
                            source={{ uri: animal.photos[0] }}
                            style={styles.previewImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Ionicons
                                name="image-outline"
                                size={40}
                                color={colors.minimalist.textLight}
                            />
                        </View>
                    )}

                    <View style={styles.previewInfo}>
                        <View style={styles.animalTypeRow}>
                            <AnimalPinIcon
                                condition={animal.condition}
                                animalType={animal.animalType}
                                size="small"
                            />
                            <Text style={styles.animalType}>
                                {animal.animalType === 'cat' ? 'Cat' : 'Dog'}
                            </Text>
                        </View>

                        <View style={[
                            styles.conditionBadge,
                            { backgroundColor: conditionColors.bg }
                        ]}>
                            <Text style={[
                                styles.conditionText,
                                { color: conditionColors.text }
                            ]}>
                                {getConditionLabel(animal.condition)}
                            </Text>
                        </View>

                        <View style={styles.locationRow}>
                            <Ionicons
                                name="location"
                                size={14}
                                color={colors.minimalist.textMedium}
                            />
                            <Text style={styles.locationText}>
                                {animal.locationName}
                            </Text>
                        </View>
                    </View>
                </View>

                {animal.description && (
                    <Text style={styles.description} numberOfLines={2}>
                        {animal.description}
                    </Text>
                )}

                <View style={styles.actions}>
                    <Pressable
                        style={styles.primaryButton}
                        onPress={() => onViewDetails(animal)}
                    >
                        <Text style={styles.primaryButtonText}>View Details</Text>
                    </Pressable>

                    <Pressable
                        style={styles.secondaryButton}
                        onPress={() => onContactReporter(animal)}
                    >
                        <Ionicons
                            name="call-outline"
                            size={18}
                            color={colors.minimalist.textDark}
                        />
                        <Text style={styles.secondaryButtonText}>Contact</Text>
                    </Pressable>
                </View>
            </BottomSheetView>
        </BottomSheet>
    );
});

const styles = StyleSheet.create({
    sheetBackground: {
        backgroundColor: colors.minimalist.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    handleIndicator: {
        backgroundColor: colors.minimalist.border,
        width: 40,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    previewContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.md,
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    placeholderImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: colors.minimalist.bgLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    animalTypeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    animalType: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    conditionBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: spacing.xs,
    },
    conditionText: {
        fontSize: 12,
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locationText: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
    },
    description: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    primaryButton: {
        flex: 1,
        backgroundColor: colors.minimalist.disasterOrange,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: colors.minimalist.white,
        fontSize: 15,
        fontWeight: '600',
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 12,
        paddingHorizontal: spacing.lg,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.minimalist.border,
    },
    secondaryButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.minimalist.textDark,
    },
});
