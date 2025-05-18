import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const DonationModal = ({ isOpen, onClose, event, onSubmit }) => {
  const [donations, setDonations] = useState([
    { id: 1, product: '', quantity: 1, unit: 'kg' }
  ]);
  const [note, setNote] = useState('');
  
  // Réinitialiser le formulaire lorsque le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setDonations([{ id: 1, product: '', quantity: 1, unit: 'kg' }]);
      setNote('');
    }
  }, [isOpen]);

  // Ajouter un nouvel article
  const addItem = () => {
    const newId = donations.length > 0 ? Math.max(...donations.map(d => d.id)) + 1 : 1;
    setDonations([...donations, { id: newId, product: '', quantity: 1, unit: 'kg' }]);
  };

  // Supprimer un article
  const removeItem = (id) => {
    if (donations.length > 1) {
      setDonations(donations.filter(item => item.id !== id));
    }
  };

  // Mettre à jour un article
  const updateItem = (id, field, value) => {
    setDonations(donations.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Soumettre le formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Filtrer les articles vides
      const validDonations = donations.filter(item => item.product.trim() !== '');
      
      if (validDonations.length === 0) {
        alert('Veuillez ajouter au moins un article à donner');
        return;
      }
      
      // Vérifier que l'événement a un ID
      if (!event || !event._id) {
        alert('Erreur: Informations de l\'événement manquantes');
        console.error('Événement invalide:', event);
        return;
      }
      
      // Préparer les données à soumettre
      const donationData = {
        eventId: event._id,
        donations: validDonations.map(item => ({
          product: item.product.trim(),
          quantity: parseFloat(item.quantity) || 1,
          unit: item.unit || 'kg'
        })),
        note: note.trim()
      };
      
      console.log('Données de donation préparées:', donationData);
      
      // Appeler la fonction de soumission
      onSubmit(donationData);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire de don:', error);
      alert(`Erreur lors de la soumission du don: ${error.message || 'Erreur inconnue'}`);
      // Fermer le modal même en cas d'erreur
      onClose();
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Faire un don pour cette collecte" 
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations sur l'événement */}
        <div className="bg-primary-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-primary-800 mb-2">Informations sur la collecte</h3>
          <p className="text-primary-700"><span className="font-medium">Titre:</span> {event?.title}</p>
          <p className="text-primary-700"><span className="font-medium">Date:</span> {event?.start ? new Date(event.start).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</p>
          <p className="text-primary-700"><span className="font-medium">Lieu:</span> {event?.location || 'Non spécifié'}</p>
        </div>

        {/* Liste des articles à donner */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Articles à donner</h3>
          
          <div className="space-y-4">
            {donations.map((item) => (
              <div key={item.id} className="flex items-center space-x-3">
                <div className="flex-grow">
                  <input
                    type="text"
                    value={item.product}
                    onChange={(e) => updateItem(item.id, 'product', e.target.value)}
                    placeholder="Nom du produit"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0.1"
                    step="0.1"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div className="w-20">
                  <select
                    value={item.unit}
                    onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">L</option>
                    <option value="unité">unité</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-red-600 hover:text-red-800 focus:outline-none"
                  disabled={donations.length <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <button
            type="button"
            onClick={addItem}
            className="mt-3 flex items-center text-primary-600 hover:text-primary-800 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Ajouter un article
          </button>
        </div>

        {/* Note supplémentaire */}
        <div>
          <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
            Note supplémentaire (facultatif)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="Informations complémentaires sur votre don..."
          ></textarea>
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Fermer le modal et s'assurer que le défilement est restauré
              onClose();
              document.body.style.overflow = 'auto';
            }}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Confirmer le don
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DonationModal;
