const Tache = require('../models/Tache');

// Obtenir toutes les tâches
exports.getAll = async (req, res) => {
    try {
        const taches = await Tache.find()
            .populate('responsable', 'username profilePicture')
            .populate('projet', 'titre')
            .sort({ dateEcheance: 1 });
        res.json(taches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Créer une tâche
exports.create = async (req, res) => {
    try {
        const tache = new Tache({
            titre: req.body.titre,
            description: req.body.description,
            dateDebut: req.body.dateDebut,
            dateEcheance: req.body.dateEcheance,
            statut: req.body.statut || 'à faire',
            priorite: req.body.priorite || 'moyenne',
            responsable: req.body.responsableId,
            projet: req.body.projetId,
            parent: req.body.parentId
        });
        await tache.save();
        res.status(201).json(tache);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir une tâche par ID
exports.getById = async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id)
            .populate('responsable', 'username profilePicture')
            .populate('projet', 'titre')
            .populate('parent', 'titre');
        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        res.json(tache);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour une tâche
exports.update = async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id);
        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }

        const updates = {
            titre: req.body.titre || tache.titre,
            description: req.body.description || tache.description,
            dateDebut: req.body.dateDebut || tache.dateDebut,
            dateEcheance: req.body.dateEcheance || tache.dateEcheance,
            statut: req.body.statut || tache.statut,
            priorite: req.body.priorite || tache.priorite,
            responsable: req.body.responsableId || tache.responsable,
            projet: req.body.projetId || tache.projet,
            parent: req.body.parentId || tache.parent
        };

        Object.assign(tache, updates);
        await tache.save();
        res.json(tache);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer une tâche
exports.delete = async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id);
        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        await tache.deleteOne();
        res.json({ message: 'Tâche supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Rechercher des tâches
exports.search = async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const taches = await Tache.find({
            $or: [
                { titre: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]
        })
        .populate('responsable', 'username profilePicture')
        .populate('projet', 'titre')
        .sort({ dateEcheance: 1 });
        res.json(taches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Filtrer des tâches
exports.filter = async (req, res) => {
    try {
        const { dateDebut, dateEcheance, statut, priorite, responsable, projet } = req.query;
        let query = {};

        if (dateDebut) query.dateDebut = new Date(dateDebut);
        if (dateEcheance) query.dateEcheance = new Date(dateEcheance);
        if (statut) query.statut = statut;
        if (priorite) query.priorite = priorite;
        if (responsable) query.responsable = responsable;
        if (projet) query.projet = projet;

        const taches = await Tache.find(query)
            .populate('responsable', 'username profilePicture')
            .populate('projet', 'titre')
            .sort({ dateEcheance: 1 });
        res.json(taches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les sous-tâches
exports.getSousTaches = async (req, res) => {
    try {
        const sousTaches = await Tache.find({ parent: req.params.id })
            .populate('responsable', 'username profilePicture')
            .sort({ dateEcheance: 1 });
        res.json(sousTaches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter une sous-tâche
exports.addSousTache = async (req, res) => {
    try {
        const tache = new Tache({
            titre: req.body.titre,
            description: req.body.description,
            dateDebut: req.body.dateDebut,
            dateEcheance: req.body.dateEcheance,
            statut: req.body.statut || 'à faire',
            priorite: req.body.priorite || 'moyenne',
            responsable: req.body.responsableId,
            projet: req.body.projetId,
            parent: req.params.id
        });
        await tache.save();
        res.status(201).json(tache);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les documents
exports.getDocuments = async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id);
        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        res.json(tache.documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter un document
exports.addDocument = async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id);
        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        tache.documents.push(req.body);
        await tache.save();
        res.status(201).json(tache.documents[tache.documents.length - 1]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un document
exports.deleteDocument = async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id);
        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        tache.documents = tache.documents.filter(doc => doc._id.toString() !== req.params.docId);
        await tache.save();
        res.json({ message: 'Document supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les images
exports.getImages = async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id);
        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        res.json(tache.images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter une image
exports.addImage = async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id);
        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        tache.images.push(req.body);
        await tache.save();
        res.status(201).json(tache.images[tache.images.length - 1]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer une image
exports.deleteImage = async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id);
        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        tache.images = tache.images.filter(img => img._id.toString() !== req.params.imageId);
        await tache.save();
        res.json({ message: 'Image supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les discussions
exports.getDiscussions = async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id)
            .populate({
                path: 'discussions',
                populate: {
                    path: 'auteur',
                    select: 'username profilePicture'
                }
            });
        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        res.json(tache.discussions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter une discussion
exports.addDiscussion = async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id);
        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        const discussion = {
            contenu: req.body.contenu,
            auteur: req.user.userId
        };
        tache.discussions.push(discussion);
        await tache.save();
        res.status(201).json(tache.discussions[tache.discussions.length - 1]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les responsables
exports.getResponsables = async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id)
            .populate('responsables', 'username profilePicture');
        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        res.json(tache.responsables);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter un responsable
exports.addResponsable = async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id);
        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        if (tache.responsables.includes(req.body.responsableId)) {
            return res.status(400).json({ message: 'Le responsable est déjà assigné à cette tâche' });
        }
        tache.responsables.push(req.body.responsableId);
        await tache.save();
        res.json(tache);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un responsable
exports.removeResponsable = async (req, res) => {
    try {
        const tache = await Tache.findById(req.params.id);
        if (!tache) {
            return res.status(404).json({ message: 'Tâche non trouvée' });
        }
        tache.responsables = tache.responsables.filter(
            responsableId => responsableId.toString() !== req.params.responsableId
        );
        await tache.save();
        res.json(tache);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 