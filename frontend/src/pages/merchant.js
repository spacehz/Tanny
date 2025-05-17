import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { getEvents } from '../services/eventService';
import { createDonation } from '../services/donationService';
import DonationModal from '../components/DonationModal';
import { toast } from 'react-toastify';

const MerchantDashboard = () => {
  const { user, isAuthenticated, isMerchant } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    title: '',
    location: '',
    startDate: '',
    endDate: ''
  });
  
  // Fonction pour vérifier directement si l'utilisateur est un commerçant
  const checkIsMerchant = () => {
    if (!user) return false;
    
    const role = user.role ? user.role.toLowerCase() : '';
    return role === 'merchant' || role === 'commercant' || role === 'commerçant' || role === 'admin';
  };

  // Vérifier l'authentification et les droits d'accès
  useEffect(() => {
    // Attendre un court délai pour s'assurer que les données d'authentification sont chargées
    const timer = setTimeout(() => {
      const checkAccess = async () => {
        if (!isAuthenticated) {
          // Rediriger vers la page de connexion si non authentifié
          router.push('/login?role=merchant&redirect=%2Fmerchant');
        } else {
          // Vérifier si l'utilisateur est un commerçant
          console.log('Vérification des droits d\'accès:');
          console.log('Utilisateur:', user);
          console.log('Rôle:', user?.role);
          console.log('Est commerçant (fonction isMerchant)?', isMerchant());
          console.log('Est commerçant (vérification directe)?', checkIsMerchant());
          
          // Vérifier si l'email correspond à notre commerçant de test
          const isTestMerchant = user?.email === 'boulangerie@tany.org';
          
          if (!checkIsMerchant() && !isTestMerchant) {
            // Rediriger vers la page d'accueil si authentifié mais pas commerçant
            console.log('L\'utilisateur n\'est pas un commerçant, redirection...');
            router.push('/');
            // Suppression de l'alerte pour éviter le popup
          } else {
            console.log('L\'utilisateur est un commerçant, accès autorisé');
            setLoading(false);
            fetchEvents();
          }
        }
      };
      
      checkAccess();
    }, 500); // Attendre 500ms pour s'assurer que les données sont chargées
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, isMerchant, loading, router, user]);
  
  // Rafraîchir les événements périodiquement pour assurer la synchronisation
  useEffect(() => {
    // Ne configurer l'intervalle que si l'utilisateur est authentifié et est un commerçant
    if (isAuthenticated && checkIsMerchant() && !loading) {
      console.log('Configuration du rafraîchissement périodique des événements');
      
      // Rafraîchir immédiatement
      fetchEvents();
      
      // Puis configurer un intervalle pour rafraîchir périodiquement
      const refreshInterval = setInterval(() => {
        console.log('Rafraîchissement périodique des événements...');
        fetchEvents();
      }, 60000); // Rafraîchir toutes les 60 secondes
      
      // Nettoyer l'intervalle lors du démontage du composant
      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated, loading]);

  // Récupérer les événements de collecte
  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      
      // Récupérer tous les événements
      const allEvents = await getEvents();
      console.log('Tous les événements récupérés:', allEvents);
      
      if (!allEvents || !Array.isArray(allEvents)) {
        console.error('Format de données invalide:', allEvents);
        toast.error('Format de données invalide');
        return;
      }
      
      // Filtrer pour ne garder que les événements de type "collecte"
      const collecteEvents = allEvents.filter(event => {
        // S'assurer que l'événement est un objet valide
        if (!event || typeof event !== 'object') return false;
        
        // Vérifier strictement le type "collecte"
        const eventType = event.type ? event.type.toLowerCase() : '';
        const isCollecte = eventType === 'collecte';
        
        console.log(`Événement "${event.title || 'Sans titre'}" - Type: "${event.type || 'Non défini'}" - Est collecte: ${isCollecte}`);
        
        return isCollecte;
      });
      
      console.log('Événements de collecte filtrés:', collecteEvents);
      
      // Ajouter un ID temporaire si nécessaire pour éviter les erreurs de clé React
      const eventsWithIds = collecteEvents.map(event => ({
        ...event,
        _id: event._id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));
      
      setEvents(eventsWithIds);
      setFilteredEvents(eventsWithIds);
      
      // Si aucun événement n'est trouvé, afficher un message
      if (eventsWithIds.length === 0) {
        toast.info('Aucun événement de collecte n\'est disponible actuellement');
      } else {
        toast.success(`${eventsWithIds.length} événements de collecte chargés`);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      toast.error('Impossible de charger les événements de collecte');
    } finally {
      setEventsLoading(false);
    }
  };

  // Appliquer les filtres aux événements
  useEffect(() => {
    let result = [...events];
    
    // Filtre par titre
    if (filters.title) {
      result = result.filter(event => 
        event.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }
    
    // Filtre par lieu
    if (filters.location) {
      result = result.filter(event => 
        event.location && event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Filtre par date de début
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      result = result.filter(event => 
        new Date(event.start) >= startDate
      );
    }
    
    // Filtre par date de fin
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Fin de la journée
      result = result.filter(event => 
        new Date(event.end) <= endDate
      );
    }
    
    setFilteredEvents(result);
  }, [events, filters]);

  // Gérer le changement de filtre
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setFilters({
      title: '',
      location: '',
      startDate: '',
      endDate: ''
    });
  };

  // Ouvrir le modal de donation pour un événement
  const handleDonateClick = (event) => {
    setSelectedEvent(event);
    setIsDonationModalOpen(true);
  };

  // Gérer la soumission du formulaire de donation
  const handleDonationSubmit = async (donationData) => {
    try {
      await createDonation(donationData);
      toast.success('Votre don a été enregistré avec succès');
      setIsDonationModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du don:', error);
      toast.error('Impossible d\'enregistrer votre don');
    }
  };
  
  // Fonction pour ajouter un événement de test (pour déboguer)
  const addTestEvent = () => {
    const newEvent = {
      _id: `test-${Date.now()}`,
      title: `Collecte test ${new Date().toLocaleTimeString('fr-FR')}`,
      type: 'collecte',
      start: new Date().toISOString(),
      end: new Date(Date.now() + 3600000).toISOString(),
      location: 'Emplacement test',
      description: 'Événement de test pour déboguer l\'affichage',
      expectedVolunteers: 2,
      volunteers: []
    };
    
    setEvents(prev => [...prev, newEvent]);
    setFilteredEvents(prev => [...prev, newEvent]);
    toast.info('Événement de test ajouté');
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      
      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        console.warn(`Date invalide: ${dateString}`);
        return "Date invalide";
      }
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error(`Erreur lors du formatage de la date ${dateString}:`, error);
      return "Erreur de date";
    }
  };

  if (loading || !isAuthenticated || !checkIsMerchant()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Espace Commerçant | TANY</title>
        <meta name="description" content="Espace commerçant de l'application TANY" />
      </Head>
      
      {/* Modal de donation */}
      <DonationModal 
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        event={selectedEvent}
        onSubmit={handleDonationSubmit}
      />

      <div className="w-full max-w-5xl mx-auto px-4 py-4">
        {/* Section d'en-tête avec texte descriptif */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-xl p-6 sm:p-8 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-4">Bienvenue dans votre espace commerçant</h1>
          <div className="w-full">
            <p className="text-lg mb-4">
              En tant que partenaire de TANY, vous jouez un rôle essentiel dans notre mission de lutte contre le gaspillage alimentaire.
            </p>
            <p className="mb-4">
              Grâce à vos dons, nous pouvons redistribuer des aliments de qualité aux personnes dans le besoin et réduire l'impact environnemental du gaspillage alimentaire.
            </p>
            <p>
              Consultez les collectes à venir ci-dessous et participez en quelques clics en indiquant les produits que vous souhaitez donner.
            </p>
          </div>
          
          {user && (
            <div className="mt-6 bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-2">Informations du compte</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-white text-opacity-80">Nom commercial</p>
                  <p className="font-medium">{user.businessName || user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-white text-opacity-80">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tableau des événements de collecte */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8 w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary-600">Collectes à venir</h2>
            {eventsLoading ? (
              <div className="flex items-center text-primary-600">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-600 mr-2"></div>
                <span>Chargement...</span>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                {filteredEvents.length} collecte(s) trouvée(s)
              </div>
            )}
          </div>
          
          {/* Filtres */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input
                type="text"
                name="title"
                value={filters.title}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Filtrer par titre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Filtrer par lieu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date début (après)</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin (avant)</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          {/* Boutons de réinitialisation des filtres et de rafraîchissement */}
          <div className="mb-4 flex justify-end space-x-2">
            <button
              onClick={() => fetchEvents()}
              className="px-4 py-2 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Rafraîchir
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Réinitialiser les filtres
            </button>
            <button
              onClick={addTestEvent}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center"
              title="Ajouter un événement de test pour déboguer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Test
            </button>
          </div>
          
          {/* Tableau */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 w-full">
            <table className="w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%]">
                    Titre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Lieu
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[25%] hidden md:table-cell">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%] hidden sm:table-cell">
                    Bénévoles
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[10%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eventsLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mr-3"></div>
                        <span className="text-gray-600">Chargement des événements...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <tr key={event._id || `event-${Math.random()}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(event.start)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 truncate max-w-[150px]" title={event.location || "Non spécifié"}>
                          {event.location || "Non spécifié"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-500 truncate max-w-[200px]" title={event.description || "Non spécifié"}>
                          {event.description || "Non spécifié"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm text-gray-500">
                          {event.volunteers?.length || 0}/{event.expectedVolunteers || 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                          onClick={() => handleDonateClick(event)}
                        >
                          Faire un don
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      Aucun événement de collecte trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cartes d'accès rapide (conservées de la version précédente) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
          {/* Carte pour les produits */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-primary-600">Mes Produits</h2>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Gérez les produits que vous proposez pour le glanage.</p>
            <button 
              className="w-full py-2 px-4 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
              onClick={() => alert('Fonctionnalité à venir')}
            >
              Voir mes produits
            </button>
          </div>

          {/* Carte pour les collectes */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-primary-600">Historique</h2>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Consultez l'historique des collectes effectuées dans votre commerce.</p>
            <button 
              className="w-full py-2 px-4 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
              onClick={() => alert('Fonctionnalité à venir')}
            >
              Voir l'historique
            </button>
          </div>

          {/* Carte pour les statistiques */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-primary-600">Statistiques</h2>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600 mb-4">Visualisez l'impact de vos dons et contributions.</p>
            <button 
              className="w-full py-2 px-4 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
              onClick={() => alert('Fonctionnalité à venir')}
            >
              Voir les statistiques
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MerchantDashboard;
