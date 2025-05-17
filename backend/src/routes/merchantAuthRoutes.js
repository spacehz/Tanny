const express = require('express');
const { check } = require('express-validator');
const merchantAuthController = require('../controllers/merchantAuthController');

const router = express.Router();

// Route d'authentification pour les commerçants
router.post(
  '/login',
  [
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Le mot de passe est requis').exists(),
  ],
  merchantAuthController.loginMerchant
);

// Route pour rafraîchir le token
router.post('/refresh-token', merchantAuthController.refreshToken);

// Route pour se déconnecter
router.post('/logout', merchantAuthController.logoutMerchant);

module.exports = router;
