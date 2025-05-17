const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function createBenevoleUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://admin:12345@localhost:27017/TANY?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connecté à MongoDB');
    
    // Paramètres de l'utilisateur bénévole (avec valeurs par défaut)
    const email = process.argv[2] || 'benevole@tany.org';
    const name = process.argv[3] || 'Bénévole Test';
    const password = process.argv[4] || 'benevole123';
    const availability = process.argv[5] || 'Flexible';
    const phoneNumber = process.argv[6] || '';
    const address = process.argv[7] || '';
    
    // Vérifier si l'utilisateur bénévole existe déjà
    const benevoleExists = await User.findOne({ email });
    
    if (benevoleExists) {
      console.log('L\'utilisateur avec cet email existe déjà');
      console.log('Détails de l\'utilisateur existant:');
      console.log(`ID: ${benevoleExists._id}`);
      console.log(`Nom: ${benevoleExists.name}`);
      console.log(`Email: ${benevoleExists.email}`);
      console.log(`Rôle: ${benevoleExists.role}`);
      if (benevoleExists.availability) console.log(`Disponibilité: ${benevoleExists.availability}`);
      if (benevoleExists.phoneNumber) console.log(`Téléphone: ${benevoleExists.phoneNumber}`);
      if (benevoleExists.address) console.log(`Adresse: ${benevoleExists.address}`);
      
      // Si l'utilisateur existe mais n'a pas le rôle bénévole, mettre à jour son rôle et ses informations
      if (benevoleExists.role !== 'bénévole') {
        benevoleExists.role = 'bénévole';
        benevoleExists.availability = availability;
        if (phoneNumber) benevoleExists.phoneNumber = phoneNumber;
        if (address) benevoleExists.address = address;
        await benevoleExists.save();
        console.log('Le rôle de l\'utilisateur a été mis à jour à "bénévole" et ses informations ont été mises à jour');
      }
    } else {
      // Créer l'utilisateur bénévole
      const benevoleUser = new User({
        name,
        email,
        password,
        role: 'bénévole',
        availability,
        phoneNumber,
        address,
        isActive: true
      });
      
      await benevoleUser.save();
      console.log('Utilisateur bénévole créé avec succès:');
      console.log(`ID: ${benevoleUser._id}`);
      console.log(`Nom: ${benevoleUser.name}`);
      console.log(`Email: ${benevoleUser.email}`);
      console.log(`Rôle: ${benevoleUser.role}`);
      console.log(`Disponibilité: ${benevoleUser.availability}`);
      if (phoneNumber) console.log(`Téléphone: ${benevoleUser.phoneNumber}`);
      if (address) console.log(`Adresse: ${benevoleUser.address}`);
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
  console.log('Utilisation: node create_benevole_user_corrected.js [email] [nom] [mot_de_passe] [disponibilite] [telephone] [adresse]');
  console.log('Si aucun argument n\'est fourni, les valeurs par défaut seront utilisées:');
  console.log('Email: benevole@tany.org');
  console.log('Nom: Bénévole Test');
  console.log('Mot de passe: benevole123');
  console.log('Disponibilité: Flexible');
}

createBenevoleUser();
