import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { serifTextStyles } from '../../theme/typography';
import { useAuth } from '../../contexts/AuthContext';
import { FloatingCard } from '../../components/FloatingCard';
import { CustomButton } from '../../components/CustomButton';

export default function CompleteProfileScreen() {
    const router = useRouter();
    const { user, updateProfile } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [orgName, setOrgName] = useState(user?.organizationName || '');
    const [role, setRole] = useState(user?.role || 'citizen');

    const [isLoading, setIsLoading] = useState(false);

    const handleCompleteProfile = async () => {
        if (!name || !phone || (role === 'ngo' && !orgName)) {
            // Validation (could use a Popup here)
            return;
        }

        setIsLoading(true);
        try {
            await updateProfile({
                name,
                phone,
                organizationName: role === 'ngo' ? orgName : undefined,
                role: role as any,
                profileComplete: true,
            });
            router.replace('/(tabs)/home');
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="dark" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Complete Your Profile</Text>
                        <Text style={styles.subtitle}>
                            Please provide a few more details to help us coordinate rescues effectively.
                        </Text>
                    </View>

                    <FloatingCard shadow="medium" style={styles.formCard}>
                        {/* Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your full name"
                                placeholderTextColor={colors.minimalist.textLight}
                            />
                        </View>

                        {/* Phone */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={setPhone}
                                placeholder="+1 (555) 000-0000"
                                placeholderTextColor={colors.minimalist.textLight}
                                keyboardType="phone-pad"
                            />
                        </View>

                        {/* Role Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>I am a...</Text>
                            <View style={styles.roleContainer}>
                                <Pressable
                                    style={[styles.roleOption, role === 'citizen' && styles.roleOptionSelected]}
                                    onPress={() => setRole('citizen')}
                                >
                                    <Ionicons
                                        name="person"
                                        size={20}
                                        color={role === 'citizen' ? colors.minimalist.white : colors.minimalist.coral}
                                    />
                                    <Text style={[styles.roleText, role === 'citizen' && styles.roleTextSelected]}>Citizen</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.roleOption, role === 'ngo' && styles.roleOptionSelected]}
                                    onPress={() => setRole('ngo')}
                                >
                                    <Ionicons
                                        name="business"
                                        size={20}
                                        color={role === 'ngo' ? colors.minimalist.white : colors.minimalist.coral}
                                    />
                                    <Text style={[styles.roleText, role === 'ngo' && styles.roleTextSelected]}>NGO/Shelter</Text>
                                </Pressable>
                            </View>
                        </View>

                        {/* Organization Name (NGO only) */}
                        {role === 'ngo' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Organization Name</Text>
                                <TextInput
                                    style={styles.input}
                                    value={orgName}
                                    onChangeText={setOrgName}
                                    placeholder="Enter shelter or NGO name"
                                    placeholderTextColor={colors.minimalist.textLight}
                                />
                            </View>
                        )}
                    </FloatingCard>

                    <CustomButton
                        title={isLoading ? "Saving..." : "Start Helping Animals"}
                        onPress={handleCompleteProfile}
                        disabled={isLoading}
                        variant="primary"
                        style={styles.button}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.minimalist.bgLight,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.xl,
        paddingTop: spacing.xxl,
    },
    header: {
        marginBottom: spacing.xxl,
    },
    title: {
        ...serifTextStyles.serifHeading,
        fontSize: 28,
        color: colors.minimalist.textDark,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: colors.minimalist.textMedium,
        lineHeight: 24,
    },
    formCard: {
        padding: spacing.xl,
        marginBottom: spacing.xl,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
        marginBottom: spacing.xs,
    },
    input: {
        height: 50,
        backgroundColor: colors.minimalist.warmGray,
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        fontSize: 16,
        color: colors.minimalist.textDark,
    },
    roleContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    roleOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.minimalist.coral,
        backgroundColor: colors.minimalist.white,
    },
    roleOptionSelected: {
        backgroundColor: colors.minimalist.coral,
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.coral,
    },
    roleTextSelected: {
        color: colors.minimalist.white,
    },
    button: {
        marginTop: spacing.md,
    },
});
