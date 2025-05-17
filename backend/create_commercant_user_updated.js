const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function createCommercantUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://admin:12345@localhost:27017/TANY?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connecté à MongoDB');
    
    // Paramètres de l'utilisateur commerçant (avec valeurs par défaut)
    const email = process.argv[2] || 'commercant@tany.org';
    const name = process.argv[3] || 'Commerçant Test';
    const password = process.argv[4] || 'commercant123';
    const businessName = process.argv[5] || 'Commerce Test';
    const phoneNumber = process.argv[6] || '';
    const address = process.argv[7] || '';
    const isActive = process.argv[8] !== 'false'; // Par défaut true, sauf si explicitement 'false'
    
    // Vérifier si l'utilisateur commerçant existe déjà
    const commercantExists = await User.findOne({ email });
    
    if (commercantExists) {
      console.log('L\'utilisateur avec cet email existe déjà');
      console.log('Détails de l\'utilisateur existant:');
      console.log(`ID: ${commercantExists._id}`);
      console.log(`Nom: ${commercantExists.name}`);
      console.log(`Email: ${commercantExists.email}`);
      console.log(`Rôle: ${commercantExists.role}`);
      if (commercantExists.businessName) console.log(`Commerce: ${commercantExists.businessName}`);
      if (commercantExists.phoneNumber) console.log(`Téléphone: ${commercantExists.phoneNumber}`);
      if (commercantExists.address) console.log(`Adresse: ${commercantExists.address}`);
      console.log(`Statut: ${commercantExists.isActive ? 'Actif' : 'Inactif'}`);
      
      // Si l'utilisateur existe mais n'a pas le rôle commerçant, mettre à jour son rôle et ses informations
      if (commercantExists.role !== 'commercant') {
        commercantExists.role = 'commercant';
        commercantExists.businessName = businessName;
        if (phoneNumber) commercantExists.phoneNumber = phoneNumber;
        if (address) commercantExists.address = address;
        commercantExists.isActive = isActive;
        await commercantExists.save();
        console.log('Le rôle de l\'utilisateur a été mis à jour à "commercant" et ses informations ont été mises à jour');
      }
    } else {
      // Créer l'utilisateur commerçant
      const commercantUser = new User({
        name,
        email,
        password,
        role: 'commercant',
        businessName,
        phoneNumber,
        address,
        isActive
      });
      
      await commercantUser.save();
      console.log('Utilisateur commerçant créé avec succès:');
      console.log(`ID: ${commercantUser._id}`);
      console.log(`Nom: ${commercantUser.name}`);
      console.log(`Email: ${commercantUser.email}`);
      console.log(`Rôle: ${commercantUser.role}`);
      console.log(`Commerce: ${commercantUser.businessName}`);
      if (phoneNumber) console.log(`Téléphone: ${commercantUser.phoneNumber}`);
      if (address) console.log(`Adresse: ${commercantUser.address}`);
      console.log(`Statut: ${commercantUser.isActive ? 'Actif' : 'Inactif'}`);
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
  console.log('Utilisation: node create_commercant_user_updated.js [email] [nom] [mot_de_passe] [nom_commerce] [telephone] [adresse] [actif]');
  console.log('Si aucun argument n\'est fourni, les valeurs par défaut seront utilisées:');
  console.log('Email: commercant@tany.org');
  console.log('Nom: Commerçant Test');
  console.log('Mot de passe: commercant123');
  console.log('Nom du commerce: Commerce Test');
  console.log('Statut: Actif (utilisez "false" pour inactif)');
}

createCommercantUser();
