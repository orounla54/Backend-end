const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const Evenement = require("../models/Evenement");
const CategorieEvenement = require("../models/CategorieEvenement");
const FileConducteurEvenement = require("../models/FileConducteurEvenement");

// Créer un événement
router.post("/", auth.protect, async (req, res) => {
    try {
        const evenement = new Evenement({
            titre: req.body.titre,
            description: req.body.description,
            dateDebut: req.body.dateDebut,
            dateFin: req.body.dateFin,
            lieu: req.body.lieu,
            categorie: req.body.categorieId,
            responsable: req.user.id,
        });
        await evenement.save();
        res.status(201).json(evenement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir tous les événements
router.get("/", auth.protect, async (req, res) => {
    try {
        const evenements = await Evenement.find()
            .populate('categorie')
            .populate('responsable', 'username profilePicture')
            .sort({ dateDebut: -1 });
        res.json(evenements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir un événement spécifique
router.get("/:id", auth.protect, async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id)
            .populate('categorie')
            .populate('responsable', 'username profilePicture')
            .populate('participants', 'username profilePicture')
            .populate('fichiersConducteurs');
        if (!evenement) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }
        res.json(evenement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour un événement
router.put("/:id", auth.protect, async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id);
        if (!evenement) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }
        if (evenement.responsable.toString() !== req.user.id) {
             // Optional: Add admin check if needed
             // if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Non autorisé" });
             // }
        }

        const updates = {
            titre: req.body.titre || evenement.titre,
            description: req.body.description || evenement.description,
            dateDebut: req.body.dateDebut || evenement.dateDebut,
            dateFin: req.body.dateFin || evenement.dateFin,
            lieu: req.body.lieu || evenement.lieu,
            categorie: req.body.categorieId || evenement.categorie,
        };

        Object.assign(evenement, updates);
        await evenement.save();
        res.json(evenement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un événement
router.delete("/:id", auth.protect, async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id);
        if (!evenement) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }
         if (evenement.responsable.toString() !== req.user.id) {
             // Optional: Add admin check if needed
             // if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Non autorisé" });
             // }
        }
        await evenement.deleteOne();
        res.json({ message: "Événement supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ajouter un participant à un événement
router.post("/:id/participants", auth.protect, async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id);
        if (!evenement) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }
        // Check if user is already a participant
        if (evenement.participants.includes(req.user.id)) {
            return res.status(400).json({ message: "Vous participez déjà à cet événement." });
        }
        evenement.participants.push(req.user.id);
        await evenement.save();
        res.json(evenement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un participant d'un événement
router.delete("/:id/participants/:userId", auth.protect, async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id);
        if (!evenement) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }
        // Check if user is the responsible or the participant to be removed
        if (evenement.responsable.toString() !== req.user.id && req.params.userId !== req.user.id) {
             // Optional: Add admin check if needed
             // if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Non autorisé" });
             // }
        }
        evenement.participants = evenement.participants.filter(participantId => participantId.toString() !== req.params.userId);
        await evenement.save();
        res.json(evenement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Routes pour les catégories d'événements

// Créer une catégorie d'événement
router.post("/categories", auth.protect, async (req, res) => {
    try {
        const categorie = new CategorieEvenement({
            libelle: req.body.libelle
        });
        await categorie.save();
        res.status(201).json(categorie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir toutes les catégories d'événements
router.get("/categories", auth.protect, async (req, res) => {
    try {
        const categories = await CategorieEvenement.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir une catégorie d'événement spécifique
router.get("/categories/:id", auth.protect, async (req, res) => {
    try {
        const categorie = await CategorieEvenement.findById(req.params.id);
        if (!categorie) {
            return res.status(404).json({ message: "Catégorie non trouvée" });
        }
        res.json(categorie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour une catégorie d'événement
router.put("/categories/:id", auth.protect, async (req, res) => {
    try {
        const categorie = await CategorieEvenement.findById(req.params.id);
        if (!categorie) {
            return res.status(404).json({ message: "Catégorie non trouvée" });
        }
        categorie.libelle = req.body.libelle || categorie.libelle;
        await categorie.save();
        res.json(categorie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer une catégorie d'événement
router.delete("/categories/:id", auth.protect, async (req, res) => {
    try {
        const categorie = await CategorieEvenement.findById(req.params.id);
        if (!categorie) {
            return res.status(404).json({ message: "Catégorie non trouvée" });
        }
        await categorie.deleteOne();
        res.json({ message: "Catégorie supprimée" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Routes pour les fichiers conducteurs d'événements

// Ajouter un fichier conducteur à un événement
router.post("/:id/file-conducteurs", auth.protect, async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id);
        if (!evenement) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }
        const fileConducteur = new FileConducteurEvenement({
            evenement: evenement._id,
            fileName: req.body.fileName,
            filePath: req.body.filePath // Assuming filePath is provided in the body
        });
        await fileConducteur.save();
        evenement.fichiersConducteurs.push(fileConducteur._id);
        await evenement.save();
        res.status(201).json(fileConducteur);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir les fichiers conducteurs d'un événement
router.get("/:id/file-conducteurs", auth.protect, async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id).populate('fichiersConducteurs');
        if (!evenement) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }
        res.json(evenement.fichiersConducteurs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un fichier conducteur d'un événement
router.delete("/:evenementId/file-conducteurs/:fileId", auth.protect, async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.evenementId);
        if (!evenement) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }
        const fileConducteur = await FileConducteurEvenement.findById(req.params.fileId);
        if (!fileConducteur) {
            return res.status(404).json({ message: "Fichier conducteur non trouvé" });
        }
         // Optional: Check if user is authorized to delete (e.g., responsible or admin)

        await fileConducteur.deleteOne();
        evenement.fichiersConducteurs = evenement.fichiersConducteurs.filter(fileId => fileId.toString() !== req.params.fileId);
        await evenement.save();
        res.json({ message: "Fichier conducteur supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
