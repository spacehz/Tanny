# Corrections de bugs dans l'application mobile TANY

Ce document décrit les corrections de bugs apportées à l'application mobile TANY.

## 1. Correction du calcul du nombre de places disponibles pour un événement

### 1.1 Correction de l'incohérence des propriétés

### Problème identifié
Le nombre de places disponibles pour un événement n'était pas correctement calculé en raison d'une incohérence dans la propriété utilisée. Le backend utilise `expectedVolunteers` (avec un e minuscule) dans le modèle d'événement, mais le frontend mobile utilisait `ExpectedVolunteers` (avec un E majuscule).

### Solution mise en œuvre
1. **Mise à jour des interfaces** : Les interfaces `Event` dans les composants et écrans ont été mises à jour pour prendre en compte les deux propriétés (`expectedVolunteers` et `ExpectedVolunteers`) pour assurer la rétrocompatibilité.

2. **Normalisation des données** : Des fonctions de normalisation ont été ajoutées dans le service d'événements et le hook `useEvents` pour garantir que les données sont cohérentes partout dans l'application.

3. **Amélioration du calcul** : Le calcul du nombre de places disponibles a été amélioré pour utiliser en priorité `expectedVolunteers`, puis `ExpectedVolunteers` si la première propriété n'existe pas, et enfin une valeur par défaut de 5 si aucune des deux propriétés n'existe.

4. **Vérification des tableaux** : Une vérification a été ajoutée pour s'assurer que la propriété `volunteers` est toujours un tableau, évitant ainsi les erreurs lors du calcul du nombre de bénévoles inscrits.

### Fichiers modifiés
- `/src/components/EventCard.tsx`
- `/src/screens/EventsScreen.tsx`
- `/src/screens/EventDetailsScreen.tsx`
- `/src/services/eventService.ts`
- `/src/hooks/useEvents.ts`

### Exemple de code corrigé
```typescript
// Calculer le nombre de places disponibles
const totalVolunteersNeeded = event.expectedVolunteers || event.ExpectedVolunteers || 5;
const registeredVolunteers = Array.isArray(event.volunteers) ? event.volunteers.length : 0;
const availableSpots = Math.max(0, totalVolunteersNeeded - registeredVolunteers);
const isFullyBooked = availableSpots <= 0;
```

## Comment tester la correction
1. Ouvrir l'application mobile
2. Naviguer vers l'écran des événements
3. Vérifier que le nombre de places disponibles est correctement affiché pour chaque événement
4. Ouvrir les détails d'un événement et vérifier que le nombre de places disponibles est cohérent avec la liste des événements

## 2. Correction du problème spécifique à l'événement "Collecte pain"

### Problème identifié
L'événement "Collecte pain" a `expectedVolunteers: 6` dans la base de données, mais l'application mobile n'affichait que 5 places disponibles. Ce problème était dû à une conversion incorrecte des types de données et à une normalisation incomplète.

### Solution mise en œuvre
1. **Amélioration de la normalisation des données** : Les fonctions de normalisation ont été améliorées pour s'assurer que les propriétés `expectedVolunteers` et `ExpectedVolunteers` sont correctement converties en nombres.

2. **Copie bidirectionnelle des propriétés** : Pour garantir la cohérence, la valeur de `expectedVolunteers` est copiée dans `ExpectedVolunteers` et vice versa, selon celle qui est définie.

3. **Conversion explicite en nombre** : Les valeurs sont explicitement converties en nombres avec `Number()` pour éviter les problèmes de type.

4. **Ajout de logs de débogage** : Des logs ont été ajoutés pour faciliter le débogage des problèmes similaires à l'avenir.

### Fichiers modifiés
- `/src/services/eventService.ts`
- `/src/hooks/useEvents.ts`
- `/src/components/EventCard.tsx`
- `/src/screens/EventDetailsScreen.tsx`

### Exemple de code corrigé
```typescript
// Calculer le nombre de places disponibles
const totalVolunteersNeeded = Number(event.expectedVolunteers) || Number(event.ExpectedVolunteers) || 5;
const registeredVolunteers = Array.isArray(event.volunteers) ? event.volunteers.length : 0;
const availableSpots = Math.max(0, totalVolunteersNeeded - registeredVolunteers);
```
