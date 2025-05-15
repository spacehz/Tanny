import React from 'react';
import Modal from './Modal';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Confirmer la suppression'}
    >
      <div className="mt-2">
        <p className="text-sm text-gray-500">
          {message || 'Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.'}
        </p>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          onClick={onClose}
        >
          Annuler
        </button>
        <button
          type="button"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          onClick={onConfirm}
        >
          Supprimer
        </button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
