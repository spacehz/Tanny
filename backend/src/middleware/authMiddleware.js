const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Merchant = require('../models/Merchant');

// Middleware pour protéger les routes
exports.protect = async (req, res, next) => {
  let token;

  // Vérifier si le token est présent dans les cookies
  if (req.cookies.token) {
    token = req.cookies.token;
  } 
  // Vérifier si le token est présent dans les headers (pour la compatibilité)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, pas de token' });
  }

  try {
    // Vérifier le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_dev_key');

    // Chercher d'abord dans le modèle User
    let user = await User.findById(decoded.id).select('-password');
    let isMerchant = false;
    
    // Si non trouvé, chercher dans le modèle Merchant
    if (!user) {
      user = await Merchant.findById(decoded.id).select('-password');
      // Si c'est un commerçant, ajouter le rôle 'commercant' pour la compatibilité
      if (user) {
        isMerchant = true;
        // Créer un objet utilisateur compatible avec le reste de l'application
        user = {
          _id: user._id,
          email: user.email,
          businessName: user.businessName,
          role: 'commercant',
          // Ajouter d'autres propriétés nécessaires
          isMerchant: true
        };
      }
    }
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = user;

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    
    // Si le token est expiré, essayer de le rafraîchir automatiquement
    if (error.name === 'TokenExpiredError' && req.cookies.refreshToken) {
      return res.status(401).json({ 
        message: 'Token expiré', 
        tokenExpired: true 
      });
    }
    
    res.status(401).json({ message: 'Non autorisé, token invalide' });
  }
};

// Constantes pour les rôles
const ROLES = {
  ADMIN: 'admin',
  VOLUNTEER: 'bénévole',
  MERCHANT: 'commercant'
};

// Fonction pour normaliser un rôle
const normalizeRole = (role) => {
  if (!role) return null;
  
  const roleLower = role.toLowerCase();
  
  if (roleLower === 'admin') {
    return ROLES.ADMIN;
  } else if (roleLower === 'volunteer' || roleLower === 'bénévole') {
    return ROLES.VOLUNTEER;
  } else if (roleLower === 'merchant' || roleLower === 'commercant' || roleLower === 'commerçant') {
    return ROLES.MERCHANT;
  }
  
  return roleLower;
};

// Middleware pour les routes d'administration
exports.admin = (req, res, next) => {
  if (req.user && normalizeRole(req.user.role) === ROLES.ADMIN) {
    next();
  } else {
    res.status(403).json({ message: 'Non autorisé, accès administrateur requis' });
  }
};

// Middleware pour les routes de marchands
exports.merchant = (req, res, next) => {
  const normalizedRole = normalizeRole(req.user?.role);
  if (req.user && (normalizedRole === ROLES.MERCHANT || normalizedRole === ROLES.ADMIN)) {
    next();
  } else {
    res.status(403).json({ message: 'Non autorisé, accès marchand requis' });
  }
};

// Middleware pour les routes de bénévoles
exports.volunteer = (req, res, next) => {
  const normalizedRole = normalizeRole(req.user?.role);
  if (req.user && (normalizedRole === ROLES.VOLUNTEER || normalizedRole === ROLES.ADMIN)) {
    next();
  } else {
    res.status(403).json({ message: 'Non autorisé, accès bénévole requis' });
  }
};
