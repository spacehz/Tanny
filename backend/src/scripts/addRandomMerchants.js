const mongoose = require('mongoose');
const Merchant = require('../models/Merchant');
const connectDB = require('../config/database');

// Connecter à la base de données
connectDB();

// Liste des commerçants aléatoires à ajouter
const merchants = [
  {
    businessName: 'Boulangerie Dupont',
    legalRepresentative: {
      firstName: 'Jean',
      lastName: 'Dupont'
    },
    email: 'jean.dupont@commerce.fr',
    phoneNumber: '01 23 45 67 89',
    siret: '12345678901234',
    isActive: true,
    address: {
      street: '15 rue des Artisans',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    }
  },
  {
    businessName: 'Épicerie Bio Leroy',
    legalRepresentative: {
      firstName: 'Marie',
      lastName: 'Leroy'
    },
    email: 'marie.leroy@boutique.com',
    phoneNumber: '02 34 56 78 90',
    siret: '23456789012345',
    isActive: true,
    address: {
      street: '42 avenue des Commerçants',
      city: 'Paris',
      postalCode: '75002',
      country: 'France'
    }
  },
  {
    businessName: 'Librairie Benali',
    legalRepresentative: {
      firstName: 'Ahmed',
      lastName: 'Benali'
    },
    email: 'ahmed.benali@magasin.fr',
    phoneNumber: '03 45 67 89 01',
    siret: '34567890123456',
    isActive: true,
    address: {
      street: '8 boulevard des Livres',
      city: 'Paris',
      postalCode: '75003',
      country: 'France'
    }
  },
  {
    businessName: 'Primeur Martin',
    legalRepresentative: {
      firstName: 'Sophie',
      lastName: 'Martin'
    },
    email: 'sophie.martin@primeur.fr',
    phoneNumber: '04 56 78 90 12',
    siret: '45678901234567',
    isActive: true,
    address: {
      street: '23 rue des Fruits',
      city: 'Lyon',
      postalCode: '69001',
      country: 'France'
    }
  },
  {
    businessName: 'Fromagerie Petit',
    legalRepresentative: {
      firstName: 'Pierre',
      lastName: 'Petit'
    },
    email: 'pierre.petit@fromage.fr',
    phoneNumber: '05 67 89 01 23',
    siret: '56789012345678',
    isActive: true,
    address: {
      street: '12 place du Marché',
      city: 'Marseille',
      postalCode: '13001',
      country: 'France'
    }
  },
  {
    businessName: 'Boucherie Moreau',
    legalRepresentative: {
      firstName: 'Thomas',
      lastName: 'Moreau'
    },
    email: 'thomas.moreau@boucherie.fr',
    phoneNumber: '06 78 90 12 34',
    siret: '67890123456789',
    isActive: true,
    address: {
      street: '5 rue de la Viande',
      city: 'Bordeaux',
      postalCode: '33000',
      country: 'France'
    }
  },
  {
    businessName: 'Pâtisserie Dubois',
    legalRepresentative: {
      firstName: 'Claire',
      lastName: 'Dubois'
    },
    email: 'claire.dubois@patisserie.fr',
    phoneNumber: '07 89 01 23 45',
    siret: '78901234567890',
    isActive: true,
    address: {
      street: '18 avenue des Gâteaux',
      city: 'Toulouse',
      postalCode: '31000',
      country: 'France'
    }
  },
  {
    businessName: 'Poissonnerie Blanc',
    legalRepresentative: {
      firstName: 'Michel',
      lastName: 'Blanc'
    },
    email: 'michel.blanc@poisson.fr',
    phoneNumber: '08 90 12 34 56',
    siret: '89012345678901',
    isActive: false, // Commerçant inactif pour tester
    address: {
      street: '3 quai des Pêcheurs',
      city: 'Nantes',
      postalCode: '44000',
      country: 'France'
    }
  }
];

// Fonction principale pour ajouter les commerçants
const addRandomMerchants = async () => {
  try {
    console.log('Connexion à la base de données...');
    
    // Vérifier si les commerçants existent déjà (par email ou siret)
    const existingEmails = merchants.map(merchant => merchant.email);
    const existingSirets = merchants.map(merchant => merchant.siret);
    
    const existingMerchants = await Merchant.find({
      $or: [
        { email: { $in: existingEmails } },
        { siret: { $in: existingSirets } }
      ]
    });
    
    if (existingMerchants.length > 0) {
      console.log('⚠️ Certains commerçants existent déjà:');
      existingMerchants.forEach(merchant => {
        console.log(`- ${merchant.businessName} (${merchant.email}, SIRET: ${merchant.siret})`);
      });
      
      // Filtrer les commerçants qui n'existent pas encore
      const existingEmailsArray = existingMerchants.map(m => m.email);
      const existingSiretsArray = existingMerchants.map(m => m.siret);
      
      const newMerchants = merchants.filter(m => 
        !existingEmailsArray.includes(m.email) && !existingSiretsArray.includes(m.siret)
      );
      
      if (newMerchants.length === 0) {
        console.log('Tous les commerçants existent déjà. Aucun ajout nécessaire.');
        await mongoose.connection.close();
        return;
      }
      
      console.log(`Ajout de ${newMerchants.length} nouveaux commerçants...`);
      const result = await Merchant.insertMany(newMerchants);
      
      console.log(`✅ ${result.length} commerçants ont été ajoutés avec succès:`);
      result.forEach((merchant, index) => {
        console.log(`${index + 1}. ${merchant.businessName} - ${merchant.email} (SIRET: ${merchant.siret})`);
      });
    } else {
      // Aucun commerçant n'existe, ajouter tous les commerçants
      console.log(`Ajout de ${merchants.length} commerçants...`);
      const result = await Merchant.insertMany(merchants);
      
      console.log(`✅ ${result.length} commerçants ont été ajoutés avec succès:`);
      result.forEach((merchant, index) => {
        console.log(`${index + 1}. ${merchant.businessName} - ${merchant.email} (SIRET: ${merchant.siret})`);
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
addRandomMerchants();
