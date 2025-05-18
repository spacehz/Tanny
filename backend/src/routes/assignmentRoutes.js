const express = require('express');
const { updateAssignmentStatus } = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route pour mettre à jour le statut d'une affectation
router.patch('/:id', protect, updateAssignmentStatus);

module.exports = router;
