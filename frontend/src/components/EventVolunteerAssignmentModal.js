import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Modal from './Modal';
import api from '../services/api';
import { 
  getEventAssignments, 
  saveEventAssignments, 
  getEventDonations, 
  getEventVolunteers, 
  getEventMerchants 
} from '../services/assignmentService';

const EventVolunteerAssignmentModal = ({ isOpen, onClose, event, onAssignmentSave }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [merchants, setMerchants] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState(null);

  // Charger les données des commerçants et des bénévoles lorsque le modal s'ouvre
  useEffect(() => {
    if (isOpen && event) {
      fetchData();
    }
  }, [isOpen, event]);

  // Fonction pour récupérer les données nécessaires
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Récupération des données pour l\'événement:', event._id);
      
      // Récupérer les commerçants participants à l'événement
      let merchants = [];
      try {
        const merchantsData = await api.get(`/api/events/${event._id}/merchants`);
        console.log('Réponse des commerçants:', merchantsData);
        merchants = merchantsData.data?.data || merchantsData.data || [];
      } catch (error) {
        console.error('Erreur lors de la récupération des commerçants:', error);
      }
      
      // Si aucun commerçant n'est associé à l'événement, récupérer tous les commerçants
      if (merchants.length === 0) {
        console.log('Aucun commerçant trouvé pour cet événement, récupération de tous les commerçants');
        try {
          const allMerchantsResponse = await api.get('/api/merchants');
          console.log('Réponse de tous les commerçants:', allMerchantsResponse);
          merchants = allMerchantsResponse.data?.data || allMerchantsResponse.data || [];
        } catch (error) {
          console.error('Erreur lors de la récupération de tous les commerçants:', error);
        }
      }
      
      // Récupérer les bénévoles participant à l'événement
      let volunteers = [];
      try {
        const volunteersData = await api.get(`/api/events/${event._id}/volunteers`);
        console.log('Réponse des bénévoles:', volunteersData);
        volunteers = volunteersData.data?.data || volunteersData.data || [];
      } catch (error) {
        console.error('Erreur lors de la récupération des bénévoles:', error);
        // Si aucun bénévole n'est trouvé, récupérer tous les bénévoles
        try {
          console.log('Aucun bénévole trouvé pour cet événement, récupération de tous les bénévoles');
          const allVolunteersResponse = await api.get('/api/users?role=bénévole');
          console.log('Réponse de tous les bénévoles:', allVolunteersResponse);
          volunteers = allVolunteersResponse.data?.data || allVolunteersResponse.data || [];
        } catch (volunteerError) {
          console.error('Erreur lors de la récupération de tous les bénévoles:', volunteerError);
        }
      }
      
      // Récupérer les donations pour cet événement
      const donationsData = await api.get(`/api/events/${event._id}/donations`).catch((error) => {
        console.error('Erreur lors de la récupération des donations:', error);
        return { data: [] };
      });
      const donations = donationsData.data?.data || donationsData.data || [];
      
      // Récupérer les affectations existantes si disponibles
      const assignmentsData = await api.get(`/api/events/${event._id}/assignments`).catch((error) => {
        console.error('Erreur lors de la récupération des affectations:', error);
        return { data: [] };
      });
      const existingAssignments = assignmentsData.data?.data || assignmentsData.data || [];
      
      // Mettre à jour les états
      setMerchants(merchants);
      setVolunteers(volunteers);
      
      if (existingAssignments.length > 0) {
        setAssignments(existingAssignments);
      } else {
        // Créer une structure d'affectation vide pour chaque bénévole
        const initialAssignments = volunteers.map(volunteer => ({
          volunteerId: volunteer._id,
          volunteerName: volunteer.name,
          merchantId: '',
          items: []
        }));
        setAssignments(initialAssignments);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Une erreur est survenue lors du chargement des données. Veuillez réessayer.');
      setIsLoading(false);
    }
  };

  // Fonction pour mettre à jour l'affectation d'un bénévole à un commerçant
  const handleMerchantAssignment = (volunteerId, merchantId) => {
    setAssignments(prevAssignments => {
      return prevAssignments.map(assignment => {
        if (assignment.volunteerId === volunteerId) {
          // Si le commerçant change, réinitialiser les articles
          if (assignment.merchantId !== merchantId) {
            return {
              ...assignment,
              merchantId,
              items: []
            };
          }
          return {
            ...assignment,
            merchantId
          };
        }
        return assignment;
      });
    });
  };

  // Fonction pour mettre à jour les articles assignés à un bénévole
  const handleItemAssignment = (volunteerId, selectedItems) => {
    setAssignments(prevAssignments => {
      return prevAssignments.map(assignment => {
        if (assignment.volunteerId === volunteerId) {
          return {
            ...assignment,
            items: selectedItems
          };
        }
        return assignment;
      });
    });
  };

  // Fonction pour mettre à jour la quantité d'un article
  const handleQuantityChange = (volunteerId, itemIndex, quantity) => {
    setAssignments(prevAssignments => {
      return prevAssignments.map(assignment => {
        if (assignment.volunteerId === volunteerId) {
          const updatedItems = [...assignment.items];
          updatedItems[itemIndex] = {
            ...updatedItems[itemIndex],
            quantity: parseFloat(quantity) || 0
          };
          return {
            ...assignment,
            items: updatedItems
          };
        }
        return assignment;
      });
    });
  };

  // Fonction pour enregistrer les affectations
  const handleSave = async () => {
    try {
      // Filtrer les affectations incomplètes
      const validAssignments = assignments.filter(
        assignment => assignment.merchantId && assignment.items.length > 0
      );
      
      console.log('Enregistrement des affectations:', validAssignments);
      
      // Envoyer les affectations au serveur
      await api.post(`/api/events/${event._id}/assignments`, {
        assignments: validAssignments
      });
      
      // Fermer le modal et notifier le parent
      onClose();
      if (onAssignmentSave) {
        onAssignmentSave(validAssignments);
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement des affectations:', error);
      setError('Une erreur est survenue lors de l\'enregistrement des affectations. Veuillez réessayer.');
    }
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: fr });
  };

  // État pour stocker les donations par commerçant
  const [merchantDonations, setMerchantDonations] = useState({});
  
  // Charger les donations lorsque le modal s'ouvre
  useEffect(() => {
    if (isOpen && event) {
      fetchDonations();
    }
  }, [isOpen, event]);
  
  // Fonction pour récupérer les donations
  const fetchDonations = async () => {
    try {
      const donationsResponse = await api.get(`/api/events/${event._id}/donations`);
      const donations = donationsResponse.data?.data || donationsResponse.data || [];
      
      console.log('Donations récupérées:', donations);
      
      // Organiser les donations par commerçant
      const donationsByMerchant = {};
      
      if (donations && donations.length > 0) {
        donations.forEach(donation => {
          if (donation.merchant && donation.merchant._id) {
            // Si merchant est un objet avec un _id
            if (!donationsByMerchant[donation.merchant._id]) {
              donationsByMerchant[donation.merchant._id] = [];
            }
            donationsByMerchant[donation.merchant._id] = donation.items;
          } else if (donation.merchant) {
            // Si merchant est directement un ID
            if (!donationsByMerchant[donation.merchant]) {
              donationsByMerchant[donation.merchant] = [];
            }
            donationsByMerchant[donation.merchant] = donation.items;
          }
        });
      }
      
      console.log('Donations organisées par commerçant:', donationsByMerchant);
      setMerchantDonations(donationsByMerchant);
    } catch (error) {
      console.error('Erreur lors du chargement des donations:', error);
    }
  };
  
  // Récupérer les articles disponibles pour un commerçant donné
  const getMerchantItems = (merchantId) => {
    console.log('Récupération des articles pour le commerçant:', merchantId);
    console.log('Donations disponibles:', merchantDonations);
    
    if (!merchantId) {
      console.log('Aucun commerçant sélectionné');
      return [];
    }
    
    // Vérifier si nous avons des donations pour ce commerçant
    if (merchantDonations[merchantId] && merchantDonations[merchantId].length > 0) {
      console.log('Articles trouvés pour ce commerçant:', merchantDonations[merchantId]);
      return merchantDonations[merchantId].map((item, index) => ({
        id: `${merchantId}-${index}`,
        name: item.product || 'Article sans nom',
        quantity: item.quantity || 1,
        unit: item.unit || 'kg'
      }));
    }
    
    // Si aucune donation n'est trouvée, retourner des articles par défaut
    console.log('Aucun article trouvé pour ce commerçant, utilisation des articles par défaut');
    return [
      { id: `${merchantId}-1`, name: 'Fruits et légumes', unit: 'kg' },
      { id: `${merchantId}-2`, name: 'Produits laitiers', unit: 'kg' },
      { id: `${merchantId}-3`, name: 'Produits secs', unit: 'kg' },
      { id: `${merchantId}-4`, name: 'Produits frais', unit: 'unité' }
    ];
  };

  if (!isOpen || !event) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Détails de l'événement: ${event.title}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Informations de l'événement */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Informations générales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Date de début</p>
              <p className="font-medium">{formatDate(event.start)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date de fin</p>
              <p className="font-medium">{formatDate(event.end)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="font-medium capitalize">{event.type || 'Collecte'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Lieu</p>
              <p className="font-medium">{event.location || 'Non spécifié'}</p>
            </div>
          </div>
          {event.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium">{event.description}</p>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg text-red-600">
            {error}
          </div>
        ) : (
          <>
            {/* Liste des commerçants participants */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Commerçants participants</h3>
              {merchants.length > 0 ? (
                <div className="bg-white shadow overflow-hidden rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {merchants.map(merchant => (
                      <li key={merchant._id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{merchant.businessName || merchant.name || 'Commerçant sans nom'}</p>
                            <p className="text-sm text-gray-500">
                              {merchant.address?.street ? 
                                `${merchant.address.street}, ${merchant.address.city || ''}` : 
                                'Adresse non spécifiée'}
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {merchant.phoneNumber || 'Téléphone non spécifié'}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-gray-500">Aucun commerçant participant à cet événement.</p>
              )}
            </div>

            {/* Liste des bénévoles et affectations */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Affectation des bénévoles</h3>
              {volunteers.length > 0 ? (
                <div className="space-y-4">
                  {volunteers.map(volunteer => {
                    const assignment = assignments.find(a => a.volunteerId === volunteer._id) || {
                      volunteerId: volunteer._id,
                      merchantId: '',
                      items: []
                    };
                    
                    return (
                      <div key={volunteer._id} className="bg-white shadow overflow-hidden rounded-md p-4">
                        <h4 className="font-medium text-gray-900 mb-3">{volunteer.name || 'Bénévole sans nom'}</h4>
                        
                        {/* Sélection du commerçant */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Commerçant assigné
                          </label>
                          <select
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            value={assignment.merchantId}
                            onChange={(e) => handleMerchantAssignment(volunteer._id, e.target.value)}
                          >
                            <option value="">Sélectionner un commerçant</option>
                            {merchants.map(merchant => (
                              <option key={merchant._id} value={merchant._id}>
                                {merchant.businessName || merchant.name || 'Commerçant sans nom'}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Sélection des articles si un commerçant est sélectionné */}
                        {assignment.merchantId && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Articles à collecter
                            </label>
                            
                            <div className="mt-2 space-y-2">
                              {getMerchantItems(assignment.merchantId).map(item => {
                                const assignedItem = assignment.items.find(i => i.id === item.id);
                                const isSelected = !!assignedItem;
                                
                                return (
                                  <div key={item.id} className="flex items-center space-x-3">
                                    <input
                                      type="checkbox"
                                      id={`item-${volunteer._id}-${item.id}`}
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          // Ajouter l'article
                                          handleItemAssignment(volunteer._id, [
                                            ...assignment.items,
                                            { id: item.id, name: item.name, unit: item.unit, quantity: 1 }
                                          ]);
                                        } else {
                                          // Retirer l'article
                                          handleItemAssignment(
                                            volunteer._id,
                                            assignment.items.filter(i => i.id !== item.id)
                                          );
                                        }
                                      }}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor={`item-${volunteer._id}-${item.id}`} className="flex-1 text-sm text-gray-700">
                                      {item.name}
                                    </label>
                                    
                                    {isSelected && (
                                      <div className="flex items-center">
                                        <input
                                          type="number"
                                          min="0.1"
                                          step="0.1"
                                          value={assignedItem.quantity}
                                          onChange={(e) => {
                                            const itemIndex = assignment.items.findIndex(i => i.id === item.id);
                                            handleQuantityChange(volunteer._id, itemIndex, e.target.value);
                                          }}
                                          className="block w-20 pl-2 pr-2 py-1 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                                        />
                                        <span className="ml-2 text-sm text-gray-500">{item.unit}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">Aucun bénévole participant à cet événement.</p>
              )}
            </div>
          </>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Enregistrer les affectations
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EventVolunteerAssignmentModal;
