const mongoose = require('mongoose');

// Récupérer le nom de la base de données à supprimer depuis les arguments de ligne de commande
const dbNameToDelete = process.argv[2];

if (!dbNameToDelete) {
  console.error('Erreur: Veuillez spécifier le nom de la base de données à supprimer');
  console.error('Usage: node drop_database.js NOM_BASE_DE_DONNEES');
  process.exit(1);
}

// Bases de données système à protéger
const systemDbs = ['admin', 'config', 'local'];

async function dropDatabase() {
  try {
    // Vérifier si c'est une base de données système
    if (systemDbs.includes(dbNameToDelete)) {
      console.error(`Erreur: Impossible de supprimer la base de données système "${dbNameToDelete}"`);
      process.exit(1);
    }
    
    // Connexion à MongoDB avec les identifiants admin
    await mongoose.connect('mongodb://admin:12345@localhost:27017/admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connecté à MongoDB en tant qu\'admin');
    
    // Vérifier si la base de données existe
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    
    const dbExists = dbs.databases.some(db => db.name === dbNameToDelete);
    
    if (!dbExists) {
      console.error(`Erreur: La base de données "${dbNameToDelete}" n'existe pas`);
      process.exit(1);
    }
    
    // Demander confirmation
    console.log(`Êtes-vous sûr de vouloir supprimer la base de données "${dbNameToDelete}"?`);
    console.log('Cette action est irréversible!');
    console.log('Pour confirmer, exécutez: node drop_database.js ' + dbNameToDelete + ' --confirm');
    
    // Vérifier si la confirmation est fournie
    if (process.argv.includes('--confirm')) {
      console.log(`Suppression de la base de données "${dbNameToDelete}" en cours...`);
      
      // Supprimer la base de données
      await mongoose.connection.useDb(dbNameToDelete).dropDatabase();
      
      console.log(`Base de données "${dbNameToDelete}" supprimée avec succès`);
    }
    
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion fermée');
  }
}

dropDatabase();
