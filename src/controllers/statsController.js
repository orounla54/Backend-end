const User = require('../models/User');
const Tache = require('../models/Tache');
const Projet = require('../models/Projet');
const Service = require('../models/Service');
const Evenement = require('../models/Evenement');
const Discussion = require('../models/Discussion');

// @desc    Obtenir les statistiques générales
// @route   GET /api/stats/general
// @access  Private/Admin
exports.getGeneralStats = async (req, res) => {
  try {
    // Statistiques des utilisateurs
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ statut: 'actif' });
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Statistiques des tâches
    const totalTaches = await Tache.countDocuments();
    const tachesByStatus = await Tache.aggregate([
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);
    const tachesByType = await Tache.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Statistiques des projets
    const totalProjets = await Projet.countDocuments();
    const projetsByStatus = await Projet.aggregate([
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);

    // Statistiques des services
    const totalServices = await Service.countDocuments();
    const servicesByType = await Service.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Statistiques des événements
    const totalEvenements = await Evenement.countDocuments();
    const evenementsByType = await Evenement.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Statistiques des discussions
    const totalDiscussions = await Discussion.countDocuments();
    const discussionsByType = await Discussion.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        utilisateurs: {
          total: totalUsers,
          actifs: activeUsers,
          parRole: usersByRole
        },
        taches: {
          total: totalTaches,
          parStatut: tachesByStatus,
          parType: tachesByType
        },
        projets: {
          total: totalProjets,
          parStatut: projetsByStatus
        },
        services: {
          total: totalServices,
          parType: servicesByType
        },
        evenements: {
          total: totalEvenements,
          parType: evenementsByType
        },
        discussions: {
          total: totalDiscussions,
          parType: discussionsByType
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// @desc    Obtenir les statistiques d'un service
// @route   GET /api/stats/service/:id
// @access  Private
exports.getServiceStats = async (req, res) => {
  try {
    const serviceId = req.params.id;

    // Vérifier si le service existe
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    // Statistiques des membres
    const totalMembres = await User.countDocuments({ service: serviceId });
    const membresByRole = await User.aggregate([
      { $match: { service: serviceId } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Statistiques des tâches
    const tachesByStatus = await Tache.aggregate([
      { $match: { service: serviceId } },
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);

    // Statistiques des projets
    const projetsByStatus = await Projet.aggregate([
      { $match: { service: serviceId } },
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);

    // Statistiques des événements
    const evenementsByType = await Evenement.aggregate([
      { $match: { service: serviceId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Statistiques des discussions
    const discussionsByType = await Discussion.aggregate([
      { $match: { service: serviceId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        service: {
          nom: service.nom,
          type: service.type
        },
        membres: {
          total: totalMembres,
          parRole: membresByRole
        },
        taches: {
          parStatut: tachesByStatus
        },
        projets: {
          parStatut: projetsByStatus
        },
        evenements: {
          parType: evenementsByType
        },
        discussions: {
          parType: discussionsByType
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques du service',
      error: error.message
    });
  }
};

// @desc    Obtenir les statistiques d'un utilisateur
// @route   GET /api/stats/user/:id
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.params.id;

    // Vérifier si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Statistiques des tâches
    const tachesByStatus = await Tache.aggregate([
      { $match: { responsable: userId } },
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);

    // Statistiques des projets
    const projetsByStatus = await Projet.aggregate([
      { $match: { chef: userId } },
      { $group: { _id: '$statut', count: { $sum: 1 } } }
    ]);

    // Statistiques des événements
    const evenementsByType = await Evenement.aggregate([
      { $match: { organisateur: userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Statistiques des discussions
    const discussionsByType = await Discussion.aggregate([
      { $match: { auteur: userId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        utilisateur: {
          nom: user.nom,
          prenom: user.prenom,
          role: user.role
        },
        taches: {
          parStatut: tachesByStatus
        },
        projets: {
          parStatut: projetsByStatus
        },
        evenements: {
          parType: evenementsByType
        },
        discussions: {
          parType: discussionsByType
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques de l\'utilisateur',
      error: error.message
    });
  }
};

exports.getIndicateurDPResponsable = async (req, res) => {
  try {
    const { keyword, dateDebut, dateFin } = req.query;
    // Logique pour récupérer les indicateurs du responsable
    const indicateurs = {
      totalTaches: 0,
      tachesTerminees: 0,
      tachesEnCours: 0,
      tauxCompletion: 0
    };
    res.json({ success: true, data: indicateurs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des indicateurs responsable', error: error.message });
  }
};

exports.getIndicateurDPContributeur = async (req, res) => {
  try {
    const { keyword, dateDebut, dateFin } = req.query;
    // Logique pour récupérer les indicateurs du contributeur
    const indicateurs = {
      totalContributions: 0,
      contributionsApprouvees: 0,
      contributionsEnAttente: 0,
      tauxApprobation: 0
    };
    res.json({ success: true, data: indicateurs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de la récupération des indicateurs contributeur', error: error.message });
  }
}; 