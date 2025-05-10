const express = require('express');
const { check } = require('express-validator');
const productController = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation pour la création de produit
const productValidation = [
  check('name', 'Le nom du produit est requis').not().isEmpty(),
  check('description', 'La description du produit est requise').not().isEmpty(),
  check('quantity', 'La quantité doit être un nombre positif').isNumeric().isFloat({ min: 0 }),
  check('unit', 'L\'unité de mesure est requise').isIn(['kg', 'g', 'l', 'ml', 'unité']),
  check('expiryDate', 'La date d\'expiration est requise').isISO8601(),
  check('location', 'Le lieu de collecte est requis').not().isEmpty(),
];

// Routes publiques
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Routes protégées
router.post('/', protect, productValidation, productController.createProduct);
router.put('/:id', protect, productController.updateProduct);
router.delete('/:id', protect, productController.deleteProduct);
router.put('/:id/reserve', protect, productController.reserveProduct);

module.exports = router;
