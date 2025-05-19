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
    if (!eventId) {
      throw new Error("ID d'événement manquant");
    }
    
    if (!Array.isArray(assignments) || assignments.length === 0) {
      throw new Error("Aucune affectation à enregistrer");
    }
    
    // Vérifier que les affectations ont la structure correcte
    const validAssignments = assignments.map(assignment => {
      if (!assignment.volunteerId) {
        console.warn("Affectation sans ID de bénévole détectée, elle sera ignorée");
        return null;
      }
      
      if (!assignment.merchantId) {
        console.warn("Affectation sans ID de commerçant détectée, elle sera ignorée");
        return null;
      }
      
      // S'assurer que chaque item a un ID et la structure correcte
      const items = Array.isArray(assignment.items) ? assignment.items.map((item, index) => ({
        id: item.id || `item-${assignment.volunteerId}-${index}-${Date.now()}`,
        name: item.name || item.product || 'Article sans nom',
        quantity: parseFloat(item.quantity) || 0,
        unit: item.unit || 'kg'
      })) : [];

      return {
        volunteerId: assignment.volunteerId,
        merchantId: assignment.merchantId,
        items
      };
    }).filter(assignment => assignment !== null);

    console.log("Envoi des affectations au serveur:", validAssignments);
    
    const response = await api.post(`/api/events/${eventId}/assignments`, { assignments: validAssignments });
    console.log("Réponse du serveur:", response.data);
    
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

/**
 * Met à jour le statut d'une affectation
 * @param {string} assignmentId - ID de l'affectation
 * @param {string} status - Nouveau statut ('pending', 'in_progress' ou 'completed')
 * @returns {Promise} Promesse contenant les données de l'affectation mise à jour
 */
export const updateAssignmentStatus = async (assignmentId, status) => {
  try {
    if (!assignmentId) {
      throw new Error("ID d'affectation manquant");
    }
    
    if (!status || !['pending', 'in_progress', 'completed'].includes(status)) {
      throw new Error("Statut invalide");
    }
    
    console.log(`Mise à jour du statut de l'affectation ${assignmentId} à ${status}`);
    const response = await api.patch(`/api/assignments/${assignmentId}`, { status });
    console.log('Réponse de mise à jour du statut:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du statut de l'affectation ${assignmentId}:`, error);
    throw error;
  }
};

/**
 * Démarre une activité de collecte
 * @param {string} assignmentId - ID de l'affectation
 * @returns {Promise} Promesse contenant les données de l'affectation mise à jour
 */
export const startAssignment = async (assignmentId) => {
  try {
    if (!assignmentId) {
      throw new Error("ID d'affectation manquant");
    }
    
    console.log(`Démarrage de l'affectation ${assignmentId}`);
    
    // Appel direct sans token CSRF
    const response = await api.patch(`/api/assignments/${assignmentId}/start`, {});
    console.log('Réponse de démarrage:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors du démarrage de l'affectation ${assignmentId}:`, error);
    
    // Afficher plus de détails sur l'erreur
    if (error.response) {
      console.error('Détails de l\'erreur:', error.response.data);
    }
    
    throw error;
  }
};

/**
 * Termine une activité de collecte
 * @param {string} assignmentId - ID de l'affectation
 * @returns {Promise} Promesse contenant les données de l'affectation mise à jour
 */
export const endAssignment = async (assignmentId) => {
  try {
    if (!assignmentId) {
      throw new Error("ID d'affectation manquant");
    }
    
    console.log(`Fin de l'affectation ${assignmentId}`);
    const response = await api.patch(`/api/assignments/${assignmentId}/end`);
    console.log('Réponse de fin:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la fin de l'affectation ${assignmentId}:`, error);
    throw error;
  }
};

/**
 * Met à jour les produits collectés
 * @param {string} assignmentId - ID de l'affectation
 * @param {Array} collectedItems - Liste des produits collectés
 * @returns {Promise} Promesse contenant les données de l'affectation mise à jour
 */
export const updateCollectedItems = async (assignmentId, collectedItems) => {
  try {
    if (!assignmentId) {
      throw new Error("ID d'affectation manquant");
    }
    
    if (!Array.isArray(collectedItems)) {
      throw new Error("Format de données invalide pour les produits collectés");
    }
    
    console.log(`Mise à jour des produits collectés pour l'affectation ${assignmentId}`);
    const response = await api.patch(`/api/assignments/${assignmentId}/items`, { collectedItems });
    console.log('Réponse de mise à jour des produits:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour des produits collectés pour l'affectation ${assignmentId}:`, error);
    throw error;
  }
};

/**
 * Ajoute des images à une affectation
 * @param {string} assignmentId - ID de l'affectation
 * @param {Array} images - Liste des images à ajouter
 * @returns {Promise} Promesse contenant les données de l'affectation mise à jour
 */
export const addAssignmentImages = async (assignmentId, images) => {
  try {
    if (!assignmentId) {
      throw new Error("ID d'affectation manquant");
    }
    
    if (!Array.isArray(images)) {
      throw new Error("Format de données invalide pour les images");
    }
    
    console.log(`Ajout d'images pour l'affectation ${assignmentId}`);
    const response = await api.post(`/api/assignments/${assignmentId}/images`, { images });
    console.log('Réponse d\'ajout d\'images:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l'ajout d'images pour l'affectation ${assignmentId}:`, error);
    throw error;
  }
};
