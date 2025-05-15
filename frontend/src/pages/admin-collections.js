import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import AdminLayout from '../components/layout/AdminLayout';
import { useEvents } from '../services/swrHooks';
import { mutate } from 'swr';
import CollectionModal from '../components/CollectionModal';

import { createEvent, updateEvent, deleteEvent } from '../services/eventService';

const AdminCollections = () => {
  const router = useRouter();
  const calendarRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'detailedTable'
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    type: 'collecte',
    description: '',
    location: '',
    duration: '',
    expectedVolunteers: 1,
    numberOfStands: 1,
    volunteers: []
  });

  // Utiliser SWR pour récupérer les événements
  const { data: eventsData, error, isLoading } = useEvents();
  const events = eventsData?.data || [];

  // Fonction pour ouvrir le modal d'ajout d'événement
  const handleAddEvent = (selectInfo) => {
    const { start, end } = selectInfo;
    
    // Formater les dates pour le formulaire
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    setFormData({
      title: '',
      start: startDate.toISOString().slice(0, 16),
      end: endDate.toISOString().slice(0, 16),
      type: 'collecte',
      description: '',
      location: '',
  
      expectedVolunteers: 1,
      duration: '',
      numberOfStands: 1,
      volunteers: []
    });
    
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  // Fonction pour ouvrir le modal d'édition d'événement
  const handleEditEvent = (eventClickInfo) => {
    const event = eventClickInfo.event;
    const eventData = {
      id: event.id,
      title: event.title,
      start: new Date(event.start).toISOString().slice(0, 16),
      end: new Date(event.end).toISOString().slice(0, 16),
      type: event.extendedProps.type || 'collecte',
      description: event.extendedProps.description || '',
      location: event.extendedProps.location || '',

      expectedVolunteers: event.extendedProps.expectedVolunteers || 1,
      duration: event.extendedProps.duration || '',
      numberOfStands: event.extendedProps.numberOfStands || 1,
      volunteers: event.extendedProps.volunteers || []
    };
    
    setFormData(eventData);
    setSelectedEvent(eventData);
    setIsModalOpen(true);
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (formData) => {
    try {
      if (selectedEvent) {
        // Mise à jour d'un événement existant
        await updateEvent(selectedEvent.id, formData);
      } else {
        // Ajout d'un nouvel événement
        await createEvent(formData);
      }
      
      // Rafraîchir les données
      mutate('/api/events');
      
      // Fermer le modal
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'événement:', error);
      alert('Une erreur est survenue lors de la sauvegarde de l\'événement.');
    }
  };

  // Fonction pour supprimer un événement
  const handleDeleteEvent = async (eventId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        await deleteEvent(eventId);
        
        // Rafraîchir les données
        mutate('/api/events');
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
        alert('Une erreur est survenue lors de la suppression de l\'événement.');
      }
    }
  };

  // Fonction pour formater les dates
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formater les événements pour FullCalendar
  const formattedEvents = events.map(event => ({
    id: event._id,
    title: event.title,
    start: event.start,
    end: event.end,
    extendedProps: {
      type: event.type,
      description: event.description,
      location: event.location,

      expectedVolunteers: event.expectedVolunteers,
      duration: event.duration,
      numberOfStands: event.numberOfStands,
      volunteers: event.volunteers
    },
    backgroundColor: event.type?.toLowerCase() === 'marché' ? '#3b82f6' : '#16a34a', // Couleurs cohérentes avec la légende
    borderColor: event.type?.toLowerCase() === 'marché' ? '#2563eb' : '#15803d'
  }));

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des Collectes et Marchés</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Calendrier
            </button>
            <button
              onClick={() => setViewMode('detailedTable')}
              className={`px-4 py-2 rounded-lg ${
                viewMode === 'detailedTable'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              Tableau détaillé
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Chargement des événements...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Erreur lors du chargement des événements. Veuillez réessayer.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            {viewMode !== 'calendar' && (
              <div className="mb-4">
                <button 
                  onClick={() => {
                    // Initialiser un nouvel événement avec la date actuelle
                    const now = new Date();
                    const later = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 heures
                    
                    setFormData({
                      title: '',
                      start: now.toISOString().slice(0, 16),
                      end: later.toISOString().slice(0, 16),
                      type: 'collecte', // Type par défaut: collecte
                      description: '',
                      location: '',
                      expectedVolunteers: 1,
                      duration: '',
                      numberOfStands: 1,
                      volunteers: []
                    });
                    
                    setSelectedEvent(null);
                    setIsModalOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Ajouter un événement
                </button>
              </div>
            )}
            {viewMode === 'calendar' ? (
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                locale={frLocale}
                events={formattedEvents}
                selectable={true}
                select={handleAddEvent}
                eventClick={handleEditEvent}
                height="auto"
                editable={true}
                dayMaxEvents={true}
              />
            
            ) : (
              // Tableau détaillé des événements (adapté de admin-collections.js)
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Liste des événements</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Titre
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date de début
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date de fin
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lieu
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {events.map((event) => {
                        // Déterminer le type d'événement
                        let eventType = event.type || "collecte";
                        let bgColor = "#16a34a"; // default: green for collecte
                        
                        if (eventType.toLowerCase() === 'marché') {
                          bgColor = "#3b82f6"; // blue
                          eventType = "Marché";
                        } else {
                          eventType = "Collecte";
                        }
                        
                        return (
                          <tr key={event._id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{event.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{formatDate(event.start)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{formatDate(event.end)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span 
                                className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                style={{ 
                                  backgroundColor: bgColor + '20', // Ajoute une transparence
                                  color: bgColor 
                                }}
                              >
                                {eventType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{event.description || "Non spécifié"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{event.location || "Non spécifié"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                onClick={() => {
                                  // Adapter l'événement au format attendu par handleEditEvent
                                  const eventData = {
                                    event: {
                                      id: event._id,
                                      title: event.title,
                                      start: new Date(event.start),
                                      end: new Date(event.end),
                                      extendedProps: {
                                        type: event.type,
                                        description: event.description,
                                        location: event.location,
                                        expectedVolunteers: event.expectedVolunteers,
                                        duration: event.duration,
                                        numberOfStands: event.numberOfStands,
                                        volunteers: event.volunteers || []
                                      }
                                    }
                                  };
                                  handleEditEvent(eventData);
                                }}
                              >
                                Modifier
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900"
                                onClick={() => handleDeleteEvent(event._id)}
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
                      <span>Marché</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Modal pour ajouter/modifier un événement */}
        <CollectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          initialData={formData}
          isEditing={!!selectedEvent}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminCollections;
