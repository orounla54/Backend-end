const express = require('express');
const router = express.Router();
const TypeTache = require('../models/TypeTache');

// GET /api/typesTaches
router.get('/', async (req, res) => {
  try {
    const types = await TypeTache.find();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/typesTaches/filter (pour compatibilité frontend)
router.get('/filter', async (req, res) => {
  try {
    const types = await TypeTache.find();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 