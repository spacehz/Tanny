const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function createVolunteerUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://admin:12345@localhost:27017/TANY?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connecté à MongoDB');
    
    // Vérifier si l'utilisateur bénévole existe déjà
    const volunteerExists = await User.findOne({ email: 'benevole@tany.org' });
    
    if (volunteerExists) {
      console.log('L\'utilisateur bénévole existe déjà');
      console.log('Détails de l\'utilisateur bénévole existant:');
      console.log(`ID: ${volunteerExists._id}`);
      console.log(`Nom: ${volunteerExists.name}`);
      console.log(`Email: ${volunteerExists.email}`);
      console.log(`Rôle: ${volunteerExists.role}`);
      
      // Si l'utilisateur existe mais n'a pas le rôle volunteer, mettre à jour son rôle
      if (volunteerExists.role !== 'volunteer') {
        volunteerExists.role = 'volunteer';
        await volunteerExists.save();
        console.log('Le rôle de l\'utilisateur a été mis à jour à "volunteer"');
      }
    } else {
      // Créer l'utilisateur bénévole
      const volunteerUser = new User({
        name: 'Bénévole Test',
        email: 'benevole@tany.org',
        password: 'benevole123',
        role: 'volunteer',
      });
      
      await volunteerUser.save();
      console.log('Utilisateur bénévole créé avec succès:');
      console.log(`ID: ${volunteerUser._id}`);
      console.log(`Nom: ${volunteerUser.name}`);
      console.log(`Email: ${volunteerUser.email}`);
      console.log(`Rôle: ${volunteerUser.role}`);
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion fermée');
  }
}

createVolunteerUser();
