import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Dimensions,
    Animated,
    Platform,
    Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Pet images with URIs
const pets = [
    {
        name: 'Julio',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlC3iKuEvu3nbgKY9YHNLpyxv8hi11V1R-iN35moknYOObvMOQvFs9pZoEenSAq9kJ5bQWwenK8o4XMrX2GOizODhjbW3tJa_CbxkYJkOCLd_VY0ojDV1JaDpKRcofUu7efT5c2aRHOMjFUVWgPN5QauqLpu_jvayUunpmpHJ1FDjtO2Y3n6hIil0RixtKLsjKAoptAlKIwBiY9bpBwRt8h5XwSpHM1q2JBZ69nHv_Zt9yDAu4KmS-7JO_tHTB2kj2_xvf10r_rv2Z',
        bgColor: '#E0E7FF',
        height: 180,
    },
    {
        name: 'Mussle',
        image: require('../../assets/cat.jpg'),
        bgColor: '#DCFCE7',
        height: 240,
    },
    {
        name: 'Ronnie',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8ZwJVFXHTh59t2QY96brPG0a-XnfqwCod7fGg5ap7SMzJM0istNBNNg9AeuSTztKeTgCkFIddSa4WWexIhsAUl6zuE_kRApzisAV0lPYHshQ8BDtuh5SQLiMd8BJXG2yDHY-RYe_M5EZ3-tCJTW2pTzeq-MD3Rm6fwdtEPbo0j23To3H6dYIqZjyU6VfbYJjQ_2VMpkpWcjvmvMZUaFA57g6ByiyR4lt2Y2GAV3xLwzAtWCrRsE9Fl1jd6AAA0nsqPWlwd29ynQY4',
        bgColor: '#CFFAFE',
        height: 200,
    },
    {
        name: 'Xavier',
        image: require('../../assets/dog.jpg'),
        bgColor: '#FCE7F3',
        height: 220,
    },
];

export default function LandingScreen() {
    const router = useRouter();

    // Animation values
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const petsTranslateY = useRef(new Animated.Value(30)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const buttonsOpacity = useRef(new Animated.Value(0)).current;
    const buttonsTranslateY = useRef(new Animated.Value(20)).current;

    // Button scales
    const getStartedScale = useRef(new Animated.Value(1)).current;
    const loginScale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const runAnimations = async () => {
            // Content fades in
            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();

            // Pets slide up
            Animated.spring(petsTranslateY, {
                toValue: 0,
                friction: 8,
                tension: 50,
                useNativeDriver: true,
            }).start();

            // Title appears
            await new Promise(resolve => setTimeout(resolve, 300));
            Animated.timing(titleOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();

            // Buttons slide up
            await new Promise(resolve => setTimeout(resolve, 200));
            Animated.parallel([
                Animated.timing(buttonsOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(buttonsTranslateY, {
                    toValue: 0,
                    friction: 8,
                    tension: 50,
                    useNativeDriver: true,
                }),
            ]).start();
        };

        runAnimations();
    }, []);

    const handlePressIn = (scale: Animated.Value) => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Animated.spring(scale, {
            toValue: 0.98,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = (scale: Animated.Value) => {
        Animated.spring(scale, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };

    const handleGetStarted = () => {
        router.push('/(auth)/signup');
    };

    const handleLogin = () => {
        router.push('/(auth)/login');
    };

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />

            {/* Content */}
            <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
                {/* Pet Cards Row */}
                <Animated.View style={[
                    styles.petsRow,
                    { transform: [{ translateY: petsTranslateY }] }
                ]}>
                    {pets.map((pet, index) => (
                        <View key={index} style={styles.petColumn}>
                            <View style={[
                                styles.petCard,
                                { backgroundColor: pet.bgColor, height: pet.height }
                            ]}>
                                <Image
                                    source={typeof pet.image === 'string' ? { uri: pet.image } : pet.image}
                                    style={styles.petImage}
                                    resizeMode="cover"
                                />
                            </View>
                            <Text style={styles.petName}>{pet.name}</Text>
                        </View>
                    ))}
                </Animated.View>

                {/* Bottom Section */}
                <View style={styles.bottomSection}>
                    {/* Title */}
                    <Animated.View style={[{ opacity: titleOpacity }]}>
                        <Text style={styles.appName}>PawGuard AI</Text>
                        <Text style={styles.tagline}>
                            Protecting animals through technology and community
                        </Text>
                    </Animated.View>

                    {/* Buttons */}
                    <Animated.View style={[
                        styles.buttonsContainer,
                        {
                            opacity: buttonsOpacity,
                            transform: [{ translateY: buttonsTranslateY }],
                        }
                    ]}>
                        {/* Get Started Button */}
                        <Animated.View style={{ transform: [{ scale: getStartedScale }] }}>
                            <Pressable
                                onPressIn={() => handlePressIn(getStartedScale)}
                                onPressOut={() => handlePressOut(getStartedScale)}
                                onPress={handleGetStarted}
                                style={styles.getStartedButton}
                            >
                                <Text style={styles.getStartedText}>Get Started</Text>
                            </Pressable>
                        </Animated.View>

                        {/* Log In Button */}
                        <Animated.View style={{ transform: [{ scale: loginScale }] }}>
                            <Pressable
                                onPressIn={() => handlePressIn(loginScale)}
                                onPressOut={() => handlePressOut(loginScale)}
                                onPress={handleLogin}
                                style={styles.loginButton}
                            >
                                <Text style={styles.loginText}>Log In</Text>
                            </Pressable>
                        </Animated.View>

                        {/* Description */}
                        <Text style={styles.footerDescription}>
                            Join thousands of animal lovers protecting pets in your community
                        </Text>
                    </Animated.View>

                    {/* Home Indicator */}
                    <View style={styles.homeIndicator} />
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9F4',
    },
    content: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    petsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: spacing.md,
        gap: 12,
        marginBottom: spacing.xl,
    },
    petColumn: {
        flex: 1,
        alignItems: 'center',
    },
    petCard: {
        width: '100%',
        borderRadius: 999,
        overflow: 'hidden',
    },
    petImage: {
        width: '100%',
        height: '100%',
    },
    petName: {
        marginTop: spacing.sm,
        fontSize: 10,
        fontWeight: '600',
        color: '#1B2A4E',
        opacity: 0.7,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    bottomSection: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: spacing.xl + 8,
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    },
    appName: {
        fontSize: 42,
        fontWeight: '400',
        color: '#1B2A4E',
        textAlign: 'center',
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        marginBottom: spacing.sm,
    },
    tagline: {
        fontSize: 14,
        color: '#1B2A4E',
        opacity: 0.6,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.lg,
        maxWidth: 280,
    },
    buttonsContainer: {
        width: '100%',
        gap: spacing.sm,
    },
    getStartedButton: {
        backgroundColor: '#FF7E67',
        paddingVertical: 20,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#FF7E67',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    getStartedText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    loginButton: {
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1B2A4E',
    },
    homeIndicator: {
        marginTop: spacing.lg,
        width: 128,
        height: 5,
        backgroundColor: 'rgba(27, 42, 78, 0.1)',
        borderRadius: 3,
    },
    footerDescription: {
        marginTop: spacing.md,
        fontSize: 12,
        color: '#1B2A4E',
        opacity: 0.5,
        textAlign: 'center',
        lineHeight: 18,
    },
});
