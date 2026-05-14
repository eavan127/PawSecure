import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
    ScrollView,
    Animated,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { Popup } from '../../components/Popup';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type UserRole = 'citizen' | 'ngo' | null;

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();
    const [selectedRole, setSelectedRole] = useState<UserRole>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const formAnim = useRef(new Animated.Value(0)).current;
    const backButtonScale = useRef(new Animated.Value(1)).current;
    const citizenScale = useRef(new Animated.Value(1)).current;
    const ngoScale = useRef(new Animated.Value(1)).current;

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

    useEffect(() => {
        if (selectedRole) {
            Animated.timing(formAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [selectedRole]);

    const handleRoleSelect = (role: UserRole) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setSelectedRole(role);

        const scaleAnim = role === 'citizen' ? citizenScale : ngoScale;
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        ]).start();
    };

    const handleBackPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.sequence([
            Animated.timing(backButtonScale, { toValue: 0.85, duration: 80, useNativeDriver: true }),
            Animated.timing(backButtonScale, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start(() => router.back());
    };

    const handleLogin = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (!selectedRole) {
            setErrorMessage('Please select your account type');
            setShowError(true);
            return;
        }

        if (!email || !password) {
            setErrorMessage('Please enter your email and password');
            setShowError(true);
            return;
        }

        try {
            await login(email.trim(), password.trim(), selectedRole);
            router.replace('/(tabs)/home');
        } catch (error: any) {
            setErrorMessage(error.message || 'Login failed. Please check your credentials.');
            setShowError(true);
        }
    };

    const dismissError = () => {
        setShowError(false);
        setErrorMessage('');
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={{
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable onPress={handleBackPress}>
                            <Animated.View style={[
                                styles.backButton,
                                { transform: [{ scale: backButtonScale }] }
                            ]}>
                                <Ionicons name="arrow-back" size={20} color={colors.minimalist.textDark} />
                            </Animated.View>
                        </Pressable>

                        <Text style={styles.title}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Log in to continue helping animals</Text>
                    </View>

                    {/* Role Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>I am a</Text>
                        <View style={styles.roleRow}>
                            <Pressable
                                style={styles.roleCardContainer}
                                onPress={() => handleRoleSelect('citizen')}
                            >
                                <Animated.View style={[
                                    styles.roleCard,
                                    selectedRole === 'citizen' && styles.roleCardSelected,
                                    { transform: [{ scale: citizenScale }] }
                                ]}>
                                    {selectedRole === 'citizen' && (
                                        <LinearGradient
                                            colors={['rgba(245, 164, 145, 0.15)', 'rgba(245, 164, 145, 0.05)']}
                                            style={StyleSheet.absoluteFill}
                                        />
                                    )}
                                    <View style={[
                                        styles.roleIconContainer,
                                        selectedRole === 'citizen' && styles.roleIconContainerSelected
                                    ]}>
                                        <Ionicons
                                            name="person"
                                            size={22}
                                            color={selectedRole === 'citizen' ? colors.minimalist.coral : colors.minimalist.textLight}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.roleLabel,
                                        selectedRole === 'citizen' && styles.roleLabelSelected,
                                    ]}>
                                        Citizen
                                    </Text>
                                </Animated.View>
                            </Pressable>

                            <Pressable
                                style={styles.roleCardContainer}
                                onPress={() => handleRoleSelect('ngo')}
                            >
                                <Animated.View style={[
                                    styles.roleCard,
                                    selectedRole === 'ngo' && styles.roleCardSelected,
                                    { transform: [{ scale: ngoScale }] }
                                ]}>
                                    {selectedRole === 'ngo' && (
                                        <LinearGradient
                                            colors={['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']}
                                            style={StyleSheet.absoluteFill}
                                        />
                                    )}
                                    <View style={[
                                        styles.roleIconContainer,
                                        selectedRole === 'ngo' && styles.roleIconContainerNgo
                                    ]}>
                                        <Ionicons
                                            name="shield-checkmark"
                                            size={22}
                                            color={selectedRole === 'ngo' ? '#8B5CF6' : colors.minimalist.textLight}
                                        />
                                    </View>
                                    <Text style={[
                                        styles.roleLabel,
                                        selectedRole === 'ngo' && styles.roleLabelNgo,
                                    ]}>
                                        NGO / Shelter
                                    </Text>
                                </Animated.View>
                            </Pressable>
                        </View>
                    </View>

                    {/* Form */}
                    {selectedRole && (
                        <Animated.View style={[
                            styles.form,
                            { opacity: formAnim }
                        ]}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email</Text>
                                <View style={[
                                    styles.inputContainer,
                                    focusedField === 'email' && styles.inputFocused
                                ]}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="your@email.com"
                                        placeholderTextColor={colors.minimalist.textLight}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Password</Text>
                                <View style={[
                                    styles.inputContainer,
                                    focusedField === 'password' && styles.inputFocused
                                ]}>
                                    <TextInput
                                        style={[styles.input, styles.passwordInput]}
                                        placeholder="Enter your password"
                                        placeholderTextColor={colors.minimalist.textLight}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                    <Pressable
                                        onPress={() => setShowPassword(!showPassword)}
                                        style={styles.eyeButton}
                                    >
                                        <Ionicons
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color={colors.minimalist.textLight}
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            <Pressable style={styles.forgotButton}>
                                {({ pressed }) => (
                                    <Text style={[styles.forgotText, pressed && { opacity: 0.6 }]}>
                                        Forgot password?
                                    </Text>
                                )}
                            </Pressable>
                        </Animated.View>
                    )}

                    {/* Popups */}
                    <Popup
                        visible={showError}
                        title="Login Error"
                        message={errorMessage}
                        icon="alert-circle"
                        iconColor={colors.minimalist.errorRed}
                        onClose={dismissError}
                    />

                    {/* Login Button */}
                    {selectedRole && (
                        <Pressable onPress={handleLogin}>
                            {({ pressed }) => (
                                <View style={styles.submitButtonWrapper}>
                                    <LinearGradient
                                        colors={pressed
                                            ? ['#E8937F', '#E0784A']
                                            : ['#FFB088', '#FF8C5A']
                                        }
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[
                                            styles.submitButton,
                                            pressed && styles.submitButtonPressed
                                        ]}
                                    >
                                        <Text style={styles.submitButtonText}>Log In</Text>
                                    </LinearGradient>
                                </View>
                            )}
                        </Pressable>
                    )}

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <Pressable onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push('/(auth)/signup');
                        }}>
                            {({ pressed }) => (
                                <Text style={[styles.footerLink, pressed && { opacity: 0.6 }]}>
                                    Sign Up
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    header: {
        marginBottom: spacing.xl,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.minimalist.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
            },
            android: { elevation: 1 },
        }),
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.minimalist.textDark,
        letterSpacing: -0.3,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 15,
        color: colors.minimalist.textMedium,
        opacity: 0.7,
        lineHeight: 22,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.minimalist.textMedium,
        marginBottom: spacing.md,
        letterSpacing: 0.3,
    },
    roleRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    roleCardContainer: {
        flex: 1,
    },
    roleCard: {
        padding: spacing.lg,
        paddingVertical: spacing.lg + 4,
        alignItems: 'center',
        borderRadius: 16,
        backgroundColor: colors.minimalist.white,
        borderWidth: 1.5,
        borderColor: 'rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
            },
            android: { elevation: 2 },
        }),
    },
    roleCardSelected: {
        borderColor: colors.minimalist.coral,
        ...Platform.select({
            ios: {
                shadowColor: colors.minimalist.coral,
                shadowOpacity: 0.15,
            },
        }),
    },
    roleIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    roleIconContainerSelected: {
        backgroundColor: 'rgba(245, 164, 145, 0.15)',
    },
    roleIconContainerNgo: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
    },
    roleLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.textMedium,
    },
    roleLabelSelected: {
        color: colors.minimalist.coral,
    },
    roleLabelNgo: {
        color: '#8B5CF6',
    },
    form: {
        marginBottom: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: colors.minimalist.textDark,
        marginBottom: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.minimalist.white,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.06)',
        borderRadius: 14,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.02,
                shadowRadius: 4,
            },
            android: { elevation: 1 },
        }),
    },
    inputFocused: {
        borderColor: colors.minimalist.coral,
        ...Platform.select({
            ios: {
                shadowColor: colors.minimalist.coral,
                shadowOpacity: 0.12,
                shadowRadius: 8,
            },
        }),
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        color: colors.minimalist.textDark,
    },
    passwordInput: {
        paddingRight: 48,
    },
    eyeButton: {
        position: 'absolute',
        right: 12,
        padding: 8,
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginTop: spacing.xs,
    },
    forgotText: {
        fontSize: 13,
        color: colors.minimalist.coral,
        fontWeight: '500',
    },
    submitButtonWrapper: {
        marginTop: spacing.md,
        ...Platform.select({
            ios: {
                shadowColor: '#FF8C5A',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
            },
            android: { elevation: 4 },
        }),
    },
    submitButton: {
        paddingVertical: 16,
        borderRadius: 28,
        alignItems: 'center',
    },
    submitButtonPressed: {
        transform: [{ scale: 0.96 }],
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        letterSpacing: 0.3,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: spacing.xl,
        paddingBottom: spacing.lg,
    },
    footerText: {
        fontSize: 14,
        color: colors.minimalist.textMedium,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.minimalist.coral,
    },
});
