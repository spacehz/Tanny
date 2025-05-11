const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

// Connecter à la base de données
connectDB();

// Fonction pour générer un email aléatoire
const generateRandomEmail = (name) => {
  const domains = ['gmail.com', 'yahoo.fr', 'hotmail.com', 'outlook.com', 'orange.fr'];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  // Remplacer les caractères spéciaux et espaces par des points
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.');
  return `${cleanName}${Math.floor(Math.random() * 1000)}@${randomDomain}`;
};

// Fonction pour générer un mot de passe aléatoire
const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8);
};

// Fonction pour générer une disponibilité aléatoire
const generateRandomAvailability = () => {
  const availabilities = ['Flexible', 'Matin', 'Après-midi', 'Soir', 'Week-end'];
  return availabilities[Math.floor(Math.random() * availabilities.length)];
};

// Fonction pour générer un numéro de téléphone aléatoire
const generateRandomPhoneNumber = () => {
  return `0${Math.floor(Math.random() * 9) + 1}${Array(8).fill(0).map(() => Math.floor(Math.random() * 10)).join('')}`;
};

// Liste de noms aléatoires
const randomNames = [
  'Sophie Martin',
  'Thomas Dubois',
  'Emma Bernard',
  'Lucas Petit',
  'Chloé Durand',
  'Hugo Moreau',
  'Léa Richard',
  'Nathan Robert',
  'Camille Simon',
  'Jules Laurent'
];

// Fonction principale pour ajouter des bénévoles aléatoires
const addRandomVolunteers = async () => {
  try {
    console.log('Connexion à la base de données...');
    
    // Sélectionner 5 noms aléatoires uniques
    const selectedNames = [];
    while (selectedNames.length < 5) {
      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
      if (!selectedNames.includes(randomName)) {
        selectedNames.push(randomName);
      }
    }
    
    // Créer 5 bénévoles avec des données aléatoires
    const volunteers = selectedNames.map(name => ({
      name,
      email: generateRandomEmail(name),
      password: generateRandomPassword(),
      role: 'bénévole',
      availability: generateRandomAvailability(),
      phoneNumber: generateRandomPhoneNumber(),
      isActive: Math.random() > 0.2 // 80% de chance d'être actif
    }));
    
    console.log('Ajout de 5 bénévoles aléatoires...');
    
    // Insérer les bénévoles dans la base de données
    const result = await User.insertMany(volunteers);
    
    console.log('✅ 5 bénévoles ont été ajoutés avec succès:');
    result.forEach((volunteer, index) => {
      console.log(`${index + 1}. ${volunteer.name} (${volunteer.email}) - Disponibilité: ${volunteer.availability}`);
    });
    
    // Fermer la connexion à la base de données
    await mongoose.connection.close();
    console.log('Connexion à la base de données fermée.');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'ajout des bénévoles:', error.message);
    // Fermer la connexion à la base de données en cas d'erreur
    await mongoose.connection.close();
  }
};

// Exécuter la fonction principale
addRandomVolunteers();
