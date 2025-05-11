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
    // Vérifier si l'utilisateur est déjà connecté
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
    setLoading(false);
  }, []);

  // Fonction pour s'inscrire
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.register(userData);
      setUser(data);
      router.push('/dashboard');
      return data;
    } catch (error) {
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
      const data = await authService.login(email, password);
      setUser(data.user);
      toast.success('Connexion effectuée avec succès');
      
      // Vérifier si l'utilisateur est admin et rediriger
      if (data.user && data.user.role === 'admin') {
        // Utiliser await pour s'assurer que la redirection est terminée
        await router.push('/admin');
      } else {
        // Redirection pour les utilisateurs non-admin
        await router.push('/');
      }
      
      return data;
    } catch (error) {
      setError(error.toString());
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour se déconnecter
  const logout = () => {
    authService.logout();
    setUser(null);
    router.push('/login');
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
    return user && (user.role === 'merchant' || user.role === 'admin');
  };

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
