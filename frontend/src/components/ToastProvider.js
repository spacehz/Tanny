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
            background: 'green',
            color: 'white',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: 'red',
            color: 'white',
          },
        },
        loading: {
          duration: Infinity,
        },
      }}
    />
  );
};

export default ToastProvider;
