/**
 * Signup — Organisation registration only.
 * No citizen accounts. Every user is an NGO / SPCA / volunteer org.
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

export default function SignupScreen() {
    const router = useRouter();
    const { register } = useAuth();

    const [orgName,    setOrgName]    = useState('');
    const [email,      setEmail]      = useState('');
    const [password,   setPassword]   = useState('');
    const [phone,      setPhone]      = useState('');
    const [regNumber,  setRegNumber]  = useState('');
    const [country,    setCountry]    = useState('Malaysia');
    const [showPw,     setShowPw]     = useState(false);
    const [loading,    setLoading]    = useState(false);
    const [error,      setError]      = useState('');
    const [focused,    setFocused]    = useState<string | null>(null);

    const handleSignup = async () => {
        setError('');
        if (!orgName || !email || !password || !phone) {
            setError('Please fill in all required fields.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            await register({ email, password, name: orgName, phone, regNumber, country });
            router.replace('/(tabs)/home');
        } catch (e: any) {
            setError(e.message || 'Sign up failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const field = (
        key: string,
        label: string,
        value: string,
        onChange: (v: string) => void,
        opts?: {
            placeholder?: string;
            keyboard?: any;
            secure?: boolean;
            required?: boolean;
        }
    ) => (
        <View style={styles.group}>
            <Text style={styles.label}>
                {label}{opts?.required !== false ? <Text style={styles.req}> *</Text> : null}
            </Text>
            <View style={[styles.inputWrap, focused === key && styles.inputFocused]}>
                <TextInput
                    style={styles.input}
                    placeholder={opts?.placeholder ?? label}
                    placeholderTextColor={colors.minimalist.textLight}
                    value={value}
                    onChangeText={onChange}
                    keyboardType={opts?.keyboard ?? 'default'}
                    secureTextEntry={opts?.secure && !showPw}
                    autoCapitalize={opts?.keyboard === 'email-address' ? 'none' : 'words'}
                    onFocus={() => setFocused(key)}
                    onBlur={() => setFocused(null)}
                />
                {opts?.secure && (
                    <Pressable onPress={() => setShowPw(p => !p)} style={styles.eyeBtn}>
                        <Ionicons
                            name={showPw ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={colors.minimalist.textLight}
                        />
                    </Pressable>
                )}
            </View>
        </View>
    );

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
                    <Text style={styles.title}>Register your organisation</Text>
                    <Text style={styles.subtitle}>
                        PawSecure is for verified NGOs, SPCA branches, and rescue organisations only.
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {field('org',   'Organisation Name',  orgName,   setOrgName,   { placeholder: 'e.g. SPCA Selangor' })}
                    {field('email', 'Email',              email,     setEmail,     { placeholder: 'org@example.com', keyboard: 'email-address' })}
                    {field('pw',    'Password',           password,  setPassword,  { placeholder: 'Min. 6 characters', secure: true })}
                    {field('phone', 'Phone Number',       phone,     setPhone,     { placeholder: '+60 12-345 6789', keyboard: 'phone-pad' })}
                    {field('reg',   'Registration No.',   regNumber, setRegNumber, { placeholder: 'ROC / SSM number', required: false })}
                    {field('city',  'State / Country',    country,   setCountry,   { placeholder: 'e.g. Selangor, Malaysia', required: false })}
                </View>

                {/* Error */}
                {!!error && (
                    <View style={styles.errorBox}>
                        <Ionicons name="alert-circle" size={16} color="#ef4444" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {/* Submit */}
                <Pressable onPress={handleSignup} disabled={loading} style={styles.btnWrap}>
                    <LinearGradient
                        colors={['#0891B2', '#0E7490']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.btn}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.btnText}>Create Account</Text>
                        }
                    </LinearGradient>
                </Pressable>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <Pressable onPress={() => router.push('/(auth)/login')}>
                        <Text style={styles.link}>Log In</Text>
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
    req:          { color: '#ef4444' },
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
