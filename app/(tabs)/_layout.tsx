import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';

export default function TabsLayout() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const segments = useSegments();
    const [hasDisasterAlert, setHasDisasterAlert] = useState(true); // Mock: Active disaster

    const isNGO = user?.role === 'ngo';

    useEffect(() => {
        if (!isLoading && user && !user.profileComplete) {
            router.replace('/complete-profile');
        }
    }, [user, isLoading]);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: isNGO ? '#0891B2' : colors.minimalist.coral,
                tabBarInactiveTintColor: colors.minimalist.textLight,
                tabBarStyle: {
                    backgroundColor: isNGO ? '#FAFCFA' : colors.minimalist.white,
                    borderTopWidth: 1,
                    borderTopColor: isNGO ? '#A5E5ED' : colors.minimalist.borderLight,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="community"
                options={{
                    title: 'Community',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="report"
                options={{
                    title: 'Report',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="add-circle" size={size} color={color} />
                    ),
                }}
            />
            {/* Disaster Mode Tab - Visible to all, view-only for citizens */}
            <Tabs.Screen
                name="disaster"
                options={{
                    title: 'Disaster',
                    tabBarIcon: ({ color, size }) => (
                        <View>
                            <Ionicons
                                name="warning"
                                size={size}
                                color={hasDisasterAlert ? colors.minimalist.disasterOrange : color}
                            />
                            {hasDisasterAlert && (
                                <View style={styles.alertBadge} />
                            )}
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    alertBadge: {
        position: 'absolute',
        top: -2,
        right: -4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#DC2626',
    },
});
