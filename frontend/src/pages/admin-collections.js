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
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    type: 'collecte',
    description: '',
    location: '',
    merchantId: '',
    expectedVolunteers: 1,
    duration: '',
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
      merchantId: '',
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
      merchantId: event.extendedProps.merchantId || '',
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
      merchantId: event.merchantId?._id,
      expectedVolunteers: event.expectedVolunteers,
      duration: event.duration,
      numberOfStands: event.numberOfStands,
      volunteers: event.volunteers
    },
    backgroundColor: event.type === 'collecte' ? '#4CAF50' : '#2196F3',
    borderColor: event.type === 'collecte' ? '#388E3C' : '#1976D2'
  }));

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Gestion des Collectes et Marchés</h1>
        
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
