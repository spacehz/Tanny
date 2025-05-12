import { useState, useEffect } from 'react';
import { useMerchants } from '../services/swrHooks';
import { createEvent, updateEvent } from '../services/eventService';

export default function CollectionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isEditing 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    type: 'collecte',
    description: '',
    location: '',
    volunteers: [],
    // Nouveaux champs pour les collectes
    merchantId: '',
    expectedVolunteers: 1,
    // Nouveaux champs pour les marchés
    duration: '',
    numberOfStands: 1
  });

  // Récupération des commerçants pour le sélecteur
  const { data: merchantsData, error: merchantsError } = useMerchants(1, 100);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        start: initialData.start || '',
        end: initialData.end || '',
        type: initialData.type || 'collecte',
        description: initialData.description || '',
        location: initialData.location || '',
        volunteers: initialData.volunteers || [],
        // Nouveaux champs pour les collectes
        merchantId: initialData.merchantId || '',
        expectedVolunteers: initialData.expectedVolunteers || 1,
        // Nouveaux champs pour les marchés
        duration: initialData.duration || '',
        numberOfStands: initialData.numberOfStands || 1
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Validation côté client pour le type collecte
    if (formData.type === 'collecte' && (!formData.merchantId || formData.merchantId.trim() === '')) {
      setError('Veuillez sélectionner un commerçant pour la collecte.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Formatage des données si nécessaire
      const eventData = {
        ...formData,
        // Conversion des champs numériques
        expectedVolunteers: parseInt(formData.expectedVolunteers, 10),
        numberOfStands: parseInt(formData.numberOfStands, 10)
      };
      
      // Si le type n'est pas collecte, supprimer merchantId
      if (eventData.type !== 'collecte') {
        delete eventData.merchantId;
      }
      
      let result;
      if (isEditing && initialData?._id) {
        // Mise à jour d'un événement existant
        result = await updateEvent(initialData._id, eventData);
      } else {
        // Création d'un nouvel événement
        result = await createEvent(eventData);
      }
      
      // Appel de la fonction onSubmit du parent avec les données retournées par l'API
      onSubmit(result.data);
      
      // Fermeture du modal
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'événement:', error);
      setError(
        error.response?.data?.message || 
        'Une erreur est survenue lors de l\'enregistrement de l\'événement. Veuillez réessayer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isEditing ? 'Modifier l\'événement' : 'Ajouter un événement'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Titre */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
              Titre
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Titre de l'événement"
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="start">
                Date de début
              </label>
              <input
                type="datetime-local"
                id="start"
                name="start"
                value={formData.start}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="end">
                Date de fin
              </label>
              <input
                type="datetime-local"
                id="end"
                name="end"
                value={formData.end}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          {/* Type d'événement */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
              Type d'événement
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="collecte">Collecte</option>
              <option value="marché">Marché</option>
            </select>
          </div>

          {/* Champs dynamiques en fonction du type */}
          {formData.type === 'collecte' ? (
            <>
              {/* Commerçant (pour Collecte) */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="merchantId">
                  Commerçant
                </label>
                <select
                  id="merchantId"
                  name="merchantId"
                  value={formData.merchantId}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Sélectionner un commerçant</option>
                  {merchantsData?.merchants?.map((merchant) => (
                    <option key={merchant._id} value={merchant._id}>
                      {merchant.businessName || merchant.name}
                    </option>
                  ))}
                </select>
                {merchantsError && (
                  <p className="text-red-500 text-xs italic">Erreur lors du chargement des commerçants</p>
                )}
              </div>

              {/* Lieu (pour Collecte) */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                  Lieu
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Lieu de la collecte"
                />
              </div>

              {/* Nombre de bénévoles attendus (pour Collecte) */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expectedVolunteers">
                  Nombre de bénévoles attendus
                </label>
                <input
                  type="number"
                  id="expectedVolunteers"
                  name="expectedVolunteers"
                  value={formData.expectedVolunteers}
                  onChange={handleChange}
                  min="1"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </>
          ) : (
            <>
              {/* Lieu (pour Marché) */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                  Lieu
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Lieu du marché"
                />
              </div>

              {/* Durée (pour Marché) */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="duration">
                  Durée
                </label>
                <input
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Ex: 3 heures"
                />
              </div>

              {/* Nombre de stands (pour Marché) */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numberOfStands">
                  Nombre de stands
                </label>
                <input
                  type="number"
                  id="numberOfStands"
                  name="numberOfStands"
                  value={formData.numberOfStands}
                  onChange={handleChange}
                  min="1"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </>
          )}

          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows="3"
              placeholder="Description de l'événement"
            ></textarea>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {/* Boutons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditing ? 'Mise à jour...' : 'Ajout...'}
                </span>
              ) : (
                isEditing ? 'Mettre à jour' : 'Ajouter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
