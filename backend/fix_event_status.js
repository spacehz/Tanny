require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const Event = require('./src/models/Event');
const User = require('./src/models/User');
const Merchant = require('./src/models/Merchant');
const eventStatusService = require('./src/services/eventStatusService');

/**
 * Script pour corriger le statut d'un événement spécifique
 * et initialiser son historique de statuts
 */
const fixEventStatus = async () => {
  try {
    // Connexion à la base de données
    await connectDB();
    console.log('Connexion à la base de données établie');

    // ID de l'événement à corriger
    const eventId = '683491e2a1c5650a6fbbacbf';
    
    // Récupérer l'événement
    const event = await Event.findById(eventId);
    
    if (!event) {
      console.log(`Événement avec l'ID ${eventId} non trouvé`);
      return;
    }
    
    console.log(`Événement trouvé: ${event.title}`);
    console.log(`Statut actuel: ${event.status}`);
    console.log(`Nombre de bénévoles: ${event.volunteers.length}/${event.expectedVolunteers}`);
    console.log(`Nombre de commerçants: ${event.merchants.length}`);
    console.log(`Historique des statuts: ${event.statusHistory.length} entrées`);
    
    // Initialiser l'historique des statuts s'il est vide
    if (!event.statusHistory || event.statusHistory.length === 0) {
      console.log('Initialisation de l\'historique des statuts...');
      
      event.statusHistory = [{
        status: 'incomplet',
        changedAt: new Date(),
        reason: 'Initialisation de l\'historique'
      }];
      
      await event.save();
      console.log('Historique des statuts initialisé');
    }
    
    // Vérifier et mettre à jour le statut
    console.log('Vérification et mise à jour du statut...');
    const updatedEvent = await eventStatusService.checkAndUpdateEventStatus(eventId);
    
    console.log(`Statut après mise à jour: ${updatedEvent.status}`);
    console.log(`Historique des statuts: ${updatedEvent.statusHistory.length} entrées`);
    
    if (updatedEvent.statusHistory.length > 0) {
      console.log('Dernière entrée dans l\'historique:');
      const lastEntry = updatedEvent.statusHistory[updatedEvent.statusHistory.length - 1];
      console.log(`- Statut: ${lastEntry.status}`);
      console.log(`- Date: ${lastEntry.changedAt}`);
      console.log(`- Raison: ${lastEntry.reason}`);
    }

    // Fermer la connexion à la base de données
    await mongoose.connection.close();
    console.log('Connexion à la base de données fermée');
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la correction du statut:', error);
    process.exit(1);
  }
};

// Exécuter le script
fixEventStatus();
