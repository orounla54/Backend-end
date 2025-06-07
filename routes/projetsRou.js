const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Projet = require('../models/Projet');

// Créer un projet
router.post("/", auth.protect, async (req, res) => {
    try {
        const projet = new Projet({
            titre: req.body.titre,
            description: req.body.description,
            dateDebut: req.body.dateDebut,
            dateFin: req.body.dateFin,
            statut: req.body.statut || 'en cours',
            responsable: req.user.id,
            membres: req.body.membres || [],
            budget: req.body.budget,
            objectifs: req.body.objectifs,
            livrables: req.body.livrables,
            risques: req.body.risques,
            notes: req.body.notes
        });
        await projet.save();
        res.status(201).json(projet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir tous les projets
router.get("/", auth.protect, async (req, res) => {
    try {
        const projets = await Projet.find()
            .populate('responsable', 'username profilePicture')
            .populate('membres', 'username profilePicture')
            .sort({ dateDebut: -1 });
        res.json(projets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir les projets d'un utilisateur
router.get("/user", auth.protect, async (req, res) => {
    try {
        const projets = await Projet.find({ responsable: req.user.id })
            .sort({ createdAt: -1 });
        res.json(projets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir un projet spécifique
router.get("/:id", auth.protect, async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id)
            .populate('responsable', 'username profilePicture')
            .populate('membres', 'username profilePicture');
        if (!projet) {
            return res.status(404).json({ message: "Projet non trouvé" });
        }
        res.json(projet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour un projet
router.put("/:id", auth.protect, async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ message: "Projet non trouvé" });
        }
        if (projet.responsable.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }

        const updates = {
            titre: req.body.titre || projet.titre,
            description: req.body.description || projet.description,
            dateDebut: req.body.dateDebut || projet.dateDebut,
            dateFin: req.body.dateFin || projet.dateFin,
            statut: req.body.statut || projet.statut,
            membres: req.body.membres || projet.membres,
            budget: req.body.budget || projet.budget,
            objectifs: req.body.objectifs || projet.objectifs,
            livrables: req.body.livrables || projet.livrables,
            risques: req.body.risques || projet.risques,
            notes: req.body.notes || projet.notes
        };

        Object.assign(projet, updates);
        await projet.save();
        res.json(projet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un projet
router.delete("/:id", auth.protect, async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ message: "Projet non trouvé" });
        }
        if (projet.responsable.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }
        await projet.deleteOne();
        res.json({ message: "Projet supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route de recherche
router.get("/search", auth.protect, async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const projets = await Projet.find({
            $or: [
                { titre: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]
        })
        .populate('responsable', 'username profilePicture')
        .sort({ createdAt: -1 });
        res.json(projets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route de filtrage
router.get("/filter", auth.protect, async (req, res) => {
    try {
        const { dateInscription, datePriseDecision, deadline, dateDebut, dateFin, idStatusProjet, keyword } = req.query;
        let query = {};

        if (keyword) {
            query.$or = [
                { titre: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (dateInscription) {
            // Assuming dateInscription is a date string in a format Mongoose can parse
            query.dateInscription = new Date(dateInscription);
        }
        if (datePriseDecision) {
            // Assuming datePriseDecision is a date string
            query.datePriseDecision = new Date(datePriseDecision);
        }
        if (deadline) {
            // Assuming deadline is a date string
            query.deadline = new Date(deadline);
        }
        if (dateDebut) {
            // Assuming dateDebut is a date string
            query.dateDebut = new Date(dateDebut);
        }
        if (dateFin) {
            // Assuming dateFin is a date string
            query.dateFin = new Date(dateFin);
        }
        
        if (idStatusProjet) {
            query.statut = idStatusProjet;
        }

        const projets = await Projet.find(query)
            .populate('responsable', 'username profilePicture')
            .sort({ createdAt: -1 });
        
        res.json(projets);
    } catch (error) {
        console.error('Filter error:', error); // Log the error on the backend
        res.status(500).json({ 
            message: "Erreur lors du filtrage des projets",
            error: error.message // Include the actual error message in the response
        });
    }
});

// Ajouter un membre à un projet
router.post("/:id/membres", auth.protect, async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ message: "Projet non trouvé" });
        }
        if (projet.responsable.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }
        if (projet.membres.includes(req.body.membreId)) {
            return res.status(400).json({ message: "Le membre est déjà dans le projet" });
        }
        projet.membres.push(req.body.membreId);
        await projet.save();
        res.json(projet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un membre d'un projet
router.delete("/:id/membres/:membreId", auth.protect, async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ message: "Projet non trouvé" });
        }
        if (projet.responsable.toString() !== req.user.id) {
            return res.status(403).json({ message: "Non autorisé" });
        }
        projet.membres = projet.membres.filter(membreId => membreId.toString() !== req.params.membreId);
        await projet.save();
        res.json(projet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
