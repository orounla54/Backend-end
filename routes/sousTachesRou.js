const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const sousTachesController = require('../controllers/SousTachesCon');

// Obtenir toutes les sousTaches
router.get('/sousTaches',auth.authenticate, sousTachesController.getAll);

// Obtenir toutes les sous taches d'un projet
router.get('/tache/:id/sousTaches',auth.authenticate, sousTachesController.getAllByTache);

// Obtenir une sous tache par ID
router.get('/sousTaches/:id',auth.authenticate, sousTachesController.getById);

// Ajouter une nouvelle sous tache
router.post('/sousTaches',auth.authenticate, sousTachesController.create);

// Mettre à jour une sous tache existante
router.put('/sousTaches/:id',auth.authenticate, sousTachesController.update);

// Supprimer une sous tache
router.delete('/sousTaches/:id',auth.authenticate, sousTachesController.delete);

module.exports = router;