/**
 * Constantes pour les rôles utilisateur
 * Utiliser ces constantes pour standardiser les noms de rôles dans toute l'application
 */

export const ROLES = {
  ADMIN: 'admin',
  VOLUNTEER: 'bénévole',
  MERCHANT: 'commercant'
};

/**
 * Fonction pour normaliser un rôle (convertir différentes variantes en format standard)
 * @param {string} role - Le rôle à normaliser
 * @returns {string} - Le rôle normalisé
 */
export const normalizeRole = (role) => {
  if (!role) return null;
  
  const roleLower = role.toLowerCase();
  
  if (roleLower === 'admin') {
    return ROLES.ADMIN;
  } else if (roleLower === 'volunteer' || roleLower === 'bénévole') {
    return ROLES.VOLUNTEER;
  } else if (roleLower === 'merchant' || roleLower === 'commercant' || roleLower === 'commerçant') {
    return ROLES.MERCHANT;
  }
  
  return roleLower; // Retourner le rôle original si non reconnu
};

/**
 * Fonction pour vérifier si un utilisateur a un rôle spécifique
 * @param {Object} user - L'objet utilisateur
 * @param {string} role - Le rôle à vérifier
 * @returns {boolean} - True si l'utilisateur a le rôle, false sinon
 */
export const hasRole = (user, role) => {
  if (!user || !user.role) return false;
  
  const normalizedUserRole = normalizeRole(user.role);
  const normalizedRole = normalizeRole(role);
  
  return normalizedUserRole === normalizedRole;
};

/**
 * Fonction pour vérifier si un utilisateur est admin
 * @param {Object} user - L'objet utilisateur
 * @returns {boolean} - True si l'utilisateur est admin, false sinon
 */
export const isAdmin = (user) => {
  return hasRole(user, ROLES.ADMIN);
};

/**
 * Fonction pour vérifier si un utilisateur est bénévole
 * @param {Object} user - L'objet utilisateur
 * @returns {boolean} - True si l'utilisateur est bénévole, false sinon
 */
export const isVolunteer = (user) => {
  return hasRole(user, ROLES.VOLUNTEER) || isAdmin(user);
};

/**
 * Fonction pour vérifier si un utilisateur est commerçant
 * @param {Object} user - L'objet utilisateur
 * @returns {boolean} - True si l'utilisateur est commerçant, false sinon
 */
export const isMerchant = (user) => {
  return hasRole(user, ROLES.MERCHANT) || isAdmin(user);
};
