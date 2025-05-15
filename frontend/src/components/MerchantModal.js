import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const MerchantModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [merchant, setMerchant] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    phoneNumber: '',
    siret: '',
    isActive: true,
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    },
    legalRepresentative: {
      firstName: '',
      lastName: ''
    }
  });
  const [errors, setErrors] = useState({});

  // If initialData is provided, use it to populate the form
  useEffect(() => {
    if (initialData) {
      setMerchant(initialData);
      setFormData({
        businessName: initialData.businessName || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        siret: initialData.siret || '',
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        address: {
          street: initialData.address?.street || '',
          city: initialData.address?.city || '',
          postalCode: initialData.address?.postalCode || '',
          country: initialData.address?.country || 'France'
        },
        legalRepresentative: {
          firstName: initialData.legalRepresentative?.firstName || '',
          lastName: initialData.legalRepresentative?.lastName || ''
        }
      });
    } else {
      // Reset form when adding a new merchant
      setMerchant(null);
      setFormData({
        businessName: '',
        email: '',
        phoneNumber: '',
        siret: '',
        isActive: true,
        address: {
          street: '',
          city: '',
          postalCode: '',
          country: 'France'
        },
        legalRepresentative: {
          firstName: '',
          lastName: ''
        }
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Handle nested fields (address.street, legalRepresentative.firstName, etc.)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: newValue,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: newValue,
      });
    }
    
    // Clear error when field is edited
    const errorKey = name.includes('.') ? name.split('.')[1] : name;
    if (errors[errorKey]) {
      setErrors({
        ...errors,
        [errorKey]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Le nom du commerce est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Le téléphone est requis';
    }
    
    if (!formData.siret.trim()) {
      newErrors.siret = 'Le numéro SIRET est requis';
    } else if (!/^[0-9]{14}$/.test(formData.siret)) {
      newErrors.siret = 'Le numéro SIRET doit contenir 14 chiffres';
    }
    
    if (!formData.address.street.trim()) {
      newErrors.street = 'L\'adresse est requise';
    }
    
    if (!formData.address.city.trim()) {
      newErrors.city = 'La ville est requise';
    }
    
    if (!formData.address.postalCode.trim()) {
      newErrors.postalCode = 'Le code postal est requis';
    }
    
    if (!formData.legalRepresentative.firstName.trim()) {
      newErrors.firstName = 'Le prénom du représentant légal est requis';
    }
    
    if (!formData.legalRepresentative.lastName.trim()) {
      newErrors.lastName = 'Le nom du représentant légal est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      let response;
      
      if (merchant?._id) {
        response = await api.put(`/api/merchants/${merchant._id}`, formData);
      } else {
        response = await api.post('/api/merchants', formData);
      }
      
      onSubmit(response.data);
      toast.success(merchant ? 'Commerçant mis à jour avec succès' : 'Commerçant ajouté avec succès');
      onClose();
    } catch (error) {
      console.error('Error saving merchant:', error);
      const errorMessage = error.response?.data?.message || 'Une erreur est survenue';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={merchant ? 'Modifier un commerçant' : 'Ajouter un commerçant'}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du commerce*
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.businessName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.businessName && (
                <p className="text-red-500 text-xs mt-1">{errors.businessName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro SIRET*
              </label>
              <input
                type="text"
                name="siret"
                value={formData.siret}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.siret ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.siret && (
                <p className="text-red-500 text-xs mt-1">{errors.siret}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email*
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone*
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse*
              </label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.street ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.street && (
                <p className="text-red-500 text-xs mt-1">{errors.street}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville*
              </label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code postal*
              </label>
              <input
                type="text"
                name="address.postalCode"
                value={formData.address.postalCode}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.postalCode ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.postalCode && (
                <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom du représentant légal*
              </label>
              <input
                type="text"
                name="legalRepresentative.firstName"
                value={formData.legalRepresentative.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du représentant légal*
              </label>
              <input
                type="text"
                name="legalRepresentative.lastName"
                value={formData.legalRepresentative.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Actif
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enregistrement...
                </span>
              ) : (
                'Enregistrer'
              )}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default MerchantModal;
