const Merchant = require('../models/Merchant');
const asyncHandler = require('express-async-handler');

// @desc    Créer un nouveau commerçant
// @route   POST /api/merchants
// @access  Public
const createMerchant = asyncHandler(async (req, res) => {
  const {
    businessName,
    legalRepresentative,
    email,
    phoneNumber,
    siret,
    address,
    password
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
    address,
    password
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
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const isActive = req.query.isActive !== undefined ? 
      req.query.isActive === 'true' : null;
    
    // Construire le filtre de recherche
    let filter = {};
    
    // Ajouter la recherche si présente
    if (search) {
      filter.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { 'legalRepresentative.firstName': { $regex: search, $options: 'i' } },
        { 'legalRepresentative.lastName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { siret: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Ajouter le filtre de statut si présent
    if (isActive !== null) {
      filter.isActive = isActive;
    }
    
    const merchants = await Merchant.find(filter)
      .skip(skip)
      .limit(limit);
    
    const total = await Merchant.countDocuments(filter);
    
    res.json({
      merchants,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commerçants:', error);
    res.status(500);
    throw new Error('Erreur serveur');
  }
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
    
    if (req.body.password) {
      merchant.password = req.body.password;
    }

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
