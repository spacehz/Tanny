const mongoose = require('mongoose');

/**
 * Modèle de données pour les dons des commerçants
 * Chaque don est associé à un commerçant et à un événement
 * et contient une liste d'articles avec leurs quantités
 */
const donationSchema = new mongoose.Schema(
  {
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    items: [
      {
        product: {
          type: String,
          required: true,
          trim: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 0.1
        },
        unit: {
          type: String,
          enum: ['kg', 'g', 'l', 'unité'],
          default: 'kg'
        }
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'collected', 'cancelled'],
      default: 'pending'
    },
    note: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;
