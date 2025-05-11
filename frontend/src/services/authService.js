import api from './api';

// Fonction pour s'inscrire
export const register = async (userData) => {
  try {
    const response = await api.post('/api/users/register', userData);
    
    if (response.data) {
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Erreur lors de l\'inscription';
  }
};

// Fonction pour se connecter
export const login = async (email, password) => {
  try {
    const response = await api.post('/api/users/login', { email, password });
    
    if (response.data) {
      // S'assurer que les données utilisateur sont correctement stockées
      localStorage.setItem('userInfo', JSON.stringify(response.data.user));
      localStorage.setItem('token', response.data.token);
      
      // Ajouter un log pour déboguer
      console.log('Utilisateur connecté:', response.data.user);
      console.log('Rôle de l\'utilisateur:', response.data.user.role);
    }
    
    return response.data;
  } catch (error) {
    console.error('Erreur de connexion:', error);
    throw error.response?.data?.message || 'Erreur lors de la connexion';
  }
};

// Fonction pour se déconnecter
export const logout = () => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('token');
};

// Fonction pour obtenir le profil utilisateur
export const getUserProfile = async () => {
  try {
    const response = await api.get('/api/users/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Erreur lors de la récupération du profil';
  }
};

// Fonction pour mettre à jour le profil utilisateur
export const updateUserProfile = async (userData) => {
  try {
    const response = await api.put('/api/users/profile', userData);
    
    if (response.data) {
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Erreur lors de la mise à jour du profil';
  }
};

// Fonction pour vérifier si l'utilisateur est admin
export const isAdmin = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return userInfo && userInfo.role === 'admin';
};

// Fonction pour vérifier si l'utilisateur est marchand
export const isMerchant = () => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  return userInfo && (userInfo.role === 'merchant' || userInfo.role === 'admin');
};
