import { useState } from 'react';
import Head from 'next/head';
import Sidebar from '../components/Sidebar';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';

export default function CalendarManagement() {
  const [events, setEvents] = useState([
    {
      id: '1',
      title: 'Collecte au Marché Central',
      start: '2023-11-15T10:00:00',
      end: '2023-11-15T12:00:00',
      backgroundColor: '#16a34a', // primary-600
      borderColor: '#15803d', // primary-700
    },
    {
      id: '2',
      title: 'Distribution alimentaire',
      start: '2023-11-18T14:00:00',
      end: '2023-11-18T17:00:00',
      backgroundColor: '#3b82f6', // blue-500
      borderColor: '#2563eb', // blue-600
    },
    {
      id: '3',
      title: 'Réunion des bénévoles',
      start: '2023-11-20T18:30:00',
      end: '2023-11-20T20:00:00',
      backgroundColor: '#f59e0b', // amber-500
      borderColor: '#d97706', // amber-600
    },
    {
      id: '4',
      title: 'Formation nouveaux bénévoles',
      start: '2023-11-25',
      allDay: true,
      backgroundColor: '#ef4444', // red-500
      borderColor: '#dc2626', // red-600
    }
  ]);

  // Fonction pour gérer l'ajout d'un nouvel événement
  const handleDateSelect = (selectInfo) => {
    const title = prompt('Entrez le titre de l\'événement:');
    if (title) {
      const newEvent = {
        id: String(Date.now()),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
        backgroundColor: '#16a34a', // primary-600
        borderColor: '#15803d', // primary-700
      };
      setEvents([...events, newEvent]);
    }
    selectInfo.view.calendar.unselect();
  };

  // Fonction pour gérer la modification d'un événement
  const handleEventClick = (clickInfo) => {
    if (confirm(`Voulez-vous supprimer l'événement '${clickInfo.event.title}'?`)) {
      setEvents(events.filter(event => event.id !== clickInfo.event.id));
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

  return (
    <>
      <Head>
        <title>Calendrier | TANY Admin</title>
        <meta name="description" content="Calendrier des événements de l'association TANY" />
      </Head>

      <div className="flex">
        <Sidebar />
        
        <div className="admin-content flex-grow ml-64 transition-all duration-300">
          <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Calendrier des événements</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-700">
                  Gérez les collectes, distributions et autres événements de l'association.
                </p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    const title = prompt('Entrez le titre de l\'événement:');
                    if (title) {
                      const now = new Date();
                      const tomorrow = new Date();
                      tomorrow.setDate(now.getDate() + 1);
                      
                      const newEvent = {
                        id: String(Date.now()),
                        title,
                        start: now.toISOString().substring(0, 10),
                        backgroundColor: '#16a34a', // primary-600
                        borderColor: '#15803d', // primary-700
                      };
                      setEvents([...events, newEvent]);
                    }
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
                    <span>Distributions</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
                    <span>Réunions</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                    <span>Formations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
