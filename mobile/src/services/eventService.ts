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
      
      // Ajouter des logs pour déboguer
      console.log('Premier événement récupéré:', eventsData.length > 0 ? JSON.stringify(eventsData[0], null, 2) : 'Aucun événement');
      
      // Vérifier spécifiquement l'événement "Collecte pain"
      const collectePain = eventsData.find(event => event.title === 'Collecte pain');
      if (collectePain) {
        console.log('Événement "Collecte pain" trouvé:', JSON.stringify(collectePain, null, 2));
      }
      
      // Normaliser et valider les événements
      const normalizedEvents = eventsData.map(event => {
        // Créer une copie profonde de l'événement pour éviter les références
        const eventWithId = JSON.parse(JSON.stringify(event));
        
        // S'assurer que chaque événement a un ID
        if (!eventWithId._id) {
          eventWithId._id = `generated-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        }
        
        // Normaliser le nombre de bénévoles attendus
        // Si expectedVolunteers (minuscule) existe, l'utiliser directement
        if (eventWithId.expectedVolunteers !== undefined) {
          // S'assurer que c'est un nombre
          eventWithId.expectedVolunteers = Number(eventWithId.expectedVolunteers);
          // Copier également dans ExpectedVolunteers pour la rétrocompatibilité
          eventWithId.ExpectedVolunteers = eventWithId.expectedVolunteers;
        } 
        // Si ExpectedVolunteers (majuscule) existe mais pas expectedVolunteers (minuscule)
        else if (eventWithId.ExpectedVolunteers !== undefined) {
          // S'assurer que c'est un nombre
          eventWithId.ExpectedVolunteers = Number(eventWithId.ExpectedVolunteers);
          // Copier dans expectedVolunteers
          eventWithId.expectedVolunteers = eventWithId.ExpectedVolunteers;
        } 
        // Si aucun des deux n'existe, définir une valeur par défaut
        else {
          eventWithId.expectedVolunteers = 5; // Valeur par défaut
          eventWithId.ExpectedVolunteers = 5; // Valeur par défaut
        }
        
        // S'assurer que volunteers est toujours un tableau
        if (!Array.isArray(eventWithId.volunteers)) {
          eventWithId.volunteers = [];
        }
        
        // Log pour déboguer
        if (eventWithId.title === 'Collecte pain') {
          console.log('Événement "Collecte pain" normalisé:', JSON.stringify({
            title: eventWithId.title,
            expectedVolunteers: eventWithId.expectedVolunteers,
            ExpectedVolunteers: eventWithId.ExpectedVolunteers
          }, null, 2));
        }
        
        return eventWithId;
      });
      
      return normalizedEvents;
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
