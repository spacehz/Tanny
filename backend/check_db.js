const mongoose = require('mongoose');

async function checkAndCreateDB() {
  try {
    // Connexion à MongoDB avec les identifiants fournis
    await mongoose.connect('mongodb://admin:12345@localhost:27017/admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connecté à MongoDB');
    
    // Vérifier si la base de données "TANY" existe
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    
    const TANYExists = dbs.databases.some(db => db.name === 'TANY');
    
    if (TANYExists) {
      console.log('La base de données "TANY" existe déjà');
    } else {
      console.log('La base de données "TANY" n\'existe pas, création en cours...');
      
      // Se connecter à la base de données "TANY" pour la créer
      await mongoose.connection.close();
      await mongoose.connect('mongodb://admin:12345@localhost:27017/TANY', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      // Créer une collection pour s'assurer que la base de données est créée
      await mongoose.connection.db.createCollection('init');
      console.log('Base de données "TANY" créée avec succès');
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion fermée');
  }
}

checkAndCreateDB();
