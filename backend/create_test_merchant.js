const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Chargement des variables d'environnement
dotenv.config();

// Configuration de la connexion à MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tanny', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connecté: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Erreur: ${error.message}`);
    process.exit(1);
  }
};

// Définition du schéma Merchant
const merchantSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: [true, 'Veuillez fournir un nom commercial'],
      trim: true,
    },
    legalRepresentative: {
      firstName: {
        type: String,
        required: [true, 'Veuillez fournir le prénom du responsable juridique'],
        trim: true,
      },
      lastName: {
        type: String,
        required: [true, 'Veuillez fournir le nom du responsable juridique'],
        trim: true,
      }
    },
    email: {
      type: String,
      required: [true, 'Veuillez fournir une adresse électronique'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Veuillez fournir une adresse électronique valide',
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Veuillez fournir un numéro de téléphone'],
      trim: true,
    },
    siret: {
      type: String,
      required: [true, 'Veuillez fournir un numéro SIRET'],
      unique: true,
      trim: true,
      match: [
        /^[0-9]{14}$/,
        'Le numéro SIRET doit contenir 14 chiffres'
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      required: [true, 'Veuillez fournir un mot de passe'],
      minlength: [4, 'Le mot de passe doit contenir au moins 4 caractères'],
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        default: 'France',
        trim: true,
      }
    }
  },
  {
    timestamps: true,
  }
);

// Création du modèle Merchant
const Merchant = mongoose.model('Merchant', merchantSchema);

// Fonction pour créer un commerçant de test
const createTestMerchant = async () => {
  try {
    // Vérifier si le commerçant existe déjà
    const existingMerchant = await Merchant.findOne({ email: 'boulangerie@tany.org' });
    
    if (existingMerchant) {
      console.log('Le commerçant de test existe déjà. Mise à jour du mot de passe...');
      
      // Hacher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('merchant123', salt);
      
      // Mettre à jour le mot de passe
      existingMerchant.password = hashedPassword;
      await existingMerchant.save();
      
      console.log('Mot de passe mis à jour avec succès!');
      console.log('Email:', existingMerchant.email);
      console.log('Mot de passe (en clair):', 'merchant123');
      return;
    }
    
    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('merchant123', salt);
    
    // Créer un nouveau commerçant
    const merchant = await Merchant.create({
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
    
    console.log('Commerçant de test créé avec succès!');
    console.log('ID:', merchant._id);
    console.log('Email:', merchant.email);
    console.log('Mot de passe (en clair):', 'merchant123');
    
  } catch (error) {
    console.error('Erreur lors de la création du commerçant de test:', error);
  }
};

// Fonction principale
const main = async () => {
  // Connexion à la base de données
  const conn = await connectDB();
  
  // Créer le commerçant de test
  await createTestMerchant();
  
  // Fermer la connexion
  await mongoose.connection.close();
  console.log('Connexion à la base de données fermée');
};

// Exécuter la fonction principale
main().catch(console.error);
