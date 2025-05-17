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
    
    // Demander les informations de l'utilisateur
    const email = process.argv[2] || 'benevole@tany.org';
    const name = process.argv[3] || 'Bénévole Test';
    const password = process.argv[4] || 'benevole123';
    
    // Vérifier si l'utilisateur bénévole existe déjà
    const benevoleExists = await User.findOne({ email });
    
    if (benevoleExists) {
      console.log('L\'utilisateur avec cet email existe déjà');
      console.log('Détails de l\'utilisateur existant:');
      console.log(`ID: ${benevoleExists._id}`);
      console.log(`Nom: ${benevoleExists.name}`);
      console.log(`Email: ${benevoleExists.email}`);
      console.log(`Rôle: ${benevoleExists.role}`);
      console.log(`Disponibilité: ${benevoleExists.availability || 'Non définie'}`);
      console.log(`Période d'absence: ${
        benevoleExists.absencePeriod && benevoleExists.absencePeriod.startDate && benevoleExists.absencePeriod.endDate ? 
        `${new Date(benevoleExists.absencePeriod.startDate).toLocaleDateString('fr-FR')} - ${new Date(benevoleExists.absencePeriod.endDate).toLocaleDateString('fr-FR')}` : 
        'Non définie'
      }`);
      console.log(`Heures bénévolat: ${benevoleExists.volunteerHours || 0}`);
      
      // Si l'utilisateur existe mais n'a pas le rôle bénévole ou les nouveaux champs, mettre à jour
      if (benevoleExists.role !== 'bénévole' || benevoleExists.availability === undefined || benevoleExists.absencePeriod === undefined || benevoleExists.volunteerHours === undefined) {
        benevoleExists.role = 'bénévole';
        benevoleExists.availability = benevoleExists.availability || 'oui';
        benevoleExists.absencePeriod = benevoleExists.absencePeriod || { startDate: null, endDate: null };
        benevoleExists.volunteerHours = benevoleExists.volunteerHours || 0;
        await benevoleExists.save();
        console.log('Les informations de l\'utilisateur ont été mises à jour');
      }
    } else {
      // Créer l'utilisateur bénévole
      const benevoleUser = new User({
        name,
        email,
        password,
        role: 'bénévole',
        availability: 'oui',
        absencePeriod: {
          startDate: null,
          endDate: null
        },
        volunteerHours: 0,
      });
      
      await benevoleUser.save();
      console.log('Utilisateur bénévole créé avec succès:');
      console.log(`ID: ${benevoleUser._id}`);
      console.log(`Nom: ${benevoleUser.name}`);
      console.log(`Email: ${benevoleUser.email}`);
      console.log(`Rôle: ${benevoleUser.role}`);
      console.log(`Disponibilité: ${benevoleUser.availability}`);
      console.log(`Période d'absence: ${
        benevoleUser.absencePeriod && benevoleUser.absencePeriod.startDate && benevoleUser.absencePeriod.endDate ? 
        `${new Date(benevoleUser.absencePeriod.startDate).toLocaleDateString('fr-FR')} - ${new Date(benevoleUser.absencePeriod.endDate).toLocaleDateString('fr-FR')}` : 
        'Non définie'
      }`);
      console.log(`Heures bénévolat: ${benevoleUser.volunteerHours}`);
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
  console.log('Utilisation: node create_benevole_user.js [email] [nom] [mot_de_passe]');
  console.log('Si aucun argument n\'est fourni, les valeurs par défaut seront utilisées:');
  console.log('Email: benevole@tany.org');
  console.log('Nom: Bénévole Test');
  console.log('Mot de passe: benevole123');
}

createBenevoleUser();
