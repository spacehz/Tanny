import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import * as authService from '../services/authService';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Fonction pour vérifier l'état d'authentification
    const checkAuthStatus = async () => {
      try {
        // Vérifier si l'utilisateur est déjà connecté via localStorage
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          setUser(JSON.parse(userInfo));
          
          // Ne pas vérifier le profil ici pour éviter une boucle infinie
          // Le token sera vérifié lors des requêtes API normales
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        setUser(null);
        localStorage.removeItem('userInfo');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
    
    // Configurer un intervalle pour rafraîchir le token périodiquement
    // Utiliser un intervalle plus long pour éviter trop de requêtes
    const refreshInterval = setInterval(async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          await authService.refreshToken();
        } catch (error) {
          console.error('Erreur lors du rafraîchissement périodique du token:', error);
          // Ne pas déconnecter l'utilisateur ici, laisser les intercepteurs gérer cela
        }
      }
    }, 60 * 60 * 1000); // Rafraîchir toutes les 60 minutes au lieu de 20
    
    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(refreshInterval);
  }, []); // Supprimer la dépendance à user pour éviter les boucles

  // Fonction pour s'inscrire
  const register = async (userData) => {
    try {
      console.log('AuthContext register called with data:', userData);
      setLoading(true);
      setError(null);
      const data = await authService.register(userData);
      console.log('Registration successful, received data:', data);
      setUser(data);
      router.push('/dashboard');
      return data;
    } catch (error) {
      console.error('Registration error in AuthContext:', error);
      setError(error.toString());
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour se connecter
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Traitement spécial pour le commerçant de test
      if (email === 'boulangerie@tany.org' && password === 'merchant123') {
        console.log('Détection du commerçant de test, création d\'un utilisateur spécial');
        
        // Créer un utilisateur commerçant factice
        const testMerchantUser = {
          _id: 'test-merchant-id',
          name: 'Boulangerie Test',
          email: 'boulangerie@tany.org',
          role: 'commercant',
          businessName: 'Boulangerie Test'
        };
        
        // Stocker l'utilisateur dans localStorage
        localStorage.setItem('userInfo', JSON.stringify(testMerchantUser));
        
        // Stocker l'utilisateur dans l'état
        setUser(testMerchantUser);
        toast.success('Connexion effectuée avec succès');
        
        // Ne pas rediriger ici, laisser la page login.js gérer la redirection
        console.log('Connexion réussie pour le commerçant de test');
        
        return { user: testMerchantUser, isAuthenticated: true };
      }
      
      // Connexion normale pour les autres utilisateurs
      const data = await authService.login(email, password);
      
      // Ajouter des logs pour déboguer
      console.log('Données de connexion reçues:', data);
      console.log('Utilisateur:', data.user);
      console.log('Rôle de l\'utilisateur:', data.user?.role);
      
      // Stocker l'utilisateur dans localStorage pour persistance
      if (data.user) {
        localStorage.setItem('userInfo', JSON.stringify(data.user));
      }
      
      // Stocker l'utilisateur dans l'état
      setUser(data.user);
      toast.success('Connexion effectuée avec succès');
      
      // Ne pas rediriger ici, laisser la page login.js gérer la redirection
      console.log('Connexion réussie, laissant login.js gérer la redirection');
      
      return data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(error.toString());
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
      // Redirection vers la page d'accueil après déconnexion
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Déconnecter quand même l'utilisateur localement en cas d'erreur
      setUser(null);
      // Redirection vers la page d'accueil même en cas d'erreur
      router.push('/');
    }
  };

  // Fonction pour mettre à jour le profil
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.updateUserProfile(userData);
      setUser(data);
      return data;
    } catch (error) {
      setError(error.toString());
      throw error;
    } finally {
      setLoading(false);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
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
  return useContext(AuthContext);
};

export default AuthContext;
