const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const IndicateurDP = require('../models/IndicateurDP');
const Tache = require('../models/Tache');
const Projet = require('../models/Projet');

// Obtenir les indicateurs pour l'utilisateur responsable
router.get('/responsable', auth.protect, async (req, res) => {
    try {
        // This logic is an interpretation based on the route name and common patterns
        // You might need to adjust it based on the actual business logic of getForIDP
        const userId = req.user.id;

        // Example: Get tasks where the user is the responsible
        const userTasks = await Tache.find({ responsable: userId });

        // Example: Get projects where the user is the responsible
        const userProjects = await Projet.find({ responsable: userId });

        // Example: Fetch or calculate relevant indicator data from IndicateurDP model or other sources
        // For now, returning a placeholder or relevant data based on tasks/projects
        res.json({
            tasks: userTasks,
            projects: userProjects,
            // Add other relevant indicator data here
            message: "Indicateurs pour responsable (MongoDB)"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir les indicateurs pour l'utilisateur contributeur
router.get('/contributeur', auth.protect, async (req, res) => {
    try {
        // This logic is an interpretation based on the route name and common patterns
        // You might need to adjust it based on the actual business logic of getForIDPContribution
        const userId = req.user.id;

        // Example: Get tasks where the user is a participant/contributor (assuming Tache model has a contributors field)
        // You might need to modify the Tache model if contributors are stored differently
        // const userContributionTasks = await Tache.find({ contributors: userId });

        // Example: Fetch or calculate relevant indicator data for contributions
        // For now, returning a placeholder
        res.json({
            // tasks: userContributionTasks,
            message: "Indicateurs pour contributeur (MongoDB)",
            note: "La logique de contribution dépend de la structure du modèle Tache et des données d'indicateurs."
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Créer un indicateur DP
router.post("/", auth.protect, async (req, res) => {
    try {
        const indicateur = new IndicateurDP({
            nom: req.body.nom,
            description: req.body.description,
            unite: req.body.unite,
            valeurCible: req.body.valeurCible,
            valeurActuelle: req.body.valeurActuelle,
            dateMesure: req.body.dateMesure,
            responsable: req.user.id
        });
        await indicateur.save();
        res.status(201).json(indicateur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir tous les indicateurs DP
router.get("/", auth.protect, async (req, res) => {
    try {
        const indicateurs = await IndicateurDP.find()
            .populate('responsable', 'username profilePicture')
            .sort({ dateMesure: -1 });
        res.json(indicateurs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir un indicateur DP spécifique
router.get("/:id", auth.protect, async (req, res) => {
    try {
        const indicateur = await IndicateurDP.findById(req.params.id)
            .populate('responsable', 'username profilePicture');
        if (!indicateur) {
            return res.status(404).json({ message: "Indicateur non trouvé" });
        }
        res.json(indicateur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour un indicateur DP
router.put("/:id", auth.protect, async (req, res) => {
    try {
        const indicateur = await IndicateurDP.findById(req.params.id);
        if (!indicateur) {
            return res.status(404).json({ message: "Indicateur non trouvé" });
        }
        if (indicateur.responsable.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }

        const updates = {
            nom: req.body.nom || indicateur.nom,
            description: req.body.description || indicateur.description,
            unite: req.body.unite || indicateur.unite,
            valeurCible: req.body.valeurCible || indicateur.valeurCible,
            valeurActuelle: req.body.valeurActuelle || indicateur.valeurActuelle,
            dateMesure: req.body.dateMesure || indicateur.dateMesure
        };

        Object.assign(indicateur, updates);
        await indicateur.save();
        res.json(indicateur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un indicateur DP
router.delete("/:id", auth.protect, async (req, res) => {
    try {
        const indicateur = await IndicateurDP.findById(req.params.id);
        if (!indicateur) {
            return res.status(404).json({ message: "Indicateur non trouvé" });
        }
        if (indicateur.responsable.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }
        await indicateur.deleteOne();
        res.json({ message: "Indicateur supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;