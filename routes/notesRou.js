const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Note = require("../models/Note");

// Créer une note
router.post("/", auth.protect, async (req, res) => {
    try {
        const { title, content } = req.body;
        const author = req.user.id; // Assuming user ID is available in req.user after auth middleware

        const note = new Note({
            title,
            content,
            author
        });

        await note.save();
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir toutes les notes
router.get("/", auth.protect, async (req, res) => {
    try {
        const notes = await Note.find().populate('author', 'username profilePicture').sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir une note par ID
router.get("/:id", auth.protect, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id).populate('author', 'username profilePicture');
        if (!note) {
            return res.status(404).json({ message: "Note non trouvée." });
        }
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour une note
router.put("/:id", auth.protect, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: "Note non trouvée." });
        }
        // Check if the logged-in user is the author
        if (note.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé." });
        }

        const updates = {
            title: req.body.title || note.title,
            content: req.body.content || note.content
        };

        Object.assign(note, updates);
        await note.save();
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer une note
router.delete("/:id", auth.protect, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: "Note non trouvée." });
        }
        // Check if the logged-in user is the author
        if (note.author.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé." });
        }

        await note.deleteOne();
        res.json({ message: "Note supprimée." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir les notes de l'utilisateur connecté
router.get("/user", auth.protect, async (req, res) => {
    try {
        const notes = await Note.find({ author: req.user.id }).populate('author', 'username profilePicture').sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;