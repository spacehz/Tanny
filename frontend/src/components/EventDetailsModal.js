import React from 'react';
import Modal from './Modal';

const EventDetailsModal = ({ isOpen, onClose, event }) => {
  if (!event) return null;

  // Fonction pour formater la date en français
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

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

  // Déterminer la couleur de l'événement
  const eventColor = getEventColor(event.extendedProps?.type);

  // Accéder aux données brutes de l'événement pour le débogage
  const rawEvent = event.extendedProps?.rawEvent;
  console.log('Données brutes de l\'événement:', rawEvent);
  
  // Utiliser le champ ExpectedVolunteers ou expectedVolunteers pour le nombre total de bénévoles attendus
  const totalVolunteersNeeded = rawEvent?.ExpectedVolunteers || rawEvent?.expectedVolunteers || 5;
  
  // Log pour déboguer
  console.log('MODAL - Données de l\'événement:');
  console.log('  ID:', rawEvent?._id);
  console.log('  ExpectedVolunteers:', rawEvent?.ExpectedVolunteers);
  console.log('  expectedVolunteers:', rawEvent?.expectedVolunteers);
  console.log('  Total utilisé:', totalVolunteersNeeded);
  
  // Compter le nombre de bénévoles inscrits à partir du champ volunteers
  const volunteersArray = rawEvent?.volunteers || [];
  const registeredVolunteers = Array.isArray(volunteersArray) ? volunteersArray.length : 0;
  
  // Calculer le nombre de places disponibles
  const availableSpots = Math.max(0, totalVolunteersNeeded - registeredVolunteers);
  const isFullyBooked = availableSpots <= 0;
  
  console.log('Nombre total de bénévoles attendus:', totalVolunteersNeeded);
  console.log('Bénévoles inscrits:', registeredVolunteers);
  console.log('Places disponibles:', availableSpots);
  
  console.log('Nombre total de bénévoles attendus:', totalVolunteersNeeded);
  console.log('Bénévoles inscrits:', registeredVolunteers);
  console.log('Places disponibles:', availableSpots);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={event.title || "Détails de l'événement"}>
      <div className="space-y-6">
        {/* En-tête avec type et date */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span 
              className="inline-block px-3 py-1 rounded-full text-sm font-semibold"
              style={{ 
                backgroundColor: `${eventColor}20`, 
                color: eventColor 
              }}
            >
              {event.extendedProps?.type || 'Événement'}
            </span>
          </div>
          <div className="text-gray-600">
            <span className="font-medium">Date:</span> {formatDate(event.start)}
          </div>
        </div>

        {/* Ligne de séparation */}
        <div className="border-t border-gray-200"></div>

        {/* Détails de l'événement */}
        <div className="space-y-4">
          {/* Lieu */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Lieu</h3>
            <p className="text-gray-800">{event.extendedProps?.location || 'Non précisé'}</p>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Description</h3>
            <p className="text-gray-800">{event.extendedProps?.description || 'Aucune description disponible'}</p>
          </div>

          {/* Places disponibles */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Places disponibles</h3>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${(registeredVolunteers / totalVolunteersNeeded) * 100}%`,
                      backgroundColor: isFullyBooked ? '#ef4444' : eventColor
                    }}
                  ></div>
                </div>
              </div>
              <div className="ml-4 text-sm font-medium">
                {isFullyBooked ? (
                  <span className="text-red-500">Complet</span>
                ) : (
                  <span>
                    <span className="text-green-600">{availableSpots}</span> / {totalVolunteersNeeded} places
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {isFullyBooked 
                ? 'Toutes les places sont prises pour cet événement.' 
                : `Il reste ${availableSpots} place${availableSpots > 1 ? 's' : ''} disponible${availableSpots > 1 ? 's' : ''}.`}
            </p>
            
            {/* Afficher les bénévoles inscrits ou un message si aucun */}
            <div className="mt-3">
              <h4 className="text-xs font-medium text-gray-500 mb-1">Bénévoles inscrits:</h4>
              {volunteersArray.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {volunteersArray.map((volunteer, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {volunteer.name || volunteer}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Aucun bénévole inscrit pour le moment.</p>
              )}
            </div>
          </div>
        </div>

        {/* Pas de boutons d'action - supprimés car inutiles */}
      </div>
    </Modal>
  );
};

export default EventDetailsModal;
