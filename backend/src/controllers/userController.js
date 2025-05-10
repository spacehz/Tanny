const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_dev_key', {
    expiresIn: '30d',
  });
};

// @desc    Inscription d'un nouvel utilisateur
// @route   POST /api/users/register
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    // Créer un nouvel utilisateur
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Données d'utilisateur invalides" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Authentification d'un utilisateur
// @route   POST /api/users/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier si le mot de passe correspond
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @desc    Obtenir le profil de l'utilisateur
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

// @desc    Obtenir tous les bénévoles (utilisateurs avec role 'user')
// @route   GET /api/users/volunteers
// @access  Private/Admin
exports.getVolunteers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const count = await User.countDocuments({ role: 'user' });
    const volunteers = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      volunteers,
      page,
      pages: Math.ceil(count / limit),
      total: count
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
    
    if (volunteer) {
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
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, availability } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    // Créer un nouveau bénévole (role = 'user')
    const volunteer = await User.create({
      name,
      email,
      password,
      role: 'user',
      availability: availability || 'Flexible'
    });

    if (volunteer) {
      res.status(201).json({
        _id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        role: volunteer.role,
        availability: volunteer.availability
      });
    } else {
      res.status(400).json({ message: "Données d'utilisateur invalides" });
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

    if (volunteer) {
      volunteer.name = req.body.name || volunteer.name;
      volunteer.email = req.body.email || volunteer.email;
      volunteer.isActive = req.body.isActive !== undefined ? req.body.isActive : volunteer.isActive;
      volunteer.availability = req.body.availability || volunteer.availability;

      if (req.body.password) {
        volunteer.password = req.body.password;
      }

      const updatedVolunteer = await volunteer.save();

      res.json({
        _id: updatedVolunteer._id,
        name: updatedVolunteer.name,
        email: updatedVolunteer.email,
        role: updatedVolunteer.role,
        isActive: updatedVolunteer.isActive,
        availability: updatedVolunteer.availability
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

    if (volunteer) {
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
