const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  loginMerchant,
  refreshToken,
  logoutMerchant
} = require('../controllers/merchantAuthController');
const { createMerchant } = require('../controllers/merchantController');

// @route   POST /api/merchants/auth/register
// @desc    Créer un nouveau commerçant
// @access  Public
router.post('/auth/register', createMerchant);

// @route   POST /api/merchants/auth/login
// @desc    Authentifier un commerçant et obtenir un token
// @access  Public
router.post(
  '/auth/login',
  [
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Le mot de passe est requis').exists(),
  ],
  loginMerchant
);

// @route   POST /api/merchants/auth/refresh-token
// @desc    Rafraîchir le token d'accès pour un commerçant
// @access  Public (avec cookie refreshToken)
router.post('/auth/refresh-token', refreshToken);

// @route   POST /api/merchants/auth/logout
// @desc    Déconnecter un commerçant
// @access  Public
router.post('/auth/logout', logoutMerchant);

module.exports = router;
