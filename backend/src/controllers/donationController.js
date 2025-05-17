const asyncHandler = require('express-async-handler');
const Donation = require('../models/Donation');
const Merchant = require('../models/Merchant');
const Event = require('../models/Event');

/**
 * @desc    Créer un nouveau don
 * @route   POST /api/donations
 * @access  Private/Merchant
 */
const createDonation = asyncHandler(async (req, res) => {
  const { eventId, items, note } = req.body;

  // Vérifier si l'événement existe
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Événement non trouvé');
  }

  // Vérifier si l'utilisateur est un commerçant
  if (!req.user || !req.user.isMerchant) {
    res.status(403);
    throw new Error('Accès non autorisé. Seuls les commerçants peuvent faire des dons.');
  }

  // Créer le don
  const donation = await Donation.create({
    merchant: req.user._id,
    event: eventId,
    items: items.map(item => ({
      product: item.product,
      quantity: item.quantity,
      unit: item.unit
    })),
    note: note || ''
  });

  if (donation) {
    res.status(201).json(donation);
  } else {
    res.status(400);
    throw new Error('Données de don invalides');
  }
});

/**
 * @desc    Obtenir tous les dons
 * @route   GET /api/donations
 * @access  Private/Admin
 */
const getDonations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const donations = await Donation.find({})
    .populate('merchant', 'businessName email')
    .populate('event', 'title start location')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Donation.countDocuments({});

  res.json({
    donations,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

/**
 * @desc    Obtenir les dons d'un commerçant
 * @route   GET /api/donations/merchant
 * @access  Private/Merchant
 */
const getMerchantDonations = asyncHandler(async (req, res) => {
  // Vérifier si l'utilisateur est un commerçant
  if (!req.user || !req.user.isMerchant) {
    res.status(403);
    throw new Error('Accès non autorisé');
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const donations = await Donation.find({ merchant: req.user._id })
    .populate('event', 'title start location')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Donation.countDocuments({ merchant: req.user._id });

  res.json({
    donations,
    page,
    pages: Math.ceil(total / limit),
    total
  });
});

/**
 * @desc    Obtenir les dons pour un événement
 * @route   GET /api/donations/event/:eventId
 * @access  Private/Admin
 */
const getEventDonations = asyncHandler(async (req, res) => {
  const eventId = req.params.eventId;

  // Vérifier si l'événement existe
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Événement non trouvé');
  }

  const donations = await Donation.find({ event: eventId })
    .populate('merchant', 'businessName email')
    .sort({ createdAt: -1 });

  res.json(donations);
});

/**
 * @desc    Obtenir un don par ID
 * @route   GET /api/donations/:id
 * @access  Private
 */
const getDonationById = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id)
    .populate('merchant', 'businessName email')
    .populate('event', 'title start location');

  if (donation) {
    // Vérifier si l'utilisateur est autorisé à voir ce don
    if (
      req.user.role === 'admin' || 
      (req.user.isMerchant && donation.merchant._id.toString() === req.user._id.toString())
    ) {
      res.json(donation);
    } else {
      res.status(403);
      throw new Error('Non autorisé à accéder à ce don');
    }
  } else {
    res.status(404);
    throw new Error('Don non trouvé');
  }
});

/**
 * @desc    Mettre à jour le statut d'un don
 * @route   PUT /api/donations/:id/status
 * @access  Private/Admin
 */
const updateDonationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const donation = await Donation.findById(req.params.id);

  if (donation) {
    donation.status = status || donation.status;

    const updatedDonation = await donation.save();
    res.json(updatedDonation);
  } else {
    res.status(404);
    throw new Error('Don non trouvé');
  }
});

/**
 * @desc    Supprimer un don
 * @route   DELETE /api/donations/:id
 * @access  Private
 */
const deleteDonation = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id);

  if (donation) {
    // Vérifier si l'utilisateur est autorisé à supprimer ce don
    if (
      req.user.role === 'admin' || 
      (req.user.isMerchant && donation.merchant.toString() === req.user._id.toString())
    ) {
      await donation.deleteOne();
      res.json({ message: 'Don supprimé' });
    } else {
      res.status(403);
      throw new Error('Non autorisé à supprimer ce don');
    }
  } else {
    res.status(404);
    throw new Error('Don non trouvé');
  }
});

module.exports = {
  createDonation,
  getDonations,
  getMerchantDonations,
  getEventDonations,
  getDonationById,
  updateDonationStatus,
  deleteDonation
};
