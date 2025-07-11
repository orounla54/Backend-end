const express = require('express');
const router = express.Router();
const { getPositions } = require('../controllers/positionsController');

router.get('/', getPositions);

// Route publique pour les positions
router.get('/public', getPositions);

module.exports = router; 