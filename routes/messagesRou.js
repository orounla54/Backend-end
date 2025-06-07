const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Message = require("../models/Message");

// Créer un message
router.post("/", auth.protect, async (req, res) => {
    try {
        const message = new Message({
            contenu: req.body.contenu,
            expediteur: req.user.id,
            destinataire: req.body.destinataireId,
            type: req.body.type || 'text'
        });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir tous les messages entre deux utilisateurs
router.get("/:userId", auth.protect, async (req, res) => {
    try {
        const messages = await Message.find({
            $or: [
                { expediteur: req.user.id, destinataire: req.params.userId },
                { expediteur: req.params.userId, destinataire: req.user.id }
            ]
        })
        .populate('expediteur', 'username profilePicture')
        .populate('destinataire', 'username profilePicture')
        .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir un message par ID
router.get("/message/:id", auth.protect, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: "Message non trouvé." });
        }
        // Optional: Add authorization check to ensure user can view this message
        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Marquer un message comme lu
router.put("/:messageId/read", auth.protect, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) {
            return res.status(404).json({ message: "Message non trouvé" });
        }
        if (message.destinataire.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }
        message.lu = true;
        await message.save();
        res.json(message);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un message
router.delete("/:id", auth.protect, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ message: "Message non trouvé" });
        }
        if (message.expediteur.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }
        await message.deleteOne();
        res.json({ message: "Message supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;