import toast from 'react-hot-toast';

// Fonction pour afficher un toast de succès
export const showSuccessToast = (message) => {
  toast.success(message);
};

// Fonction pour afficher un toast d'erreur
export const showErrorToast = (message) => {
  toast.error(message);
};

// Fonction pour afficher un toast de chargement
export const showLoadingToast = (message) => {
  return toast.loading(message);
};

// Fonction pour mettre à jour un toast existant
export const updateToast = (toastId, message, type) => {
  toast.dismiss(toastId);
  
  if (type === 'success') {
    toast.success(message);
  } else if (type === 'error') {
    toast.error(message);
  } else {
    toast(message);
  }
};

// Fonction pour afficher un toast personnalisé
export const showCustomToast = (message, options = {}) => {
  return toast(message, options);
};

// Fonction pour fermer tous les toasts
export const dismissAllToasts = () => {
  toast.dismiss();
};
