require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');

/**
 * Script de migration pour ajouter les champs status et statusHistory
 * à tous les événements existants dans la base de données
 */
const migrateEventStatus = async () => {
  try {
    // Connexion à la base de données
    await connectDB();
    console.log('Connexion à la base de données établie');

    // Accéder directement à la collection events pour éviter les problèmes de modèle
    const db = mongoose.connection.db;
    const eventsCollection = db.collection('events');
    
    // Récupérer tous les événements
    const events = await eventsCollection.find({}).toArray();
    console.log(`${events.length} événements trouvés dans la base de données`);

    // Compteurs pour le suivi
    let updatedCount = 0;
    let errorCount = 0;

    // Mettre à jour chaque événement
    for (const event of events) {
      try {
        // Vérifier si l'événement a déjà un statut
        if (!event.hasOwnProperty('status')) {
          console.log(`Mise à jour de l'événement ${event._id} (${event.title})...`);
          
          // Déterminer le statut initial en fonction des règles métier
          let initialStatus = 'incomplet';
          const now = new Date();
          const eventStart = new Date(event.start);
          const eventEnd = new Date(event.end);
          
          // Si l'événement est en cours
          if (now >= eventStart && now <= eventEnd) {
            initialStatus = 'en_cours';
          } 
          // Si l'événement est terminé
          else if (now > eventEnd) {
            initialStatus = 'termine';
          }
          // Si l'événement est à venir, vérifier les conditions pour "prêt"
          else if (now < eventStart) {
            const hasEnoughVolunteers = Array.isArray(event.volunteers) && 
                                       event.volunteers.length >= (event.expectedVolunteers || 1);
            
            // Pour les collectes, vérifier aussi les commerçants
            if (event.type === 'collecte') {
              const hasMerchants = Array.isArray(event.merchants) && event.merchants.length > 0;
              if (hasEnoughVolunteers && hasMerchants) {
                initialStatus = 'pret';
              }
            } 
            // Pour les marchés, vérifier uniquement les bénévoles
            else if (event.type === 'marché') {
              if (hasEnoughVolunteers) {
                initialStatus = 'pret';
              }
            }
          }
          
          // Mettre à jour le document directement dans la collection
          const result = await eventsCollection.updateOne(
            { _id: event._id },
            { 
              $set: { 
                status: initialStatus,
                statusHistory: [{
                  status: initialStatus,
                  changedAt: new Date(),
                  reason: 'Migration initiale'
                }]
              } 
            }
          );
          
          if (result.modifiedCount === 1) {
            updatedCount++;
            console.log(`Événement ${event._id} (${event.title}) mis à jour avec succès (statut: ${initialStatus})`);
          } else {
            errorCount++;
            console.error(`Échec de la mise à jour de l'événement ${event._id} (${event.title})`);
          }
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
