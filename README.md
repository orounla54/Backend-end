# Backend E2C-TIC

Ce dossier contient le backend de l'application E2C-TIC, une plateforme de gestion de tâches et de projets.

## Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (v4.4 ou supérieur)
- npm ou yarn

## Installation

1. Cloner le repository
```bash
git clone <repository-url>
cd e2c-tic/backend
```

2. Installer les dépendances
```bash
npm install
# ou
yarn install
```

3. Configuration de l'environnement
Créez un fichier `.env` à la racine du dossier backend avec les variables suivantes :

```env
# Configuration du serveur
NODE_ENV=development
PORT=5000

# Configuration de la base de données
MONGO_URI=mongodb://localhost:27017/e2c-tic

# Configuration JWT
JWT_SECRET=votre_secret_jwt_super_securise
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Configuration de l'email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=votre_email@gmail.com
SMTP_PASSWORD=votre_mot_de_passe_application
FROM_EMAIL=noreply@e2c-tic.com
FROM_NAME=E2C-TIC
```

## Démarrage

### Mode développement
```bash
npm run dev
# ou
yarn dev
```

### Mode production
```bash
npm start
# ou
yarn start
```

## Structure du projet

```
backend/
├── src/
│   ├── config/         # Configuration de la base de données
│   ├── controllers/    # Contrôleurs de l'application
│   ├── middleware/     # Middlewares personnalisés
│   ├── models/         # Modèles Mongoose
│   ├── routes/         # Routes de l'API
│   ├── utils/          # Utilitaires
│   └── server.js       # Point d'entrée de l'application
├── .env               # Variables d'environnement
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Authentification
- POST /api/auth/register - Inscription
- POST /api/auth/login - Connexion
- GET /api/auth/me - Profil utilisateur
- POST /api/auth/reset-password - Réinitialisation du mot de passe

### Utilisateurs
- GET /api/users - Liste des utilisateurs (admin)
- GET /api/users/:id - Détails d'un utilisateur
- PUT /api/users/:id - Mise à jour d'un utilisateur
- DELETE /api/users/:id - Suppression d'un utilisateur (admin)

### Services
- GET /api/services - Liste des services
- POST /api/services - Création d'un service (admin)
- GET /api/services/:id - Détails d'un service
- PUT /api/services/:id - Mise à jour d'un service (admin)
- DELETE /api/services/:id - Suppression d'un service (admin)

### Projets
- GET /api/projets - Liste des projets
- POST /api/projets - Création d'un projet
- GET /api/projets/:id - Détails d'un projet
- PUT /api/projets/:id - Mise à jour d'un projet
- DELETE /api/projets/:id - Suppression d'un projet

### Tâches
- GET /api/taches - Liste des tâches
- POST /api/taches - Création d'une tâche
- GET /api/taches/:id - Détails d'une tâche
- PUT /api/taches/:id - Mise à jour d'une tâche
- DELETE /api/taches/:id - Suppression d'une tâche

### Événements
- GET /api/evenements - Liste des événements
- POST /api/evenements - Création d'un événement
- GET /api/evenements/:id - Détails d'un événement
- PUT /api/evenements/:id - Mise à jour d'un événement
- DELETE /api/evenements/:id - Suppression d'un événement

### Discussions
- GET /api/discussions - Liste des discussions
- POST /api/discussions - Création d'une discussion
- GET /api/discussions/:id - Détails d'une discussion
- PUT /api/discussions/:id - Mise à jour d'une discussion
- DELETE /api/discussions/:id - Suppression d'une discussion

### Statistiques
- GET /api/stats/general - Statistiques générales (admin)
- GET /api/stats/service/:id - Statistiques d'un service
- GET /api/stats/user/:id - Statistiques d'un utilisateur

## Sécurité

- Toutes les routes sont protégées par authentification JWT
- Les mots de passe sont hashés avec bcrypt
- Protection contre les attaques XSS et CSRF
- Validation des données avec express-validator
- Gestion centralisée des erreurs
- Rate limiting sur les routes d'authentification

## Tests

Pour exécuter les tests :
```bash
npm test
# ou
yarn test
```

## Déploiement

1. Configurer les variables d'environnement pour la production
2. Construire l'application :
```bash
npm run build
# ou
yarn build
```
3. Démarrer en mode production :
```bash
npm start
# ou
yarn start
```

## Support

Pour toute question ou problème, veuillez créer une issue dans le repository. 