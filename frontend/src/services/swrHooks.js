import useSWR from 'swr';
import api from './api';

// Fetcher function for SWR
const fetcher = async (url) => {
  console.log('Fetching data from:', url);
  const response = await api.get(url);
  console.log('Response received:', response.data);
  return response.data;
};

/**
 * Hook to fetch merchants with pagination, search, and filtering
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @param {string} search - Search term
 * @param {boolean|null} isActive - Filter by active status (true, false, or null for all)
 * @returns {Object} SWR response with data, error, isLoading, and mutate
 */
export const useMerchants = (page = 1, limit = 10, search = '', isActive = null) => {
  let url = `/api/merchants?page=${page}&limit=${limit}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  if (isActive !== null) {
    url += `&isActive=${isActive}`;
  }
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  
  return {
    data,
    error,
    isLoading,
    mutate
  };
};

/**
 * Hook to fetch a single merchant by ID
 * @param {string} id - Merchant ID
 * @returns {Object} SWR response with data, error, isLoading, and mutate
 */
export const useMerchant = (id) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/merchants/${id}` : null,
    fetcher
  );
  
  return {
    merchant: data,
    error,
    isLoading,
    mutate
  };
};

/**
 * Hook to fetch events with pagination, search, and filtering
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @param {string} search - Search term
 * @param {string|null} status - Filter by status
 * @returns {Object} SWR response with data, error, isLoading, and mutate
 */
export const useEvents = (page = 1, limit = 10, search = '', status = null) => {
  let url = `/api/events?page=${page}&limit=${limit}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  if (status) {
    url += `&status=${status}`;
  }
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  
  return {
    data,
    error,
    isLoading,
    mutate
  };
};

/**
 * Hook to fetch a single event by ID
 * @param {string} id - Event ID
 * @returns {Object} SWR response with data, error, isLoading, and mutate
 */
export const useEvent = (id) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/events/${id}` : null,
    fetcher
  );
  
  return {
    event: data,
    error,
    isLoading,
    mutate
  };
};

/**
 * Hook to fetch collections with pagination and search
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @param {string} search - Search term
 * @returns {Object} SWR response with data, error, isLoading, and mutate
 */
export const useCollections = (page = 1, limit = 10, search = '') => {
  let url = `/api/collections?page=${page}&limit=${limit}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  
  return {
    data,
    error,
    isLoading,
    mutate
  };
};

/**
 * Hook to fetch a single collection by ID
 * @param {string} id - Collection ID
 * @returns {Object} SWR response with data, error, isLoading, and mutate
 */
export const useCollection = (id) => {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/collections/${id}` : null,
    fetcher
  );
  
  return {
    collection: data,
    error,
    isLoading,
    mutate
  };
};

/**
 * Hook to fetch volunteers with pagination, search, and filtering
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @param {string} search - Search term
 * @param {string} availability - Filter by availability
 * @returns {Object} SWR response with data, error, isLoading, and mutate
 */
export const useVolunteers = (page = 1, limit = 10, search = '', availability = '') => {
  let url = `/api/users/volunteers?page=${page}&limit=${limit}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  if (availability) {
    url += `&availability=${encodeURIComponent(availability)}`;
  }
  
  // Le filtre isActive a été supprimé car l'attribut n'est plus utilisé
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  
  return {
    data,
    error,
    isLoading,
    mutate
  };
};

/**
 * Hook to fetch dashboard statistics
 * @returns {Object} SWR response with counts for volunteers, merchants, collections, and upcoming markets
 */
/**
 * Hook to fetch assignments for a volunteer
 * @param {string} volunteerId - Volunteer ID
 * @returns {Object} SWR response with data, error, isLoading, and mutate
 */
export const useVolunteerAssignments = (volunteerId) => {
  console.log('useVolunteerAssignments appelé avec ID:', volunteerId);
  
  const { data, error, isLoading, mutate } = useSWR(
    volunteerId ? `/api/users/volunteers/${volunteerId}/assignments` : null,
    async (url) => {
      // Utiliser l'instance API avec la bonne URL de base
      try {
        console.log('Fetching assignments from URL:', url);
        const response = await api.get(url);
        
        console.log('Données brutes reçues:', response.data);
        
        return response.data;
      } catch (err) {
        console.error('Erreur dans le fetcher personnalisé:', err);
        throw err;
      }
    },
    {
      revalidateOnFocus: true,
      refreshInterval: 10000, // Rafraîchir toutes les 10 secondes
      dedupingInterval: 2000, // Intervalle de dédoublonnage de 2 secondes
      errorRetryCount: 3,
      shouldRetryOnError: true,
      revalidateOnReconnect: true,
      refreshWhenHidden: false, // Ne pas rafraîchir quand la page est cachée
      refreshWhenOffline: false // Ne pas rafraîchir quand hors ligne
    }
  );
  
  console.log('Assignments data from API:', data);
  console.log('Assignments error:', error);
  console.log('Assignments isLoading:', isLoading);
  
  // Vérifier si les données sont dans le format attendu
  let assignments = [];
  if (data && data.success && Array.isArray(data.data)) {
    assignments = data.data;
    console.log('Assignments formatés:', assignments);
  } else if (data && Array.isArray(data)) {
    // Si les données sont directement un tableau
    assignments = data;
    console.log('Assignments formatés (format alternatif):', assignments);
  } else {
    console.log('Format de données incorrect ou données manquantes');
    console.log('Type de data:', typeof data);
    console.log('Structure de data:', JSON.stringify(data, null, 2));
  }
  
  return {
    assignments,
    rawData: data,
    error,
    isLoading,
    mutate
  };
};

export const useDashboardStats = () => {
  // Fetch volunteers count
  const volunteersResult = useVolunteers(1, 1);
  
  // Fetch merchants count
  const merchantsResult = useMerchants(1, 1);
  
  // Fetch all events
  const eventsResult = useEvents(1, 1000); // Get a large number to ensure we get all events
  
  // Calculate statistics
  const stats = {
    volunteersCount: volunteersResult.data?.total || 0,
    merchantsCount: merchantsResult.data?.total || 0,
    collectionsCount: 0,
    upcomingMarketsCount: 0,
    newVolunteersThisMonth: 0,
    newMerchantsThisMonth: 0,
    upcomingCollections: 0
  };
  
  // If events data is available, calculate collections and upcoming markets counts
  if (eventsResult.data?.data) {
    const now = new Date();
    const events = eventsResult.data.data;
    
    // Count collections (events of type 'collecte')
    stats.collectionsCount = events.filter(event => event.type === 'collecte').length;
    
    // Count upcoming collections
    stats.upcomingCollections = events.filter(event => 
      event.type === 'collecte' && new Date(event.start) > now
    ).length;
    
    // Count upcoming markets (events of type 'marché')
    stats.upcomingMarketsCount = events.filter(event => 
      event.type === 'marché' && new Date(event.start) > now
    ).length;
  }
  
  // Calculate loading and error states
  const isLoading = volunteersResult.isLoading || merchantsResult.isLoading || eventsResult.isLoading;
  const error = volunteersResult.error || merchantsResult.error || eventsResult.error;
  
  return {
    stats,
    isLoading,
    error
  };
};
