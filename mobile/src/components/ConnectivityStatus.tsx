import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useConnectivity } from '../hooks/useConnectivity';
import { colors } from '../constants/theme';

const ConnectivityStatus = () => {
  const { isOnline, isChecking, checkConnectivity } = useConnectivity();
  
  // Valeurs pour les animations
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-50);
  
  // Styles animés
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }]
    };
  });
  
  // Afficher/masquer le statut de connectivité
  useEffect(() => {
    if (!isOnline || isChecking) {
      // Afficher le statut
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      // Masquer le statut après un délai
      const timeout = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 300 });
        translateY.value = withTiming(-50, { duration: 300 });
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [isOnline, isChecking]);
  
  // Faire clignoter l'icône lorsque hors ligne
  useEffect(() => {
    if (!isOnline && !isChecking) {
      const interval = setInterval(() => {
        opacity.value = withSequence(
          withTiming(0.7, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        );
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isOnline, isChecking]);
  
  // Si en ligne et pas en train de vérifier, ne rien afficher
  if (isOnline && !isChecking) {
    return null;
  }
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity 
        style={styles.content} 
        onPress={() => checkConnectivity()}
        disabled={isChecking}
      >
        {isChecking ? (
          <ActivityIndicator size="small" color="#fff" style={styles.icon} />
        ) : (
          <Ionicons 
            name={isOnline ? 'wifi' : 'wifi-off'} 
            size={18} 
            color="#fff" 
            style={styles.icon} 
          />
        )}
        <Text style={styles.text}>
          {isChecking 
            ? 'Vérification de la connexion...' 
            : isOnline 
              ? 'Connecté' 
              : 'Mode hors ligne - Certaines fonctionnalités peuvent être limitées'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: isOnline => isOnline ? colors.primary : '#e53935',
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    flex: 1,
  },
});

export default ConnectivityStatus;
