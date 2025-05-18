require('dotenv').config();
const mongoose = require('mongoose');
const Donation = require('./src/models/Donation');
const Merchant = require('./src/models/Merchant');
const Event = require('./src/models/Event');

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tany', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connecté: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Vérifier la collection donations
const checkDonationsCollection = async () => {
  try {
    // Vérifier si la collection existe
    const collections = await mongoose.connection.db.listCollections().toArray();
    const donationsCollectionExists = collections.some(collection => collection.name === 'donations');
    
    console.log(`Collection donations existe: ${donationsCollectionExists}`);
    
    if (donationsCollectionExists) {
      // Compter le nombre de documents
      const count = await Donation.countDocuments();
      console.log(`Nombre de donations dans la collection: ${count}`);
      
      // Récupérer quelques documents pour vérifier la structure
      if (count > 0) {
        const donations = await Donation.find().limit(5).populate('merchant', 'businessName email').populate('event', 'title');
        console.log('Exemples de donations:');
        donations.forEach((donation, index) => {
          console.log(`\nDonation ${index + 1}:`);
          console.log(`ID: ${donation._id}`);
          console.log(`Commerçant: ${donation.merchant ? donation.merchant.businessName : 'Non spécifié'}`);
          console.log(`Événement: ${donation.event ? donation.event.title : 'Non spécifié'}`);
          console.log(`Statut: ${donation.status}`);
          console.log('Articles:');
          donation.items.forEach(item => {
            console.log(`- ${item.product}: ${item.quantity} ${item.unit}`);
          });
          console.log(`Note: ${donation.note || 'Aucune'}`);
          console.log(`Créé le: ${donation.createdAt}`);
        });
      }
    } else {
      console.log('La collection donations n\'existe pas encore. Elle sera créée automatiquement lors de la première insertion.');
    }
    
    // Vérifier les collections associées
    console.log('\nVérification des collections associées:');
    
    // Vérifier les commerçants
    const merchantCount = await Merchant.countDocuments();
    console.log(`Nombre de commerçants: ${merchantCount}`);
    
    // Vérifier les événements
    const eventCount = await Event.countDocuments();
    console.log(`Nombre d'événements: ${eventCount}`);
    
    // Vérifier les index
    console.log('\nIndex de la collection donations:');
    const indexes = await Donation.collection.indexes();
    console.log(indexes);
    
  } catch (error) {
    console.error(`Erreur lors de la vérification de la collection donations: ${error.message}`);
  }
};

// Fonction principale
const main = async () => {
  const conn = await connectDB();
  
  try {
    await checkDonationsCollection();
  } catch (error) {
    console.error(`Erreur: ${error.message}`);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('Connexion à MongoDB fermée');
  }
};

// Exécuter la fonction principale
main();
