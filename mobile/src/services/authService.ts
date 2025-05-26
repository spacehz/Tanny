import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fonction pour valider l'email
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Fonction pour se connecter avec validation des entrées
export const login = async (email: string, password: string) => {
  try {
    // Valider l'email et le mot de passe
    if (!email || !password) {
      throw new Error('Email et mot de passe requis');
    }
    
    if (!validateEmail(email)) {
      throw new Error('Format d\'email invalide');
    }
    
    if (password.length < 6) {
      throw new Error('Le mot de passe doit contenir au moins 6 caractères');
    }
    
    // Utiliser la route d'authentification des utilisateurs
    const response = await api.post('/api/users/login', { email, password }, {
      withCredentials: true, // Important pour que les cookies soient acceptés
      timeout: 15000, // Augmenter le timeout pour les connexions lentes
    });
    
    if (response.data && response.data.user) {
      // Stocker uniquement les informations utilisateur, pas le token (qui est dans un cookie HTTP-only)
      await AsyncStorage.setItem('userInfo', JSON.stringify(response.data.user));
      
      // Stocker la date de dernière connexion
      await AsyncStorage.setItem('lastLoginTime', Date.now().toString());
      
      console.log('Utilisateur connecté:', response.data.user);
      console.log('Rôle de l\'utilisateur:', response.data.user.role);
    } else {
      throw new Error('Réponse de connexion invalide');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Erreur de connexion:', error);
    
    // Améliorer la gestion des erreurs
    if (error.response) {
      // Erreur de réponse du serveur
      throw error.response.data?.message || `Erreur serveur: ${error.response.status}`;
    } else if (error.request) {
      // Pas de réponse du serveur
      throw 'Serveur inaccessible. Vérifiez votre connexion internet.';
    } else {
      // Erreur de configuration de la requête
      throw error.message || 'Erreur lors de la connexion';
    }
  }
};

// Fonction pour se déconnecter
export const logout = async () => {
  try {
    // Appeler l'API pour supprimer les cookies côté serveur
    await api.post('/api/users/logout', {}, { withCredentials: true });
    
    // Supprimer les données locales
    await AsyncStorage.removeItem('userInfo');
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    // Supprimer quand même les données locales en cas d'erreur
    await AsyncStorage.removeItem('userInfo');
    return false;
  }
};

// Fonction pour obtenir le profil utilisateur
export const getUserProfile = async () => {
  try {
    // Vérifier si nous avons déjà les informations utilisateur dans le AsyncStorage
    const userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      // Ajouter un délai pour éviter trop de requêtes consécutives
      const lastProfileCheck = await AsyncStorage.getItem('lastProfileCheck');
      const now = Date.now();
      
      if (lastProfileCheck && now - parseInt(lastProfileCheck) < 60000) { // 1 minute
        // Si moins d'une minute s'est écoulée depuis la dernière vérification, utiliser les données en cache
        return JSON.parse(userInfo);
      }
    }
    
    // Sinon, faire la requête API
    const response = await api.get('/api/users/profile');
    
    // Mettre à jour le timestamp de la dernière vérification
    await AsyncStorage.setItem('lastProfileCheck', Date.now().toString());
    
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Erreur lors de la récupération du profil';
  }
};

// Fonction pour rafraîchir le token
export const refreshToken = async () => {
  try {
    // Vérifier si nous avons déjà rafraîchi le token récemment
    const lastRefresh = await AsyncStorage.getItem('lastTokenRefresh');
    const now = Date.now();
    
    if (lastRefresh && now - parseInt(lastRefresh) < 300000) { // 5 minutes
      // Si moins de 5 minutes se sont écoulées depuis le dernier rafraîchissement, ne pas rafraîchir
      console.log('Token déjà rafraîchi récemment, attente avant nouvelle tentative');
      return true;
    }
    
    const response = await api.post('/api/users/refresh-token', {}, {
      withCredentials: true
    });
    
    // Mettre à jour le timestamp du dernier rafraîchissement
    await AsyncStorage.setItem('lastTokenRefresh', now.toString());
    
    return response.data.isAuthenticated;
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    return false;
  }
};
