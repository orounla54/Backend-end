const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const TypeTache = require('../models/TypeTache');
const Log = require('../models/log');
const Tache = require('../models/Tache');

// Validation des données d'entrée
const validateTypeTacheInput = (data) => {
    const errors = {};
    if (!data.nom) {
        errors.nom = 'Le nom est requis';
    } else if (data.nom.length > 100) {
        errors.nom = 'Le nom ne doit pas dépasser 100 caractères';
    }
    if (data.description && data.description.length > 500) {
        errors.description = 'La description ne doit pas dépasser 500 caractères';
    }
    if (data.couleur && !/^#[0-9A-F]{6}$/i.test(data.couleur)) {
        errors.couleur = 'Format de couleur invalide (ex: #FF0000)';
    }
    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
};

// Middleware pour vérifier les autorisations
const checkAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès non autorisé. Rôle administrateur requis." });
        }
        next();
    } catch (error) {
        console.error('Erreur lors de la vérification des autorisations:', error);
        res.status(500).json({ message: "Erreur lors de la vérification des autorisations" });
    }
};

// Obtenir tous les types de tâche avec filtrage et pagination
router.get('/', auth.protect, async (req, res) => {
    try {
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

        const [typesTache, total] = await Promise.all([
            TypeTache.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            TypeTache.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: typesTache,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des types de tâche:', error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des types de tâche",
            error: error.message 
        });
    }
});

// Obtenir un type de tâche par ID
router.get('/:id', auth.protect, async (req, res) => {
    try {
        const typeTache = await TypeTache.findById(req.params.id);
        if (!typeTache) {
            return res.status(404).json({ message: "Type de tâche non trouvé" });
        }

        // Récupérer le nombre de tâches associées
        const tachesCount = await Tache.countDocuments({ type: req.params.id });

        res.json({
            success: true,
            data: {
                ...typeTache.toObject(),
                tachesCount
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du type de tâche:', error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération du type de tâche",
            error: error.message 
        });
    }
});

// Créer un nouveau type de tâche (admin uniquement)
router.post('/', [auth.protect, checkAdmin], async (req, res) => {
    try {
        const { errors, isValid } = validateTypeTacheInput(req.body);
        if (!isValid) {
            return res.status(400).json({ errors });
        }

        // Vérifier si le nom existe déjà
        const existingType = await TypeTache.findOne({ nom: req.body.nom });
        if (existingType) {
            return res.status(400).json({ message: "Un type de tâche avec ce nom existe déjà" });
        }

        const typeTache = await TypeTache.create({
            ...req.body,
            createdBy: req.user.id
        });

        // Créer un log
        await Log.create({
            user: req.user.id,
            action: 'create',
            model: 'TypeTache',
            details: `Création du type de tâche ${typeTache.nom}`,
            role: 'admin'
        });

        res.status(201).json({
            success: true,
            message: 'Type de tâche créé avec succès',
            data: typeTache
        });
    } catch (error) {
        console.error('Erreur lors de la création du type de tâche:', error);
        res.status(500).json({ 
            message: "Erreur lors de la création du type de tâche",
            error: error.message 
        });
    }
});

// Mettre à jour un type de tâche (admin uniquement)
router.put('/:id', [auth.protect, checkAdmin], async (req, res) => {
    try {
        const typeTache = await TypeTache.findById(req.params.id);
        if (!typeTache) {
            return res.status(404).json({ message: "Type de tâche non trouvé" });
        }

        // Vérifier si le nouveau nom existe déjà
        if (req.body.nom && req.body.nom !== typeTache.nom) {
            const existingType = await TypeTache.findOne({ nom: req.body.nom });
            if (existingType) {
                return res.status(400).json({ message: "Un type de tâche avec ce nom existe déjà" });
            }
        }

        const { errors, isValid } = validateTypeTacheInput({ ...typeTache.toObject(), ...req.body });
        if (!isValid) {
            return res.status(400).json({ errors });
        }

        const updatedTypeTache = await TypeTache.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );

        // Créer un log
        await Log.create({
            user: req.user.id,
            action: 'update',
            model: 'TypeTache',
            details: `Mise à jour du type de tâche ${updatedTypeTache.nom}`,
            role: 'admin'
        });

        res.json({
            success: true,
            message: 'Type de tâche mis à jour avec succès',
            data: updatedTypeTache
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du type de tâche:', error);
        res.status(500).json({ 
            message: "Erreur lors de la mise à jour du type de tâche",
            error: error.message 
        });
    }
});

// Supprimer un type de tâche (admin uniquement)
router.delete('/:id', [auth.protect, checkAdmin], async (req, res) => {
    try {
        const typeTache = await TypeTache.findById(req.params.id);
        if (!typeTache) {
            return res.status(404).json({ message: "Type de tâche non trouvé" });
        }

        // Vérifier si le type est utilisé par des tâches
        const tachesAssociees = await Tache.find({ type: req.params.id });
        if (tachesAssociees.length > 0) {
            return res.status(400).json({ 
                message: "Impossible de supprimer ce type de tâche car il est utilisé par des tâches",
                tachesCount: tachesAssociees.length
            });
        }

        await typeTache.deleteOne();

        // Créer un log
        await Log.create({
            user: req.user.id,
            action: 'delete',
            model: 'TypeTache',
            details: `Suppression du type de tâche ${typeTache.nom}`,
            role: 'admin'
        });

        res.json({
            success: true,
            message: 'Type de tâche supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la suppression du type de tâche:', error);
        res.status(500).json({ 
            message: "Erreur lors de la suppression du type de tâche",
            error: error.message 
        });
    }
});

// Route pour obtenir les statistiques des types de tâche
router.get('/stats/overview', auth.protect, async (req, res) => {
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
});

module.exports = router;