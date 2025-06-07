const express = require('express');
const router = express.Router();
const Position = require('../models/Position');

router.get('/', async (req, res) => {
  try {
    const positions = await Position.find();
    res.json(positions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;