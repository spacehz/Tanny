const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Utilisation d'une URL de connexion avec authSource=admin pour spécifier la base de données d'authentification
    const conn = await mongoose.connect('mongodb://admin:12345@localhost:27017/tanny?authSource=admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
