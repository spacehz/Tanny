const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://admin:12345@localhost:27017/tanny?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connecté à MongoDB');
    
    // Vérifier si l'utilisateur admin existe déjà
    const adminExists = await User.findOne({ email: 'admin@admin.com' });
    
    if (adminExists) {
      console.log('L\'utilisateur admin existe déjà');
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
        name: 'Administrateur',
        email: 'admin@admin.com',
        password: 'admin123',
        role: 'admin',
      });
      
      await adminUser.save();
      console.log('Utilisateur admin créé avec succès:');
      console.log(`ID: ${adminUser._id}`);
      console.log(`Nom: ${adminUser.name}`);
      console.log(`Email: ${adminUser.email}`);
      console.log(`Rôle: ${adminUser.role}`);
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion fermée');
  }
}

createAdminUser();
