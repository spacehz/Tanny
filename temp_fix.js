// Effet pour synchroniser l'état local avec les données du serveur au démarrage de l'application
useEffect(() => {
  // Ne rien faire si les événements ne sont pas encore chargés ou si l'utilisateur n'est pas connecté
  if (!events || events.length === 0 || !user || !user._id) return;
  
  console.log("Synchronisation de l'état local avec les données du serveur...");
  
  // Au lieu de déclencher des appels API, nous allons simplement mettre à jour l'interface utilisateur
  // pour refléter l'état d'inscription actuel
  
  // Collecter les IDs des événements auxquels l'utilisateur est inscrit selon les données du serveur
  const serverRegistrations = events
    .filter(event => 
      event.extendedProps?.rawEvent?.volunteers && 
      Array.isArray(event.extendedProps.rawEvent.volunteers) && 
      event.extendedProps.rawEvent.volunteers.some(id => 
        id === user._id || 
        id?.toString() === user._id?.toString() || 
        user._id === id?.toString()
      )
    )
    .map(event => event.id);
  
  console.log("Inscriptions selon le serveur:", serverRegistrations);
  console.log("Inscriptions locales:", localUserRegistrations);
  
  // Mettre à jour l'interface utilisateur pour refléter l'état d'inscription
  setEvents(prevEvents => {
    return prevEvents.map(event => {
      // Vérifier si l'utilisateur est inscrit à cet événement selon les données du serveur
      const isInServerData = serverRegistrations.includes(event.id);
      
      // Mettre à jour l'interface utilisateur pour refléter l'état d'inscription
      return {
        ...event,
        extendedProps: {
          ...event.extendedProps,
          isUserRegistered: isInServerData
        }
      };
    });
  });
}, [events.length, user]);
