/**
 * @swagger
 * /api/priorites:
 *   get:
 *     summary: Retrieve a list of examples
 *     responses:
 *       200:
 *         description: A list of examples
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */

const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { upload, processFiles } = require('../middlewares/multer-configPreuves');
const prioritesController = require("../controllers/prioritesCon");

// Routes pour les types de priorités
router.get("/typePriorites", auth.protect, prioritesController.getAllTypePriorite);
router.post("/typePriorites", auth.protect, prioritesController.createTypePriorite);
router.get("/typePriorites/:id", auth.protect, prioritesController.getByIdTypePriorite);
router.put("/typePriorites/:id", auth.protect, prioritesController.updateTypePriorite);
router.delete("/typePriorites/:id", auth.protect, prioritesController.deleteTypePriorite);

// Routes pour les preuves
router.post("/preuves", auth.protect, upload.array('fichiers', 10), processFiles, prioritesController.addPreuves);
router.get("/preuves/:idPreuve/documents", auth.protect, prioritesController.getPreuvesDocuments);
router.post("/preuves/:idPreuve/documents", auth.protect, upload.array('fichiers', 10), processFiles, prioritesController.addDocumentIndividually);
router.put("/preuves/:idPreuve", auth.protect, prioritesController.updatePreuves);
router.delete("/preuves/:idPreuve", auth.protect, prioritesController.deletePreuveWithDocuments);
router.delete("/documentsPreuves/:idDocument", auth.protect, prioritesController.deleteDocumentPreuve);

// Routes spécifiques pour les priorités (doivent être définies avant les routes avec paramètres)
router.get("/priorites/responsable/list", auth.protect, prioritesController.getAllPrioriteForResponsables);
router.get("/priorites/service/list", auth.protect, prioritesController.getAllPrioriteForServices);
router.post("/priorites/responsable/add", auth.protect, prioritesController.addRespPriorite);
router.delete("/priorites/responsable/remove/:idPriorite", auth.protect, prioritesController.removeRespPriorite);

// Routes pour les priorités
router.get("/priorites", auth.protect, prioritesController.getAllPriorite);
router.post("/priorites", auth.protect, prioritesController.newPriorite);

// Routes pour les tâches et responsables des priorités
router.get("/priorites/:idPriorite/taches", auth.protect, prioritesController.getTachesForPriorite);
router.get("/priorites/:idPriorite/responsables", auth.protect, prioritesController.getResponsablesByPriorite);
router.get("/priorites/:idPriorite/preuves", auth.protect, prioritesController.getPreuves);

// Routes pour les priorités avec ID
router.get("/priorites/:id", auth.protect, prioritesController.getByIdPriorite);
router.put("/priorites/:id", auth.protect, prioritesController.updatePriorite);
router.delete("/priorites/:id", auth.protect, prioritesController.deletePriorite);

module.exports = router;