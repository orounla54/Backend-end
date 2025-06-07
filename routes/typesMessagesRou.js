const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const typesMessagesController = require("../controllers/typesMessageCon");


router.post("/typesMessages", auth.authenticate, typesMessagesController.create);

router.get("/typesMessages/:id", auth.authenticate, typesMessagesController.getById);

router.put("/typesMessages/:id", auth.authenticate, typesMessagesController.update);

router.delete("/typesMessages/:id", auth.authenticate, typesMessagesController.delete);

module.exports = router;