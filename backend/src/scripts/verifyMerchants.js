const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

// Connecter à la base de données
connectDB();

// Fonction principale pour vérifier les commerçants
const verifyMerchants = async () => {
  try {
    console.log('Connexion à la base de données...');
    
    // Récupérer tous les commerçants
    const merchants = await User.find({ role: 'commercant' }).select('-password');
    
    console.log(`\n📋 Liste des commerçants (${merchants.length} trouvés):`);
    
    if (merchants.length === 0) {
      console.log('Aucun commerçant trouvé dans la base de données.');
    } else {
      merchants.forEach((merchant, index) => {
        console.log(`\n${index + 1}. ${merchant.name}`);
        console.log(`   Commerce: ${merchant.businessName}`);
        console.log(`   Email: ${merchant.email}`);
        console.log(`   Adresse: ${merchant.address}`);
        console.log(`   Téléphone: ${merchant.phoneNumber}`);
        console.log(`   Statut: ${merchant.isActive ? 'Actif' : 'Inactif'}`);
      });
    }
    
    // Fermer la connexion à la base de données
    await mongoose.connection.close();
    console.log('\nConnexion à la base de données fermée.');
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification des commerçants:', error.message);
    // Fermer la connexion à la base de données en cas d'erreur
    await mongoose.connection.close();
  }
};

// Exécuter la fonction principale
verifyMerchants();
