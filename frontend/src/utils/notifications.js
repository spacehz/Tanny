import toast from 'react-hot-toast';

// Fonctions utilitaires pour les toasts
export const notify = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  info: (message) => toast(message, { icon: 'ℹ️' }),
  warning: (message) => toast(message, { icon: '⚠️' }),
  loading: (message) => toast.loading(message)
};

export default notify;
