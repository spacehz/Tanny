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
    const response = await api.get(`/api/donations/merchant?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des donations:', error);
    throw error;
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
    
    // Transformation des données pour correspondre au format attendu par l'API
    const apiDonationData = {
      eventId: donationData.eventId,
      items: donationData.donations.map(item => ({
        product: item.product,
        quantity: item.quantity,
        unit: item.unit
      })),
      note: donationData.note || ''
    };
    
    // Appel à l'API réelle
    const response = await api.post('/api/donations', apiDonationData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la donation:', error);
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
