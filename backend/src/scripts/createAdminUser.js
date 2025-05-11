const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

// Chargement des variables d'environnement
dotenv.config();

// Fonction pour créer l'utilisateur admin
const createAdminUser = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tanny', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connecté pour la création de l\'utilisateur admin');

    // Vérifier si l'utilisateur admin existe déjà
    const adminExists = await User.findOne({ email: 'admin@admin.com' });
    
    if (adminExists) {
      console.log('L\'utilisateur admin existe déjà');
      await mongoose.connection.close();
      return;
    }

    // Créer l'utilisateur admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin', salt);

    const adminUser = new User({
      name: 'Administrateur',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log('Utilisateur admin créé avec succès');

    // Fermer la connexion à MongoDB
    await mongoose.connection.close();
    console.log('Connexion MongoDB fermée');
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur admin:', error);
    process.exit(1);
  }
};

// Exécuter la fonction
createAdminUser();
