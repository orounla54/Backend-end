const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const repertoiresController = require('../controllers/repertoiresCon');

// Ajouter une nouvelle sous tache
router.post('/repertoires', auth.authenticate, repertoiresController.create);

router.get('/repertoires', auth.authenticate, repertoiresController.getAll);

module.exports = router;