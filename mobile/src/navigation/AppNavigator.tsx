import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import EventsScreen from '../screens/EventsScreen';
import ParticipationsScreen from '../screens/ParticipationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EventDetailsScreen from '../screens/EventDetailsScreen';
import { colors } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Écran de chargement
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={styles.loadingText}>Chargement...</Text>
  </View>
);

// Navigateur pour les utilisateurs authentifiés
const AuthenticatedNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Événements') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Participations') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Événements" component={EventsNavigator} options={{ headerShown: false }} />
      <Tab.Screen name="Participations" component={ParticipationsScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Navigateur pour les écrans d'événements
const EventsNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="EventsList" 
        component={EventsScreen} 
        options={{ title: 'Calendrier des événements' }}
      />
      <Stack.Screen 
        name="EventDetails" 
        component={EventDetailsScreen} 
        options={{ title: 'Détails de l\'événement' }}
      />
    </Stack.Navigator>
  );
};

// Navigateur principal de l'application
const AppNavigator = () => {
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    console.log('AppNavigator - Auth State:', { isAuthenticated, loading, user });
  }, [isAuthenticated, loading, user]);

  // Afficher un écran de chargement si nécessaire
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Routes pour les utilisateurs non authentifiés
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ 
            title: 'Connexion',
            // Forcer l'affichage du header pour la page de connexion
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      ) : (
        // Routes pour les utilisateurs authentifiés
        <Stack.Screen name="Main" component={AuthenticatedNavigator} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default AppNavigator;
