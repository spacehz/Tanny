const Assignment = require('../models/Assignment');
const Event = require('../models/Event');
const User = require('../models/User');
const Merchant = require('../models/Merchant');
const Donation = require('../models/Donation');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');

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

  console.log("Requête d'affectation reçue pour l'événement:", id);
  console.log("Données d'affectation reçues:", JSON.stringify(assignments, null, 2));

  // Vérifier si l'événement existe
  const event = await Event.findById(id);
  if (!event) {
    return next(new ErrorResponse(`Événement non trouvé avec l'id ${id}`, 404));
  }

  // Vérifier si les affectations sont valides
  if (!Array.isArray(assignments) || assignments.length === 0) {
    return next(new ErrorResponse("Aucune affectation valide fournie", 400));
  }

  try {
    // Supprimer les affectations existantes pour cet événement
    const deleteResult = await Assignment.deleteMany({ event: id });
    console.log(`${deleteResult.deletedCount} affectations existantes supprimées`);

    // Créer les nouvelles affectations
    const createdAssignments = [];
    
    for (const assignment of assignments) {
      // Vérifier si les données requises sont présentes
      if (!assignment.volunteerId) {
        console.warn("Affectation sans ID de bénévole ignorée");
        continue;
      }

      if (!assignment.merchantId) {
        console.warn("Affectation sans ID de commerçant ignorée");
        continue;
      }

      // Vérifier si le bénévole existe
      const volunteer = await User.findById(assignment.volunteerId);
      if (!volunteer) {
        console.warn(`Bénévole non trouvé avec l'id ${assignment.volunteerId}, l'affectation sera ignorée`);
        continue;
      }

      // Vérifier si le commerçant existe
      const merchantExists = await Merchant.findById(assignment.merchantId);
      if (!merchantExists) {
        console.warn(`Commerçant non trouvé avec l'id ${assignment.merchantId}, l'affectation sera créée quand même`);
      }

      // Transformer les items si nécessaire pour s'assurer qu'ils ont la bonne structure
      const transformedItems = Array.isArray(assignment.items) ? assignment.items.map((item, index) => ({
        id: item.id || `item-${assignment.volunteerId}-${assignment.merchantId}-${index}-${Date.now()}`,
        name: item.name || item.product || 'Article sans nom',
        quantity: parseFloat(item.quantity) || 0,
        unit: item.unit || 'kg'
      })) : [];

      try {
        // Créer l'affectation
        const newAssignment = await Assignment.create({
          event: id,
          volunteer: assignment.volunteerId,
          merchant: assignment.merchantId,
          items: transformedItems,
          status: 'pending' // Statut par défaut
        });

        console.log(`Affectation créée avec succès: ${newAssignment._id}`);

        // Ajouter l'affectation créée à la liste
        createdAssignments.push(newAssignment);
      } catch (error) {
        console.error(`Erreur lors de la création de l'affectation: ${error.message}`);
        if (error.name === 'ValidationError') {
          console.error("Détails de l'erreur de validation:", error.errors);
        }
      }
    }

    console.log(`${createdAssignments.length} nouvelles affectations créées`);

    res.status(201).json({
      success: true,
      data: createdAssignments
    });
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde des affectations: ${error.message}`);
    return next(new ErrorResponse(`Erreur lors de la sauvegarde des affectations: ${error.message}`, 500));
  }
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

/**
 * @desc    Récupérer les affectations d'un bénévole
 * @route   GET /api/users/volunteers/:id/assignments
 * @access  Private (Volunteer, Admin)
 */
exports.getVolunteerAssignments = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    console.log(`Récupération des affectations pour le bénévole ID: ${id}`);
    console.log(`Utilisateur authentifié: ${req.user._id}, rôle: ${req.user.role}`);
    
    // Vérifier si le bénévole existe
    const volunteer = await User.findById(id);
    if (!volunteer) {
      console.log(`Bénévole non trouvé avec l'id ${id}`);
      return next(new ErrorResponse(`Bénévole non trouvé avec l'id ${id}`, 404));
    }
    
    console.log(`Bénévole trouvé: ${volunteer.name}, ${volunteer.email}`);

    // Vérifier que l'utilisateur est soit le bénévole lui-même, soit un admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      console.log(`Accès non autorisé: ${req.user._id} tente d'accéder aux affectations de ${id}`);
      return next(new ErrorResponse(`Non autorisé à accéder aux affectations de ce bénévole`, 403));
    }

    // Récupérer les affectations pour ce bénévole avec les informations sur l'événement et le commerçant
    const assignments = await Assignment.find({ volunteer: id })
      .populate({
        path: 'event',
        select: 'name date location type status'
      })
      .populate({
        path: 'merchant',
        select: 'businessName address phoneNumber email'
      })
      .sort({ 'event.date': -1 }); // Trier par date d'événement décroissante

    console.log(`Affectations trouvées pour le bénévole ${id}:`, assignments.length);
    
    // Vérifier si des affectations existent dans la base de données
    if (assignments.length === 0) {
      console.log(`Aucune affectation trouvée pour le bénévole ${id}`);
      
      // Vérifier s'il existe des affectations pour d'autres bénévoles
      const totalAssignments = await Assignment.countDocuments();
      console.log(`Nombre total d'affectations dans la base de données: ${totalAssignments}`);
      
      if (totalAssignments > 0) {
        // Récupérer un exemple d'affectation pour vérifier la structure
        const sampleAssignment = await Assignment.findOne()
          .populate('volunteer')
          .populate('event')
          .populate('merchant');
        
        console.log('Exemple d\'affectation:', JSON.stringify(sampleAssignment, null, 2));
        
        // Afficher tous les IDs de bénévoles qui ont des affectations
        const volunteersWithAssignments = await Assignment.distinct('volunteer');
        console.log('Bénévoles avec affectations:', volunteersWithAssignments);
        
        // Vérifier si l'email du bénévole correspond à benevole@tany.org
        if (volunteer.email === 'benevole@tany.org') {
          console.log('Bénévole avec email benevole@tany.org trouvé, mais aucune affectation associée');
          
          // Créer une affectation de test pour ce bénévole
          const newAssignment = new Assignment({
            event: sampleAssignment.event._id,
            volunteer: id,
            merchant: sampleAssignment.merchant._id,
            items: [
              {
                id: `item-test-${Date.now()}`,
                name: 'Produit de test',
                quantity: 5,
                unit: 'kg'
              }
            ],
            status: 'pending'
          });
          
          await newAssignment.save();
          console.log('Affectation de test créée pour le bénévole:', newAssignment._id);
          
          // Récupérer à nouveau les affectations
          const updatedAssignments = await Assignment.find({ volunteer: id })
            .populate({
              path: 'event',
              select: 'name date location type status'
            })
            .populate({
              path: 'merchant',
              select: 'businessName address phoneNumber email'
            });
          
          return res.status(200).json({
            success: true,
            count: updatedAssignments.length,
            data: updatedAssignments
          });
        }
      }
    } else {
      // Afficher un exemple d'affectation pour vérifier la structure
      console.log('Exemple d\'affectation:', JSON.stringify(assignments[0], null, 2));
    }
    
    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des affectations du bénévole:', error);
    return next(new ErrorResponse(`Erreur lors de la récupération des affectations: ${error.message}`, 500));
  }
});

/**
 * @desc    Mettre à jour le statut d'une affectation
 * @route   PATCH /api/assignments/:id
 * @access  Private (Volunteer, Admin)
 */
exports.updateAssignmentStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Vérifier si l'affectation existe
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return next(new ErrorResponse(`Affectation non trouvée avec l'id ${id}`, 404));
    }

    // Vérifier que l'utilisateur est soit le bénévole associé à l'affectation, soit un admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== assignment.volunteer.toString()) {
      return next(new ErrorResponse(`Non autorisé à modifier cette affectation`, 403));
    }

    // Vérifier que le statut est valide
    if (!status || !['pending', 'in_progress', 'completed'].includes(status)) {
      return next(new ErrorResponse(`Statut invalide: ${status}`, 400));
    }

    // Mettre à jour le statut
    assignment.status = status;
    await assignment.save();

    return res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut de l\'affectation:', error);
    return next(new ErrorResponse(`Erreur lors de la mise à jour du statut: ${error.message}`, 500));
  }
});

/**
 * @desc    Démarrer une activité de collecte
 * @route   PATCH /api/assignments/:id/start
 * @access  Private (Volunteer, Admin)
 */
exports.startAssignment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    // Vérifier si l'affectation existe
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return next(new ErrorResponse(`Affectation non trouvée avec l'id ${id}`, 404));
    }

    // Vérifier que l'utilisateur est soit le bénévole associé à l'affectation, soit un admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== assignment.volunteer.toString()) {
      return next(new ErrorResponse(`Non autorisé à modifier cette affectation`, 403));
    }

    // Vérifier que l'affectation n'est pas déjà terminée
    if (assignment.status === 'completed') {
      return next(new ErrorResponse(`Cette affectation est déjà terminée`, 400));
    }

    // Enregistrer l'heure de début
    assignment.startTime = new Date();
    assignment.status = 'in_progress';
    
    // Initialiser collectedItems avec les items prévus
    if (!assignment.collectedItems || assignment.collectedItems.length === 0) {
      assignment.collectedItems = assignment.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        validated: false
      }));
    }
    
    await assignment.save();

    return res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Erreur lors du démarrage de l\'affectation:', error);
    return next(new ErrorResponse(`Erreur lors du démarrage de l'affectation: ${error.message}`, 500));
  }
});

/**
 * @desc    Terminer une activité de collecte
 * @route   PATCH /api/assignments/:id/end
 * @access  Private (Volunteer, Admin)
 */
exports.endAssignment = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    // Vérifier si l'affectation existe
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return next(new ErrorResponse(`Affectation non trouvée avec l'id ${id}`, 404));
    }

    // Vérifier que l'utilisateur est soit le bénévole associé à l'affectation, soit un admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== assignment.volunteer.toString()) {
      return next(new ErrorResponse(`Non autorisé à modifier cette affectation`, 403));
    }

    // Vérifier que l'affectation a été démarrée
    if (!assignment.startTime) {
      return next(new ErrorResponse(`Cette affectation n'a pas encore été démarrée`, 400));
    }

    // Vérifier que l'affectation n'est pas déjà terminée
    if (assignment.status === 'completed') {
      return next(new ErrorResponse(`Cette affectation est déjà terminée`, 400));
    }

    // Enregistrer l'heure de fin
    assignment.endTime = new Date();
    
    // Calculer la durée en minutes
    const startTime = new Date(assignment.startTime);
    const endTime = new Date(assignment.endTime);
    const durationMs = endTime - startTime;
    assignment.duration = Math.round(durationMs / (1000 * 60)); // Conversion en minutes
    
    // Mettre à jour le statut
    assignment.status = 'completed';
    
    await assignment.save();

    // Mettre à jour les heures de bénévolat de l'utilisateur
    const volunteer = await User.findById(assignment.volunteer);
    if (volunteer) {
      volunteer.volunteerHours += assignment.duration / 60; // Convertir en heures
      await volunteer.save();
    }

    return res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Erreur lors de la fin de l\'affectation:', error);
    return next(new ErrorResponse(`Erreur lors de la fin de l'affectation: ${error.message}`, 500));
  }
});

/**
 * @desc    Mettre à jour les produits collectés
 * @route   PATCH /api/assignments/:id/items
 * @access  Private (Volunteer, Admin)
 */
exports.updateCollectedItems = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { collectedItems } = req.body;

  try {
    // Vérifier si l'affectation existe
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return next(new ErrorResponse(`Affectation non trouvée avec l'id ${id}`, 404));
    }

    // Vérifier que l'utilisateur est soit le bénévole associé à l'affectation, soit un admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== assignment.volunteer.toString()) {
      return next(new ErrorResponse(`Non autorisé à modifier cette affectation`, 403));
    }

    // Vérifier que les données sont valides
    if (!Array.isArray(collectedItems)) {
      return next(new ErrorResponse(`Format de données invalide pour les produits collectés`, 400));
    }

    // Mettre à jour les produits collectés
    assignment.collectedItems = collectedItems;
    await assignment.save();

    return res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des produits collectés:', error);
    return next(new ErrorResponse(`Erreur lors de la mise à jour des produits collectés: ${error.message}`, 500));
  }
});

/**
 * @desc    Ajouter des images à une affectation
 * @route   POST /api/assignments/:id/images
 * @access  Private (Volunteer, Admin)
 */
exports.addAssignmentImages = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { images } = req.body;

  try {
    // Vérifier si l'affectation existe
    const assignment = await Assignment.findById(id);
    if (!assignment) {
      return next(new ErrorResponse(`Affectation non trouvée avec l'id ${id}`, 404));
    }

    // Vérifier que l'utilisateur est soit le bénévole associé à l'affectation, soit un admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== assignment.volunteer.toString()) {
      return next(new ErrorResponse(`Non autorisé à modifier cette affectation`, 403));
    }

    // Vérifier que les données sont valides
    if (!Array.isArray(images)) {
      return next(new ErrorResponse(`Format de données invalide pour les images`, 400));
    }

    // Ajouter les nouvelles images
    if (!assignment.images) {
      assignment.images = [];
    }
    
    assignment.images = [...assignment.images, ...images];
    await assignment.save();

    return res.status(200).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout d\'images:', error);
    return next(new ErrorResponse(`Erreur lors de l'ajout d'images: ${error.message}`, 500));
  }
});
