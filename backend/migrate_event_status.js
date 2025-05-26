require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const Event = require('./src/models/Event');
const eventStatusService = require('./src/services/eventStatusService');

/**
 * Script de migration pour ajouter les champs status et statusHistory
 * à tous les événements existants dans la base de données
 */
const migrateEventStatus = async () => {
  try {
    // Connexion à la base de données
    await connectDB();
    console.log('Connexion à la base de données établie');

    // Récupérer tous les événements
    const events = await Event.find({});
    console.log(`${events.length} événements trouvés dans la base de données`);

    // Compteurs pour le suivi
    let updatedCount = 0;
    let errorCount = 0;

    // Mettre à jour chaque événement
    for (const event of events) {
      try {
        // Vérifier si l'événement a déjà un statut en utilisant hasOwnProperty
        // pour détecter correctement si la propriété existe
        if (!event.hasOwnProperty('status')) {
          console.log(`Mise à jour de l'événement ${event._id} (${event.title})...`);
          
          // Définir le statut par défaut à 'incomplet'
          event.status = 'incomplet';
          
          // Initialiser l'historique des statuts
          event.statusHistory = [{
            status: 'incomplet',
            changedAt: new Date(),
            reason: 'Migration initiale'
          }];
          
          // Sauvegarder l'événement mis à jour
          await event.save();
          
          // Vérifier et mettre à jour le statut en fonction des règles métier
          await eventStatusService.checkAndUpdateEventStatus(event._id);
          
          updatedCount++;
          console.log(`Événement ${event._id} (${event.title}) mis à jour avec succès`);
        } else {
          console.log(`Événement ${event._id} (${event.title}) déjà mis à jour, ignoré`);
        }
      } catch (eventError) {
        errorCount++;
        console.error(`Erreur lors de la mise à jour de l'événement ${event._id}:`, eventError);
      }
    }

    console.log(`
    Migration terminée:
    - ${updatedCount} événements mis à jour avec succès
    - ${errorCount} erreurs rencontrées
    `);

    // Fermer la connexion à la base de données
    await mongoose.connection.close();
    console.log('Connexion à la base de données fermée');
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
  }
};

// Exécuter la migration
migrateEventStatus();
