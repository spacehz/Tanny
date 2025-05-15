import api from './api';

/**
 * Récupère tous les événements
 * @returns {Promise} Promesse contenant les données des événements
 */
export const getEvents = async () => {
  try {
    const response = await api.get('/api/events');
    return response.data;
  } catch (error) {
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
    const response = await api.delete(`/api/events/${id}`);
    return response.data;
  } catch (error) {
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
    throw error;
  }
};
