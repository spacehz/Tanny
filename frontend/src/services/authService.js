import api from './api';

// Fonction pour s'inscrire
export const register = async (userData) => {
  try {
    console.log('authService.register called with userData:', userData);
    let response;
    
    // Si c'est un commerçant, utiliser l'API des commerçants
    if (userData.role === 'commercant') {
      console.log('Détecté comme commerçant, préparation des données');
      // Créer le commerçant dans la base de données
      const merchantData = {
        businessName: userData.businessName,
        legalRepresentative: userData.legalRepresentative,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        siret: userData.siret,
        password: userData.password, // Ajout du mot de passe
        address: userData.address
      };
      
      console.log('Création du commerçant avec les données:', merchantData);
      try {
        // Obtenir un token CSRF avant de faire la requête POST
        const csrfResponse = await api.get('/api/csrf-token', { withCredentials: true });
        const csrfToken = csrfResponse.data.csrfToken;
        
        response = await api.post('/api/merchants/auth/register', merchantData, {
          withCredentials: true,
          headers: { 'X-CSRF-Token': csrfToken }
        });
        console.log('Réponse API merchants:', response);
        
        // Si le commerçant est créé avec succès, stocker les informations dans localStorage
        if (response.data) {
          console.log('Commerçant créé avec succès');
          // Créer un objet utilisateur à partir des données du commerçant
          const userInfo = {
            _id: response.data._id,
            name: response.data.businessName,
            email: response.data.email,
            role: 'commercant',
            businessName: response.data.businessName
          };
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }
      } catch (merchantError) {
        console.error('Erreur lors de la création du commerçant:', merchantError);
        console.error('Détails:', merchantError.response?.data);
        throw merchantError;
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
    // Vérifier si c'est un commerçant (email spécifique pour le test)
    if (email === 'boulangerie@tany.org' || email.includes('@commercant.') || email.includes('@merchant.')) {
      console.log('Tentative de connexion en tant que commerçant');
      // Utiliser la route d'authentification des commerçants
      const response = await api.post('/api/merchants/auth/login', { email, password }, {
        withCredentials: true // Important pour que les cookies soient acceptés
      });
      return response.data;
    }
    
    // Sinon, utiliser la route d'authentification des utilisateurs
    const response = await api.post('/api/users/login', { email, password }, {
      withCredentials: true // Important pour que les cookies soient acceptés
    });
    
    if (response.data && response.data.user) {
      // Vérifier si c'est un commerçant (email spécifique pour le test)
      if (email === 'boulangerie@tany.org') {
        console.log('Détection de l\'utilisateur de test commerçant');
        // Forcer le rôle à 'commercant' pour le commerçant de test
        response.data.user.role = 'commercant';
      }
      
      // Stocker uniquement les informations utilisateur, pas le token (qui est dans un cookie HTTP-only)
      localStorage.setItem('userInfo', JSON.stringify(response.data.user));
      
      // Ajouter un log pour déboguer
      console.log('Utilisateur connecté:', response.data.user);
      console.log('Rôle de l\'utilisateur:', response.data.user.role);
      
      // Vérifier si l'utilisateur est un commerçant
      const role = response.data.user.role ? response.data.user.role.toLowerCase() : '';
      const isMerchant = role === 'merchant' || role === 'commercant' || role === 'commerçant';
      console.log('Est commerçant?', isMerchant);
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
  try {
    const userInfoStr = localStorage.getItem('userInfo');
    if (!userInfoStr) return false;
    
    const userInfo = JSON.parse(userInfoStr);
    if (!userInfo) return false;
    
    const role = userInfo.role ? userInfo.role.toLowerCase() : '';
    return role === 'merchant' || role === 'commercant' || role === 'commerçant' || role === 'admin';
  } catch (error) {
    console.error('Erreur lors de la vérification du rôle marchand:', error);
    return false;
  }
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

// Fonction pour valider la session utilisateur
export const validateSession = async () => {
  try {
    // Vérifier si nous avons déjà validé la session récemment
    const lastValidation = localStorage.getItem('lastSessionValidation');
    const now = Date.now();
    
    if (lastValidation && now - parseInt(lastValidation) < 300000) { // 5 minutes
      // Si moins de 5 minutes se sont écoulées depuis la dernière validation, considérer la session comme valide
      console.log('Session déjà validée récemment');
      return true;
    }
    
    // Essayer d'accéder à une route protégée pour vérifier si la session est valide
    const response = await api.get('/api/users/check-auth', {
      withCredentials: true,
      // Ajouter un timeout court pour éviter de bloquer trop longtemps
      timeout: 5000
    });
    
    // Mettre à jour le timestamp de la dernière validation
    localStorage.setItem('lastSessionValidation', now.toString());
    
    return response.data.isAuthenticated === true;
  } catch (error) {
    console.error('Erreur lors de la validation de la session:', error);
    // Si l'erreur est 401 ou 403, la session n'est pas valide
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.log('Session invalide (401/403)');
      return false;
    }
    
    // En cas d'erreur réseau ou autre, considérer que la session pourrait être valide
    // pour éviter de déconnecter l'utilisateur inutilement
    console.log('Erreur réseau lors de la validation de session, considérant comme potentiellement valide');
    return true;
  }
};

// Fonction pour effacer toutes les données d'authentification
export const clearAuthData = () => {
  localStorage.removeItem('userInfo');
  localStorage.removeItem('lastProfileCheck');
  localStorage.removeItem('lastTokenRefresh');
  localStorage.removeItem('lastSessionValidation');
  console.log('Toutes les données d\'authentification ont été effacées');
};

// Fonction pour nettoyer les données d'authentification invalides
export const cleanupAuthData = () => {
  try {
    // Vérifier si des données utilisateur existent dans le localStorage
    const userInfoStr = localStorage.getItem('userInfo');
    
    if (userInfoStr) {
      try {
        // Essayer de parser les données JSON
        const userInfo = JSON.parse(userInfoStr);
        
        // Vérifier si les données utilisateur sont valides
        if (!userInfo || !userInfo._id || !userInfo.role) {
          console.log('Données utilisateur invalides dans localStorage, suppression');
          localStorage.removeItem('userInfo');
        }
      } catch (parseError) {
        // Si le parsing échoue, les données sont corrompues
        console.error('Erreur lors du parsing des données utilisateur:', parseError);
        localStorage.removeItem('userInfo');
      }
    }
    
    // Nettoyer également d'autres données d'authentification potentiellement invalides
    const lastProfileCheck = localStorage.getItem('lastProfileCheck');
    if (lastProfileCheck && isNaN(parseInt(lastProfileCheck))) {
      localStorage.removeItem('lastProfileCheck');
    }
    
    const lastTokenRefresh = localStorage.getItem('lastTokenRefresh');
    if (lastTokenRefresh && isNaN(parseInt(lastTokenRefresh))) {
      localStorage.removeItem('lastTokenRefresh');
    }
    
    const lastSessionValidation = localStorage.getItem('lastSessionValidation');
    if (lastSessionValidation && isNaN(parseInt(lastSessionValidation))) {
      localStorage.removeItem('lastSessionValidation');
    }
    
    console.log('Nettoyage des données d\'authentification terminé');
  } catch (error) {
    console.error('Erreur lors du nettoyage des données d\'authentification:', error);
  }
};
