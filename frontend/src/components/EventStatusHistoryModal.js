import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Modal from './Modal';
import { getEventById } from '../services/eventService';

const EventStatusHistoryModal = ({ isOpen, onClose, event }) => {
  const [statusHistory, setStatusHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && event) {
      fetchStatusHistory();
    }
  }, [isOpen, event]);

  const fetchStatusHistory = async () => {
    if (!event || !event._id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Récupérer les données complètes de l'événement pour avoir l'historique des statuts
      const response = await getEventById(event._id);
      
      let history = [];
      
      if (response && response.data && response.data.statusHistory) {
        // Utiliser l'historique des statuts de l'événement
        history = response.data.statusHistory;
      } else if (event.statusHistory) {
        // Si l'historique est déjà disponible dans l'objet event
        history = event.statusHistory;
      } else {
        // Si aucun historique n'est disponible
        history = [{
          status: event.status || 'incomplet',
          changedAt: event.updatedAt || new Date(),
          changedBy: 'Système'
        }];
      }
      
      // Trier l'historique par date (du plus récent au plus ancien)
      const sortedHistory = history.sort((a, b) => {
        const dateA = new Date(a.changedAt || a.timestamp || a.date || 0);
        const dateB = new Date(b.changedAt || b.timestamp || b.date || 0);
        return dateB - dateA; // Ordre décroissant
      });
      
      setStatusHistory(sortedHistory);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique des statuts:', err);
      setError('Impossible de charger l\'historique des statuts. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  // Formater la date pour l'affichage
  const formatDate = (date) => {
    if (!date) return "N/A";
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  // Obtenir le libellé et la couleur du statut
  const getStatusInfo = (statusCode) => {
    switch(statusCode) {
      case "incomplet":
        return { label: "Incomplet", color: "#f59e0b" }; // Ambre
      case "pret":
        return { label: "Prêt", color: "#10b981" }; // Vert émeraude
      case "en_cours":
        return { label: "En cours", color: "#3b82f6" }; // Bleu
      case "annule":
        return { label: "Annulé", color: "#ef4444" }; // Rouge
      case "termine":
        return { label: "Terminé", color: "#6b7280" }; // Gris
      default:
        return { label: statusCode, color: "#6b7280" }; // Gris par défaut
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Historique des statuts - ${event?.title || 'Événement'}`}>
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <svg className="animate-spin h-8 w-8 mx-auto text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2">Chargement de l'historique...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>{error}</p>
            <button 
              onClick={fetchStatusHistory}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <>
            {statusHistory.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Aucun historique de statut disponible pour cet événement.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de modification
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modifié par
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {statusHistory.map((item, index) => {
                      const { label, color } = getStatusInfo(item.status);
                      return (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span 
                              className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                              style={{ 
                                backgroundColor: `${color}20`, // 20% opacity
                                color: color,
                                border: `1px solid ${color}`
                              }}
                            >
                              {label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.changedAt || item.timestamp || item.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.changedBy || item.userId || item.user || 'Système'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default EventStatusHistoryModal;
