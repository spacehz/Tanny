const mongoose = require('mongoose');

async function manageDatabases() {
  try {
    // Connexion à MongoDB avec les identifiants admin
    await mongoose.connect('mongodb://admin:12345@localhost:27017/admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connecté à MongoDB en tant qu\'admin');
    
    // Lister toutes les bases de données
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    
    console.log('\nBases de données existantes:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Vérifier si TANY existe
    const tanyExists = dbs.databases.some(db => db.name === 'TANY');
    
    if (!tanyExists) {
      console.log('\nLa base de données "TANY" n\'existe pas. Création en cours...');
      
      // Se connecter à la base de données "TANY" pour la créer
      await mongoose.connection.close();
      await mongoose.connect('mongodb://admin:12345@localhost:27017/TANY?authSource=admin', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
      
      // Créer une collection pour s'assurer que la base de données est créée
      await mongoose.connection.db.createCollection('init');
      console.log('Base de données "TANY" créée avec succès');
      
      // Reconnecter à admin pour continuer
      await mongoose.connection.close();
      await mongoose.connect('mongodb://admin:12345@localhost:27017/admin', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    } else {
      console.log('\nLa base de données "TANY" existe déjà');
    }
    
    // Demander confirmation avant de supprimer d'autres bases de données
    console.log('\nVoulez-vous supprimer les autres bases de données non système?');
    console.log('Pour supprimer une base de données spécifique, exécutez:');
    console.log('node -e "require(\'mongoose\').connect(\'mongodb://admin:12345@localhost:27017/admin\', {useNewUrlParser: true, useUnifiedTopology: true}).then(async conn => { await conn.connection.db.admin().dropDatabase(\'NOM_BASE\'); console.log(\'Base supprimée\'); process.exit(0); });"');
    
    // Vérifier les collections dans TANY
    await mongoose.connection.close();
    await mongoose.connect('mongodb://admin:12345@localhost:27017/TANY?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections dans la base de données TANY:');
    if (collections.length === 0) {
      console.log('Aucune collection trouvée');
    } else {
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nConnexion fermée');
  }
}

manageDatabases();
