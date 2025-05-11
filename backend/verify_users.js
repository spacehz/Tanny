const mongoose = require('mongoose');
const User = require('./src/models/User');

async function verifyUsers() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://admin:12345@localhost:27017/tanny?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connecté à MongoDB');
    
    // Récupérer tous les utilisateurs
    const users = await User.find({}).select('-password');
    
    console.log('Liste des utilisateurs:');
    users.forEach(user => {
      console.log(`ID: ${user._id}`);
      console.log(`Nom: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Rôle: ${user.role}`);
      console.log('-------------------');
    });
    
    // Vérifier le schéma utilisateur
    const userSchema = User.schema;
    console.log('Schéma utilisateur:');
    console.log('Champ "role":');
    console.log(`  Type: ${userSchema.path('role').instance}`);
    console.log(`  Valeurs possibles: ${userSchema.path('role').enumValues}`);
    console.log(`  Valeur par défaut: ${userSchema.path('role').defaultValue}`);
    
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion fermée');
  }
}

verifyUsers();
