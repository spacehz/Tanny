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
          required: false // Rendre l'ID optionnel
        },
        name: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 0 // Permettre des quantités à partir de 0
        },
        unit: {
          type: String,
          enum: ['kg', 'g', 'l', 'unité', 'ml', 'pièce'], // Ajouter plus d'unités possibles
          default: 'kg'
        }
      }
    ],
    // Nouveaux champs pour le suivi des collectes
    startTime: {
      type: Date,
      default: null
    },
    endTime: {
      type: Date,
      default: null
    },
    duration: {
      type: Number, // Durée en minutes
      default: 0
    },
    collectedItems: [
      {
        id: {
          type: String,
          required: false
        },
        name: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 0
        },
        unit: {
          type: String,
          enum: ['kg', 'g', 'l', 'unité', 'ml', 'pièce'],
          default: 'kg'
        },
        validated: {
          type: Boolean,
          default: false
        }
      }
    ],
    images: [
      {
        url: {
          type: String,
          required: true
        },
        description: {
          type: String,
          default: ''
        },
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
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
