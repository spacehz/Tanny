const { MongoClient } = require('mongodb');

async function checkAndCreateDB() {
  const uri = 'mongodb://admin:12345@localhost:27017/admin';
  const client = new MongoClient(uri);

  try {
    // Connexion à MongoDB
    await client.connect();
    console.log('Connecté à MongoDB');
    
    // Vérifier si la base de données "TANY" existe
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    
    const TANYExists = dbs.databases.some(db => db.name === 'TANY');
    
    if (TANYExists) {
      console.log('La base de données "TANY" existe déjà');
    } else {
      console.log('La base de données "TANY" n\'existe pas, création en cours...');
      
      // Créer une collection dans la base de données "TANY" pour la créer
      const TANYDb = client.db('TANY');
      await TANYDb.createCollection('init');
      console.log('Base de données "TANY" créée avec succès');
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await client.close();
    console.log('Connexion fermée');
  }
}

checkAndCreateDB();
