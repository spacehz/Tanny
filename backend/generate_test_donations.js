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

// Générer des donations de test
const generateTestDonations = async () => {
  try {
    // Récupérer un commerçant
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
    
    // Récupérer des événements de type collecte
    const events = await Event.find({ type: 'collecte' });
    
    if (!events || events.length === 0) {
      console.error('Aucun événement de type collecte trouvé dans la base de données');
      return;
    }
    
    console.log(`${events.length} événements trouvés`);
    
    // Liste des produits possibles
    const products = [
      { name: 'Pain', units: ['kg', 'unité'] },
      { name: 'Croissants', units: ['unité'] },
      { name: 'Baguettes', units: ['unité'] },
      { name: 'Pains au chocolat', units: ['unité'] },
      { name: 'Gâteaux', units: ['kg', 'unité'] },
      { name: 'Viennoiseries', units: ['kg', 'unité'] },
      { name: 'Sandwichs', units: ['unité'] },
      { name: 'Fruits', units: ['kg'] },
      { name: 'Légumes', units: ['kg'] },
      { name: 'Jus de fruits', units: ['l'] },
      { name: 'Lait', units: ['l'] },
      { name: 'Yaourts', units: ['unité'] },
      { name: 'Fromage', units: ['kg'] },
      { name: 'Œufs', units: ['unité'] },
      { name: 'Pâtes', units: ['kg'] },
      { name: 'Riz', units: ['kg'] },
      { name: 'Conserves', units: ['unité'] },
      { name: 'Céréales', units: ['kg'] },
      { name: 'Chocolat', units: ['kg'] },
      { name: 'Café', units: ['kg'] }
    ];
    
    // Statuts possibles
    const statuses = ['pending', 'confirmed', 'collected', 'cancelled'];
    
    // Générer des donations pour les 12 derniers mois
    const currentDate = new Date();
    const donations = [];
    
    // Nombre de donations à générer par mois (entre 1 et 5)
    for (let month = 0; month < 12; month++) {
      const donationsCount = Math.floor(Math.random() * 5) + 1;
      
      for (let i = 0; i < donationsCount; i++) {
        // Choisir un événement aléatoire
        const event = events[Math.floor(Math.random() * events.length)];
        
        // Générer une date dans le mois
        const date = new Date(currentDate);
        date.setMonth(currentDate.getMonth() - month);
        date.setDate(Math.floor(Math.random() * 28) + 1);
        
        // Générer entre 1 et 5 produits
        const itemsCount = Math.floor(Math.random() * 5) + 1;
        const items = [];
        
        for (let j = 0; j < itemsCount; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const unit = product.units[Math.floor(Math.random() * product.units.length)];
          const quantity = unit === 'unité' 
            ? Math.floor(Math.random() * 20) + 1 
            : parseFloat((Math.random() * 10 + 0.5).toFixed(1));
          
          items.push({
            product: product.name,
            quantity,
            unit
          });
        }
        
        // Choisir un statut aléatoire
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Créer la donation
        const donationData = {
          merchant: merchant._id,
          event: event._id,
          items,
          status,
          note: Math.random() > 0.7 ? `Donation test pour le mois ${month + 1}` : '',
          createdAt: date
        };
        
        donations.push(donationData);
      }
    }
    
    console.log(`${donations.length} donations générées`);
    
    // Sauvegarder les donations
    const result = await Donation.insertMany(donations);
    
    console.log(`${result.length} donations sauvegardées avec succès`);
    
    return result;
  } catch (error) {
    console.error('Erreur lors de la génération des donations de test:', error);
  }
};

// Fonction principale
const main = async () => {
  const conn = await connectDB();
  
  try {
    await generateTestDonations();
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
