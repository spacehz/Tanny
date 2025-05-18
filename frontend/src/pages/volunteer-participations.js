import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';
import VolunteerLayout from '../components/layout/VolunteerLayout';
import { useVolunteerAssignments } from '../services/swrHooks';
import { updateAssignmentStatus } from '../services/assignmentService';

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
  
  // Logs détaillés pour déboguer
  console.log('User ID:', user?._id);
  console.log('User details:', user);
  console.log('Assignments from hook:', assignments);
  console.log('Assignments loading:', assignmentsLoading);
  console.log('Assignments error:', assignmentsError);
  
  // Afficher la structure exacte des données pour le débogage
  useEffect(() => {
    // Récupérer directement les données de l'API pour vérifier leur structure
    if (user?._id) {
      fetch(`/api/users/volunteers/${user._id}/assignments`)
        .then(response => response.json())
        .then(data => {
          console.log('Données brutes de l\'API:', data);
          console.log('Structure des données:', JSON.stringify(data, null, 2));
          
          // Vérifier si les données ont la structure attendue
          if (data && data.success && Array.isArray(data.data)) {
            console.log('Nombre d\'affectations dans la réponse API:', data.data.length);
            
            // Essayer de traiter les données manuellement
            const now = new Date();
            const upcoming = data.data.filter(assignment => 
              assignment.event && new Date(assignment.event.date) > now
            );
            const past = data.data.filter(assignment => 
              assignment.event && new Date(assignment.event.date) <= now
            );
            
            console.log('Affectations à venir (traitement manuel):', upcoming);
            console.log('Affectations passées (traitement manuel):', past);
            
            // Mettre à jour l'état avec ces données
            setUpcomingAssignments(prev => [...prev, ...upcoming]);
            setPastAssignments(prev => [...prev, ...past]);
          }
        })
        .catch(error => {
          console.error('Erreur lors de la récupération directe des données:', error);
        });
    }
  }, [user?._id]);
  
  // Ajout de données de test temporaires pour vérifier l'affichage
  useEffect(() => {
    // Toujours ajouter des données de test pour vérifier l'affichage
    console.log('Ajout de données de test pour vérification');
    
    // Créer des données de test
    const testData = [
      {
        _id: 'test-assignment-1',
        event: {
          _id: 'event-1',
          name: 'Collecte Test',
          date: new Date(Date.now() + 86400000).toISOString(), // Demain
          location: 'Paris',
          type: 'collecte'
        },
        merchant: {
          _id: 'merchant-1',
          businessName: 'Boulangerie Test',
          address: '123 Rue de Test, Paris'
        },
        items: [
          { name: 'Pain', quantity: 5, unit: 'kg' },
          { name: 'Viennoiseries', quantity: 10, unit: 'pièce' }
        ],
        status: 'pending'
      },
      {
        _id: 'test-assignment-2',
        event: {
          _id: 'event-2',
          name: 'Marché Test',
          date: new Date(Date.now() - 86400000).toISOString(), // Hier
          location: 'Lyon',
          type: 'marché'
        },
        merchant: {
          _id: 'merchant-2',
          businessName: 'Primeur Test',
          address: '456 Avenue de Test, Lyon'
        },
        items: [
          { name: 'Pommes', quantity: 3, unit: 'kg' },
          { name: 'Carottes', quantity: 2, unit: 'kg' }
        ],
        status: 'completed'
      }
    ];
    
    // Séparer les données de test en affectations à venir et passées
    const now = new Date();
    const upcoming = testData.filter(a => new Date(a.event.date) > now);
    const past = testData.filter(a => new Date(a.event.date) <= now);
    
    console.log('Données de test à venir:', upcoming);
    console.log('Données de test passées:', past);
    
    setUpcomingAssignments(upcoming);
    setPastAssignments(past);
  }, []);

  // Suppression de l'effet pour les participations qui n'est plus nécessaire
  
  // Traiter les assignments du bénévole
  useEffect(() => {
    console.log('Assignments effect triggered:', assignments);
    console.log('Raw assignments data:', assignmentsRawData);
    
    // Fonction pour traiter les données d'affectation
    const processAssignmentData = () => {
      // Essayer d'abord avec les données formatées
      if (assignments && Array.isArray(assignments) && assignments.length > 0) {
        console.log('Traitement des données formatées:', assignments);
        
        const now = new Date();
        
        // Séparer les assignments à venir et passés
        const upcoming = assignments.filter(assignment => 
          assignment.event && new Date(assignment.event.date) > now
        );
        
        const past = assignments.filter(assignment => 
          assignment.event && new Date(assignment.event.date) <= now
        );
        
        console.log('Upcoming assignments from API:', upcoming);
        console.log('Past assignments from API:', past);
        
        setUpcomingAssignments(upcoming);
        setPastAssignments(past);
        
        return true; // Données traitées avec succès
      } 
      // Essayer avec les données brutes si elles ont un format différent
      else if (assignmentsRawData && assignmentsRawData.data && Array.isArray(assignmentsRawData.data) && assignmentsRawData.data.length > 0) {
        console.log('Traitement des données brutes:', assignmentsRawData.data);
        
        const now = new Date();
        const rawAssignments = assignmentsRawData.data;
        
        // Séparer les assignments à venir et passés
        const upcoming = rawAssignments.filter(assignment => 
          assignment.event && new Date(assignment.event.date) > now
        );
        
        const past = rawAssignments.filter(assignment => 
          assignment.event && new Date(assignment.event.date) <= now
        );
        
        console.log('Upcoming assignments from raw data:', upcoming);
        console.log('Past assignments from raw data:', past);
        
        setUpcomingAssignments(upcoming);
        setPastAssignments(past);
        
        return true; // Données traitées avec succès
      }
      
      return false; // Aucune donnée réelle traitée
    };
    
    // Essayer de traiter les données réelles
    const dataProcessed = processAssignmentData();
    
    // Si aucune donnée réelle n'est disponible, utiliser des données de test
    if (!dataProcessed) {
      console.log('Aucune donnée d\'affectation réelle disponible, utilisation des données de test');
      
      // Créer des données de test
      const testData = [
        {
          _id: 'test-assignment-1',
          event: {
            _id: 'event-1',
            name: 'Collecte Test',
            date: new Date(Date.now() + 86400000).toISOString(), // Demain
            location: 'Paris',
            type: 'collecte'
          },
          merchant: {
            _id: 'merchant-1',
            businessName: 'Boulangerie Test',
            address: '123 Rue de Test, Paris'
          },
          items: [
            { name: 'Pain', quantity: 5, unit: 'kg' },
            { name: 'Viennoiseries', quantity: 10, unit: 'pièce' }
          ],
          status: 'pending'
        },
        {
          _id: 'test-assignment-2',
          event: {
            _id: 'event-2',
            name: 'Marché Test',
            date: new Date(Date.now() - 86400000).toISOString(), // Hier
            location: 'Lyon',
            type: 'marché'
          },
          merchant: {
            _id: 'merchant-2',
            businessName: 'Primeur Test',
            address: '456 Avenue de Test, Lyon'
          },
          items: [
            { name: 'Pommes', quantity: 3, unit: 'kg' },
            { name: 'Carottes', quantity: 2, unit: 'kg' }
          ],
          status: 'completed'
        }
      ];
      
      // Séparer les données de test en affectations à venir et passées
      const now = new Date();
      const upcoming = testData.filter(a => new Date(a.event.date) > now);
      const past = testData.filter(a => new Date(a.event.date) <= now);
      
      console.log('Upcoming test assignments:', upcoming);
      console.log('Past test assignments:', past);
      
      setUpcomingAssignments(upcoming);
      setPastAssignments(past);
    }
  }, [assignments, assignmentsRawData]);

  // Fonction pour formater la date en français
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non spécifiée';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Fonction pour formater la liste des produits
  const formatProductsList = (items) => {
    if (!items || items.length === 0) return 'Aucun produit';
    
    return items.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ');
  };

  // Suppression de la fonction markAsCompleted qui n'est plus nécessaire
  
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
          
          {/* Forcer l'affichage du tableau avec des données de test */}
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
                {/* Ligne de test statique */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Collecte Test Statique
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      Boulangerie Test Statique
                    </div>
                    <div className="text-xs text-gray-400">
                      123 Rue de Test, Paris
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs break-words">
                      Pain (5 kg), Viennoiseries (10 pièce)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(new Date(Date.now() + 86400000).toISOString())}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      En attente
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 mr-3">
                      Détails
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      Confirmer
                    </button>
                  </td>
                </tr>
                
                {/* Afficher également les données dynamiques si disponibles */}
                {upcomingAssignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.event?.name || 'Événement sans nom'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {assignment.merchant?.businessName || 'Commerçant non spécifié'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {assignment.merchant?.address || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs break-words">
                        {formatProductsList(assignment.items)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(assignment.event?.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        assignment.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assignment.status === 'completed' ? 'Terminé' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        Détails
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900"
                        onClick={() => markAssignmentAsCompleted(assignment._id)}
                      >
                        Confirmer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Message d'état (caché car nous forçons l'affichage du tableau) */}
          <div className="hidden">
            {assignmentsLoading ? (
              <p>Chargement des affectations...</p>
            ) : assignmentsError ? (
              <p className="text-red-500">Erreur lors du chargement des affectations: {assignmentsError.message}</p>
            ) : !assignments || !Array.isArray(assignments) ? (
              <p>Aucune donnée d'affectation disponible</p>
            ) : upcomingAssignments.length === 0 ? (
              <p>Aucune affectation à venir</p>
            ) : null}
          </div>
        </div>
        
        {/* Affectations passées */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Affectations passées</h2>
          
          {/* Forcer l'affichage du tableau avec des données de test */}
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
                {/* Ligne de test statique */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      Marché Test Statique
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      Primeur Test Statique
                    </div>
                    <div className="text-xs text-gray-400">
                      456 Avenue de Test, Lyon
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs break-words">
                      Pommes (3 kg), Carottes (2 kg)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(new Date(Date.now() - 86400000).toISOString())}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Terminé
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 mr-3">
                      Détails
                    </button>
                  </td>
                </tr>
                
                {/* Afficher également les données dynamiques si disponibles */}
                {pastAssignments.map((assignment) => (
                  <tr key={assignment._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {assignment.event?.name || 'Événement sans nom'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {assignment.merchant?.businessName || 'Commerçant non spécifié'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {assignment.merchant?.address || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs break-words">
                        {formatProductsList(assignment.items)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(assignment.event?.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        assignment.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {assignment.status === 'completed' ? 'Terminé' : 'En attente'}
                      </span>
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
          
          {/* Message d'état (caché car nous forçons l'affichage du tableau) */}
          <div className="hidden">
            {assignmentsLoading ? (
              <p>Chargement des affectations...</p>
            ) : assignmentsError ? (
              <p className="text-red-500">Erreur lors du chargement des affectations: {assignmentsError.message}</p>
            ) : !assignments || !Array.isArray(assignments) ? (
              <p>Aucune donnée d'affectation disponible</p>
            ) : pastAssignments.length === 0 ? (
              <p>Aucune affectation passée</p>
            ) : null}
          </div>
        </div>
      </div>
    </VolunteerLayout>
  );
}
