import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import Head from 'next/head';
import VolunteerLayout from '../components/layout/VolunteerLayout';
import { useEvents } from '../services/swrHooks';
import Link from 'next/link';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import calendarStyles from '../styles/FullCalendar.module.css';
import EventDetailsModal from '../components/EventDetailsModal';
import TablePagination from '../components/TablePagination';
import TableSearch from '../components/TableSearch';
import { registerForEvent, unregisterFromEvent } from '../services/eventService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function VolunteerPage() {
  const { user } = useAuth();
  const { data, error, isLoading, mutate } = useEvents();
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  
  // États pour la pagination, la recherche et le tri
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'start', direction: 'asc' });

  useEffect(() => {
    if (data && data.data) {
      // Ajouter un log pour voir la structure des données d'événements
      console.log('Données d\'événements reçues de l\'API:', data.data);
      console.log('Nombre total d\'événements reçus:', data.data.length);
      
      // Formater les événements pour FullCalendar
      const formattedEvents = data.data.map(event => {
        // Déterminer le nombre total de bénévoles attendus
        // Utiliser spécifiquement le champ ExpectedVolunteers
        console.log(`  ID de l'événement:`, event._id);
        console.log(`  Champ ExpectedVolunteers:`, event.ExpectedVolunteers);
        console.log(`  Champ expectedVolunteers (minuscule):`, event.expectedVolunteers);
        console.log(`  Tous les champs de l'événement:`, event);
        
        // Vérifier spécifiquement l'événement avec ID 68236383c4f5da564a83e6ab
        if (event._id === '68236383c4f5da564a83e6ab' || event._id?.toString() === '68236383c4f5da564a83e6ab') {
          console.log('ÉVÉNEMENT TROUVÉ: ID 68236383c4f5da564a83e6ab');
          console.log('Données complètes:', event);
        }
        
        // Utiliser le champ ExpectedVolunteers ou expectedVolunteers ou une valeur par défaut de 5
        const totalVolunteersNeeded = event.ExpectedVolunteers || event.expectedVolunteers || 5;
        
        // Vérifier si le champ volunteers existe et est un array
        const volunteersArray = event.volunteers || [];
        console.log(`  Champ volunteers:`, event.volunteers);
        
        // S'assurer que nous utilisons bien un array et que nous comptons correctement les bénévoles
        const registeredVolunteers = Array.isArray(volunteersArray) ? volunteersArray.length : 0;
        
        // Calculer le nombre de places restantes
        const availableSpots = Math.max(0, totalVolunteersNeeded - registeredVolunteers);
        
        console.log(`Événement: ${event.name || event.title}`);
        console.log(`  Total attendu: ${totalVolunteersNeeded}`);
        console.log(`  Bénévoles inscrits:`, volunteersArray);
        console.log(`  Nombre de bénévoles inscrits: ${registeredVolunteers}`);
        console.log(`  Places restantes: ${availableSpots}`);
        
        // Créer une copie complète de l'événement pour éviter les références circulaires
        const eventCopy = { ...event };
        
        return {
          id: event._id,
          title: event.name || event.title,
          start: event.date || event.start,
          end: event.end,
          backgroundColor: getEventColor(event.type || event.status),
          borderColor: getEventColor(event.type || event.status),
          extendedProps: {
            location: event.location,
            description: event.description,
            type: event.type || event.status,
            volunteersNeeded: totalVolunteersNeeded,
            registeredVolunteers: registeredVolunteers,
            availableSpots: availableSpots,
            // Conserver les données brutes pour le débogage
            rawEvent: eventCopy
          }
        };
      });
      
      console.log('Nombre d\'événements formatés:', formattedEvents.length);
      setEvents(formattedEvents);

      // Filtrer les événements à venir pour le calendrier uniquement
      // Pour le tableau, nous utiliserons tous les événements
      const now = new Date();
      const upcoming = formattedEvents
        .filter(event => new Date(event.start) > now)
        .sort((a, b) => new Date(a.start) - new Date(b.start));
      
      console.log('Nombre d\'événements à venir:', upcoming.length);
      setUpcomingEvents(upcoming);
    }
  }, [data]);
  
  // Fonction pour gérer le tri
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Fonction pour obtenir les classes CSS pour l'en-tête de colonne triable
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) {
      return 'text-gray-400';
    }
    return sortConfig.direction === 'asc' ? 'text-primary-600' : 'text-primary-600 rotate-180';
  };
  
  // Filtrer et trier tous les événements pour le tableau (pas seulement les événements à venir)
  const filteredAndSortedEvents = useMemo(() => {
    // Utiliser tous les événements au lieu de seulement les événements à venir
    let filteredEvents = [...events];
    
    console.log('Nombre total d\'événements:', events.length);
    console.log('Terme de recherche:', searchTerm);
    
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      filteredEvents = filteredEvents.filter(event => {
        const titleMatch = event.title && event.title.toLowerCase().includes(searchTermLower);
        const locationMatch = event.extendedProps.location && event.extendedProps.location.toLowerCase().includes(searchTermLower);
        const typeMatch = event.extendedProps.type && event.extendedProps.type.toLowerCase().includes(searchTermLower);
        const descriptionMatch = event.extendedProps.description && event.extendedProps.description.toLowerCase().includes(searchTermLower);
        
        const isMatch = titleMatch || locationMatch || typeMatch || descriptionMatch;
        console.log(`Événement "${event.title}" correspond à la recherche: ${isMatch}`);
        
        return isMatch;
      });
      
      console.log('Nombre d\'événements après filtrage:', filteredEvents.length);
    }
    
    // Trier les événements
    if (sortConfig.key) {
      filteredEvents.sort((a, b) => {
        let aValue, bValue;
        
        // Déterminer les valeurs à comparer en fonction de la clé de tri
        if (sortConfig.key === 'title') {
          aValue = a.title || '';
          bValue = b.title || '';
        } else if (sortConfig.key === 'start') {
          aValue = new Date(a.start);
          bValue = new Date(b.start);
        } else if (sortConfig.key === 'location') {
          aValue = a.extendedProps.location || '';
          bValue = b.extendedProps.location || '';
        } else if (sortConfig.key === 'type') {
          aValue = a.extendedProps.type || '';
          bValue = b.extendedProps.type || '';
        } else if (sortConfig.key === 'availableSpots') {
          aValue = a.extendedProps.availableSpots || 0;
          bValue = b.extendedProps.availableSpots || 0;
        }
        
        // Comparer les valeurs
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredEvents;
  }, [events, searchTerm, sortConfig]);
  
  // Calculer les événements paginés
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedEvents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedEvents, currentPage, itemsPerPage]);
  
  // Calculer le nombre total de pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedEvents.length / itemsPerPage);
  }, [filteredAndSortedEvents, itemsPerPage]);
  
  // Réinitialiser la page courante lorsque le terme de recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  // Fonction pour formater la date complète en français (avec heure)
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fonction pour formater uniquement la date (sans l'heure)
  const formatDateOnly = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Fonction pour calculer la durée entre deux dates
  const calculateDuration = (startDate, endDate) => {
    if (!endDate) return "Non précisée";
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calculer la différence en millisecondes
    const diffMs = end - start;
    
    // Si la durée est négative, retourner une valeur par défaut
    if (diffMs < 0) return "Durée invalide";
    
    // Convertir en minutes, heures et jours
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Formater la durée selon sa longueur
    if (diffDays > 0) {
      return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      const remainingMinutes = diffMinutes % 60;
      if (remainingMinutes > 0) {
        return `${diffHours}h${remainingMinutes.toString().padStart(2, '0')}`;
      } else {
        return `${diffHours} heure${diffHours > 1 ? 's' : ''}`;
      }
    } else {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  };

  // Fonction pour gérer le clic sur un événement
  const handleEventClick = (clickInfo) => {
    // Stocker l'événement sélectionné et ouvrir le modal
    setSelectedEvent(clickInfo.event);
    setIsEventModalOpen(true);
  };
  
  // Fonction pour vérifier si l'utilisateur est inscrit à un événement
  const isUserRegistered = (event) => {
    if (!user || !user._id) {
      return false;
    }
    
    // Vérifier que toutes les propriétés nécessaires existent
    if (!event || 
        !event.extendedProps || 
        !event.extendedProps.rawEvent || 
        !Array.isArray(event.extendedProps.rawEvent.volunteers)) {
      return false;
    }
    
    // Vérifier si l'ID de l'utilisateur est dans le tableau des bénévoles
    return event.extendedProps.rawEvent.volunteers.some(
      volunteerId => volunteerId === user._id || volunteerId.toString() === user._id.toString()
    );
  };
  
  // Fonction pour gérer l'inscription à un événement
  const handleRegisterForEvent = async (eventId) => {
    // Vérifier si l'utilisateur est connecté
    if (!user || !user._id) {
      console.error("Utilisateur non connecté");
      toast.error("Vous devez être connecté pour vous inscrire à un événement.");
      return;
    }
    
    try {
      await registerForEvent(eventId);
      toast.success("Vous êtes inscrit à l'événement !");
      mutate(); // Rafraîchir les données
    } catch (error) {
      console.error("Erreur lors de l'inscription à l'événement:", error);
      
      // Message d'erreur plus spécifique si possible
      const errorMessage = error.response?.data?.message || 
                          "Une erreur est survenue lors de l'inscription. Veuillez réessayer.";
      toast.error(errorMessage);
    }
  };
  
  // Fonction pour gérer la désinscription d'un événement
  const handleUnregisterFromEvent = async (eventId) => {
    // Vérifier si l'utilisateur est connecté
    if (!user || !user._id) {
      console.error("Utilisateur non connecté");
      toast.error("Vous devez être connecté pour vous désinscrire d'un événement.");
      return;
    }
    
    try {
      await unregisterFromEvent(eventId);
      toast.success("Vous êtes désinscrit de l'événement.");
      mutate(); // Rafraîchir les données
    } catch (error) {
      console.error("Erreur lors de la désinscription de l'événement:", error);
      
      // Message d'erreur plus spécifique si possible
      const errorMessage = error.response?.data?.message || 
                          "Une erreur est survenue lors de la désinscription. Veuillez réessayer.";
      toast.error(errorMessage);
    }
  };

  return (
    <VolunteerLayout>
      <Head>
        <title>Tableau de Bord Bénévole | TANY</title>
        <meta name="description" content="Tableau de bord des bénévoles de l'association TANY" />
      </Head>

      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-primary-600">Tableau de Bord Bénévole</h1>
        
        {/* Informations de l'utilisateur */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Bienvenue, {user?.name || 'Bénévole'} !</h2>
          <p className="text-gray-600">
            Consultez les événements à venir et inscrivez-vous pour participer aux collectes et marchés.
          </p>
        </div>
        
        {/* Calendrier interactif */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Calendrier des événements</h2>
          {isLoading ? (
            <p>Chargement du calendrier...</p>
          ) : error ? (
            <p className="text-red-500">Erreur lors du chargement des événements</p>
          ) : (
            <div className={calendarStyles.calendarContainer}>
              <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                locale={frLocale}
                events={events}
                eventClick={handleEventClick}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,dayGridWeek'
                }}
                buttonText={{
                  today: "Aujourd'hui",
                  month: 'Mois',
                  week: 'Semaine'
                }}
                height="auto"
              />
            </div>
          )}
        </div>
        
        {/* Tableau récapitulatif des événements disponibles */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h2 className="text-xl font-semibold mb-2 sm:mb-0">Liste des événements</h2>
              {!isLoading && !error && events.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {searchTerm 
                    ? `${filteredAndSortedEvents.length} événement(s) trouvé(s) sur ${events.length} au total` 
                    : `${events.length} événement(s) au total`}
                </p>
              )}
            </div>
            
            {/* Barre de recherche */}
            <div className="w-full sm:w-64">
              <TableSearch 
                searchTerm={searchTerm} 
                onSearchChange={setSearchTerm} 
                placeholder="Rechercher un événement..."
              />
            </div>
          </div>
          
          {isLoading ? (
            <p>Chargement des événements...</p>
          ) : error ? (
            <p className="text-red-500">Erreur lors du chargement des événements</p>
          ) : events.length === 0 ? (
            <p>Aucun événement disponible</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('title')}
                      >
                        <div className="flex items-center">
                          Événement
                          <svg 
                            className={`w-3 h-3 ml-1 ${getSortIndicator('title')}`} 
                            aria-hidden="true" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 10 14"
                          >
                            <path 
                              stroke="currentColor" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M5 1v12m0 0 4-4m-4 4L1 9"
                            />
                          </svg>
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('start')}
                      >
                        <div className="flex items-center">
                          Date
                          <svg 
                            className={`w-3 h-3 ml-1 ${getSortIndicator('start')}`} 
                            aria-hidden="true" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 10 14"
                          >
                            <path 
                              stroke="currentColor" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M5 1v12m0 0 4-4m-4 4L1 9"
                            />
                          </svg>
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <div className="flex items-center">
                          Durée
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('location')}
                      >
                        <div className="flex items-center">
                          Lieu
                          <svg 
                            className={`w-3 h-3 ml-1 ${getSortIndicator('location')}`} 
                            aria-hidden="true" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 10 14"
                          >
                            <path 
                              stroke="currentColor" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M5 1v12m0 0 4-4m-4 4L1 9"
                            />
                          </svg>
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('type')}
                      >
                        <div className="flex items-center">
                          Type
                          <svg 
                            className={`w-3 h-3 ml-1 ${getSortIndicator('type')}`} 
                            aria-hidden="true" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 10 14"
                          >
                            <path 
                              stroke="currentColor" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M5 1v12m0 0 4-4m-4 4L1 9"
                            />
                          </svg>
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort('availableSpots')}
                      >
                        <div className="flex items-center">
                          Places
                          <svg 
                            className={`w-3 h-3 ml-1 ${getSortIndicator('availableSpots')}`} 
                            aria-hidden="true" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 10 14"
                          >
                            <path 
                              stroke="currentColor" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth="2" 
                              d="M5 1v12m0 0 4-4m-4 4L1 9"
                            />
                          </svg>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedEvents.length > 0 ? (
                      paginatedEvents.map((event) => (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDateOnly(event.start)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{calculateDuration(event.start, event.end)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{event.extendedProps.location || 'Non précisé'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" style={{
                              backgroundColor: `${event.backgroundColor}20`,
                              color: event.backgroundColor
                            }}>
                              {event.extendedProps.type || 'Événement'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {(() => {
                                // Vérifier les deux formats possibles du champ
                                const totalVolunteersNeeded = event.extendedProps.rawEvent?.ExpectedVolunteers || 
                                                            event.extendedProps.rawEvent?.expectedVolunteers || 
                                                            event.extendedProps.volunteersNeeded || 
                                                            5;
                                
                                // Log pour déboguer
                                if (event.extendedProps.rawEvent?._id === '68236383c4f5da564a83e6ab' || 
                                    event.extendedProps.rawEvent?._id?.toString() === '68236383c4f5da564a83e6ab') {
                                  console.log('AFFICHAGE TABLEAU - Événement avec ID 68236383c4f5da564a83e6ab:');
                                  console.log('  ExpectedVolunteers:', event.extendedProps.rawEvent?.ExpectedVolunteers);
                                  console.log('  expectedVolunteers:', event.extendedProps.rawEvent?.expectedVolunteers);
                                  console.log('  volunteersNeeded:', event.extendedProps.volunteersNeeded);
                                  console.log('  Total utilisé:', totalVolunteersNeeded);
                                }
                                const registeredVolunteers = Array.isArray(event.extendedProps.rawEvent?.volunteers) 
                                  ? event.extendedProps.rawEvent.volunteers.length 
                                  : 0;
                                const availableSpots = Math.max(0, totalVolunteersNeeded - registeredVolunteers);
                                const isFullyBooked = availableSpots <= 0;
                                
                                return (
                                  <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                                    isFullyBooked 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {isFullyBooked ? 'Complet' : `${availableSpots}/${totalVolunteersNeeded}`}
                                  </span>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              className="text-primary-600 hover:text-primary-900 mr-3"
                              onClick={() => {
                                // S'assurer que les données brutes de l'événement sont correctement transmises
                                setSelectedEvent({ 
                                  title: event.title, 
                                  start: event.start,
                                  extendedProps: {
                                    ...event.extendedProps,
                                    rawEvent: event.extendedProps.rawEvent
                                  }
                                });
                                setIsEventModalOpen(true);
                              }}
                            >
                              Détails
                            </button>
                            {(() => {
                                // Vérifier les deux formats possibles du champ
                                const totalVolunteersNeeded = event.extendedProps.rawEvent?.ExpectedVolunteers || 
                                                            event.extendedProps.rawEvent?.expectedVolunteers || 
                                                            event.extendedProps.volunteersNeeded || 
                                                            5;
                                
                                // Log pour déboguer
                                if (event.extendedProps.rawEvent?._id === '68236383c4f5da564a83e6ab' || 
                                    event.extendedProps.rawEvent?._id?.toString() === '68236383c4f5da564a83e6ab') {
                                  console.log('AFFICHAGE TABLEAU - Événement avec ID 68236383c4f5da564a83e6ab:');
                                  console.log('  ExpectedVolunteers:', event.extendedProps.rawEvent?.ExpectedVolunteers);
                                  console.log('  expectedVolunteers:', event.extendedProps.rawEvent?.expectedVolunteers);
                                  console.log('  volunteersNeeded:', event.extendedProps.volunteersNeeded);
                                  console.log('  Total utilisé:', totalVolunteersNeeded);
                                }
                                const registeredVolunteers = Array.isArray(event.extendedProps.rawEvent?.volunteers) 
                                  ? event.extendedProps.rawEvent.volunteers.length 
                                  : 0;
                                const availableSpots = Math.max(0, totalVolunteersNeeded - registeredVolunteers);
                                const isFullyBooked = availableSpots <= 0;
                                
                                // Vérifier si l'utilisateur est connecté
                              if (!user || !user._id) {
                                return (
                                  <button 
                                    className="text-blue-600 hover:text-blue-900"
                                    onClick={() => toast.info("Veuillez vous connecter pour vous inscrire à un événement.")}
                                  >
                                    Connexion requise
                                  </button>
                                );
                              }
                              
                              // Vérifier si l'utilisateur est déjà inscrit à cet événement
                              const userIsRegistered = isUserRegistered(event);
                              
                              if (isFullyBooked && !userIsRegistered) {
                                return (
                                  <button 
                                    className="text-gray-400 cursor-not-allowed"
                                    disabled={true}
                                  >
                                    Complet
                                  </button>
                                );
                              }
                              
                              return userIsRegistered ? (
                                <button 
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => handleUnregisterFromEvent(event.id)}
                                >
                                  Se désinscrire
                                </button>
                              ) : (
                                <button 
                                  className="text-green-600 hover:text-green-900"
                                  onClick={() => handleRegisterForEvent(event.id)}
                                >
                                  S'inscrire
                                </button>
                              );
                              })()}
                            
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          Aucun événement trouvé
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {filteredAndSortedEvents.length > 0 && (
                <TablePagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                  totalItems={filteredAndSortedEvents.length}
                />
              )}
            </>
          )}
          
          <div className="mt-4 text-right">
            <Link href="/volunteer-participations" className="text-primary-600 hover:text-primary-800 font-medium">
              Voir toutes mes participations →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Modal de détails d'événement */}
      <EventDetailsModal 
        isOpen={isEventModalOpen} 
        onClose={() => setIsEventModalOpen(false)} 
        event={selectedEvent}
      />
      
      {/* Container pour les notifications toast */}
      <ToastContainer position="bottom-right" autoClose={5000} />
    </VolunteerLayout>
  );
}
