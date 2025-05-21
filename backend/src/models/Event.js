const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre de l\'événement est requis'],
      trim: true,
    },
    start: {
      type: Date,
      required: [true, 'La date de début est requise'],
    },
    end: {
      type: Date,
      required: [true, 'La date de fin est requise'],
    },
    type: {
      type: String,
      required: [true, 'Le type d\'événement est requis'],
      enum: ['collecte', 'marché', 'réunion', 'formation'],
      default: 'collecte',
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    // Champ pour les collectes - liste des commerçants participants
    merchants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
    }],
    // Champ commun pour tous les types d'événements
    expectedVolunteers: {
      type: Number,
      default: 1,
      min: 1,
    },
    // Bénévoles participants
    volunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Champs pour les marchés
    numberOfStands: {
      type: Number,
      default: 1,
      min: 1,
    },
    // Champ pour la durée (calculée automatiquement)
    duration: {
      type: String,
      trim: true,
    },
    // Nouveaux champs pour la récurrence
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurrence: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: 'weekly'
      },
      interval: {
        type: Number,
        default: 1,
        min: 1
      },
      count: {
        type: Number,
        min: 0  // 0 signifie pas de limite
      },
      until: {
        type: Date
      },
      byMonthDay: {
        type: Number,
        min: 1,
        max: 31
      },
      byMonth: {
        type: Number,
        min: 1,
        max: 12
      }
    },
    // Pour les événements récurrents, référence à l'événement parent
    parentEventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    }
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
