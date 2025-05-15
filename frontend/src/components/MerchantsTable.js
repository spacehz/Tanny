import React, { useState, useEffect } from 'react';
import { useMerchants } from '../services/swrHooks';
import MerchantModal from './MerchantModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import Pagination from './Pagination';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { formatDate } from '../utils/dateUtils';

const MerchantsTable = ({ searchTerm, showAddModal, setShowAddModal }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  
  const { data, error, isLoading, mutate } = useMerchants(
    currentPage,
    10,
    searchTerm,
    statusFilter
  );
  
  // Reset to first page when search term or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value === 'all' ? null : value === 'active');
  };
  
  const handleEdit = (merchant) => {
    setSelectedMerchant(merchant);
    setShowEditModal(true);
  };
  
  const handleDelete = (merchant) => {
    setSelectedMerchant(merchant);
    setShowDeleteModal(true);
  };
  
  const handleModalSubmit = (updatedMerchant) => {
    mutate();
  };
  
  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/merchants/${selectedMerchant._id}`);
      toast.success('Commerçant supprimé avec succès');
      mutate();
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting merchant:', error);
      toast.error(error.response?.data?.message || 'Une erreur est survenue');
    }
  };
  
  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">Erreur lors du chargement des données</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <select
          className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={statusFilter === null ? 'all' : statusFilter ? 'active' : 'inactive'}
          onChange={handleStatusFilterChange}
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </select>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Commerçant
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adresse
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SIRET
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date d'ajout
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <svg className="animate-spin h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </td>
              </tr>
            ) : data?.merchants?.length > 0 ? (
              data.merchants.map((merchant) => (
                <tr key={merchant._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{merchant.businessName}</div>
                    <div className="text-sm text-gray-500">{merchant.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {merchant.legalRepresentative ? 
                        `${merchant.legalRepresentative.firstName} ${merchant.legalRepresentative.lastName}` : 
                        ''}
                    </div>
                    <div className="text-sm text-gray-500">{merchant.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {merchant.address ? (
                        <>
                          {merchant.address.street}<br />
                          {merchant.address.postalCode} {merchant.address.city}
                        </>
                      ) : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {merchant.siret}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      merchant.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {merchant.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(merchant.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(merchant)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(merchant)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                  Aucun commerçant trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {data && data.pages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={data.pages}
          onPageChange={handlePageChange}
        />
      )}
      
      {/* Modal for adding a new merchant */}
      <MerchantModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleModalSubmit}
      />
      
      {/* Modal for editing a merchant */}
      <MerchantModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedMerchant}
      />
      
      {/* Modal for confirming deletion */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Supprimer le commerçant"
        message={`Êtes-vous sûr de vouloir supprimer le commerçant "${selectedMerchant?.businessName}" ? Cette action est irréversible.`}
      />
    </div>
  );
};

export default MerchantsTable;
