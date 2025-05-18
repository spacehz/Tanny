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

    console.log('Token décodé:', decoded);

    // Chercher d'abord dans le modèle User
    let user = await User.findById(decoded.id).select('-password');
    let isMerchant = false;
    
    console.log('Utilisateur trouvé dans User:', user ? 'Oui' : 'Non');
    
    if (user) {
      // Vérifier si l'utilisateur est un commerçant
      if (user.role === 'commercant') {
        isMerchant = true;
        user.isMerchant = true; // Ajouter explicitement la propriété isMerchant
      }
      
      console.log('Rôle de l\'utilisateur:', user.role);
      console.log('Est commerçant:', isMerchant);
    } else {
      // Si non trouvé dans User, chercher dans le modèle Merchant
      user = await Merchant.findById(decoded.id).select('-password');
      console.log('Utilisateur trouvé dans Merchant:', user ? 'Oui' : 'Non');
      
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
        
        console.log('Utilisateur Merchant converti:', user);
      }
    }
    
    if (!user) {
      console.log('Utilisateur non trouvé dans aucun modèle');
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = user;
    
    // Ajouter explicitement la propriété isMerchant si l'utilisateur est un commerçant
    if (user.role === 'commercant' || user.role === 'merchant' || user.role === 'commerçant') {
      req.user.isMerchant = true;
    }
    
    console.log('Utilisateur ajouté à la requête:', req.user);
    console.log('isMerchant:', req.user.isMerchant);

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
  console.log('Middleware merchant - Utilisateur:', req.user);
  console.log('Middleware merchant - Rôle:', req.user?.role);
  
  // Vérifier si l'utilisateur est un commerçant de plusieurs façons
  const normalizedRole = normalizeRole(req.user?.role);
  const isMerchantProperty = req.user?.isMerchant === true;
  const isAdmin = normalizedRole === ROLES.ADMIN;
  const isMerchantRole = normalizedRole === ROLES.MERCHANT;
  
  console.log('Middleware merchant - Rôle normalisé:', normalizedRole);
  console.log('Middleware merchant - isMerchant property:', isMerchantProperty);
  console.log('Middleware merchant - isAdmin:', isAdmin);
  console.log('Middleware merchant - isMerchantRole:', isMerchantRole);
  
  if (req.user && (isMerchantProperty || isMerchantRole || isAdmin)) {
    // Ajouter explicitement la propriété isMerchant pour le contrôleur
    req.user.isMerchant = true;
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
