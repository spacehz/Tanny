import api from './api';

/**
 * Récupère les affectations des bénévoles pour un événement
 * @param {string} eventId - ID de l'événement
 * @returns {Promise} Promesse contenant les données des affectations
 */
export const getEventAssignments = async (eventId) => {
  try {
    const response = await api.get(`/api/events/${eventId}/assignments`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des affectations pour l'événement ${eventId}:`, error);
    throw error;
  }
};

/**
 * Crée ou met à jour les affectations des bénévoles pour un événement
 * @param {string} eventId - ID de l'événement
 * @param {Array} assignments - Tableau des affectations à enregistrer
 * @returns {Promise} Promesse contenant les données des affectations mises à jour
 */
export const saveEventAssignments = async (eventId, assignments) => {
  try {
    const response = await api.post(`/api/events/${eventId}/assignments`, { assignments });
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l'enregistrement des affectations pour l'événement ${eventId}:`, error);
    throw error;
  }
};

/**
 * Récupère les donations pour un événement
 * @param {string} eventId - ID de l'événement
 * @returns {Promise} Promesse contenant les données des donations
 */
export const getEventDonations = async (eventId) => {
  try {
    const response = await api.get(`/api/events/${eventId}/donations`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des donations pour l'événement ${eventId}:`, error);
    throw error;
  }
};

/**
 * Récupère les bénévoles participant à un événement
 * @param {string} eventId - ID de l'événement
 * @returns {Promise} Promesse contenant les données des bénévoles
 */
export const getEventVolunteers = async (eventId) => {
  try {
    const response = await api.get(`/api/events/${eventId}/volunteers`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des bénévoles pour l'événement ${eventId}:`, error);
    throw error;
  }
};

/**
 * Récupère les commerçants participant à un événement
 * @param {string} eventId - ID de l'événement
 * @returns {Promise} Promesse contenant les données des commerçants
 */
export const getEventMerchants = async (eventId) => {
  try {
    const response = await api.get(`/api/events/${eventId}/merchants`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des commerçants pour l'événement ${eventId}:`, error);
    throw error;
  }
};
