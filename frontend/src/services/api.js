import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout to prevent hanging requests
});

// Add a request interceptor to include CSRF token
api.interceptors.request.use(
  async (config) => {
    // Ajouter withCredentials pour envoyer les cookies avec chaque requête
    config.withCredentials = true;
    
    // Pour les requêtes qui modifient des données, obtenir un token CSRF
    if (['post', 'put', 'delete', 'patch'].includes(config.method) && 
        !config.url.includes('/api/users/login') && 
        !config.url.includes('/api/users/register') &&
        !config.url.includes('/api/users/refresh-token')) {
      try {
        const response = await axios.get(`${config.baseURL}/api/csrf-token`, { withCredentials: true });
        config.headers['X-CSRF-Token'] = response.data.csrfToken;
      } catch (error) {
        console.error('Erreur lors de la récupération du token CSRF:', error);
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Variable pour suivre si un rafraîchissement est en cours
let isRefreshing = false;
let failedQueue = [];
// Variable pour éviter les boucles infinies
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 3;

// Fonction pour traiter la file d'attente
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Réinitialiser le compteur de défaillances consécutives en cas de succès
    consecutiveFailures = 0;
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Éviter les boucles infinies en limitant le nombre de tentatives consécutives
    if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
      console.error('Trop de tentatives de rafraîchissement consécutives, déconnexion forcée');
      localStorage.removeItem('userInfo');
      
      // Rediriger vers la page de connexion
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login?session=expired&reason=too_many_attempts';
      }
      
      return Promise.reject(error);
    }
    
    // Si le token est expiré et que nous n'avons pas déjà essayé de le rafraîchir
    if (error.response && 
        error.response.status === 401 && 
        error.response.data && 
        error.response.data.tokenExpired && 
        !originalRequest._retry) {
      
      consecutiveFailures++;
      
      if (isRefreshing) {
        // Si un rafraîchissement est déjà en cours, mettre la requête en file d'attente
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Appeler l'endpoint de rafraîchissement du token
        await axios.post(`${originalRequest.baseURL}/api/users/refresh-token`, {}, {
          withCredentials: true
        });
        
        // Traiter la file d'attente avec succès
        processQueue(null);
        
        // Réessayer la requête originale
        return api(originalRequest);
      } catch (refreshError) {
        // Traiter la file d'attente avec erreur
        processQueue(refreshError);
        
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        localStorage.removeItem('userInfo');
        
        // Rediriger vers la page de connexion
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login?session=expired';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Pour les autres erreurs 401 (non liées à l'expiration du token)
    if (error.response && error.response.status === 401) {
      // Incrémenter le compteur de défaillances consécutives
      consecutiveFailures++;
      
      // Déconnecter l'utilisateur après plusieurs tentatives
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        localStorage.removeItem('userInfo');
        
        // Rediriger vers la page de connexion
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login?auth=failed';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Vérifie si le backend est disponible
 * @returns {Promise<boolean>} true si le backend est disponible, false sinon
 */
export const checkBackendAvailability = async () => {
  try {
    // Essayer de faire une requête simple au backend
    const response = await axios.get(`${api.defaults.baseURL}/api/health`, { 
      timeout: 5000,
      validateStatus: status => status < 500 // Accepter tous les codes de statut sauf les 5xx
    });
    
    // Si on obtient une réponse, le backend est disponible
    return response.status < 500;
  } catch (error) {
    console.error('Erreur lors de la vérification de disponibilité du backend:', error);
    return false;
  }
};

export default api;
