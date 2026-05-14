import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { serifTextStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { FloatingCard } from '../components/FloatingCard';
import { MinimalistStatusBadge } from '../components/MinimalistStatusBadge';

interface NewAdoptionListingProps {
    navigation: any;
}

const adoptionAnimals = [
    { id: '1', name: 'Bailey', age: '2 years', temperament: ['Friendly', 'Calm', 'Trained'], image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&h=300&fit=crop' },
    { id: '2', name: 'Luna', age: '2 years', temperament: ['Friendly', 'Calm', 'Trained'], image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300&h=300&fit=crop' },
    { id: '3', name: 'Charlie', age: '3 years', temperament: ['Playful', 'Energetic', 'Trained'], image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&h=300&fit=crop' },
];

export const NewAdoptionListing: React.FC<NewAdoptionListingProps> = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.minimalist.textDark} />
                    </Pressable>
                    <Text style={styles.headerTitle}>Available for Adoption</Text>
                </View>

                {/* Ethical Notice Banner */}
                <FloatingCard style={styles.noticeBanner} backgroundColor={colors.minimalist.gentleYellow}>
                    <View style={styles.noticeContent}>
                        <Ionicons name="information-circle" size={20} color={colors.minimalist.textDark} />
                        <Text style={styles.noticeText}>
                            Adoption removes animal from tracking system. <Text style={styles.learnMore}>Learn more.</Text>
                        </Text>
                    </View>
                </FloatingCard>

                {/* Animal Cards */}
                {adoptionAnimals.map((animal) => (
                    <FloatingCard key={animal.id} style={styles.animalCard} shadow="soft">
                        <Image
                            source={{ uri: animal.image }}
                            style={styles.animalImage}
                            resizeMode="cover"
                        />
                        <View style={styles.animalInfo}>
                            <Text style={styles.animalName}>{animal.name}</Text>
                            <Text style={styles.animalAge}>{animal.age}</Text>

                            <View style={styles.temperamentRow}>
                                {animal.temperament.map((trait, index) => (
                                    <View key={index} style={styles.temperamentPill}>
                                        <Text style={styles.temperamentText}>{trait}</Text>
                                    </View>
                                ))}
                            </View>

                            <Pressable
                                style={styles.detailsButton}
                                onPress={() => navigation.navigate('AnimalProfile')}
                            >
                                <Text style={styles.detailsButtonText}>View Details</Text>
                            </Pressable>
                        </View>
                    </FloatingCard>
                ))}

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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.minimalist.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    headerTitle: {
        ...serifTextStyles.serifHeading,
        color: colors.minimalist.textDark,
    },
    noticeBanner: {
        marginBottom: spacing.lg,
    },
    noticeContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    noticeText: {
        flex: 1,
        fontSize: 14,
        color: colors.minimalist.textDark,
        marginLeft: spacing.sm,
        lineHeight: 20,
    },
    learnMore: {
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
    animalCard: {
        marginBottom: spacing.lg,
        overflow: 'hidden',
        padding: 0,
    },
    animalImage: {
        width: '100%',
        height: 200,
    },
    animalInfo: {
        padding: spacing.lg,
    },
    animalName: {
        ...serifTextStyles.serifSubheading,
        color: colors.minimalist.textDark,
        marginBottom: 4,
    },
    animalAge: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        marginBottom: spacing.md,
    },
    temperamentRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.lg,
        gap: spacing.xs,
    },
    temperamentPill: {
        backgroundColor: colors.minimalist.peachLight,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
        borderRadius: 16,
    },
    temperamentText: {
        fontSize: 13,
        color: colors.minimalist.textDark,
        fontWeight: '500',
    },
    detailsButton: {
        backgroundColor: colors.minimalist.orange,
        paddingVertical: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
    },
    detailsButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.white,
    },
    footer: {
        height: spacing.xxl,
    },
});
