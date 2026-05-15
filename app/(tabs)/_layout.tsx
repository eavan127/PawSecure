/**
 * Tab bar for PawSecure NGO app.
 *
 * 4 tabs only — everything else is irrelevant to the rescue workflow:
 *   Map      → live map of pending animals + all org locations in Malaysia
 *   Animals  → list of animals waiting to be rescued (sorted by proximity)
 *   Rescued  → permanent archive + analytics dashboard
 *   Profile  → this organisation's profile, location, contact
 */

import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../theme/colors';

const TEAL = '#0891B2';

export default function TabsLayout() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user && !user.profileComplete) {
            router.replace('/complete-profile');
        }
    }, [user, isLoading]);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: TEAL,
                tabBarInactiveTintColor: colors.minimalist.textLight,
                tabBarStyle: {
                    backgroundColor: colors.minimalist.white,
                    borderTopWidth: 1,
                    borderTopColor: colors.minimalist.borderLight,
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
                    title: 'Map',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="map" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="animals"
                options={{
                    title: 'Animals',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="paw" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="rescued"
                options={{
                    title: 'Rescued',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="heart" size={size} color={color} />
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
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="business" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
