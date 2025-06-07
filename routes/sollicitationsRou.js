const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

const SollicitationController = require('../controllers/sollicitationsCon');

// Obtenir toutes les sollicitations
router.get('/sollicitations',auth.authenticate, SollicitationController.getAll);

router.get('/sollicitations/responsable',auth.authenticate, SollicitationController.getAllForResponsable);

router.get('/sollicitations/service',auth.authenticate, SollicitationController.getAllForService);

router.get('/sollicitations/:id',auth.authenticate, SollicitationController.getById);

router.post('/sollicitations',auth.authenticate, SollicitationController.create);

router.put('/sollicitations/:id',auth.authenticate, SollicitationController.update);

router.delete('/sollicitations/:id',auth.authenticate, SollicitationController.delete);

module.exports = router;