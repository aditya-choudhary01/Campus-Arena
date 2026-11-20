const mongoose = require("mongoose");
const User = require("../models/User");
const Teammate = require("../models/Teammate");

async function getAll(req, res) {
    try {
        const teammates = await Teammate.find().sort({ createdAt: -1 });
        const result = teammates.map(function (item) {
            return {
                id: item._id, name: item.name, gamerTag: item.gamerTag,
                college: item.college, game: item.game, gameName: item.gameName,
                role: item.role, lookingFor: item.lookingFor,
                availability: item.availability, blurb: item.blurb,
                initials: item.gamerTag.substring(0, 2).toUpperCase(),
                isOwner: item.createdBy.toString() === req.session.userId
            };
        });
        res.json(result);
    } catch (error) {
        console.log("Could not load teammate listings:", error);
        res.status(500).json({ message: "Could not load teammate listings." });
    }
}

async function create(req, res) {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(401).json({ message: "Please log in again." });

    const gameOptions = {
            "BGMI": { game: "bgmi", gameName: "BGMI" },
            "Valorant": { game: "valorant", gameName: "Valorant" },
            "CS2": { game: "cs2", gameName: "CS2" },
            "EA Sports FC": { game: "fc", gameName: "EA Sports FC" }
        };
        const selectedGame = gameOptions[req.body.game];
        const role = String(req.body.role || "").trim();
        const lookingFor = String(req.body.lookingFor || "").trim();
        const availability = String(req.body.availability || "").trim();
        const blurb = String(req.body.blurb || "").trim();

        if (!selectedGame || !role || !lookingFor || !availability || blurb.length < 10) {
            return res.status(400).json({ message: "Please complete all teammate request fields." });
        }

        const teammate = new Teammate({
            name: user.name, gamerTag: user.gamerTag, college: user.college,
            game: selectedGame.game, gameName: selectedGame.gameName,
            role: role, lookingFor: lookingFor, availability: availability,
            blurb: blurb, createdBy: user._id
        });
        await teammate.save();

        res.status(201).json({
            message: "Your teammate request has been posted.",
            id: teammate._id
        });
    } catch (error) {
        console.log("Could not create teammate listing:", error);
        res.status(500).json({ message: "Could not post your request. Please try again." });
    }
}

async function update(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid teammate listing ID." });
        }
        const teammate = await Teammate.findById(req.params.id);
        if (!teammate) return res.status(404).json({ message: "Teammate listing not found." });

        if (teammate.createdBy.toString() !== req.session.userId) {
            return res.status(403).json({
                message: "You can only edit your own teammate listing."
            });
        }

        const role = String(req.body.role || "").trim();
        const lookingFor = String(req.body.lookingFor || "").trim();
        const availability = String(req.body.availability || "").trim();
        const blurb = String(req.body.blurb || "").trim();
        if (!role || !lookingFor || !availability || blurb.length < 10) {
            return res.status(400).json({
                message: "Please complete all fields. The intro needs at least 10 characters."
            });
        }

        teammate.role = role;
        teammate.lookingFor = lookingFor;
        teammate.availability = availability;
        teammate.blurb = blurb;
        await teammate.save();

        res.json({ message: "Your teammate listing has been updated." });
    } catch (error) {
        console.log("Could not update teammate listing:", error);
        res.status(500).json({ message: "Could not update your listing. Please try again." });
    }
}

async function remove(req, res) {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid teammate listing ID." });
        }
        const teammate = await Teammate.findById(req.params.id);
        if (!teammate) return res.status(404).json({ message: "Teammate listing not found." });

        if (teammate.createdBy.toString() !== req.session.userId) {
            return res.status(403).json({
                message: "You can only delete your own teammate listing."
            });
        }

        await teammate.deleteOne();
        res.json({ message: "Your teammate listing has been deleted." });
    } catch (error) {
        console.log("Could not delete teammate listing:", error);
        res.status(500).json({ message: "Could not delete your listing. Please try again." });
    }
}

module.exports = { getAll, create, update, remove };
