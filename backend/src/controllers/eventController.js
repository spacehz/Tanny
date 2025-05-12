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
      expectedVolunteers: type === 'collecte' ? expectedVolunteers : undefined,
      duration: type === 'marché' ? duration : undefined,
      numberOfStands: type === 'marché' ? numberOfStands : undefined,
      volunteers,
    };
    
    // Ajouter merchantId seulement s'il est défini et non vide
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
      expectedVolunteers: type === 'collecte' ? expectedVolunteers : undefined,
      duration: type === 'marché' ? duration : undefined,
      numberOfStands: type === 'marché' ? numberOfStands : undefined,
      volunteers,
    };
    
    // Ajouter merchantId seulement s'il est défini et non vide
    if (type === 'collecte' && merchantId && merchantId.trim() !== '') {
      updateData.merchantId = merchantId;
    } else if (type === 'collecte') {
      // Si le type est collecte mais merchantId est vide, définir à null explicitement
      updateData.merchantId = null;
    } else {
      // Si le type n'est pas collecte, définir à undefined pour le supprimer
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

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
