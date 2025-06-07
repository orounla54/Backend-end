const Evenement = require('../models/Evenement');

// Obtenir tous les événements
exports.getAll = async (req, res) => {
    try {
        const evenements = await Evenement.find()
            .populate('categorie', 'nom')
            .populate('organisateur', 'username profilePicture')
            .sort({ dateDebut: 1 });
        res.json(evenements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Créer un événement
exports.create = async (req, res) => {
    try {
        const evenement = new Evenement({
            titre: req.body.titre,
            description: req.body.description,
            dateDebut: req.body.dateDebut,
            dateFin: req.body.dateFin,
            lieu: req.body.lieu,
            categorie: req.body.categorieId,
            organisateur: req.user.userId,
            participants: req.body.participants || [],
            documents: req.body.documents || [],
            images: req.body.images || []
        });
        await evenement.save();
        res.status(201).json(evenement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un événement par ID
exports.getById = async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id)
            .populate('categorie', 'nom')
            .populate('organisateur', 'username profilePicture')
            .populate('participants', 'username profilePicture');
        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        res.json(evenement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un événement
exports.update = async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id);
        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        const updates = {
            titre: req.body.titre || evenement.titre,
            description: req.body.description || evenement.description,
            dateDebut: req.body.dateDebut || evenement.dateDebut,
            dateFin: req.body.dateFin || evenement.dateFin,
            lieu: req.body.lieu || evenement.lieu,
            categorie: req.body.categorieId || evenement.categorie
        };

        Object.assign(evenement, updates);
        await evenement.save();
        res.json(evenement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un événement
exports.delete = async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id);
        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        await evenement.deleteOne();
        res.json({ message: 'Événement supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Rechercher des événements
exports.search = async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const evenements = await Evenement.find({
            $or: [
                { titre: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
                { lieu: { $regex: keyword, $options: 'i' } }
            ]
        })
        .populate('categorie', 'nom')
        .populate('organisateur', 'username profilePicture')
        .sort({ dateDebut: 1 });
        res.json(evenements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Filtrer des événements
exports.filter = async (req, res) => {
    try {
        const { dateDebut, dateFin, categorie, organisateur } = req.query;
        let query = {};

        if (dateDebut) query.dateDebut = { $gte: new Date(dateDebut) };
        if (dateFin) query.dateFin = { $lte: new Date(dateFin) };
        if (categorie) query.categorie = categorie;
        if (organisateur) query.organisateur = organisateur;

        const evenements = await Evenement.find(query)
            .populate('categorie', 'nom')
            .populate('organisateur', 'username profilePicture')
            .sort({ dateDebut: 1 });
        res.json(evenements);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les participants
exports.getParticipants = async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id)
            .populate('participants', 'username profilePicture');
        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        res.json(evenement.participants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter un participant
exports.addParticipant = async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id);
        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        if (evenement.participants.includes(req.body.participantId)) {
            return res.status(400).json({ message: 'Le participant est déjà inscrit à cet événement' });
        }
        evenement.participants.push(req.body.participantId);
        await evenement.save();
        res.json(evenement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un participant
exports.removeParticipant = async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id);
        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        evenement.participants = evenement.participants.filter(
            participantId => participantId.toString() !== req.params.participantId
        );
        await evenement.save();
        res.json(evenement);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les documents
exports.getDocuments = async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id);
        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        res.json(evenement.documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter un document
exports.addDocument = async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id);
        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        evenement.documents.push(req.body);
        await evenement.save();
        res.status(201).json(evenement.documents[evenement.documents.length - 1]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un document
exports.deleteDocument = async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id);
        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        evenement.documents = evenement.documents.filter(doc => doc._id.toString() !== req.params.docId);
        await evenement.save();
        res.json({ message: 'Document supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les images
exports.getImages = async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id);
        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        res.json(evenement.images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter une image
exports.addImage = async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id);
        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        evenement.images.push(req.body);
        await evenement.save();
        res.status(201).json(evenement.images[evenement.images.length - 1]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer une image
exports.deleteImage = async (req, res) => {
    try {
        const evenement = await Evenement.findById(req.params.id);
        if (!evenement) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        evenement.images = evenement.images.filter(img => img._id.toString() !== req.params.imageId);
        await evenement.save();
        res.json({ message: 'Image supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 