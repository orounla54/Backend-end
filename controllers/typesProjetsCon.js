const TypeProjet = require('../models/TypeProjet');

// Obtenir tous les types
exports.getAll = async (req, res) => {
    try {
        const types = await TypeProjet.find().sort({ nom: 1 });
        res.json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Créer un type
exports.create = async (req, res) => {
    try {
        const type = new TypeProjet({
            nom: req.body.nom,
            description: req.body.description
        });
        await type.save();
        res.status(201).json(type);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un type par ID
exports.getById = async (req, res) => {
    try {
        const type = await TypeProjet.findById(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Type non trouvé' });
        }
        res.json(type);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un type
exports.update = async (req, res) => {
    try {
        const type = await TypeProjet.findById(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Type non trouvé' });
        }

        const updates = {
            nom: req.body.nom || type.nom,
            description: req.body.description || type.description
        };

        Object.assign(type, updates);
        await type.save();
        res.json(type);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un type
exports.delete = async (req, res) => {
    try {
        const type = await TypeProjet.findById(req.params.id);
        if (!type) {
            return res.status(404).json({ message: 'Type non trouvé' });
        }
        await type.deleteOne();
        res.json({ message: 'Type supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Rechercher des types
exports.search = async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const types = await TypeProjet.find({
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