const Projet = require('../models/Projet');

// Obtenir tous les projets
exports.getAll = async (req, res) => {
    try {
        const projets = await Projet.find()
            .populate('type', 'nom')
            .populate('responsable', 'username profilePicture')
            .populate('equipe', 'username profilePicture')
            .sort({ dateDebut: -1 });
        res.json(projets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Créer un projet
exports.create = async (req, res) => {
    try {
        console.log("Données reçues:", req.body); // Log pour déboguer
        
        // Validation des champs requis
        if (!req.body.responsable) {
            return res.status(400).json({ 
                message: "Le responsable est requis",
                details: "Veuillez sélectionner un responsable"
            });
        }

        const projet = new Projet({
            nom: req.body.nom,
            description: req.body.description,
            dateDebut: req.body.dateDebut,
            dateFin: req.body.dateFin,
            responsable: req.body.responsable,
            type: req.body.type,
            statut: req.body.statut || 'planifie',
            budget: {
                prevu: req.body.budget || 0,
                realise: 0,
                devise: 'EUR'
            },
            progression: req.body.progression || 0,
            equipe: req.body.equipe || [],
            documents: req.body.documents || [],
            images: req.body.images || []
        });

        console.log("Projet à créer:", projet); // Log pour déboguer
        const savedProjet = await projet.save();
        console.log("Projet créé:", savedProjet); // Log pour déboguer
        res.status(201).json(savedProjet);
    } catch (error) {
        console.error("Erreur lors de la création du projet:", error); // Log pour déboguer
        res.status(500).json({ 
            message: "Erreur lors de la création du projet",
            details: error.message 
        });
    }
};

// Obtenir un projet par ID
exports.getById = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id)
            .populate('type', 'nom')
            .populate('responsable', 'username profilePicture')
            .populate('equipe', 'username profilePicture')
            .populate('commentaires.auteur', 'username profilePicture');
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        res.json(projet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un projet
exports.update = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        const updates = {
            nom: req.body.nom || projet.nom,
            description: req.body.description || projet.description,
            dateDebut: req.body.dateDebut || projet.dateDebut,
            dateFin: req.body.dateFin || projet.dateFin,
            responsable: req.body.responsable || projet.responsable,
            type: req.body.type || projet.type,
            statut: req.body.statut || projet.statut,
            budget: {
                prevu: req.body.budget || projet.budget?.prevu || 0,
                realise: projet.budget?.realise || 0,
                devise: projet.budget?.devise || 'EUR'
            },
            progression: req.body.progression || projet.progression
        };

        Object.assign(projet, updates);
        const updatedProjet = await projet.save();
        res.json(updatedProjet);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du projet:", error); // Log pour déboguer
        res.status(500).json({ 
            message: "Erreur lors de la mise à jour du projet",
            details: error.message 
        });
    }
};

// Supprimer un projet
exports.delete = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        await projet.deleteOne();
        res.json({ message: 'Projet supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Rechercher des projets
exports.search = async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const projets = await Projet.find({
            $or: [
                { nom: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]
        })
        .populate('type', 'nom')
        .populate('responsable', 'username profilePicture')
        .populate('equipe', 'username profilePicture')
        .sort({ dateDebut: -1 });
        res.json(projets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Filtrer des projets
exports.filter = async (req, res) => {
    try {
        const { keyword, dateDebut, dateFin, type, statut, responsable } = req.query;
        let query = {};

        if (keyword) {
            query.$or = [
                { nom: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (dateDebut) {
            const debutDate = new Date(dateDebut);
            if (!isNaN(debutDate.getTime())) {
                query.dateDebut = { $gte: debutDate };
            }
        }

        if (dateFin) {
            const finDate = new Date(dateFin);
            if (!isNaN(finDate.getTime())) {
                finDate.setHours(23, 59, 59, 999);
                query.dateFin = { $lte: finDate };
            }
        }

        if (type) query.type = type;
        if (statut) query.statut = statut;
        if (responsable) query.responsable = responsable;

        console.log("Requête de filtrage:", query);

        const projets = await Projet.find(query)
            .populate('type', 'nom')
            .populate('responsable', 'username profilePicture')
            .populate('equipe', 'username profilePicture')
            .sort({ dateDebut: -1 });

        const projetsFormattes = projets.map(projet => ({
            ...projet.toObject(),
            dateDebut: projet.dateDebut ? projet.dateDebut.toISOString().split('T')[0] : null,
            dateFin: projet.dateFin ? projet.dateFin.toISOString().split('T')[0] : null
        }));

        console.log("Nombre de projets trouvés:", projetsFormattes.length);
        res.json(projetsFormattes);
    } catch (error) {
        console.error("Erreur lors du filtrage des projets:", error);
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les documents
exports.getDocuments = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        res.json(projet.documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter un document
exports.addDocument = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        projet.documents.push(req.body);
        await projet.save();
        res.status(201).json(projet.documents[projet.documents.length - 1]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un document
exports.deleteDocument = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        projet.documents = projet.documents.filter(doc => doc._id.toString() !== req.params.docId);
        await projet.save();
        res.json({ message: 'Document supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les images
exports.getImages = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        res.json(projet.images);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter une image
exports.addImage = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        projet.images.push(req.body);
        await projet.save();
        res.status(201).json(projet.images[projet.images.length - 1]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer une image
exports.deleteImage = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        projet.images = projet.images.filter(img => img._id.toString() !== req.params.imageId);
        await projet.save();
        res.json({ message: 'Image supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les tâches
exports.getTaches = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id)
            .populate({
                path: 'taches',
                populate: {
                    path: 'responsable',
                    select: 'username profilePicture'
                }
            });
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        res.json(projet.taches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter une tâche
exports.addTache = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        projet.taches.push(req.body);
        await projet.save();
        res.status(201).json(projet.taches[projet.taches.length - 1]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les membres de l'équipe
exports.getEquipe = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id)
            .populate('equipe', 'username profilePicture');
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        res.json(projet.equipe);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter un membre à l'équipe
exports.addMembreEquipe = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        if (projet.equipe.includes(req.body.membreId)) {
            return res.status(400).json({ message: 'Le membre est déjà dans l\'équipe' });
        }
        projet.equipe.push(req.body.membreId);
        await projet.save();
        res.json(projet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un membre de l'équipe
exports.removeMembreEquipe = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        projet.equipe = projet.equipe.filter(
            membreId => membreId.toString() !== req.params.membreId
        );
        await projet.save();
        res.json(projet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les commentaires
exports.getCommentaires = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id)
            .populate('commentaires.auteur', 'username profilePicture');
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        res.json(projet.commentaires);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter un commentaire
exports.addCommentaire = async (req, res) => {
    try {
        const projet = await Projet.findById(req.params.id);
        if (!projet) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        projet.commentaires.push({
            auteur: req.user.userId,
            contenu: req.body.contenu
        });
        await projet.save();
        res.status(201).json(projet.commentaires[projet.commentaires.length - 1]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 