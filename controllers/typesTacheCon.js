const TypeTache = require('../models/TypeTache');
const Tache = require('../models/Tache');

// Types de tâche par défaut
const typesTacheParDefaut = [
    {
        nom: "Développement",
        description: "Tâches liées au développement de code",
        couleur: "#4CAF50" // Vert
    },
    {
        nom: "Design",
        description: "Tâches liées à la conception et au design",
        couleur: "#2196F3" // Bleu
    },
    {
        nom: "Documentation",
        description: "Tâches liées à la documentation",
        couleur: "#FFC107" // Jaune
    },
    {
        nom: "Test",
        description: "Tâches liées aux tests",
        couleur: "#9C27B0" // Violet
    },
    {
        nom: "Réunion",
        description: "Tâches liées aux réunions",
        couleur: "#FF5722" // Orange
    }
];

// Initialiser les types de tâche par défaut
exports.initialiserTypes = async () => {
    try {
        console.log("Initialisation des types de tâche...");
        const count = await TypeTache.countDocuments();
        console.log(`Nombre de types de tâche existants: ${count}`);

        if (count === 0) {
            console.log("Création des types de tâche par défaut...");
            const typesCrees = await TypeTache.insertMany(typesTacheParDefaut);
            console.log(`${typesCrees.length} types de tâche créés avec succès`);
            return typesCrees;
        }

        // Vérifier et ajouter les types manquants
        const typesExistants = await TypeTache.find({});
        const nomsExistants = typesExistants.map(t => t.nom);
        const typesAManquer = typesTacheParDefaut.filter(t => !nomsExistants.includes(t.nom));

        if (typesAManquer.length > 0) {
            console.log(`Ajout de ${typesAManquer.length} types de tâche manquants...`);
            const nouveauxTypes = await TypeTache.insertMany(typesAManquer);
            console.log(`${nouveauxTypes.length} nouveaux types de tâche ajoutés`);
        }

        return await TypeTache.find().sort({ nom: 1 });
    } catch (error) {
        console.error("Erreur lors de l'initialisation des types de tâche:", error);
        throw error;
    }
};

// Obtenir tous les types de tâche
exports.getAll = async (req, res) => {
    try {
        console.log("Récupération des types de tâche...");
        const { page = 1, limit = 10, search, sortBy = 'nom', sortOrder = 'asc' } = req.query;
        const skip = (page - 1) * limit;

        // Construire la requête de recherche
        const query = {};
        if (search) {
            query.$or = [
                { nom: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Construire l'option de tri
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const [types, total] = await Promise.all([
            TypeTache.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            TypeTache.countDocuments(query)
        ]);

        // Si aucun type n'existe, initialiser les types par défaut
        if (types.length === 0) {
            console.log("Aucun type de tâche trouvé, initialisation...");
            await exports.initialiserTypes();
            const typesInit = await TypeTache.find().sort({ nom: 1 });
            return res.json({
                success: true,
                data: typesInit,
                pagination: {
                    total: typesInit.length,
                    page: 1,
                    pages: 1
                }
            });
        }

        console.log(`${types.length} types de tâche trouvés`);
        res.json({
            success: true,
            data: types,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des types de tâche:", error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des types de tâche",
            details: error.message 
        });
    }
};

// Obtenir un type de tâche par ID
exports.getById = async (req, res) => {
    try {
        const type = await TypeTache.findById(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Type de tâche non trouvé' });
        }

        // Récupérer le nombre de tâches associées
        const tachesCount = await Tache.countDocuments({ type: req.params.id });

        res.json({
            success: true,
            data: {
                ...type.toObject(),
                tachesCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Créer un nouveau type de tâche
exports.create = async (req, res) => {
    try {
        const type = new TypeTache(req.body);
        const savedType = await type.save();
        res.status(201).json({
            success: true,
            message: 'Type de tâche créé avec succès',
            data: savedType
        });
    } catch (error) {
        console.error("Erreur lors de la création du type de tâche:", error);
        res.status(500).json({ 
            message: "Erreur lors de la création du type de tâche",
            details: error.message 
        });
    }
};

// Mettre à jour un type de tâche
exports.update = async (req, res) => {
    try {
        const type = await TypeTache.findById(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Type de tâche non trouvé' });
        }

        Object.assign(type, req.body);
        const updatedType = await type.save();
        res.json({
            success: true,
            message: 'Type de tâche mis à jour avec succès',
            data: updatedType
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un type de tâche
exports.delete = async (req, res) => {
    try {
        const type = await TypeTache.findById(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Type de tâche non trouvé' });
        }

        // Vérifier si le type est utilisé par des tâches
        const tachesAssociees = await Tache.find({ type: req.params.id });
        if (tachesAssociees.length > 0) {
            return res.status(400).json({ 
                message: "Impossible de supprimer ce type de tâche car il est utilisé par des tâches",
                tachesCount: tachesAssociees.length
            });
        }

        await type.deleteOne();
        res.json({
            success: true,
            message: 'Type de tâche supprimé avec succès'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Rechercher des types de tâche
exports.search = async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const types = await TypeTache.find({
            $or: [
                { nom: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]
        }).sort({ nom: 1 });
        res.json({
            success: true,
            data: types
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les statistiques des types de tâche
exports.getStats = async (req, res) => {
    try {
        const stats = await Promise.all([
            TypeTache.countDocuments(),
            Tache.aggregate([
                { $group: { _id: '$type', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])
        ]);

        res.json({
            success: true,
            data: {
                totalTypes: stats[0],
                usageByType: stats[1]
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des statistiques",
            error: error.message 
        });
    }
};

module.exports = exports; 