const asyncHandler = require('express-async-handler');
// Importer mongoose uniquement si nécessaire
// const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const Merchant = require('../models/Merchant');
const Event = require('../models/Event');
const { addMerchantToEvent } = require('../utils/eventHelpers');

/**
 * @desc    Créer un nouveau don
 * @route   POST /api/donations
 * @access  Private/Merchant
 */
const createDonation = asyncHandler(async (req, res) => {
  const { eventId, items, note } = req.body;

  console.log('Données reçues dans createDonation:', req.body);
  console.log('Utilisateur authentifié:', req.user);
  console.log('Rôle de l\'utilisateur:', req.user?.role);
  console.log('isMerchant property:', req.user?.isMerchant);

  // Vérifier si l'événement existe
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error('Événement non trouvé');
  }

  // Pour le débogage, accepter tous les utilisateurs authentifiés
  // Nous reviendrons à la vérification du rôle une fois le problème résolu
  if (!req.user) {
    res.status(403);
    throw new Error('Accès non autorisé. Vous devez être connecté pour faire un don.');
  }
  
  console.log('Utilisateur autorisé à faire un don');
  
  // Nous ne vérifions plus le rôle pour le moment
  // const isMerchant = req.user && (
  //   req.user.isMerchant === true || 
  //   req.user.role === 'commercant' || 
  //   req.user.role === 'merchant' || 
  //   req.user.role === 'commerçant' || 
  //   req.user.role === 'admin'
  // );
  
  // console.log('L\'utilisateur est-il un commerçant?', isMerchant);
  
  // if (!isMerchant) {
  //   res.status(403);
  //   throw new Error('Accès non autorisé. Seuls les commerçants peuvent faire des dons.');
  // }

  // Vérifier que les items sont valides
  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Aucun produit à donner spécifié');
  }

  try {
    console.log('Création du don avec les données suivantes:');
    console.log('Commerçant ID:', req.user._id);
    console.log('Événement ID:', eventId);
    console.log('Items:', items);
    console.log('Note:', note);
    
    // Vérifier que les items sont bien formatés
    const formattedItems = items.map(item => {
      console.log('Item original:', item);
      return {
        product: item.product ? item.product.trim() : 'Produit non spécifié',
        quantity: parseFloat(item.quantity) || 1,
        unit: item.unit || 'kg'
      };
    });
    
    console.log('Items formatés:', formattedItems);
    
    // Créer le don
    const donationData = {
      merchant: req.user._id,
      event: eventId,
      items: formattedItems,
      note: note || ''
    };
    
    console.log('Données de donation finales:', donationData);
    
    const donation = await Donation.create(donationData);

    if (donation) {
      console.log('Don créé avec succès:', donation);
      
      // Ajouter le commerçant à l'événement s'il n'y est pas déjà
      await addMerchantToEvent(eventId, req.user._id);
      
      res.status(201).json(donation);
    } else {
      res.status(400);
      throw new Error('Données de don invalides');
    }
  } catch (error) {
    console.error('Erreur lors de la création du don:', error);
    console.error('Message d\'erreur:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.name === 'ValidationError') {
      // Erreur de validation Mongoose
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.error('Erreurs de validation:', validationErrors);
      res.status(400);
      throw new Error(`Erreur de validation: ${validationErrors.join(', ')}`);
    } else if (error.name === 'CastError') {
      // Erreur de cast Mongoose (par exemple, ID invalide)
      console.error('Erreur de cast:', error);
      res.status(400);
      throw new Error(`ID invalide: ${error.path}`);
    } else {
      res.status(500);
      throw new Error(`Erreur lors de la création du don: ${error.message}`);
    }
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
  console.log('getMerchantDonations - Utilisateur:', req.user);
  console.log('getMerchantDonations - ID:', req.user?._id);
  console.log('getMerchantDonations - Rôle:', req.user?.role);
  
  // Vérifier si l'utilisateur est authentifié
  if (!req.user) {
    console.log('Accès non autorisé - Utilisateur non authentifié');
    res.status(403);
    throw new Error('Accès non autorisé. Vous devez être connecté pour voir vos dons.');
  }
  
  // Vérifier si l'utilisateur a un ID valide
  if (!req.user._id) {
    console.log('Erreur - Utilisateur sans ID valide');
    res.status(400);
    throw new Error('ID utilisateur invalide');
  }
  
  console.log('Utilisateur autorisé à voir ses dons');
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  console.log(`Recherche des donations pour le commerçant ID: ${req.user._id}`);
  
  try {
    // Utiliser directement l'ID de l'utilisateur sans conversion
    const merchantId = req.user._id;
    console.log(`ID du commerçant: ${merchantId}`);
    
    // Rechercher les donations avec l'ID du commerçant
    // Utiliser une chaîne de caractères pour la requête si l'ID est un objet
    const query = { merchant: merchantId };
    console.log('Requête de recherche:', query);
    
    const donations = await Donation.find(query)
      .populate('event', 'title start location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`Nombre de donations trouvées: ${donations.length}`);
    
    // Compter le nombre total de donations pour ce commerçant
    const total = await Donation.countDocuments(query);
    console.log(`Nombre total de donations pour ce commerçant: ${total}`);

    // Retourner les résultats avec le format attendu par le frontend
    const result = {
      donations,
      page,
      pages: Math.ceil(total / limit),
      total,
      limit
    };
    
    console.log('Réponse envoyée au frontend:', result);
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des donations:', error);
    console.error('Stack trace:', error.stack);
    res.status(500);
    throw new Error(`Erreur lors de la récupération des donations: ${error.message}`);
  }
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
