const cron = require('node-cron');
const eventStatusService = require('../services/eventStatusService');
const User = require('../models/User');
const Merchant = require('../models/Merchant');

/**
 * Tâche planifiée pour mettre à jour automatiquement les statuts des événements
 * S'exécute toutes les heures
 */
const scheduleEventStatusUpdates = () => {
  // Planifier la tâche pour s'exécuter toutes les heures (à la minute 0)
  cron.schedule('0 * * * *', async () => {
    console.log('Exécution de la tâche planifiée de mise à jour des statuts d\'événements');
    
    try {
      // Mettre à jour les statuts de tous les événements actifs
      const updatedCount = await eventStatusService.updateAllEventStatuses();
      console.log(`Tâche planifiée terminée: ${updatedCount} événements mis à jour`);
      
      // Vérifier s'il y a des événements qui pourraient être marqués comme terminés
      const eventsToComplete = await eventStatusService.suggestEventsToComplete();
      if (eventsToComplete.length > 0) {
        console.log(`${eventsToComplete.length} événements pourraient être marqués comme terminés`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la tâche planifiée:', error);
    }
  });
  
  console.log('Tâche planifiée de mise à jour des statuts d\'événements configurée');
};

module.exports = {
  scheduleEventStatusUpdates
};
