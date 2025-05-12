const mongoose = require('mongoose');

async function testConnection() {
  try {
    // Utiliser la même chaîne de connexion que dans database.js
    const conn = await mongoose.connect('mongodb://admin:12345@localhost:27017/TANY', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connecté avec succès: ${conn.connection.host}`);
    
    // Vérifier que nous pouvons accéder à la base de données
    const collections = await conn.connection.db.listCollections().toArray();
    console.log('Collections disponibles:', collections.map(c => c.name));
    
  } catch (error) {
    console.error(`Erreur de connexion: ${error.message}`);
  } finally {
    await mongoose.connection.close();
    console.log('Connexion fermée');
  }
}

testConnection();
