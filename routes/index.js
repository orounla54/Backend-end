const express = require('express');
const router = express.Router();

// Import des routes
const authRoutes = require('./auth');
const userRoutes = require('./users');
const messageRoutes = require('./messagesRou');
const discussionRoutes = require('./discussionsRou');
const tacheRoutes = require('./tachesRou');
const projetRoutes = require('./projetsRou');
const profilesRoutes = require('./profilesRou');
const typesTacheRoutes = require('./typesTacheRou');
const evenementRoutes = require('./evenementsRou');
const prioriteRoutes = require('./prioritesRou');
const responsableRoutes = require('./responsablesRou');
const uploadRoutes = require('./upload');
const serviceRoutes = require('./servicesRou');
const posteRoutes = require('./postesRou');
const positionRoutes = require('./positionsRou');
const typesProjetRoutes = require('./typesProjetRou');

// Vérification que tous les routers sont valides
const routes = {
    auth: authRoutes,
    users: userRoutes,
    messages: messageRoutes,
    discussions: discussionRoutes,
    taches: tacheRoutes,
    projets: projetRoutes,
    profiles: profilesRoutes,
    'types-tache': typesTacheRoutes,
    evenements: evenementRoutes,
    priorites: prioriteRoutes,
    responsables: responsableRoutes,
    upload: uploadRoutes,
    services: serviceRoutes,
    postes: posteRoutes,
    positions: positionRoutes,
    'types-projet': typesProjetRoutes
};

// Définition des routes avec vérification et logging
Object.entries(routes).forEach(([path, route]) => {
    if (!route || typeof route !== 'function' || !route.stack) {
        console.error(`Route invalide pour /${path}:`, {
            type: typeof route,
            value: route,
            stack: route?.stack
        });
        return;
    }

    console.log(`Configuration de la route /${path}:`, {
        type: typeof route,
        isRouter: 'Express Router',
        hasRoutes: route.stack.length
    });

    router.use(`/${path}`, route);
});

module.exports = router; 