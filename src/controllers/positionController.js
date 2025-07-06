const Position = require('../models/Position');
const { validationResult } = require('express-validator');

// @desc    Obtenir toutes les positions
// @route   GET /api/positions
// @access  Public (pour l'inscription)
exports.getPositions = async (req, res) => {
  try {
    const positions = await Position.find({ actif: true })
      .populate('service', 'nom')
      .select('nom description niveau');

    res.json({
      success: true,
      count: positions.length,
      data: positions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des positions',
      error: error.message
    });
  }
};

// @desc    Obtenir une position par ID
// @route   GET /api/positions/:id
// @access  Private
exports.getPosition = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id)
      .populate('service', 'nom');

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position non trouvée'
      });
    }

    res.json({
      success: true,
      data: position
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la position',
      error: error.message
    });
  }
};

// @desc    Créer une nouvelle position
// @route   POST /api/positions
// @access  Private/Admin
exports.createPosition = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const position = await Position.create(req.body);

    res.status(201).json({
      success: true,
      data: position
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la position',
      error: error.message
    });
  }
};

// @desc    Mettre à jour une position
// @route   PUT /api/positions/:id
// @access  Private/Admin
exports.updatePosition = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const position = await Position.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position non trouvée'
      });
    }

    res.json({
      success: true,
      data: position
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la position',
      error: error.message
    });
  }
};

// @desc    Supprimer une position
// @route   DELETE /api/positions/:id
// @access  Private/Admin
exports.deletePosition = async (req, res) => {
  try {
    const position = await Position.findByIdAndDelete(req.params.id);

    if (!position) {
      return res.status(404).json({
        success: false,
        message: 'Position non trouvée'
      });
    }

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la position',
      error: error.message
    });
  }
}; 