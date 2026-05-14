import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Circle } from 'react-native-maps';
import { colors } from '../theme/colors';
import { serifTextStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { FloatingCard } from '../components/FloatingCard';
import { MinimalistStatusBadge } from '../components/MinimalistStatusBadge';

interface DisasterModeScreenProps {
    navigation: any;
    viewOnly?: boolean;
}

interface Animal {
    id: string;
    name: string;
    species: string;
    breed: string;
    priority: string;
    lat: number;
    lng: number;
    status: string;
}

interface RescueRecord {
    animal: Animal;
    assignedAt: Date;
    teamName: string;
    rescueStatus: 'dispatched' | 'in_progress' | 'rescued';
}

// Ipoh city center coordinates
const IPOH_CENTER = {
    latitude: 4.5975,
    longitude: 101.0901,
};

// At-risk animals in Ipoh flood zone (dogs and cats only)
const atRiskAnimals: Animal[] = [
    { id: '1', name: 'Bruno', species: 'dog', breed: 'Mixed Breed', priority: 'Critical', lat: 4.6015, lng: 101.0935, status: 'Stranded on car roof' },
    { id: '2', name: 'Mimi', species: 'cat', breed: 'Orange Tabby', priority: 'High', lat: 4.5940, lng: 101.0870, status: 'On rooftop, needs rescue' },
    { id: '3', name: 'Lucky', species: 'dog', breed: 'Local Mongrel', priority: 'High', lat: 4.5890, lng: 101.0820, status: 'Near riverbank, at risk' },
    { id: '4', name: 'Coco', species: 'cat', breed: 'Persian Mix', priority: 'Critical', lat: 4.6050, lng: 101.0880, status: 'Trapped in flooded house' },
    { id: '5', name: 'Brownie', species: 'dog', breed: 'Kampung Dog', priority: 'Medium', lat: 4.5920, lng: 101.0950, status: 'Wandering, appears healthy' },
];

export const DisasterModeScreen: React.FC<DisasterModeScreenProps> = ({ navigation, viewOnly = false }) => {
    const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [rescueHistory, setRescueHistory] = useState<RescueRecord[]>([]);

    const getSpeciesIcon = (species: string) => species === 'dog' ? '🐕' : '🐱';

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Critical': return '#DC2626';
            case 'High': return '#F59E0B';
            case 'Medium': return '#FBBF24';
            default: return colors.minimalist.textMedium;
        }
    };

    const handleAnimalPress = (animal: Animal) => {
        setSelectedAnimal(animal);
        setShowDetailModal(true);
    };

    const handleAssignRescue = () => {
        if (!selectedAnimal) return;

        Alert.alert(
            '🚨 Assign Rescue Team',
            `Are you sure you want to assign a rescue team to ${selectedAnimal.name}?\n\nLocation: Ipoh, Perak\nPriority: ${selectedAnimal.priority}\nStatus: ${selectedAnimal.status}`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Assign',
                    style: 'default',
                    onPress: () => {
                        // Add to rescue history
                        const teamNames = ['Alpha Team', 'Bravo Team', 'Charlie Team', 'Delta Team'];
                        const randomTeam = teamNames[Math.floor(Math.random() * teamNames.length)];

                        const newRecord: RescueRecord = {
                            animal: selectedAnimal,
                            assignedAt: new Date(),
                            teamName: randomTeam,
                            rescueStatus: 'dispatched',
                        };
                        setRescueHistory(prev => [newRecord, ...prev]);

                        Alert.alert(
                            '✅ Rescue Team Assigned',
                            `${randomTeam} has been dispatched to rescue ${selectedAnimal.name}.\n\nYou will receive updates on the rescue progress.`,
                            [{ text: 'OK', onPress: () => setShowDetailModal(false) }]
                        );
                    },
                },
            ]
        );
    };

    const handleNavigate = () => {
        if (!selectedAnimal) return;

        const { lat, lng } = selectedAnimal;

        // Use Google Maps URL which works on both iOS and Android
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

        Linking.openURL(url).catch(() => {
            Alert.alert('Error', 'Unable to open maps application.');
        });
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Ipoh Flood Emergency</Text>
                        <View style={styles.warningBadge}>
                            <Ionicons name="warning" size={16} color={colors.minimalist.redDark} />
                        </View>
                    </View>
                    {/* History Button - NGO Only */}
                    {!viewOnly && (
                        <Pressable style={styles.historyButton} onPress={() => setShowHistoryModal(true)}>
                            <Ionicons name="time" size={20} color={colors.minimalist.coral} />
                            {rescueHistory.length > 0 && (
                                <View style={styles.historyBadge}>
                                    <Text style={styles.historyBadgeText}>{rescueHistory.length}</Text>
                                </View>
                            )}
                        </Pressable>
                    )}
                </View>

                {/* Map Container - Centered on Ipoh */}
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: IPOH_CENTER.latitude,
                            longitude: IPOH_CENTER.longitude,
                            latitudeDelta: 0.04,
                            longitudeDelta: 0.04,
                        }}
                    >
                        {/* Main Flood Zone - Ipoh City Center */}
                        <Circle
                            center={IPOH_CENTER}
                            radius={2000}
                            fillColor="rgba(220, 38, 38, 0.15)"
                            strokeColor="#DC2626"
                            strokeWidth={2}
                        />
                        {/* Secondary affected area */}
                        <Circle
                            center={{ latitude: 4.5920, longitude: 101.0850 }}
                            radius={1200}
                            fillColor="rgba(245, 158, 11, 0.15)"
                            strokeColor="#F59E0B"
                            strokeWidth={2}
                        />

                        {/* Animal Markers with species-specific colors */}
                        {atRiskAnimals.map((animal) => (
                            <Marker
                                key={animal.id}
                                coordinate={{ latitude: animal.lat, longitude: animal.lng }}
                                pinColor={getPriorityColor(animal.priority)}
                                onPress={() => handleAnimalPress(animal)}
                            />
                        ))}
                    </MapView>

                    {/* Map Legend */}
                    <View style={styles.mapLegend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
                            <Text style={styles.legendText}>Critical</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                            <Text style={styles.legendText}>High</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#FBBF24' }]} />
                            <Text style={styles.legendText}>Medium</Text>
                        </View>
                    </View>
                </View>

                {/* Animal Detail Modal */}
                <Modal
                    visible={showDetailModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowDetailModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {selectedAnimal && (
                                <>
                                    {/* Header */}
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalSpeciesIcon}>{getSpeciesIcon(selectedAnimal.species)}</Text>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.modalAnimalName}>{selectedAnimal.name}</Text>
                                            <Text style={styles.modalBreed}>{selectedAnimal.breed}</Text>
                                        </View>
                                        <Pressable onPress={() => setShowDetailModal(false)} style={styles.closeButton}>
                                            <Ionicons name="close" size={24} color={colors.minimalist.textMedium} />
                                        </Pressable>
                                    </View>

                                    {/* Priority Badge */}
                                    <View style={[styles.modalPriorityBadge, { backgroundColor: getPriorityColor(selectedAnimal.priority) + '20' }]}>
                                        <View style={[styles.modalPriorityDot, { backgroundColor: getPriorityColor(selectedAnimal.priority) }]} />
                                        <Text style={[styles.modalPriorityText, { color: getPriorityColor(selectedAnimal.priority) }]}>
                                            {selectedAnimal.priority} Priority
                                        </Text>
                                    </View>

                                    {/* Status */}
                                    <View style={styles.statusSection}>
                                        <Text style={styles.statusLabel}>Current Status</Text>
                                        <Text style={styles.statusValue}>{selectedAnimal.status}</Text>
                                    </View>

                                    {/* Location */}
                                    <View style={styles.locationSection}>
                                        <Ionicons name="location" size={18} color={colors.minimalist.coral} />
                                        <Text style={styles.locationText}>
                                            Ipoh, Perak • {selectedAnimal.lat.toFixed(4)}, {selectedAnimal.lng.toFixed(4)}
                                        </Text>
                                    </View>

                                    {/* Action Buttons - Only for NGOs */}
                                    {!viewOnly ? (
                                        <View style={styles.modalActions}>
                                            <Pressable style={styles.rescueButton} onPress={handleAssignRescue}>
                                                <Ionicons name="hand-left" size={20} color="#fff" />
                                                <Text style={styles.rescueButtonText}>Assign Rescue Team</Text>
                                            </Pressable>
                                            <Pressable style={styles.navigateButton} onPress={handleNavigate}>
                                                <Ionicons name="navigate" size={20} color={colors.minimalist.coral} />
                                                <Text style={styles.navigateButtonText}>Navigate</Text>
                                            </Pressable>
                                        </View>
                                    ) : (
                                        <View style={styles.viewOnlyBanner}>
                                            <Ionicons name="eye" size={18} color={colors.minimalist.textMedium} />
                                            <Text style={styles.viewOnlyText}>View Only Mode</Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>
                    </View>
                </Modal>

                {/* Rescue History Modal */}
                <Modal
                    visible={showHistoryModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowHistoryModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.historyModalContent}>
                            <View style={styles.historyModalHeader}>
                                <Text style={styles.historyModalTitle}>🚑 Rescue History</Text>
                                <Pressable onPress={() => setShowHistoryModal(false)} style={styles.closeButton}>
                                    <Ionicons name="close" size={24} color={colors.minimalist.textMedium} />
                                </Pressable>
                            </View>

                            {rescueHistory.length === 0 ? (
                                <View style={styles.emptyHistory}>
                                    <Ionicons name="clipboard-outline" size={48} color={colors.minimalist.textLight} />
                                    <Text style={styles.emptyHistoryText}>No rescues assigned yet</Text>
                                    <Text style={styles.emptyHistorySubtext}>Assigned rescue teams will appear here</Text>
                                </View>
                            ) : (
                                <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
                                    {rescueHistory.map((record, index) => (
                                        <View key={index} style={styles.historyItem}>
                                            <View style={styles.historyItemHeader}>
                                                <Text style={styles.historyItemIcon}>
                                                    {getSpeciesIcon(record.animal.species)}
                                                </Text>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.historyItemName}>{record.animal.name}</Text>
                                                    <Text style={styles.historyItemBreed}>{record.animal.breed}</Text>
                                                </View>
                                                <View style={[
                                                    styles.rescueStatusBadge,
                                                    { backgroundColor: record.rescueStatus === 'rescued' ? '#10B981' : '#F59E0B' }
                                                ]}>
                                                    <Text style={styles.rescueStatusText}>
                                                        {record.rescueStatus === 'dispatched' ? '🚗 Dispatched' :
                                                            record.rescueStatus === 'in_progress' ? '🔄 In Progress' : '✅ Rescued'}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.historyItemDetails}>
                                                <View style={styles.historyDetailRow}>
                                                    <Ionicons name="people" size={14} color={colors.minimalist.textMedium} />
                                                    <Text style={styles.historyDetailText}>{record.teamName}</Text>
                                                </View>
                                                <View style={styles.historyDetailRow}>
                                                    <Ionicons name="time" size={14} color={colors.minimalist.textMedium} />
                                                    <Text style={styles.historyDetailText}>
                                                        {record.assignedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>
                            )}
                        </View>
                    </View>
                </Modal>
            </View>
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
        marginRight: spacing.md,
    },
    headerTextContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        ...serifTextStyles.serifSubheading,
        color: colors.minimalist.textDark,
        marginRight: spacing.sm,
    },
    warningBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.minimalist.peachLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    drawer: {
        backgroundColor: colors.minimalist.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: spacing.md,
        paddingHorizontal: spacing.lg,
        maxHeight: '40%',
    },
    drawerHandle: {
        width: 40,
        height: 4,
        backgroundColor: colors.gray300,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: spacing.md,
    },
    drawerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: spacing.md,
    },
    animalList: {
        flex: 1,
    },
    animalCard: {
        marginBottom: spacing.sm,
    },
    animalCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    animalInfo: {
        flex: 1,
    },
    animalName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    animalId: {
        fontSize: 13,
        color: colors.minimalist.textLight,
        marginTop: 2,
    },
    priorityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    priorityText: {
        fontSize: 12,
        color: colors.minimalist.textMedium,
        fontWeight: '600',
    },
    speciesIcon: {
        fontSize: 28,
        marginRight: spacing.md,
    },
    animalBreed: {
        fontSize: 12,
        color: colors.minimalist.textLight,
        marginTop: 2,
    },
    mapLegend: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        padding: spacing.sm,
        gap: 6,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 11,
        color: colors.minimalist.textMedium,
        fontWeight: '500',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.minimalist.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: spacing.xl,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalSpeciesIcon: {
        fontSize: 48,
        marginRight: spacing.md,
    },
    modalAnimalName: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.minimalist.textDark,
    },
    modalBreed: {
        fontSize: 14,
        color: colors.minimalist.textLight,
        marginTop: 2,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.minimalist.warmGray,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalPriorityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        marginBottom: spacing.lg,
    },
    modalPriorityDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    modalPriorityText: {
        fontSize: 14,
        fontWeight: '700',
    },
    statusSection: {
        backgroundColor: colors.minimalist.bgLight,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    statusLabel: {
        fontSize: 12,
        color: colors.minimalist.textLight,
        fontWeight: '600',
        marginBottom: 4,
    },
    statusValue: {
        fontSize: 15,
        color: colors.minimalist.textDark,
        fontWeight: '500',
    },
    locationSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
        gap: 8,
    },
    locationText: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
    },
    modalActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    rescueButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#DC2626',
        paddingVertical: spacing.md,
        borderRadius: 12,
        gap: 8,
    },
    rescueButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    navigateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.minimalist.peachLight,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: 12,
        gap: 8,
    },
    navigateButtonText: {
        color: colors.minimalist.coral,
        fontSize: 15,
        fontWeight: '600',
    },
    viewOnlyBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.minimalist.bgLight,
        paddingVertical: spacing.md,
        borderRadius: 12,
        gap: 8,
    },
    viewOnlyText: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
        fontWeight: '500',
    },
    // History Button Styles
    historyButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.minimalist.peachLight,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    historyBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.minimalist.coral,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    historyBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#fff',
    },
    // History Modal Styles
    historyModalContent: {
        backgroundColor: colors.minimalist.white,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: spacing.xl,
        maxHeight: '80%',
    },
    historyModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    historyModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.minimalist.textDark,
    },
    emptyHistory: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    emptyHistoryText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
        marginTop: spacing.md,
    },
    emptyHistorySubtext: {
        fontSize: 14,
        color: colors.minimalist.textLight,
        marginTop: spacing.sm,
    },
    historyList: {
        maxHeight: 400,
    },
    historyItem: {
        backgroundColor: colors.minimalist.bgLight,
        borderRadius: 16,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    historyItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    historyItemIcon: {
        fontSize: 28,
    },
    historyItemName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    historyItemBreed: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
    },
    rescueStatusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 8,
    },
    rescueStatusText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
    },
    historyItemDetails: {
        flexDirection: 'row',
        marginTop: spacing.sm,
        gap: spacing.lg,
    },
    historyDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    historyDetailText: {
        fontSize: 13,
        color: colors.minimalist.textMedium,
    },
});

