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
      
      // Afficher la structure détaillée pour le débogage
      console.log('Structure de la réponse:', {
        type: typeof allEvents,
        isArray: Array.isArray(allEvents),
        length: allEvents ? (Array.isArray(allEvents) ? allEvents.length : 'non-array') : 'null',
        sample: allEvents && Array.isArray(allEvents) && allEvents.length > 0 ? allEvents[0] : 'no sample'
      });
      
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
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du don:', error);
      toast.error('Impossible d\'enregistrer votre don');
    } finally {
      // Toujours fermer le modal, même en cas d'erreur
      setIsDonationModalOpen(false);
      // Réinitialiser l'événement sélectionné immédiatement
      setSelectedEvent(null);
      // S'assurer que le défilement est restauré
      document.body.style.overflow = 'auto';
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
        onClose={() => {
          // Fermer le modal
          setIsDonationModalOpen(false);
          // Réinitialiser l'événement sélectionné immédiatement
          setSelectedEvent(null);
          // S'assurer que le défilement est restauré
          document.body.style.overflow = 'auto';
        }}
        event={selectedEvent}
        onSubmit={handleDonationSubmit}
      />

      <div className="w-full max-w-full mx-auto px-4 py-4">
        {/* Section d'en-tête avec texte descriptif */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-xl p-8 sm:p-10 mb-10 text-white">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="md:w-2/3 pr-0 md:pr-8">
              <h1 className="text-4xl font-bold mb-6">Bienvenue dans votre espace commerçant</h1>
              <div className="w-full">
                <p className="text-xl mb-4">
                  En tant que partenaire de TANY, vous jouez un rôle essentiel dans notre mission de lutte contre le gaspillage alimentaire.
                </p>
                <p className="text-lg mb-4">
                  Grâce à vos dons, nous pouvons redistribuer des aliments de qualité aux personnes dans le besoin et réduire l'impact environnemental du gaspillage alimentaire.
                </p>
                <p className="text-lg">
                  Consultez les collectes à venir ci-dessous et participez en quelques clics en indiquant les produits que vous souhaitez donner.
                </p>
              </div>
            </div>
            
            {user && (
              <div className="mt-8 md:mt-0 md:w-1/3 bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm self-start">
                <h2 className="text-2xl font-semibold mb-4">Informations du compte</h2>
                <div>
                  <div className="mb-4">
                    <p className="text-base text-white text-opacity-80">Nom commercial</p>
                    <p className="text-xl font-medium">{user.businessName || user.name}</p>
                  </div>
                  <div>
                    <p className="text-base text-white text-opacity-80">Email</p>
                    <p className="text-xl font-medium">{user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tableau des événements de collecte */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8 w-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-primary-600">Collectes à venir</h2>
            {eventsLoading ? (
              <div className="flex items-center text-primary-600">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-600 mr-3"></div>
                <span className="text-lg">Chargement...</span>
              </div>
            ) : (
              <div className="text-lg text-gray-500 font-medium">
                {filteredEvents.length} collecte(s) trouvée(s)
              </div>
            )}
          </div>
          
          {/* Filtres */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Titre</label>
              <input
                type="text"
                name="title"
                value={filters.title}
                onChange={handleFilterChange}
                className="w-full p-4 text-lg border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                placeholder="Filtrer par titre"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Lieu</label>
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full p-4 text-lg border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                placeholder="Filtrer par lieu"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Date début (après)</label>
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full p-4 text-lg border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">Date fin (avant)</label>
              <div className="relative">
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full p-4 text-lg border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* Boutons de réinitialisation des filtres et de rafraîchissement */}
          <div className="mb-6 flex flex-wrap justify-end gap-4">
            <button
              onClick={() => fetchEvents()}
              className="px-6 py-3 text-lg bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors flex items-center font-medium shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Rafraîchir
            </button>
            <button
              onClick={resetFilters}
              className="px-6 py-3 text-lg bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium shadow-sm"
            >
              Réinitialiser les filtres
            </button>
          </div>
          
          {/* Tableau */}
          <div className="rounded-lg border border-gray-200 w-full">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                    Titre
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[12%]">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                    Lieu
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[46%] hidden md:table-cell">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-[7%]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eventsLoading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mr-3"></div>
                        <span className="text-gray-600 text-base">Chargement des événements...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <tr key={event._id || `event-${Math.random()}`} className="hover:bg-gray-50">
                      <td className="px-6 py-5">
                        <div className="text-base font-medium text-gray-900">{event.title}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-base text-gray-500">{formatDate(event.start)}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-base text-gray-500 break-words" title={event.location || "Non spécifié"}>
                          {event.location || "Non spécifié"}
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell">
                        <div className="text-base text-gray-500 break-words line-clamp-3" title={event.description || "Non spécifié"}>
                          {event.description || "Non spécifié"}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button 
                          className="px-3 py-2 bg-primary-600 text-white text-base font-medium rounded-md hover:bg-primary-700 transition-colors whitespace-nowrap"
                          onClick={() => handleDonateClick(event)}
                        >
                          Faire un don
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-base text-gray-500">
                      Aucun événement de collecte trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cartes d'accès rapide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
          {/* Carte pour les produits */}
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 hover:shadow-xl transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-primary-600">Mes Produits</h2>
              <div className="p-3 bg-primary-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <p className="text-lg text-gray-600 mb-6">Gérez les produits que vous proposez pour le glanage et suivez leur disponibilité.</p>
            <button 
              className="w-full py-3 px-6 bg-primary-100 text-primary-700 text-lg font-medium rounded-lg hover:bg-primary-200 transition-colors shadow-sm"
              onClick={() => alert('Fonctionnalité à venir')}
            >
              Voir mes produits
            </button>
          </div>

          {/* Carte pour les collectes */}
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 hover:shadow-xl transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-primary-600">Historique</h2>
              <div className="p-3 bg-primary-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-lg text-gray-600 mb-6">Consultez l'historique des collectes effectuées dans votre commerce et leurs résultats.</p>
            <button 
              className="w-full py-3 px-6 bg-primary-100 text-primary-700 text-lg font-medium rounded-lg hover:bg-primary-200 transition-colors shadow-sm"
              onClick={() => alert('Fonctionnalité à venir')}
            >
              Voir l'historique
            </button>
          </div>

          {/* Carte pour les statistiques */}
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 hover:shadow-xl transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-primary-600">Statistiques</h2>
              <div className="p-3 bg-primary-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-lg text-gray-600 mb-6">Visualisez l'impact de vos dons et contributions à la lutte contre le gaspillage alimentaire.</p>
            <button 
              className="w-full py-3 px-6 bg-primary-100 text-primary-700 text-lg font-medium rounded-lg hover:bg-primary-200 transition-colors shadow-sm"
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
