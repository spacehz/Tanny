const mongoose = require('mongoose');
const Merchant = require('../models/Merchant');
const connectDB = require('../config/database');

// Connecter à la base de données
connectDB();

// Fonction principale pour vérifier les commerçants
const verifyNewMerchants = async () => {
  try {
    console.log('Connexion à la base de données...');
    
    // Récupérer tous les commerçants
    const merchants = await Merchant.find({});
    
    console.log(`\n📋 Liste des commerçants (${merchants.length} trouvés):`);
    
    if (merchants.length === 0) {
      console.log('Aucun commerçant trouvé dans la base de données.');
    } else {
      merchants.forEach((merchant, index) => {
        console.log(`\n${index + 1}. ${merchant.businessName}`);
        console.log(`   Représentant légal: ${merchant.legalRepresentative.firstName} ${merchant.legalRepresentative.lastName}`);
        console.log(`   Email: ${merchant.email}`);
        console.log(`   Adresse: ${merchant.address.street}, ${merchant.address.postalCode} ${merchant.address.city}, ${merchant.address.country}`);
        console.log(`   Téléphone: ${merchant.phoneNumber}`);
        console.log(`   SIRET: ${merchant.siret}`);
        console.log(`   Statut: ${merchant.isActive ? 'Actif' : 'Inactif'}`);
        console.log(`   Créé le: ${merchant.createdAt}`);
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
verifyNewMerchants();
