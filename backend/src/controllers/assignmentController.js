const Assignment = require('../models/Assignment');
const Event = require('../models/Event');
const User = require('../models/User');
const Donation = require('../models/Donation');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Récupérer les affectations pour un événement
 * @route   GET /api/events/:id/assignments
 * @access  Private (Admin)
 */
exports.getEventAssignments = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Vérifier si l'événement existe
  const event = await Event.findById(id);
  if (!event) {
    return next(new ErrorResponse(`Événement non trouvé avec l'id ${id}`, 404));
  }

  // Récupérer les affectations pour cet événement
  const assignments = await Assignment.find({ event: id })
    .populate('volunteer', 'name email')
    .populate('merchant', 'businessName address');

  res.status(200).json({
    success: true,
    data: assignments
  });
});

/**
 * @desc    Créer ou mettre à jour les affectations pour un événement
 * @route   POST /api/events/:id/assignments
 * @access  Private (Admin)
 */
exports.saveEventAssignments = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { assignments } = req.body;

  // Vérifier si l'événement existe
  const event = await Event.findById(id);
  if (!event) {
    return next(new ErrorResponse(`Événement non trouvé avec l'id ${id}`, 404));
  }

  // Supprimer les affectations existantes pour cet événement
  await Assignment.deleteMany({ event: id });

  // Créer les nouvelles affectations
  const createdAssignments = [];
  
  for (const assignment of assignments) {
    // Vérifier si le bénévole existe
    const volunteer = await User.findById(assignment.volunteerId);
    if (!volunteer) {
      return next(new ErrorResponse(`Bénévole non trouvé avec l'id ${assignment.volunteerId}`, 404));
    }

    // Créer l'affectation
    const newAssignment = await Assignment.create({
      event: id,
      volunteer: assignment.volunteerId,
      merchant: assignment.merchantId,
      items: assignment.items
    });

    // Ajouter l'affectation créée à la liste
    createdAssignments.push(newAssignment);
  }

  res.status(201).json({
    success: true,
    data: createdAssignments
  });
});

/**
 * @desc    Récupérer les bénévoles participant à un événement
 * @route   GET /api/events/:id/volunteers
 * @access  Private (Admin)
 */
exports.getEventVolunteers = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    // Vérifier si l'événement existe
    const event = await Event.findById(id);
    if (!event) {
      return next(new ErrorResponse(`Événement non trouvé avec l'id ${id}`, 404));
    }

    // Récupérer les bénévoles associés à cet événement
    if (event.volunteers && event.volunteers.length > 0) {
      // Si l'événement a des bénévoles associés, les récupérer
      const volunteers = await User.find({
        _id: { $in: event.volunteers },
        role: 'bénévole'
      }).select('name email phoneNumber');

      return res.status(200).json({
        success: true,
        data: volunteers
      });
    } else {
      // Si aucun bénévole n'est associé, retourner un tableau vide
      return res.status(200).json({
        success: true,
        data: []
      });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des bénévoles:', error);
    return next(new ErrorResponse(`Erreur lors de la récupération des bénévoles: ${error.message}`, 500));
  }
});

/**
 * @desc    Récupérer les commerçants participant à un événement
 * @route   GET /api/events/:id/merchants
 * @access  Private (Admin)
 */
exports.getEventMerchants = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    // Vérifier si l'événement existe
    const event = await Event.findById(id);
    if (!event) {
      return next(new ErrorResponse(`Événement non trouvé avec l'id ${id}`, 404));
    }

    // Si l'événement a des commerçants associés
    if (event.merchants && event.merchants.length > 0) {
      // Récupérer le premier commerçant pour la compatibilité avec le code existant
      const merchant = await Merchant.findById(event.merchants[0])
        .select('businessName email address phoneNumber');

      if (merchant) {
        return res.status(200).json({
          success: true,
          data: [merchant]
        });
      }
    }

    // Sinon, récupérer les donations pour cet événement pour identifier les commerçants participants
    const donations = await Donation.find({ event: id }).populate({
      path: 'merchant',
      select: 'businessName address phoneNumber email'
    });
    
    if (donations.length > 0) {
      // Extraire les commerçants uniques
      const merchants = donations
        .map(donation => donation.merchant)
        .filter((merchant, index, self) => 
          merchant && index === self.findIndex(m => m && m._id.toString() === merchant._id.toString())
        );

      return res.status(200).json({
        success: true,
        data: merchants
      });
    }

    // Si aucun commerçant n'est trouvé, récupérer tous les commerçants
    const allMerchants = await User.find({ role: 'commercant' })
      .select('name email businessName address phoneNumber')
      .limit(10);

    return res.status(200).json({
      success: true,
      data: allMerchants
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commerçants:', error);
    return next(new ErrorResponse(`Erreur lors de la récupération des commerçants: ${error.message}`, 500));
  }
});

/**
 * @desc    Récupérer les donations pour un événement
 * @route   GET /api/events/:id/donations
 * @access  Private (Admin)
 */
exports.getEventDonations = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    // Vérifier si l'événement existe
    const event = await Event.findById(id);
    if (!event) {
      return next(new ErrorResponse(`Événement non trouvé avec l'id ${id}`, 404));
    }

    // Récupérer les donations pour cet événement
    const donations = await Donation.find({ event: id }).populate({
      path: 'merchant',
      select: 'businessName address phoneNumber email'
    });

    // Si aucune donation n'est trouvée, retourner un tableau vide
    if (!donations || donations.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      data: donations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des donations:', error);
    return next(new ErrorResponse(`Erreur lors de la récupération des donations: ${error.message}`, 500));
  }
});
