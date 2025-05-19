import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';
import VolunteerLayout from '../components/layout/VolunteerLayout';
import { useVolunteerAssignments } from '../services/swrHooks';
import { 
  updateAssignmentStatus, 
  startAssignment, 
  endAssignment 
} from '../services/assignmentService';
import api from '../services/api';
import CollectionEntryModal from '../components/CollectionEntryModal';
import VolunteerStatsCharts from '../components/VolunteerStatsCharts';

export default function VolunteerParticipationsPage() {
  const { user } = useAuth();
  const { 
    assignments, 
    rawData: assignmentsRawData, 
    error: assignmentsError, 
    isLoading: assignmentsLoading, 
    mutate: mutateAssignments 
  } = useVolunteerAssignments(user?._id);
  
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [pastAssignments, setPastAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  
  // État pour les statistiques calculées localement
  const [stats, setStats] = useState({
    totalParticipationDays: 0,
    totalHours: 0,
    totalMinutes: 0,
    totalDuration: 0,
    totalCompletedAssignments: 0,
    totalProducts: 0,
    productCategories: {}
  });
  
  // Logs détaillés pour déboguer
  console.log('User ID:', user?._id);
  console.log('Assignments from hook:', assignments);
  console.log('Assignments loading:', assignmentsLoading);
  console.log('Assignments error:', assignmentsError);
  
  // Traiter les assignments du bénévole
  useEffect(() => {
    console.log('Assignments effect triggered:', assignments);
    console.log('Raw assignments data:', assignmentsRawData);
    
    // Fonction pour traiter les données d'affectation
    const processAssignmentData = () => {
      // Vérifier si nous avons des données brutes
      if (assignmentsRawData && assignmentsRawData.data && Array.isArray(assignmentsRawData.data) && assignmentsRawData.data.length > 0) {
        console.log('Traitement des données brutes:', assignmentsRawData.data);
        
        // Utiliser toutes les affectations comme "à venir" pour l'instant
        // puisque nous n'avons pas de date dans la réponse API
        const rawAssignments = assignmentsRawData.data;
        
        // Traiter chaque affectation pour s'assurer qu'elle a la structure attendue
        const processedAssignments = rawAssignments.map(assignment => {
          // Créer une copie pour éviter de modifier l'original
          const processedAssignment = { ...assignment };
          
          // S'assurer que l'événement a un nom
          if (processedAssignment.event) {
            processedAssignment.event = {
              ...processedAssignment.event,
              name: processedAssignment.event.name || 
                    `Événement à ${processedAssignment.event.location || 'lieu inconnu'}`
            };
          }
          
          // Normaliser le statut
          if (processedAssignment.status === "En cours") {
            processedAssignment.status = "pending";
          }
          
          return processedAssignment;
        });
        
        console.log('Processed assignments:', processedAssignments);
        
        // Comme nous n'avons pas de date, nous allons considérer tous les assignments comme "à venir"
        setUpcomingAssignments(processedAssignments);
        setPastAssignments([]);
        
        // Calculer les statistiques
        const calculatedStats = calculateStats(processedAssignments);
        setStats(calculatedStats);
        
        return true; // Données traitées avec succès
      }
      // Essayer avec les données formatées si disponibles
      else if (assignments && Array.isArray(assignments) && assignments.length > 0) {
        console.log('Traitement des données formatées:', assignments);
        
        // Traiter chaque affectation pour s'assurer qu'elle a la structure attendue
        const processedAssignments = assignments.map(assignment => {
          // Créer une copie pour éviter de modifier l'original
          const processedAssignment = { ...assignment };
          
          // S'assurer que l'événement a un nom
          if (processedAssignment.event) {
            processedAssignment.event = {
              ...processedAssignment.event,
              name: processedAssignment.event.name || 
                    `Événement à ${processedAssignment.event.location || 'lieu inconnu'}`
            };
          }
          
          // Normaliser le statut
          if (processedAssignment.status === "En cours") {
            processedAssignment.status = "pending";
          }
          
          return processedAssignment;
        });
        
        console.log('Processed assignments:', processedAssignments);
        
        // Comme nous n'avons pas de date, nous allons considérer tous les assignments comme "à venir"
        setUpcomingAssignments(processedAssignments);
        setPastAssignments([]);
        
        // Calculer les statistiques
        const calculatedStats = calculateStats(processedAssignments);
        setStats(calculatedStats);
        
        return true; // Données traitées avec succès
      }
      
      console.log('Aucune donnée d\'affectation trouvée');
      return false; // Aucune donnée réelle traitée
    };
    
    // Essayer de traiter les données réelles
    processAssignmentData();
    
  }, [assignments, assignmentsRawData]);

  // Fonction pour formater la date en français
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non spécifiée';
    try {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Date invalide';
    }
  };
  
  // Fonction pour formater la liste des produits
  const formatProductsList = (items) => {
    if (!items || items.length === 0) return 'Aucun produit';
    
    return items.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ');
  };
  
  // Fonction pour démarrer une affectation
  const handleStartAssignment = async (id) => {
    try {
      console.log('Démarrage de l\'affectation:', id);
      
      // Appel API pour démarrer l'affectation
      const response = await api.patch(`/api/assignments/${id}/start`, {});
      console.log('Réponse du serveur:', response.data);
      
      // Rafraîchir les données
      await mutateAssignments();
      
      alert('Affectation démarrée !');
    } catch (error) {
      console.error('Erreur lors du démarrage de l\'affectation:', error);
      
      // Afficher les détails de l'erreur
      if (error.response) {
        console.error('Réponse d\'erreur:', error.response.data);
        alert(`Erreur lors du démarrage de l'affectation: ${error.response.data.error || error.message}`);
      } else {
        alert('Erreur lors du démarrage de l\'affectation. Veuillez réessayer.');
      }
    }
  };
  
  // Fonction pour terminer une affectation
  const handleEndAssignment = async (id) => {
    try {
      console.log('Fin de l\'affectation:', id);
      
      // Appel API pour terminer l'affectation
      const response = await api.patch(`/api/assignments/${id}/end`, {});
      console.log('Réponse du serveur:', response.data);
      
      // Rafraîchir les données
      await mutateAssignments();
      
      alert('Affectation terminée !');
    } catch (error) {
      console.error('Erreur lors de la fin de l\'affectation:', error);
      
      // Afficher les détails de l'erreur
      if (error.response) {
        console.error('Réponse d\'erreur:', error.response.data);
        alert(`Erreur lors de la fin de l'affectation: ${error.response.data.error || error.message}`);
      } else {
        alert('Erreur lors de la fin de l\'affectation. Veuillez réessayer.');
      }
    }
  };
  
  // Fonction pour ouvrir le modal de saisie
  const openEntryModal = (assignment) => {
    setSelectedAssignment(assignment);
    setIsEntryModalOpen(true);
  };
  
  // Fonction pour fermer le modal de saisie
  const closeEntryModal = () => {
    setIsEntryModalOpen(false);
    setSelectedAssignment(null);
  };
  
  // Fonction pour mettre à jour les données après la saisie
  const handleEntryUpdate = async () => {
    await mutateAssignments();
  };
  
  // Fonction pour marquer une affectation comme terminée
  const markAssignmentAsCompleted = async (id) => {
    try {
      // Appel API pour mettre à jour le statut
      await updateAssignmentStatus(id, 'completed');
      
      // Mettre à jour les données localement
      const updatedUpcomingAssignments = upcomingAssignments.filter(a => a._id !== id);
      setUpcomingAssignments(updatedUpcomingAssignments);
      
      // Rafraîchir les données
      await mutateAssignments();
      
      alert('Affectation marquée comme terminée !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut. Veuillez réessayer.');
    }
  };
  
  // Fonction pour rafraîchir manuellement les données
  const refreshData = async () => {
    try {
      console.log('Rafraîchissement manuel des données...');
      await mutateAssignments();
      console.log('Données rafraîchies avec succès');
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données:', error);
    }
  };
  
  // Fonction pour calculer les statistiques à partir des affectations
  const calculateStats = (assignmentsList) => {
    if (!Array.isArray(assignmentsList) || assignmentsList.length === 0) {
      return {
        totalParticipationDays: 0,
        totalHours: 0,
        totalMinutes: 0,
        totalDuration: 0,
        totalCompletedAssignments: 0,
        totalProducts: 0,
        productCategories: {},
        participationByMonth: {},
        productsByMonth: {},
        recentActivity: []
      };
    }
    
    // Filtrer les affectations complétées avec startTime et endTime
    const completedAssignments = assignmentsList.filter(a => 
      a.status === 'completed' && a.startTime && a.endTime
    );
    
    // Calculer les statistiques
    let totalMinutes = 0;
    const participationDays = new Set();
    let totalProducts = 0;
    const productCategories = {};
    const participationByMonth = {};
    const productsByMonth = {};
    const recentActivity = [];
    
    // Trier les affectations par date (les plus récentes d'abord)
    const sortedAssignments = [...completedAssignments].sort((a, b) => {
      return new Date(b.endTime) - new Date(a.endTime);
    });
    
    // Prendre les 5 activités les plus récentes pour l'historique
    sortedAssignments.slice(0, 5).forEach(assignment => {
      recentActivity.push({
        date: assignment.endTime,
        duration: assignment.duration || 0,
        products: assignment.collectedItems || assignment.items || [],
        merchant: assignment.merchant?.businessName || 'Commerçant inconnu'
      });
    });
    
    completedAssignments.forEach(assignment => {
      // Ajouter les minutes de cette affectation
      totalMinutes += assignment.duration || 0;
      
      // Ajouter la date (jour) à l'ensemble des jours de participation
      if (assignment.startTime) {
        const date = new Date(assignment.startTime);
        const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        participationDays.add(dateString);
        
        // Statistiques par mois
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        if (!participationByMonth[monthKey]) {
          participationByMonth[monthKey] = {
            days: new Set(),
            hours: 0,
            assignments: 0
          };
        }
        
        participationByMonth[monthKey].days.add(dateString);
        participationByMonth[monthKey].hours += (assignment.duration || 0) / 60;
        participationByMonth[monthKey].assignments += 1;
      }
      
      // Calculer les produits collectés
      if (assignment.collectedItems && assignment.collectedItems.length > 0) {
        assignment.collectedItems.forEach(item => {
          const quantity = item.quantity || 0;
          totalProducts += quantity;
          
          // Regrouper par catégorie (nom du produit)
          if (!productCategories[item.name]) {
            productCategories[item.name] = 0;
          }
          productCategories[item.name] += quantity;
          
          // Statistiques par mois
          if (assignment.startTime) {
            const date = new Date(assignment.startTime);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            
            if (!productsByMonth[monthKey]) {
              productsByMonth[monthKey] = {};
            }
            
            if (!productsByMonth[monthKey][item.name]) {
              productsByMonth[monthKey][item.name] = 0;
            }
            
            productsByMonth[monthKey][item.name] += quantity;
          }
        });
      } else if (assignment.items && assignment.items.length > 0) {
        // Si pas de collectedItems, utiliser les items prévus
        assignment.items.forEach(item => {
          const quantity = item.quantity || 0;
          totalProducts += quantity;
          
          // Regrouper par catégorie (nom du produit)
          if (!productCategories[item.name]) {
            productCategories[item.name] = 0;
          }
          productCategories[item.name] += quantity;
          
          // Statistiques par mois
          if (assignment.startTime) {
            const date = new Date(assignment.startTime);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            
            if (!productsByMonth[monthKey]) {
              productsByMonth[monthKey] = {};
            }
            
            if (!productsByMonth[monthKey][item.name]) {
              productsByMonth[monthKey][item.name] = 0;
            }
            
            productsByMonth[monthKey][item.name] += quantity;
          }
        });
      }
    });
    
    // Convertir les minutes en heures
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    
    // Convertir les ensembles en nombres pour participationByMonth
    Object.keys(participationByMonth).forEach(month => {
      participationByMonth[month].days = participationByMonth[month].days.size;
    });
    
    return {
      totalParticipationDays: participationDays.size,
      totalHours,
      totalMinutes: remainingMinutes,
      totalDuration: totalMinutes,
      totalCompletedAssignments: completedAssignments.length,
      totalProducts,
      productCategories,
      participationByMonth,
      productsByMonth,
      recentActivity
    };
  };

  // Fonction pour déterminer la couleur en fonction du type d'événement
  const getEventColor = (type) => {
    if (!type) return '#10b981'; // Vert par défaut
    
    const lowerType = type.toLowerCase();
    if (lowerType.includes('collecte')) return '#10b981'; // Vert
    if (lowerType.includes('marché')) return '#3b82f6'; // Bleu
    if (lowerType.includes('réunion')) return '#f59e0b'; // Orange
    if (lowerType.includes('formation')) return '#ef4444'; // Rouge
    
    return '#10b981'; // Vert par défaut
  };

  return (
    <VolunteerLayout>
      <Head>
        <title>Mes Participations | TANY</title>
        <meta name="description" content="Historique des participations aux événements TANY" />
      </Head>

      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-primary-600">Mes Affectations</h1>
        
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Affectations totales</h3>
            <p className="text-3xl font-bold text-primary-600">{upcomingAssignments.length + pastAssignments.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">À venir</h3>
            <p className="text-3xl font-bold text-blue-600">{upcomingAssignments.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Terminées</h3>
            <p className="text-3xl font-bold text-green-600">{pastAssignments.length}</p>
          </div>
        </div>
        
        {/* Affectations à venir */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Affectations à venir</h2>
            <button 
              onClick={refreshData}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Rafraîchir les données
            </button>
          </div>
          
          {assignmentsLoading ? (
            <p className="text-center py-4">Chargement des affectations...</p>
          ) : assignmentsError ? (
            <p className="text-center py-4 text-red-500">Erreur lors du chargement des affectations: {assignmentsError.message}</p>
          ) : upcomingAssignments.length === 0 ? (
            <p className="text-center py-4">Aucune affectation à venir</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Événement
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commerçant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produits
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingAssignments.map((assignment) => (
                    <tr key={assignment._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.event?.name || `Événement à ${assignment.event?.location || 'lieu inconnu'}`}
                        </div>
                        <div className="text-xs text-gray-400">
                          Type: {assignment.event?.type || 'Non spécifié'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Lieu: {assignment.event?.location || 'Non spécifié'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {assignment.merchant?.businessName || 'Commerçant non spécifié'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {assignment.merchant?.address?.street ? 
                            `${assignment.merchant.address.street}, ${assignment.merchant.address.city || ''} ${assignment.merchant.address.postalCode || ''}` : 
                            (typeof assignment.merchant?.address === 'string' ? assignment.merchant.address : 'Adresse non spécifiée')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs break-words">
                          {formatProductsList(assignment.items)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {assignment.event?.date ? formatDate(assignment.event.date) : 'Date non spécifiée'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Créé le: {formatDate(assignment.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          assignment.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : assignment.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {assignment.status === 'completed' 
                            ? 'Terminé' 
                            : assignment.status === 'in_progress'
                            ? 'En cours'
                            : 'En attente'}
                        </span>
                        {assignment.startTime && (
                          <div className="text-xs text-gray-500 mt-1">
                            Début: {formatDate(assignment.startTime)}
                          </div>
                        )}
                        {assignment.endTime && (
                          <div className="text-xs text-gray-500 mt-1">
                            Fin: {formatDate(assignment.endTime)}
                          </div>
                        )}
                        {assignment.duration > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Durée: {Math.floor(assignment.duration / 60)}h{assignment.duration % 60 > 0 ? ` ${assignment.duration % 60}min` : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          className="text-primary-600 hover:text-primary-900 mr-3"
                          onClick={() => openEntryModal(assignment)}
                        >
                          Saisie
                        </button>
                        {assignment.status === 'pending' ? (
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleStartAssignment(assignment._id)}
                          >
                            Débuter
                          </button>
                        ) : assignment.status === 'in_progress' ? (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            onClick={() => handleEndAssignment(assignment._id)}
                          >
                            Terminer
                          </button>
                        ) : (
                          <span className="text-gray-400">Terminé</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Statistiques personnelles */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Mes statistiques</h2>
            <div className="flex space-x-2">
              <button 
                onClick={refreshData}
                className="px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 text-sm"
              >
                Rafraîchir
              </button>
            </div>
          </div>
          
          {assignmentsLoading ? (
            <p className="text-center py-4">Chargement des statistiques...</p>
          ) : assignmentsError ? (
            <p className="text-center py-4 text-red-500">Erreur lors du chargement des statistiques: {assignmentsError.message}</p>
          ) : (
            <>
              {/* Résumé des statistiques clés */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Participation</h3>
                  <div className="flex items-center">
                    <div className="text-3xl font-bold text-primary-600 mr-2">
                      {stats?.totalParticipationDays || 0}
                    </div>
                    <div className="text-gray-600">jours</div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Nombre de jours de bénévolat</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Heures de bénévolat</h3>
                  <div className="flex items-center">
                    <div className="text-3xl font-bold text-primary-600 mr-2">
                      {stats?.totalHours || 0}
                    </div>
                    <div className="text-gray-600">h</div>
                    <div className="text-3xl font-bold text-primary-600 mx-2">
                      {stats?.totalMinutes || 0}
                    </div>
                    <div className="text-gray-600">min</div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Temps total de bénévolat</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Collectes</h3>
                  <div className="flex items-center">
                    <div className="text-3xl font-bold text-primary-600 mr-2">
                      {stats?.totalCompletedAssignments || 0}
                    </div>
                    <div className="text-gray-600">collectes</div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Nombre de collectes effectuées</p>
                </div>
              </div>
              
              {/* Graphiques de statistiques */}
              <VolunteerStatsCharts stats={stats} />
            </>
          )}
        </div>
        
        {/* Affectations passées */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Affectations passées</h2>
          
          {assignmentsLoading ? (
            <p className="text-center py-4">Chargement des affectations...</p>
          ) : assignmentsError ? (
            <p className="text-center py-4 text-red-500">Erreur lors du chargement des affectations: {assignmentsError.message}</p>
          ) : pastAssignments.length === 0 ? (
            <p className="text-center py-4">Aucune affectation passée</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Événement
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Commerçant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produits
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pastAssignments.map((assignment) => (
                    <tr key={assignment._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.event?.name || `Événement à ${assignment.event?.location || 'lieu inconnu'}`}
                        </div>
                        <div className="text-xs text-gray-400">
                          Type: {assignment.event?.type || 'Non spécifié'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Lieu: {assignment.event?.location || 'Non spécifié'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {assignment.merchant?.businessName || 'Commerçant non spécifié'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {assignment.merchant?.address?.street ? 
                            `${assignment.merchant.address.street}, ${assignment.merchant.address.city || ''} ${assignment.merchant.address.postalCode || ''}` : 
                            (typeof assignment.merchant?.address === 'string' ? assignment.merchant.address : 'Adresse non spécifiée')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs break-words">
                          {formatProductsList(assignment.items)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {assignment.event?.date ? formatDate(assignment.event.date) : 'Date non spécifiée'}
                        </div>
                        <div className="text-xs text-gray-400">
                          Créé le: {formatDate(assignment.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          assignment.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : assignment.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {assignment.status === 'completed' 
                            ? 'Terminé' 
                            : assignment.status === 'in_progress'
                            ? 'En cours'
                            : 'En attente'}
                        </span>
                        {assignment.startTime && (
                          <div className="text-xs text-gray-500 mt-1">
                            Début: {formatDate(assignment.startTime)}
                          </div>
                        )}
                        {assignment.endTime && (
                          <div className="text-xs text-gray-500 mt-1">
                            Fin: {formatDate(assignment.endTime)}
                          </div>
                        )}
                        {assignment.duration > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Durée: {Math.floor(assignment.duration / 60)}h{assignment.duration % 60 > 0 ? ` ${assignment.duration % 60}min` : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 mr-3">
                          Détails
                        </button>
                        {assignment.status !== 'completed' && (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            onClick={() => markAssignmentAsCompleted(assignment._id)}
                          >
                            Marquer terminé
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de saisie des produits collectés */}
      <CollectionEntryModal
        assignment={selectedAssignment}
        isOpen={isEntryModalOpen}
        onClose={closeEntryModal}
        onUpdate={handleEntryUpdate}
      />
    </VolunteerLayout>
  );
}
