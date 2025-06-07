const TypeProjet = require('../models/TypeProjet');

// Types de projet par défaut
const typesParDefaut = [
    {
        nom: "Projet Interne",
        description: "Projets développés en interne pour améliorer les processus ou les services",
        couleur: "#6366F1",
        icone: "building"
    },
    {
        nom: "Projet Client",
        description: "Projets réalisés pour des clients externes",
        couleur: "#10B981",
        icone: "users"
    },
    {
        nom: "Projet R&D",
        description: "Projets de recherche et développement",
        couleur: "#F59E0B",
        icone: "flask"
    }
];

// Initialiser les types de projet par défaut
exports.initialiserTypes = async () => {
    try {
        console.log("Début de l'initialisation des types de projet...");
        const count = await TypeProjet.countDocuments();
        console.log(`Nombre de types de projet existants: ${count}`);

        if (count === 0) {
            console.log("Aucun type de projet trouvé, création des types par défaut...");
            const typesCrees = await TypeProjet.insertMany(typesParDefaut);
            console.log(`${typesCrees.length} types de projet créés avec succès:`, 
                typesCrees.map(t => t.nom).join(', '));
        } else {
            // Vérifier si tous les types par défaut existent
            const typesExistants = await TypeProjet.find({});
            console.log("Types existants:", typesExistants.map(t => t.nom).join(', '));

            // Créer les types manquants
            const nomsExistants = typesExistants.map(t => t.nom);
            const typesAManquer = typesParDefaut.filter(t => !nomsExistants.includes(t.nom));

            if (typesAManquer.length > 0) {
                console.log("Création des types manquants:", typesAManquer.map(t => t.nom).join(', '));
                const nouveauxTypes = await TypeProjet.insertMany(typesAManquer);
                console.log(`${nouveauxTypes.length} nouveaux types créés`);
            }
        }
    } catch (error) {
        console.error("Erreur détaillée lors de l'initialisation des types de projet:", {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
    }
};

// Obtenir tous les types de projet
exports.getAll = async (req, res) => {
    try {
        console.log("GET /types-projet - Tentative de récupération des types de projet...");
        const types = await TypeProjet.find({ actif: true }).sort({ nom: 1 });
        console.log(`${types.length} types de projet trouvés:`, types.map(t => t.nom).join(', '));
        
        if (types.length === 0) {
            console.log("Aucun type trouvé, initialisation des types par défaut...");
            await exports.initialiserTypes();
            const typesInit = await TypeProjet.find({ actif: true }).sort({ nom: 1 });
            console.log(`${typesInit.length} types après initialisation:`, typesInit.map(t => t.nom).join(', '));
            return res.json(typesInit);
        }
        
        res.json(types);
    } catch (error) {
        console.error("Erreur lors de la récupération des types de projet:", {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({ 
            message: "Erreur lors de la récupération des types de projet",
            details: error.message 
        });
    }
};

// Créer un type de projet
exports.create = async (req, res) => {
    try {
        const type = new TypeProjet(req.body);
        const savedType = await type.save();
        res.status(201).json(savedType);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: "Ce type de projet existe déjà" });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// Obtenir un type de projet par ID
exports.getById = async (req, res) => {
    try {
        const type = await TypeProjet.findById(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Type de projet non trouvé' });
        }
        res.json(type);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un type de projet
exports.update = async (req, res) => {
    try {
        const type = await TypeProjet.findById(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Type de projet non trouvé' });
        }

        Object.assign(type, req.body);
        const updatedType = await type.save();
        res.json(updatedType);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: "Ce nom de type de projet existe déjà" });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// Supprimer un type de projet (désactivation logique)
exports.delete = async (req, res) => {
    try {
        const type = await TypeProjet.findById(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Type de projet non trouvé' });
        }
        
        type.actif = false;
        await type.save();
        res.json({ message: 'Type de projet désactivé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Rechercher des types de projet
exports.search = async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const types = await TypeProjet.find({
            actif: true,
            $or: [
                { nom: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]
        }).sort({ nom: 1 });
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Filtrer les types de projet
exports.filter = async (req, res) => {
    try {
        const { couleur, icone } = req.query;
        const query = { actif: true };
        
        if (couleur) query.couleur = couleur;
        if (icone) query.icone = icone;

        const types = await TypeProjet.find(query).sort({ nom: 1 });
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les statistiques des types de projet
exports.getStats = async (req, res) => {
    try {
        const stats = await TypeProjet.aggregate([
            { $match: { actif: true } },
            {
                $lookup: {
                    from: 'projets',
                    localField: '_id',
                    foreignField: 'type',
                    as: 'projets'
                }
            },
            {
                $project: {
                    nom: 1,
                    description: 1,
                    couleur: 1,
                    icone: 1,
                    nombreProjets: { $size: '$projets' }
                }
            },
            { $sort: { nombreProjets: -1 } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 