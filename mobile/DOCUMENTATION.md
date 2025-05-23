# Documentation de l'application TANY Mobile

## Introduction

TANY Mobile est une application conçue pour les bénévoles de l'association TANY, leur permettant de gérer facilement leur participation aux événements de collecte et de marché. Cette application est la version mobile de la plateforme web existante, utilisant le même backend et les mêmes API.

## Fonctionnalités principales

### 1. Authentification

L'application permet aux bénévoles de se connecter avec leurs identifiants existants. Le système d'authentification utilise des tokens JWT stockés dans des cookies HTTP-only pour une sécurité optimale.

### 2. Calendrier des événements

Le calendrier affiche tous les événements à venir (collectes et marchés) avec un code couleur pour les différencier :
- Vert : Collectes
- Bleu : Marchés

Les événements auxquels le bénévole est inscrit sont marqués d'un indicateur spécial.

### 3. Inscription aux événements

Les bénévoles peuvent s'inscrire ou se désinscrire des événements directement depuis l'application. Le système vérifie automatiquement la disponibilité des places.

### 4. Gestion des participations

Cette section permet aux bénévoles de :
- Voir toutes leurs affectations
- Démarrer une collecte lorsqu'ils arrivent sur place
- Terminer une collecte et enregistrer les produits collectés
- Consulter l'historique de leurs participations

### 5. Profil utilisateur

Les bénévoles peuvent consulter leurs informations personnelles et se déconnecter de l'application.

## Guide d'utilisation

### Connexion

1. Ouvrez l'application
2. Entrez votre email et mot de passe
3. Appuyez sur "Se connecter"

### Navigation dans le calendrier

1. Accédez à l'onglet "Événements"
2. Parcourez le calendrier pour voir les événements
3. Appuyez sur une date pour voir les événements de ce jour
4. Consultez la liste des événements à venir en bas de l'écran

### Inscription à un événement

1. Depuis le calendrier, appuyez sur un événement
2. Consultez les détails de l'événement
3. Appuyez sur "S'inscrire" si des places sont disponibles
4. Une confirmation s'affichera en cas de succès

### Gestion des participations

1. Accédez à l'onglet "Participations"
2. Consultez la liste de vos affectations
3. Pour une affectation en attente, appuyez sur "Débuter" lorsque vous commencez la collecte
4. Pour une affectation en cours, appuyez sur "Terminer" lorsque vous avez fini

### Profil et déconnexion

1. Accédez à l'onglet "Profil"
2. Consultez vos informations personnelles
3. Appuyez sur "Se déconnecter" pour quitter l'application

## Architecture technique

L'application est développée avec React Native et utilise les technologies suivantes :

- **React Navigation** : Pour la navigation entre les écrans
- **React Native Paper** : Pour les composants d'interface utilisateur
- **Axios** : Pour les appels API
- **React Native Calendars** : Pour l'affichage du calendrier
- **AsyncStorage** : Pour le stockage local des données

L'application communique avec le même backend que la version web, accessible via l'URL ngrok configurée.

## Améliorations futures

- Ajout de notifications push pour les rappels d'événements
- Intégration d'une carte pour localiser les événements
- Fonctionnalité de scan de code-barres pour les produits collectés
- Mode hors-ligne pour fonctionner sans connexion internet
- Ajout de photos pour les produits collectés
- Statistiques personnelles plus détaillées
