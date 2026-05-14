import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

// Import screens
import { AuthScreen } from '../screens/AuthScreen';
import { ReportSightingScreen } from '../screens/ReportSightingScreen';
import { AdoptionExitScreen } from '../screens/AdoptionExitScreen';
import { DogProfileScreen } from '../screens/DogProfileScreen';

// New minimalist UI screens
import { LandingScreen } from '../screens/LandingScreen';
import { NewHomeDashboard } from '../screens/NewHomeDashboard';
import { AnimalProfileScreen } from '../screens/AnimalProfileScreen';
import { DisasterModeScreen } from '../screens/DisasterModeScreen';
import { NewAdoptionListing } from '../screens/NewAdoptionListing';
import { CommunityFeedScreen } from '../screens/CommunityFeedScreen';
import { AIReportCameraScreen } from '../screens/AIReportCameraScreen';
import { AnimalMatchResultScreen } from '../screens/AnimalMatchResultScreen';

// Type definitions
export type RootStackParamList = {
    Landing: undefined;
    Auth: undefined;
    Main: undefined;
    ReportSighting: undefined;
    AdoptionExit: { petId?: string };
    DogProfile: undefined;
    NewHomeDashboard: undefined;
    AnimalProfile: undefined;
    DisasterMode: undefined;
    NewAdoption: undefined;
    CommunityFeed: undefined;
    AIReportCamera: undefined;
    AnimalMatchResult: {
        capturedImage: string;
        aiResult: any;
        matches: any[];
    };
};

export type MainTabParamList = {
    Home: undefined;
    Community: undefined;
    Report: undefined;
    Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Navigator Component - Minimalist UI layout
const MainTabs: React.FC = () => {
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
};

// Main Navigation Component
export const AppNavigation: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Landing"
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.colors.minimalist.white },
                }}
            >
                <Stack.Screen name="Landing" component={LandingScreen} />
                <Stack.Screen name="Auth" component={AuthScreen} />
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen
                    name="NewHomeDashboard"
                    component={NewHomeDashboard}
                    options={{ presentation: 'card' }}
                />
                <Stack.Screen
                    name="AnimalProfile"
                    component={AnimalProfileScreen}
                    options={{ presentation: 'card' }}
                />
                <Stack.Screen
                    name="DisasterMode"
                    component={DisasterModeScreen}
                    options={{ presentation: 'card' }}
                />
                <Stack.Screen
                    name="NewAdoption"
                    component={NewAdoptionListing}
                    options={{ presentation: 'card' }}
                />
                <Stack.Screen
                    name="CommunityFeed"
                    component={CommunityFeedScreen}
                    options={{ presentation: 'card' }}
                />
                <Stack.Screen
                    name="ReportSighting"
                    component={ReportSightingScreen}
                    options={{ presentation: 'card' }}
                />
                <Stack.Screen
                    name="AdoptionExit"
                    component={AdoptionExitScreen}
                    options={{ presentation: 'card' }}
                />
                <Stack.Screen
                    name="DogProfile"
                    component={DogProfileScreen}
                    options={{ presentation: 'card' }}
                />
                <Stack.Screen
                    name="AIReportCamera"
                    component={AIReportCameraScreen}
                    options={{ presentation: 'fullScreenModal', headerShown: false }}
                />
                <Stack.Screen
                    name="AnimalMatchResult"
                    component={AnimalMatchResultScreen}
                    options={{ presentation: 'card' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
