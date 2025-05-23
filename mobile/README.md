# TANY Mobile - Application pour les bénévoles

Cette application mobile est conçue pour les bénévoles de TANY, leur permettant de consulter les événements à venir, de s'inscrire aux collectes et de gérer leurs participations.

## Fonctionnalités

- **Authentification** : Connexion sécurisée pour les bénévoles
- **Calendrier des événements** : Visualisation des collectes et marchés à venir
- **Inscription aux événements** : Possibilité de s'inscrire ou se désinscrire des événements
- **Gestion des participations** : Suivi des affectations et de leur statut
- **Profil utilisateur** : Consultation des informations personnelles

## Configuration technique

L'application utilise le même backend que la version web, accessible via l'URL ngrok configurée :
```
https://e4ef-197-14-53-186.ngrok-free.app
```

## Installation et démarrage

1. Installer les dépendances :
```bash
npm install
# ou
yarn install
```

2. Démarrer l'application :
```bash
npm start
# ou
npx expo start
```

3. Utiliser l'application Expo Go sur votre appareil mobile pour scanner le QR code affiché dans la console.

> **Note importante**: Cette application utilise Expo SDK 50, qui est la dernière version stable.

## Résolution des problèmes courants

Si vous rencontrez des erreurs lors du démarrage de l'application, essayez les solutions suivantes :

```bash
# Nettoyer le cache
npx expo start -c

# Supprimer node_modules et réinstaller
rm -rf node_modules
npm install

# Vérifier la version d'Expo CLI
npx expo --version

# Mettre à jour Expo CLI
npm install -g expo-cli
```

## Structure du projet

- `/src/screens` : Écrans principaux de l'application
- `/src/components` : Composants réutilisables
- `/src/services` : Services pour les appels API
- `/src/context` : Contextes React, notamment pour l'authentification
- `/src/navigation` : Configuration de la navigation
- `/src/constants` : Constantes, thèmes et configurations

## Construction de l'application

Pour créer une version de production de l'application :

```bash
# Installer EAS CLI si ce n'est pas déjà fait
npm install -g eas-cli

# Se connecter à votre compte Expo
eas login

# Configurer le build
eas build:configure

# Lancer le build pour Android
eas build --platform android

# Lancer le build pour iOS
eas build --platform ios
```

## Améliorations futures

- Ajout de notifications push pour les rappels d'événements
- Intégration d'une carte pour localiser les événements
- Fonctionnalité de scan de code-barres pour les produits collectés
- Mode hors-ligne pour fonctionner sans connexion internet

## Développement

Cette application est développée avec React Native et Expo SDK 50, utilisant les bibliothèques suivantes :
- React Navigation pour la navigation
- React Native Paper pour les composants UI
- Axios pour les appels API
- React Native Calendars pour le calendrier
