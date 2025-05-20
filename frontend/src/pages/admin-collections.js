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
import { showSuccessToast, showErrorToast } from '../utils/toast';

const AdminCollections = () => {
  const router = useRouter();
  const calendarRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedEventForAssignment, setSelectedEventForAssignment] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Valeur par défaut
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
  
  // Charger la préférence utilisateur pour le nombre d'éléments par page
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedItemsPerPage = localStorage.getItem('eventsTableItemsPerPage');
      if (savedItemsPerPage) {
        setItemsPerPage(parseInt(savedItemsPerPage));
      }
    }
  }, []);

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
        // Afficher un toast de succès pour la mise à jour
        showSuccessToast(`L'événement "${formData.title}" a été mis à jour avec succès`);
      } else {
        // Ajout d'un nouvel événement
        await createEvent(formData);
        // Afficher un toast de succès pour la création
        showSuccessToast(`L'événement "${formData.title}" a été créé avec succès`);
      }
      
      // Rafraîchir les données
      mutate('/api/events');
      
      // Fermer le modal
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'événement:', error);
      // Remplacer l'alerte par un toast d'erreur
      showErrorToast('Une erreur est survenue lors de la sauvegarde de l\'événement.');
    }
  };

  // Fonction pour supprimer un événement
  const handleDeleteEvent = async (eventId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      try {
        // Trouver le titre de l'événement avant de le supprimer
        const eventToDelete = events.find(event => event._id === eventId);
        const eventTitle = eventToDelete ? eventToDelete.title : 'Événement';
        
        await deleteEvent(eventId);
        
        // Rafraîchir les données
        mutate('/api/events');
        
        // Afficher un toast de succès pour la suppression
        showSuccessToast(`L'événement "${eventTitle}" a été supprimé avec succès`);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
        // Remplacer l'alerte par un toast d'erreur
        showErrorToast('Une erreur est survenue lors de la suppression de l\'événement.');
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

  // Formater les événements pour FullCalendar avec les couleurs primary pour collectes et bleu pour marchés
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
    backgroundColor: event.type?.toLowerCase() === 'marché' ? '#3b82f6' : '#16a34a', // blue-500 pour marché et primary-600 pour collectes
    borderColor: event.type?.toLowerCase() === 'marché' ? '#2563eb' : '#15803d', // blue-600 pour marché et primary-700 pour collectes
    textColor: '#ffffff' // Texte blanc pour un meilleur contraste
  }));

  return (
    <AdminLayout>
      <div className="w-full max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-primary-700">Gestion des Collectes et Marchés</h1>
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
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md"
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
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">

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
              </div>
            </div>
          </div>
        )}
        
        {/* Tableau d'événements sous le calendrier - Maintenant en dehors du conteneur du calendrier pour utiliser toute la largeur */}
        {!isLoading && !error && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8 hover:shadow-lg transition-shadow w-full">
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
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(newItemsPerPage) => {
                // Mettre à jour l'état local
                setItemsPerPage(newItemsPerPage);
                // Sauvegarder cette préférence utilisateur dans localStorage
                localStorage.setItem('eventsTableItemsPerPage', newItemsPerPage);
              }}
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
