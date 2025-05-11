import { useState, useEffect } from 'react';
import { useMerchants } from '../services/swrHooks';

export default function CollectionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isEditing 
}) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
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

          {/* Boutons */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {isEditing ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
