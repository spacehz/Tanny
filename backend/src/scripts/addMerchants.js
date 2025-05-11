const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

// Connecter à la base de données
connectDB();

// Liste des commerçants à ajouter
const merchants = [
  {
    name: 'Jean Dupont',
    email: 'jean.dupont@commerce.fr',
    password: 'password123',
    role: 'commercant',
    businessName: 'Boulangerie Dupont',
    address: '15 rue des Artisans, 75001 Paris',
    phoneNumber: '0123456789',
    isActive: true
  },
  {
    name: 'Marie Leroy',
    email: 'marie.leroy@boutique.com',
    password: 'password123',
    role: 'commercant',
    businessName: 'Épicerie Bio Leroy',
    address: '42 avenue des Commerçants, 75002 Paris',
    phoneNumber: '0234567890',
    isActive: true
  },
  {
    name: 'Ahmed Benali',
    email: 'ahmed.benali@magasin.fr',
    password: 'password123',
    role: 'commercant',
    businessName: 'Librairie Benali',
    address: '8 boulevard des Livres, 75003 Paris',
    phoneNumber: '0345678901',
    isActive: true
  }
];

// Fonction principale pour ajouter les commerçants
const addMerchants = async () => {
  try {
    console.log('Connexion à la base de données...');
    
    // Vérifier si les commerçants existent déjà (par email)
    const existingEmails = merchants.map(merchant => merchant.email);
    const existingMerchants = await User.find({ email: { $in: existingEmails } });
    
    if (existingMerchants.length > 0) {
      console.log('⚠️ Certains commerçants existent déjà:');
      existingMerchants.forEach(merchant => {
        console.log(`- ${merchant.name} (${merchant.email})`);
      });
      
      // Filtrer les commerçants qui n'existent pas encore
      const existingEmailsArray = existingMerchants.map(m => m.email);
      const newMerchants = merchants.filter(m => !existingEmailsArray.includes(m.email));
      
      if (newMerchants.length === 0) {
        console.log('Tous les commerçants existent déjà. Aucun ajout nécessaire.');
        await mongoose.connection.close();
        return;
      }
      
      console.log(`Ajout de ${newMerchants.length} nouveaux commerçants...`);
      const result = await User.insertMany(newMerchants);
      
      console.log(`✅ ${result.length} commerçants ont été ajoutés avec succès:`);
      result.forEach((merchant, index) => {
        console.log(`${index + 1}. ${merchant.name} (${merchant.businessName}) - ${merchant.email}`);
      });
    } else {
      // Aucun commerçant n'existe, ajouter tous les commerçants
      console.log(`Ajout de ${merchants.length} commerçants...`);
      const result = await User.insertMany(merchants);
      
      console.log(`✅ ${result.length} commerçants ont été ajoutés avec succès:`);
      result.forEach((merchant, index) => {
        console.log(`${index + 1}. ${merchant.name} (${merchant.businessName}) - ${merchant.email}`);
      });
    }
    
    // Fermer la connexion à la base de données
    await mongoose.connection.close();
    console.log('Connexion à la base de données fermée.');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des commerçants:', error.message);
    // Fermer la connexion à la base de données en cas d'erreur
    await mongoose.connection.close();
  }
};

// Exécuter la fonction principale
addMerchants();
