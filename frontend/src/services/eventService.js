import api, { checkBackendAvailability } from './api';

/**
 * Récupère tous les événements
 * @param {Object} options - Options de filtrage et pagination
 * @param {string} options.type - Type d'événement à filtrer (optionnel)
 * @param {number} options.page - Numéro de page (optionnel)
 * @param {number} options.limit - Nombre d'éléments par page (optionnel)
 * @returns {Promise} Promesse contenant les données des événements
 */
export const getEvents = async (options = {}) => {
  try {
    console.log('Appel API pour récupérer les événements...');
    
    // Vérifier si le backend est disponible
    const isBackendAvailable = await checkBackendAvailability();
    if (!isBackendAvailable) {
      console.error('Le backend n\'est pas disponible');
      throw new Error('Backend unavailable');
    }
    
    // Construire les paramètres de requête
    const { type, page, limit, startDate, endDate, location } = options;
    let queryParams = [];
    
    if (type) queryParams.push(`type=${encodeURIComponent(type)}`);
    if (page) queryParams.push(`page=${page}`);
    if (limit) queryParams.push(`limit=${limit}`);
    if (startDate) queryParams.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) queryParams.push(`endDate=${encodeURIComponent(endDate)}`);
    if (location) queryParams.push(`location=${encodeURIComponent(location)}`);
    
    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    
    // Appel à l'API avec un timeout pour éviter les requêtes qui restent en attente
    const response = await api.get(`/api/events${queryString}`);
    console.log('Réponse API événements:', response);
    
    // Traiter la réponse
    if (response.data) {
      // Vérifier si les données sont directement dans response.data ou dans response.data.data
      let eventsData = [];
      
      if (Array.isArray(response.data)) {
        // Format: response.data est directement le tableau d'événements
        eventsData = response.data;
        console.log(`${eventsData.length} événements récupérés directement depuis response.data`);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Format: response.data.data est le tableau d'événements (format standard API)
        eventsData = response.data.data;
        console.log(`${eventsData.length} événements récupérés depuis response.data.data`);
      } else if (response.data.events && Array.isArray(response.data.events)) {
        // Format alternatif: response.data.events est le tableau d'événements
        eventsData = response.data.events;
        console.log(`${eventsData.length} événements récupérés depuis response.data.events`);
      }
      
      // Vérifier que chaque événement a un ID
      const validatedEvents = eventsData.map(event => {
        if (!event._id) {
          return {
            ...event,
            _id: `generated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          };
        }
        return event;
      });
      
      return validatedEvents;
    }
    
    // Si aucune donnée valide n'a été trouvée, retourner un tableau vide
    console.warn('Aucune donnée valide reçue de l\'API');
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    throw error;
  }
};

/**
 * Récupère un événement par son ID
 * @param {string} id - ID de l'événement
 * @returns {Promise} Promesse contenant les données de l'événement
 */
export const getEventById = async (id) => {
  try {
    const response = await api.get(`/api/events/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'événement ${id}:`, error);
    throw error;
  }
};

/**
 * Crée un nouvel événement
 * @param {Object} eventData - Données de l'événement à créer
 * @returns {Promise} Promesse contenant les données de l'événement créé
 */
export const createEvent = async (eventData) => {
  try {
    const response = await api.post('/api/events', eventData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    throw error;
  }
};

/**
 * Met à jour un événement existant
 * @param {string} id - ID de l'événement à mettre à jour
 * @param {Object} eventData - Nouvelles données de l'événement
 * @returns {Promise} Promesse contenant les données de l'événement mis à jour
 */
export const updateEvent = async (id, eventData) => {
  try {
    const response = await api.put(`/api/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de l'événement ${id}:`, error);
    throw error;
  }
};

/**
 * Supprime un événement
 * @param {string} id - ID de l'événement à supprimer
 * @returns {Promise} Promesse contenant un message de confirmation
 */
export const deleteEvent = async (id) => {
  try {
    console.log(`Suppression de l'événement avec l'ID: ${id}`);
    const response = await api.delete(`/api/events/${id}`);
    console.log(`Réponse de suppression reçue:`, response.data);
    
    // Vérifier que la suppression a bien fonctionné
    if (!response.data || !response.data.success) {
      console.error(`La suppression a échoué pour l'événement ${id}:`, response.data);
      throw new Error(response.data?.message || 'Échec de la suppression de l\'événement');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression de l'événement ${id}:`, error);
    // Ajouter plus de détails sur l'erreur pour faciliter le débogage
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'état
      // qui n'est pas dans la plage 2xx
      console.error('Données de réponse d\'erreur:', error.response.data);
      console.error('Statut d\'erreur:', error.response.status);
      console.error('En-têtes d\'erreur:', error.response.headers);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Requête sans réponse:', error.request);
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Erreur de configuration:', error.message);
    }
    throw error;
  }
};

/**
 * Inscrit un bénévole à un événement
 * @param {string} eventId - ID de l'événement
 * @returns {Promise} Promesse contenant les données de l'événement mis à jour
 */
export const registerForEvent = async (eventId) => {
  try {
    const response = await api.post(`/api/events/${eventId}/register`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l'inscription à l'événement ${eventId}:`, error);
    throw error;
  }
};

/**
 * Désinscrit un bénévole d'un événement
 * @param {string} eventId - ID de l'événement
 * @returns {Promise} Promesse contenant les données de l'événement mis à jour
 */
export const unregisterFromEvent = async (eventId) => {
  try {
    const response = await api.post(`/api/events/${eventId}/unregister`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la désinscription de l'événement ${eventId}:`, error);
    throw error;
  }
};
