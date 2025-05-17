import api from './api';

/**
 * Récupère toutes les donations d'un commerçant
 * @returns {Promise} Promesse contenant les données des donations
 */
export const getMerchantDonations = async () => {
  try {
    const response = await api.get('/api/donations/merchant');
    return response.data;
  } catch (error) {
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
    // Simulation de l'API pour le moment
    console.log('Données de donation envoyées:', donationData);
    
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simuler une réponse réussie
    return {
      success: true,
      message: 'Donation enregistrée avec succès',
      data: {
        ...donationData,
        _id: 'donation_' + Date.now(),
        createdAt: new Date().toISOString()
      }
    };
    
    // Décommenter cette ligne quand l'API sera prête
    // const response = await api.post('/api/donations', donationData);
    // return response.data;
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
