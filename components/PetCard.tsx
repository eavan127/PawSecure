import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, ViewStyle, ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface PetCardProps {
    name: string;
    age: string;
    type: 'dog' | 'cat';
    image?: ImageSourcePropType;
    imageUri?: string;
    isNeutered?: boolean;
    isVaccinated?: boolean;
    shelterName: string;
    shelterLocation: string;
    isFavorite?: boolean;
    onPress?: () => void;
    onFavoritePress?: () => void;
    style?: ViewStyle;
}

export const PetCard: React.FC<PetCardProps> = ({
    name,
    age,
    type,
    image,
    imageUri,
    isNeutered = false,
    isVaccinated = false,
    shelterName,
    shelterLocation,
    isFavorite = false,
    onPress,
    onFavoritePress,
    style,
}) => {
    return (
        <View style={[styles.container, theme.shadows.md, style]}>
            {/* Pet Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={image || { uri: imageUri || 'https://placekitten.com/400/300' }}
                    style={styles.image}
                    resizeMode="cover"
                />

                {/* Name/Age Badge */}
                <View style={styles.nameBadge}>
                    <Text style={styles.nameText}>{name} ({type === 'dog' ? 'Dog' : 'Cat'}, ~{age})</Text>
                </View>

                {/* Favorite Button */}
                <Pressable
                    style={[styles.favoriteButton, isFavorite && styles.favoriteButtonActive]}
                    onPress={onFavoritePress}
                >
                    <Ionicons
                        name={isFavorite ? 'heart' : 'heart-outline'}
                        size={20}
                        color={isFavorite ? theme.colors.danger : theme.colors.textPrimary}
                    />
                </Pressable>
            </View>

            {/* Status Badges */}
            <View style={styles.badgeRow}>
                {isNeutered && (
                    <View style={styles.statusBadge}>
                        <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                        <Text style={styles.statusText}>Neutered</Text>
                    </View>
                )}
                {isVaccinated && (
                    <View style={styles.statusBadge}>
                        <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                        <Text style={styles.statusText}>Vaccinated</Text>
                    </View>
                )}
            </View>

            {/* Shelter Info */}
            <View style={styles.shelterRow}>
                <Ionicons name="home" size={16} color={theme.colors.textMuted} />
                <View style={styles.shelterInfo}>
                    <Text style={styles.shelterName}>Shelter: {shelterName} • {shelterLocation}</Text>
                    <Text style={styles.shelterSubtext}>Adoption managed by NGO</Text>
                </View>
            </View>

            {/* View Details Button */}
            <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
                <LinearGradient
                    colors={[theme.colors.greenPrimary, theme.colors.greenLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>View Details</Text>
                    <Ionicons name="arrow-forward" size={16} color={theme.colors.textPrimary} />
                </LinearGradient>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.card,
        overflow: 'hidden',
        marginBottom: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.borderGlass,
    },
    imageContainer: {
        height: 180,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    nameBadge: {
        position: 'absolute',
        top: theme.spacing.md,
        left: theme.spacing.md,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.sm,
    },
    nameText: {
        ...theme.textStyles.body,
        color: theme.colors.textPrimary,
        fontWeight: '600',
        fontSize: 13,
    },
    favoriteButton: {
        position: 'absolute',
        top: theme.spacing.md,
        right: theme.spacing.md,
        width: 36,
        height: 36,
        borderRadius: theme.radius.full,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    favoriteButtonActive: {
        backgroundColor: 'rgba(255, 107, 157, 0.3)',
    },
    badgeRow: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        gap: theme.spacing.md,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusText: {
        ...theme.textStyles.caption,
        color: theme.colors.success,
        fontWeight: '500',
    },
    shelterRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    shelterInfo: {
        flex: 1,
    },
    shelterName: {
        ...theme.textStyles.body,
        color: theme.colors.textSecondary,
        fontSize: 13,
    },
    shelterSubtext: {
        ...theme.textStyles.caption,
        color: theme.colors.textMuted,
        fontSize: 11,
    },
    button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        marginHorizontal: theme.spacing.md,
        marginBottom: theme.spacing.md,
        borderRadius: theme.borderRadius.button,
        gap: theme.spacing.sm,
    },
    buttonText: {
        ...theme.textStyles.button,
        color: theme.colors.textPrimary,
        fontSize: 14,
    },
});
