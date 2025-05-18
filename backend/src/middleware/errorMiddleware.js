const ErrorResponse = require('../utils/errorResponse');

/**
 * Middleware pour gérer les erreurs
 * @param {Error} err - Erreur à gérer
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 * @param {Function} next - Fonction next d'Express
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log pour le développement
  console.error(err);

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ErrorResponse(message, 400);
  }

  // Erreur de duplication Mongoose
  if (err.code === 11000) {
    const message = 'Valeur en doublon détectée';
    error = new ErrorResponse(message, 400);
  }

  // Erreur d'ID Mongoose
  if (err.name === 'CastError') {
    const message = `Ressource non trouvée avec l'id ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erreur serveur'
  });
};

module.exports = errorHandler;
