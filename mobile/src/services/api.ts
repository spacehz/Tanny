import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de l'API basée sur la configuration ngrok fournie
const API_URL = 'https://e4ef-197-14-53-186.ngrok-free.app';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Always include credentials with requests
  timeout: 10000, // 10 seconds timeout to prevent hanging requests
});

// Variable pour suivre si un rafraîchissement est en cours
let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = [];
// Variable pour éviter les boucles infinies
let consecutiveFailures = 0;
const MAX_CONSECUTIVE_FAILURES = 3;

// Fonction pour traiter la file d'attente
const processQueue = (error: any, token = null) => {
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
      await AsyncStorage.removeItem('userInfo');
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
        await AsyncStorage.removeItem('userInfo');
        
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
        await AsyncStorage.removeItem('userInfo');
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
