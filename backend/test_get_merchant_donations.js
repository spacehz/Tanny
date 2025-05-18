require('dotenv').config();
const mongoose = require('mongoose');
const Donation = require('./src/models/Donation');
const User = require('./src/models/User');
const Merchant = require('./src/models/Merchant');

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

// Récupérer les donations d'un commerçant
const getMerchantDonations = async () => {
  try {
    // Récupérer un commerçant existant (d'abord dans User, puis dans Merchant)
    let merchant = await User.findOne({ role: 'commercant' });
    
    if (!merchant) {
      console.log('Aucun commerçant trouvé dans User, recherche dans Merchant...');
      merchant = await Merchant.findOne();
    }
    
    if (!merchant) {
      console.error('Aucun commerçant trouvé dans la base de données');
      return;
    }
    
    console.log(`Commerçant trouvé: ${merchant.businessName || merchant.name} (${merchant._id})`);
    
    // Récupérer les donations du commerçant
    const donations = await Donation.find({ merchant: merchant._id })
      .populate('event', 'title start location')
      .sort({ createdAt: -1 });
    
    console.log(`Nombre de donations trouvées: ${donations.length}`);
    
    if (donations.length > 0) {
      console.log('\nDétails des donations:');
      donations.forEach((donation, index) => {
        console.log(`\nDonation ${index + 1}:`);
        console.log(`ID: ${donation._id}`);
        console.log(`Événement: ${donation.event ? donation.event.title : 'Non spécifié'}`);
        console.log(`Lieu: ${donation.event ? donation.event.location : 'Non spécifié'}`);
        console.log(`Statut: ${donation.status}`);
        console.log('Articles:');
        donation.items.forEach(item => {
          console.log(`- ${item.product}: ${item.quantity} ${item.unit}`);
        });
        console.log(`Note: ${donation.note || 'Aucune'}`);
        console.log(`Créé le: ${donation.createdAt}`);
      });
    } else {
      console.log('Aucune donation trouvée pour ce commerçant');
    }
    
    return donations;
  } catch (error) {
    console.error(`Erreur lors de la récupération des donations: ${error.message}`);
    console.error('Stack trace:', error.stack);
  }
};

// Fonction principale
const main = async () => {
  const conn = await connectDB();
  
  try {
    await getMerchantDonations();
  } catch (error) {
    console.error(`Erreur: ${error.message}`);
    console.error('Stack trace:', error.stack);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('Connexion à MongoDB fermée');
  }
};

// Exécuter la fonction principale
main();
