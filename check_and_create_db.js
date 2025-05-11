const mongoose = require('mongoose');

async function checkAndCreateDB() {
  try {
    // Connexion à MongoDB avec les identifiants fournis
    await mongoose.connect('mongodb://admin:12345@localhost:27017/admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connecté à MongoDB');
    
    // Vérifier si la base de données "tanny" existe
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    
    const tannyExists = dbs.databases.some(db => db.name === 'tanny');
    
    if (tannyExists) {
      console.log('La base de données "tanny" existe déjà');
    } else {
      console.log('La base de données "tanny" n\'existe pas, création en cours...');
      
      // Se connecter à la base de données "tanny" pour la créer
      await mongoose.connection.close();
      await mongoose.connect('mongodb://admin:12345@localhost:27017/tanny', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      // Créer une collection pour s'assurer que la base de données est créée
      await mongoose.connection.db.createCollection('init');
      console.log('Base de données "tanny" créée avec succès');
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion fermée');
  }
}

checkAndCreateDB();
