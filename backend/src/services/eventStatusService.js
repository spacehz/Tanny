const Event = require('../models/Event');
const User = require('../models/User');
const Merchant = require('../models/Merchant');
const mongoose = require('mongoose');

/**
 * Vérifie et met à jour le statut d'un événement en fonction des règles métier
 * @param {string} eventId - ID de l'événement à vérifier
 * @param {Object} userId - ID de l'utilisateur effectuant la mise à jour (pour l'historique)
 * @returns {Promise<Object>} - L'événement mis à jour
 */
const checkAndUpdateEventStatus = async (eventId, userId = null) => {
  try {
    // Récupérer l'événement avec les relations nécessaires
    const event = await Event.findById(eventId)
      .populate('volunteers')
      .populate('merchants');
    
    if (!event) {
      throw new Error(`Événement avec l'ID ${eventId} non trouvé`);
    }

    const now = new Date();
    const currentStatus = event.status;
    let newStatus = currentStatus;
    let reason = '';

    // Déterminer le nouveau statut en fonction des règles métier
    if (currentStatus !== 'annule' && currentStatus !== 'termine') {
      // Vérifier si l'événement est en cours
      if (now >= event.start && now <= event.end) {
        newStatus = 'en_cours';
        reason = 'L\'événement a commencé';
      } 
      // Vérifier si l'événement est prêt
      else if (now < event.start) {
        // Pour les collectes, vérifier les bénévoles et les commerçants
        if (event.type === 'collecte') {
          const hasEnoughVolunteers = event.volunteers.length >= event.expectedVolunteers;
          const hasMerchants = event.merchants && event.merchants.length > 0;
          
          if (hasEnoughVolunteers && hasMerchants) {
            newStatus = 'pret';
            reason = 'Nombre suffisant de bénévoles et au moins un commerçant inscrit';
          } else {
            newStatus = 'incomplet';
            reason = hasEnoughVolunteers 
              ? 'Aucun commerçant inscrit' 
              : 'Nombre insuffisant de bénévoles';
          }
        } 
        // Pour les marchés, vérifier uniquement les bénévoles
        else if (event.type === 'marché') {
          const hasEnoughVolunteers = event.volunteers.length >= event.expectedVolunteers;
          
          if (hasEnoughVolunteers) {
            newStatus = 'pret';
            reason = 'Nombre suffisant de bénévoles inscrits';
          } else {
            newStatus = 'incomplet';
            reason = 'Nombre insuffisant de bénévoles';
          }
        }
        // Pour les autres types d'événements, considérer comme prêt si la date n'est pas passée
        else {
          newStatus = 'pret';
          reason = 'Événement planifié';
        }
      }
      // Si la date de fin est passée, on pourrait suggérer de marquer comme terminé
      // mais on ne le fait pas automatiquement selon les spécifications
    }

    // Si le statut a changé, mettre à jour l'événement
    if (newStatus !== currentStatus) {
      // Ajouter l'entrée dans l'historique des statuts
      const statusHistoryEntry = {
        status: newStatus,
        changedAt: now,
        reason: reason
      };
      
      // Ajouter l'ID de l'utilisateur s'il est fourni
      if (userId) {
        statusHistoryEntry.changedBy = userId;
      }
      
      // Mettre à jour l'événement
      event.status = newStatus;
      event.statusHistory.push(statusHistoryEntry);
      await event.save();
      
      console.log(`Statut de l'événement ${eventId} mis à jour de "${currentStatus}" à "${newStatus}"`);
    }
    
    return event;
  } catch (error) {
    console.error(`Erreur lors de la vérification du statut de l'événement ${eventId}:`, error);
    throw error;
  }
};

/**
 * Change manuellement le statut d'un événement
 * @param {string} eventId - ID de l'événement
 * @param {string} newStatus - Nouveau statut
 * @param {string} userId - ID de l'utilisateur effectuant le changement
 * @param {string} reason - Raison du changement
 * @returns {Promise<Object>} - L'événement mis à jour
 */
const changeEventStatus = async (eventId, newStatus, userId, reason = '') => {
  try {
    // Vérifier que le statut est valide
    const validStatuses = ['incomplet', 'pret', 'en_cours', 'annule', 'termine'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Statut invalide: ${newStatus}`);
    }
    
    // Récupérer l'événement
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error(`Événement avec l'ID ${eventId} non trouvé`);
    }
    
    // Vérifier les règles métier pour certains changements de statut
    if (newStatus === 'termine' && new Date() < event.end) {
      throw new Error('Impossible de marquer un événement comme terminé avant sa date de fin');
    }
    
    // Mettre à jour le statut
    const currentStatus = event.status;
    event.status = newStatus;
    
    // Ajouter l'entrée dans l'historique
    event.statusHistory.push({
      status: newStatus,
      changedAt: new Date(),
      changedBy: userId,
      reason: reason
    });
    
    await event.save();
    
    console.log(`Statut de l'événement ${eventId} changé manuellement de "${currentStatus}" à "${newStatus}" par l'utilisateur ${userId}`);
    
    return event;
  } catch (error) {
    console.error(`Erreur lors du changement manuel du statut de l'événement ${eventId}:`, error);
    throw error;
  }
};

/**
 * Vérifie et met à jour le statut de tous les événements actifs
 * @returns {Promise<number>} - Nombre d'événements mis à jour
 */
const updateAllEventStatuses = async () => {
  try {
    // Récupérer tous les événements non terminés et non annulés
    const events = await Event.find({
      status: { $nin: ['termine', 'annule'] },
      end: { $gte: new Date() } // Seulement les événements qui ne sont pas encore terminés
    });
    
    console.log(`Vérification du statut de ${events.length} événements actifs`);
    
    let updatedCount = 0;
    
    // Vérifier et mettre à jour le statut de chaque événement
    for (const event of events) {
      const oldStatus = event.status;
      await checkAndUpdateEventStatus(event._id);
      
      // Si l'événement a été rechargé et que son statut a changé, incrémenter le compteur
      const updatedEvent = await Event.findById(event._id);
      if (updatedEvent.status !== oldStatus) {
        updatedCount++;
      }
    }
    
    console.log(`${updatedCount} événements ont été mis à jour`);
    
    return updatedCount;
  } catch (error) {
    console.error('Erreur lors de la mise à jour des statuts des événements:', error);
    throw error;
  }
};

/**
 * Suggère les événements qui pourraient être marqués comme terminés
 * @returns {Promise<Array>} - Liste des événements qui pourraient être terminés
 */
const suggestEventsToComplete = async () => {
  try {
    // Trouver les événements dont la date de fin est passée mais qui ne sont pas encore marqués comme terminés
    const events = await Event.find({
      status: { $nin: ['termine', 'annule'] },
      end: { $lt: new Date() }
    });
    
    return events;
  } catch (error) {
    console.error('Erreur lors de la suggestion d\'événements à terminer:', error);
    throw error;
  }
};

module.exports = {
  checkAndUpdateEventStatus,
  changeEventStatus,
  updateAllEventStatuses,
  suggestEventsToComplete
};
