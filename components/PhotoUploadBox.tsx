/**
 * PhotoUploadBox — web-compatible image picker.
 * Uses a hidden <input type="file"> instead of expo-image-picker.
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

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
    const inputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => inputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const uri = URL.createObjectURL(file);
        onImageSelected(uri);
    };

    return (
        <Pressable
            style={({ pressed }) => [styles.container, imageUri && styles.hasImage, { opacity: pressed ? 0.85 : 1 }]}
            onPress={handleClick}
        >
            {/* Hidden native file input */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {imageUri ? (
                <>
                    <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
                    <View style={styles.editOverlay}>
                        <Ionicons name="camera" size={20} color="#fff" />
                        <Text style={styles.editText}>Tap to change</Text>
                    </View>
                </>
            ) : (
                <>
                    <View style={styles.iconWrap}>
                        <Ionicons name="camera-outline" size={32} color={colors.minimalist.textMedium} />
                    </View>
                    <Text style={styles.label}>
                        Upload Photo{required ? <Text style={styles.req}> *</Text> : null}
                    </Text>
                    <Text style={styles.hint}>Click to select or take a photo</Text>
                </>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 2,
        borderColor: colors.minimalist.borderLight,
        borderStyle: 'dashed',
        borderRadius: 12,
        paddingVertical: spacing.xxl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.minimalist.warmGray,
        cursor: 'pointer' as any,
    },
    hasImage: {
        padding: 0,
        height: 200,
        overflow: 'hidden',
        borderStyle: 'solid',
    },
    image: { width: '100%', height: '100%' },
    editOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        gap: 6,
    },
    editText:  { color: '#fff', fontSize: 13, fontWeight: '600' },
    iconWrap:  { marginBottom: spacing.sm },
    label:     { fontSize: 15, fontWeight: '600', color: colors.minimalist.textDark, marginBottom: 4 },
    req:       { color: '#ef4444' },
    hint:      { fontSize: 13, color: colors.minimalist.textMedium },
});
