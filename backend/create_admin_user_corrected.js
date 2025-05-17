const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://admin:12345@localhost:27017/TANY?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connecté à MongoDB');
    
    // Paramètres de l'utilisateur admin (avec valeurs par défaut)
    const email = process.argv[2] || 'admin@tany.org';
    const name = process.argv[3] || 'Administrateur';
    const password = process.argv[4] || 'admin123';
    const phoneNumber = process.argv[5] || '';
    const address = process.argv[6] || '';
    
    // Vérifier si l'utilisateur admin existe déjà
    const adminExists = await User.findOne({ email });
    
    if (adminExists) {
      console.log('L\'utilisateur admin avec cet email existe déjà');
      console.log('Détails de l\'utilisateur admin existant:');
      console.log(`ID: ${adminExists._id}`);
      console.log(`Nom: ${adminExists.name}`);
      console.log(`Email: ${adminExists.email}`);
      console.log(`Rôle: ${adminExists.role}`);
      
      // Si l'utilisateur existe mais n'a pas le rôle admin, mettre à jour son rôle
      if (adminExists.role !== 'admin') {
        adminExists.role = 'admin';
        await adminExists.save();
        console.log('Le rôle de l\'utilisateur a été mis à jour à "admin"');
      }
    } else {
      // Créer l'utilisateur admin
      const adminUser = new User({
        name,
        email,
        password,
        role: 'admin',
        phoneNumber,
        address,
        isActive: true
      });
      
      await adminUser.save();
      console.log('Utilisateur admin créé avec succès:');
      console.log(`ID: ${adminUser._id}`);
      console.log(`Nom: ${adminUser.name}`);
      console.log(`Email: ${adminUser.email}`);
      console.log(`Rôle: ${adminUser.role}`);
      if (phoneNumber) console.log(`Téléphone: ${adminUser.phoneNumber}`);
      if (address) console.log(`Adresse: ${adminUser.address}`);
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion fermée');
  }
}

// Afficher les instructions d'utilisation
if (process.argv.length === 2) {
  console.log('Utilisation: node create_admin_user_corrected.js [email] [nom] [mot_de_passe] [telephone] [adresse]');
  console.log('Si aucun argument n\'est fourni, les valeurs par défaut seront utilisées:');
  console.log('Email: admin@tany.org');
  console.log('Nom: Administrateur');
  console.log('Mot de passe: admin123');
}

createAdminUser();
