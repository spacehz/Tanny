import React from 'react';
import toast from 'react-hot-toast';
import { notify } from '../utils/notifications';

const ToastExample = () => {
  const showSuccessToast = () => {
    notify.success('Opération réussie !');
  };

  const showErrorToast = () => {
    notify.error('Une erreur est survenue !');
  };

  const showInfoToast = () => {
    notify.info('Information importante');
  };

  const showWarningToast = () => {
    notify.warning('Attention !');
  };

  const showLoadingToast = () => {
    const toastId = notify.loading('Chargement en cours...');
    
    // Simuler une opération asynchrone
    setTimeout(() => {
      // Fermer le toast de chargement et afficher un toast de succès
      toast.dismiss(toastId);
      notify.success('Chargement terminé !');
    }, 3000);
  };

  const showCustomToast = () => {
    toast('Message personnalisé', {
      icon: '🚀',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      <h2 className="text-xl font-bold">Exemples de Notifications</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={showSuccessToast}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Succès
        </button>
        <button
          onClick={showErrorToast}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Erreur
        </button>
        <button
          onClick={showInfoToast}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Info
        </button>
        <button
          onClick={showWarningToast}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Avertissement
        </button>
        <button
          onClick={showLoadingToast}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Chargement
        </button>
        <button
          onClick={showCustomToast}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
        >
          Personnalisé
        </button>
      </div>
    </div>
  );
};

export default ToastExample;
