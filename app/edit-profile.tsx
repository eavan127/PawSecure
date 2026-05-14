import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FloatingCard } from '../components/FloatingCard';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Animation values
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(30))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const getInitials = (name: string) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const isNGO = user?.role === 'ngo';
    const accentColor = isNGO ? '#0891B2' : colors.minimalist.coral;
    const avatarBg = isNGO ? '#A5E5ED' : '#FFD7D0';

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        Alert.alert('Success', 'Profile updated successfully!', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => [
                        styles.backButton,
                        pressed && styles.buttonPressed
                    ]}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.minimalist.textDark} />
                </Pressable>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }}>
                    {/* Avatar Section */}
                    <View style={styles.avatarSection}>
                        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                            <Text style={[styles.avatarText, !isNGO && { color: colors.minimalist.coral }]}>
                                {getInitials(name)}
                            </Text>
                        </View>
                        <Pressable style={styles.changePhotoButton}>
                            <Ionicons name="camera-outline" size={18} color={accentColor} />
                            <Text style={[styles.changePhotoText, { color: accentColor }]}>Change Photo</Text>
                        </Pressable>
                    </View>

                    {/* Form Fields */}
                    <FloatingCard shadow="soft" style={styles.formCard}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                                placeholderTextColor={colors.minimalist.textLight}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                placeholderTextColor={colors.minimalist.textLight}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="Enter your phone number"
                                placeholderTextColor={colors.minimalist.textLight}
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Bio</Text>
                            <TextInput
                                style={[styles.input, styles.bioInput]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Tell us about yourself..."
                                placeholderTextColor={colors.minimalist.textLight}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>
                    </FloatingCard>

                    {/* Save Button */}
                    <Pressable
                        onPress={handleSave}
                        disabled={isSaving}
                        style={({ pressed }) => [
                            styles.saveButton,
                            { backgroundColor: avatarBg },
                            pressed && styles.saveButtonPressed,
                            isSaving && styles.saveButtonDisabled
                        ]}
                    >
                        <Text style={[styles.saveButtonText, { color: accentColor }]}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Text>
                    </Pressable>
                </Animated.View>

                <View style={styles.bottomSpacing} />
            </ScrollView>
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
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        backgroundColor: colors.minimalist.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.minimalist.borderLight,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    buttonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.96 }],
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    headerSpacer: {
        width: 44,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.xl,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: spacing.xxxl,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '700',
        color: colors.minimalist.white,
    },
    changePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    changePhotoText: {
        fontSize: 14,
        fontWeight: '600',
    },
    formCard: {
        marginBottom: spacing.xxl,
    },
    inputGroup: {
        marginBottom: spacing.xl,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.textDark,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: colors.minimalist.bgLight,
        borderRadius: 12,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md + 4,
        fontSize: 16,
        color: colors.minimalist.textDark,
        borderWidth: 1,
        borderColor: colors.minimalist.borderLight,
    },
    bioInput: {
        minHeight: 100,
        paddingTop: spacing.lg,
    },
    saveButton: {
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    saveButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    bottomSpacing: {
        height: spacing.xxl,
    },
});
