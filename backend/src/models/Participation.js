const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema(
  {
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'cancelled', 'completed'],
      default: 'registered'
    },
    hoursLogged: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Index pour éviter les doublons (un bénévole ne peut s'inscrire qu'une fois à un événement)
participationSchema.index({ volunteer: 1, event: 1 }, { unique: true });

const Participation = mongoose.model('Participation', participationSchema);

module.exports = Participation;
