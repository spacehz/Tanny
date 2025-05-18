const mongoose = require('mongoose');

/**
 * Modèle de données pour les affectations des bénévoles aux commerçants
 * Chaque affectation est associée à un bénévole, un commerçant et un événement
 * et contient une liste d'articles à collecter avec leurs quantités
 */
const assignmentSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true
    },
    items: [
      {
        id: {
          type: String,
          required: true
        },
        name: {
          type: String,
          required: true
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
      enum: ['pending', 'completed'],
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

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
