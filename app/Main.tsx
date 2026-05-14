import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

// Import screens
import { NewHomeDashboard } from '../screens/NewHomeDashboard';
import { CommunityFeedScreen } from '../screens/CommunityFeedScreen';
import { ReportSightingScreen } from '../screens/ReportSightingScreen';
import { DogProfileScreen } from '../screens/DogProfileScreen';

export type MainTabParamList = {
    Home: undefined;
    Community: undefined;
    Report: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Navigator Component - Minimalist UI layout
export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.minimalist.white,
                    borderTopWidth: 1,
                    borderTopColor: theme.colors.gray200,
                    height: 80,
                    paddingBottom: 10,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: theme.colors.minimalist.coral,
                tabBarInactiveTintColor: theme.colors.minimalist.textLight,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 4,
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={NewHomeDashboard}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                    tabBarLabel: 'Home',
                }}
            />
            <Tab.Screen
                name="Community"
                component={CommunityFeedScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="people" size={size} color={color} />
                    ),
                    tabBarLabel: 'Community',
                }}
            />
            <Tab.Screen
                name="Report"
                component={ReportSightingScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="add-circle" size={size} color={color} />
                    ),
                    tabBarLabel: 'Report',
                }}
            />
            <Tab.Screen
                name="Profile"
                component={DogProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                    tabBarLabel: 'Profile',
                }}
            />
        </Tab.Navigator>
    );
}
