const mongoose = require('mongoose');
const User = require('./src/models/User');

async function updateUserRole() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://admin:12345@localhost:27017/TANY?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connecté à MongoDB');
    
    // Trouver l'utilisateur par email
    const user = await User.findOne({ email: 'anis.zouari@sifast.com' });
    
    if (user) {
      console.log('Utilisateur trouvé:');
      console.log(`ID: ${user._id}`);
      console.log(`Nom: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Rôle actuel: ${user.role}`);
      
      // Mettre à jour le rôle de l'utilisateur à "volunteer"
      user.role = 'volunteer';
      await user.save();
      
      console.log('Rôle mis à jour avec succès:');
      console.log(`Nouveau rôle: ${user.role}`);
    } else {
      console.log('Utilisateur non trouvé');
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion fermée');
  }
}

updateUserRole();
