import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, useColorScheme, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme'; // Assuming theme is imported from existing theme file

export const PublicDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const styles = createStyles(isDark);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6BdbEPWqZO_DqAFZmOFzuTPVMLRd9h0s1cvqg2l-f_uVK1dCxE3FXY7Woh7vp2RUhhdtJmpGcWxfg3zarSpBNR1L_tq35lmXCA18tQr8nV1vxavrZNataBwXmlXaLrjo_TvQw7B4fY5PIyhvCopztPTHSGHLfSA0XWwnh85qtkVyFJwxAv3-Xswg2IfzYewVb6abPgEuI-PO2rrJC9_qXTwkQU2ZJyEdwaBdRwmvFruJaMLbno_5S-7--4tNC6JKgbNxSh_ncziWY' }}
                            style={styles.avatar}
                        />
                        <View style={styles.userInfo}>
                            <Text style={styles.greeting}>Hello, Sarah!</Text>
                            <View style={styles.userDetails}>
                                <Text style={styles.detailText}>28 years old</Text>
                                <View style={styles.dot} />
                                <Text style={styles.detailText}>Austin, TX</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.notificationButton}>
                        <MaterialIcons name="notifications" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Main Content */}
                <View style={styles.main}>
                    {/* Live Camera Scan Card */}
                    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                        <View style={styles.cardContent}>
                            <View style={styles.iconContainer}>
                                <MaterialIcons name="photo-camera" size={36} color={theme.colors.primary} />
                            </View>
                            <Text style={styles.cardTitle}>Live Camera Scan</Text>
                            <Text style={styles.cardSubtitle}>Identify animals instantly with AI vision.</Text>
                            <TouchableOpacity style={styles.cardButton}>
                                <Text style={styles.buttonText}>Scan Now</Text>
                            </TouchableOpacity>
                        </View>
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7TaFbVpiHHeJzy_I0YEOZWqNU4aarPHFIZgu5Rj9MYblXkNaquKPmTtl9oPxoh3O0MZ89aT5haWymn0nihzqshLXdtnwmUE8uNSTIM6awYmjSmOVhF2hLMgw3DJxqOnaqI1W4bakD8vannjJqLOEBQp0-LPHoBaRjS6Hk6EC0I9JUcEHfHZmuyHI6IReg75WDVBQpe6g2CrqmvYAPysCllhFdHK3H1vLOQZY1X0nzYQUmbgYkZ6FDBNewJhzD950NEbS-LH8C1-lV' }}
                            style={styles.cardImage}
                        />
                    </TouchableOpacity>

                    {/* Report a Stray Card */}
                    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                        <View style={styles.cardContent}>
                            <View style={[styles.iconContainer, { backgroundColor: '#fed7aa' }]}>
                                <MaterialIcons name="edit-document" size={36} color="#ea580c" />
                            </View>
                            <Text style={styles.cardTitle}>Report a Stray</Text>
                            <Text style={styles.cardSubtitle}>Alert local rescue services manually.</Text>
                            <TouchableOpacity style={[styles.cardButton, { backgroundColor: theme.colors.backgroundDark }]}>
                                <Text style={styles.buttonText}>Report</Text>
                            </TouchableOpacity>
                        </View>
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKp5X9WR8B_SetI4bmsCSy-sJtYbFYM8H-A4DhDqoXaBbJjXDegYDR4w_eRXluD3lNoFzH59Szix19-FqNle8u5xRLACKfHS_e9buA5vaHUZ8gTv3IMHm3LnNtg9IrXe6Gz3Rkbh5B8El0woCObHjszBDsLK7SOdzfxnFR7SIjtyNLUgeOaQC5tYTzNRZy8wnQfmRsfdD7LjRisOpKmcfSokxU1g9S2Yiu9VM1QK7kOtOXf-WLrdLelLbBIO3Fe46bj1AHHcHrETqN' }}
                            style={styles.cardImage}
                        />
                    </TouchableOpacity>

                    {/* Adoption List Card */}
                    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                        <View style={styles.cardContent}>
                            <View style={[styles.iconContainer, { backgroundColor: '#fef2f2' }]}>
                                <MaterialIcons name="favorite" size={36} color="#ef4444" />
                            </View>
                            <Text style={styles.cardTitle}>Adoption List</Text>
                            <Text style={styles.cardSubtitle}>Find a furry friend looking for a home.</Text>
                            <TouchableOpacity style={styles.cardButton}>
                                <Text style={styles.buttonText}>View List</Text>
                            </TouchableOpacity>
                        </View>
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9jZ0douX7RJbRP4__8vhKUOY-Ldfe5tMtSMgWQwD2TqKPZ5eNKSssdqEhENr-5f7-KqB0RgAxEh8KcKBP4H5iClCU0ki_E2iHRimrxhxM_FPtIKLaRb_kFz_qJ3HkvAGMleuJr0iD5flqPAL32kPtm-eTJ4z2tvUHECDu9ajHLDTGWCqPB-MDQsV7aScR0boNoXQuF4DEr_-b8DqBmCyzZVFTprqWmvjo8w5BY2bGznog3YlVeD_WesLiuZhnW5E_G9xc6u66hNoN' }}
                            style={styles.cardImage}
                        />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.nav}>
                <View style={styles.navCurve}>
                    <TouchableOpacity style={styles.navItem}>
                        <MaterialIcons name="groups" size={26} color={theme.colors.primary} />
                        <Text style={styles.navText}>Community</Text>
                    </TouchableOpacity>
                    <View style={styles.navSpacer} />
                    <TouchableOpacity style={styles.navItem}>
                        <MaterialIcons name="pets" size={26} color={theme.colors.primary} />
                        <Text style={styles.navText}>Adoption</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.scanButtonContainer}>
                    <TouchableOpacity style={styles.scanButton}>
                        <MaterialIcons name="photo-camera" size={32} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.scanText}>Scan</Text>
                </View>
            </View>

            {/* Background Effects (simplified) */}
            <LinearGradient
                colors={['rgba(64,191,117,0.1)', 'transparent']}
                style={styles.bgEffect1}
            />
            <LinearGradient
                colors={['rgba(64,191,117,0.05)', 'transparent']}
                style={styles.bgEffect2}
            />
        </SafeAreaView>
    );
};

const createStyles = (isDark: boolean) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: isDark ? theme.colors.backgroundDark : theme.colors.backgroundLight,
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 128, // Space for nav
    },
    header: {
        paddingTop: 40,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: 'rgba(64,191,117,0.3)',
    },
    userInfo: {
        flexDirection: 'column',
    },
    greeting: {
        fontSize: 24,
        fontWeight: '800',
        color: 'white',
    },
    userDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    detailText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(64,191,117,0.9)',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(64,191,117,0.4)',
    },
    notificationButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 8,
        borderRadius: 20,
    },
    main: {
        gap: 20,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    cardContent: {
        flex: 2,
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: 'rgba(64,191,117,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.backgroundDark,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748b',
        lineHeight: 18,
    },
    cardButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        height: 40,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    },
    cardImage: {
        width: 128,
        aspectRatio: 3 / 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    nav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navCurve: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: isDark ? 'rgba(6,84,69,0.95)' : 'rgba(249,251,249,0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 24,
        paddingBottom: 32,
        paddingTop: 16,
        width: '100%',
        maxWidth: 430,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    navSpacer: {
        flex: 1,
    },
    navText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: 'rgba(64,191,117,0.4)',
    },
    scanButtonContainer: {
        position: 'absolute',
        top: -32,
        alignItems: 'center',
    },
    scanButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    scanText: {
        marginTop: 4,
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        color: theme.colors.primary,
    },
    bgEffect1: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 200,
        height: 120,
        borderRadius: 100,
    },
    bgEffect2: {
        position: 'absolute',
        bottom: -20,
        left: -40,
        width: 240,
        height: 160,
        borderRadius: 120,
    },
});
