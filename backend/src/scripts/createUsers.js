const mongoose = require('mongoose');
const User = require('../models/User');
const Merchant = require('../models/Merchant');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config({ path: '../../.env' });

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://admin:12345@localhost:27017/TANY?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
};

// Fonction pour créer les utilisateurs
const createUsers = async () => {
  try {
    // Supprimer les utilisateurs existants avec les mêmes emails pour éviter les doublons
    await User.deleteMany({
      email: {
        $in: ['admin@tany.com', 'benevole1@tany.com', 'benevole2@tany.com']
      }
    });
    
    await Merchant.deleteMany({
      email: {
        $in: ['commercant1@tany.com', 'commercant2@tany.com']
      }
    });

    // Créer l'administrateur
    const admin = await User.create({
      name: 'Administrateur',
      email: 'admin@tany.com',
      password: 'admin123',
      role: 'admin',
      phoneNumber: '0123456789',
      address: '123 Rue de l\'Administration, Paris'
    });

    console.log('Administrateur créé:', admin.email);

    // Créer les bénévoles
    const benevole1 = await User.create({
      name: 'Bénévole Un',
      email: 'benevole1@tany.com',
      password: 'benevole123',
      role: 'bénévole',
      phoneNumber: '0123456781',
      address: '456 Rue des Bénévoles, Lyon',
      availability: 'oui'
    });

    console.log('Bénévole 1 créé:', benevole1.email);

    const benevole2 = await User.create({
      name: 'Bénévole Deux',
      email: 'benevole2@tany.com',
      password: 'benevole123',
      role: 'bénévole',
      phoneNumber: '0123456782',
      address: '789 Avenue des Volontaires, Marseille',
      availability: 'oui'
    });

    console.log('Bénévole 2 créé:', benevole2.email);

    // Créer les commerçants
    const commercant1 = await Merchant.create({
      businessName: 'Boulangerie du Coin',
      legalRepresentative: {
        firstName: 'Jean',
        lastName: 'Dupont'
      },
      email: 'commercant1@tany.com',
      password: 'commercant123',
      phoneNumber: '0123456783',
      siret: '12345678901234',
      isActive: true,
      address: {
        street: '10 Rue du Commerce',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      }
    });

    console.log('Commerçant 1 créé:', commercant1.email);

    const commercant2 = await Merchant.create({
      businessName: 'Primeur des Saisons',
      legalRepresentative: {
        firstName: 'Marie',
        lastName: 'Martin'
      },
      email: 'commercant2@tany.com',
      password: 'commercant123',
      phoneNumber: '0123456784',
      siret: '98765432109876',
      isActive: true,
      address: {
        street: '20 Avenue des Fruits',
        city: 'Lyon',
        postalCode: '69001',
        country: 'France'
      }
    });

    console.log('Commerçant 2 créé:', commercant2.email);

    console.log('Tous les utilisateurs ont été créés avec succès!');
  } catch (error) {
    console.error('Erreur lors de la création des utilisateurs:', error);
  }
};

// Exécuter le script
connectDB()
  .then(() => createUsers())
  .then(() => {
    console.log('Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur lors de l\'exécution du script:', error);
    process.exit(1);
  });
