const CategorieEvenement = require('../models/CategorieEvenement');

// Obtenir toutes les catégories
exports.getAll = async (req, res) => {
    try {
        const categories = await CategorieEvenement.find().sort({ nom: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Créer une catégorie
exports.create = async (req, res) => {
    try {
        const categorie = new CategorieEvenement({
            nom: req.body.nom,
            description: req.body.description
        });
        await categorie.save();
        res.status(201).json(categorie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir une catégorie par ID
exports.getById = async (req, res) => {
    try {
        const categorie = await CategorieEvenement.findById(req.params.id);
        if (!categorie) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }
        res.json(categorie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour une catégorie
exports.update = async (req, res) => {
    try {
        const categorie = await CategorieEvenement.findById(req.params.id);
        if (!categorie) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }

        const updates = {
            nom: req.body.nom || categorie.nom,
            description: req.body.description || categorie.description
        };

        Object.assign(categorie, updates);
        await categorie.save();
        res.json(categorie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer une catégorie
exports.delete = async (req, res) => {
    try {
        const categorie = await CategorieEvenement.findById(req.params.id);
        if (!categorie) {
            return res.status(404).json({ message: 'Catégorie non trouvée' });
        }
        await categorie.deleteOne();
        res.json({ message: 'Catégorie supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Rechercher des catégories
exports.search = async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const categories = await CategorieEvenement.find({
            $or: [
                { nom: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]
        }).sort({ nom: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 