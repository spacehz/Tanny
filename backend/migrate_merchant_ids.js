/**
 * Script de migration pour convertir le champ merchantId en tableau merchants
 * dans la collection events
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

// Modèle Event simplifié pour la migration
const eventSchema = new mongoose.Schema({
  title: String,
  start: Date,
  end: Date,
  type: String,
  description: String,
  location: String,
  merchantId: mongoose.Schema.Types.ObjectId,
  merchants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
  }],
  expectedVolunteers: Number,
  volunteers: [mongoose.Schema.Types.ObjectId],
});

const Event = mongoose.model('Event', eventSchema);

// Connexion à la base de données
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connecté: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Erreur de connexion à MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Fonction de migration
const migrateData = async () => {
  try {
    console.log('Début de la migration...');
    
    // Trouver tous les événements qui ont un merchantId
    const events = await Event.find({ merchantId: { $exists: true, $ne: null } });
    console.log(`Nombre d'événements à migrer: ${events.length}`);
    
    let migratedCount = 0;
    
    // Pour chaque événement, ajouter le merchantId au tableau merchants
    for (const event of events) {
      console.log(`Migration de l'événement: ${event.title} (${event._id})`);
      
      // Initialiser le tableau merchants s'il n'existe pas
      if (!event.merchants) {
        event.merchants = [];
      }
      
      // Ajouter le merchantId au tableau merchants s'il n'y est pas déjà
      if (!event.merchants.includes(event.merchantId)) {
        event.merchants.push(event.merchantId);
        await event.save();
        migratedCount++;
        console.log(`  ✓ Migré avec succès`);
      } else {
        console.log(`  ✓ Déjà migré (merchantId déjà dans le tableau merchants)`);
      }
    }
    
    console.log(`Migration terminée. ${migratedCount} événements migrés.`);
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
  }
};

// Fonction principale
const main = async () => {
  const conn = await connectDB();
  
  try {
    await migrateData();
  } catch (error) {
    console.error('Erreur dans la fonction principale:', error);
  } finally {
    // Fermer la connexion à la base de données
    await mongoose.connection.close();
    console.log('Connexion à la base de données fermée');
  }
};

// Exécuter la fonction principale
main();
