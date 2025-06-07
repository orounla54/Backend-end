const express = require('express');
const router = express.Router();
const Poste = require('../models/Poste');

router.get('/', async (req, res) => {
  try {
    const postes = await Poste.find();
    res.json(postes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;