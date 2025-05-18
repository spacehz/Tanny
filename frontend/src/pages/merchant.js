import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/layout/Layout';
import { getEvents } from '../services/eventService';
import { createDonation } from '../services/donationService';
import DonationModal from '../components/DonationModal';
import { toast } from 'react-toastify';
import { checkBackendAvailability } from '../services/api';

const MerchantDashboard = () => {
  const { user, isAuthenticated, isMerchant } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
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
  
  // Vérifier la disponibilité du backend
  const checkBackend = useCallback(async () => {
    try {
      const isAvailable = await checkBackendAvailability();
      setBackendAvailable(isAvailable);
      return isAvailable;
    } catch (error) {
      console.error('Erreur lors de la vérification du backend:', error);
      setBackendAvailable(false);
      return false;
    }
  }, []);

  // Récupérer les événements de collecte
  const fetchEvents = useCallback(async () => {
    try {
      setEventsLoading(true);
      
      // Vérifier si le backend est disponible
      const isAvailable = await checkBackend();
      if (!isAvailable) {
        toast.error('Le serveur n\'est pas disponible. Veuillez réessayer plus tard.');
        setEvents([]);
        setFilteredEvents([]);
        return;
      }
      
      // Préparer les options de filtrage
      const options = {
        type: 'collecte', // Filtrer directement par type "collecte"
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        location: filters.location || undefined
      };
      
      // Récupérer les événements de collecte depuis l'API
      const collecteEvents = await getEvents(options);
      console.log('Événements de collecte récupérés:', collecteEvents);
      
      // Réinitialiser le compteur de tentatives car la requête a réussi
      setRetryCount(0);
      
      if (!collecteEvents || !Array.isArray(collecteEvents)) {
        console.error('Format de données invalide:', collecteEvents);
        toast.error('Format de données invalide');
        setEvents([]);
        setFilteredEvents([]);
        return;
      }
      
      // Filtrer strictement pour n'inclure que les événements de type "collecte" et exclure les événements de type "marché"
      const strictlyFilteredEvents = collecteEvents.filter(event => {
        // Vérifier si le type est exactement "collecte"
        const isCollecte = event.type === 'collecte';
        // Vérifier que ce n'est pas un événement de type "marché"
        const isNotMarche = event.type !== 'marché';
        // Ne garder que les événements qui sont de type collecte et pas de type marché
        return isCollecte && isNotMarche;
      });
      
      console.log('Événements strictement filtrés:', strictlyFilteredEvents);
      
      // Ajouter un ID temporaire si nécessaire pour éviter les erreurs de clé React
      const eventsWithIds = strictlyFilteredEvents.map(event => ({
        ...event,
        _id: event._id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));
      
      setEvents(eventsWithIds);
      
      // Appliquer le filtre de titre localement (car l'API ne le gère peut-être pas)
      let filtered = [...eventsWithIds];
      if (filters.title) {
        filtered = filtered.filter(event => 
          event.title.toLowerCase().includes(filters.title.toLowerCase())
        );
      }
      
      setFilteredEvents(filtered);
      
      // Si aucun événement n'est trouvé, afficher un message
      if (eventsWithIds.length === 0) {
        toast.info('Aucun événement de collecte n\'est disponible actuellement');
      } else {
        toast.success(`${eventsWithIds.length} événements de collecte chargés`);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
      
      // Incrémenter le compteur de tentatives
      setRetryCount(prev => prev + 1);
      
      // Vérifier si l'erreur est due à un problème de connexion au serveur
      if (error.message === 'Backend unavailable' || 
          error.message.includes('Network Error') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('ECONNREFUSED')) {
        setBackendAvailable(false);
        toast.error('Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet ou réessayer plus tard.');
      } else if (error.response && error.response.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        // Rediriger vers la page de connexion après un court délai
        setTimeout(() => {
          router.push('/login?session=expired');
        }, 2000);
      } else {
        toast.error('Impossible de charger les événements de collecte');
      }
      
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setEventsLoading(false);
    }
  }, [checkBackend, filters, router]);
  
  // Effet pour réessayer automatiquement si le backend n'est pas disponible
  useEffect(() => {
    if (!backendAvailable && retryCount < 3) {
      const retryTimer = setTimeout(() => {
        console.log(`Tentative de reconnexion au backend (${retryCount + 1}/3)...`);
        fetchEvents();
      }, 5000 * (retryCount + 1)); // Augmenter le délai à chaque tentative
      
      return () => clearTimeout(retryTimer);
    }
  }, [backendAvailable, retryCount, fetchEvents]);
  
  // Rafraîchir les événements périodiquement pour assurer la synchronisation
  useEffect(() => {
    // Ne configurer l'intervalle que si l'utilisateur est authentifié et est un commerçant
    if (isAuthenticated && checkIsMerchant() && !loading) {
      console.log('Configuration du rafraîchissement périodique des événements');
      
      let refreshInterval;
      
      // Vérifier d'abord si le backend est disponible
      checkBackend().then(isAvailable => {
        if (isAvailable) {
          // Rafraîchir immédiatement
          fetchEvents();
          
          // Puis configurer un intervalle pour rafraîchir périodiquement
          refreshInterval = setInterval(() => {
            console.log('Rafraîchissement périodique des événements...');
            // Vérifier si aucun filtre n'est actif avant de rafraîchir automatiquement
            const hasActiveFilters = filters.title || filters.location || filters.startDate || filters.endDate;
            if (!hasActiveFilters && backendAvailable) {
              fetchEvents();
            }
          }, 300000); // Rafraîchir toutes les 5 minutes (300000ms) pour réduire la charge serveur
        } else {
          console.log('Backend non disponible, pas de rafraîchissement périodique');
        }
      });
      
      // Nettoyer l'intervalle lors du démontage du composant
      return () => {
        if (refreshInterval) {
          clearInterval(refreshInterval);
        }
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, loading, backendAvailable, filters.title, filters.location, filters.startDate, filters.endDate]);

  // Appliquer les filtres aux événements ou déclencher une nouvelle requête
  useEffect(() => {
    // Si les filtres de date ou de lieu changent, on refait une requête au backend
    if (filters.startDate || filters.endDate || filters.location) {
      fetchEvents();
    } else {
      // Pour le filtre de titre, on l'applique localement
      let result = [...events];
      
      // Filtre par titre
      if (filters.title) {
        result = result.filter(event => 
          event.title.toLowerCase().includes(filters.title.toLowerCase())
        );
      }
      
      setFilteredEvents(result);
    }
  }, [filters.title]); // Ne réagir qu'aux changements du filtre de titre
  
  // Effet séparé pour refaire une requête quand les filtres de date ou de lieu changent
  useEffect(() => {
    // Éviter de déclencher au premier rendu
    if (events.length > 0 && (filters.startDate || filters.endDate || filters.location)) {
      fetchEvents();
    }
  }, [filters.startDate, filters.endDate, filters.location]);

  // Gérer le changement de filtre avec debounce pour éviter trop de requêtes
  const [filterTimeout, setFilterTimeout] = useState(null);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Mettre à jour l'état des filtres immédiatement pour l'UI
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Pour le filtre de titre, ajouter un délai avant d'appliquer
    if (name === 'title') {
      // Annuler le timeout précédent s'il existe
      if (filterTimeout) {
        clearTimeout(filterTimeout);
      }
      
      // Créer un nouveau timeout
      const newTimeout = setTimeout(() => {
        // Le filtre de titre est appliqué via l'useEffect qui surveille filters.title
      }, 300); // 300ms de délai
      
      setFilterTimeout(newTimeout);
    }
  };

  // Réinitialiser tous les filtres et recharger les données
  const resetFilters = () => {
    setFilters({
      title: '',
      location: '',
      startDate: '',
      endDate: ''
    });
    
    // Recharger les événements sans filtres
    setTimeout(() => {
      fetchEvents();
    }, 100);
  };

  // Ouvrir le modal de donation pour un événement
  const handleDonateClick = (event) => {
    setSelectedEvent(event);
    setIsDonationModalOpen(true);
  };

  // Gérer la soumission du formulaire de donation
  const handleDonationSubmit = async (donationData) => {
    try {
      setEventsLoading(true); // Indiquer que le traitement est en cours
      
      // Envoyer la donation au backend
      const response = await createDonation(donationData);
      
      // Afficher un message de succès
      toast.success('Votre don a été enregistré avec succès');
      
      // Proposer de voir les dons
      const viewDonations = window.confirm('Votre don a été enregistré avec succès. Voulez-vous consulter la liste de vos dons?');
      
      if (viewDonations) {
        // Rediriger vers la page des dons
        router.push('/merchant-donations');
      } else {
        // Rafraîchir la liste des événements pour mettre à jour les statuts
        fetchEvents();
      }
      
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du don:', error);
      
      // Afficher un message d'erreur plus précis
      if (error.message) {
        toast.error(`Erreur: ${error.message}`);
      } else {
        toast.error('Impossible d\'enregistrer votre don');
      }
      
      return null;
    } finally {
      setEventsLoading(false);
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
                ) : !backendAvailable ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-800 mb-2">Connexion au serveur impossible</p>
                        <p className="text-gray-600 mb-4">Nous ne pouvons pas récupérer les données depuis le serveur.</p>
                        <button 
                          onClick={() => {
                            setEventsLoading(true);
                            checkBackend().then(isAvailable => {
                              if (isAvailable) {
                                fetchEvents();
                              } else {
                                setEventsLoading(false);
                              }
                            });
                          }}
                          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                        >
                          Réessayer
                        </button>
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
                          className="px-3 py-2 bg-primary-600 text-white text-base font-medium rounded-md hover:bg-primary-700 transition-colors whitespace-nowrap flex items-center justify-center min-w-[120px]"
                          onClick={() => handleDonateClick(event)}
                          disabled={eventsLoading}
                        >
                          {eventsLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                              Chargement...
                            </>
                          ) : (
                            'Faire un don'
                          )}
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

        {/* Carte d'accès rapide */}
        <div className="w-full">
          {/* Carte pour les dons */}
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 hover:shadow-xl transition-shadow border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-primary-600">Mes Dons</h2>
              <div className="p-3 bg-primary-50 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a4 4 0 112.76 3.77c.08-.65.14-1.3.14-1.77V6a4 4 0 00-8 0v7H4.5m8 5l-5-5m0 0l5-5m-5 5h10" />
                </svg>
              </div>
            </div>
            <p className="text-lg text-gray-600 mb-6">Consultez l'historique de vos dons et suivez leur impact dans la lutte contre le gaspillage alimentaire.</p>
            <Link href="/merchant-donations">
              <button 
                className="w-full py-3 px-6 bg-primary-100 text-primary-700 text-lg font-medium rounded-lg hover:bg-primary-200 transition-colors shadow-sm"
              >
                Voir mes dons
              </button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MerchantDashboard;
