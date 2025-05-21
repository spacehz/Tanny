import { useState, useEffect, useCallback } from 'react';
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
import { registerForEvent, unregisterFromEvent } from '../services/eventService';
import { toast } from 'react-hot-toast';

// Fonction utilitaire pour les notifications
const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast.custom((t) => (
    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Fermer
        </button>
      </div>
    </div>
  ))
};

export default function VolunteerPage() {
  const { user } = useAuth();
  const { data, error, isLoading, mutate } = useEvents();
  
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [localUserRegistrations, setLocalUserRegistrations] = useState([]);
  
  // Synchronisation automatique au chargement des données
  useEffect(() => {
    if (data && data.data && user && user._id) {
      console.log("Données reçues du serveur:", data.data);
      
      // Extraire les événements où l'utilisateur est inscrit selon le serveur
      const userRegisteredEvents = data.data
        .filter(event => 
          Array.isArray(event.volunteers) && 
          event.volunteers.some(id => {
            const volunteerId = typeof id === 'object' ? id._id || id.id : id;
            return volunteerId && volunteerId.toString() === user._id.toString();
          })
        )
        .map(event => event._id);
      
      console.log("Événements où l'utilisateur est inscrit:", userRegisteredEvents);
      
      // Mettre à jour localUserRegistrations avec les données du serveur
      setLocalUserRegistrations(userRegisteredEvents);
      
      // Sauvegarder dans localStorage
      if (userRegisteredEvents.length > 0) {
        localStorage.setItem('userRegistrations', JSON.stringify(userRegisteredEvents));
      } else {
        localStorage.removeItem('userRegistrations');
      }
      
      // Formater les événements pour FullCalendar
      const formattedEvents = data.data.map(event => {
        // Utiliser le champ ExpectedVolunteers ou expectedVolunteers ou une valeur par défaut de 5
        const totalVolunteersNeeded = event.ExpectedVolunteers || event.expectedVolunteers || 5;
        
        // Vérifier si le champ volunteers existe et est un array
        const volunteersArray = event.volunteers || [];
        
        // S'assurer que nous utilisons bien un array et que nous comptons correctement les bénévoles
        const registeredVolunteers = Array.isArray(volunteersArray) ? volunteersArray.length : 0;
        
        // Calculer le nombre de places restantes
        const availableSpots = Math.max(0, totalVolunteersNeeded - registeredVolunteers);
        
        // Créer une copie complète de l'événement pour éviter les références circulaires
        const eventCopy = { ...event };
        
        // Vérifier si l'utilisateur est inscrit à cet événement
        const isUserRegistered = Array.isArray(volunteersArray) && 
          volunteersArray.some(id => {
            const volunteerId = typeof id === 'object' ? id._id || id.id : id;
            return volunteerId && volunteerId.toString() === user._id.toString();
          });
        
        // Déterminer la couleur spécifique en fonction du type d'événement
        const eventType = event.type || 'collecte'; // Par défaut, considérer comme une collecte
        const eventColor = getEventColor(eventType);
        
        console.log(`Événement ${event._id} - Type: ${eventType} - Couleur: ${eventColor} - Utilisateur inscrit: ${isUserRegistered}`);
        console.log(`Bénévoles inscrits:`, volunteersArray);
        
        return {
          id: event._id,
          title: event.title || event.name,
          start: event.start,
          end: event.end,
          allDay: event.allDay || false,
          // Ne pas définir backgroundColor et borderColor ici pour permettre à eventContent de les gérer
          textColor: '#ffffff',
          display: 'block', // Forcer l'affichage en bloc pour une meilleure visibilité
          extendedProps: {
            type: eventType,
            description: event.description,
            location: event.location,
            volunteersNeeded: totalVolunteersNeeded,
            registeredVolunteers: registeredVolunteers,
            availableSpots: availableSpots,
            isUserRegistered: isUserRegistered,
            volunteers: volunteersArray,
            // Conserver les données brutes pour le débogage
            rawEvent: eventCopy
          }
        };
      });
      
      setEvents(formattedEvents);

      // Filtrer les événements à venir pour le calendrier uniquement
      const now = new Date();
      const upcoming = formattedEvents
        .filter(event => new Date(event.start) > now)
        .sort((a, b) => new Date(a.start) - new Date(b.start));
      
      setUpcomingEvents(upcoming);
    }
  }, [data, user]);

  // Fonction pour déterminer la couleur en fonction du type d'événement
  const getEventColor = (type) => {
    if (!type) return '#16a34a'; // primary-600 (vert) par défaut pour les collectes
    
    const lowerType = String(type).toLowerCase();
    if (lowerType.includes('collecte')) return '#16a34a'; // primary-600 (vert) pour les collectes
    if (lowerType.includes('marché') || lowerType.includes('marche')) return '#3b82f6'; // blue-500 pour les marchés
    
    // Par défaut, retourner vert (collecte)
    return '#16a34a';
  };

  // Fonction pour gérer le clic sur un événement
  const handleEventClick = (clickInfo) => {
    try {
      console.log("Événement cliqué:", clickInfo.event);
      
      // Créer une copie simplifiée de l'événement pour éviter les références circulaires
      const eventData = {
        id: clickInfo.event.id,
        title: clickInfo.event.title,
        start: clickInfo.event.start,
        end: clickInfo.event.end,
        extendedProps: { ...clickInfo.event.extendedProps }
      };
      
      // Stocker l'événement sélectionné et ouvrir le modal
      setSelectedEvent(eventData);
      setIsEventModalOpen(true);
    } catch (error) {
      console.error("Erreur lors de l'ouverture du modal:", error);
      notify.error("Une erreur est survenue lors de l'ouverture des détails de l'événement");
    }
  };
  
  // Effet pour gérer le verrouillage/déverrouillage du scroll du document
  useEffect(() => {
    if (isEventModalOpen) {
      // Verrouiller le scroll du document quand le modal est ouvert
      document.body.style.overflow = 'hidden';
    } else {
      // Déverrouiller le scroll du document quand le modal est fermé
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0';
    }
    
    // Nettoyer l'effet lors du démontage du composant
    return () => {
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0';
    };
  }, [isEventModalOpen]);
  
  // Fonction pour fermer le modal de détails d'événement
  const handleCloseEventModal = () => {
    try {
      // Restaurer le défilement du document
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0';
      
      // Fermer le modal
      setIsEventModalOpen(false);
      
      // Réinitialiser l'événement sélectionné immédiatement
      setSelectedEvent(null);
    } catch (error) {
      console.error("Erreur lors de la fermeture du modal:", error);
      // En cas d'erreur, s'assurer que le document est déverrouillé
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0';
    }
  };

  // Fonction pour s'inscrire à un événement
  const handleRegisterForEvent = async (eventId) => {
    try {
      console.log(`Tentative d'inscription à l'événement ${eventId}`);
      
      // Appel à l'API pour s'inscrire
      const response = await registerForEvent(eventId);
      console.log("Réponse de l'API d'inscription:", response);
      
      notify.success("Vous êtes maintenant inscrit à cet événement");
      
      // Forcer le rafraîchissement complet des données depuis le serveur
      await mutate();
      
      console.log("Données rafraîchies après inscription");
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      notify.error("Une erreur est survenue lors de l'inscription");
    }
  };

  // Fonction pour se désinscrire d'un événement
  const handleUnregisterFromEvent = async (eventId) => {
    try {
      console.log(`Tentative de désinscription de l'événement ${eventId}`);
      
      // Appel à l'API pour se désinscrire
      const response = await unregisterFromEvent(eventId);
      console.log("Réponse de l'API de désinscription:", response);
      
      notify.success("Vous êtes maintenant désinscrit de cet événement");
      
      // Forcer le rafraîchissement complet des données depuis le serveur
      await mutate();
      
      console.log("Données rafraîchies après désinscription");
    } catch (error) {
      console.error("Erreur lors de la désinscription:", error);
      notify.error("Une erreur est survenue lors de la désinscription");
    }
  };

  return (
    <VolunteerLayout>
      <Head>
        <title>Espace Bénévole - Calendrier</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-primary-700 mb-6">Calendrier des événements</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Calendrier des activités</h2>
          <div className={calendarStyles.calendarContainer}>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              eventClick={handleEventClick}
              locale={frLocale}
              height="auto"
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
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
                hour12: false
              }}
              eventDisplay="block"
              eventContent={(eventInfo) => {
                const event = eventInfo.event;
                const isUserRegistered = event.extendedProps.isUserRegistered;
                const eventType = event.extendedProps.type;
                const availableSpots = event.extendedProps.availableSpots;
                const totalVolunteersNeeded = event.extendedProps.volunteersNeeded;
                const registeredVolunteers = event.extendedProps.registeredVolunteers;
                
                // Déterminer la couleur en fonction du type d'événement
                let indicatorColor;
                if (eventType?.toLowerCase().includes('marché') || eventType?.toLowerCase().includes('marche')) {
                  indicatorColor = '#3b82f6'; // blue-500 pour marché
                } else {
                  indicatorColor = '#16a34a'; // primary-600 pour collectes
                }
                
                return (
                  <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                    <div className="flex">
                      {/* Indicateur coloré à gauche */}
                      <div 
                        className="w-1" 
                        style={{ backgroundColor: indicatorColor }}
                      ></div>
                      
                      {/* Contenu de l'événement */}
                      <div className="flex-1 p-1">
                        <div className="flex items-center">
                          {isUserRegistered && (
                            <span className="inline-block w-2 h-2 bg-primary-600 rounded-full mr-1" title="Vous êtes inscrit"></span>
                          )}
                          <div className="text-xs font-medium text-gray-800 truncate">{event.title}</div>
                        </div>
                        <div className="text-xs text-right text-gray-600 whitespace-nowrap">
                          {registeredVolunteers}/{totalVolunteersNeeded}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          </div>
          <div className="mt-6 mb-8">
            <h3 className="text-lg font-semibold mb-3 text-primary-700">Légende</h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-primary-600 mr-2 shadow-sm"></div>
                <span className="text-gray-700">Collectes</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-2 shadow-sm"></div>
                <span className="text-gray-700">Marché</span>
              </div>
              {user && (
                <div className="flex items-center">
                  <div className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-primary-600 rounded-full mr-1"></span>
                    <span className="text-gray-700">Vous êtes inscrit</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Tableau des événements à venir */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-primary-700 mb-4">Événements à venir</h2>
          
          {isLoading ? (
            <p className="text-center py-4">Chargement des événements...</p>
          ) : error ? (
            <p className="text-center py-4 text-red-500">Erreur lors du chargement des événements</p>
          ) : upcomingEvents.length === 0 ? (
            <p className="text-center py-4 text-gray-500">Aucun événement à venir</p>
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
                      Places disponibles
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingEvents.map((event) => {
                    // Vérifier si l'utilisateur est inscrit à cet événement
                    // Utiliser directement les données de l'événement pour une vérification précise
                    const isUserRegistered = event.extendedProps.isUserRegistered;
                    console.log(`Événement ${event.id} - Utilisateur inscrit (dans le rendu): ${isUserRegistered}`);
                    
                    const availableSpots = event.extendedProps.availableSpots;
                    const isFullyBooked = availableSpots <= 0;
                    
                    // Formater la date
                    const eventDate = new Date(event.start);
                    const formattedDate = eventDate.toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    
                    return (
                      <tr key={event.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: getEventColor(event.extendedProps.type) }}></div>
                            <div className="text-sm font-medium text-gray-900">
                              {event.title}
                              {event.extendedProps.isUserRegistered && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                  Inscrit
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.extendedProps.location || 'Non précisé'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 w-32">
                              <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className="h-full rounded-full transition-all duration-500 ease-in-out" 
                                  style={{ 
                                    width: `${(event.extendedProps.registeredVolunteers / event.extendedProps.volunteersNeeded) * 100}%`,
                                    backgroundColor: isFullyBooked ? '#ef4444' : getEventColor(event.extendedProps.type)
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="ml-3 text-sm font-medium">
                              {isFullyBooked ? (
                                <span className="text-red-500 bg-red-50 px-2 py-1 rounded-md">Complet</span>
                              ) : (
                                <span>
                                  <span className="text-primary-600 font-semibold">{availableSpots}</span> / {event.extendedProps.volunteersNeeded}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {isUserRegistered ? (
                            <button
                              onClick={() => handleUnregisterFromEvent(event.id)}
                              className="text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                              Se désinscrire
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRegisterForEvent(event.id)}
                              disabled={isFullyBooked}
                              className={`${
                                isFullyBooked 
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                  : 'text-white bg-primary-600 hover:bg-primary-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                              } px-3 py-1.5 rounded-md text-sm font-medium transition-colors`}
                            >
                              {isFullyBooked ? 'Complet' : 'S\'inscrire'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6 text-right">
          <Link 
            href="/volunteer-participations" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Voir toutes mes participations
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
      
      {/* Modal de détails d'événement */}
      {selectedEvent && (
        <EventDetailsModal
          isOpen={isEventModalOpen}
          onClose={handleCloseEventModal}
          event={selectedEvent}
        />
      )}
    </VolunteerLayout>
  );
}
