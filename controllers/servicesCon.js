const Service = require('../models/Service');

// Obtenir tous les services
exports.getAll = async (req, res) => {
    try {
        const services = await Service.find()
            .populate('chef', 'username profilePicture')
            .populate('membres', 'username profilePicture')
            .sort({ nom: 1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Créer un service
exports.create = async (req, res) => {
    try {
        const service = new Service({
            nom: req.body.nom,
            description: req.body.description,
            chef: req.body.chefId,
            membres: req.body.membres || []
        });
        await service.save();
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir un service par ID
exports.getById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('chef', 'username profilePicture')
            .populate('membres', 'username profilePicture');
        if (!service) {
            return res.status(404).json({ message: 'Service non trouvé' });
        }
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mettre à jour un service
exports.update = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service non trouvé' });
        }

        const updates = {
            nom: req.body.nom || service.nom,
            description: req.body.description || service.description,
            chef: req.body.chefId || service.chef
        };

        Object.assign(service, updates);
        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un service
exports.delete = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service non trouvé' });
        }
        await service.deleteOne();
        res.json({ message: 'Service supprimé' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Rechercher des services
exports.search = async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const services = await Service.find({
            $or: [
                { nom: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ]
        })
        .populate('chef', 'username profilePicture')
        .populate('membres', 'username profilePicture')
        .sort({ nom: 1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les membres
exports.getMembres = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('membres', 'username profilePicture');
        if (!service) {
            return res.status(404).json({ message: 'Service non trouvé' });
        }
        res.json(service.membres);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter un membre
exports.addMembre = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service non trouvé' });
        }
        if (service.membres.includes(req.body.membreId)) {
            return res.status(400).json({ message: 'Le membre est déjà dans ce service' });
        }
        service.membres.push(req.body.membreId);
        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un membre
exports.removeMembre = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service non trouvé' });
        }
        service.membres = service.membres.filter(
            membreId => membreId.toString() !== req.params.membreId
        );
        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir les responsables
exports.getResponsables = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('chef', 'username profilePicture');
        if (!service) {
            return res.status(404).json({ message: 'Service non trouvé' });
        }
        res.json([service.chef]); // Retourne le chef comme responsable
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter un responsable
exports.addResponsable = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service non trouvé' });
        }
        service.chef = req.body.responsableId;
        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer un responsable
exports.removeResponsable = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service non trouvé' });
        }
        service.chef = null;
        await service.save();
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Filtrer les services
exports.filter = async (req, res) => {
    try {
        const { statut, chef } = req.query;
        const query = {};
        
        if (statut) query.statut = statut;
        if (chef) query.chef = chef;

        const services = await Service.find(query)
            .populate('chef', 'username profilePicture')
            .populate('membres', 'username profilePicture')
            .sort({ nom: 1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir tous les services pour mise à jour
exports.getAllForUpdate = async (req, res) => {
    try {
        const services = await Service.find()
            .select('nom chef')
            .populate('chef', 'username')
            .sort({ nom: 1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtenir le journal des responsables
exports.getServiceRespLog = async (req, res) => {
    try {
        const services = await Service.find()
            .select('nom chef')
            .populate({
                path: 'chef',
                select: 'username profilePicture',
                populate: {
                    path: 'profilePicture',
                    select: 'url'
                }
            })
            .sort({ nom: 1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 