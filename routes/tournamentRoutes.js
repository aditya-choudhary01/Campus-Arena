const express = require("express");
const tournamentController = require("../controllers/tournamentController");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();

// These paths preserve the existing Campus Arena API URLs.
router.get("/tournaments", tournamentController.getTournaments);
router.get("/players", tournamentController.getPlayers);
router.get("/open-tournaments", tournamentController.getOpenTournaments);
router.post("/tournament-registrations", requireLogin, tournamentController.createRegistration);
router.get("/tournament-registrations", requireLogin, tournamentController.getRegistrations);

module.exports = router;
