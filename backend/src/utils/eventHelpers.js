/**
 * Utilitaires pour la gestion des événements
 */
const Event = require('../models/Event');

/**
 * Ajoute un commerçant à un événement s'il n'y est pas déjà
 * @param {string} eventId - ID de l'événement
 * @param {string} merchantId - ID du commerçant à ajouter
 * @returns {Promise<boolean>} - true si le commerçant a été ajouté, false sinon
 */
const addMerchantToEvent = async (eventId, merchantId) => {
  try {
    // Vérifier que les paramètres sont valides
    if (!eventId || !merchantId) {
      console.error('ID d\'événement ou de commerçant manquant');
      return false;
    }

    // Récupérer l'événement
    const event = await Event.findById(eventId);
    if (!event) {
      console.error(`Événement non trouvé avec l'ID: ${eventId}`);
      return false;
    }

    // Vérifier si l'événement est de type collecte
    if (event.type !== 'collecte') {
      console.error(`L'événement n'est pas de type collecte: ${event.type}`);
      return false;
    }

    // Initialiser le tableau merchants s'il n'existe pas
    if (!event.merchants) {
      event.merchants = [];
    }

    // Vérifier si le commerçant est déjà dans la liste
    if (event.merchants.includes(merchantId)) {
      console.log(`Le commerçant ${merchantId} est déjà associé à l'événement ${eventId}`);
      return false;
    }

    // Ajouter le commerçant à la liste
    event.merchants.push(merchantId);
    await event.save();
    
    console.log(`Commerçant ${merchantId} ajouté à l'événement ${eventId}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commerçant à l\'événement:', error);
    return false;
  }
};

module.exports = {
  addMerchantToEvent
};
