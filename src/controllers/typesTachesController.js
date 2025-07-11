const TypeTache = require('../models/TypeTache');

exports.getTypesTaches = async (req, res) => {
  try {
    const types = await TypeTache.find();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 