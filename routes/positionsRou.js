const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Position = require('../models/Position');

// Obtenir toutes les positions
router.get('/', auth.protect, async (req, res) => {
    try {
        const positions = await Position.find()
            .sort({ dateLimite: 1 });
        res.json(positions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir une position par ID
router.get('/:id', auth.protect, async (req, res) => {
    try {
        const position = await Position.findById(req.params.id);
        if (!position) {
            return res.status(404).json({ message: 'Position non trouvée' });
        }
        res.json(position);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Créer une nouvelle position
router.post('/', auth.protect, async (req, res) => {
    try {
        const position = new Position({
            titre: req.body.titre,
            description: req.body.description,
            departement: req.body.departement,
            niveau: req.body.niveau,
            competences: req.body.competences,
            experience: req.body.experience,
            formation: req.body.formation,
            salaire: req.body.salaire,
            typeContrat: req.body.typeContrat,
            localisation: req.body.localisation,
            dateLimite: req.body.dateLimite,
            statut: req.body.statut || 'ouvert'
        });
        await position.save();
        res.status(201).json(position);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour une position
router.put('/:id', auth.protect, async (req, res) => {
    try {
        const position = await Position.findById(req.params.id);
        if (!position) {
            return res.status(404).json({ message: 'Position non trouvée' });
        }

        const updates = {
            titre: req.body.titre || position.titre,
            description: req.body.description || position.description,
            departement: req.body.departement || position.departement,
            niveau: req.body.niveau || position.niveau,
            competences: req.body.competences || position.competences,
            experience: req.body.experience || position.experience,
            formation: req.body.formation || position.formation,
            salaire: req.body.salaire || position.salaire,
            typeContrat: req.body.typeContrat || position.typeContrat,
            localisation: req.body.localisation || position.localisation,
            dateLimite: req.body.dateLimite || position.dateLimite,
            statut: req.body.statut || position.statut
        };

        Object.assign(position, updates);
        await position.save();
        res.json(position);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer une position
router.delete('/:id', auth.protect, async (req, res) => {
    try {
        const position = await Position.findById(req.params.id);
        if (!position) {
            return res.status(404).json({ message: 'Position non trouvée' });
        }
        await position.deleteOne();
        res.json({ message: 'Position supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Les routes /search et /filter nécessiteraient une logique de recherche/filtrage MongoDB
// Pour l'instant, elles ne sont pas implémentées ici.
// router.get('/search/positions', auth.authenticate, positionsController.search);
// router.get('/filter/positions', auth.authenticate, positionsController.filter);
// router.get('/positions/forUpdate', auth.authenticate, positionsController.getAllForUpdate);

module.exports = router;