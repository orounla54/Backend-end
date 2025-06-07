const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Observation = require('../models/Observation');

// Créer une observation
router.post("/", auth.protect, async (req, res) => {
    try {
        const { title, content, projectId } = req.body;
        const author = req.user.id; // Assuming user ID is available in req.user after auth middleware

        const observation = new Observation({
            title,
            content,
            project: projectId,
            author
        });

        await observation.save();
        res.status(201).json(observation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir toutes les observations
router.get("/", auth.protect, async (req, res) => {
    try {
        const observations = await Observation.find()
            .populate('project')
            .populate('author', 'username profilePicture')
            .sort({ createdAt: -1 });
        res.json(observations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir toutes les observations d'un projet
router.get("/projets/:idProjet/observations", auth.protect, async (req, res) => {
    try {
        const observations = await Observation.find({ project: req.params.idProjet })
            .populate('author', 'username profilePicture')
            .sort({ createdAt: -1 });
        res.json(observations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir une observation par ID
router.get("/:id", auth.protect, async (req, res) => {
    try {
        const observation = await Observation.findById(req.params.id)
            .populate('project')
            .populate('author', 'username profilePicture');
        if (!observation) {
            return res.status(404).json({ message: "Observation non trouvée." });
        }
        res.json(observation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour une observation existante
router.put("/:id", auth.protect, async (req, res) => {
    try {
        const observation = await Observation.findById(req.params.id);
        if (!observation) {
            return res.status(404).json({ message: "Observation non trouvée." });
        }
        // Check if the logged-in user is the author
        if (observation.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé." });
        }

        const updates = {
            title: req.body.title || observation.title,
            content: req.body.content || observation.content,
            project: req.body.projectId || observation.project // Allow changing project?
        };

        Object.assign(observation, updates);
        await observation.save();
        res.json(observation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer une observation
router.delete("/:id", auth.protect, async (req, res) => {
    try {
        const observation = await Observation.findById(req.params.id);
        if (!observation) {
            return res.status(404).json({ message: "Observation non trouvée." });
        }
        // Check if the logged-in user is the author
        if (observation.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé." });
        }

        await observation.deleteOne();
        res.json({ message: "Observation supprimée." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;