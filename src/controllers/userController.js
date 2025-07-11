const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// @desc    Créer un nouveau responsable
// @route   POST /api/users/responsable/nouveau
// @access  Public
exports.createResponsable = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Données invalides',
        errors: errors.array() 
      });
    }

    const { nom, prenom, email, password, departement, idService, idPoste, idPosition } = req.body;

    // Vérification des champs obligatoires
    if (!nom || !prenom || !email || !password || !departement || !idService || !idPoste || !idPosition) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont obligatoires (nom, prenom, email, password, departement, service, poste, position)'
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà'
      });
    }

    // Créer le responsable
    const responsable = await User.create({
      nom,
      prenom,
      email,
      password: password,
      departement,
      service: idService,
      poste: idPoste,
      position: idPosition,
      role: 'responsable',
      actif: false // Doit être validé par un admin
    });

    res.status(201).json({
      success: true,
      message: 'Responsable créé avec succès. Votre compte sera activé après validation par un administrateur.',
      responsableId: responsable._id
    });

  } catch (error) {
    console.error('Erreur lors de la création du responsable:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du responsable',
      error: error.message
    });
  }
};

// @desc    Obtenir tous les utilisateurs actifs (route publique)
// @route   GET /api/users/actifs
// @access  Public
exports.getUsersActifs = async (req, res) => {
  try {
    const users = await User.find()
      .select('nom prenom email role')
      .populate('service', 'nom')
      .populate('poste', 'nom')
      .populate('position', 'nom');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('service', 'nom')
      .populate('poste', 'nom')
      .populate('position', 'nom');

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs',
      error: error.message
    });
  }
};

// @desc    Obtenir un utilisateur
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('service', 'nom')
      .populate('poste', 'nom')
      .populate('position', 'nom');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'utilisateur',
      error: error.message
    });
  }
};

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'utilisateur',
      error: error.message
    });
  }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'utilisateur',
      error: error.message
    });
  }
};

// @desc    Mettre à jour son profil
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Ne pas permettre la modification du rôle
    if (req.body.role) {
      delete req.body.role;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
}; 