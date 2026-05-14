import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Dummy screens to demonstrate the tabs
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenText}>{name} Screen</Text>
  </View>
);

const Tab = createBottomTabNavigator();

// Mock User Role
export type UserRole = 'public' | 'ngo';

export default function MainNavigation({ userRole = 'public' }: { userRole?: UserRole }) {
  const isNgo = userRole === 'ngo';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#FF6B6B', // Example primary color
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            if (isNgo) iconName = focused ? 'grid' : 'grid-outline'; // Dashboard for NGO
          } else if (route.name === 'Adopt') {
            iconName = focused ? 'paw' : 'paw-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Camera') {
            // Custom Camera Tab handled by tabBarButton
            return null;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" children={() => <PlaceholderScreen name="Home" />} />
      
      {isNgo ? (
        <Tab.Screen name="Map" children={() => <PlaceholderScreen name="Mission Control Map" />} />
      ) : (
        <Tab.Screen name="Adopt" children={() => <PlaceholderScreen name="Adoption" />} />
      )}

      {/* Center Camera Button */}
      <Tab.Screen 
        name="Camera" 
        children={() => <PlaceholderScreen name="Camera" />} 
        options={{
          tabBarLabel: '',
          tabBarButton: (props) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={props.onPress}
              style={styles.cameraButtonWrapper}
            >
              <View style={styles.cameraButton}>
                <Ionicons name="camera" size={32} color="#fff" />
              </View>
            </TouchableOpacity>
          )
        }}
      />

      <Tab.Screen name="Community" children={() => <PlaceholderScreen name="Community" />} />

      {isNgo ? (
        <Tab.Screen name="Adopt" children={() => <PlaceholderScreen name="Adoption NGO" />} options={{ title: 'Adoption' }} />
      ) : (
        <Tab.Screen name="Profile" children={() => <PlaceholderScreen name="Profile" />} />
      )}

    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  screenText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabBar: {
    position: 'absolute',
    height: 70,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    elevation: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingBottom: 10,
    paddingTop: 10,
  },
  cameraButtonWrapper: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  cameraButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
