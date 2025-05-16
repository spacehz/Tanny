const Event = require('../models/Event');
const User = require('../models/User');

/**
 * @desc    Créer un nouvel événement
 * @route   POST /api/events
 * @access  Privé/Admin
 */
const createEvent = async (req, res) => {
  try {
    const {
      title,
      start,
      end,
      type,
      description,
      location,
      merchantId,
      expectedVolunteers,
      duration,
      numberOfStands,
      volunteers,
    } = req.body;

    // Vérifier que les dates sont valides
    if (new Date(start) > new Date(end)) {
      return res.status(400).json({
        message: 'La date de début doit être antérieure à la date de fin',
      });
    }

    // Créer l'événement
    const eventData = {
      title,
      start,
      end,
      type,
      description,
      location,
      expectedVolunteers, // Utilisé pour tous les types d'événements
      volunteers,
    };
    
    // Ajouter merchantId seulement s'il est défini et non vide (uniquement pour les collectes)
    if (type === 'collecte' && merchantId && merchantId.trim() !== '') {
      eventData.merchantId = merchantId;
    }
    
    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'événement:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Récupérer tous les événements
 * @route   GET /api/events
 * @access  Privé
 */
const getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('merchantId', 'name businessName')
      .populate('volunteers', 'name email');

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

/**
 * @desc    Récupérer un événement par son ID
 * @route   GET /api/events/:id
 * @access  Privé
 */
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('merchantId', 'name businessName')
      .populate('volunteers', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

/**
 * @desc    Mettre à jour un événement
 * @route   PUT /api/events/:id
 * @access  Privé/Admin
 */
const updateEvent = async (req, res) => {
  try {
    const {
      title,
      start,
      end,
      type,
      description,
      location,
      merchantId,
      expectedVolunteers,
      duration,
      numberOfStands,
      volunteers,
    } = req.body;

    // Vérifier que les dates sont valides
    if (new Date(start) > new Date(end)) {
      return res.status(400).json({
        message: 'La date de début doit être antérieure à la date de fin',
      });
    }

    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé',
      });
    }

    // Préparer les données pour la mise à jour
    const updateData = {
      title,
      start,
      end,
      type,
      description,
      location,
      expectedVolunteers, // Utilisé pour tous les types d'événements
      volunteers,
    };
    
    // Ajouter merchantId seulement s'il est défini et non vide (uniquement pour les collectes)
    if (type === 'collecte' && merchantId && merchantId.trim() !== '') {
      updateData.merchantId = merchantId;
    } else if (type === 'collecte') {
      // Si le type est collecte mais merchantId est vide, définir à null explicitement
      updateData.merchantId = null;
    } else {
      // Si le type est marché, définir à undefined pour le supprimer
      updateData.merchantId = undefined;
    }
    
    // Mettre à jour l'événement
    event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'événement:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Supprimer un événement
 * @route   DELETE /api/events/:id
 * @access  Privé/Admin
 */
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé',
      });
    }

    await event.remove();

    res.status(200).json({
      success: true,
      message: 'Événement supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
};

/**
 * @desc    Inscrire un bénévole à un événement
 * @route   POST /api/events/:id/register
 * @access  Privé
 */
const registerForEvent = async (req, res) => {
  try {
    console.log(`[DEBUG] Début de l'inscription à l'événement ${req.params.id} pour l'utilisateur ${req.user._id}`);
    
    const event = await Event.findById(req.params.id);

    if (!event) {
      console.log(`[DEBUG] Événement ${req.params.id} non trouvé`);
      return res.status(404).json({
        message: 'Événement non trouvé',
      });
    }

    console.log(`[DEBUG] Événement trouvé: ${event.title}`);
    console.log(`[DEBUG] Nombre de bénévoles avant inscription: ${event.volunteers.length}`);
    console.log(`[DEBUG] Nombre de places attendues: ${event.expectedVolunteers}`);
    console.log(`[DEBUG] Liste des bénévoles avant inscription:`, event.volunteers);

    // Vérifier si l'utilisateur est déjà inscrit
    const isUserRegistered = event.volunteers.some(id => 
      id.toString() === req.user._id.toString()
    );
    
    if (isUserRegistered) {
      console.log(`[DEBUG] L'utilisateur ${req.user._id} est déjà inscrit à l'événement ${req.params.id}`);
      return res.status(400).json({
        message: 'Vous êtes déjà inscrit à cet événement',
      });
    }

    // Vérifier si l'événement est complet
    if (event.volunteers.length >= event.expectedVolunteers) {
      console.log(`[DEBUG] L'événement ${req.params.id} est complet (${event.volunteers.length}/${event.expectedVolunteers})`);
      return res.status(400).json({
        message: 'Cet événement est complet',
      });
    }

    // Ajouter l'utilisateur aux bénévoles de l'événement
    event.volunteers.push(req.user._id);
    console.log(`[DEBUG] Utilisateur ${req.user._id} ajouté à la liste des bénévoles`);
    console.log(`[DEBUG] Nombre de bénévoles après ajout: ${event.volunteers.length}`);
    
    await event.save();
    console.log(`[DEBUG] Événement sauvegardé avec succès`);

    // Récupérer l'événement mis à jour avec les informations des bénévoles
    const updatedEvent = await Event.findById(req.params.id)
      .populate('merchantId', 'name businessName')
      .populate('volunteers', 'name email');

    console.log(`[DEBUG] Événement récupéré après sauvegarde`);
    console.log(`[DEBUG] Nombre final de bénévoles: ${updatedEvent.volunteers.length}`);
    
    res.status(200).json({
      message: 'Inscription réussie',
      data: updatedEvent,
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription à l\'événement:', error);
    res.status(500).json({
      message: 'Erreur lors de l\'inscription à l\'événement',
      error: error.message,
    });
  }
};

/**
 * @desc    Désinscrire un bénévole d'un événement
 * @route   POST /api/events/:id/unregister
 * @access  Privé
 */
const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        message: 'Événement non trouvé',
      });
    }

    // Vérifier si l'utilisateur est inscrit
    if (!event.volunteers.includes(req.user._id)) {
      return res.status(400).json({
        message: 'Vous n\'êtes pas inscrit à cet événement',
      });
    }

    // Retirer l'utilisateur des bénévoles de l'événement
    event.volunteers = event.volunteers.filter(
      (volunteerId) => volunteerId.toString() !== req.user._id.toString()
    );
    await event.save();

    // Récupérer l'événement mis à jour avec les informations des bénévoles
    const updatedEvent = await Event.findById(req.params.id)
      .populate('merchantId', 'name businessName')
      .populate('volunteers', 'name email');

    res.status(200).json({
      message: 'Désinscription réussie',
      data: updatedEvent,
    });
  } catch (error) {
    console.error('Erreur lors de la désinscription de l\'événement:', error);
    res.status(500).json({
      message: 'Erreur lors de la désinscription de l\'événement',
      error: error.message,
    });
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
};
