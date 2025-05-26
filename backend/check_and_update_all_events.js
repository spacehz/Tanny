require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const Event = require('./src/models/Event');
const User = require('./src/models/User');
const Merchant = require('./src/models/Merchant');
const eventStatusService = require('./src/services/eventStatusService');

/**
 * Script pour vérifier et mettre à jour le statut de tous les événements
 * et initialiser l'historique des statuts si nécessaire
 */
const checkAndUpdateAllEvents = async () => {
  try {
    // Connexion à la base de données
    await connectDB();
    console.log('Connexion à la base de données établie');

    // Récupérer tous les événements
    const events = await Event.find({});
    console.log(`${events.length} événements trouvés dans la base de données`);

    // Compteurs pour le suivi
    let updatedCount = 0;
    let initializedCount = 0;
    let errorCount = 0;

    // Vérifier et mettre à jour chaque événement
    for (const event of events) {
      try {
        console.log(`\nTraitement de l'événement ${event._id} (${event.title})...`);
        console.log(`Statut actuel: ${event.status}`);
        console.log(`Nombre de bénévoles: ${event.volunteers.length}/${event.expectedVolunteers}`);
        console.log(`Nombre de commerçants: ${event.merchants ? event.merchants.length : 0}`);
        
        // Initialiser l'historique des statuts s'il est vide
        if (!event.statusHistory || event.statusHistory.length === 0) {
          console.log('Initialisation de l\'historique des statuts...');
          
          event.statusHistory = [{
            status: event.status || 'incomplet',
            changedAt: new Date(),
            reason: 'Initialisation de l\'historique'
          }];
          
          await event.save();
          initializedCount++;
          console.log('Historique des statuts initialisé');
        } else {
          console.log(`Historique des statuts: ${event.statusHistory.length} entrées`);
        }
        
        // Vérifier et mettre à jour le statut
        console.log('Vérification et mise à jour du statut...');
        const oldStatus = event.status;
        const updatedEvent = await eventStatusService.checkAndUpdateEventStatus(event._id);
        
        if (updatedEvent.status !== oldStatus) {
          updatedCount++;
          console.log(`Statut mis à jour de "${oldStatus}" à "${updatedEvent.status}"`);
        } else {
          console.log(`Statut inchangé: "${updatedEvent.status}"`);
        }
      } catch (eventError) {
        errorCount++;
        console.error(`Erreur lors de la mise à jour de l'événement ${event._id}:`, eventError);
      }
    }

    console.log(`\nRésumé:
    - ${initializedCount} événements avec historique des statuts initialisé
    - ${updatedCount} événements avec statut mis à jour
    - ${errorCount} erreurs rencontrées
    `);

    // Fermer la connexion à la base de données
    await mongoose.connection.close();
    console.log('Connexion à la base de données fermée');
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la vérification des événements:', error);
    process.exit(1);
  }
};

// Exécuter le script
checkAndUpdateAllEvents();
