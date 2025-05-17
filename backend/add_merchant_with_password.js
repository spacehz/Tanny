require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tanny')
  .then(() => console.log('MongoDB connecté'))
  .catch(err => {
    console.error('Erreur de connexion MongoDB:', err);
    process.exit(1);
  });

// Définition du schéma et du modèle Merchant
const merchantSchema = new mongoose.Schema({
  businessName: String,
  legalRepresentative: {
    firstName: String,
    lastName: String
  },
  email: {
    type: String,
    unique: true
  },
  phoneNumber: String,
  siret: {
    type: String,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  password: String,
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: {
      type: String,
      default: 'France'
    }
  }
}, { timestamps: true });

const Merchant = mongoose.model('Merchant', merchantSchema);

// Fonction pour créer un commerçant avec mot de passe
async function createMerchantWithPassword() {
  try {
    // Vérifier si le commerçant existe déjà
    const existingMerchant = await Merchant.findOne({ email: 'boulangerie@tany.org' });
    
    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('merchant123', salt);
    
    if (existingMerchant) {
      console.log('Commerçant existant trouvé, mise à jour du mot de passe...');
      
      // Mettre à jour le mot de passe
      existingMerchant.password = hashedPassword;
      await existingMerchant.save();
      
      console.log('Mot de passe mis à jour avec succès!');
      console.log('Email:', existingMerchant.email);
      console.log('Mot de passe (en clair):', 'merchant123');
    } else {
      console.log('Création d\'un nouveau commerçant...');
      
      // Créer un nouveau commerçant
      const newMerchant = new Merchant({
        businessName: 'Boulangerie Test',
        legalRepresentative: {
          firstName: 'Jean',
          lastName: 'Dupont'
        },
        email: 'boulangerie@tany.org',
        phoneNumber: '0123456789',
        siret: '12345678901234',
        password: hashedPassword,
        address: {
          street: '123 Rue du Pain',
          city: 'Paris',
          postalCode: '75001',
          country: 'France'
        }
      });
      
      await newMerchant.save();
      
      console.log('Commerçant créé avec succès!');
      console.log('Email:', newMerchant.email);
      console.log('Mot de passe (en clair):', 'merchant123');
    }
    
    // Vérifier que le mot de passe est bien enregistré
    const merchantWithPassword = await mongoose.connection.db
      .collection('merchants')
      .findOne({ email: 'boulangerie@tany.org' });
      
    console.log('Vérification du mot de passe dans la base de données:');
    console.log('Mot de passe présent:', !!merchantWithPassword.password);
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    // Fermer la connexion
    mongoose.connection.close();
    console.log('Connexion MongoDB fermée');
  }
}

// Exécuter la fonction
createMerchantWithPassword();
