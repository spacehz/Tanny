import { useState } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { useMerchants } from '../services/swrHooks';

export default function CollectionsManagement() {
  // Récupération des commerçants pour le sélecteur
  const { data: merchantsData, error: merchantsError } = useMerchants(1, 100);
  
  // État pour gérer les événements du calendrier
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Collecte au Marché Central',
      start: '2023-11-15T10:00:00',
      end: '2023-11-15T12:00:00',
      backgroundColor: '#16a34a', // primary-600
      borderColor: '#15803d', // primary-700
      type: 'collecte',
      description: 'Collecte de produits alimentaires au Marché Central',
      location: 'Marché Central, Paris',
      volunteers: ['Jean Dupont', 'Marie Martin']
    },
    {
      id: '2',
      title: 'Marché solidaire',
      start: '2023-11-18T14:00:00',
      end: '2023-11-18T17:00:00',
      backgroundColor: '#3b82f6', // blue-500
      borderColor: '#2563eb', // blue-600
      type: 'marché',
      description: 'Marché solidaire mensuel',
      location: 'Place de la République, Paris',
      volunteers: ['Sophie Durand', 'Thomas Petit']
    }
  ]);

  // État pour gérer le modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    type: 'collecte',
    description: '',
    location: '',
    volunteers: [],
    // Nouveaux champs pour les collectes
    merchantId: '',
    expectedVolunteers: 1,
    // Nouveaux champs pour les marchés
    duration: '',
    numberOfStands: 1
  });

  // Fonction pour gérer l'ajout d'un nouvel événement
  const handleDateSelect = (selectInfo) => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      type: 'collecte',
      description: '',
      location: '',
      volunteers: [],
      // Nouveaux champs pour les collectes
      merchantId: '',
      expectedVolunteers: 1,
      // Nouveaux champs pour les marchés
      duration: '',
      numberOfStands: 1
    });
    setIsModalOpen(true);
    selectInfo.view.calendar.unselect();
  };

  // Fonction pour gérer le clic sur un événement existant
  const handleEventClick = (clickInfo) => {
    const event = events.find(e => e.id === clickInfo.event.id);
    if (event) {
      setSelectedEvent(event);
      setFormData({
        title: event.title,
        start: event.start,
        end: event.end || '',
        type: event.type || 'collecte',
        description: event.description || '',
        location: event.location || '',
        volunteers: event.volunteers || [],
        // Nouveaux champs pour les collectes
        merchantId: event.merchantId || '',
        expectedVolunteers: event.expectedVolunteers || 1,
        // Nouveaux champs pour les marchés
        duration: event.duration || '',
        numberOfStands: event.numberOfStands || 1
      });
      setIsModalOpen(true);
    }
  };

  // Fonction pour gérer le déplacement d'un événement
  const handleEventDrop = (eventDropInfo) => {
    const updatedEvents = events.map(event => {
      if (event.id === eventDropInfo.event.id) {
        return {
          ...event,
          start: eventDropInfo.event.startStr,
          end: eventDropInfo.event.endStr,
        };
      }
      return event;
    });
    setEvents(updatedEvents);
  };

  // Fonction pour gérer les changements dans le formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Déterminer la couleur en fonction du type d'événement
    let backgroundColor, borderColor;
    switch (formData.type) {
      case 'collecte':
        backgroundColor = '#16a34a'; // primary-600
        borderColor = '#15803d'; // primary-700
        break;
      case 'marché':
        backgroundColor = '#3b82f6'; // blue-500
        borderColor = '#2563eb'; // blue-600
        break;
      default:
        backgroundColor = '#f59e0b'; // amber-500
        borderColor = '#d97706'; // amber-600
    }

    if (selectedEvent) {
      // Mise à jour d'un événement existant
      const updatedEvents = events.map(event => {
        if (event.id === selectedEvent.id) {
          return {
            ...event,
            ...formData,
            backgroundColor,
            borderColor
          };
        }
        return event;
      });
      setEvents(updatedEvents);
    } else {
      // Création d'un nouvel événement
      const newEvent = {
        id: String(Date.now()),
        ...formData,
        backgroundColor,
        borderColor
      };
      setEvents([...events, newEvent]);
    }
    
    // Fermer le modal
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Fonction pour supprimer un événement
  const handleDelete = () => {
    if (selectedEvent) {
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setIsModalOpen(false);
      setSelectedEvent(null);
    }
  };

  return (
    <>
      <Head>
        <title>Collectes & Marchés | TANNY Admin</title>
        <meta name="description" content="Gestion des collectes et marchés de l'association TANNY" />
      </Head>

      <div className="flex">
        <Sidebar />
        
        <div className="admin-content flex-grow ml-64 transition-all duration-300">
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Collectes & Marchés</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-700">
                  Planifiez et gérez les collectes et marchés de l'association.
                </p>
                <button 
                  className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded transition-colors duration-200"
                  onClick={() => {
                    setSelectedEvent(null);
                    setFormData({
                      title: '',
                      start: new Date().toISOString().split('T')[0],
                      end: '',
                      type: 'collecte',
                      description: '',
                      location: '',
                      volunteers: [],
                      // Nouveaux champs pour les collectes
                      merchantId: '',
                      expectedVolunteers: 1,
                      // Nouveaux champs pour les marchés
                      duration: '',
                      numberOfStands: 1
                    });
                    setIsModalOpen(true);
                  }}
                >
                  Ajouter un événement
                </button>
              </div>
              
              <div className="calendar-container">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                  }}
                  initialView="dayGridMonth"
                  editable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  weekends={true}
                  events={events}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  eventDrop={handleEventDrop}
                  locale={frLocale}
                  height="auto"
                  buttonText={{
                    today: "Aujourd'hui",
                    month: 'Mois',
                    week: 'Semaine',
                    day: 'Jour',
                    list: 'Liste'
                  }}
                />
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Légende</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-primary-600 mr-2"></div>
                    <span>Collectes</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                    <span>Marchés</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
                    <span>Autres événements</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour ajouter/modifier un événement */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {selectedEvent ? 'Modifier l\'événement' : 'Ajouter un événement'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="start" className="block text-gray-700 font-medium mb-2">
                    Date de début
                  </label>
                  <input
                    type="datetime-local"
                    id="start"
                    name="start"
                    value={formData.start.includes('T') ? formData.start.substring(0, 16) : `${formData.start}T00:00`}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="end" className="block text-gray-700 font-medium mb-2">
                    Date de fin
                  </label>
                  <input
                    type="datetime-local"
                    id="end"
                    name="end"
                    value={formData.end && formData.end.includes('T') ? formData.end.substring(0, 16) : formData.end ? `${formData.end}T00:00` : ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="type" className="block text-gray-700 font-medium mb-2">
                  Type d'événement
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="collecte">Collecte</option>
                  <option value="marché">Marché</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="location" className="block text-gray-700 font-medium mb-2">
                  Lieu
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                ></textarea>
              </div>
              
              <div className="flex justify-between space-x-3">
                {selectedEvent && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors duration-200"
                  >
                    Supprimer
                  </button>
                )}
                <div className="flex justify-end space-x-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedEvent(null);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded transition-colors duration-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded transition-colors duration-200"
                  >
                    {selectedEvent ? 'Mettre à jour' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
