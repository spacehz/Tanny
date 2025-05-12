const mongoose = require('mongoose');

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

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;
