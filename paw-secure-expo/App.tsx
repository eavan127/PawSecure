import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import MainNavigation from './src/navigation/MainNavigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {/* Toggle 'ngo' | 'public' to see the different navigations */}
        <MainNavigation userRole="public" />
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
