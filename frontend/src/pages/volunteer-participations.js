import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';
import VolunteerLayout from '../components/layout/VolunteerLayout';
import { useEvents } from '../services/swrHooks';

export default function VolunteerParticipationsPage() {
  const { user } = useAuth();
  const { data, error, isLoading, mutate } = useEvents();
  const [participations, setParticipations] = useState([]);
  const [upcomingParticipations, setUpcomingParticipations] = useState([]);
  const [pastParticipations, setPastParticipations] = useState([]);

  useEffect(() => {
    if (data && data.data) {
      // Simuler les participations du bénévole (à remplacer par une vraie API)
      // Dans une vraie application, vous auriez une API pour récupérer les participations du bénévole
      const mockParticipations = data.data.filter((_, index) => index % 3 === 0).map(event => ({
        id: event._id,
        eventId: event._id,
        title: event.name || event.title,
        date: event.date || event.start,
        endDate: event.end,
        location: event.location,
        type: event.type || event.status,
        status: Math.random() > 0.5 ? 'Confirmé' : 'En attente',
        completed: new Date(event.date || event.start) < new Date()
      }));
      
      setParticipations(mockParticipations);
      
      // Séparer les participations à venir et passées
      const now = new Date();
      setUpcomingParticipations(mockParticipations.filter(p => new Date(p.date) > now));
      setPastParticipations(mockParticipations.filter(p => new Date(p.date) <= now));
    }
  }, [data]);

  // Fonction pour formater la date en français
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fonction pour marquer une participation comme terminée
  const markAsCompleted = (id) => {
    // Dans une vraie application, vous feriez un appel API ici
    const updatedParticipations = participations.map(p => 
      p.id === id ? { ...p, completed: true } : p
    );
    setParticipations(updatedParticipations);
    
    // Mettre à jour les listes filtrées
    const now = new Date();
    setUpcomingParticipations(updatedParticipations.filter(p => new Date(p.date) > now));
    setPastParticipations(updatedParticipations.filter(p => new Date(p.date) <= now));
    
    alert('Participation marquée comme terminée !');
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
        <h1 className="text-3xl font-bold mb-6 text-primary-600">Mes Participations</h1>
        
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Participations totales</h3>
            <p className="text-3xl font-bold text-primary-600">{participations.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">À venir</h3>
            <p className="text-3xl font-bold text-blue-600">{upcomingParticipations.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2">Terminées</h3>
            <p className="text-3xl font-bold text-green-600">{pastParticipations.length}</p>
          </div>
        </div>
        
        {/* Participations à venir */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Participations à venir</h2>
          {isLoading ? (
            <p>Chargement des participations...</p>
          ) : error ? (
            <p className="text-red-500">Erreur lors du chargement des participations</p>
          ) : upcomingParticipations.length === 0 ? (
            <p>Aucune participation à venir</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Événement
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lieu
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
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
                  {upcomingParticipations.map((participation) => (
                    <tr key={participation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{participation.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(participation.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{participation.location || 'Non précisé'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" style={{
                          backgroundColor: `${getEventColor(participation.type)}20`,
                          color: getEventColor(participation.type)
                        }}>
                          {participation.type || 'Événement'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          participation.status === 'Confirmé' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {participation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 mr-3">
                          Détails
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Annuler
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Participations passées */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Participations passées</h2>
          {isLoading ? (
            <p>Chargement des participations...</p>
          ) : error ? (
            <p className="text-red-500">Erreur lors du chargement des participations</p>
          ) : pastParticipations.length === 0 ? (
            <p>Aucune participation passée</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Événement
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lieu
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
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
                  {pastParticipations.map((participation) => (
                    <tr key={participation.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{participation.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(participation.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{participation.location || 'Non précisé'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" style={{
                          backgroundColor: `${getEventColor(participation.type)}20`,
                          color: getEventColor(participation.type)
                        }}>
                          {participation.type || 'Événement'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          participation.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {participation.completed ? 'Terminé' : 'Non terminé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900 mr-3">
                          Détails
                        </button>
                        {!participation.completed && (
                          <button 
                            className="text-green-600 hover:text-green-900"
                            onClick={() => markAsCompleted(participation.id)}
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
    </VolunteerLayout>
  );
}
