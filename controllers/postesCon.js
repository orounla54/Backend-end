const Poste = require('../models/Poste');

// Obtenir tous les postes
exports.getAll = async (req, res) => {
    try {
        const postes = await Poste.find()
            .populate('service', 'nom')
            .populate('titulaire', 'username profilePicture')
            .sort({ nom: 1 });
        res.json(postes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Créer un poste
exports.create = async (req, res) => {
    try {
        const poste = new Poste({
            nom: req.body.nom,
            description: req.body.description,
            service: req.body.serviceId,
            titulaire: req.body.titulaireId || null
        });
        await poste.save();
        res.status(201).json(poste);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un poste par ID
exports.getById = async (req, res) => {
    try {
        const poste = await Poste.findById(req.params.id)
            .populate('service', 'nom')
            .populate('titulaire', 'username profilePicture');
        if (!poste) {
            return res.status(404).json({ message: 'Poste non trouvé' });
        }
        res.json(poste);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un poste
exports.update = async (req, res) => {
    try {
        const poste = await Poste.findById(req.params.id);
        if (!poste) {
            return res.status(404).json({ message: 'Poste non trouvé' });
        }

        const updates = {
            nom: req.body.nom || poste.nom,
            description: req.body.description || poste.description,
            service: req.body.serviceId || poste.service,
            titulaire: req.body.titulaireId || poste.titulaire
        };

        Object.assign(poste, updates);
        await poste.save();
        res.json(poste);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un poste
exports.delete = async (req, res) => {
    try {
        const poste = await Poste.findById(req.params.id);
        if (!poste) {
            return res.status(404).json({ message: 'Poste non trouvé' });
        }
        await poste.deleteOne();
        res.json({ message: 'Poste supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Rechercher des postes
exports.search = async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const postes = await Poste.find({
            $or: [
                { nom: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]
        })
        .populate('service', 'nom')
        .populate('titulaire', 'username profilePicture')
        .sort({ nom: 1 });
        res.json(postes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Filtrer des postes
exports.filter = async (req, res) => {
    try {
        const { service, titulaire } = req.query;
        let query = {};

        if (service) query.service = service;
        if (titulaire) query.titulaire = titulaire;

        const postes = await Poste.find(query)
            .populate('service', 'nom')
            .populate('titulaire', 'username profilePicture')
            .sort({ nom: 1 });
        res.json(postes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 