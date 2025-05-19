const express = require('express');
const { 
  updateAssignmentStatus, 
  startAssignment, 
  endAssignment, 
  updateCollectedItems, 
  addAssignmentImages 
} = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route pour mettre à jour le statut d'une affectation
router.patch('/:id', protect, updateAssignmentStatus);

// Routes pour la gestion des collectes
router.patch('/:id/start', protect, startAssignment);
router.patch('/:id/end', protect, endAssignment);
router.patch('/:id/items', protect, updateCollectedItems);
router.post('/:id/images', protect, addAssignmentImages);

module.exports = router;
