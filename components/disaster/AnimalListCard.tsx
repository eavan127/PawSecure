import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FloatingCard } from '../FloatingCard';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import type { DisasterAnimal } from '../../types/disaster';
import { getConditionLabel, getConditionBadgeColor } from '../../types/disaster';

interface AnimalListCardProps {
    animal: DisasterAnimal;
    onPress: (animal: DisasterAnimal) => void;
}

const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

export const AnimalListCard: React.FC<AnimalListCardProps> = ({
    animal,
    onPress,
}) => {
    const conditionColors = getConditionBadgeColor(animal.condition);

    return (
        <Pressable onPress={() => onPress(animal)}>
            {({ pressed }) => (
                <FloatingCard
                    shadow="soft"
                    style={[styles.card, pressed && styles.cardPressed]}
                >
                    <View style={styles.content}>
                        {animal.photos.length > 0 ? (
                            <Image
                                source={{ uri: animal.photos[0] }}
                                style={styles.image}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.placeholderImage}>
                                <Ionicons
                                    name={animal.animalType === 'cat' ? 'logo-octocat' : 'paw'}
                                    size={24}
                                    color={colors.minimalist.textLight}
                                />
                            </View>
                        )}

                        <View style={styles.info}>
                            <View style={styles.topRow}>
                                <Text style={styles.animalType}>
                                    {animal.animalType === 'cat' ? 'Cat' : 'Dog'}
                                </Text>
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
                            </View>

                            <View style={styles.locationRow}>
                                <Ionicons
                                    name="location-outline"
                                    size={14}
                                    color={colors.minimalist.textMedium}
                                />
                                <Text style={styles.locationText} numberOfLines={1}>
                                    {animal.locationName}
                                </Text>
                            </View>

                            <View style={styles.bottomRow}>
                                <Text style={styles.timeText}>
                                    {getTimeAgo(animal.reportedAt)}
                                </Text>
                                {animal.isAssigned && (
                                    <View style={styles.assignedBadge}>
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={12}
                                            color={colors.minimalist.successGreen}
                                        />
                                        <Text style={styles.assignedText}>Assigned</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        <Ionicons
                            name="chevron-forward"
                            size={20}
                            color={colors.minimalist.textLight}
                        />
                    </View>
                </FloatingCard>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: spacing.md,
        padding: spacing.md,
    },
    cardPressed: {
        opacity: 0.9,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    image: {
        width: 64,
        height: 64,
        borderRadius: 10,
    },
    placeholderImage: {
        width: 64,
        height: 64,
        borderRadius: 10,
        backgroundColor: colors.minimalist.bgLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    animalType: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    conditionBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    conditionText: {
        fontSize: 11,
        fontWeight: '600',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 6,
    },
    locationText: {
        flex: 1,
        fontSize: 13,
        color: colors.minimalist.textMedium,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    timeText: {
        fontSize: 12,
        color: colors.minimalist.textLight,
    },
    assignedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    assignedText: {
        fontSize: 11,
        color: colors.minimalist.successGreen,
    },
});
