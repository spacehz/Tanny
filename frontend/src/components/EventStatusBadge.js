import React from 'react';

/**
 * Composant pour afficher le statut d'un événement sous forme de badge
 * @param {Object} props - Propriétés du composant
 * @param {string} props.status - Statut de l'événement ('incomplet', 'pret', 'en_cours', 'annule', 'termine')
 * @param {boolean} props.showLabel - Afficher ou non le libellé "Statut:" avant le badge
 * @param {string} props.className - Classes CSS supplémentaires
 */
const EventStatusBadge = ({ status, showLabel = false, className = '' }) => {
  // Déterminer le style du statut
  const getStatusStyle = (status) => {
    switch(status) {
      case 'incomplet':
        return { color: '#f59e0b', bgColor: '#fef3c7' }; // Ambre
      case 'pret':
        return { color: '#10b981', bgColor: '#d1fae5' }; // Vert émeraude
      case 'en_cours':
        return { color: '#3b82f6', bgColor: '#dbeafe' }; // Bleu
      case 'annule':
        return { color: '#ef4444', bgColor: '#fee2e2' }; // Rouge
      case 'termine':
        return { color: '#6b7280', bgColor: '#f3f4f6' }; // Gris
      default:
        return { color: '#f59e0b', bgColor: '#fef3c7' }; // Ambre par défaut
    }
  };

  // Fonction pour formater le texte du statut
  const formatStatus = (status) => {
    switch(status) {
      case 'incomplet': return 'Incomplet';
      case 'pret': return 'Prêt';
      case 'en_cours': return 'En cours';
      case 'annule': return 'Annulé';
      case 'termine': return 'Terminé';
      default: return 'Incomplet';
    }
  };

  const statusStyle = getStatusStyle(status || 'incomplet');

  return (
    <div className={`flex items-center ${className}`}>
      {showLabel && (
        <span className="mr-2 text-sm text-gray-500">Statut:</span>
      )}
      <span 
        className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
        style={{ 
          backgroundColor: statusStyle.bgColor,
          color: statusStyle.color
        }}
      >
        {formatStatus(status || 'incomplet')}
      </span>
    </div>
  );
};

export default EventStatusBadge;
