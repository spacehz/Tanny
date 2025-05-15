const express = require('express');
const router = express.Router();
const {
  createMerchant,
  getMerchants,
  getMerchantById,
  updateMerchant,
  deleteMerchant,
} = require('../controllers/merchantController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(createMerchant) // Allow public access for merchant registration
  .get(protect, admin, getMerchants);

router.route('/:id')
  .get(protect, admin, getMerchantById)
  .put(protect, admin, updateMerchant)
  .delete(protect, admin, deleteMerchant);

module.exports = router;
