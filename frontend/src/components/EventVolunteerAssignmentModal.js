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
  const [selectedMerchants, setSelectedMerchants] = useState([]);
  const [donationMerchants, setDonationMerchants] = useState([]);
  const [selectedDonationMerchant, setSelectedDonationMerchant] = useState('');
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);

  // Charger les données des commerçants et des bénévoles lorsque le modal s'ouvre
  useEffect(() => {
    if (isOpen && event) {
      fetchData();
      
      // Initialiser les commerçants sélectionnés si l'événement a déjà des commerçants
      if (event.merchants && Array.isArray(event.merchants)) {
        setSelectedMerchants(event.merchants.map(merchant => 
          typeof merchant === 'object' ? merchant._id : merchant
        ));
      } else {
        setSelectedMerchants([]);
      }
    }
  }, [isOpen, event]);

  // Fonction pour récupérer les données nécessaires
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Récupération des données pour l\'événement:', event._id);
      
      // Récupérer les commerçants participants à l'événement
      let eventMerchants = [];
      let allMerchants = [];
      
      try {
        // Récupérer tous les commerçants disponibles
        const allMerchantsResponse = await api.get('/api/merchants');
        console.log('Réponse de tous les commerçants:', allMerchantsResponse);
        allMerchants = allMerchantsResponse.data?.data || allMerchantsResponse.data || [];
        
        // S'assurer que allMerchants est un tableau
        if (!Array.isArray(allMerchants)) {
          console.error('Les données des commerçants ne sont pas un tableau:', allMerchants);
          allMerchants = [];
        }
        
        // Récupérer les commerçants déjà associés à l'événement
        const merchantsData = await api.get(`/api/events/${event._id}/merchants`);
        console.log('Réponse des commerçants de l\'événement:', merchantsData);
        eventMerchants = merchantsData.data?.data || merchantsData.data || [];
        
        // S'assurer que eventMerchants est un tableau
        if (!Array.isArray(eventMerchants)) {
          console.error('Les données des commerçants de l\'événement ne sont pas un tableau:', eventMerchants);
          eventMerchants = [];
        }
        
        // Marquer les commerçants qui sont déjà associés à l'événement
        allMerchants = allMerchants.map(merchant => ({
          ...merchant,
          isSelected: eventMerchants.some(eventMerchant => 
            eventMerchant._id === merchant._id || 
            (eventMerchant.id && eventMerchant.id === merchant._id)
          )
        }));
      } catch (error) {
        console.error('Erreur lors de la récupération des commerçants:', error);
        allMerchants = [];
      }
      
      // Récupérer les bénévoles participant à l'événement directement depuis l'événement
      let volunteers = [];
      try {
        // Vérifier si l'événement a déjà des bénévoles
        if (event.volunteers && Array.isArray(event.volunteers) && event.volunteers.length > 0) {
          console.log('Bénévoles trouvés dans l\'événement:', event.volunteers);
          
          // Si les bénévoles sont des objets complets, les utiliser directement
          if (typeof event.volunteers[0] === 'object' && event.volunteers[0]._id) {
            volunteers = event.volunteers;
          } else {
            // Sinon, récupérer les détails des bénévoles
            const volunteersData = await api.get(`/api/events/${event._id}/volunteers`);
            console.log('Réponse des bénévoles:', volunteersData);
            volunteers = volunteersData.data?.data || volunteersData.data || [];
          }
        } else {
          // Si l'événement n'a pas de bénévoles, les récupérer via l'API
          const volunteersData = await api.get(`/api/events/${event._id}/volunteers`);
          console.log('Réponse des bénévoles:', volunteersData);
          volunteers = volunteersData.data?.data || volunteersData.data || [];
          
          // Si toujours aucun bénévole, récupérer tous les bénévoles
          if (!volunteers.length) {
            console.log('Aucun bénévole trouvé pour cet événement, récupération de tous les bénévoles');
            const allVolunteersResponse = await api.get('/api/users?role=bénévole');
            console.log('Réponse de tous les bénévoles:', allVolunteersResponse);
            volunteers = allVolunteersResponse.data?.data || allVolunteersResponse.data || [];
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des bénévoles:', error);
        volunteers = [];
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
      setMerchants(Array.isArray(allMerchants) ? allMerchants : []);
      setVolunteers(Array.isArray(volunteers) ? volunteers : []);
      
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
      // Créer des affectations pour les bénévoles sélectionnés et le commerçant sélectionné
      let newAssignments = [...assignments];
      
      // Si nous avons des bénévoles sélectionnés et un commerçant sélectionné
      if (selectedVolunteers.length > 0 && selectedDonationMerchant) {
        // Pour chaque bénévole sélectionné
        selectedVolunteers.forEach(volunteerId => {
          // Vérifier si ce bénévole a déjà une affectation
          const existingAssignmentIndex = newAssignments.findIndex(
            assignment => assignment.volunteerId === volunteerId
          );
          
          // Récupérer les items du commerçant sélectionné
          const merchantItems = merchantDonations[selectedDonationMerchant] || [];
          
          if (existingAssignmentIndex !== -1) {
            // Mettre à jour l'affectation existante
            newAssignments[existingAssignmentIndex] = {
              ...newAssignments[existingAssignmentIndex],
              merchantId: selectedDonationMerchant,
              items: merchantItems.map((item, index) => ({
                id: `${selectedDonationMerchant}-${index}-${Date.now()}`, // Générer un ID unique
                name: item.product || 'Article sans nom',
                quantity: item.quantity || 1,
                unit: item.unit || 'kg'
              }))
            };
          } else {
            // Créer une nouvelle affectation
            const volunteer = volunteers.find(v => v._id === volunteerId);
            newAssignments.push({
              volunteerId: volunteerId,
              volunteerName: volunteer?.name || 'Bénévole',
              merchantId: selectedDonationMerchant,
              items: merchantItems.map((item, index) => ({
                id: `${selectedDonationMerchant}-${index}-${Date.now()}`, // Générer un ID unique
                name: item.product || 'Article sans nom',
                quantity: item.quantity || 1,
                unit: item.unit || 'kg'
              }))
            });
          }
        });
      }
      
      // Mettre à jour l'état des affectations
      setAssignments(newAssignments);
      
      // Filtrer les affectations incomplètes
      const validAssignments = newAssignments.filter(
        assignment => assignment.merchantId
      );
      
      console.log('Enregistrement des affectations:', validAssignments);
      
      // Envoyer les affectations au serveur en utilisant le service d'affectation
      await saveEventAssignments(event._id, validAssignments);
      
      // Enregistrer les commerçants sélectionnés pour l'événement
      if (selectedMerchants.length > 0) {
        try {
          console.log('Enregistrement des commerçants sélectionnés:', selectedMerchants);
          await api.put(`/api/events/${event._id}`, {
            merchants: selectedMerchants
          });
        } catch (merchantError) {
          console.error('Erreur lors de l\'enregistrement des commerçants:', merchantError);
          // Continuer malgré l'erreur pour ne pas bloquer l'enregistrement des affectations
        }
      }
      
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
  
  // Mettre à jour les commerçants sélectionnés lorsque le commerçant sélectionné dans le dropdown change
  useEffect(() => {
    if (selectedDonationMerchant) {
      // Si un commerçant est sélectionné dans le dropdown et qu'il n'est pas déjà dans la liste des commerçants sélectionnés
      if (!selectedMerchants.includes(selectedDonationMerchant)) {
        setSelectedMerchants(prev => [...prev, selectedDonationMerchant]);
      }
    }
  }, [selectedDonationMerchant]);
  
  // Mettre à jour l'affectation lorsque les bénévoles sélectionnés changent
  useEffect(() => {
    if (selectedVolunteers.length > 0 && selectedDonationMerchant) {
      // Affecter le commerçant sélectionné à tous les bénévoles sélectionnés
      selectedVolunteers.forEach(volunteerId => {
        handleMerchantAssignment(volunteerId, selectedDonationMerchant);
      });
    }
  }, [selectedVolunteers, selectedDonationMerchant]);
  
  // Fonction pour récupérer les donations
  const fetchDonations = async () => {
    try {
      const donationsResponse = await api.get(`/api/events/${event._id}/donations`);
      const donations = donationsResponse.data?.data || donationsResponse.data || [];
      
      console.log('Donations récupérées:', donations);
      
      // Organiser les donations par commerçant
      const donationsByMerchant = {};
      const uniqueMerchants = new Map();
      
      if (donations && donations.length > 0) {
        donations.forEach(donation => {
          if (donation.merchant && donation.merchant._id) {
            // Si merchant est un objet avec un _id
            const merchantId = donation.merchant._id;
            
            if (!donationsByMerchant[merchantId]) {
              donationsByMerchant[merchantId] = [];
            }
            
            // Ajouter les items à la liste des donations du commerçant
            if (donation.items && Array.isArray(donation.items)) {
              donationsByMerchant[merchantId] = donation.items;
            }
            
            // Ajouter le commerçant à la liste des commerçants uniques
            uniqueMerchants.set(merchantId, {
              _id: merchantId,
              businessName: donation.merchant.businessName || 'Commerçant sans nom',
              name: donation.merchant.name || donation.merchant.businessName || 'Commerçant sans nom'
            });
          } else if (donation.merchant) {
            // Si merchant est directement un ID
            const merchantId = donation.merchant;
            
            if (!donationsByMerchant[merchantId]) {
              donationsByMerchant[merchantId] = [];
            }
            
            // Ajouter les items à la liste des donations du commerçant
            if (donation.items && Array.isArray(donation.items)) {
              donationsByMerchant[merchantId] = donation.items;
            }
            
            // Pour les IDs simples, nous devons récupérer les détails du commerçant
            if (!uniqueMerchants.has(merchantId)) {
              // Chercher le commerçant dans la liste des commerçants
              const merchantDetails = merchants.find(m => m._id === merchantId);
              if (merchantDetails) {
                uniqueMerchants.set(merchantId, {
                  _id: merchantId,
                  businessName: merchantDetails.businessName || 'Commerçant sans nom',
                  name: merchantDetails.name || merchantDetails.businessName || 'Commerçant sans nom'
                });
              } else {
                // Si nous n'avons pas les détails, utiliser juste l'ID
                uniqueMerchants.set(merchantId, {
                  _id: merchantId,
                  businessName: 'Commerçant ' + merchantId,
                  name: 'Commerçant ' + merchantId
                });
              }
            }
          }
        });
      }
      
      console.log('Donations organisées par commerçant:', donationsByMerchant);
      setMerchantDonations(donationsByMerchant);
      
      // Convertir la Map en tableau pour l'état
      const merchantsArray = Array.from(uniqueMerchants.values());
      console.log('Commerçants ayant fait des donations:', merchantsArray);
      setDonationMerchants(merchantsArray);
    } catch (error) {
      console.error('Erreur lors du chargement des donations:', error);
    }
  };
  
  // Filtrer les commerçants en fonction de la sélection
  const getFilteredMerchants = () => {
    if (selectedDonationMerchant) {
      return merchants.filter(merchant => merchant._id === selectedDonationMerchant);
    }
    return merchants;
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
      { id: `${merchantId}-default-1`, name: 'Pain', quantity: 1, unit: 'kg' },
      { id: `${merchantId}-default-2`, name: 'Légumes', quantity: 1, unit: 'kg' },
      { id: `${merchantId}-default-3`, name: 'Fruits', quantity: 1, unit: 'kg' },
      { id: `${merchantId}-default-4`, name: 'Produits laitiers', quantity: 1, unit: 'kg' }
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
            {/* Liste des bénévoles */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Affectation des bénévoles</h3>
              <div className="bg-white shadow overflow-hidden rounded-md p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sélectionner des bénévoles
                  </label>
                  
                  {/* Multi-select pour les bénévoles */}
                  <div className="mt-1 border border-gray-300 rounded-md p-2 max-h-60 overflow-y-auto">
                    {volunteers.length > 0 ? (
                      volunteers.map(volunteer => (
                        <div key={volunteer._id} className="flex items-center p-2 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            id={`volunteer-${volunteer._id}`}
                            checked={selectedVolunteers.includes(volunteer._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedVolunteers(prev => [...prev, volunteer._id]);
                              } else {
                                setSelectedVolunteers(prev => prev.filter(id => id !== volunteer._id));
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`volunteer-${volunteer._id}`} className="ml-3 flex-1 cursor-pointer">
                            <div className="font-medium text-gray-900">{volunteer.name || 'Bénévole sans nom'}</div>
                          </label>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-2">
                        Aucun bénévole participant à cet événement
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    {selectedVolunteers.length} bénévole(s) sélectionné(s)
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sélection des commerçants ayant fait des donations */}
            <div className="bg-gray-50 p-4 rounded-lg mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Commerçants participants (via donations)</h3>
              <div className="mb-4">
                <label htmlFor="donation-merchant-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Sélectionner un commerçant
                </label>
                <select
                  id="donation-merchant-select"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedDonationMerchant}
                  onChange={(e) => setSelectedDonationMerchant(e.target.value)}
                >
                  <option value="">Tous les commerçants</option>
                  {donationMerchants.map(merchant => (
                    <option key={merchant._id} value={merchant._id}>
                      {merchant.businessName || merchant.name || 'Commerçant sans nom'}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  {donationMerchants.length} commerçant(s) ont fait des donations pour cet événement
                </p>
              </div>
              
              {/* Affichage des dons du commerçant sélectionné */}
              {selectedDonationMerchant && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Dons proposés par ce commerçant</h4>
                  
                  {merchantDonations[selectedDonationMerchant] && merchantDonations[selectedDonationMerchant].length > 0 ? (
                    <div className="bg-white shadow overflow-hidden rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {merchantDonations[selectedDonationMerchant].map((item, index) => (
                          <li key={index} className="px-4 py-3">
                            <div className="flex justify-between">
                              <div className="text-sm font-medium text-gray-900">{item.product || 'Article sans nom'}</div>
                              <div className="text-sm text-gray-500">
                                {item.quantity} {item.unit || 'kg'}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-white shadow overflow-hidden rounded-md p-4 text-center text-gray-500">
                      Aucune donation enregistrée pour ce commerçant.
                    </div>
                  )}
                </div>
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
