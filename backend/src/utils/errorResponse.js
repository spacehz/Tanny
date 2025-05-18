/**
 * Classe pour gérer les erreurs avec un message et un code de statut
 * @class ErrorResponse
 * @extends Error
 */
class ErrorResponse extends Error {
  /**
   * Crée une instance d'ErrorResponse
   * @param {string} message - Message d'erreur
   * @param {number} statusCode - Code de statut HTTP
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
