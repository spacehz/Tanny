const express = require('express');
const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  changeEventStatus,
  checkEventStatus,
  getEventsToComplete,
  updateAllEventStatuses
} = require('../controllers/eventController');
const {
  getEventAssignments,
  saveEventAssignments,
  getEventVolunteers,
  getEventMerchants,
  getEventDonations
} = require('../controllers/assignmentController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes publiques
router.get('/', getEvents);
router.get('/:id', getEventById);

// Routes protégées (admin uniquement)
router.post('/', protect, admin, createEvent);
router.put('/:id', protect, admin, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);

// Routes pour l'inscription/désinscription des bénévoles
router.post('/:id/register', protect, registerForEvent);
router.post('/:id/unregister', protect, unregisterFromEvent);

// Routes pour les affectations des bénévoles
router.get('/:id/assignments', protect, admin, getEventAssignments);
router.post('/:id/assignments', protect, admin, saveEventAssignments);
router.get('/:id/volunteers', protect, admin, getEventVolunteers);
router.get('/:id/merchants', protect, admin, getEventMerchants);
router.get('/:id/donations', protect, admin, getEventDonations);

// Routes pour la gestion des statuts d'événements
router.put('/:id/status', protect, admin, changeEventStatus);
router.get('/:id/check-status', protect, admin, checkEventStatus);
router.get('/suggest-to-complete', protect, admin, getEventsToComplete);
router.get('/update-all-statuses', protect, admin, updateAllEventStatuses);

module.exports = router;
