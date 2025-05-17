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
    
    // Demander les informations de l'utilisateur
    const email = process.argv[2] || 'commercant@tany.org';
    const name = process.argv[3] || 'Commerçant Test';
    const password = process.argv[4] || 'commercant123';
    const businessName = process.argv[5] || 'Commerce Test';
    const address = process.argv[6] || 'Adresse du commerce';
    const phoneNumber = process.argv[7] || '0123456789';
    
    // Vérifier si l'utilisateur commerçant existe déjà
    const commercantExists = await User.findOne({ email });
    
    if (commercantExists) {
      console.log('L\'utilisateur avec cet email existe déjà');
      console.log('Détails de l\'utilisateur existant:');
      console.log(`ID: ${commercantExists._id}`);
      console.log(`Nom: ${commercantExists.name}`);
      console.log(`Email: ${commercantExists.email}`);
      console.log(`Rôle: ${commercantExists.role}`);
      console.log(`Commerce: ${commercantExists.businessName || 'Non défini'}`);
      
      // Si l'utilisateur existe mais n'a pas le rôle commerçant, mettre à jour son rôle et ses informations
      if (commercantExists.role !== 'commercant') {
        commercantExists.role = 'commercant';
        commercantExists.businessName = businessName;
        commercantExists.address = address;
        commercantExists.phoneNumber = phoneNumber;
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
        address,
        phoneNumber,
        isActive: true
      });
      
      await commercantUser.save();
      console.log('Utilisateur commerçant créé avec succès:');
      console.log(`ID: ${commercantUser._id}`);
      console.log(`Nom: ${commercantUser.name}`);
      console.log(`Email: ${commercantUser.email}`);
      console.log(`Rôle: ${commercantUser.role}`);
      console.log(`Commerce: ${commercantUser.businessName}`);
      console.log(`Adresse: ${commercantUser.address}`);
      console.log(`Téléphone: ${commercantUser.phoneNumber}`);
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion fermée');
  }
}

// Afficher les instructions d'utilisation si aucun argument n'est fourni
if (process.argv.length === 2) {
  console.log('Utilisation: node create_commercant_user.js [email] [nom] [mot_de_passe] [nom_commerce] [adresse] [telephone]');
  console.log('Si aucun argument n\'est fourni, les valeurs par défaut seront utilisées:');
  console.log('Email: commercant@tany.org');
  console.log('Nom: Commerçant Test');
  console.log('Mot de passe: commercant123');
  console.log('Nom du commerce: Commerce Test');
  console.log('Adresse: Adresse du commerce');
  console.log('Téléphone: 0123456789');
}

createCommercantUser();
