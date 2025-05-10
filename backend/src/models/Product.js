const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom du produit est requis'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La description du produit est requise'],
    },
    quantity: {
      type: Number,
      required: [true, 'La quantité est requise'],
      min: [0, 'La quantité ne peut pas être négative'],
    },
    unit: {
      type: String,
      required: [true, "L'unité de mesure est requise"],
      enum: ['kg', 'g', 'l', 'ml', 'unité'],
    },
    expiryDate: {
      type: Date,
      required: [true, "La date d'expiration est requise"],
    },
    location: {
      type: String,
      required: [true, 'Le lieu de collecte est requis'],
    },
    status: {
      type: String,
      enum: ['disponible', 'réservé', 'collecté'],
      default: 'disponible',
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
