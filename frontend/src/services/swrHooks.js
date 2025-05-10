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
  return useData(id ? `/users/${id}` : null);
};

/**
 * Hook pour récupérer tous les produits
 */
export const useProducts = () => {
  return useData('/products');
};

/**
 * Hook pour récupérer un produit par son ID
 * @param {string|number} id - ID du produit
 */
export const useProduct = (id) => {
  return useData(id ? `/products/${id}` : null);
};

/**
 * Hook pour récupérer tous les bénévoles avec pagination
 * @param {number} page - Numéro de la page
 * @param {number} limit - Nombre d'éléments par page
 */
export const useVolunteers = (page = 1, limit = 10) => {
  return useData(`/users/volunteers?page=${page}&limit=${limit}`);
};

/**
 * Hook pour récupérer un bénévole par son ID
 * @param {string|number} id - ID du bénévole
 */
export const useVolunteer = (id) => {
  return useData(id ? `/users/volunteers/${id}` : null);
};
