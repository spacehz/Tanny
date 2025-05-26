require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');

/**
 * Script pour vérifier la structure des documents dans la collection events
 */
const checkEventSchema = async () => {
  try {
    // Connexion à la base de données
    await connectDB();
    console.log('Connexion à la base de données établie');

    // Récupérer un événement directement depuis la collection MongoDB (sans passer par le modèle Mongoose)
    const db = mongoose.connection.db;
    const eventsCollection = db.collection('events');
    
    // Récupérer un document
    const event = await eventsCollection.findOne({});
    
    if (!event) {
      console.log('Aucun événement trouvé dans la base de données');
      return;
    }
    
    // Afficher la structure complète du document
    console.log('Structure d\'un document de la collection events:');
    console.log(JSON.stringify(event, null, 2));
    
    // Vérifier spécifiquement les champs status et statusHistory
    console.log('\nVérification des nouveaux champs:');
    console.log(`Le champ 'status' existe: ${event.status !== undefined}`);
    console.log(`Valeur du champ 'status': ${event.status || 'non défini'}`);
    console.log(`Le champ 'statusHistory' existe: ${event.statusHistory !== undefined}`);
    console.log(`Type du champ 'statusHistory': ${Array.isArray(event.statusHistory) ? 'Array' : typeof event.statusHistory}`);
    
    if (Array.isArray(event.statusHistory)) {
      console.log(`Nombre d'entrées dans 'statusHistory': ${event.statusHistory.length}`);
      if (event.statusHistory.length > 0) {
        console.log('Première entrée dans statusHistory:');
        console.log(JSON.stringify(event.statusHistory[0], null, 2));
      }
    }

    // Fermer la connexion à la base de données
    await mongoose.connection.close();
    console.log('\nConnexion à la base de données fermée');
    
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    process.exit(1);
  }
};

// Exécuter la vérification
checkEventSchema();
