const Discussion = require('../models/Discussion');

// Obtenir toutes les discussions
exports.getAll = async (req, res) => {
    try {
        const discussions = await Discussion.find()
            .populate('auteur', 'username profilePicture')
            .populate('participants', 'username profilePicture')
            .sort({ dateCreation: -1 });
        res.json(discussions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Créer une discussion
exports.create = async (req, res) => {
    try {
        const discussion = new Discussion({
            titre: req.body.titre,
            contenu: req.body.contenu,
            auteur: req.user.userId,
            participants: req.body.participants || [],
            documents: req.body.documents || [],
            images: req.body.images || []
        });
        await discussion.save();
        res.status(201).json(discussion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir une discussion par ID
exports.getById = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id)
            .populate('auteur', 'username profilePicture')
            .populate('participants', 'username profilePicture')
            .populate({
                path: 'messages',
                populate: {
                    path: 'auteur',
                    select: 'username profilePicture'
                }
            });
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion non trouvée' });
        }
        res.json(discussion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour une discussion
exports.update = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion non trouvée' });
        }

        if (discussion.auteur.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Non autorisé à modifier cette discussion' });
        }

        const updates = {
            titre: req.body.titre || discussion.titre,
            contenu: req.body.contenu || discussion.contenu
        };

        Object.assign(discussion, updates);
        await discussion.save();
        res.json(discussion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer une discussion
exports.delete = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion non trouvée' });
        }

        if (discussion.auteur.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Non autorisé à supprimer cette discussion' });
        }

        await discussion.deleteOne();
        res.json({ message: 'Discussion supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Rechercher des discussions
exports.search = async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const discussions = await Discussion.find({
            $or: [
                { titre: { $regex: keyword, $options: 'i' } },
                { contenu: { $regex: keyword, $options: 'i' } }
            ]
        })
        .populate('auteur', 'username profilePicture')
        .populate('participants', 'username profilePicture')
        .sort({ dateCreation: -1 });
        res.json(discussions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les messages
exports.getMessages = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id)
            .populate({
                path: 'messages',
                populate: {
                    path: 'auteur',
                    select: 'username profilePicture'
                }
            });
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion non trouvée' });
        }
        res.json(discussion.messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter un message
exports.addMessage = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion non trouvée' });
        }

        const message = {
            contenu: req.body.contenu,
            auteur: req.user.userId,
            dateCreation: new Date()
        };

        discussion.messages.push(message);
        await discussion.save();

        const populatedMessage = await Discussion.populate(discussion, {
            path: 'messages',
            match: { _id: discussion.messages[discussion.messages.length - 1]._id },
            populate: {
                path: 'auteur',
                select: 'username profilePicture'
            }
        });

        res.status(201).json(populatedMessage.messages[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un message
exports.deleteMessage = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion non trouvée' });
        }

        const message = discussion.messages.id(req.params.messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message non trouvé' });
        }

        if (message.auteur.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Non autorisé à supprimer ce message' });
        }

        message.remove();
        await discussion.save();
        res.json({ message: 'Message supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les participants
exports.getParticipants = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id)
            .populate('participants', 'username profilePicture');
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion non trouvée' });
        }
        res.json(discussion.participants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter un participant
exports.addParticipant = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion non trouvée' });
        }

        if (discussion.participants.includes(req.body.participantId)) {
            return res.status(400).json({ message: 'Le participant est déjà dans cette discussion' });
        }

        discussion.participants.push(req.body.participantId);
        await discussion.save();
        res.json(discussion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un participant
exports.removeParticipant = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion non trouvée' });
        }

        discussion.participants = discussion.participants.filter(
            participantId => participantId.toString() !== req.params.participantId
        );
        await discussion.save();
        res.json(discussion);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les documents
exports.getDocuments = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion non trouvée' });
        }
        res.json(discussion.documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter un document
exports.addDocument = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion non trouvée' });
        }
        discussion.documents.push(req.body);
        await discussion.save();
        res.status(201).json(discussion.documents[discussion.documents.length - 1]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un document
exports.deleteDocument = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion non trouvée' });
        }
        discussion.documents = discussion.documents.filter(doc => doc._id.toString() !== req.params.docId);
        await discussion.save();
        res.json({ message: 'Document supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les images
exports.getImages = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion non trouvée' });
        }
        res.json(discussion.images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter une image
exports.addImage = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion non trouvée' });
        }
        discussion.images.push(req.body);
        await discussion.save();
        res.status(201).json(discussion.images[discussion.images.length - 1]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer une image
exports.deleteImage = async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id);
        if (!discussion) {
            return res.status(404).json({ message: 'Discussion non trouvée' });
        }
        discussion.images = discussion.images.filter(img => img._id.toString() !== req.params.imageId);
        await discussion.save();
        res.json({ message: 'Image supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 