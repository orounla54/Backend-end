const express = require('express');
const router = express.Router();

const { getFilteredTaches, getTypesTaches } = require('../controllers/tacheController');
const { getEvenementsOccurence } = require('../controllers/evenementController');

// /filter/taches
router.get('/taches', getFilteredTaches);
// /filter/taches/typesTaches (optionnel)
router.get('/typesTaches', getTypesTaches);
// /filter/evenements/occurence
router.get('/evenements/occurence', getEvenementsOccurence);

module.exports = router; 