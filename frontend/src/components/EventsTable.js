import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const EventsTable = ({ 
  events, 
  onEdit, 
  onDelete, 
  onShowDetails, 
  onShowHistory, // Nouvelle prop pour afficher l'historique des statuts
  itemsPerPage = 5,
  onItemsPerPageChange // Prop pour informer le parent du changement de nombre d'éléments par page
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({
    title: '',
    type: '',
    status: '',
    location: '',
    startDate: '',
    endDate: ''
  });

  // Appliquer les filtres aux événements
  useEffect(() => {
    console.log("EventsTable: Mise à jour des événements ou des filtres détectée");
    
    // Vérifier que events est bien un tableau
    if (!Array.isArray(events)) {
      console.warn("EventsTable: events n'est pas un tableau", events);
      setFilteredEvents([]);
      return;
    }
    
    console.log(`EventsTable: Filtrage de ${events.length} événements`);
    
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
    
    // Filtre par statut
    if (filters.status) {
      result = result.filter(event => 
        event.status === filters.status
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
    
    console.log(`EventsTable: ${result.length} événements après filtrage`);
    setFilteredEvents(result);
    
    // Réinitialiser à la première page après filtrage
    // mais seulement si les filtres ont changé, pas si les événements ont changé
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(prevFilters.current);
    if (filtersChanged) {
      setCurrentPage(1);
      prevFilters.current = {...filters};
    }
  }, [events, filters]);
  
  // Référence pour suivre les changements de filtres
  const prevFilters = React.useRef({...filters});

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
      status: '',
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
      <div className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-4">
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Tous</option>
            <option value="incomplet">Incomplet</option>
            <option value="pret">Prêt</option>
            <option value="en_cours">En cours</option>
            <option value="annule">Annulé</option>
            <option value="termine">Terminé</option>
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
      <div className="w-full">
        <table className="w-full table-fixed divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Titre
              </th>
              <th scope="col" className="w-1/8 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de début
              </th>
              <th scope="col" className="w-1/8 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de fin
              </th>
              <th scope="col" className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" className="w-1/8 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lieu
              </th>
              <th scope="col" className="w-1/6 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="w-1/12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bénévoles
              </th>
              <th scope="col" className="w-1/8 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <td className="px-4 py-4">
                      <div 
                        className="text-sm font-medium truncate"
                        style={{ 
                          color: event.type?.toLowerCase() === 'marché' ? '#3b82f6' : '#16a34a' 
                        }}
                        title={event.title}
                      >
                        {event.title}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-500">{formatDate(event.start)}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-500">{formatDate(event.end)}</div>
                    </td>
                    <td className="px-4 py-4">
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
                    <td className="px-4 py-4">
                      {(() => {
                        // Déterminer le style du statut
                        let statusText = event.status || "incomplet";
                        let statusColor = "#6b7280"; // Gris par défaut
                        
                        switch(statusText) {
                          case "incomplet":
                            statusColor = "#f59e0b"; // Ambre
                            statusText = "Incomplet";
                            break;
                          case "pret":
                            statusColor = "#10b981"; // Vert émeraude
                            statusText = "Prêt";
                            break;
                          case "en_cours":
                            statusColor = "#3b82f6"; // Bleu
                            statusText = "En cours";
                            break;
                          case "annule":
                            statusColor = "#ef4444"; // Rouge
                            statusText = "Annulé";
                            break;
                          case "termine":
                            statusColor = "#6b7280"; // Gris
                            statusText = "Terminé";
                            break;
                          default:
                            statusText = "Incomplet";
                        }
                        
                        return (
                          <span 
                            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                            style={{ 
                              backgroundColor: statusColor + '20', // Ajoute une transparence
                              color: statusColor 
                            }}
                          >
                            {statusText}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-500 truncate" title={event.location || "Non spécifié"}>
                        {event.location || "Non spécifié"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-500 truncate" title={event.description || "Non spécifié"}>
                        {event.description || "Non spécifié"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-500">
                        {event.volunteers?.length || 0}/{event.expectedVolunteers || 1}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded"
                          onClick={() => onEdit(event)}
                          title="Modifier"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded"
                          onClick={() => onDelete(event._id)}
                          title="Supprimer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <button 
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded"
                          onClick={() => onShowDetails(event)}
                          title="Affectation"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded"
                          onClick={() => onShowHistory && onShowHistory(event)}
                          title="Historique des statuts"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="px-4 py-4 text-center text-sm text-gray-500">
                  Aucun événement trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination améliorée */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6 flex-wrap gap-4">
          <div className="flex items-center">
            <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-600">Lignes par page:</label>
            <select 
              id="itemsPerPage"
              className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              value={itemsPerPage}
              onChange={(e) => {
                const newItemsPerPage = parseInt(e.target.value);
                // Nous utilisons une fonction pour simuler le changement de itemsPerPage
                // puisque c'est une prop et non un état local
                const newTotalPages = Math.ceil(filteredEvents.length / newItemsPerPage);
                const newCurrentPage = Math.min(currentPage, newTotalPages);
                
                // Informer le parent du changement si nécessaire
                if (typeof onItemsPerPageChange === 'function') {
                  onItemsPerPageChange(newItemsPerPage);
                }
                
                // Ajuster la page courante si nécessaire
                if (newCurrentPage !== currentPage) {
                  setCurrentPage(newCurrentPage);
                }
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          
          <nav className="relative z-0 inline-flex rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Première page</span>
              &laquo;
            </button>
            
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Précédent</span>
              &lsaquo;
            </button>
            
            {/* Afficher les numéros de page avec pagination intelligente */}
            {(() => {
              const pageNumbers = [];
              const maxPagesToShow = 5; // Nombre maximum de pages à afficher
              
              let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
              let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
              
              // Ajuster si on est proche de la fin
              if (endPage - startPage + 1 < maxPagesToShow) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
              }
              
              // Ajouter la première page et ellipsis si nécessaire
              if (startPage > 1) {
                pageNumbers.push(
                  <button
                    key={1}
                    onClick={() => handlePageChange(1)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    1
                  </button>
                );
                
                if (startPage > 2) {
                  pageNumbers.push(
                    <span key="ellipsis1" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  );
                }
              }
              
              // Ajouter les pages du milieu
              for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === i
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i}
                  </button>
                );
              }
              
              // Ajouter ellipsis et dernière page si nécessaire
              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pageNumbers.push(
                    <span key="ellipsis2" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      ...
                    </span>
                  );
                }
                
                pageNumbers.push(
                  <button
                    key={totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                );
              }
              
              return pageNumbers;
            })()}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Suivant</span>
              &rsaquo;
            </button>
            
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Dernière page</span>
              &raquo;
            </button>
          </nav>
          
          {/* Informations sur les résultats */}
          <div className="text-sm text-gray-500">
            Affichage de {filteredEvents.length > 0 ? indexOfFirstEvent + 1 : 0} à {Math.min(indexOfLastEvent, filteredEvents.length)} sur {filteredEvents.length} événements
          </div>
        </div>
      )}
      
      {/* Si pas de pagination, afficher uniquement les informations sur les résultats */}
      {totalPages <= 1 && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Affichage de {filteredEvents.length > 0 ? 1 : 0} à {filteredEvents.length} sur {filteredEvents.length} événements
        </div>
      )}
    </div>
  );
};

export default EventsTable;
