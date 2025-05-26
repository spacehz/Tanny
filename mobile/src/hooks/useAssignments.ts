import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getVolunteerAssignments, 
  startAssignment, 
  endAssignment, 
  updateAssignmentStatus 
} from '../services/assignmentService';

// Clé pour le cache des affectations
const ASSIGNMENTS_CACHE_KEY = 'assignments_cache';

/**
 * Hook personnalisé pour gérer les affectations avec React Query et support hors ligne
 */
export const useAssignments = (volunteerId: string) => {
  const queryClient = useQueryClient();

  // Fonction pour récupérer les affectations avec support hors ligne
  const fetchAssignmentsWithOfflineSupport = async () => {
    try {
      // Récupérer les affectations depuis l'API
      const response = await getVolunteerAssignments(volunteerId);
      
      // Extraire les données
      const assignments = response && response.data && Array.isArray(response.data) 
        ? response.data 
        : [];
      
      // Mettre en cache les données
      await AsyncStorage.setItem(ASSIGNMENTS_CACHE_KEY, JSON.stringify(assignments));
      
      return assignments;
    } catch (error) {
      console.error('Erreur lors de la récupération des affectations:', error);
      
      // En cas d'erreur, essayer de récupérer les données en cache
      const cachedData = await AsyncStorage.getItem(ASSIGNMENTS_CACHE_KEY);
      if (cachedData) {
        console.log('Utilisation des données en cache suite à une erreur');
        return JSON.parse(cachedData);
      }
      
      throw error;
    }
  };

  // Requête pour récupérer les affectations
  const assignmentsQuery = useQuery({
    queryKey: ['assignments', volunteerId],
    queryFn: fetchAssignmentsWithOfflineSupport,
    enabled: !!volunteerId, // Ne pas exécuter si volunteerId est vide
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation pour démarrer une affectation
  const startMutation = useMutation({
    mutationFn: (assignmentId: string) => startAssignment(assignmentId),
    onSuccess: () => {
      // Invalider la requête des affectations pour forcer un rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });

  // Mutation pour terminer une affectation
  const endMutation = useMutation({
    mutationFn: (assignmentId: string) => endAssignment(assignmentId),
    onSuccess: () => {
      // Invalider la requête des affectations pour forcer un rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });

  // Mutation pour mettre à jour le statut d'une affectation
  const updateStatusMutation = useMutation({
    mutationFn: ({ assignmentId, status }: { assignmentId: string; status: string }) => 
      updateAssignmentStatus(assignmentId, status),
    onSuccess: () => {
      // Invalider la requête des affectations pour forcer un rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
    },
  });

  // Fonction pour obtenir les statistiques des affectations
  const getAssignmentStats = () => {
    const assignments = assignmentsQuery.data || [];
    
    return {
      total: assignments.length,
      completed: assignments.filter((a: any) => a.status === 'completed').length,
      inProgress: assignments.filter((a: any) => a.status === 'in_progress').length,
      pending: assignments.filter((a: any) => a.status === 'pending').length,
    };
  };

  return {
    assignments: assignmentsQuery.data || [],
    isLoading: assignmentsQuery.isLoading,
    isError: assignmentsQuery.isError,
    error: assignmentsQuery.error,
    refetch: assignmentsQuery.refetch,
    startAssignment: startMutation.mutate,
    endAssignment: endMutation.mutate,
    updateAssignmentStatus: updateStatusMutation.mutate,
    isStarting: startMutation.isPending,
    isEnding: endMutation.isPending,
    isUpdating: updateStatusMutation.isPending,
    stats: getAssignmentStats(),
  };
};
