const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Veuillez fournir un nom'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Veuillez fournir un email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Veuillez fournir un email valide',
      ],
    },
    password: {
      type: String,
      required: [true, 'Veuillez fournir un mot de passe'],
      minlength: [4, 'Le mot de passe doit contenir au moins 4 caractères'],
      select: false,
    },
    role: {
      type: String,
      enum: ['admin', 'bénévole', 'commercant'],
      default: 'bénévole',
    },
    availability: {
      type: String,
      enum: ['oui', 'non'],
      default: 'oui',
    },
    absencePeriod: {
      startDate: {
        type: Date,
        default: null
      },
      endDate: {
        type: Date,
        default: null
      }
    },
    volunteerHours: {
      type: Number,
      default: 0
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    businessName: {
      type: String,
      trim: true,
    },

  },
  {
    timestamps: true,
  }
);

// Middleware pour hacher le mot de passe avant de sauvegarder
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
