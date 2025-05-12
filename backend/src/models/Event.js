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
      enum: ['collecte', 'marché'],
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
    // Champs pour les collectes
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    expectedVolunteers: {
      type: Number,
      default: 1,
      min: [1, 'Au moins un bénévole est requis'],
    },
    // Champs pour les marchés
    duration: {
      type: String,
      trim: true,
    },
    numberOfStands: {
      type: Number,
      default: 1,
      min: [1, 'Au moins un stand est requis'],
    },
    // Bénévoles participants
    volunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
