const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation pour l'inscription
const registerValidation = [
  check('name', 'Le nom est requis').not().isEmpty(),
  check('email', 'Veuillez inclure un email valide').isEmail(),
  check('password', 'Le mot de passe doit contenir au moins 6 caractères').isLength({ min: 6 }),
];

// Validation pour la connexion
const loginValidation = [
  check('email', 'Veuillez inclure un email valide').isEmail(),
  check('password', 'Le mot de passe est requis').exists(),
];

// Routes publiques
router.post('/register', registerValidation, userController.registerUser);
router.post('/login', loginValidation, userController.loginUser);

// Routes protégées
router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateUserProfile);

// Routes d'administration des bénévoles (protégées par middleware admin)
router.get('/volunteers', protect, admin, userController.getVolunteers);
router.get('/volunteers/:id', protect, admin, userController.getVolunteerById);
router.post('/volunteers', protect, admin, registerValidation, userController.createVolunteer);
router.put('/volunteers/:id', protect, admin, userController.updateVolunteer);
router.delete('/volunteers/:id', protect, admin, userController.deleteVolunteer);

module.exports = router;
