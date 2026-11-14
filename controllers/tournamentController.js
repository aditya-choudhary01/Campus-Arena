const User = require("../models/User");
const { readDataFile, writeDataFile } = require("../utils/jsonFile");

function isRegistrationOpen(tournament) {
    if (tournament.section !== "upcoming" || tournament.registrationOpen === false) return false;

    const eventDate = new Date(tournament.date);
    if (Number.isNaN(eventDate.getTime())) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
}

async function getTournaments(req, res) {
    try {
        res.json(await readDataFile("tournaments.json"));
    } catch (error) {
        console.log("Could not read tournaments:", error);
        res.status(500).json({ message: "Could not load tournaments." });
    }
}

async function getPlayers(req, res) {
    try {
        res.json(await readDataFile("players.json"));
    } catch (error) {
        console.log("Could not read players:", error);
        res.status(500).json({ message: "Could not load players." });
    }
}

async function getOpenTournaments(req, res) {
    try {
        const tournaments = await readDataFile("tournaments.json");
        res.json(tournaments.filter(isRegistrationOpen));
    } catch (error) {
        console.log("Could not load open tournaments:", error);
        res.status(500).json({
            message: "Could not load tournaments open for registration."
        });
    }
}

async function createRegistration(req, res) {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(401).json({ message: "Please log in again." });

        const eventName = String(req.body.eventName || "").trim();
        const teamName = String(req.body.teamName || "").trim();
        if (!eventName || !teamName) {
            return res.status(400).json({
                message: "Please select a tournament and enter your team name."
            });
        }

        const tournaments = await readDataFile("tournaments.json");
        const selectedEvent = tournaments.find(function (tournament) {
            return tournament.name === eventName && isRegistrationOpen(tournament);
        });
        if (!selectedEvent) {
            return res.status(409).json({
                message: "This tournament is not open for registration."
            });
        }

        const registrations = await readDataFile("tournament-registrations.json");
        const alreadyRegistered = registrations.some(function (registration) {
            return registration.userId === user._id.toString() &&
                registration.eventName === selectedEvent.name;
        });
        if (alreadyRegistered) {
            return res.status(409).json({
                message: "You have already registered for this tournament."
            });
        }

        registrations.push({
            id: Date.now().toString(),
            userId: user._id.toString(),
            name: user.name,
            gamerTag: user.gamerTag,
            college: user.college,
            email: user.email,
            eventName: selectedEvent.name,
            eventDate: selectedEvent.date,
            teamName: teamName,
            registeredAt: new Date().toISOString()
        });
        await writeDataFile("tournament-registrations.json", registrations);

        res.status(201).json({
            message: "Your tournament registration has been saved successfully."
        });
    } catch (error) {
        console.log("Could not save tournament registration:", error);
        res.status(500).json({
            message: "Could not save your registration. Please try again."
        });
    }
}

async function getRegistrations(req, res) {
    try {
        const user = await User.findById(req.session.userId);
        if (!user || user.role !== "Club Organizer") {
            return res.status(403).json({
                message: "Only club organizers can view tournament registrations."
            });
        }
        res.json(await readDataFile("tournament-registrations.json"));
    } catch (error) {
        console.log("Could not read tournament registrations:", error);
        res.status(500).json({
            message: "Could not load tournament registrations."
        });
    }
}

module.exports = {
    getTournaments, getPlayers, getOpenTournaments,
    createRegistration, getRegistrations
};
