const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use the MONGO_URI from environment variables
    const mongoURI = process.env.MONGO_URI || 'mongodb://admin:12345@localhost:27017/TANY?authSource=admin';
    
    const conn = await mongoose.connect(mongoURI, {
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
