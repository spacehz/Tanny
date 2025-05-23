import api, { checkBackendAvailability } from './api';

interface EventOptions {
  type?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  location?: string;
}

/**
 * Récupère tous les événements
 * @param options - Options de filtrage et pagination
 * @returns Promesse contenant les données des événements
 */
export const getEvents = async (options: EventOptions = {}) => {
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
 * @param id - ID de l'événement
 * @returns Promesse contenant les données de l'événement
 */
export const getEventById = async (id: string) => {
  try {
    const response = await api.get(`/api/events/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'événement ${id}:`, error);
    throw error;
  }
};

/**
 * Inscrit un bénévole à un événement
 * @param eventId - ID de l'événement
 * @returns Promesse contenant les données de l'événement mis à jour
 */
export const registerForEvent = async (eventId: string) => {
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
 * @param eventId - ID de l'événement
 * @returns Promesse contenant les données de l'événement mis à jour
 */
export const unregisterFromEvent = async (eventId: string) => {
  try {
    const response = await api.post(`/api/events/${eventId}/unregister`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la désinscription de l'événement ${eventId}:`, error);
    throw error;
  }
};
