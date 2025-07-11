const express = require('express');
const router = express.Router();
const { getTypesTaches } = require('../controllers/typesTachesController');

router.get('/', getTypesTaches);

module.exports = router; 