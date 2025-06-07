const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Discussion = require("../models/Discussion");

// Créer une discussion
router.post("/", auth.protect, async (req, res) => {
    try {
        const discussion = new Discussion({
            content: req.body.content,
            responsable: req.user.id,
            tache: req.body.tacheId
        });
        await discussion.save();
        res.status(201).json(discussion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir toutes les discussions de l'utilisateur connecté
router.get("/", auth.protect, async (req, res) => {
    try {
        const discussions = await Discussion.find({ responsable: req.user.id })
            .populate('tache')
            .sort({ createdAt: -1 });
        res.json(discussions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir toutes les discussions d'une tâche
router.get("/tache/:tacheId", auth.protect, async (req, res) => {
    try {
        const discussions = await Discussion.find({ tache: req.params.tacheId })
            .populate('responsable', 'username profilePicture')
            .sort({ createdAt: -1 });
        res.json(discussions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir une discussion spécifique
router.get("/:id", auth.protect, async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id)
            .populate('responsable', 'username profilePicture')
            .populate('tache');
        if (!discussion) {
            return res.status(404).json({ message: "Discussion non trouvée" });
        }
        res.json(discussion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour une discussion
router.put("/:id", auth.protect, async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: "Discussion non trouvée" });
        }
        if (discussion.responsable.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }
        discussion.content = req.body.content || discussion.content;
        await discussion.save();
        res.json(discussion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer une discussion
router.delete("/:id", auth.protect, async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: "Discussion non trouvée" });
        }
        if (discussion.responsable.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }
        await discussion.remove();
        res.json({ message: "Discussion supprimée" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;