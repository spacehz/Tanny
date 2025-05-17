const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Fonction pour vérifier la collection des dons
async function checkDonationsCollection() {
  try {
    // Connexion à la base de données
    console.log('Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://admin:12345@localhost:27017/TANY?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connecté à MongoDB');

    // Vérifier si la collection "donations" existe
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Collections disponibles dans la base de données:');
    console.log(collectionNames);
    
    if (collectionNames.includes('donations')) {
      console.log('\nLa collection "donations" existe déjà.');
      
      // Récupérer un échantillon de documents pour vérifier la structure
      const donationsSample = await mongoose.connection.db.collection('donations').find({}).limit(1).toArray();
      
      if (donationsSample.length > 0) {
        console.log('\nStructure d\'un document de don:');
        console.log(JSON.stringify(donationsSample[0], null, 2));
      } else {
        console.log('\nLa collection "donations" est vide.');
        
        // Créer un document de test pour vérifier le schéma
        console.log('\nCréation d\'un document de test pour vérifier le schéma...');
        
        // Importer le modèle Donation
        const Donation = require('./src/models/Donation');
        
        // Créer un document de test
        const testDonation = new Donation({
          merchant: new mongoose.Types.ObjectId(), // ID fictif
          event: new mongoose.Types.ObjectId(),    // ID fictif
          items: [
            {
              product: 'Pain',
              quantity: 5,
              unit: 'kg'
            }
          ],
          status: 'pending',
          note: 'Ceci est un test'
        });
        
        // Afficher la structure du document (sans le sauvegarder)
        console.log('\nStructure du document selon le schéma:');
        console.log(JSON.stringify(testDonation, null, 2));
      }
    } else {
      console.log('\nLa collection "donations" n\'existe pas encore.');
      console.log('Elle sera créée automatiquement lors de la première insertion.');
      
      // Importer le modèle Donation
      const Donation = require('./src/models/Donation');
      
      // Créer un document de test
      const testDonation = new Donation({
        merchant: new mongoose.Types.ObjectId(), // ID fictif
        event: new mongoose.Types.ObjectId(),    // ID fictif
        items: [
          {
            product: 'Pain',
            quantity: 5,
            unit: 'kg'
          }
        ],
        status: 'pending',
        note: 'Ceci est un test'
      });
      
      // Afficher la structure du document (sans le sauvegarder)
      console.log('\nStructure du document selon le schéma:');
      console.log(JSON.stringify(testDonation, null, 2));
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    // Fermer la connexion
    await mongoose.disconnect();
    console.log('\nDéconnecté de MongoDB');
  }
}

// Exécuter la fonction
checkDonationsCollection();
