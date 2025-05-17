import { useState, useEffect } from 'react';
import { useVolunteers } from '../services/swrHooks';
import api from '../services/api';
import { mutate } from 'swr';
import { toast } from 'react-toastify';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function VolunteersTable({ searchTerm = '' }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingId, setEditingId] = useState(null);
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  // Le filtre de statut a été supprimé car l'attribut isActive n'est plus utilisé
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    availability: 'oui',
    // Le champ volunteerHours a été supprimé car il ne doit pas être modifié manuellement
    absencePeriod: {
      startDate: null,
      endDate: null
    }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, availabilityFilter]);

  // La fonctionnalité d'ajout de bénévole a été supprimée
  // Les bénévoles doivent s'inscrire eux-mêmes

  // Récupérer les données des bénévoles avec SWR
  const { data, error, isLoading, isValidating, mutate: mutateVolunteers } = 
    useVolunteers(currentPage, itemsPerPage, searchTerm, availabilityFilter);

  // Gérer les changements de formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  // Ouvrir le modal pour éditer un bénévole
  const handleEditClick = (volunteer) => {
    setFormData({
      name: volunteer.name,
      email: volunteer.email,
      password: '',
      availability: volunteer.availability || 'oui',
      // Le champ volunteerHours a été supprimé car il ne doit pas être modifié manuellement
      absencePeriod: {
        startDate: volunteer.absencePeriod?.startDate || null,
        endDate: volunteer.absencePeriod?.endDate || null
      }
    });
    setEditingId(volunteer._id);
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
      // Mettre à jour un bénévole existant
      await api.put(`/api/users/volunteers/${editingId}`, formData);
      
      // Revalider les données
      mutate(`/api/users/volunteers?page=${currentPage}&limit=${itemsPerPage}`);
      
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
      await api.delete(`/api/users/volunteers/${id}`);
      
      // Revalider les données
      mutate(`/api/users/volunteers?page=${currentPage}&limit=${itemsPerPage}`);
      
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

  // Préparer les données des bénévoles
  const volunteers = data?.volunteers || [];

  return (
    <div className="overflow-x-auto">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Liste des bénévoles</h2>
      </div>

      <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Nom</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Email</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Disponibilité</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Période d'absence</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Heures bénévolat</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Date d'inscription</th>
            <th className="py-3 px-4 text-center font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.length === 0 ? (
            <tr>
              <td colSpan="6" className="py-4 text-center text-gray-500">
                Aucun bénévole trouvé.
              </td>
            </tr>
          ) : (
            volunteers.map((volunteer) => (
            <tr key={volunteer._id} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4">{volunteer.name}</td>
              <td className="py-3 px-4">{volunteer.email}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  volunteer.availability === 'oui' ? 'bg-green-100 text-green-800' :
                  volunteer.availability === 'non' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {volunteer.availability === 'oui' ? 'Oui' : 
                   volunteer.availability === 'non' ? 'Non' : 
                   volunteer.availability || 'Non spécifiée'}
                </span>
              </td>
              <td className="py-3 px-4">
                {volunteer.absencePeriod && volunteer.absencePeriod.startDate && volunteer.absencePeriod.endDate ? 
                  `${new Date(volunteer.absencePeriod.startDate).toLocaleDateString('fr-FR')} - ${new Date(volunteer.absencePeriod.endDate).toLocaleDateString('fr-FR')}` : 
                  'Non spécifiée'}
              </td>
              <td className="py-3 px-4">
                {volunteer.volunteerHours || 0}
              </td>
              <td className="py-3 px-4">
                {new Date(volunteer.createdAt).toLocaleDateString('fr-FR')}
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => handleEditClick(volunteer)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    title="Modifier"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(volunteer._id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
                    title="Supprimer"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Confirmation de suppression */}
                {deleteConfirmId === volunteer._id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full m-4 max-h-[90vh] flex flex-col">
                      <h3 className="text-lg font-bold p-4 border-b border-gray-200 sticky top-0 bg-white z-10">Confirmer la suppression</h3>
                      <div className="p-4 overflow-y-auto flex-grow">
                        <p>
                          Êtes-vous sûr de vouloir supprimer le bénévole <strong>{volunteer.name}</strong> ?
                          Cette action est irréversible.
                        </p>
                      </div>
                      <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 sticky bottom-0 bg-white">
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

      {/* Modal pour ajouter/éditer un bénévole */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full m-4 max-h-[90vh] flex flex-col">
            <h3 className="text-lg font-bold p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              Modifier le bénévole
            </h3>
            
            <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-grow">
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
                  <option value="oui">Oui</option>
                  <option value="non">Non</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Période d'absence
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="absencePeriodStart" className="block text-gray-600 text-sm mb-1">
                      Date de début
                    </label>
                    <input
                      type="date"
                      id="absencePeriodStart"
                      value={formData.absencePeriod.startDate ? new Date(formData.absencePeriod.startDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          absencePeriod: {
                            ...formData.absencePeriod,
                            startDate: e.target.value ? new Date(e.target.value) : null
                          }
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="absencePeriodEnd" className="block text-gray-600 text-sm mb-1">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      id="absencePeriodEnd"
                      value={formData.absencePeriod.endDate ? new Date(formData.absencePeriod.endDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          absencePeriod: {
                            ...formData.absencePeriod,
                            endDate: e.target.value ? new Date(e.target.value) : null
                          }
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Le champ "Heures bénévolat" a été supprimé car il ne doit pas être modifié manuellement.
                  Il sera incrémenté automatiquement lorsqu'un bénévole participe à un événement et que l'admin valide sa présence. */}
              
            </form>
            
            {/* Boutons d'action (sticky en bas) */}
            <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={handleCloseModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
              >
                Annuler
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
