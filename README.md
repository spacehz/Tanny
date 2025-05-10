# TANNY - Association de Glanage Alimentaire

Application web pour l'association de glanage alimentaire TANNY.

## Structure du projet

Le projet est organisé en deux parties principales:

- **frontend**: Application Next.js pour l'interface utilisateur
- **backend**: API REST avec Express.js et MongoDB

## Installation

### Prérequis
- Node.js (v14 ou supérieur)
- MongoDB

### Installation des dépendances

```bash
# Installation des dépendances du frontend
cd frontend
npm install

# Installation des dépendances du backend
cd ../backend
npm install
```

## Développement

```bash
# Démarrer le frontend (depuis la racine du projet)
npm run dev:frontend

# Démarrer le backend (depuis la racine du projet)
npm run dev:backend

# Démarrer les deux simultanément
npm run dev
```

## Production

```bash
# Build du frontend
npm run build:frontend

# Démarrer en production
npm run start
```

## Conventions de code

### Frontend
- Composants React: PascalCase (ex: `UserProfile.jsx`)
- Hooks: camelCase avec préfixe "use" (ex: `useAuth.js`)
- Services: camelCase (ex: `authService.js`)

### Backend
- Fichiers: camelCase (ex: `userController.js`)
- Classes: PascalCase (ex: `UserModel`)
- Variables/Fonctions: camelCase (ex: `getUserById`)
- Routes: kebab-case pour les URL (ex: `/api/user-profile`)
