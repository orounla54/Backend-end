const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Tache = require("../models/Tache");

// Créer une tâche
router.post("/", auth.protect, async (req, res) => {
    try {
        const tache = new Tache({
            titre: req.body.titre,
            description: req.body.description,
            dateDebut: req.body.dateDebut,
            dateFin: req.body.dateFin,
            statut: req.body.statut || 'en_attente',
            priorite: req.body.priorite || 'moyenne',
            responsable: req.user.id,
            projet: req.body.projetId
        });
        await tache.save();
        res.status(201).json(tache);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir toutes les tâches
router.get("/", auth.protect, async (req, res) => {
    try {
        const taches = await Tache.find()
            .populate('responsable', 'username profilePicture')
            .populate('projet')
            .sort({ createdAt: -1 });
        res.json(taches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir les tâches d'un projet
router.get("/projet/:projetId", auth.protect, async (req, res) => {
    try {
        const taches = await Tache.find({ projet: req.params.projetId })
            .populate('responsable', 'username profilePicture')
            .sort({ createdAt: -1 });
        res.json(taches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir les tâches d'un utilisateur
router.get("/user", auth.protect, async (req, res) => {
    try {
        const taches = await Tache.find({ responsable: req.user.id })
            .populate('projet')
            .sort({ createdAt: -1 });
        res.json(taches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir une tâche spécifique
router.get("/:id", auth.protect, async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id)
            .populate('responsable', 'username profilePicture')
            .populate('projet')
            .populate('sousTaches');
        if (!tache) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }
        res.json(tache);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour une tâche
router.put("/:id", auth.protect, async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id);
        if (!tache) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }
        if (tache.responsable.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }

        const updates = {
            titre: req.body.titre || tache.titre,
            description: req.body.description || tache.description,
            dateDebut: req.body.dateDebut || tache.dateDebut,
            dateFin: req.body.dateFin || tache.dateFin,
            statut: req.body.statut || tache.statut,
            priorite: req.body.priorite || tache.priorite
        };

        Object.assign(tache, updates);
        await tache.save();
        res.json(tache);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer une tâche
router.delete("/:id", auth.protect, async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id);
        if (!tache) {
            return res.status(404).json({ message: "Tâche non trouvée" });
        }
        if (tache.responsable.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }
        await tache.deleteOne();
        res.json({ message: "Tâche supprimée" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route de recherche
router.get("/search", auth.protect, async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const taches = await Tache.find({
            $or: [
                { titre: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]
        })
        .populate('responsable', 'username profilePicture')
        .populate('projet')
        .sort({ createdAt: -1 });
        res.json(taches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route de filtrage
router.get("/filter", auth.protect, async (req, res) => {
    try {
        const { dateDebut, idStatusTache, keyword, important, urgent, private: isPrivate } = req.query;
        let query = {};

        // Handle date filter
        if (dateDebut) {
            try {
                const startDate = new Date(dateDebut);
                if (!isNaN(startDate.getTime())) {
                    query.dateDebut = { $gte: startDate };
                }
            } catch (error) {
                console.error('Invalid date format:', error);
            }
        }

        // Handle status filter
        if (idStatusTache) {
            query.statut = idStatusTache;
        }

        // Handle keyword search
        if (keyword) {
            query.$or = [
                { titre: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }

        // Handle boolean filters
        if (important !== undefined) {
            query.important = important === 'true';
        }
        if (urgent !== undefined) {
            query.urgent = urgent === 'true';
        }
        if (isPrivate !== undefined) {
            query.private = isPrivate === 'true';
        }

        console.log('Filter query:', query); // Debug log

        const taches = await Tache.find(query)
            .populate('responsable', 'username profilePicture')
            .populate('projet')
            .sort({ createdAt: -1 });
            
        res.json(taches);
    } catch (error) {
        console.error('Filter error:', error); // Debug log
        res.status(500).json({ 
            message: "Erreur lors du filtrage des tâches",
            error: error.message 
        });
    }
});

module.exports = router;