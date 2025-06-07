const express = require('express');
const router = express.Router();
const TypeProjetController = require('../controllers/typesProjetCon');
const auth = require('../middlewares/auth');

// Routes publiques
router.get('/', TypeProjetController.getAll);
router.get('/search', TypeProjetController.search);
router.get('/filter', TypeProjetController.filter);
router.get('/stats', TypeProjetController.getStats);
router.get('/:id', TypeProjetController.getById);

// Routes protégées
router.post('/', auth.protect, TypeProjetController.create);
router.put('/:id', auth.protect, TypeProjetController.update);
router.delete('/:id', auth.protect, TypeProjetController.delete);

module.exports = router; 