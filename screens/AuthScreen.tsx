import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingOverlay, FloatingCard, CustomButton, CustomInput } from '../components';
import { colors } from '../theme/colors';
import { serifTextStyles } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { minimalistShadows } from '../theme/shadows';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { loginSchema, signupSchema, LoginFormData, SignupFormData } from '../utils/validation';


export const AuthScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
    const [isSignUp, setIsSignUp] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showError, setShowError] = useState(false);
    const { login, register, isLoading } = useAuth();

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<SignupFormData>({
        resolver: yupResolver(isSignUp ? signupSchema : loginSchema),
        context: { isNGO: selectedRole === 'ngo' },
        mode: 'onBlur',
    });

    const onSubmit = async (data: LoginFormData | SignupFormData) => {
        setErrorMessage(null);
        setShowError(false);
        try {
            if (isSignUp) {
                await register(
                    data.email,
                    data.password,
                    data.email.split('@')[0], // Derive name from email since form has no name field
                    selectedRole,
                    undefined, // phone not in form
                    'organizationName' in data ? data.organizationName : undefined,
                    'regNumber' in data ? data.regNumber : undefined,
                    'country' in data ? data.country : undefined
                );
            } else {
                await login(data.email, data.password, selectedRole);
            }
        } catch (error: any) {
            console.error('Auth error:', error);
            setErrorMessage(error.message || 'Authentication failed');
            setShowError(true);
        }
    };

    const toggleMode = () => {
        setIsSignUp(!isSignUp);
        reset();
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar style="dark" />
            <LoadingOverlay visible={isLoading} message={isSignUp ? 'Creating account...' : 'Logging in...'} />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Back Button */}
                <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.minimalist.textDark} />
                </Pressable>

                {/* Header */}
                <View style={styles.header}>
                    <FloatingCard style={styles.logoCard} shadow="medium">
                        <Ionicons name="paw" size={40} color={colors.minimalist.coral} />
                    </FloatingCard>
                    <Text style={styles.title}>Welcome to PawGuard AI</Text>
                    <Text style={styles.subtitle}>
                        {isSignUp ? 'Create your account' : 'Sign in to continue'}
                    </Text>
                </View>

                {/* Role Selector */}
                <View style={styles.roleContainer}>
                    <Pressable
                        style={[styles.roleCard, selectedRole === 'citizen' && styles.roleCardActive]}
                        onPress={() => setSelectedRole('citizen')}
                    >
                        <Ionicons
                            name="person"
                            size={24}
                            color={selectedRole === 'citizen' ? colors.minimalist.white : colors.minimalist.textMedium}
                        />
                        <Text style={[styles.roleText, selectedRole === 'citizen' && styles.roleTextActive]}>
                            Citizen
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[styles.roleCard, selectedRole === 'ngo' && styles.roleCardActive]}
                        onPress={() => setSelectedRole('ngo')}
                    >
                        <Ionicons
                            name="business"
                            size={24}
                            color={selectedRole === 'ngo' ? colors.minimalist.white : colors.minimalist.textMedium}
                        />
                        <Text style={[styles.roleText, selectedRole === 'ngo' && styles.roleTextActive]}>
                            NGO
                        </Text>
                    </Pressable>
                </View>

                {/* Tab Toggle */}
                <View style={styles.tabContainer}>
                    <Pressable
                        style={[styles.tab, !isSignUp && styles.tabActive]}
                        onPress={() => setIsSignUp(false)}
                    >
                        <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>
                            Log In
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[styles.tab, isSignUp && styles.tabActive]}
                        onPress={() => setIsSignUp(true)}
                    >
                        <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>
                            Sign Up
                        </Text>
                    </Pressable>
                </View>

                {/* Error Message */}
                {showError && errorMessage && (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={20} color={colors.minimalist.errorRed} />
                        <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                )}

                {/* Form */}
                <View style={styles.form}>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                label="Email Address"
                                placeholder="your@email.com"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                error={errors.email?.message}
                                variant="minimalist"
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <CustomInput
                                label="Password"
                                placeholder="••••••••"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                secureTextEntry
                                error={errors.password?.message}
                                variant="minimalist"
                            />
                        )}
                    />

                    {isSignUp && selectedRole === 'ngo' && (
                        <>
                            <Controller
                                control={control}
                                name="organizationName"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <CustomInput
                                        label="Organization Name"
                                        placeholder="Global Rescue Corp"
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        error={errors.organizationName?.message}
                                        variant="minimalist"
                                    />
                                )}
                            />

                            <View style={styles.row}>
                                <View style={styles.halfWidth}>
                                    <Controller
                                        control={control}
                                        name="regNumber"
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <CustomInput
                                                label="Registration Number"
                                                placeholder="REG-29384"
                                                value={value}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                error={errors.regNumber?.message}
                                                variant="minimalist"
                                            />
                                        )}
                                    />
                                </View>
                                <View style={styles.halfWidth}>
                                    <Controller
                                        control={control}
                                        name="country"
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <CustomInput
                                                label="Country"
                                                placeholder="USA"
                                                value={value}
                                                onChangeText={onChange}
                                                onBlur={onBlur}
                                                error={errors.country?.message}
                                                variant="minimalist"
                                            />
                                        )}
                                    />
                                </View>
                            </View>
                        </>
                    )}

                    {/* Submit Button */}
                    <CustomButton
                        title={isSignUp ? 'Create Account' : 'Sign In'}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isLoading}
                        variant="primary"
                        icon="arrow-forward"
                        iconPosition="right"
                        style={styles.submitButton}
                    />

                    {/* Divider */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.divider} />
                        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
                        <View style={styles.divider} />
                    </View>

                    {/* Google Button */}
                    <Pressable style={styles.googleButton}>
                        <Ionicons name="logo-google" size={20} color={colors.minimalist.textDark} />
                        <Text style={styles.googleButtonText}>Google</Text>
                    </Pressable>

                    {/* Footer */}
                    <Text style={styles.copyright}>© 2026 PAWGUARD AI</Text>
                </View>
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
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.md,
        paddingBottom: spacing.xxxl,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.minimalist.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
        ...minimalistShadows.cardSoft,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logoCard: {
        width: 80,
        height: 80,
        backgroundColor: colors.minimalist.peachLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        ...serifTextStyles.serifSubheading,
        color: colors.minimalist.textDark,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: colors.minimalist.textMedium,
        textAlign: 'center',
    },
    roleContainer: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    roleCard: {
        flex: 1,
        backgroundColor: colors.minimalist.white,
        borderRadius: 16,
        paddingVertical: spacing.lg,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.gray200,
        ...minimalistShadows.cardSoft,
    },
    roleCardActive: {
        backgroundColor: colors.minimalist.coral,
        borderColor: colors.minimalist.coral,
    },
    roleText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
        marginTop: spacing.xs,
    },
    roleTextActive: {
        color: colors.minimalist.white,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.minimalist.white,
        borderRadius: 12,
        padding: 4,
        marginBottom: spacing.xl,
        ...minimalistShadows.cardSoft,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: 10,
        alignItems: 'center',
    },
    tabActive: {
        backgroundColor: colors.minimalist.peachLight,
    },
    tabText: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
    },
    tabTextActive: {
        color: colors.minimalist.textDark,
    },
    form: {
        marginTop: spacing.md,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    halfWidth: {
        flex: 1,
    },
    submitButton: {
        marginTop: spacing.lg,
        marginBottom: spacing.xl,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.xl,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: colors.gray200,
    },
    dividerText: {
        fontSize: 11,
        color: colors.minimalist.textLight,
        marginHorizontal: spacing.md,
        letterSpacing: 1,
        fontWeight: '600',
    },
    googleButton: {
        flexDirection: 'row',
        backgroundColor: colors.minimalist.white,
        borderRadius: 12,
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.minimalist.textDark,
    },
    copyright: {
        fontSize: 10,
        color: colors.minimalist.textLight,
        textAlign: 'center',
        marginTop: spacing.xxl,
        letterSpacing: 1,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        padding: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.lg,
        gap: spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.1)',
    },
    errorText: {
        fontSize: 14,
        color: colors.minimalist.errorRed,
        fontWeight: '600',
        flex: 1,
    },
});
