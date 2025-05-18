require('dotenv').config();
const mongoose = require('mongoose');
const Donation = require('./src/models/Donation');
const User = require('./src/models/User');
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

// Créer une donation directement sans passer par l'API
const createDonationDirect = async () => {
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
    
    // Récupérer un événement existant
    const event = await Event.findOne({ type: 'collecte' });
    if (!event) {
      console.error('Aucun événement de type collecte trouvé dans la base de données');
      return;
    }
    console.log(`Événement trouvé: ${event.title} (${event._id})`);
    
    // Créer une donation de test
    const donationData = {
      merchant: merchant._id,
      event: event._id,
      items: [
        {
          product: 'Pain',
          quantity: 5,
          unit: 'kg'
        },
        {
          product: 'Croissants',
          quantity: 20,
          unit: 'unité'
        }
      ],
      status: 'pending',
      note: 'Donation de test créée directement'
    };
    
    console.log('Création d\'une donation avec les données suivantes:');
    console.log(donationData);
    
    const donation = await Donation.create(donationData);
    
    console.log('\nDonation créée avec succès:');
    console.log(`ID: ${donation._id}`);
    console.log(`Commerçant: ${donation.merchant}`);
    console.log(`Événement: ${donation.event}`);
    console.log(`Statut: ${donation.status}`);
    console.log('Articles:');
    donation.items.forEach(item => {
      console.log(`- ${item.product}: ${item.quantity} ${item.unit}`);
    });
    console.log(`Note: ${donation.note}`);
    console.log(`Créé le: ${donation.createdAt}`);
    
    // Vérifier que la donation a bien été créée
    const count = await Donation.countDocuments();
    console.log(`\nNombre total de donations dans la collection: ${count}`);
    
    return donation;
  } catch (error) {
    console.error(`Erreur lors de la création de la donation de test: ${error.message}`);
    console.error('Stack trace:', error.stack);
  }
};

// Fonction principale
const main = async () => {
  const conn = await connectDB();
  
  try {
    const donation = await createDonationDirect();
    
    if (donation) {
      console.log('\nTest de récupération de la donation créée:');
      
      // Récupérer la donation avec populate
      const retrievedDonation = await Donation.findById(donation._id)
        .populate('merchant', 'businessName email name')
        .populate('event', 'title location');
      
      console.log('Donation récupérée:');
      console.log(`ID: ${retrievedDonation._id}`);
      console.log(`Commerçant: ${retrievedDonation.merchant.businessName || retrievedDonation.merchant.name}`);
      console.log(`Événement: ${retrievedDonation.event.title}`);
      console.log(`Lieu: ${retrievedDonation.event.location}`);
      console.log(`Statut: ${retrievedDonation.status}`);
      console.log('Articles:');
      retrievedDonation.items.forEach(item => {
        console.log(`- ${item.product}: ${item.quantity} ${item.unit}`);
      });
      console.log(`Note: ${retrievedDonation.note}`);
      console.log(`Créé le: ${retrievedDonation.createdAt}`);
    }
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
