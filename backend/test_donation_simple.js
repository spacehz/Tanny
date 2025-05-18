require('dotenv').config();
const mongoose = require('mongoose');
const Donation = require('./src/models/Donation');
const User = require('./src/models/User');
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

// Créer une donation de test
const createTestDonation = async () => {
  try {
    // Récupérer un utilisateur commerçant
    const merchant = await User.findOne({ role: 'commercant' });
    if (!merchant) {
      console.error('Aucun commerçant trouvé');
      return;
    }
    console.log(`Commerçant trouvé: ${merchant.name} (${merchant._id})`);
    
    // Récupérer un événement
    const event = await Event.findOne({ type: 'collecte' });
    if (!event) {
      console.error('Aucun événement de type collecte trouvé');
      return;
    }
    console.log(`Événement trouvé: ${event.title} (${event._id})`);
    
    // Créer une donation
    const donationData = {
      merchant: merchant._id,
      event: event._id,
      items: [
        {
          product: 'Pain',
          quantity: 2,
          unit: 'kg'
        },
        {
          product: 'Viennoiseries',
          quantity: 10,
          unit: 'unité'
        }
      ],
      status: 'pending',
      note: 'Test de donation simple'
    };
    
    console.log('Création d\'une donation avec les données suivantes:');
    console.log(donationData);
    
    const donation = await Donation.create(donationData);
    console.log('Donation créée avec succès:');
    console.log(donation);
    
    return donation;
  } catch (error) {
    console.error('Erreur lors de la création de la donation:', error);
  }
};

// Récupérer les donations d'un commerçant
const getMerchantDonations = async (merchantId) => {
  try {
    console.log(`Recherche des donations pour le commerçant ID: ${merchantId}`);
    
    const donations = await Donation.find({ merchant: merchantId })
      .populate('event', 'title start location')
      .sort({ createdAt: -1 });
    
    console.log(`Nombre de donations trouvées: ${donations.length}`);
    
    return donations;
  } catch (error) {
    console.error('Erreur lors de la récupération des donations:', error);
  }
};

// Fonction principale
const main = async () => {
  const conn = await connectDB();
  
  try {
    // Créer une donation
    const donation = await createTestDonation();
    
    if (donation) {
      // Récupérer les donations du commerçant
      const merchantId = donation.merchant;
      const donations = await getMerchantDonations(merchantId);
      
      console.log('\nDonations du commerçant:');
      if (donations && donations.length > 0) {
        donations.forEach((d, index) => {
          console.log(`\nDonation ${index + 1}:`);
          console.log(`ID: ${d._id}`);
          console.log(`Événement: ${d.event ? d.event.title : 'Non spécifié'}`);
          console.log(`Statut: ${d.status}`);
          console.log('Articles:');
          d.items.forEach(item => {
            console.log(`- ${item.product}: ${item.quantity} ${item.unit}`);
          });
          console.log(`Note: ${d.note || 'Aucune'}`);
          console.log(`Créé le: ${d.createdAt}`);
        });
      } else {
        console.log('Aucune donation trouvée pour ce commerçant');
      }
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('Connexion à MongoDB fermée');
  }
};

// Exécuter la fonction principale
main();
