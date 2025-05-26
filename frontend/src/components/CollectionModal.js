import { useState, useEffect, useRef } from 'react';

export default function CollectionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isEditing 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  const modalRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    start: '',
    end: '',
    type: 'collecte',
    status: 'incomplet', // Statut par défaut
    description: '',
    location: '',
    volunteers: [],
    // Nouveaux champs pour les collectes et marchés
    duration: '',
    expectedVolunteers: 1,
    numberOfStands: 1,
    // Nouveaux champs pour la récurrence
    isRecurring: false,
    recurrence: {
      frequency: 'weekly',
      interval: 1,
      count: 0,
      until: '',
      byMonthDay: '',
      byMonth: ''
    }
  });

  // Fermer le modal avec la touche Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, isSubmitting]);

  // Empêcher le défilement du body quand le modal est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Initialiser les données du formulaire
  useEffect(() => {
    if (initialData) {
      // Traiter la date et l'heure de début
      let startDateTime = initialData.start || '';
      let startDate = '';
      let startTime = '';
      
      if (startDateTime && typeof startDateTime === 'string') {
        // Extraire la date et l'heure
        const dateObj = new Date(startDateTime);
        if (!isNaN(dateObj.getTime())) {
          startDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
          startTime = dateObj.toTimeString().substring(0, 5); // HH:MM
          startDateTime = startDateTime.substring(0, 16); // Format pour l'input hidden
        }
      }
      
      // Traiter la date et l'heure de fin
      let endDateTime = initialData.end || '';
      let endDate = '';
      let endTime = '';
      
      if (endDateTime && typeof endDateTime === 'string') {
        // Extraire la date et l'heure
        const dateObj = new Date(endDateTime);
        if (!isNaN(dateObj.getTime())) {
          endDate = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
          endTime = dateObj.toTimeString().substring(0, 5); // HH:MM
          endDateTime = endDateTime.substring(0, 16); // Format pour l'input hidden
        }
      }
      
      // Si pas de dates définies, initialiser avec la date du jour
      if (!startDate) {
        const today = new Date();
        startDate = today.toISOString().split('T')[0];
        startTime = '09:00'; // Heure par défaut
      }
      
      if (!endDate) {
        const today = new Date();
        endDate = today.toISOString().split('T')[0];
        endTime = '18:00'; // Heure par défaut
      }
      
      setFormData({
        title: initialData.title || '',
        start: `${startDate}T${startTime}`,
        startDate: startDate,
        startTime: startTime,
        end: `${endDate}T${endTime}`,
        endDate: endDate,
        endTime: endTime,
        type: initialData.type || 'collecte',
        description: initialData.description || '',
        location: initialData.location || '',
        volunteers: initialData.volunteers || [],
        // Nouveaux champs pour les collectes
        duration: initialData.duration || '',
        expectedVolunteers: initialData.expectedVolunteers || 1,
        // Nouveaux champs pour les marchés
        numberOfStands: initialData.numberOfStands || 1,
        // Nouveaux champs pour la récurrence
        isRecurring: initialData.isRecurring || false,
        recurrence: initialData.recurrence || {
          frequency: 'weekly',
          interval: 1,
          count: 0,
          until: '',
          byMonthDay: '',
          byMonth: ''
        }
      });
    } else {
      // Initialiser avec des valeurs par défaut si pas de données initiales
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        startDate: todayStr,
        startTime: '09:00',
        start: `${todayStr}T09:00`,
        endDate: todayStr,
        endTime: '18:00',
        end: `${todayStr}T18:00`,
        // S'assurer que les champs de récurrence sont initialisés
        isRecurring: false,
        recurrence: {
          frequency: 'weekly',
          interval: 1,
          count: 0,
          until: '',
          byMonthDay: '',
          byMonth: ''
        }
      }));
    }
  }, [initialData]);
  
  // Calculer automatiquement la durée lorsque les dates de début ou de fin changent
  useEffect(() => {
    if (formData.start && formData.end) {
      const startDate = new Date(formData.start);
      const endDate = new Date(formData.end);
      
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        // Calculer la différence en millisecondes
        const diffMs = endDate - startDate;
        
        // Convertir en heures et minutes
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        // Formater la durée
        let durationText = '';
        if (diffHours > 0) {
          durationText += `${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        }
        if (diffMinutes > 0) {
          durationText += `${durationText ? ' ' : ''}${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
        }
        
        // Si la durée est vide (cas où les dates sont identiques), afficher "0 minute"
        if (durationText === '') {
          durationText = '0 minute';
        }
        
        // Mettre à jour le champ durée
        setFormData(prev => ({
          ...prev,
          duration: durationText
        }));
      }
    }
  }, [formData.start, formData.end]);

  // Focus sur le premier champ quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const firstInput = modalRef.current.querySelector('input');
      if (firstInput) {
        setTimeout(() => {
          firstInput.focus();
        }, 100);
      }
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Vérifier que les dates et heures sont bien définies
      if (!formData.startDate || !formData.startTime) {
        throw new Error('Veuillez spécifier la date et l\'heure de début');
      }
      
      if (!formData.endDate || !formData.endTime) {
        throw new Error('Veuillez spécifier la date et l\'heure de fin');
      }
      
      // Créer des objets Date à partir des champs séparés
      const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
      const endDateTime = `${formData.endDate}T${formData.endTime}:00`;
      
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);
      
      if (isNaN(startDate.getTime())) {
        throw new Error('La date de début n\'est pas valide');
      }
      
      if (isNaN(endDate.getTime())) {
        throw new Error('La date de fin n\'est pas valide');
      }
      
      if (endDate < startDate) {
        throw new Error('La date de fin doit être postérieure à la date de début');
      }
      
      // Formatage des données si nécessaire
      const eventData = {
        ...formData,
        // Conversion des champs numériques
        expectedVolunteers: parseInt(formData.expectedVolunteers, 10),
        numberOfStands: parseInt(formData.numberOfStands, 10),
        // S'assurer que la durée est incluse
        duration: formData.duration,
        // S'assurer que les dates sont au format ISO complet
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        // Inclure les données de récurrence
        isRecurring: formData.isRecurring || false
      };
      
      // Si l'événement est récurrent, formater les données de récurrence
      if (formData.isRecurring && formData.recurrence) {
        eventData.recurrence = {
          frequency: formData.recurrence.frequency || 'weekly',
          interval: parseInt(formData.recurrence.interval) || 1,
          count: parseInt(formData.recurrence.count) || 0,
          until: formData.recurrence.until ? new Date(formData.recurrence.until + 'T23:59:59').toISOString() : null,
          byMonthDay: formData.recurrence.byMonthDay ? parseInt(formData.recurrence.byMonthDay) : null,
          byMonth: formData.recurrence.byMonth ? parseInt(formData.recurrence.byMonth) : null
        };
      }
      
      // Supprimer les champs temporaires utilisés uniquement dans le formulaire
      delete eventData.startDate;
      delete eventData.startTime;
      delete eventData.endDate;
      delete eventData.endTime;
      
      // Appel de la fonction onSubmit du parent avec les données du formulaire
      // Le parent (admin-collections.js) se chargera de l'appel API
      onSubmit(eventData);
      
      // Fermeture du modal
      onClose();
    } catch (error) {
      console.error('Erreur lors de la préparation de l\'événement:', error);
      setError(
        error.message || 'Une erreur est survenue lors de la préparation de l\'événement. Veuillez réessayer.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Empêcher la propagation des clics
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto transition-opacity animate-modalFadeIn">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl w-full max-w-lg m-4 max-h-[90vh] flex flex-col transform transition-all"
        onClick={handleModalContentClick}
      >
        {/* En-tête du modal avec onglets */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-t-xl p-4 sticky top-0 z-10">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">
              {isEditing ? 'Modifier l\'événement' : 'Ajouter un événement'}
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-white hover:text-primary-100 hover:bg-primary-800 rounded-full p-1 transition-colors focus:outline-none"
              aria-label="Fermer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Onglets */}
          <div className="flex space-x-1 border-b border-primary-500">
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === 'general' 
                  ? 'bg-white text-primary-700 font-medium' 
                  : 'text-white hover:bg-primary-500'
              }`}
            >
              Général
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === 'details' 
                  ? 'bg-white text-primary-700 font-medium' 
                  : 'text-white hover:bg-primary-500'
              }`}
            >
              Détails
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('occurrences')}
              className={`px-4 py-2 rounded-t-lg transition-colors ${
                activeTab === 'occurrences' 
                  ? 'bg-white text-primary-700 font-medium' 
                  : 'text-white hover:bg-primary-500'
              }`}
            >
              Occurrences
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-grow">
          {/* Onglet Général */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Type d'événement */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="type">
                  Type d'événement
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      formData.type === 'collecte' 
                        ? 'border-primary-500 bg-primary-50 shadow-md' 
                        : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, type: 'collecte' }))}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-4 h-4 rounded-full mr-2 ${formData.type === 'collecte' ? 'bg-primary-500' : 'bg-gray-300'}`}></div>
                      <span className={`font-medium ${formData.type === 'collecte' ? 'text-primary-700' : 'text-gray-700'}`}>Collecte</span>
                    </div>
                    <p className="text-xs text-gray-500">Événement de collecte de dons alimentaires</p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      formData.type === 'marché' 
                        ? 'border-blue-500 bg-blue-50 shadow-md' 
                        : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, type: 'marché' }))}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-4 h-4 rounded-full mr-2 ${formData.type === 'marché' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <span className={`font-medium ${formData.type === 'marché' ? 'text-blue-700' : 'text-gray-700'}`}>Marché</span>
                    </div>
                    <p className="text-xs text-gray-500">Événement de distribution aux bénéficiaires</p>
                  </div>
                </div>
                <input type="hidden" name="type" value={formData.type} />
              </div>

              {/* Titre */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="title">
                  Titre <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="pl-10 shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder={`Titre ${formData.type === 'collecte' ? 'de la collecte' : 'du marché'}`}
                    required
                  />
                </div>
              </div>

              {/* Dates et heures séparées pour une meilleure expérience utilisateur */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Date et heure de début <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Date de début */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate || ''}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        const currentTime = formData.startTime || '09:00';
                        // Combiner date et heure
                        const combinedDateTime = `${newDate}T${currentTime}`;
                        setFormData(prev => ({
                          ...prev,
                          startDate: newDate,
                          start: combinedDateTime
                        }));
                      }}
                      className="pl-10 shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      required
                    />
                  </div>
                  
                  {/* Heure de début */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="time"
                      id="startTime"
                      name="startTime"
                      value={formData.startTime || ''}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        const currentDate = formData.startDate || new Date().toISOString().split('T')[0];
                        // Combiner date et heure
                        const combinedDateTime = `${currentDate}T${newTime}`;
                        setFormData(prev => ({
                          ...prev,
                          startTime: newTime,
                          start: combinedDateTime
                        }));
                      }}
                      className="pl-10 shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Date et heure de fin <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Date de fin */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate || ''}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        const currentTime = formData.endTime || '18:00';
                        // Combiner date et heure
                        const combinedDateTime = `${newDate}T${currentTime}`;
                        setFormData(prev => ({
                          ...prev,
                          endDate: newDate,
                          end: combinedDateTime
                        }));
                      }}
                      className="pl-10 shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      required
                    />
                  </div>
                  
                  {/* Heure de fin */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="time"
                      id="endTime"
                      name="endTime"
                      value={formData.endTime || ''}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        const currentDate = formData.endDate || new Date().toISOString().split('T')[0];
                        // Combiner date et heure
                        const combinedDateTime = `${currentDate}T${newTime}`;
                        setFormData(prev => ({
                          ...prev,
                          endTime: newTime,
                          end: combinedDateTime
                        }));
                      }}
                      className="pl-10 shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Durée (déplacée sous Date et heure de fin) */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="duration">
                  Durée
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="pl-10 shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-gray-50"
                    placeholder="Durée calculée automatiquement"
                    readOnly
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">La durée est calculée automatiquement à partir des dates de début et de fin.</p>
              </div>
            </div>
          )}

          {/* Onglet Détails */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Statut de l'événement */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="status">
                  Statut
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <select
                    id="status"
                    name="status"
                    value={formData.status || 'incomplet'}
                    onChange={handleChange}
                    className="pl-10 shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  >
                    <option value="incomplet">Incomplet</option>
                    <option value="pret">Prêt</option>
                    <option value="en_cours">En cours</option>
                    <option value="annule">Annulé</option>
                    <option value="termine">Terminé</option>
                  </select>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Le statut sera automatiquement mis à jour en fonction des inscriptions et des dates.
                </p>
              </div>
              
              {/* Lieu (déplacé dans la section détails) */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="location">
                  Lieu
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="pl-10 shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder={`Lieu ${formData.type === 'collecte' ? 'de la collecte' : 'du marché'}`}
                  />
                </div>
              </div>

              {formData.type === 'collecte' ? (
                <>
                  {/* Nombre de bénévoles attendus (pour Collecte) */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="expectedVolunteers">
                      Nombre de bénévoles attendus
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        id="expectedVolunteers"
                        name="expectedVolunteers"
                        value={formData.expectedVolunteers}
                        onChange={handleChange}
                        min="1"
                        className="pl-10 shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Nombre de stands (pour Marché) */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="numberOfStands">
                      Nombre de stands
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                          <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        id="numberOfStands"
                        name="numberOfStands"
                        value={formData.numberOfStands}
                        onChange={handleChange}
                        min="1"
                        className="pl-10 shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  {/* Nombre de bénévoles attendus (pour Marché) */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="expectedVolunteers">
                      Nombre de bénévoles attendus
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        id="expectedVolunteers"
                        name="expectedVolunteers"
                        value={formData.expectedVolunteers}
                        onChange={handleChange}
                        min="1"
                        className="pl-10 shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Description */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">
                  Description
                </label>
                <div className="relative">
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    rows="4"
                    placeholder={`Description détaillée ${formData.type === 'collecte' ? 'de la collecte' : 'du marché'}`}
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Occurrences */}
          {activeTab === 'occurrences' && (
            <div className="space-y-4">
              {/* Option pour activer/désactiver la récurrence */}
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        isRecurring: e.target.checked,
                        // S'assurer que l'objet recurrence est initialisé correctement
                        recurrence: prev.recurrence || {
                          frequency: 'weekly',
                          interval: 1,
                          count: 0,
                          until: '',
                          byMonthDay: '',
                          byMonth: ''
                        }
                      }));
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isRecurring" className="ml-2 block text-gray-700 text-sm font-medium">
                    Événement récurrent
                  </label>
                </div>
              </div>

              {formData.isRecurring && (
                <>
                  {/* Fréquence */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="frequency">
                      Fréquence
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <select
                        id="frequency"
                        name="frequency"
                        value={formData.recurrence?.frequency || 'weekly'}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            recurrence: {
                              ...(prev.recurrence || {
                                interval: 1,
                                count: 0,
                                until: '',
                                byMonthDay: '',
                                byMonth: ''
                              }),
                              frequency: e.target.value
                            }
                          }));
                        }}
                        className="pl-10 shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      >
                        <option value="daily">Chaque jour</option>
                        <option value="weekly">Chaque semaine</option>
                        <option value="monthly">Chaque mois</option>
                      </select>
                    </div>
                  </div>

                  {/* Intervalle */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="interval">
                      Intervalle
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        id="interval"
                        name="interval"
                        value={formData.recurrence?.interval || 1}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            recurrence: {
                              ...(prev.recurrence || {
                                frequency: 'weekly',
                                count: 0,
                                until: '',
                                byMonthDay: '',
                                byMonth: ''
                              }),
                              interval: parseInt(e.target.value) || 1
                            }
                          }));
                        }}
                        min="1"
                        className="pl-10 shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {(formData.recurrence?.frequency === 'daily' || (!formData.recurrence?.frequency && 'daily' === 'weekly')) && `Tous les ${formData.recurrence?.interval || 1} jour(s)`}
                      {(formData.recurrence?.frequency === 'weekly' || (!formData.recurrence?.frequency && 'weekly' === 'weekly')) && `Toutes les ${formData.recurrence?.interval || 1} semaine(s)`}
                      {(formData.recurrence?.frequency === 'monthly' || (!formData.recurrence?.frequency && 'monthly' === 'weekly')) && `Tous les ${formData.recurrence?.interval || 1} mois`}
                    </p>
                  </div>

                  {/* Options de fin de récurrence */}
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Fin de récurrence
                    </label>
                    <div className="space-y-3">
                      {/* Option 1: Nombre d'occurrences */}
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="endByCount"
                          name="endType"
                          checked={!formData.recurrence?.until}
                          onChange={() => {
                            setFormData(prev => ({
                              ...prev,
                              recurrence: {
                                ...(prev.recurrence || {
                                  frequency: 'weekly',
                                  interval: 1,
                                  count: 0,
                                  byMonthDay: '',
                                  byMonth: ''
                                }),
                                until: ''
                              }
                            }));
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <label htmlFor="endByCount" className="ml-2 block text-gray-700 text-sm">
                          Après
                          <input
                            type="number"
                            value={formData.recurrence?.count || 0}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                recurrence: {
                                  ...(prev.recurrence || {
                                    frequency: 'weekly',
                                    interval: 1,
                                    until: '',
                                    byMonthDay: '',
                                    byMonth: ''
                                  }),
                                  count: parseInt(e.target.value) || 0
                                }
                              }));
                            }}
                            min="1"
                            className="mx-2 w-16 border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          occurrence(s)
                        </label>
                      </div>

                      {/* Option 2: Date limite */}
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="endByDate"
                          name="endType"
                          checked={!!formData.recurrence?.until}
                          onChange={() => {
                            // Si pas de date définie, initialiser avec la date du jour + 1 mois
                            if (!formData.recurrence?.until) {
                              const date = new Date();
                              date.setMonth(date.getMonth() + 1);
                              setFormData(prev => ({
                                ...prev,
                                recurrence: {
                                  ...(prev.recurrence || {
                                    frequency: 'weekly',
                                    interval: 1,
                                    count: 0,
                                    byMonthDay: '',
                                    byMonth: ''
                                  }),
                                  until: date.toISOString().split('T')[0]
                                }
                              }));
                            }
                          }}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <label htmlFor="endByDate" className="ml-2 block text-gray-700 text-sm">
                          Le
                          <input
                            type="date"
                            value={formData.recurrence?.until || ''}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                recurrence: {
                                  ...(prev.recurrence || {
                                    frequency: 'weekly',
                                    interval: 1,
                                    count: 0,
                                    byMonthDay: '',
                                    byMonth: ''
                                  }),
                                  until: e.target.value
                                }
                              }));
                            }}
                            className="ml-2 border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            disabled={!formData.recurrence.until}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Options spécifiques pour la récurrence mensuelle */}
                  {(formData.recurrence?.frequency === 'monthly') && (
                    <>
                      {/* Jour du mois */}
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="byMonthDay">
                          Jour du mois
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="number"
                            id="byMonthDay"
                            name="byMonthDay"
                            value={formData.recurrence?.byMonthDay || ''}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                recurrence: {
                                  ...(prev.recurrence || {
                                    frequency: 'weekly',
                                    interval: 1,
                                    count: 0,
                                    until: '',
                                    byMonth: ''
                                  }),
                                  byMonthDay: e.target.value ? parseInt(e.target.value) : ''
                                }
                              }));
                            }}
                            min="1"
                            max="31"
                            className="pl-10 shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                            placeholder="Jour du mois (1-31)"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Laissez vide pour utiliser le même jour que la date de début
                        </p>
                      </div>

                      {/* Mois spécifique */}
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="byMonth">
                          Mois spécifique (optionnel)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <select
                            id="byMonth"
                            name="byMonth"
                            value={formData.recurrence?.byMonth || ''}
                            onChange={(e) => {
                              setFormData(prev => ({
                                ...prev,
                                recurrence: {
                                  ...(prev.recurrence || {
                                    frequency: 'weekly',
                                    interval: 1,
                                    count: 0,
                                    until: '',
                                    byMonthDay: ''
                                  }),
                                  byMonth: e.target.value ? parseInt(e.target.value) : ''
                                }
                              }));
                            }}
                            className="pl-10 shadow-sm border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                          >
                            <option value="">Tous les mois</option>
                            <option value="1">Janvier</option>
                            <option value="2">Février</option>
                            <option value="3">Mars</option>
                            <option value="4">Avril</option>
                            <option value="5">Mai</option>
                            <option value="6">Juin</option>
                            <option value="7">Juillet</option>
                            <option value="8">Août</option>
                            <option value="9">Septembre</option>
                            <option value="10">Octobre</option>
                            <option value="11">Novembre</option>
                            <option value="12">Décembre</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded animate-fadeIn">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
        </form>
        
        {/* Boutons avec indicateur d'onglets */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-xl">
          <div className="flex items-center">
            <div className="text-xs text-gray-500 mr-4">
              <span className="text-red-500">*</span> Champs obligatoires
            </div>
            
            {/* Indicateur d'onglets */}
            <div className="flex items-center space-x-1">
              <button 
                type="button"
                onClick={() => setActiveTab('general')}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  activeTab === 'general' 
                    ? formData.type === 'collecte' ? 'bg-primary-600' : 'bg-blue-600' 
                    : 'bg-gray-300'
                }`}
                aria-label="Onglet Général"
              />
              <button 
                type="button"
                onClick={() => setActiveTab('details')}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  activeTab === 'details' 
                    ? formData.type === 'collecte' ? 'bg-primary-600' : 'bg-blue-600' 
                    : 'bg-gray-300'
                }`}
                aria-label="Onglet Détails"
              />
              <button 
                type="button"
                onClick={() => setActiveTab('occurrences')}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  activeTab === 'occurrences' 
                    ? formData.type === 'collecte' ? 'bg-primary-600' : 'bg-blue-600' 
                    : 'bg-gray-300'
                }`}
                aria-label="Onglet Occurrences"
              />
              
              {activeTab === 'general' && (
                <span className="text-xs text-gray-500 ml-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  N'oubliez pas de vérifier les détails
                </span>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 font-medium"
            >
              Annuler
            </button>
            
            {activeTab === 'general' ? (
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  formData.type === 'collecte'
                    ? 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                Continuer
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-70 ${
                  formData.type === 'collecte'
                    ? 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? 'Mise à jour...' : 'Ajout...'}
                  </span>
                ) : (
                  isEditing ? 'Mettre à jour' : 'Ajouter'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
