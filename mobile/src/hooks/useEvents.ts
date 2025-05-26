import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getEvents, 
  registerForEvent, 
  unregisterFromEvent,
  changeEventStatus,
  checkEventStatus,
  getEventsToComplete,
  updateAllEventStatuses
} from '../services/eventService';
import { checkBackendAvailability } from '../services/api';

// Clé pour le cache des événements
const EVENTS_CACHE_KEY = 'events_cache';

// Interface pour les options de filtrage des événements
interface EventOptions {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  location?: string;
}

/**
 * Hook personnalisé pour gérer les événements avec React Query et support hors ligne
 */
export const useEvents = (options: EventOptions = {}) => {
  const queryClient = useQueryClient();

  // Fonction pour normaliser un événement
  const normalizeEvent = (event: any) => {
    // Créer une copie profonde de l'événement pour éviter les références
    const normalizedEvent = JSON.parse(JSON.stringify(event));
    
    // Normaliser le nombre de bénévoles attendus
    // Si expectedVolunteers (minuscule) existe, l'utiliser directement
    if (normalizedEvent.expectedVolunteers !== undefined) {
      // S'assurer que c'est un nombre
      normalizedEvent.expectedVolunteers = Number(normalizedEvent.expectedVolunteers);
      // Copier également dans ExpectedVolunteers pour la rétrocompatibilité
      normalizedEvent.ExpectedVolunteers = normalizedEvent.expectedVolunteers;
    } 
    // Si ExpectedVolunteers (majuscule) existe mais pas expectedVolunteers (minuscule)
    else if (normalizedEvent.ExpectedVolunteers !== undefined) {
      // S'assurer que c'est un nombre
      normalizedEvent.ExpectedVolunteers = Number(normalizedEvent.ExpectedVolunteers);
      // Copier dans expectedVolunteers
      normalizedEvent.expectedVolunteers = normalizedEvent.ExpectedVolunteers;
    } 
    // Si aucun des deux n'existe, définir une valeur par défaut
    else {
      normalizedEvent.expectedVolunteers = 5; // Valeur par défaut
      normalizedEvent.ExpectedVolunteers = 5; // Valeur par défaut
    }
    
    // S'assurer que volunteers est toujours un tableau
    if (!Array.isArray(normalizedEvent.volunteers)) {
      normalizedEvent.volunteers = [];
    }
    
    // Log pour déboguer
    if (normalizedEvent.title === 'Collecte pain') {
      console.log('Hook useEvents - Événement "Collecte pain" normalisé:', JSON.stringify({
        title: normalizedEvent.title,
        expectedVolunteers: normalizedEvent.expectedVolunteers,
        ExpectedVolunteers: normalizedEvent.ExpectedVolunteers
      }, null, 2));
    }
    
    return normalizedEvent;
  };
  
  // Fonction pour normaliser un tableau d'événements
  const normalizeEvents = (events: any[]) => {
    if (!Array.isArray(events)) return [];
    return events.map(normalizeEvent);
  };

  // Fonction pour récupérer les événements avec support hors ligne
  const fetchEventsWithOfflineSupport = async () => {
    try {
      // Vérifier si le backend est disponible
      const isBackendAvailable = await checkBackendAvailability();
      
      if (!isBackendAvailable) {
        console.log('Backend non disponible, utilisation des données en cache');
        // Récupérer les données en cache
        const cachedData = await AsyncStorage.getItem(EVENTS_CACHE_KEY);
        if (cachedData) {
          const events = JSON.parse(cachedData);
          return normalizeEvents(events);
        }
        throw new Error('Backend non disponible et aucune donnée en cache');
      }
      
      // Si le backend est disponible, récupérer les données fraîches
      const events = await getEvents(options);
      
      // Normaliser les événements
      const normalizedEvents = normalizeEvents(events);
      
      // Mettre en cache les données normalisées
      await AsyncStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify(normalizedEvents));
      
      return normalizedEvents;
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      
      // En cas d'erreur, essayer de récupérer les données en cache
      const cachedData = await AsyncStorage.getItem(EVENTS_CACHE_KEY);
      if (cachedData) {
        console.log('Utilisation des données en cache suite à une erreur');
        const events = JSON.parse(cachedData);
        return normalizeEvents(events);
      }
      
      throw error;
    }
  };

  // Requête pour récupérer les événements
  const eventsQuery = useQuery({
    queryKey: ['events', options],
    queryFn: fetchEventsWithOfflineSupport,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation pour s'inscrire à un événement
  const registerMutation = useMutation({
    mutationFn: (eventId: string) => registerForEvent(eventId),
    onSuccess: () => {
      // Invalider la requête des événements pour forcer un rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Mutation pour se désinscrire d'un événement
  const unregisterMutation = useMutation({
    mutationFn: (eventId: string) => unregisterFromEvent(eventId),
    onSuccess: () => {
      // Invalider la requête des événements pour forcer un rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Fonction pour filtrer les événements par date
  const filterEventsByDate = (dateString: string) => {
    if (!eventsQuery.data) return [];
    
    return eventsQuery.data.filter((event: any) => {
      const eventDate = new Date(event.start).toISOString().split('T')[0];
      return eventDate === dateString;
    });
  };

  // Fonction pour obtenir les événements à venir
  const getUpcomingEvents = () => {
    if (!eventsQuery.data) return [];
    
    const now = new Date();
    return eventsQuery.data
      .filter((event: any) => new Date(event.start) > now)
      .sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime());
  };

  // Mutation pour changer le statut d'un événement
  const changeStatusMutation = useMutation({
    mutationFn: ({ eventId, status, reason }: { eventId: string, status: string, reason?: string }) => 
      changeEventStatus(eventId, status, reason),
    onSuccess: () => {
      // Invalider la requête des événements pour forcer un rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Mutation pour vérifier et mettre à jour le statut d'un événement
  const checkStatusMutation = useMutation({
    mutationFn: (eventId: string) => checkEventStatus(eventId),
    onSuccess: () => {
      // Invalider la requête des événements pour forcer un rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Mutation pour mettre à jour tous les statuts d'événements
  const updateAllStatusesMutation = useMutation({
    mutationFn: () => updateAllEventStatuses(),
    onSuccess: () => {
      // Invalider la requête des événements pour forcer un rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    isError: eventsQuery.isError,
    error: eventsQuery.error,
    refetch: eventsQuery.refetch,
    filterEventsByDate,
    getUpcomingEvents,
    registerForEvent: registerMutation.mutate,
    unregisterFromEvent: unregisterMutation.mutate,
    isRegistering: registerMutation.isPending,
    isUnregistering: unregisterMutation.isPending,
    
    // Nouvelles fonctions pour la gestion des statuts
    changeEventStatus: changeStatusMutation.mutate,
    checkEventStatus: checkStatusMutation.mutate,
    updateAllEventStatuses: updateAllStatusesMutation.mutate,
    isChangingStatus: changeStatusMutation.isPending,
    isCheckingStatus: checkStatusMutation.isPending,
    isUpdatingAllStatuses: updateAllStatusesMutation.isPending,
  };
};
