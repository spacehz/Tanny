# Intégration du Modal Dynamique pour les Collections

Ce document explique comment intégrer le composant `CollectionModal.js` dans la page `admin-collections.js` pour afficher des champs dynamiques en fonction du type d'événement sélectionné (Collecte ou Marché).

## Étapes d'intégration

1. **Importer le composant modal**

```javascript
import CollectionModal from '../components/CollectionModal';
```

2. **Remplacer le modal existant**

Recherchez le code du modal existant dans `admin-collections.js` et remplacez-le par l'appel au composant `CollectionModal` :

```javascript
{/* Modal pour ajouter/modifier un événement */}
<CollectionModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleSubmit}
  initialData={formData}
  isEditing={!!selectedEvent}
/>
```

3. **Mettre à jour la fonction handleSubmit**

Assurez-vous que la fonction `handleSubmit` gère les nouveaux champs :

```javascript
const handleSubmit = (formData) => {
  if (selectedEvent) {
    // Mise à jour d'un événement existant
    const updatedEvents = events.map(event => 
      event.id === selectedEvent.id 
        ? { ...event, ...formData, id: selectedEvent.id } 
        : event
    );
    setEvents(updatedEvents);
  } else {
    // Ajout d'un nouvel événement
    const newEvent = {
      ...formData,
      id: String(Date.now())
    };
    setEvents([...events, newEvent]);
  }
  setIsModalOpen(false);
};
```

## Structure des données

Le composant `CollectionModal` gère les champs suivants :

### Champs communs
- `title` : Titre de l'événement
- `start` : Date et heure de début
- `end` : Date et heure de fin
- `type` : Type d'événement ('collecte' ou 'marché')
- `description` : Description de l'événement
- `location` : Lieu de l'événement
- `volunteers` : Liste des bénévoles

### Champs spécifiques aux collectes
- `merchantId` : ID du commerçant sélectionné
- `expectedVolunteers` : Nombre de bénévoles attendus

### Champs spécifiques aux marchés
- `duration` : Durée du marché
- `numberOfStands` : Nombre de stands

## Fonctionnalités

- Affichage conditionnel des champs en fonction du type d'événement sélectionné
- Récupération et affichage de la liste des commerçants pour les collectes
- Validation des champs obligatoires
- Gestion des erreurs lors du chargement des données externes
