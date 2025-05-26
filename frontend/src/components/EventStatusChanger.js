import React, { useState } from 'react';
import { changeEventStatus } from '../services/eventService';
import EventStatusBadge from './EventStatusBadge';

/**
 * Composant pour changer le statut d'un événement
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.event - L'événement à modifier
 * @param {Function} props.onStatusChange - Fonction à appeler après le changement de statut
 * @param {string} props.className - Classes CSS supplémentaires
 */
const EventStatusChanger = ({ event, onStatusChange, className = '' }) => {
  const [isChanging, setIsChanging] = useState(false);
  // Par défaut, sélectionner "annule" comme option manuelle
  const [newStatus, setNewStatus] = useState('annule');
  const [reason, setReason] = useState('');
  const [error, setError] = useState(null);

  const handleStatusChange = async () => {
    if (!event || !event._id) return;
    
    // Vérifier que le statut sélectionné est un statut manuel valide
    if (newStatus !== 'annule' && newStatus !== 'termine') {
      setError('Vous ne pouvez changer le statut qu\'en "Annulé" ou "Terminé".');
      return;
    }
    
    setIsChanging(true);
    setError(null);
    
    try {
      await changeEventStatus(event._id, newStatus, reason);
      
      // Appeler la fonction de callback avec le nouveau statut
      if (onStatusChange) {
        onStatusChange(newStatus);
      }
      
      // Réinitialiser le formulaire
      setReason('');
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      setError('Une erreur est survenue lors du changement de statut.');
    } finally {
      setIsChanging(false);
    }
  };

  if (!event) return null;

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Statut de l'événement</h3>
        <EventStatusBadge status={event.status} />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
          Changer le statut
        </label>
        <select
          id="status"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          disabled={isChanging}
        >
          {/* Les statuts automatiques sont désactivés */}
          <option value="incomplet" disabled>Incomplet (automatique)</option>
          <option value="pret" disabled>Prêt (automatique)</option>
          <option value="en_cours" disabled>En cours (automatique)</option>
          {/* Seuls les statuts manuels sont sélectionnables */}
          <option value="annule">Annulé</option>
          <option value="termine">Terminé</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Les statuts "Incomplet", "Prêt" et "En cours" sont gérés automatiquement par le système.
          Vous pouvez uniquement changer manuellement le statut en "Annulé" ou "Terminé".
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reason">
          Raison du changement
        </label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          rows="3"
          placeholder="Expliquez la raison du changement de statut..."
          disabled={isChanging}
        ></textarea>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 p-3 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleStatusChange}
          disabled={isChanging || newStatus === event.status}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isChanging ? 'Changement en cours...' : 'Changer le statut'}
        </button>
      </div>
    </div>
  );
};

export default EventStatusChanger;
