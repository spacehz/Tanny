const express = require('express');
const { check, validationResult } = require('express-validator');
const userController = require('../controllers/userController');
const assignmentController = require('../controllers/assignmentController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes publiques
router.post(
  '/register',
  [
    check('name', 'Le nom est requis').not().isEmpty(),
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Veuillez entrer un mot de passe avec 4 caractères ou plus').isLength({ min: 4 }),
  ],
  userController.registerUser
);

router.post(
  '/login',
  [
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Le mot de passe est requis').exists(),
  ],
  userController.loginUser
);

// Route pour rafraîchir le token
router.post('/refresh-token', userController.refreshToken);

// Route pour se déconnecter
router.post('/logout', userController.logoutUser);

// Routes protégées
router.route('/profile')
  .get(protect, userController.getUserProfile)
  .put(protect, userController.updateUserProfile);

// Routes admin pour les bénévoles
router.route('/volunteers')
  .get(protect, admin, userController.getVolunteers)
  .post(
    [
      protect,
      admin,
      check('name', 'Le nom est requis').not().isEmpty(),
      check('email', 'Veuillez inclure un email valide').isEmail(),
      check('password', 'Veuillez entrer un mot de passe avec 4 caractères ou plus').isLength({ min: 4 }),
    ],
    userController.createVolunteer
  );

router.route('/volunteers/:id')
  .get(protect, admin, userController.getVolunteerById)
  .put(protect, admin, userController.updateVolunteer)
  .delete(protect, admin, userController.deleteVolunteer);

// Route pour récupérer les affectations d'un bénévole
router.get('/volunteers/:id/assignments', protect, assignmentController.getVolunteerAssignments);

// Routes admin pour les commerçants
router.route('/merchants')
  .get(protect, admin, userController.getMerchants)
  .post(
    [
      protect,
      admin,
      check('name', 'Le nom est requis').not().isEmpty(),
      check('email', 'Veuillez inclure un email valide').isEmail(),
      check('password', 'Veuillez entrer un mot de passe avec 4 caractères ou plus').isLength({ min: 4 }),
    ],
    userController.createMerchant
  );

router.route('/merchants/:id')
  .get(protect, admin, userController.getMerchantById)
  .put(protect, admin, userController.updateMerchant)
  .delete(protect, admin, userController.deleteMerchant);

module.exports = router;
