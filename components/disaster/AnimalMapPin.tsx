import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Marker } from 'react-native-maps';
import { colors } from '../../theme/colors';
import type { AnimalCondition, AnimalType } from '../../types/disaster';
import { getPinColor } from '../../types/disaster';

interface AnimalMapPinProps {
    id: string;
    latitude: number;
    longitude: number;
    condition: AnimalCondition;
    animalType: AnimalType;
    onPress: (id: string) => void;
}

export const AnimalMapPin: React.FC<AnimalMapPinProps> = ({
    id,
    latitude,
    longitude,
    condition,
    animalType,
    onPress,
}) => {
    const pinColor = getPinColor(condition);
    const animalIcon = animalType === 'cat' ? 'logo-octocat' : 'paw';

    return (
        <Marker
            coordinate={{ latitude, longitude }}
            onPress={() => onPress(id)}
        >
            <View style={styles.container}>
                <View style={[styles.pin, { backgroundColor: pinColor }]}>
                    <Ionicons
                        name={animalIcon}
                        size={16}
                        color={colors.minimalist.white}
                    />
                </View>
                <View style={[styles.pinTip, { borderTopColor: pinColor }]} />
            </View>
        </Marker>
    );
};

export const AnimalPinIcon: React.FC<{
    condition: AnimalCondition;
    animalType: AnimalType;
    size?: 'small' | 'medium' | 'large';
}> = ({ condition, animalType, size = 'medium' }) => {
    const pinColor = getPinColor(condition);
    const animalIcon = animalType === 'cat' ? 'logo-octocat' : 'paw';

    const sizeStyles = {
        small: { pin: 24, icon: 12 },
        medium: { pin: 32, icon: 16 },
        large: { pin: 40, icon: 20 },
    };

    const currentSize = sizeStyles[size];

    return (
        <View style={styles.iconContainer}>
            <View style={[
                styles.pin,
                {
                    backgroundColor: pinColor,
                    width: currentSize.pin,
                    height: currentSize.pin,
                    borderRadius: currentSize.pin / 2,
                }
            ]}>
                <Ionicons
                    name={animalIcon}
                    size={currentSize.icon}
                    color={colors.minimalist.white}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    pin: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    pinTip: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginTop: -2,
    },
    iconContainer: {
        alignItems: 'center',
    },
});
