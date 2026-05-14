import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { FloatingCard } from '../components/FloatingCard';

export default function DisasterBroadcastScreen() {
    const router = useRouter();
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (!message) return;
        Alert.alert("Emergency Broadcast", "Message sent to all users and volunteers in the affected area.");
        setMessage('');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.minimalist.white} />
                </Pressable>
                <Text style={styles.headerTitle}>Broadcasting</Text>
            </View>

            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <FloatingCard shadow="medium" style={styles.inputCard}>
                    <Text style={styles.label}>Emergency Announcement</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Type your emergency message here..."
                        placeholderTextColor={colors.minimalist.textLight}
                        multiline
                        numberOfLines={6}
                        value={message}
                        onChangeText={setMessage}
                    />
                    <View style={styles.targets}>
                        <Text style={styles.targetLabel}>Sending to:</Text>
                        <View style={styles.badgeRow}>
                            <View style={styles.badge}><Text style={styles.badgeText}>Citizens</Text></View>
                            <View style={styles.badge}><Text style={styles.badgeText}>Volunteers</Text></View>
                            <View style={styles.badge}><Text style={styles.badgeText}>Partner NGOs</Text></View>
                        </View>
                    </View>
                    <Pressable style={[styles.sendButton, !message && styles.disabled]} onPress={handleSend}>
                        <Ionicons name="send" size={20} color="white" />
                        <Text style={styles.sendButtonText}>Send Push & SMS Notifications</Text>
                    </Pressable>
                </FloatingCard>

                <Text style={styles.sectionTitle}>Recent Broadcasts</Text>
                <View style={styles.historyItem}>
                    <Text style={styles.historyTime}>10 minutes ago</Text>
                    <Text style={styles.historyText}>"Evacuation of Northern Shelters initiated. Please avoid Marina Bay North Entrance."</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#111' },
    header: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg },
    backButton: { marginRight: spacing.md },
    headerTitle: { fontSize: 20, fontWeight: '700', color: colors.minimalist.white },
    container: { flex: 1 },
    scrollContent: { padding: spacing.lg },
    inputCard: { padding: spacing.xl, backgroundColor: colors.minimalist.white, borderRadius: 20 },
    label: { fontSize: 16, fontWeight: '700', color: colors.minimalist.textDark, marginBottom: spacing.md },
    input: { backgroundColor: colors.minimalist.bgLight, borderRadius: 12, padding: spacing.md, color: colors.minimalist.textDark, height: 120, textAlignVertical: 'top', marginBottom: spacing.lg },
    targets: { marginBottom: spacing.xl },
    targetLabel: { fontSize: 12, fontWeight: '600', color: colors.minimalist.textLight, marginBottom: 8, textTransform: 'uppercase' },
    badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    badge: { backgroundColor: 'rgba(8, 145, 178, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { color: '#0891B2', fontSize: 11, fontWeight: '700' },
    sendButton: { backgroundColor: colors.minimalist.errorRed, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
    disabled: { opacity: 0.5 },
    sendButtonText: { color: 'white', fontSize: 15, fontWeight: '700' },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.minimalist.white, marginTop: spacing.xxl, marginBottom: spacing.lg },
    historyItem: { borderLeftWidth: 2, borderLeftColor: colors.minimalist.errorRed, paddingLeft: spacing.md, marginBottom: spacing.xl },
    historyTime: { fontSize: 12, color: colors.minimalist.textLight, marginBottom: 4 },
    historyText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },
});
