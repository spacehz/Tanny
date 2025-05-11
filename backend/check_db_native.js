const { MongoClient } = require('mongodb');

async function checkAndCreateDB() {
  const uri = 'mongodb://admin:12345@localhost:27017/admin';
  const client = new MongoClient(uri);

  try {
    // Connexion à MongoDB
    await client.connect();
    console.log('Connecté à MongoDB');
    
    // Vérifier si la base de données "tanny" existe
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    
    const tannyExists = dbs.databases.some(db => db.name === 'tanny');
    
    if (tannyExists) {
      console.log('La base de données "tanny" existe déjà');
    } else {
      console.log('La base de données "tanny" n\'existe pas, création en cours...');
      
      // Créer une collection dans la base de données "tanny" pour la créer
      const tannyDb = client.db('tanny');
      await tannyDb.createCollection('init');
      console.log('Base de données "tanny" créée avec succès');
    }
  } catch (error) {
    console.error('Erreur:', error.message);
  } finally {
    await client.close();
    console.log('Connexion fermée');
  }
}

checkAndCreateDB();
