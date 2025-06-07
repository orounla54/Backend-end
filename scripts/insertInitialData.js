require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../utils/db');
const {
    typeTaches,
    priorites,
    categoriesEvenements,
    typesProjets,
    statuts,
    roles,
    services,
    postes,
    positions
} = require('../data/initialData');

// Import des modèles
const TypeTache = require('../models/TypeTache');
const TypePriorite = require('../models/TypePriorite');
const CategorieEvenement = require('../models/CategorieEvenement');
const Service = require('../models/Service');
const Poste = require('../models/Poste');
const Position = require('../models/Position');

// Fonction pour insérer les données
const insertData = async () => {
    try {
        // Connexion à la base de données
        await connectDB();
        console.log('Connecté à la base de données');

        // Suppression des données existantes
        await Promise.all([
            TypeTache.deleteMany({}),
            TypePriorite.deleteMany({}),
            CategorieEvenement.deleteMany({}),
            Service.deleteMany({}),
            Poste.deleteMany({}),
            Position.deleteMany({})
        ]);
        console.log('Données existantes supprimées');

        // Insertion des nouvelles données
        const [typeTachesResult, typePrioritesResult, categoriesResult, servicesResult, postesResult, positionsResult] = await Promise.all([
            TypeTache.insertMany(typeTaches),
            TypePriorite.insertMany(priorites),
            CategorieEvenement.insertMany(categoriesEvenements),
            Service.insertMany(services),
            Poste.insertMany(postes),
            Position.insertMany(positions)
        ]);

        console.log('Données insérées avec succès:');
        console.log(`${typeTachesResult.length} types de tâches`);
        console.log(`${typePrioritesResult.length} types de priorités`);
        console.log(`${categoriesResult.length} catégories d'événements`);
        console.log(`${servicesResult.length} services`);
        console.log(`${postesResult.length} postes`);
        console.log(`${positionsResult.length} positions`);

        // Déconnexion de la base de données
        await mongoose.disconnect();
        console.log('Déconnecté de la base de données');

    } catch (error) {
        console.error('Erreur lors de l\'insertion des données:', error);
        process.exit(1);
    }
};

// Exécution du script
insertData(); 