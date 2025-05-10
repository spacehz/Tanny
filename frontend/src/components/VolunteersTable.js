import { useState } from 'react';
import { useVolunteers } from '../services/swrHooks';
import api from '../services/api';
import { mutate } from 'swr';

export default function VolunteersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    availability: 'Flexible',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('edit'); // 'edit' ou 'add'
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Récupérer les données des bénévoles avec SWR
  const { data, error, isLoading } = useVolunteers(currentPage, itemsPerPage);

  // Gérer les changements de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Ouvrir le modal pour ajouter un bénévole
  const handleAddClick = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      availability: 'Flexible',
    });
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Ouvrir le modal pour éditer un bénévole
  const handleEditClick = (volunteer) => {
    setFormData({
      name: volunteer.name,
      email: volunteer.email,
      password: '',
      availability: volunteer.availability || 'Flexible',
    });
    setEditingId(volunteer._id);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Fermer le modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  // Soumettre le formulaire (ajouter ou éditer)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'add') {
        // Ajouter un nouveau bénévole
        await api.post('/users/volunteers', formData);
      } else {
        // Mettre à jour un bénévole existant
        await api.put(`/users/volunteers/${editingId}`, formData);
      }
      
      // Revalider les données
      mutate(`/users/volunteers?page=${currentPage}&limit=${itemsPerPage}`);
      
      // Fermer le modal
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  // Supprimer un bénévole
  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/volunteers/${id}`);
      
      // Revalider les données
      mutate(`/users/volunteers?page=${currentPage}&limit=${itemsPerPage}`);
      
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

  // Si aucune donnée n'est disponible
  if (!data || !data.volunteers || data.volunteers.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="mb-4">Aucun bénévole trouvé.</p>
        <button
          onClick={handleAddClick}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded"
        >
          Ajouter un bénévole
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Liste des bénévoles</h2>
        <button
          onClick={handleAddClick}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Ajouter un bénévole
        </button>
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Nom</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Email</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Disponibilité</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Statut</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Date d'inscription</th>
            <th className="py-3 px-4 text-center font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.volunteers.map((volunteer) => (
            <tr key={volunteer._id} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4">{volunteer.name}</td>
              <td className="py-3 px-4">{volunteer.email}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  volunteer.availability === 'Flexible' ? 'bg-blue-100 text-blue-800' :
                  volunteer.availability === 'Matin' ? 'bg-yellow-100 text-yellow-800' :
                  volunteer.availability === 'Après-midi' ? 'bg-purple-100 text-purple-800' :
                  volunteer.availability === 'Soir' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {volunteer.availability || 'Non spécifiée'}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs ${volunteer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {volunteer.isActive ? 'Actif' : 'Inactif'}
                </span>
              </td>
              <td className="py-3 px-4">
                {new Date(volunteer.createdAt).toLocaleDateString('fr-FR')}
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handleEditClick(volunteer)}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(volunteer._id)}
                    className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                  >
                    Supprimer
                  </button>
                </div>
                
                {/* Confirmation de suppression */}
                {deleteConfirmId === volunteer._id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                      <h3 className="text-lg font-bold mb-4">Confirmer la suppression</h3>
                      <p className="mb-6">
                        Êtes-vous sûr de vouloir supprimer le bénévole <strong>{volunteer.name}</strong> ?
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
                          onClick={() => handleDelete(volunteer._id)}
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
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {data.pages > 1 && (
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

      {/* Modal pour ajouter/éditer un bénévole */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">
              {modalMode === 'add' ? 'Ajouter un bénévole' : 'Modifier le bénévole'}
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
                  {modalMode === 'add' ? 'Mot de passe' : 'Nouveau mot de passe (laisser vide pour ne pas changer)'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required={modalMode === 'add'}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="availability" className="block text-gray-700 font-medium mb-2">
                  Disponibilité
                </label>
                <select
                  id="availability"
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="Flexible">Flexible</option>
                  <option value="Matin">Matin</option>
                  <option value="Après-midi">Après-midi</option>
                  <option value="Soir">Soir</option>
                  <option value="Week-end">Week-end</option>
                </select>
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
                  {modalMode === 'add' ? 'Ajouter' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
