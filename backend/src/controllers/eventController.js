const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');
const eventStatusService = require('../services/eventStatusService');
const Merchant = require('../models/Merchant');

/**
 * Fonction utilitaire pour générer les événements récurrents
 */
const generateRecurringEvents = (mainEvent, recurrence) => {
  const occurrences = [];
  const startDate = new Date(mainEvent.start);
  const endDate = new Date(mainEvent.end);
  const duration = endDate - startDate; // Durée en millisecondes
  
  let currentDate = new Date(startDate);
  let count = 0;
  
  // Déterminer la date limite
  const untilDate = recurrence.until ? new Date(recurrence.until) : null;
  const maxCount = recurrence.count || Number.MAX_SAFE_INTEGER;
  
  // Calculer l'intervalle en millisecondes selon la fréquence
  let intervalMs = 0;
  switch (recurrence.frequency) {
    case 'daily':
      intervalMs = 24 * 60 * 60 * 1000 * recurrence.interval;
      break;
    case 'weekly':
      intervalMs = 7 * 24 * 60 * 60 * 1000 * recurrence.interval;
      break;
    case 'monthly':
      // Pour les occurrences mensuelles, on utilisera une logique différente
      break;
  }
  
  // Générer les occurrences
  while (count < maxCount) {
    // Passer à la prochaine occurrence
    if (recurrence.frequency === 'monthly') {
      // Logique pour les occurrences mensuelles
      currentDate = new Date(currentDate);
      currentDate.setMonth(currentDate.getMonth() + recurrence.interval);
      
      // Si byMonthDay est spécifié, définir le jour du mois
      if (recurrence.byMonthDay) {
        currentDate.setDate(Math.min(recurrence.byMonthDay, getDaysInMonth(currentDate.getMonth(), currentDate.getFullYear())));
      }
      
      // Si byMonth est spécifié, vérifier si le mois correspond
      if (recurrence.byMonth && currentDate.getMonth() + 1 !== recurrence.byMonth) {
        continue;
      }
    } else {
      // Pour daily et weekly, simplement ajouter l'intervalle
      currentDate = new Date(currentDate.getTime() + intervalMs);
    }
    
    // Vérifier si on a dépassé la date limite
    if (untilDate && currentDate > untilDate) {
      break;
    }
    
    // Créer l'occurrence
    const occurrenceEndDate = new Date(currentDate.getTime() + duration);
    
    occurrences.push({
      title: mainEvent.title,
      start: currentDate,
      end: occurrenceEndDate,
      type: mainEvent.type,
      description: mainEvent.description,
      location: mainEvent.location,
      expectedVolunteers: mainEvent.expectedVolunteers,
      duration: mainEvent.duration,
      numberOfStands: mainEvent.numberOfStands,
      merchants: mainEvent.merchants,
      parentEventId: mainEvent._id,
      isRecurring: false // Les occurrences ne sont pas récurrentes elles-mêmes
    });
    
    count++;
  }
  
  return occurrences;
};

// Fonction utilitaire pour obtenir le nombre de jours dans un mois
const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

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
      // Nouveaux champs pour la récurrence
      isRecurring,
      recurrence
    } = req.body;

    // Vérifier que les dates sont valides
    if (new Date(start) > new Date(end)) {
      return res.status(400).json({
        message: 'La date de début doit être antérieure à la date de fin',
      });
    }

    // Créer l'événement principal
    const eventData = {
      title,
      start,
      end,
      type,
      description,
      location,
      expectedVolunteers, // Utilisé pour tous les types d'événements
      volunteers,
      duration,
      isRecurring: isRecurring || false
    };
    
    // Ajouter les champs spécifiques au type d'événement
    if (type === 'collecte' && merchantId && merchantId.trim() !== '') {
      // Initialiser le tableau merchants s'il n'existe pas
      eventData.merchants = [merchantId];
    } else if (type === 'marché') {
      eventData.numberOfStands = parseInt(numberOfStands) || 1;
    }
    
    // Ajouter les informations de récurrence si nécessaire
    if (isRecurring && recurrence) {
      eventData.recurrence = {
        frequency: recurrence.frequency || 'weekly',
        interval: parseInt(recurrence.interval) || 1,
        count: parseInt(recurrence.count) || 0,
        until: recurrence.until ? new Date(recurrence.until) : null,
        byMonthDay: parseInt(recurrence.byMonthDay) || null,
        byMonth: parseInt(recurrence.byMonth) || null
      };
    }
    
    // Créer l'événement principal
    const event = await Event.create(eventData);
    
    // Si l'événement est récurrent, créer les occurrences
    if (isRecurring && recurrence) {
      const occurrences = generateRecurringEvents(event, recurrence);
      
      // Créer les occurrences en base de données
      if (occurrences.length > 0) {
        await Event.insertMany(occurrences);
      }
    }

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
    // Construire le filtre en fonction des paramètres de requête
    const filter = {};
    
    // Filtrer par type si spécifié
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    // Filtrer par statut si spécifié
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filtrer par date de début si spécifiée
    if (req.query.startDate) {
      filter.start = { $gte: new Date(req.query.startDate) };
    }
    
    // Filtrer par date de fin si spécifiée
    if (req.query.endDate) {
      filter.end = { $lte: new Date(req.query.endDate) };
    }
    
    // Filtrer par lieu si spécifié
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }
    
    const events = await Event.find(filter)
      .populate('merchants', 'businessName email')
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
      .populate('merchants', 'businessName email')
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
      // Nouveaux champs pour la récurrence
      isRecurring,
      recurrence,
      updateRecurringEvents
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
      duration,
      isRecurring: isRecurring || false
    };
    
    // Gérer le tableau merchants pour les collectes
    if (type === 'collecte') {
      if (merchantId && merchantId.trim() !== '') {
        // Ajouter le merchantId au tableau merchants s'il n'y est pas déjà
        updateData.merchants = [merchantId];
      } else {
        // Si le type est collecte mais merchantId est vide, définir à un tableau vide
        updateData.merchants = [];
      }
    } else if (type === 'marché') {
      // Si le type est marché, définir à undefined pour le supprimer
      updateData.merchants = undefined;
      updateData.numberOfStands = parseInt(numberOfStands) || 1;
    }
    
    // Ajouter les informations de récurrence si nécessaire
    if (isRecurring && recurrence) {
      updateData.recurrence = {
        frequency: recurrence.frequency || 'weekly',
        interval: parseInt(recurrence.interval) || 1,
        count: parseInt(recurrence.count) || 0,
        until: recurrence.until ? new Date(recurrence.until) : null,
        byMonthDay: parseInt(recurrence.byMonthDay) || null,
        byMonth: parseInt(recurrence.byMonth) || null
      };
    } else {
      // Si l'événement n'est plus récurrent, supprimer les informations de récurrence
      updateData.recurrence = undefined;
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

    // Si l'événement est récurrent et que l'utilisateur a demandé de mettre à jour les occurrences futures
    if (isRecurring && updateRecurringEvents === 'future' && !event.parentEventId) {
      // Supprimer les occurrences futures existantes
      await Event.deleteMany({
        parentEventId: event._id,
        start: { $gt: new Date() }
      });
      
      // Générer de nouvelles occurrences
      const occurrences = generateRecurringEvents(event, event.recurrence);
      
      // Créer les occurrences en base de données
      if (occurrences.length > 0) {
        await Event.insertMany(occurrences);
      }
    }
    // Si l'événement est récurrent et que l'utilisateur a demandé de mettre à jour toutes les occurrences
    else if (isRecurring && updateRecurringEvents === 'all' && !event.parentEventId) {
      // Supprimer toutes les occurrences existantes
      await Event.deleteMany({
        parentEventId: event._id
      });
      
      // Générer de nouvelles occurrences
      const occurrences = generateRecurringEvents(event, event.recurrence);
      
      // Créer les occurrences en base de données
      if (occurrences.length > 0) {
        await Event.insertMany(occurrences);
      }
    }
    // Si l'événement est une occurrence et que l'utilisateur a demandé de mettre à jour toutes les occurrences
    else if (event.parentEventId && updateRecurringEvents === 'all') {
      // Récupérer l'événement parent
      const parentEvent = await Event.findById(event.parentEventId);
      
      if (parentEvent) {
        // Mettre à jour l'événement parent avec les mêmes données
        const parentUpdateData = { ...updateData };
        delete parentUpdateData.start; // Conserver la date de début de l'événement parent
        delete parentUpdateData.end; // Conserver la date de fin de l'événement parent
        
        await Event.findByIdAndUpdate(
          parentEvent._id,
          parentUpdateData,
          {
            runValidators: true,
          }
        );
        
        // Mettre à jour toutes les occurrences
        await Event.updateMany(
          { parentEventId: parentEvent._id },
          { $set: parentUpdateData }
        );
      }
    }

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
    const { deleteRecurringEvents } = req.query;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé',
      });
    }

    // Fonction pour nettoyer les références à un événement dans d'autres collections
    const cleanupEventReferences = async (eventId) => {
      try {
        console.log(`Nettoyage des références pour l'événement ${eventId}`);
        
        // Supprimer les affectations liées à cet événement
        if (mongoose.models.Assignment) {
          const assignmentsDeleted = await mongoose.models.Assignment.deleteMany({ event: eventId });
          console.log(`${assignmentsDeleted.deletedCount} affectations supprimées`);
        }
        
        // Supprimer les participations liées à cet événement
        if (mongoose.models.Participation) {
          const participationsDeleted = await mongoose.models.Participation.deleteMany({ event: eventId });
          console.log(`${participationsDeleted.deletedCount} participations supprimées`);
        }
        
        // Mettre à jour les donations liées à cet événement
        if (mongoose.models.Donation) {
          const donationsUpdated = await mongoose.models.Donation.updateMany(
            { event: eventId },
            { $unset: { event: "" } }
          );
          console.log(`${donationsUpdated.modifiedCount} donations mises à jour`);
        }
      } catch (error) {
        console.error(`Erreur lors du nettoyage des références pour l'événement ${eventId}:`, error);
        // Ne pas propager l'erreur pour permettre la suppression de l'événement
      }
    };

    // Si c'est un événement parent récurrent et que l'utilisateur veut supprimer toutes les occurrences
    if (event.isRecurring && deleteRecurringEvents === 'all') {
      // Récupérer toutes les occurrences pour nettoyer leurs références
      const childEvents = await Event.find({ parentEventId: event._id });
      
      // Nettoyer les références pour chaque occurrence
      for (const childEvent of childEvents) {
        await cleanupEventReferences(childEvent._id);
      }
      
      // Supprimer toutes les occurrences
      await Event.deleteMany({ parentEventId: event._id });
      
      // Nettoyer les références de l'événement parent
      await cleanupEventReferences(event._id);
      
      // Supprimer l'événement parent
      await Event.findByIdAndDelete(event._id);
    }
    // Si c'est un événement parent récurrent et que l'utilisateur veut supprimer les occurrences futures
    else if (event.isRecurring && deleteRecurringEvents === 'future') {
      // Récupérer les occurrences futures
      const futureEvents = await Event.find({
        parentEventId: event._id,
        start: { $gte: new Date() }
      });
      
      // Nettoyer les références pour chaque occurrence future
      for (const futureEvent of futureEvents) {
        await cleanupEventReferences(futureEvent._id);
      }
      
      // Supprimer les occurrences futures
      await Event.deleteMany({
        parentEventId: event._id,
        start: { $gte: new Date() },
      });
      
      // Nettoyer les références de l'événement parent
      await cleanupEventReferences(event._id);
      
      // Supprimer l'événement parent
      await Event.findByIdAndDelete(event._id);
    }
    // Si c'est une occurrence et que l'utilisateur veut supprimer toutes les occurrences
    else if (event.parentEventId && deleteRecurringEvents === 'all') {
      // Récupérer l'événement parent
      const parentEvent = await Event.findById(event.parentEventId);
      
      // Récupérer toutes les occurrences
      const allEvents = await Event.find({ parentEventId: event.parentEventId });
      
      // Nettoyer les références pour l'événement parent
      if (parentEvent) {
        await cleanupEventReferences(parentEvent._id);
      }
      
      // Nettoyer les références pour chaque occurrence
      for (const childEvent of allEvents) {
        await cleanupEventReferences(childEvent._id);
      }
      
      // Supprimer l'événement parent et toutes ses occurrences
      await Event.deleteMany({ 
        $or: [
          { _id: event.parentEventId },
          { parentEventId: event.parentEventId }
        ]
      });
      
      return res.status(200).json({
        success: true,
        message: 'Série d\'événements supprimée avec succès',
      });
    }
    // Si c'est une occurrence et que l'utilisateur veut supprimer les occurrences futures
    else if (event.parentEventId && deleteRecurringEvents === 'future') {
      // Récupérer les occurrences futures
      const futureEvents = await Event.find({
        parentEventId: event.parentEventId,
        start: { $gte: event.start }
      });
      
      // Nettoyer les références pour chaque occurrence future
      for (const futureEvent of futureEvents) {
        await cleanupEventReferences(futureEvent._id);
      }
      
      // Supprimer les occurrences futures y compris celle-ci
      await Event.deleteMany({
        parentEventId: event.parentEventId,
        start: { $gte: event.start }
      });
      
      return res.status(200).json({
        success: true,
        message: 'Occurrences futures supprimées avec succès',
      });
    }
    // Sinon, supprimer uniquement cet événement
    else {
      // Nettoyer les références pour cet événement
      await cleanupEventReferences(event._id);
      
      // Supprimer l'événement
      await Event.findByIdAndDelete(req.params.id);
    }

    res.status(200).json({
      success: true,
      message: 'Événement supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message,
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
    
    // Vérifier et mettre à jour le statut de l'événement
    try {
      await eventStatusService.checkAndUpdateEventStatus(event._id);
      console.log(`[DEBUG] Statut de l'événement vérifié et mis à jour si nécessaire`);
    } catch (statusError) {
      console.error(`[ERROR] Erreur lors de la vérification du statut de l'événement:`, statusError);
      // Ne pas bloquer l'inscription si la mise à jour du statut échoue
    }
    console.log(`[DEBUG] Événement sauvegardé avec succès`);

    // Récupérer l'événement mis à jour avec les informations des bénévoles
    const updatedEvent = await Event.findById(req.params.id)
      .populate('merchants', 'businessName email')
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
    
    // Vérifier et mettre à jour le statut de l'événement
    try {
      await eventStatusService.checkAndUpdateEventStatus(event._id);
      console.log(`[DEBUG] Statut de l'événement vérifié et mis à jour si nécessaire après désinscription`);
    } catch (statusError) {
      console.error(`[ERROR] Erreur lors de la vérification du statut de l'événement après désinscription:`, statusError);
      // Ne pas bloquer la désinscription si la mise à jour du statut échoue
    }

    // Récupérer l'événement mis à jour avec les informations des bénévoles
    const updatedEvent = await Event.findById(req.params.id)
      .populate('merchants', 'businessName email')
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
  
  // Nouvelles fonctions pour la gestion des statuts
  changeEventStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Le statut est requis'
        });
      }
      
      // Vérifier que l'ID est valide
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID d\'événement invalide'
        });
      }
      
      // Utiliser le service pour changer le statut
      const updatedEvent = await eventStatusService.changeEventStatus(
        id,
        status,
        req.user._id, // ID de l'utilisateur connecté
        reason || ''
      );
      
      res.status(200).json({
        success: true,
        message: `Statut de l'événement mis à jour avec succès à "${status}"`,
        data: updatedEvent
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut de l\'événement:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors du changement de statut de l\'événement'
      });
    }
  },
  
  checkEventStatus: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Vérifier que l'ID est valide
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID d\'événement invalide'
        });
      }
      
      // Utiliser le service pour vérifier et mettre à jour le statut
      const updatedEvent = await eventStatusService.checkAndUpdateEventStatus(
        id,
        req.user._id // ID de l'utilisateur connecté
      );
      
      res.status(200).json({
        success: true,
        message: `Statut de l'événement vérifié et mis à jour si nécessaire`,
        data: updatedEvent
      });
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de l\'événement:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la vérification du statut de l\'événement'
      });
    }
  },
  
  getEventsToComplete: async (req, res) => {
    try {
      const events = await eventStatusService.suggestEventsToComplete();
      
      res.status(200).json({
        success: true,
        count: events.length,
        data: events
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des événements à terminer:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la récupération des événements à terminer'
      });
    }
  },
  
  updateAllEventStatuses: async (req, res) => {
    try {
      const updatedCount = await eventStatusService.updateAllEventStatuses();
      
      res.status(200).json({
        success: true,
        message: `${updatedCount} événements ont été mis à jour`,
        updatedCount
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statuts des événements:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la mise à jour des statuts des événements'
      });
    }
  },
};
