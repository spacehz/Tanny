const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Assignment = require('./src/models/Assignment');
const User = require('./src/models/User');
const Merchant = require('./src/models/Merchant');
const Event = require('./src/models/Event');

// Chargement des variables d'environnement
dotenv.config();

// Connexion à la base de données
mongoose.connect('mongodb://admin:12345@localhost:27017/TANY?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connexion à MongoDB réussie'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Fonction pour créer une affectation de test
async function createTestAssignment() {
  try {
    // Récupérer un bénévole
    const volunteer = await User.findOne({ role: 'bénévole' });
    if (!volunteer) {
      console.error('Aucun bénévole trouvé');
      return;
    }
    
    // Récupérer un commerçant
    const merchant = await Merchant.findOne();
    if (!merchant) {
      console.error('Aucun commerçant trouvé');
      return;
    }
    
    // Récupérer un événement
    const event = await Event.findOne();
    if (!event) {
      console.error('Aucun événement trouvé');
      return;
    }
    
    // Créer une nouvelle affectation
    const newAssignment = new Assignment({
      event: event._id,
      volunteer: volunteer._id,
      merchant: merchant._id,
      items: [
        {
          id: `item-test-1-${Date.now()}`,
          name: 'Pommes',
          quantity: 5,
          unit: 'kg'
        },
        {
          id: `item-test-2-${Date.now()}`,
          name: 'Poires',
          quantity: 3,
          unit: 'kg'
        },
        {
          id: `item-test-3-${Date.now()}`,
          name: 'Bananes',
          quantity: 2,
          unit: 'kg'
        }
      ],
      status: 'pending'
    });
    
    await newAssignment.save();
    console.log('Affectation de test créée avec succès:', newAssignment);
  } catch (error) {
    console.error('Erreur lors de la création de l\'affectation de test:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Exécuter la fonction
createTestAssignment();
