# WorkNest Backend

API RESTful et serveur WebSocket pour WorkNest, une plateforme complète de gestion de projets et de collaboration en entreprise. Construit avec Node.js, Express et MongoDB.

## Technologies utilisées

- Node.js
- Express.js
- MongoDB avec Mongoose
- Socket.IO pour la communication en temps réel
- JWT pour l'authentification
- Bcrypt pour le hachage des mots de passe
- Winston pour la gestion des logs
- Multer pour la gestion des fichiers
- Cors pour la gestion des CORS
- Dotenv pour les variables d'environnement

## Prérequis

- Node.js (v16 ou supérieur)
- MongoDB (v4.4 ou supérieur)
- npm ou yarn

## Configuration

1. Clonez le repository
2. Installez les dépendances :
```bash
npm install
```

3. Créez un fichier `.env` à la racine du projet avec les variables suivantes :
```env
# Configuration du serveur
PORT=5000
NODE_ENV=development

# Base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/worknest

# JWT
JWT_SECRET=votre_secret_jwt_super_securise
JWT_EXPIRES_IN=24h

# URLs Frontend
VITE_BASE_URL_FRONTEND=http://localhost:5173

# Configuration CORS
CORS_ORIGIN=http://localhost:5173

# Configuration Socket.IO
SOCKET_PATH=/socket.io/
SOCKET_PING_TIMEOUT=60000
SOCKET_PING_INTERVAL=25000
SOCKET_CONNECT_TIMEOUT=45000
```

## Scripts disponibles

### Développement
```bash
npm run dev
```
Lance le serveur en mode développement avec nodemon

### Production
```bash
npm start
```
Lance le serveur en mode production

### Build
```bash
npm run build
```
Compile le code TypeScript (si utilisé)

## Structure du projet

```
backend/
├── config/           # Configuration de l'application
├── controllers/      # Contrôleurs de l'API
├── middlewares/      # Middlewares Express
├── models/          # Modèles Mongoose
├── routes/          # Routes de l'API
├── services/        # Services métier
├── utils/           # Utilitaires
├── types/           # Types TypeScript (si utilisé)
├── logs/            # Fichiers de logs
├── public/          # Fichiers statiques
├── scripts/         # Scripts utilitaires
├── app.js           # Configuration Express
├── server.js        # Point d'entrée du serveur
└── index.js         # Initialisation de l'application
```

## Modules principaux

### Gestion des Projets
- `GET /api/projets` - Liste des projets
- `POST /api/projets` - Créer un projet
- `GET /api/projets/:id` - Détails d'un projet
- `PUT /api/projets/:id` - Mettre à jour un projet
- `DELETE /api/projets/:id` - Supprimer un projet
- `GET /api/projets/filter` - Filtrer les projets
- `GET /api/projets/mes-projets` - Projets de l'utilisateur
- `GET /api/projets/liste-projets` - Liste complète des projets

### Gestion des Tâches
- `GET /api/taches` - Liste des tâches
- `POST /api/taches` - Créer une tâche
- `GET /api/taches/:id` - Détails d'une tâche
- `PUT /api/taches/:id` - Mettre à jour une tâche
- `DELETE /api/taches/:id` - Supprimer une tâche
- `GET /api/taches/mes-taches` - Tâches de l'utilisateur
- `GET /api/taches/responsables` - Tâches par responsable
- `GET /api/taches/types` - Types de tâches
- `GET /api/taches/roles` - Rôles des tâches

### Sollicitations
- `GET /api/sollicitations` - Liste des sollicitations
- `POST /api/sollicitations` - Créer une sollicitation
- `GET /api/sollicitations/mes-sollicitations` - Sollicitations de l'utilisateur
- `GET /api/sollicitations/service` - Sollicitations par service
- `PUT /api/sollicitations/:id/status` - Mettre à jour le statut

### Discussions et Messages
- `GET /api/messages` - Liste des messages
- `POST /api/messages` - Envoyer un message
- `GET /api/messages/:id` - Détails d'un message
- `DELETE /api/messages/:id` - Supprimer un message
- `GET /api/discussions` - Liste des discussions
- `POST /api/discussions` - Créer une discussion

### Événements et Calendrier
- `GET /api/evenements` - Liste des événements
- `POST /api/evenements` - Créer un événement
- `GET /api/evenements/calendrier` - Événements du calendrier
- `GET /api/evenements/service` - Événements par service
- `GET /api/evenements/societe` - Événements de la société
- `GET /api/evenements/categories` - Catégories d'événements

### Plans Stratégiques
- `GET /api/plans` - Liste des plans
- `POST /api/plans` - Créer un plan
- `GET /api/plans/:id` - Détails d'un plan
- `PUT /api/plans/:id` - Mettre à jour un plan
- `DELETE /api/plans/:id` - Supprimer un plan
- `GET /api/plans/roles` - Rôles des plans

### Priorités
- `GET /api/priorites` - Liste des priorités
- `POST /api/priorites` - Créer une priorité
- `GET /api/priorites/mes-priorites` - Priorités de l'utilisateur
- `GET /api/priorites/service` - Priorités par service
- `GET /api/priorites/types` - Types de priorités

### Administration
- `GET /api/services` - Gestion des services
- `GET /api/postes` - Gestion des postes
- `GET /api/positions` - Gestion des positions
- `GET /api/responsables` - Gestion des responsables
- `GET /api/profiles` - Gestion des profils
- `GET /api/roles` - Gestion des rôles

## WebSocket Events

### Connexion
- `connection` - Nouvelle connexion client
- `disconnect` - Déconnexion client

### Messages et Discussions
- `join_discussion` - Rejoindre une discussion
- `leave_discussion` - Quitter une discussion
- `new_message` - Nouveau message
- `typing` - Notification de frappe
- `stop_typing` - Fin de frappe

### Notifications
- `new_notification` - Nouvelle notification
- `task_update` - Mise à jour de tâche
- `event_reminder` - Rappel d'événement
- `priority_change` - Changement de priorité

## Sécurité

- Authentification JWT
- Hachage des mots de passe avec bcrypt
- Protection CORS
- Validation des entrées
- Rate limiting
- Gestion sécurisée des fichiers
- Logs de sécurité
- Gestion des rôles et permissions

## Gestion des erreurs

- Middleware de gestion des erreurs centralisé
- Logs détaillés avec Winston
- Réponses d'erreur standardisées
- Validation des données avec Joi

## Déploiement

1. Configurez les variables d'environnement pour la production
2. Assurez-vous que MongoDB est accessible
3. Build et démarrage :
```bash
npm run build
npm start
```

## Monitoring

- Logs d'application dans `logs/`
- Métriques de performance
- Surveillance des erreurs
- Monitoring de la base de données
- Suivi des utilisateurs actifs
- Métriques de collaboration

## Support

Pour toute question ou problème, veuillez créer une issue sur le repository GitHub.

## Licence

Ce projet est propriétaire et confidentiel. Tous droits réservés. 