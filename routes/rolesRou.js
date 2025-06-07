const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Role = require('../models/Role');

const rolesController = require('../controllers/rolesCon');

//#####  #### #### liste des methodes Table 1: Roles
// Obtenir une nouvelle 
router.get('/roles', auth.protect, rolesController.getAll);

router.get('/roles/:id', auth.protect, rolesController.getById);

router.post('/roles', auth.protect, rolesController.create);

router.put('/roles/:id', auth.protect, rolesController.update);

router.delete('/roles/:id', auth.protect, rolesController.delete);


//#####  #### #### liste des methodes Table 2: Roles Plans
router.get('/rolesPlan', auth.protect, rolesController.getAllRolesPlans);

router.get('/rolesPlan/:id', auth.protect, rolesController.getByIdRolesPlans);

router.post('/rolesPlan', auth.protect, rolesController.createRolesPlans);

router.put('/rolesPlan/:id', auth.protect, rolesController.updateRolesPlans);

router.delete('/rolesPlan/:id', auth.protect, rolesController.deleteRolesPlans);

// Créer un rôle
router.post("/", auth.protect, async (req, res) => {
    try {
        const role = new Role({
            nom: req.body.nom,
            description: req.body.description,
            permissions: req.body.permissions,
            niveau: req.body.niveau
        });
        await role.save();
        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir tous les rôles
router.get("/", auth.protect, async (req, res) => {
    try {
        const roles = await Role.find()
            .sort({ niveau: 1 });
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtenir un rôle spécifique
router.get("/:id", auth.protect, async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: "Rôle non trouvé" });
        }
        res.json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour un rôle
router.put("/:id", auth.protect, async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: "Rôle non trouvé" });
        }

        const updates = {
            nom: req.body.nom || role.nom,
            description: req.body.description || role.description,
            permissions: req.body.permissions || role.permissions,
            niveau: req.body.niveau || role.niveau
        };

        Object.assign(role, updates);
        await role.save();
        res.json(role);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Supprimer un rôle
router.delete("/:id", auth.protect, async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: "Rôle non trouvé" });
        }
        await role.deleteOne();
        res.json({ message: "Rôle supprimé" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;