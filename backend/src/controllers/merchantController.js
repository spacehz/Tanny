const Merchant = require('../models/Merchant');
const asyncHandler = require('express-async-handler');

// @desc    Créer un nouveau commerçant
// @route   POST /api/merchants
// @access  Private/Admin
const createMerchant = asyncHandler(async (req, res) => {
  const {
    businessName,
    legalRepresentative,
    email,
    phoneNumber,
    siret,
    address
  } = req.body;

  const merchantExists = await Merchant.findOne({ siret });

  if (merchantExists) {
    res.status(400);
    throw new Error('Un commerçant avec ce numéro SIRET existe déjà');
  }

  const merchant = await Merchant.create({
    businessName,
    legalRepresentative,
    email,
    phoneNumber,
    siret,
    address
  });

  if (merchant) {
    res.status(201).json(merchant);
  } else {
    res.status(400);
    throw new Error('Données de commerçant invalides');
  }
});

// @desc    Obtenir tous les commerçants
// @route   GET /api/merchants
// @access  Private/Admin
const getMerchants = asyncHandler(async (req, res) => {
  const merchants = await Merchant.find({});
  res.json(merchants);
});

// @desc    Obtenir un commerçant par ID
// @route   GET /api/merchants/:id
// @access  Private/Admin
const getMerchantById = asyncHandler(async (req, res) => {
  const merchant = await Merchant.findById(req.params.id);

  if (merchant) {
    res.json(merchant);
  } else {
    res.status(404);
    throw new Error('Commerçant non trouvé');
  }
});

// @desc    Mettre à jour un commerçant
// @route   PUT /api/merchants/:id
// @access  Private/Admin
const updateMerchant = asyncHandler(async (req, res) => {
  const merchant = await Merchant.findById(req.params.id);

  if (merchant) {
    merchant.businessName = req.body.businessName || merchant.businessName;
    merchant.legalRepresentative = req.body.legalRepresentative || merchant.legalRepresentative;
    merchant.email = req.body.email || merchant.email;
    merchant.phoneNumber = req.body.phoneNumber || merchant.phoneNumber;
    merchant.siret = req.body.siret || merchant.siret;
    merchant.address = req.body.address || merchant.address;
    merchant.isActive = req.body.isActive !== undefined ? req.body.isActive : merchant.isActive;

    const updatedMerchant = await merchant.save();
    res.json(updatedMerchant);
  } else {
    res.status(404);
    throw new Error('Commerçant non trouvé');
  }
});

// @desc    Supprimer un commerçant
// @route   DELETE /api/merchants/:id
// @access  Private/Admin
const deleteMerchant = asyncHandler(async (req, res) => {
  const merchant = await Merchant.findById(req.params.id);

  if (merchant) {
    await merchant.deleteOne();
    res.json({ message: 'Commerçant supprimé' });
  } else {
    res.status(404);
    throw new Error('Commerçant non trouvé');
  }
});

module.exports = {
  createMerchant,
  getMerchants,
  getMerchantById,
  updateMerchant,
  deleteMerchant,
};
