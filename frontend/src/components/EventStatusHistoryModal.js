import React, { useState, useEffect, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Modal from './Modal';
import { getEventById } from '../services/eventService';

const EventStatusHistoryModal = ({ isOpen, onClose, event }) => {
  const [statusHistory, setStatusHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Référence pour suivre si le composant est monté
  const isMounted = useRef(true);
  
  // Réinitialiser la référence lors du démontage
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Utiliser useCallback pour éviter de recréer la fonction à chaque rendu
  const fetchStatusHistory = useCallback(async () => {
    // Vérifier que l'événement est valide
    if (!event || !event._id) {
      if (isMounted.current) {
        setError('Événement invalide ou non spécifié.');
        setIsLoading(false);
      }
      return;
    }
    
    // Éviter de refaire une requête si nous sommes déjà en train de charger
    if (isLoading) return;
    
    if (isMounted.current) {
      setIsLoading(true);
      setError(null);
    }
    
    try {
      // Vérifier d'abord si l'historique est déjà disponible dans l'objet event
      if (event.statusHistory && Array.isArray(event.statusHistory)) {
        const sortedHistory = [...event.statusHistory].sort((a, b) => {
          const dateA = new Date(a.changedAt || a.timestamp || a.date || 0);
          const dateB = new Date(b.changedAt || b.timestamp || b.date || 0);
          return dateB - dateA; // Ordre décroissant
        });
        
        if (isMounted.current) {
          setStatusHistory(sortedHistory);
          setIsLoading(false);
        }
        return;
      }
      
      // Sinon, récupérer les données complètes de l'événement avec un timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes de timeout
      
      try {
        const response = await getEventById(event._id);
        clearTimeout(timeoutId);
        
        // Vérifier si le composant est toujours monté
        if (!isMounted.current) return;
        
        let history = [];
        
        if (response && response.data && response.data.statusHistory) {
          // Utiliser l'historique des statuts de l'événement
          history = response.data.statusHistory;
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
        
        // Vérifier si le composant est toujours monté avant de mettre à jour l'état
        if (isMounted.current) {
          setStatusHistory(sortedHistory);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Vérifier si le composant est toujours monté
        if (!isMounted.current) return;
        
        if (fetchError.name === 'AbortError') {
          console.error('La requête a expiré après 5 secondes');
          setError('La requête a pris trop de temps. Veuillez réessayer.');
        } else {
          throw fetchError;
        }
      }
      
      if (isMounted.current) {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique des statuts:', err);
      
      if (isMounted.current) {
        setError('Impossible de charger l\'historique des statuts. Veuillez réessayer.');
        setIsLoading(false);
      }
    }
  }, [event, isLoading]);

  // Utiliser useEffect avec les dépendances correctes
  useEffect(() => {
    if (isOpen && event) {
      fetchStatusHistory();
    }
    
    // Nettoyer l'état lors de la fermeture du modal
    return () => {
      // Ne pas modifier l'état ici pour éviter des effets de bord
    };
  }, [isOpen, event, fetchStatusHistory]);

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

  // Fonction sécurisée pour fermer le modal
  const handleClose = useCallback(() => {
    // Vérifier si le composant est toujours monté
    if (isMounted.current) {
      // Réinitialiser les états avant de fermer
      setIsLoading(false);
      setError(null);
      setStatusHistory([]);
    }
    
    // Restaurer le style d'overflow du body
    document.body.style.overflow = 'auto';
    
    // Appeler la fonction onClose du parent
    if (typeof onClose === 'function') {
      onClose();
    }
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Historique des statuts - ${event?.title || 'Événement'}`}>
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
            <div className="mt-4 flex justify-center space-x-4">
              <button 
                onClick={fetchStatusHistory}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Réessayer
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
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
                onClick={handleClose}
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
