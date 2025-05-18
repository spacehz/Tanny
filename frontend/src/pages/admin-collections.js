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
import EventsTable from '../components/EventsTable';
import EventVolunteerAssignmentModal from '../components/EventVolunteerAssignmentModal';

import { createEvent, updateEvent, deleteEvent } from '../services/eventService';

const AdminCollections = () => {
  const router = useRouter();
  const calendarRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventForAssignment, setSelectedEventForAssignment] = useState(null);
  // Suppression du mode 'detailedTable' car nous avons maintenant un tableau sous le calendrier
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

  // Fonction pour ouvrir le modal d'affectation des bénévoles
  const handleShowEventDetails = (event) => {
    console.log('Ouverture du modal d\'affectation pour l\'événement:', event);
    setSelectedEventForAssignment(event);
    setIsAssignmentModalOpen(true);
  };

  // Fonction pour gérer l'enregistrement des affectations
  const handleAssignmentSave = (assignments) => {
    // Rafraîchir les données après l'enregistrement des affectations
    mutate('/api/events');
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
          <div>
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
        </div>
        
        {isLoading ? (
          <div className="text-center py-8">Chargement des événements...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            Erreur lors du chargement des événements. Veuillez réessayer.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">

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
            
            {/* Légende du calendrier */}
            <div className="mt-4 mb-6">
              <h3 className="text-lg font-semibold mb-2">Légende</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-green-600 mr-2"></div>
                  <span>Collectes</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                  <span>Marché</span>
                </div>
              </div>
            </div>
            
            {/* Tableau d'événements sous le calendrier */}
            <EventsTable 
              events={events} 
              onEdit={(event) => {
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
              onDelete={handleDeleteEvent}
              onShowDetails={handleShowEventDetails}
              itemsPerPage={5}
            />
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
        
        {/* Modal pour afficher les détails et affecter les bénévoles */}
        <EventVolunteerAssignmentModal
          isOpen={isAssignmentModalOpen}
          onClose={() => setIsAssignmentModalOpen(false)}
          event={selectedEventForAssignment}
          onAssignmentSave={handleAssignmentSave}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminCollections;
