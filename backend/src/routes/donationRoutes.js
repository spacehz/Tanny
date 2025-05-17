const express = require('express');
const router = express.Router();
const {
  createDonation,
  getDonations,
  getMerchantDonations,
  getEventDonations,
  getDonationById,
  updateDonationStatus,
  deleteDonation
} = require('../controllers/donationController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes publiques
// Aucune pour le moment

// Routes protégées (nécessitent une authentification)
router.route('/')
  .post(protect, createDonation)
  .get(protect, admin, getDonations);

router.route('/merchant')
  .get(protect, getMerchantDonations);

router.route('/event/:eventId')
  .get(protect, admin, getEventDonations);

router.route('/:id')
  .get(protect, getDonationById)
  .delete(protect, deleteDonation);

router.route('/:id/status')
  .put(protect, admin, updateDonationStatus);

module.exports = router;
