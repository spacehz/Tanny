import React, { useEffect, useCallback } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Fonction sécurisée pour fermer le modal
  const handleClose = useCallback(() => {
    if (typeof onClose === 'function') {
      // Restaurer le style d'overflow avant de fermer
      document.body.style.overflow = 'auto';
      onClose();
    }
  }, [onClose]);

  // Empêcher le défilement du body quand le modal est ouvert
  useEffect(() => {
    // Sauvegarder le style d'overflow original
    const originalOverflow = document.body.style.overflow;
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    // Fonction de nettoyage qui sera appelée lors du démontage ou lorsque isOpen change
    return () => {
      // Restaurer le style d'overflow original
      document.body.style.overflow = originalOverflow || 'auto';
    };
  }, [isOpen]);

  // Fermer le modal avec la touche Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    // Fonction de nettoyage
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleClose]);

  // Déterminer la largeur du modal en fonction de la taille
  const getModalWidth = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-4xl';
      case 'xl':
        return 'max-w-6xl';
      case 'full':
        return 'max-w-full mx-4';
      default:
        return 'max-w-2xl'; // md (default)
    }
  };

  // Empêcher la propagation des clics
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  // Si le modal n'est pas ouvert, ne pas le rendre du tout
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity z-[101]" 
        onClick={handleClose}
      ></div>
      
      {/* Contenu du modal */}
      <div 
        className={`bg-white rounded-xl shadow-xl z-[102] ${getModalWidth()} w-full max-h-[90vh] m-4 transition-all transform animate-modalFadeIn relative flex flex-col`}
        onClick={handleModalContentClick}
      >

        {/* En-tête du modal (fixe) */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          {title && <h2 className="text-xl font-bold text-gray-800">{title}</h2>}
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Corps du modal (scrollable) */}
        <div className="p-4 overflow-y-auto flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
