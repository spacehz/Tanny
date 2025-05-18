/**
 * Middleware pour gérer les erreurs asynchrones
 * Évite d'avoir à utiliser try/catch dans chaque contrôleur
 * @param {Function} fn - Fonction asynchrone à exécuter
 * @returns {Function} Middleware Express
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
