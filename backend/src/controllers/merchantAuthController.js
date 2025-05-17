const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const Merchant = require('../models/Merchant');

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_dev_key', {
    expiresIn: '24h',
  });
};

// Générer un token de rafraîchissement
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_dev_key', {
    expiresIn: '30d',
  });
};

// @desc    Authentifier un commerçant et obtenir un token
// @route   POST /api/merchants/login
// @access  Public
exports.loginMerchant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    console.log('=== DÉBUT AUTHENTIFICATION COMMERÇANT ===');
    console.log('Tentative de connexion commerçant avec email:', email);
    
    // Rechercher le commerçant par email
    const merchant = await Merchant.findOne({ email }).select('+password');
    
    console.log('Commerçant trouvé?', merchant ? 'Oui' : 'Non');
    
    if (!merchant) {
      console.log('Aucun commerçant trouvé avec cet email');
      return res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }
    
    console.log('Commerçant trouvé avec ID:', merchant._id);
    console.log('Commerçant a un mot de passe?', !!merchant.password);
    
    // Vérifier le mot de passe
    let isMatch = false;
    try {
      // Afficher le mot de passe haché pour débogage (à supprimer en production)
      console.log('Mot de passe haché stocké:', merchant.password);
      console.log('Mot de passe fourni:', password);
      
      isMatch = await bcrypt.compare(password, merchant.password);
      console.log('Résultat de la comparaison bcrypt:', isMatch);
    } catch (error) {
      console.error('Erreur lors de la comparaison du mot de passe:', error);
      return res.status(401).json({ message: 'Erreur lors de la vérification du mot de passe' });
    }
    
    if (!isMatch) {
      console.log('Mot de passe incorrect');
      return res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }
    
    console.log('Authentification réussie pour le commerçant:', merchant.businessName);
    
    // Générer les tokens
    const token = generateToken(merchant._id);
    const refreshToken = generateRefreshToken(merchant._id);
    
    // Définir les cookies HTTP-only
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/merchants/refresh-token',
      maxAge: 30 * 24 * 60 * 60 * 1000
    });
    
    // Renvoyer les informations du commerçant
    res.json({
      user: {
        _id: merchant._id,
        name: merchant.businessName,
        email: merchant.email,
        role: 'commercant',
      },
      isAuthenticated: true
    });
    
  } catch (error) {
    console.error('Erreur serveur lors de l\'authentification commerçant:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Rafraîchir le token d'accès pour un commerçant
// @route   POST /api/merchants/refresh-token
// @access  Public (avec cookie refreshToken)
exports.refreshToken = async (req, res) => {
  try {
    // Récupérer le refresh token du cookie
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Rafraîchissement non autorisé, pas de token' });
    }
    
    // Vérifier le refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_dev_key');
    
    // Trouver le commerçant
    const merchant = await Merchant.findById(decoded.id);
    
    if (!merchant) {
      return res.status(401).json({ message: 'Commerçant non trouvé' });
    }
    
    // Générer un nouveau token d'accès
    const newToken = generateToken(merchant._id);
    
    // Définir le nouveau cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    res.json({ message: 'Token rafraîchi avec succès', isAuthenticated: true });
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    res.status(401).json({ message: 'Rafraîchissement non autorisé, token invalide' });
  }
};

// @desc    Déconnecter un commerçant
// @route   POST /api/merchants/logout
// @access  Public
exports.logoutMerchant = async (req, res) => {
  try {
    // Effacer les cookies
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
