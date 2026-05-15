/**
 * complete-profile — shown only if org signed up without a phone number.
 * Collects phone to satisfy profileComplete = !!(name && phone).
 */
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, Pressable,
    ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function CompleteProfileScreen() {
    const router = useRouter();
    const { user, updateProfile } = useAuth();

    const [phone,   setPhone]   = useState(user?.phone ?? '');
    const [name,    setName]    = useState(user?.name  ?? '');
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');

    const handleSave = async () => {
        setError('');
        if (!name || !phone) {
            setError('Organisation name and phone are required.');
            return;
        }
        setLoading(true);
        try {
            await updateProfile({ name, phone });
            router.replace('/(tabs)/home');
        } catch (e: any) {
            setError(e.message || 'Failed to save. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar style="dark" />
            <ScrollView contentContainerStyle={styles.scroll}>

                <View style={styles.iconWrap}>
                    <Ionicons name="shield-checkmark" size={48} color="#0891B2" />
                </View>

                <Text style={styles.title}>Complete Your Profile</Text>
                <Text style={styles.subtitle}>
                    We need your organisation name and phone number to activate your account.
                </Text>

                <View style={styles.form}>
                    <View style={styles.group}>
                        <Text style={styles.label}>Organisation Name <Text style={styles.req}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g. SPCA Selangor"
                            placeholderTextColor={colors.minimalist.textLight}
                        />
                    </View>
                    <View style={styles.group}>
                        <Text style={styles.label}>Phone Number <Text style={styles.req}>*</Text></Text>
                        <TextInput
                            style={styles.input}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+60 12-345 6789"
                            placeholderTextColor={colors.minimalist.textLight}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {!!error && (
                    <View style={styles.errorBox}>
                        <Ionicons name="alert-circle" size={16} color="#ef4444" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <Pressable onPress={handleSave} disabled={loading}>
                    <LinearGradient
                        colors={['#0891B2', '#0E7490']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={styles.btn}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.btnText}>Save & Continue</Text>
                        }
                    </LinearGradient>
                </Pressable>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe:     { flex: 1, backgroundColor: '#FAFAFA' },
    scroll:   { padding: spacing.xl, paddingBottom: 48, alignItems: 'center' },
    iconWrap: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(8,145,178,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.xl },
    title:    { fontSize: 26, fontWeight: '700', color: colors.minimalist.textDark, textAlign: 'center', marginBottom: spacing.xs },
    subtitle: { fontSize: 14, color: colors.minimalist.textMedium, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
    form:     { width: '100%', gap: spacing.md, marginBottom: spacing.lg },
    group:    { gap: 6 },
    label:    { fontSize: 13, fontWeight: '600', color: colors.minimalist.textDark },
    req:      { color: '#ef4444' },
    input:    { borderWidth: 1.5, borderColor: colors.minimalist.borderLight, borderRadius: 10, backgroundColor: '#fff', paddingHorizontal: spacing.md, height: 48, fontSize: 15, color: colors.minimalist.textDark, width: '100%' },
    errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fef2f2', borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, width: '100%' },
    errorText: { flex: 1, fontSize: 13, color: '#ef4444' },
    btn:      { height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', width: 260 },
    btnText:  { fontSize: 16, fontWeight: '700', color: '#fff' },
});
