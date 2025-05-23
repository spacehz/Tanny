import api from './api';

/**
 * Récupère les affectations d'un bénévole
 * @param volunteerId - ID du bénévole
 * @returns Promesse contenant les données des affectations
 */
export const getVolunteerAssignments = async (volunteerId: string) => {
  try {
    const response = await api.get(`/api/users/volunteers/${volunteerId}/assignments`);
    
    // Traiter les données pour s'assurer que les nouveaux champs sont présents
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      response.data.data = response.data.data.map((assignment: any) => {
        // S'assurer que les champs de suivi de collecte sont présents
        return {
          ...assignment,
          startTime: assignment.startTime || null,
          endTime: assignment.endTime || null,
          duration: assignment.duration || 0,
          collectedItems: assignment.collectedItems || [],
          images: assignment.images || []
        };
      });
    }
    
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des affectations pour le bénévole ${volunteerId}:`, error);
    throw error;
  }
};

/**
 * Met à jour le statut d'une affectation
 * @param assignmentId - ID de l'affectation
 * @param status - Nouveau statut ('pending', 'in_progress' ou 'completed')
 * @returns Promesse contenant les données de l'affectation mise à jour
 */
export const updateAssignmentStatus = async (assignmentId: string, status: string) => {
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
 * @param assignmentId - ID de l'affectation
 * @returns Promesse contenant les données de l'affectation mise à jour
 */
export const startAssignment = async (assignmentId: string) => {
  try {
    if (!assignmentId) {
      throw new Error("ID d'affectation manquant");
    }
    
    console.log(`Démarrage de l'affectation ${assignmentId}`);
    
    const response = await api.patch(`/api/assignments/${assignmentId}/start`, {});
    console.log('Réponse de démarrage:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors du démarrage de l'affectation ${assignmentId}:`, error);
    throw error;
  }
};

/**
 * Termine une activité de collecte
 * @param assignmentId - ID de l'affectation
 * @returns Promesse contenant les données de l'affectation mise à jour
 */
export const endAssignment = async (assignmentId: string) => {
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
 * @param assignmentId - ID de l'affectation
 * @param collectedItems - Liste des produits collectés
 * @returns Promesse contenant les données de l'affectation mise à jour
 */
export const updateCollectedItems = async (assignmentId: string, collectedItems: any[]) => {
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
