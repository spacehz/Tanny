import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Styles par défaut pour tous les toasts
        style: {
          background: '#fff',
          color: '#333',
        },
        // Styles spécifiques pour chaque type de toast
        success: {
          duration: 3000,
          style: {
            background: '#16a34a', // primary-600 (vert)
            color: 'white',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          icon: '👍',
        },
        error: {
          duration: 4000,
          style: {
            background: '#dc2626', // red-600
            color: 'white',
            borderRadius: '0.5rem',
            padding: '0.75rem 1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          },
          icon: '❌',
        },
        loading: {
          duration: Infinity,
        },
      }}
    />
  );
};

export default ToastProvider;
