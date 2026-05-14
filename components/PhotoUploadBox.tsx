import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface PhotoUploadBoxProps {
    onImageSelected: (uri: string) => void;
    imageUri?: string;
    required?: boolean;
}

export const PhotoUploadBox: React.FC<PhotoUploadBoxProps> = ({
    onImageSelected,
    imageUri,
    required = false,
}) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);

    const requestPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setHasPermission(status === 'granted');
        return status === 'granted';
    };

    const pickImage = async () => {
        const permitted = hasPermission ?? await requestPermission();

        if (!permitted) {
            Alert.alert(
                'Permission Required',
                'Please grant camera roll permissions to upload images.'
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            onImageSelected(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please grant camera permissions to take photos.'
            );
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]) {
            onImageSelected(result.assets[0].uri);
        }
    };

    const showOptions = () => {
        Alert.alert(
            'Add Photo',
            'Choose an option',
            [
                { text: 'Take Photo', onPress: takePhoto },
                { text: 'Choose from Library', onPress: pickImage },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    if (imageUri) {
        return (
            <Pressable style={styles.containerWithImage} onPress={showOptions}>
                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                <View style={styles.editOverlay}>
                    <Ionicons name="camera" size={24} color={theme.colors.textPrimary} />
                    <Text style={styles.editText}>Tap to change</Text>
                </View>
            </Pressable>
        );
    }

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                { opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={showOptions}
        >
            <View style={styles.iconContainer}>
                <Ionicons name="camera" size={32} color={theme.colors.greenPrimary} />
            </View>
            <Text style={styles.title}>
                Add Photo {required && <Text style={styles.required}>(Required)</Text>}
            </Text>
            <Text style={styles.subtitle}>Tap to upload or take a clear photo</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.card,
        borderWidth: 2,
        borderColor: theme.colors.borderGlass,
        borderStyle: 'dashed',
        paddingVertical: theme.spacing.xxxl,
        paddingHorizontal: theme.spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    containerWithImage: {
        borderRadius: theme.borderRadius.card,
        overflow: 'hidden',
        height: 200,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    editOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    editText: {
        ...theme.textStyles.body,
        color: theme.colors.textPrimary,
        fontWeight: '500',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: theme.radius.lg,
        backgroundColor: 'rgba(45, 122, 94, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    title: {
        ...theme.textStyles.h4,
        color: theme.colors.textPrimary,
        fontWeight: '600',
        marginBottom: theme.spacing.xs,
    },
    required: {
        color: theme.colors.textMuted,
        fontWeight: '400',
    },
    subtitle: {
        ...theme.textStyles.body,
        color: theme.colors.textMuted,
        fontSize: 13,
    },
});
