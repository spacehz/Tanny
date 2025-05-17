const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
      select: false,
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

// Middleware pour hacher le mot de passe avant de sauvegarder
merchantSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Méthode pour comparer les mots de passe
merchantSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) {
    console.error('Pas de mot de passe disponible pour la comparaison');
    return false;
  }
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Erreur lors de la comparaison du mot de passe:', error);
    return false;
  }
};

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;
