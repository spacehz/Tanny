import api from './api';

/**
 * Récupère toutes les donations d'un commerçant
 * @param {Object} options - Options de pagination
 * @param {number} options.page - Numéro de page
 * @param {number} options.limit - Nombre d'éléments par page
 * @returns {Promise} Promesse contenant les données des donations
 */
export const getMerchantDonations = async (options = {}) => {
  try {
    const { page = 1, limit = 10 } = options;
    console.log(`Appel API pour récupérer les donations: page=${page}, limit=${limit}`);
    
    // Vérifier si l'utilisateur est authentifié
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      console.error('Utilisateur non authentifié');
      return {
        donations: [],
        pages: 1,
        page: 1,
        total: 0
      };
    }
    
    // Ajouter un timeout pour éviter les attentes infinies
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes
    
    try {
      const response = await api.get(`/api/donations/merchant?page=${page}&limit=${limit}`, {
        signal: controller.signal
      });
      
      // Annuler le timeout
      clearTimeout(timeoutId);
      
      console.log('Réponse brute de l\'API:', response);
      
      // Si la réponse est vide ou n'a pas le format attendu, retourner un objet par défaut
      if (!response.data) {
        console.log('Réponse vide, retour d\'un objet par défaut');
        return {
          donations: [],
          pages: 1,
          page: 1,
          total: 0
        };
      }
      
      // Vérifier le format de la réponse et adapter si nécessaire
      if (Array.isArray(response.data)) {
        // Si la réponse est directement un tableau de donations
        console.log('Réponse sous forme de tableau');
        return {
          donations: response.data,
          pages: 1,
          page: 1,
          total: response.data.length
        };
      } else if (response.data.donations) {
        // Format standard avec pagination
        console.log('Réponse au format standard avec pagination');
        return {
          donations: response.data.donations,
          pages: response.data.pages || Math.ceil(response.data.total / limit) || 1,
          page: response.data.page || page,
          total: response.data.total || response.data.donations.length
        };
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Format alternatif
        console.log('Réponse au format alternatif');
        return {
          donations: response.data.data,
          pages: response.data.totalPages || Math.ceil(response.data.data.length / limit) || 1,
          page: response.data.currentPage || page,
          total: response.data.totalItems || response.data.data.length
        };
      }
      
      // Si aucun format reconnu, retourner un objet par défaut
      console.log('Format de réponse non reconnu, retour d\'un objet par défaut');
      return {
        donations: [],
        pages: 1,
        page: 1,
        total: 0
      };
    } catch (abortError) {
      // Annuler le timeout
      clearTimeout(timeoutId);
      
      if (abortError.name === 'AbortError') {
        console.error('La requête a été abandonnée après 10 secondes');
        return {
          donations: [],
          pages: 1,
          page: 1,
          total: 0,
          error: 'Timeout'
        };
      }
      
      throw abortError;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des donations:', error);
    
    // Retourner un objet avec une erreur au lieu de lancer une exception
    return {
      donations: [],
      pages: 1,
      page: 1,
      total: 0,
      error: error.message || 'Erreur inconnue'
    };
  }
};

/**
 * Récupère une donation par son ID
 * @param {string} id - ID de la donation
 * @returns {Promise} Promesse contenant les données de la donation
 */
export const getDonationById = async (id) => {
  try {
    const response = await api.get(`/api/donations/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Crée une nouvelle donation
 * @param {Object} donationData - Données de la donation à créer
 * @returns {Promise} Promesse contenant les données de la donation créée
 */
export const createDonation = async (donationData) => {
  try {
    console.log('Données de donation envoyées:', donationData);
    
    // Validation des données
    if (!donationData.eventId) {
      throw new Error('ID de l\'événement manquant');
    }
    
    if (!donationData.donations || !Array.isArray(donationData.donations) || donationData.donations.length === 0) {
      throw new Error('Aucun produit à donner spécifié');
    }
    
    // Transformation des données pour correspondre exactement au format attendu par l'API
    // Le contrôleur backend attend eventId et items
    const apiDonationData = {
      eventId: donationData.eventId,
      items: donationData.donations.map(item => ({
        product: item.product.trim(),
        quantity: parseFloat(item.quantity) || 1,
        unit: item.unit || 'kg'
      })),
      note: donationData.note || ''
    };
    
    console.log('Envoi de la requête POST à /api/donations avec les données:', apiDonationData);
    
    // Vérifier si l'utilisateur est authentifié
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
      console.error('Utilisateur non authentifié');
      throw new Error('Vous devez être connecté pour faire un don. Veuillez vous reconnecter.');
    }
    
    // Obtenir un token CSRF manuellement avant de faire la requête
    let csrfToken;
    try {
      const csrfResponse = await api.get('/api/csrf-token');
      csrfToken = csrfResponse.data.csrfToken;
      console.log('CSRF token obtenu manuellement:', csrfToken);
    } catch (csrfError) {
      console.error('Erreur lors de l\'obtention du token CSRF:', csrfError);
      // Continuer sans token CSRF, l'intercepteur essaiera à nouveau
    }
    
    // Appel à l'API avec configuration explicite
    const response = await api.post('/api/donations', apiDonationData, {
      withCredentials: true,
      headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {}
    });
    
    console.log('Réponse de l\'API:', response);
    
    // Vérifier si la réponse contient des données
    if (!response.data) {
      console.warn('La réponse de l\'API ne contient pas de données');
      // Retourner un objet minimal pour éviter les erreurs
      return {
        success: true,
        message: 'Donation créée avec succès',
        donation: apiDonationData
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la donation:', error);
    
    // Améliorer le message d'erreur
    if (error.response) {
      // Erreur de réponse du serveur
      const status = error.response.status;
      const message = error.response.data?.message || 'Erreur serveur';
      
      console.error(`Erreur ${status}: ${message}`);
      console.error('Headers:', error.response.headers);
      
      if (status === 401) {
        // Tenter de rafraîchir le token et réessayer
        try {
          console.log('Tentative de rafraîchissement du token...');
          await api.post('/api/users/refresh-token', {}, { withCredentials: true });
          console.log('Token rafraîchi, nouvelle tentative...');
          
          // Réessayer la requête après rafraîchissement du token
          return await createDonation(donationData);
        } catch (refreshError) {
          console.error('Échec du rafraîchissement du token:', refreshError);
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }
      } else if (status === 400) {
        throw new Error(`Données invalides: ${message}`);
      } else if (status === 404) {
        throw new Error(`Événement non trouvé: ${message}`);
      } else if (status === 403) {
        throw new Error(`Accès refusé: ${message}. Vous n'avez pas les droits nécessaires.`);
      } else {
        throw new Error(`Erreur serveur (${status}): ${message}`);
      }
    } else if (error.request) {
      // Pas de réponse reçue du serveur
      console.error('Aucune réponse reçue:', error.request);
      throw new Error('Impossible de contacter le serveur. Vérifiez votre connexion internet.');
    }
    
    // Erreur générique
    throw error;
  }
};

/**
 * Met à jour une donation existante
 * @param {string} id - ID de la donation à mettre à jour
 * @param {Object} donationData - Nouvelles données de la donation
 * @returns {Promise} Promesse contenant les données de la donation mise à jour
 */
export const updateDonation = async (id, donationData) => {
  try {
    const response = await api.put(`/api/donations/${id}`, donationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Supprime une donation
 * @param {string} id - ID de la donation à supprimer
 * @returns {Promise} Promesse contenant un message de confirmation
 */
export const deleteDonation = async (id) => {
  try {
    const response = await api.delete(`/api/donations/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
