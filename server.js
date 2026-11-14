// Campus Arena backend
// This file starts Express, connects MongoDB and handles account APIs.

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const fs = require("fs").promises;

const User = require("./models/User");
const Teammate = require("./models/Teammate");

const app = express();
const PORT = process.env.PORT || 3000;

// Read JSON data sent by the frontend.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add the account API routes after the login session has been set up.
function registerAuthRoutes() {

    // Create a new account.
    app.post("/api/auth/register", async function (req, res) {
        try {
            const name = String(req.body.name || "").trim();
            const gamerTag = String(req.body.gamerTag || "").trim();
            const college = String(req.body.college || "").trim();
            const email = String(req.body.email || "").trim().toLowerCase();
            const role = req.body.role;
            const password = req.body.password;

            if (!name || !gamerTag || !college || !email || !role || !password) {
                return res.status(400).json({
                    message: "Please fill in all the required fields."
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    message: "Password must be at least 6 characters."
                });
            }

            if (role !== "Student Player" && role !== "Club Organizer") {
                return res.status(400).json({
                    message: "Please select a valid account type."
                });
            }

            const existingUser = await User.findOne({ email: email });

            if (existingUser) {
                return res.status(409).json({
                    message: "This email is already registered. Please log in."
                });
            }

            // Never save the original password in the database.
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                name: name,
                gamerTag: gamerTag,
                college: college,
                email: email,
                role: role,
                password: hashedPassword
            });

            await newUser.save();

            // Remember which account has logged in.
            req.session.userId = newUser._id.toString();
            req.session.cookie.maxAge = 24 * 60 * 60 * 1000;

            req.session.save(function (error) {
                if (error) {
                    console.log(error);
                    return res.status(500).json({
                        message: "Account was created, but the login session could not be started. Please log in."
                    });
                }

                res.status(201).json({
                    message: "Account created successfully.",
                    user: {
                        id: newUser._id,
                        name: newUser.name,
                        gamerTag: newUser.gamerTag,
                        college: newUser.college,
                        email: newUser.email,
                        role: newUser.role
                    }
                });
            });
        } catch (error) {
            console.log("Registration error:", error);

            if (error.code === 11000) {
                return res.status(409).json({
                    message: "This email is already registered. Please log in."
                });
            }

            res.status(500).json({
                message: "Something went wrong while creating your account."
            });
        }
    });

    // Log in to an existing account.
    app.post("/api/auth/login", async function (req, res) {
        try {
            const email = String(req.body.email || "").trim().toLowerCase();
            const password = req.body.password;
            const role = req.body.role;
            const remember = req.body.remember === true;

            if (!email || !password || !role) {
                return res.status(400).json({
                    message: "Please enter your email, password and account type."
                });
            }

            const user = await User.findOne({ email: email });

            if (!user) {
                return res.status(401).json({
                    message: "Email or password is incorrect."
                });
            }

            const passwordMatches = await bcrypt.compare(password, user.password);

            if (!passwordMatches || user.role !== role) {
                return res.status(401).json({
                    message: "Email, password or account type is incorrect."
                });
            }

            req.session.userId = user._id.toString();

            if (remember) {
                req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000;
            } else {
                req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
            }

            req.session.save(function (error) {
                if (error) {
                    console.log(error);
                    return res.status(500).json({
                        message: "Could not start your login session. Please try again."
                    });
                }

                res.json({
                    message: "Login successful.",
                    user: {
                        id: user._id,
                        name: user.name,
                        gamerTag: user.gamerTag,
                        email: user.email,
                        role: user.role
                    }
                });
            });
        } catch (error) {
            console.log("Login error:", error);
            res.status(500).json({
                message: "Something went wrong while logging in."
            });
        }
    });

    // Check whether someone is currently logged in.
    app.get("/api/auth/me", async function (req, res) {
        try {
            if (!req.session.userId) {
                return res.json({ user: null });
            }

            const user = await User.findById(req.session.userId)
                .select("name gamerTag college email role");

            if (!user) {
                return res.json({ user: null });
            }

            res.json({
                user: {
                    id: user._id,
                    name: user.name,
                    gamerTag: user.gamerTag,
                    college: user.college,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.log("Session check error:", error);
            res.status(500).json({
                message: "Could not check the login status."
            });
        }
    });

    // Log out and remove the session.
    app.post("/api/auth/logout", function (req, res) {
        req.session.destroy(function (error) {
            if (error) {
                console.log("Logout error:", error);
                return res.status(500).json({
                    message: "Could not log out. Please try again."
                });
            }

            res.clearCookie("campusarena.sid");
            res.json({ message: "Logged out successfully." });
        });
    });
}


// Read and write simple JSON files stored in the data folder.
async function readDataFile(fileName) {
    const filePath = path.join(__dirname, "data", fileName);
    const fileContent = await fs.readFile(filePath, "utf8");
    return JSON.parse(fileContent);
}

async function writeDataFile(fileName, data) {
    const filePath = path.join(__dirname, "data", fileName);
    await fs.writeFile(filePath, JSON.stringify(data, null, 4));
}

// Only logged-in users can create, edit or delete teammate listings.
function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Please log in before doing this."
        });
    }

    next();
}

// APIs that use local JSON files and MongoDB teammate records.
function registerProjectRoutes() {

    // Fetch tournament information from the local JSON file.
    app.get("/api/tournaments", async function (req, res) {
        try {
            const tournaments = await readDataFile("tournaments.json");
            res.json(tournaments);
        } catch (error) {
            console.log("Could not read tournaments:", error);
            res.status(500).json({ message: "Could not load tournaments." });
        }
    });

    // Fetch sample player information from the local JSON file.
    app.get("/api/players", async function (req, res) {
        try {
            const players = await readDataFile("players.json");
            res.json(players);
        } catch (error) {
            console.log("Could not read players:", error);
            res.status(500).json({ message: "Could not load players." });
        }
    });

    // Save a contact message in a local JSON file.
    app.post("/api/contact", async function (req, res) {
        try {
            const name = String(req.body.name || "").trim();
            const email = String(req.body.email || "").trim().toLowerCase();
            const topic = String(req.body.topic || "").trim();
            const message = String(req.body.message || "").trim();

            if (!name || !email || !topic || message.length < 10) {
                return res.status(400).json({
                    message: "Please complete all fields and write a message of at least 10 characters."
                });
            }

            const messages = await readDataFile("contact-messages.json");

            const newMessage = {
                id: Date.now().toString(),
                name: name,
                email: email,
                topic: topic,
                message: message,
                createdAt: new Date().toISOString()
            };

            messages.push(newMessage);
            await writeDataFile("contact-messages.json", messages);

            res.status(201).json({
                message: "Your message has been saved successfully."
            });
        } catch (error) {
            console.log("Could not save contact message:", error);
            res.status(500).json({
                message: "Could not save your message. Please try again."
            });
        }
    });

    // Only a logged-in club organizer can read saved contact messages.
    app.get("/api/contact-messages", requireLogin, async function (req, res) {
        try {
            const user = await User.findById(req.session.userId);

            if (!user || user.role !== "Club Organizer") {
                return res.status(403).json({
                    message: "Only club organizers can view contact messages."
                });
            }

            const messages = await readDataFile("contact-messages.json");
            res.json(messages);
        } catch (error) {
            console.log("Could not load contact messages:", error);
            res.status(500).json({
                message: "Could not load contact messages."
            });
        }
    });

    // Fetch teammate listings saved in MongoDB.
    app.get("/api/teammates", async function (req, res) {
        try {
            const teammates = await Teammate.find().sort({ createdAt: -1 });

            const result = teammates.map(function (item) {
                return {
                    id: item._id,
                    name: item.name,
                    gamerTag: item.gamerTag,
                    college: item.college,
                    game: item.game,
                    gameName: item.gameName,
                    role: item.role,
                    lookingFor: item.lookingFor,
                    availability: item.availability,
                    blurb: item.blurb,
                    initials: item.gamerTag.substring(0, 2).toUpperCase(),
                    isOwner: item.createdBy.toString() === req.session.userId
                };
            });

            res.json(result);
        } catch (error) {
            console.log("Could not load teammate listings:", error);
            res.status(500).json({
                message: "Could not load teammate listings."
            });
        }
    });

    // Create a teammate listing in MongoDB.
    app.post("/api/teammates", requireLogin, async function (req, res) {
        try {
            const user = await User.findById(req.session.userId);

            if (!user) {
                return res.status(401).json({
                    message: "Please log in again."
                });
            }

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
                return res.status(400).json({
                    message: "Please complete all teammate request fields."
                });
            }

            const teammate = new Teammate({
                name: user.name,
                gamerTag: user.gamerTag,
                college: user.college,
                game: selectedGame.game,
                gameName: selectedGame.gameName,
                role: role,
                lookingFor: lookingFor,
                availability: availability,
                blurb: blurb,
                createdBy: user._id
            });

            await teammate.save();

            res.status(201).json({
                message: "Your teammate request has been posted.",
                id: teammate._id
            });
        } catch (error) {
            console.log("Could not create teammate listing:", error);
            res.status(500).json({
                message: "Could not post your request. Please try again."
            });
        }
    });

    // Update a teammate listing. Only its owner can edit it.
    app.put("/api/teammates/:id", requireLogin, async function (req, res) {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: "Invalid teammate listing ID." });
            }

            const teammate = await Teammate.findById(req.params.id);

            if (!teammate) {
                return res.status(404).json({ message: "Teammate listing not found." });
            }

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
            res.status(500).json({
                message: "Could not update your listing. Please try again."
            });
        }
    });

    // Delete a teammate listing. Only its owner can delete it.
    app.delete("/api/teammates/:id", requireLogin, async function (req, res) {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: "Invalid teammate listing ID." });
            }

            const teammate = await Teammate.findById(req.params.id);

            if (!teammate) {
                return res.status(404).json({ message: "Teammate listing not found." });
            }

            if (teammate.createdBy.toString() !== req.session.userId) {
                return res.status(403).json({
                    message: "You can only delete your own teammate listing."
                });
            }

            await teammate.deleteOne();

            res.json({ message: "Your teammate listing has been deleted." });
        } catch (error) {
            console.log("Could not delete teammate listing:", error);
            res.status(500).json({
                message: "Could not delete your listing. Please try again."
            });
        }
    });
}

// Start the server only after MongoDB is connected.
async function startServer() {
    if (!process.env.MONGODB_URI || !process.env.SESSION_SECRET) {
        console.log("Please create a .env file and add MONGODB_URI and SESSION_SECRET.");
        process.exit(1);
    }

    // Use a clearly named database for this project instead of MongoDB's default "test".
    await mongoose.connect(process.env.MONGODB_URI, {
        dbName: "campusArena"
    });
    console.log("Connected to MongoDB.");

    // Store login sessions in MongoDB too.
    const sessionStore = MongoStore.create({
        client: mongoose.connection.getClient(),
        dbName: "campusArena",
        collectionName: "sessions"
    });

    app.use(session({
        name: "campusarena.sid",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000
        }
    }));

    // Register routes after the session middleware.
    registerAuthRoutes();
    registerProjectRoutes();

    // Do not let the browser open backend or dependency files directly.
    app.use(function (req, res, next) {
        if (
            req.path === "/server.js" ||
            req.path === "/package.json" ||
            req.path === "/package-lock.json" ||
            req.path.startsWith("/models/") ||
            req.path.startsWith("/node_modules/")
        ) {
            return res.sendStatus(404);
        }

        next();
    });

    // Serve the existing HTML, CSS and frontend JavaScript files.
    app.use(express.static(path.join(__dirname)));

    app.listen(PORT, function () {
        console.log("Campus Arena is running at http://localhost:" + PORT);
    });
}

startServer().catch(function (error) {
    console.log("Could not start the server:", error);
    process.exit(1);
});
