import api from './api';

// Fonction pour s'inscrire
export const register = async (userData) => {
  try {
    console.log('authService.register called with userData:', userData);
    let response;
    
    // Si c'est un commerçant, utiliser l'API des commerçants
    if (userData.role === 'commercant') {
      console.log('Détecté comme commerçant, préparation des données');
      // Créer d'abord le commerçant dans la base de données
      const merchantData = {
        businessName: userData.businessName,
        legalRepresentative: userData.legalRepresentative,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        siret: userData.siret,
        address: userData.address
      };
      
      console.log('Création du commerçant avec les données:', merchantData);
      try {
        // Obtenir un token CSRF avant de faire la requête POST
        const csrfResponse = await api.get('/api/csrf-token', { withCredentials: true });
        const csrfToken = csrfResponse.data.csrfToken;
        
        response = await api.post('/api/merchants', merchantData, {
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken }
        });
        console.log('Réponse API merchants:', response);
      } catch (merchantError) {
        console.error('Erreur lors de la création du commerçant:', merchantError);
        console.error('Détails:', merchantError.response?.data);
        throw merchantError;
      }
      
      // Après avoir créé le commerçant, créer un compte utilisateur associé
      if (response.data) {
        console.log('Commerçant créé avec succès, création du compte utilisateur');
        
        const userAccountData = {
          name: userData.name || userData.businessName, // Utiliser le nom si fourni, sinon le nom commercial
          email: userData.email,
          password: userData.password,
          role: 'commercant',
          businessName: userData.businessName // Pour lier l'utilisateur au commerçant
        };
        
        console.log('Données utilisateur pour le commerçant:', userAccountData);
        
        try {
          // Créer un compte utilisateur lié au commerçant
          const userResponse = await api.post('/api/users/register', userAccountData, {
            withCredentials: true
          });
          console.log('Réponse API users/register:', userResponse);
          
          if (userResponse.data && userResponse.data.user) {
            console.log('Compte utilisateur créé avec succès');
            localStorage.setItem('userInfo', JSON.stringify(userResponse.data.user));
            return userResponse.data;
          }
        } catch (userError) {
          console.error('Erreur lors de la création du compte utilisateur:', userError);
          console.error('Détails:', userError.response?.data);
          throw userError;
        }
      }
    } else {
      // Si c'est un bénévole, utiliser l'API des utilisateurs
      console.log('Détecté comme bénévole, préparation des données:', userData);
      try {
        response = await api.post('/api/users/register', userData, {
          withCredentials: true
        });
        console.log('Réponse API users/register pour bénévole:', response);
        
        if (response.data && response.data.user) {
          console.log('Compte bénévole créé avec succès');
          localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        }
      } catch (volunteerError) {
        console.error('Erreur lors de la création du bénévole:', volunteerError);
        console.error('Détails:', volunteerError.response?.data);
        throw volunteerError;
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    // Afficher plus de détails sur l'erreur pour le débogage
    if (error.response) {
      console.error('Détails de l\'erreur:', error.response.data);
    }
    throw error.response?.data?.message || 'Erreur lors de l\'inscription';
  }
};

// Fonction pour se connecter
export const login = async (email, password) => {
  try {
    // Configurer axios pour envoyer les cookies avec la requête
    const response = await api.post('/api/users/login', { email, password }, {
      withCredentials: true // Important pour que les cookies soient acceptés
    });
    
    if (response.data && response.data.user) {
      // Stocker uniquement les informations utilisateur, pas le token (qui est dans un cookie HTTP-only)
      localStorage.setItem('userInfo', JSON.stringify(response.data.user));
      
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
export const logout = async () => {
  try {
    // Appeler l'API pour supprimer les cookies côté serveur
    await api.post('/api/users/logout', {}, { withCredentials: true });
    
    // Supprimer les données locales
    localStorage.removeItem('userInfo');
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    // Supprimer quand même les données locales en cas d'erreur
    localStorage.removeItem('userInfo');
    return false;
  }
};

// Fonction pour obtenir le profil utilisateur
export const getUserProfile = async () => {
  try {
    // Vérifier si nous avons déjà les informations utilisateur dans le localStorage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      // Ajouter un délai pour éviter trop de requêtes consécutives
      const lastProfileCheck = localStorage.getItem('lastProfileCheck');
      const now = Date.now();
      
      if (lastProfileCheck && now - parseInt(lastProfileCheck) < 60000) { // 1 minute
        // Si moins d'une minute s'est écoulée depuis la dernière vérification, utiliser les données en cache
        return JSON.parse(userInfo);
      }
    }
    
    // Sinon, faire la requête API
    const response = await api.get('/api/users/profile');
    
    // Mettre à jour le timestamp de la dernière vérification
    localStorage.setItem('lastProfileCheck', Date.now().toString());
    
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

// Fonction pour rafraîchir le token
export const refreshToken = async () => {
  try {
    // Vérifier si nous avons déjà rafraîchi le token récemment
    const lastRefresh = localStorage.getItem('lastTokenRefresh');
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
    localStorage.setItem('lastTokenRefresh', now.toString());
    
    return response.data.isAuthenticated;
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    return false;
  }
};

// Fonction pour obtenir un token CSRF
export const getCsrfToken = async () => {
  try {
    const response = await api.get('/api/csrf-token', {
      withCredentials: true
    });
    
    return response.data.csrfToken;
  } catch (error) {
    console.error('Erreur lors de la récupération du token CSRF:', error);
    throw error;
  }
};
