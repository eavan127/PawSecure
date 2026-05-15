/**
 * Login — Organisation accounts only.
 * No role selection. Every user is an NGO / SPCA / volunteer org.
 */

import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet,
    Pressable, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function LoginScreen() {
    const router = useRouter();
    const { login } = useAuth();

    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const [showPw,   setShowPw]   = useState(false);
    const [loading,  setLoading]  = useState(false);
    const [error,    setError]    = useState('');
    const [focused,  setFocused]  = useState<string | null>(null);

    const handleLogin = async () => {
        setError('');
        if (!email || !password) {
            setError('Please enter your email and password.');
            return;
        }
        setLoading(true);
        try {
            await login(email.trim(), password.trim());
            router.replace('/(tabs)/home');
        } catch (e: any) {
            setError(e.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.back}>
                        <Ionicons name="arrow-back" size={20} color={colors.minimalist.textDark} />
                    </Pressable>
                    <View style={styles.badge}>
                        <Ionicons name="shield-checkmark" size={18} color="#0891B2" />
                        <Text style={styles.badgeText}>Organisation Account</Text>
                    </View>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>
                        Log in to your NGO or rescue organisation account.
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Email */}
                    <View style={styles.group}>
                        <Text style={styles.label}>Email</Text>
                        <View style={[styles.inputWrap, focused === 'email' && styles.inputFocused]}>
                            <TextInput
                                style={styles.input}
                                placeholder="org@example.com"
                                placeholderTextColor={colors.minimalist.textLight}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                onFocus={() => setFocused('email')}
                                onBlur={() => setFocused(null)}
                            />
                        </View>
                    </View>

                    {/* Password */}
                    <View style={styles.group}>
                        <Text style={styles.label}>Password</Text>
                        <View style={[styles.inputWrap, focused === 'pw' && styles.inputFocused]}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor={colors.minimalist.textLight}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPw}
                                onFocus={() => setFocused('pw')}
                                onBlur={() => setFocused(null)}
                            />
                            <Pressable onPress={() => setShowPw(p => !p)} style={styles.eyeBtn}>
                                <Ionicons
                                    name={showPw ? 'eye-off-outline' : 'eye-outline'}
                                    size={20}
                                    color={colors.minimalist.textLight}
                                />
                            </Pressable>
                        </View>
                    </View>
                </View>

                {/* Error */}
                {!!error && (
                    <View style={styles.errorBox}>
                        <Ionicons name="alert-circle" size={16} color="#ef4444" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Submit */}
                <Pressable onPress={handleLogin} disabled={loading} style={styles.btnWrap}>
                    <LinearGradient
                        colors={['#0891B2', '#0E7490']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.btn}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.btnText}>Log In</Text>
                        }
                    </LinearGradient>
                </Pressable>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <Pressable onPress={() => router.push('/(auth)/signup')}>
                        <Text style={styles.link}>Sign Up</Text>
                    </Pressable>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe:         { flex: 1, backgroundColor: '#FAFAFA' },
    scroll:       { padding: spacing.xl, paddingBottom: 48 },
    header:       { marginBottom: spacing.xl },
    back:         { width: 36, height: 36, justifyContent: 'center', marginBottom: spacing.lg },
    badge:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(8,145,178,0.1)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: spacing.md },
    badgeText:    { fontSize: 13, fontWeight: '600', color: '#0891B2' },
    title:        { fontSize: 26, fontWeight: '700', color: colors.minimalist.textDark, marginBottom: spacing.xs },
    subtitle:     { fontSize: 14, color: colors.minimalist.textMedium, lineHeight: 20 },
    form:         { gap: spacing.md, marginBottom: spacing.lg },
    group:        { gap: 6 },
    label:        { fontSize: 13, fontWeight: '600', color: colors.minimalist.textDark },
    inputWrap:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.minimalist.borderLight, borderRadius: 10, backgroundColor: '#fff', paddingHorizontal: spacing.md },
    inputFocused: { borderColor: '#0891B2' },
    input:        { flex: 1, height: 48, fontSize: 15, color: colors.minimalist.textDark },
    eyeBtn:       { padding: 8 },
    errorBox:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', borderRadius: 8, padding: spacing.md, marginBottom: spacing.md },
    errorText:    { flex: 1, fontSize: 13, color: '#ef4444' },
    btnWrap:      { marginBottom: spacing.lg },
    btn:          { height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    btnText:      { fontSize: 16, fontWeight: '700', color: '#fff' },
    footer:       { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    footerText:   { fontSize: 14, color: colors.minimalist.textMedium },
    link:         { fontSize: 14, fontWeight: '700', color: '#0891B2' },
});
