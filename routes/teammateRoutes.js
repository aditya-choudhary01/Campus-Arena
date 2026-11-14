const express = require("express");
const teammateController = require("../controllers/teammateController");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();

router.get("/", teammateController.getAll);
router.post("/", requireLogin, teammateController.create);
router.put("/:id", requireLogin, teammateController.update);
router.delete("/:id", requireLogin, teammateController.remove);

module.exports = router;
