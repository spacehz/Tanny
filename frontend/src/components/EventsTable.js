import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const EventsTable = ({ events, onEdit, onDelete, onShowDetails, itemsPerPage = 5 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    type: '',
    location: '',
    startDate: '',
    endDate: ''
  });

  // Appliquer les filtres aux événements
  useEffect(() => {
    let result = [...events];
    
    // Filtre par titre
    if (filters.title) {
      result = result.filter(event => 
        event.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }
    
    // Filtre par type
    if (filters.type) {
      result = result.filter(event => 
        event.type.toLowerCase() === filters.type.toLowerCase()
      );
    }
    
    // Filtre par lieu
    if (filters.location) {
      result = result.filter(event => 
        event.location && event.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    // Filtre par date de début
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      result = result.filter(event => 
        new Date(event.start) >= startDate
      );
    }
    
    // Filtre par date de fin
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // Fin de la journée
      result = result.filter(event => 
        new Date(event.end) <= endDate
      );
    }
    
    setFilteredEvents(result);
    setCurrentPage(1); // Réinitialiser à la première page après filtrage
  }, [events, filters]);

  // Calculer les événements à afficher pour la page actuelle
  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  
  // Calculer le nombre total de pages
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  // Gérer le changement de page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Gérer le changement de filtre
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setFilters({
      title: '',
      type: '',
      location: '',
      startDate: '',
      endDate: ''
    });
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">Liste des événements</h2>
      
      {/* Filtres */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
          <input
            type="text"
            name="title"
            value={filters.title}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Filtrer par titre"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Tous</option>
            <option value="collecte">Collecte</option>
            <option value="marché">Marché</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Filtrer par lieu"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date début (après)</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date fin (avant)</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      
      {/* Bouton de réinitialisation des filtres */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Réinitialiser les filtres
        </button>
      </div>
      
      {/* Tableau */}
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
                Lieu
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bénévoles
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentEvents.length > 0 ? (
              currentEvents.map((event) => {
                // Déterminer le type d'événement pour l'affichage
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
                      <div className="text-sm font-medium text-gray-900">
                        <button 
                          className="text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                          onClick={() => onShowDetails(event)}
                        >
                          {event.title}
                        </button>
                      </div>
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
                      <div className="text-sm text-gray-500">{event.location || "Non spécifié"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{event.description || "Non spécifié"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {event.volunteers?.length || 0}/{event.expectedVolunteers || 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => onEdit(event)}
                      >
                        Modifier
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => onDelete(event._id)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucun événement trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Précédent</span>
              &laquo; Précédent
            </button>
            
            {/* Afficher les numéros de page */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === page
                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Suivant</span>
              Suivant &raquo;
            </button>
          </nav>
        </div>
      )}
      
      {/* Informations sur les résultats */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        Affichage de {indexOfFirstEvent + 1} à {Math.min(indexOfLastEvent, filteredEvents.length)} sur {filteredEvents.length} événements
      </div>
    </div>
  );
};

export default EventsTable;
