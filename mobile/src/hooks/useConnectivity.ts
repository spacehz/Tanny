import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { checkBackendAvailability } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hook personnalisé pour gérer l'état de la connectivité
 */
export const useConnectivity = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Vérifier la connectivité
  const checkConnectivity = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsChecking(true);
    }
    
    try {
      const online = await checkBackendAvailability(true);
      setIsOnline(online);
      
      // Si nous sommes de nouveau en ligne, traiter les actions en attente
      if (online) {
        await processOfflineQueue();
      }
      
      return online;
    } catch (error) {
      console.error('Erreur lors de la vérification de la connectivité:', error);
      setIsOnline(false);
      return false;
    } finally {
      if (showLoading) {
        setIsChecking(false);
      }
    }
  }, []);

  // Traiter la file d'attente des actions hors ligne
  const processOfflineQueue = async () => {
    try {
      const queuedActionsJson = await AsyncStorage.getItem('offline_actions_queue');
      if (!queuedActionsJson) return;
      
      const queuedActions = JSON.parse(queuedActionsJson);
      
      // Marquer toutes les actions comme exécutées
      // Dans une implémentation réelle, vous exécuteriez les actions ici
      Object.keys(queuedActions).forEach(key => {
        queuedActions[key].executed = true;
      });
      
      await AsyncStorage.setItem('offline_actions_queue', JSON.stringify(queuedActions));
      
      console.log('File d\'attente hors ligne traitée');
    } catch (error) {
      console.error('Erreur lors du traitement de la file d\'attente hors ligne:', error);
    }
  };

  // Gérer les changements d'état de l'application
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // Vérifier la connectivité lorsque l'application revient au premier plan
      checkConnectivity(false);
    }
  }, [checkConnectivity]);

  // Configurer les écouteurs d'événements
  useEffect(() => {
    // Vérifier la connectivité au montage
    checkConnectivity();
    
    // Configurer l'écouteur pour les changements d'état de l'application
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Nettoyer les écouteurs lors du démontage
    return () => {
      subscription.remove();
    };
  }, [checkConnectivity, handleAppStateChange]);

  return {
    isOnline,
    isChecking,
    checkConnectivity
  };
};
