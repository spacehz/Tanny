const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour protéger les routes
exports.protect = async (req, res, next) => {
  let token;

  // Vérifier si le token est présent dans les headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extraire le token du header
      token = req.headers.authorization.split(' ')[1];

      // Vérifier le token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_dev_key');

      // Ajouter l'utilisateur à la requête
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Non autorisé, token invalide' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Non autorisé, pas de token' });
  }
};

// Middleware pour les routes d'administration
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Non autorisé, accès administrateur requis' });
  }
};

// Middleware pour les routes de marchands
exports.merchant = (req, res, next) => {
  if (req.user && (req.user.role === 'merchant' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Non autorisé, accès marchand requis' });
  }
};

// Middleware pour les routes de bénévoles
exports.volunteer = (req, res, next) => {
  if (req.user && (req.user.role === 'bénévole' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Non autorisé, accès bénévole requis' });
  }
};
