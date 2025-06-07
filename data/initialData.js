const mongoose = require('mongoose');

// Types de tâches
const typeTaches = [
    { nom: 'Développement', description: 'Tâches liées au développement logiciel' },
    { nom: 'Design', description: 'Tâches liées au design et à l\'interface utilisateur' },
    { nom: 'Documentation', description: 'Tâches liées à la documentation' },
    { nom: 'Test', description: 'Tâches liées aux tests' },
    { nom: 'Réunion', description: 'Tâches liées aux réunions' },
    { nom: 'Formation', description: 'Tâches liées à la formation' },
    { nom: 'Maintenance', description: 'Tâches de maintenance' },
    { nom: 'Support', description: 'Tâches de support' }
];

// Priorités
const priorites = [
    { nom: 'Critique', niveau: 1, couleur: '#FF0000', description: 'Urgence absolue' },
    { nom: 'Haute', niveau: 2, couleur: '#FFA500', description: 'Urgence élevée' },
    { nom: 'Moyenne', niveau: 3, couleur: '#FFFF00', description: 'Urgence modérée' },
    { nom: 'Basse', niveau: 4, couleur: '#00FF00', description: 'Urgence faible' }
];

// Catégories d'événements
const categoriesEvenements = [
    {
        nom: 'Réunion',
        description: 'Réunions internes ou externes'
    },
    {
        nom: 'Formation',
        description: 'Sessions de formation et ateliers'
    },
    {
        nom: 'Séminaire',
        description: 'Séminaires et conférences'
    },
    {
        nom: 'Événement',
        description: 'Autres types d\'événements'
    }
];

// Types de projets
const typesProjets = [
    { nom: 'Développement', description: 'Projets de développement logiciel' },
    { nom: 'Infrastructure', description: 'Projets d\'infrastructure' },
    { nom: 'Consulting', description: 'Projets de consulting' },
    { nom: 'Formation', description: 'Projets de formation' },
    { nom: 'Maintenance', description: 'Projets de maintenance' }
];

// Statuts
const statuts = [
    { nom: 'Non démarré', description: 'Le projet/tâche n\'a pas encore commencé' },
    { nom: 'En cours', description: 'Le projet/tâche est en cours d\'exécution' },
    { nom: 'En pause', description: 'Le projet/tâche est temporairement suspendu' },
    { nom: 'Terminé', description: 'Le projet/tâche est terminé' },
    { nom: 'Annulé', description: 'Le projet/tâche a été annulé' }
];

// Rôles utilisateurs
const roles = [
    { nom: 'admin', description: 'Administrateur système' },
    { nom: 'responsable', description: 'Responsable de projet' },
    { nom: 'user', description: 'Utilisateur standard' }
];

// Services
const services = [
    {
        nom: 'Direction',
        description: 'Direction générale de l\'entreprise'
    },
    {
        nom: 'Ressources Humaines',
        description: 'Gestion des ressources humaines'
    },
    {
        nom: 'Informatique',
        description: 'Service informatique et systèmes d\'information'
    },
    {
        nom: 'Commercial',
        description: 'Service commercial et ventes'
    },
    {
        nom: 'Finance',
        description: 'Service financier et comptabilité'
    }
];

// Postes
const postes = [
    {
        nom: 'Directeur',
        description: 'Responsable de la direction générale'
    },
    {
        nom: 'Développeur',
        description: 'Développement des applications et systèmes'
    },
    {
        nom: 'RH',
        description: 'Gestion des ressources humaines'
    },
    {
        nom: 'Commercial',
        description: 'Gestion des ventes et relations clients'
    },
    {
        nom: 'Comptable',
        description: 'Gestion de la comptabilité et des finances'
    }
];

// Positions
const positions = [
    { nom: 'Junior', description: 'Niveau débutant' },
    { nom: 'Confirmé', description: 'Niveau intermédiaire' },
    { nom: 'Senior', description: 'Niveau avancé' },
    { nom: 'Expert', description: 'Niveau expert' }
];

module.exports = {
    typeTaches,
    priorites,
    categoriesEvenements,
    typesProjets,
    statuts,
    roles,
    services,
    postes,
    positions
}; 