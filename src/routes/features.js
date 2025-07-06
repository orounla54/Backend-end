const express = require('express');
const router = express.Router();

// Routes pour les répertoires
router.get('/repertoires', (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/repertoires', (req, res) => {
  res.json({ success: true, data: { id: Date.now(), ...req.body } });
});

// Routes pour les sous-tâches
router.get('/sousTaches', (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/sousTaches', (req, res) => {
  res.json({ success: true, data: { id: Date.now(), ...req.body } });
});

// Routes pour les preuves
router.get('/preuves', (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/preuves', (req, res) => {
  res.json({ success: true, data: { id: Date.now(), ...req.body } });
});

router.put('/preuves/:id', (req, res) => {
  res.json({ success: true, data: { id: req.params.id, ...req.body } });
});

// Routes pour les rôles
router.get('/roles', (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/roles', (req, res) => {
  res.json({ success: true, data: { id: Date.now(), ...req.body } });
});

// Routes pour les rôles de plan
router.get('/rolesPlan', (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/rolesPlan', (req, res) => {
  res.json({ success: true, data: { id: Date.now(), ...req.body } });
});

// Routes pour les types de priorités
router.get('/typePriorites', (req, res) => {
  res.json({ success: true, data: [] });
});

router.post('/typePriorites', (req, res) => {
  res.json({ success: true, data: { id: Date.now(), ...req.body } });
});

// Routes pour les catégories d'événements
router.get('/categories/evenements', (req, res) => {
  res.json({ success: true, data: [] });
});

module.exports = router; 