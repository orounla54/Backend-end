const Discussion = require('../models/Discussion');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Obtenir toutes les discussions
// @route   GET /api/discussions
// @access  Private
exports.getDiscussions = async (req, res) => {
  try {
    // Construire la requête
    let query = Discussion.find()
      .populate('auteur', 'nom prenom email')
      .populate('participants', 'nom prenom email')
      .populate('service', 'nom');

    // Filtres
    if (req.query.type) {
      query = query.where('type').equals(req.query.type);
    }
    if (req.query.service) {
      query = query.where('service').equals(req.query.service);
    }
    if (req.query.auteur) {
      query = query.where('auteur').equals(req.query.auteur);
    }
    if (req.query.statut) {
      query = query.where('statut').equals(req.query.statut);
    }

    // Recherche par mot-clé
    if (req.query.search) {
      query = query.find({
        $or: [
          { titre: { $regex: req.query.search, $options: 'i' } },
          { contenu: { $regex: req.query.search, $options: 'i' } }
        ]
      });
    }

    // Tri
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-dateCreation');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Discussion.countDocuments(query);

    query = query.skip(startIndex).limit(limit);

    // Exécuter la requête
    const discussions = await query;

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.json({
      success: true,
      count: discussions.length,
      pagination,
      data: discussions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des discussions',
      error: error.message
    });
  }
};

// @desc    Obtenir une discussion par ID
// @route   GET /api/discussions/:id
// @access  Private
exports.getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('auteur', 'nom prenom email')
      .populate('participants', 'nom prenom email')
      .populate('service', 'nom')
      .populate('reponses.auteur', 'nom prenom email');

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion non trouvée'
      });
    }

    res.json({
      success: true,
      data: discussion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la discussion',
      error: error.message
    });
  }
};

// @desc    Créer une nouvelle discussion
// @route   POST /api/discussions
// @access  Private
exports.createDiscussion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Ajouter l'utilisateur connecté comme auteur
    req.body.auteur = req.user.id;

    // Ajouter l'auteur comme participant
    if (!req.body.participants) {
      req.body.participants = [req.user.id];
    } else if (!req.body.participants.includes(req.user.id)) {
      req.body.participants.push(req.user.id);
    }

    const discussion = await Discussion.create(req.body);

    res.status(201).json({
      success: true,
      data: discussion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la discussion',
      error: error.message
    });
  }
};

// @desc    Mettre à jour une discussion
// @route   PUT /api/discussions/:id
// @access  Private
exports.updateDiscussion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion non trouvée'
      });
    }

    // Vérifier si l'utilisateur est l'auteur ou un admin
    if (discussion.auteur.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cette discussion'
      });
    }

    discussion = await Discussion.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: discussion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la discussion',
      error: error.message
    });
  }
};

// @desc    Supprimer une discussion
// @route   DELETE /api/discussions/:id
// @access  Private
exports.deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion non trouvée'
      });
    }

    // Vérifier si l'utilisateur est l'auteur ou un admin
    if (discussion.auteur.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cette discussion'
      });
    }

    await discussion.remove();

    res.json({
      success: true,
      message: 'Discussion supprimée avec succès'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la discussion',
      error: error.message
    });
  }
};

// @desc    Ajouter une réponse à la discussion
// @route   POST /api/discussions/:id/reponses
// @access  Private
exports.addReponse = async (req, res) => {
  try {
    const { contenu } = req.body;

    if (!contenu) {
      return res.status(400).json({
        success: false,
        message: 'Le contenu de la réponse est requis'
      });
    }

    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion non trouvée'
      });
    }

    discussion.reponses.push({
      auteur: req.user.id,
      contenu
    });

    // Ajouter l'auteur de la réponse comme participant s'il ne l'est pas déjà
    if (!discussion.participants.includes(req.user.id)) {
      discussion.participants.push(req.user.id);
    }

    await discussion.save();

    res.json({
      success: true,
      data: discussion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout de la réponse',
      error: error.message
    });
  }
};

// @desc    Ajouter un participant à la discussion
// @route   POST /api/discussions/:id/participants
// @access  Private
exports.addParticipant = async (req, res) => {
  try {
    const { participantId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'L\'ID du participant est requis'
      });
    }

    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'Discussion non trouvée'
      });
    }

    // Vérifier si l'utilisateur est l'auteur ou un admin
    if (discussion.auteur.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier les participants'
      });
    }

    // Vérifier si le participant existe déjà
    if (discussion.participants.includes(participantId)) {
      return res.status(400).json({
        success: false,
        message: 'Le participant est déjà ajouté à cette discussion'
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findById(participantId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    discussion.participants.push(participantId);
    await discussion.save();

    res.json({
      success: true,
      data: discussion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du participant',
      error: error.message
    });
  }
};

// @desc    Récupérer les médias d'une discussion
// @route   GET /api/discussions/:id/media
// @access  Private
exports.getDiscussionMedia = async (req, res) => {
  try {
    const { id } = req.params;
    // Pour l'instant, retourner un tableau vide (à adapter selon ton modèle de médias)
    const media = []; // Ici tu peux ajouter la logique pour récupérer les médias depuis ta DB
    res.json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des médias', error: error.message });
  }
};

// @desc    Uploader un nouveau média
// @route   POST /api/discussions/:id/media
// @access  Private
exports.uploadNewMedia = async (req, res) => {
  try {
    // Logique pour uploader un nouveau média
    // Ici tu peux ajouter la logique pour sauvegarder le fichier
    const mediaData = {
      id: Date.now(),
      filename: req.body.filename || 'media.jpg',
      url: '/uploads/media.jpg',
      type: req.body.type || 'image'
    };
    res.json({ success: true, data: mediaData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'upload du média', error: error.message });
  }
}; 