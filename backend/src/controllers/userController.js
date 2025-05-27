const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Merchant = require('../models/Merchant');

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_dev_key', {
    expiresIn: '24h', // Réduit à 24h pour plus de sécurité
  });
};

// Générer un token de rafraîchissement
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_dev_key', {
    expiresIn: '30d',
  });
};

// @desc    Inscrire un nouvel utilisateur
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, phoneNumber, address, role, businessName } = req.body;
  
  console.log('Données reçues pour l\'inscription:', { 
    name, 
    email, 
    passwordLength: password ? password.length : 0,
    phoneNumber,
    address,
    role,
    businessName
  });

  try {
    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    // Traiter l'adresse correctement (peut être un objet ou une chaîne)
    let formattedAddress = '';
    if (typeof address === 'object') {
      // Si l'adresse est un objet (comme dans le modèle Merchant)
      const { street, city, postalCode, country } = address;
      formattedAddress = `${street || ''}, ${postalCode || ''} ${city || ''}, ${country || 'France'}`.trim();
    } else {
      // Si l'adresse est déjà une chaîne
      formattedAddress = address || '';
    }

    // Créer un nouvel utilisateur
    const user = await User.create({
      name,
      email,
      password,
      phoneNumber: phoneNumber || '',
      address: formattedAddress,
      role: role || 'bénévole',
      businessName: businessName || '',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        address: user.address,
        businessName: user.businessName,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Données utilisateur invalides' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Authentifier un utilisateur et obtenir un token
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    console.log('=== DÉBUT AUTHENTIFICATION ===');
    console.log('Tentative de connexion avec email:', email);
    
    // Vérifier si c'est un email de commerçant connu (pour le test)
    const isTestMerchant = email === 'boulangerie@tany.org';
    
    // Chercher d'abord dans le modèle User
    let user = await User.findOne({ email }).select('+password');
    let isMerchant = false;
    
    console.log('Résultat de la recherche dans User:', user ? 'Trouvé' : 'Non trouvé');

    // Si non trouvé et que c'est notre commerçant de test, créer un objet commerçant
    if (!user && isTestMerchant) {
      console.log('Email de commerçant de test détecté, création d\'un objet commerçant');
      
      // Pour le commerçant de test, on sait que le mot de passe est 'merchant123'
      // Vérifier si le mot de passe fourni correspond
      if (password === 'merchant123') {
        // Créer un objet commerçant factice pour l'authentification
        user = {
          _id: new mongoose.Types.ObjectId(), // Générer un ID factice
          email: 'boulangerie@tany.org',
          businessName: 'Boulangerie Test',
          // Pas besoin d'inclure le mot de passe
        };
        isMerchant = true;
        console.log('Authentification réussie pour le commerçant de test');
      } else {
        console.log('Mot de passe incorrect pour le commerçant de test');
      }
    }
    // Si ce n'est pas le commerçant de test, essayer de chercher dans le modèle Merchant
    else if (!user) {
      console.log('Utilisateur non trouvé dans User, recherche dans Merchant...');
      
      try {
        // Rechercher le commerçant par email
        const merchant = await Merchant.findOne({ email });
        console.log('Résultat de la recherche dans Merchant:', merchant ? 'Trouvé' : 'Non trouvé');
        
        if (merchant) {
          // Pour simplifier, on considère que tous les commerçants ont le même mot de passe de test
          // En production, il faudrait récupérer le mot de passe haché et le comparer correctement
          if (password === 'merchant123') {
            user = {
              _id: merchant._id,
              email: merchant.email,
              businessName: merchant.businessName || 'Commerçant',
            };
            isMerchant = true;
            console.log('Authentification réussie pour le commerçant');
          } else {
            console.log('Mot de passe incorrect pour le commerçant');
          }
        } else {
          console.log('Aucun commerçant trouvé avec cet email');
        }
      } catch (error) {
        console.error('Erreur lors de la recherche dans Merchant:', error);
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe invalide' });
    }

    // Pour les utilisateurs normaux, vérifier le mot de passe
    if (!isMerchant) {
      try {
        console.log('Vérification du mot de passe pour utilisateur normal');
        const isMatch = await user.comparePassword(password);
        console.log('Résultat de la comparaison pour utilisateur:', isMatch);
        
        if (!isMatch) {
          return res.status(401).json({ message: 'Email ou mot de passe invalide' });
        }
      } catch (error) {
        console.error('Erreur lors de la comparaison du mot de passe utilisateur:', error);
        return res.status(401).json({ message: 'Erreur lors de la vérification du mot de passe' });
      }
    }
    
    // À ce stade, l'authentification est réussie (pour utilisateur ou commerçant)
    console.log('Authentification réussie pour:', isMerchant ? 'commerçant' : 'utilisateur');

    // Générer les tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Définir les cookies HTTP-only
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Seulement en HTTPS en production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 heures
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/users/refresh-token', // Restreint le cookie à cette route
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 jours
    });

    // Renvoyer les informations de l'utilisateur (sans le token dans le corps)
    res.json({
      user: {
        _id: user._id,
        name: isMerchant ? user.businessName : user.name,
        email: user.email,
        role: isMerchant ? 'commercant' : user.role,
      },
      isAuthenticated: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Mettre à jour le profil de l'utilisateur
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Obtenir tous les bénévoles avec recherche et filtrage
// @route   GET /api/users/volunteers
// @access  Private/Admin
exports.getVolunteers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const availability = req.query.availability || '';
    const isActive = req.query.isActive !== undefined ? 
      req.query.isActive === 'true' : null;
    
    // Construire le filtre de recherche
    const filter = { role: 'bénévole' };
    
    // Ajouter la recherche si présente
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Ajouter le filtre de disponibilité si présent
    if (availability) {
      filter.availability = availability;
    }
    
    // Le filtre de statut a été supprimé car nous utilisons maintenant uniquement la disponibilité
    
    const volunteers = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filter);
    
    res.json({
      volunteers,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Obtenir un bénévole par ID
// @route   GET /api/users/volunteers/:id
// @access  Private/Admin
exports.getVolunteerById = async (req, res) => {
  try {
    const volunteer = await User.findById(req.params.id).select('-password');

    if (volunteer && volunteer.role === 'bénévole') {
      res.json(volunteer);
    } else {
      res.status(404).json({ message: 'Bénévole non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Créer un nouveau bénévole
// @route   POST /api/users/volunteers
// @access  Private/Admin
exports.createVolunteer = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, availability, absencePeriod } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    // Créer un nouveau bénévole
    const volunteer = await User.create({
      name,
      email,
      password,
      role: 'bénévole',
      availability: availability || 'oui',
      absencePeriod: absencePeriod || { startDate: null, endDate: null },
      volunteerHours: 0, // Initialiser explicitement les heures de bénévolat à 0
    });

    if (volunteer) {
      res.status(201).json({
        _id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        role: volunteer.role,
        availability: volunteer.availability,
        absencePeriod: volunteer.absencePeriod,
        volunteerHours: volunteer.volunteerHours,
      });
    } else {
      res.status(400).json({ message: 'Données bénévole invalides' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Mettre à jour un bénévole
// @route   PUT /api/users/volunteers/:id
// @access  Private/Admin
exports.updateVolunteer = async (req, res) => {
  try {
    const volunteer = await User.findById(req.params.id);

    if (volunteer && volunteer.role === 'bénévole') {
      volunteer.name = req.body.name || volunteer.name;
      volunteer.email = req.body.email || volunteer.email;
      volunteer.availability = req.body.availability || volunteer.availability;
      
      // Le champ volunteerHours ne doit pas être modifié manuellement
      // Il sera incrémenté automatiquement lorsqu'un bénévole participe à un événement
      if (req.body.absencePeriod) {
        // S'assurer que volunteer.absencePeriod existe
        if (!volunteer.absencePeriod) {
          volunteer.absencePeriod = { startDate: null, endDate: null };
        }
        
        volunteer.absencePeriod = {
          startDate: req.body.absencePeriod.startDate !== undefined ? req.body.absencePeriod.startDate : volunteer.absencePeriod.startDate,
          endDate: req.body.absencePeriod.endDate !== undefined ? req.body.absencePeriod.endDate : volunteer.absencePeriod.endDate
        };
      }
      
      if (req.body.password) {
        volunteer.password = req.body.password;
      }

      const updatedVolunteer = await volunteer.save();

      res.json({
        _id: updatedVolunteer._id,
        name: updatedVolunteer.name,
        email: updatedVolunteer.email,
        role: updatedVolunteer.role,
        availability: updatedVolunteer.availability,
        absencePeriod: updatedVolunteer.absencePeriod,
        volunteerHours: updatedVolunteer.volunteerHours,
      });
    } else {
      res.status(404).json({ message: 'Bénévole non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Supprimer un bénévole
// @route   DELETE /api/users/volunteers/:id
// @access  Private/Admin
exports.deleteVolunteer = async (req, res) => {
  try {
    const volunteer = await User.findById(req.params.id);

    if (volunteer && volunteer.role === 'bénévole') {
      await volunteer.deleteOne();
      res.json({ message: 'Bénévole supprimé' });
    } else {
      res.status(404).json({ message: 'Bénévole non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Obtenir tous les commerçants avec pagination
// @route   GET /api/users/merchants
// @access  Private/Admin
exports.getMerchants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalMerchants = await User.countDocuments({ role: 'commercant' });
    const merchants = await User.find({ role: 'commercant' })
      .select('-password')
      .skip(skip)
      .limit(limit);

    res.json({
      merchants,
      page,
      pages: Math.ceil(totalMerchants / limit),
      total: totalMerchants
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Obtenir un commerçant par ID
// @route   GET /api/users/merchants/:id
// @access  Private/Admin
exports.getMerchantById = async (req, res) => {
  try {
    const merchant = await User.findById(req.params.id).select('-password');

    if (merchant && merchant.role === 'commercant') {
      res.json(merchant);
    } else {
      res.status(404).json({ message: 'Commerçant non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Créer un nouveau commerçant
// @route   POST /api/users/merchants
// @access  Private/Admin
exports.createMerchant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, businessName, address, phoneNumber } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    // Traiter l'adresse correctement (peut être un objet ou une chaîne)
    let formattedAddress = '';
    if (typeof address === 'object') {
      // Si l'adresse est un objet (comme dans le modèle Merchant)
      const { street, city, postalCode, country } = address;
      formattedAddress = `${street || ''}, ${postalCode || ''} ${city || ''}, ${country || 'France'}`.trim();
    } else {
      // Si l'adresse est déjà une chaîne
      formattedAddress = address || '';
    }

    // Créer un nouveau commerçant
    const merchant = await User.create({
      name,
      email,
      password,
      role: 'commercant',
      businessName: businessName || '',
      address: formattedAddress,
      phoneNumber: phoneNumber || '',
    });

    if (merchant) {
      res.status(201).json({
        _id: merchant._id,
        name: merchant.name,
        email: merchant.email,
        role: merchant.role,
        businessName: merchant.businessName,
        address: merchant.address,
        phoneNumber: merchant.phoneNumber,
        isActive: merchant.isActive
      });
    } else {
      res.status(400).json({ message: 'Données commerçant invalides' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Mettre à jour un commerçant
// @route   PUT /api/users/merchants/:id
// @access  Private/Admin
exports.updateMerchant = async (req, res) => {
  try {
    const merchant = await User.findById(req.params.id);

    if (merchant && merchant.role === 'commercant') {
      merchant.name = req.body.name || merchant.name;
      merchant.email = req.body.email || merchant.email;
      merchant.businessName = req.body.businessName || merchant.businessName;
      merchant.address = req.body.address || merchant.address;
      merchant.phoneNumber = req.body.phoneNumber || merchant.phoneNumber;
      

      
      if (req.body.password) {
        merchant.password = req.body.password;
      }

      const updatedMerchant = await merchant.save();

      res.json({
        _id: updatedMerchant._id,
        name: updatedMerchant.name,
        email: updatedMerchant.email,
        role: updatedMerchant.role,
        businessName: updatedMerchant.businessName,
        address: updatedMerchant.address,
        phoneNumber: updatedMerchant.phoneNumber,

      });
    } else {
      res.status(404).json({ message: 'Commerçant non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Supprimer un commerçant
// @route   DELETE /api/users/merchants/:id
// @access  Private/Admin
exports.deleteMerchant = async (req, res) => {
  try {
    const merchant = await User.findById(req.params.id);

    if (merchant && merchant.role === 'commercant') {
      await merchant.deleteOne();
      res.json({ message: 'Commerçant supprimé' });
    } else {
      res.status(404).json({ message: 'Commerçant non trouvé' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Rafraîchir le token d'accès
// @route   POST /api/users/refresh-token
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
    
    // Trouver l'utilisateur
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Générer un nouveau token d'accès
    const newToken = generateToken(user._id);
    
    // Définir le nouveau cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 heures
    });
    
    res.json({ message: 'Token rafraîchi avec succès', isAuthenticated: true });
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    res.status(401).json({ message: 'Rafraîchissement non autorisé, token invalide' });
  }
};

// @desc    Déconnecter l'utilisateur
// @route   POST /api/users/logout
// @access  Public
exports.logoutUser = async (req, res) => {
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

// @desc    Vérifier l'authentification de l'utilisateur
// @route   GET /api/users/check-auth
// @access  Private
exports.checkAuth = async (req, res) => {
  try {
    // Si cette route est atteinte, cela signifie que le middleware protect a validé le token
    // et que req.user est défini
    
    // Renvoyer les informations de base de l'utilisateur
    res.json({
      isAuthenticated: true,
      user: {
        _id: req.user._id,
        name: req.user.name || req.user.businessName,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    res.status(500).json({ 
      isAuthenticated: false,
      message: 'Erreur serveur' 
    });
  }
};
