import { useState } from 'react';
import { useMerchants } from '../services/swrHooks';
import api from '../services/api';
import { mutate } from 'swr';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function MerchantsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    businessName: '',
    legalRepresentative: {
      firstName: '',
      lastName: ''
    },
    email: '',
    phoneNumber: '',
    siret: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    },
    isActive: true
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Récupérer les données des commerçants avec SWR
  const { data, error, isLoading } = useMerchants(currentPage, itemsPerPage);

  // Gérer les changements de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Gestion des champs imbriqués (legalRepresentative, address)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Ouvrir le modal pour éditer un commerçant
  const handleEditClick = (merchant) => {
    setFormData({
      businessName: merchant.businessName,
      legalRepresentative: merchant.legalRepresentative || {
        firstName: '',
        lastName: ''
      },
      email: merchant.email,
      phoneNumber: merchant.phoneNumber,
      siret: merchant.siret,
      address: merchant.address || {
        street: '',
        city: '',
        postalCode: '',
        country: 'France'
      },
      isActive: merchant.isActive
    });
    setEditingId(merchant._id);
    setIsModalOpen(true);
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  // Soumettre le formulaire pour éditer
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Mettre à jour un commerçant existant
      await api.put(`/api/merchants/${editingId}`, formData);
      
      // Revalider les données
      mutate(`/api/merchants?page=${currentPage}&limit=${itemsPerPage}`);
      
      // Fermer le modal
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  // Supprimer un commerçant
  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/merchants/${id}`);
      
      // Revalider les données
      mutate(`/api/merchants?page=${currentPage}&limit=${itemsPerPage}`);
      
      // Fermer la confirmation
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Une erreur est survenue lors de la suppression.');
    }
  };

  // Gérer la pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Afficher un message de chargement
  if (isLoading) {
    return <div className="text-center py-4">Chargement des données...</div>;
  }

  // Afficher un message d'erreur
  if (error) {
    return <div className="text-center py-4 text-red-500">Erreur lors du chargement des données</div>;
  }

  // Préparer les données des commerçants
  const merchants = data || [];

  return (
    <div className="overflow-x-auto">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Liste des commerçants</h2>
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Commerce</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Représentant légal</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Email</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Téléphone</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">SIRET</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Adresse</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Statut</th>
            <th className="py-3 px-4 text-center font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {merchants.length === 0 ? (
            <tr>
              <td colSpan="8" className="py-4 text-center text-gray-500">
                Aucun commerçant trouvé.
              </td>
            </tr>
          ) : (
            merchants.map((merchant) => (
            <tr key={merchant._id} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4">{merchant.businessName}</td>
              <td className="py-3 px-4">
                {merchant.legalRepresentative ? 
                  `${merchant.legalRepresentative.firstName} ${merchant.legalRepresentative.lastName}` : 
                  '-'}
              </td>
              <td className="py-3 px-4">{merchant.email}</td>
              <td className="py-3 px-4">{merchant.phoneNumber || '-'}</td>
              <td className="py-3 px-4">{merchant.siret || '-'}</td>
              <td className="py-3 px-4">
                {merchant.address ? 
                  `${merchant.address.street || ''}, ${merchant.address.postalCode || ''} ${merchant.address.city || ''}` : 
                  '-'}
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs ${merchant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {merchant.isActive ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => handleEditClick(merchant)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    title="Modifier"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(merchant._id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                    title="Supprimer"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Confirmation de suppression */}
                {deleteConfirmId === merchant._id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                      <h3 className="text-lg font-bold mb-4">Confirmer la suppression</h3>
                      <p className="mb-6">
                        Êtes-vous sûr de vouloir supprimer le commerçant <strong>{merchant.businessName}</strong> ?
                        Cette action est irréversible.
                      </p>
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleDelete(merchant._id)}
                          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Précédent
            </button>
            
            {[...Array(data.pages).keys()].map((page) => (
              <button
                key={page + 1}
                onClick={() => handlePageChange(page + 1)}
                className={`mx-1 px-3 py-1 rounded ${
                  currentPage === page + 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === data.pages}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === data.pages
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Suivant
            </button>
          </nav>
        </div>
      )}

      {/* Modal pour éditer un commerçant */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              Modifier le commerçant
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                  Nouveau mot de passe (laisser vide pour ne pas changer)
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required={false}
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="businessName" className="block text-gray-700 font-medium mb-2">
                  Nom du commerce
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 font-medium mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">
                  Téléphone
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
