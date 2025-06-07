const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Poste = require('../models/Poste');

// Obtenir tous les postes
router.get('/', auth.protect, async (req, res) => {
    try {
        const postes = await Poste.find()
            .sort({ dateLimite: 1 });
        res.json(postes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir un poste par ID
router.get('/:id', auth.protect, async (req, res) => {
    try {
        const poste = await Poste.findById(req.params.id);
        if (!poste) {
            return res.status(404).json({ message: 'Poste non trouvé' });
        }
        res.json(poste);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Créer un nouveau poste
router.post('/', auth.protect, async (req, res) => {
    try {
        const poste = new Poste({
            titre: req.body.titre,
            description: req.body.description,
            departement: req.body.departement,
            competences: req.body.competences,
            experience: req.body.experience,
            typeContrat: req.body.typeContrat,
            salaire: req.body.salaire,
            localisation: req.body.localisation,
            dateLimite: req.body.dateLimite,
            statut: req.body.statut || 'ouvert'
        });
        await poste.save();
        res.status(201).json(poste);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour un poste
router.put('/:id', auth.protect, async (req, res) => {
    try {
        const poste = await Poste.findById(req.params.id);
        if (!poste) {
            return res.status(404).json({ message: 'Poste non trouvé' });
        }

        const updates = {
            titre: req.body.titre || poste.titre,
            description: req.body.description || poste.description,
            departement: req.body.departement || poste.departement,
            competences: req.body.competences || poste.competences,
            experience: req.body.experience || poste.experience,
            typeContrat: req.body.typeContrat || poste.typeContrat,
            salaire: req.body.salaire || poste.salaire,
            localisation: req.body.localisation || poste.localisation,
            dateLimite: req.body.dateLimite || poste.dateLimite,
            statut: req.body.statut || poste.statut
        };

        Object.assign(poste, updates);
        await poste.save();
        res.json(poste);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un poste
router.delete('/:id', auth.protect, async (req, res) => {
    try {
        const poste = await Poste.findById(req.params.id);
        if (!poste) {
            return res.status(404).json({ message: 'Poste non trouvé' });
        }
        await poste.deleteOne();
        res.json({ message: 'Poste supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Les routes /search et /filter nécessiteraient une logique de recherche/filtrage MongoDB
// Pour l'instant, elles ne sont pas implémentées ici.
// router.get('/search/postes', auth.authenticate, postesController.search);
// router.get('/filter/postes', auth.authenticate, postesController.filter);
// router.get('/postes/forUpdate', auth.authenticate, postesController.getAllForUpdate);

module.exports = router;