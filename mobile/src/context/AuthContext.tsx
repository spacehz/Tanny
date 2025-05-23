import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';
import { Alert } from 'react-native';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  businessName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isMerchant: () => boolean;
  isVolunteer: () => boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour effacer les données d'authentification
  const clearAuthData = async () => {
    try {
      await AsyncStorage.removeItem('userInfo');
      console.log('Données d\'authentification effacées');
    } catch (error) {
      console.error('Erreur lors de l\'effacement des données d\'authentification:', error);
    }
  };

  useEffect(() => {
    // Fonction pour vérifier l'état d'authentification
    const checkAuthStatus = async () => {
      try {
        // Pour le débogage, effacer les données d'authentification au démarrage
        // Décommentez la ligne suivante pour forcer la déconnexion au démarrage
        await clearAuthData();
        
        // Vérifier si l'utilisateur est déjà connecté via AsyncStorage
        const userInfo = await AsyncStorage.getItem('userInfo');
        console.log('UserInfo from AsyncStorage:', userInfo);
        
        if (userInfo) {
          setUser(JSON.parse(userInfo));
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setUser(null);
        await AsyncStorage.removeItem('userInfo');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
    
    // Configurer un intervalle pour rafraîchir le token périodiquement
    const refreshInterval = setInterval(async () => {
      const userInfo = await AsyncStorage.getItem('userInfo');
      if (userInfo) {
        try {
          await authService.refreshToken();
        } catch (error) {
          console.error('Erreur lors du rafraîchissement périodique du token:', error);
        }
      }
    }, 60 * 60 * 1000); // Rafraîchir toutes les 60 minutes
    
    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(refreshInterval);
  }, []);

  // Fonction pour se connecter
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await authService.login(email, password);
      console.log('Login response:', data);
      
      // Stocker l'utilisateur dans AsyncStorage pour persistance
      if (data.user) {
        await AsyncStorage.setItem('userInfo', JSON.stringify(data.user));
        console.log('User info stored in AsyncStorage');
      } else {
        console.warn('No user data received from login');
        Alert.alert('Erreur de connexion', 'Aucune donnée utilisateur reçue');
      }
      
      // Stocker l'utilisateur dans l'état
      setUser(data.user);
      
      return data;
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      setError(error.toString());
      Alert.alert('Erreur de connexion', error.toString());
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour se déconnecter
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      await AsyncStorage.removeItem('userInfo');
      console.log('Déconnexion réussie');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Déconnecter quand même l'utilisateur localement en cas d'erreur
      setUser(null);
      await AsyncStorage.removeItem('userInfo');
    }
  };

  // Vérifier si l'utilisateur est admin
  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  // Vérifier si l'utilisateur est marchand
  const isMerchant = () => {
    return user && (user.role === 'merchant' || user.role === 'commercant' || user.role === 'commerçant' || user.role === 'admin');
  };

  // Vérifier si l'utilisateur est bénévole
  const isVolunteer = () => {
    return user && (user.role === 'volunteer' || user.role === 'bénévole' || user.role === 'admin');
  };

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!user;

  console.log('Auth state:', { isAuthenticated, user });

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        isAdmin,
        isMerchant,
        isVolunteer,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
