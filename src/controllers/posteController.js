const Poste = require('../models/Poste');
const { validationResult } = require('express-validator');

// @desc    Obtenir tous les postes
// @route   GET /api/postes
// @access  Public (pour l'inscription)
exports.getPostes = async (req, res) => {
  try {
    const postes = await Poste.find({ actif: true })
      .populate('service', 'nom')
      .select('nom description niveau');

    res.json({
      success: true,
      count: postes.length,
      data: postes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des postes',
      error: error.message
    });
  }
};

// @desc    Obtenir un poste par ID
// @route   GET /api/postes/:id
// @access  Private
exports.getPoste = async (req, res) => {
  try {
    const poste = await Poste.findById(req.params.id)
      .populate('service', 'nom');

    if (!poste) {
      return res.status(404).json({
        success: false,
        message: 'Poste non trouvé'
      });
    }

    res.json({
      success: true,
      data: poste
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du poste',
      error: error.message
    });
  }
};

// @desc    Créer un nouveau poste
// @route   POST /api/postes
// @access  Private/Admin
exports.createPoste = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const poste = await Poste.create(req.body);

    res.status(201).json({
      success: true,
      data: poste
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du poste',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un poste
// @route   PUT /api/postes/:id
// @access  Private/Admin
exports.updatePoste = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const poste = await Poste.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!poste) {
      return res.status(404).json({
        success: false,
        message: 'Poste non trouvé'
      });
    }

    res.json({
      success: true,
      data: poste
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du poste',
      error: error.message
    });
  }
};

// @desc    Supprimer un poste
// @route   DELETE /api/postes/:id
// @access  Private/Admin
exports.deletePoste = async (req, res) => {
  try {
    const poste = await Poste.findByIdAndDelete(req.params.id);

    if (!poste) {
      return res.status(404).json({
        success: false,
        message: 'Poste non trouvé'
      });
    }

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du poste',
      error: error.message
    });
  }
}; 