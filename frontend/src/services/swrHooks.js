import useSWR from 'swr';
import api from './api';

/**
 * Fetcher personnalisé qui utilise l'instance Axios configurée
 * @param {string} url - URL de l'API à appeler
 */
const axiosFetcher = async (url) => {
  try {
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Hook personnalisé pour récupérer des données avec SWR et Axios
 * @param {string} url - URL de l'API relative (sans le baseURL)
 * @param {object} options - Options SWR additionnelles
 */
export const useData = (url, options = {}) => {
  return useSWR(url, axiosFetcher, {
    ...options,
    // Vous pouvez ajouter des options spécifiques par défaut ici
    suspense: false,
    revalidateOnMount: true,
  });
};

/**
 * Hook pour récupérer un utilisateur par son ID
 * @param {string|number} id - ID de l'utilisateur
 */
export const useUser = (id) => {
  return useData(id ? `/api/users/${id}` : null);
};

/**
 * Hook pour récupérer tous les produits
 */
export const useProducts = () => {
  return useData('/api/products');
};

/**
 * Hook pour récupérer un produit par son ID
 * @param {string|number} id - ID du produit
 */
export const useProduct = (id) => {
  return useData(id ? `/api/products/${id}` : null);
};

/**
 * Hook pour récupérer tous les bénévoles avec pagination, recherche et filtrage
 * @param {number} page - Numéro de la page
 * @param {number} limit - Nombre d'éléments par page
 * @param {string} search - Terme de recherche (optionnel)
 * @param {string} availability - Filtre de disponibilité (optionnel)
 * @param {boolean} isActive - Filtre de statut (optionnel)
 */
export const useVolunteers = (page = 1, limit = 10, search = '', availability = '', isActive = null) => {
  let url = `/api/users/volunteers?page=${page}&limit=${limit}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  if (availability) {
    url += `&availability=${encodeURIComponent(availability)}`;
  }
  
  if (isActive !== null) {
    url += `&isActive=${isActive}`;
  }
  
  return useData(url);
};

/**
 * Hook pour récupérer un bénévole par son ID
 * @param {string|number} id - ID du bénévole
 */
export const useVolunteer = (id) => {
  return useData(id ? `/api/users/volunteers/${id}` : null);
};

/**
 * Hook pour récupérer tous les commerçants avec pagination
 * @param {number} page - Numéro de la page
 * @param {number} limit - Nombre d'éléments par page
 */
export const useMerchants = (page = 1, limit = 10) => {
  return useData(`/api/merchants?page=${page}&limit=${limit}`);
};

/**
 * Hook pour récupérer un commerçant par son ID
 * @param {string|number} id - ID du commerçant
 */
export const useMerchant = (id) => {
  return useData(id ? `/api/merchants/${id}` : null);
};

/**
 * Hook pour récupérer tous les événements
 */
export const useEvents = () => {
  return useData('/api/events');
};

/**
 * Hook pour récupérer un événement par son ID
 * @param {string|number} id - ID de l'événement
 */
export const useEvent = (id) => {
  return useData(id ? `/api/events/${id}` : null);
};
