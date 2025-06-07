const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const CategorieEvenementController = require("../controllers/categoriesEvenementsCon");

// Routes principales
router.get("/", auth.protect, CategorieEvenementController.getAll);
router.post("/", auth.protect, CategorieEvenementController.create);
router.get("/:id", auth.protect, CategorieEvenementController.getById);
router.put("/:id", auth.protect, CategorieEvenementController.update);
router.delete("/:id", auth.protect, CategorieEvenementController.delete);

// Routes de recherche et filtrage
router.get("/search", auth.protect, CategorieEvenementController.search);
router.get("/filter", auth.protect, CategorieEvenementController.filter);

// Routes pour les événements d'une catégorie
router.get("/:id/evenements", auth.protect, CategorieEvenementController.getEvenements);

module.exports = router; 