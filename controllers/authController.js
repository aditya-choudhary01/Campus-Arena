const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function register(req, res) {
    try { 
        const name = String(req.body.name || "").trim();
        const gamerTag = String(req.body.gamerTag || "").trim();
        const college = String(req.body.college || "").trim();
        const email = String(req.body.email || "").trim().toLowerCase();
        const role = req.body.role;
        const password = String(req.body.password || "");

        if (!name || !gamerTag || !college || !email || !role || !password) {
            return res.status(400).json({ message: "Please fill in all the required fields." });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }
        if (role !== "Student Player" && role !== "Club Organizer") {
            return res.status(400).json({ message: "Please select a valid account type." });
        }

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(409).json({ message: "This email is already registered. Please log in." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: name, gamerTag: gamerTag, college: college,
            email: email, role: role, password: hashedPassword
        });
        await newUser.save();

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
                    id: newUser._id, name: newUser.name, gamerTag: newUser.gamerTag,
                    college: newUser.college, email: newUser.email, role: newUser.role
                }
            });
        });
    } catch (error) {
        console.log("Registration error:", error);
        if (error.code === 11000) {
            return res.status(409).json({ message: "This email is already registered. Please log in." });
        }
        res.status(500).json({ message: "Something went wrong while creating your account." });
    }
}

async function login(req, res) {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const password = String(req.body.password || "");
        const role = req.body.role;
        const remember = req.body.remember === true;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Please enter your email, password and account type."
            });
        }

        const user = await User.findOne({ email: email });
        if (!user) return res.status(401).json({ message: "Email or password is incorrect." });

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches || user.role !== role) {
            return res.status(401).json({
                message: "Email, password or account type is incorrect."
            });
        }

        req.session.userId = user._id.toString();
        req.session.cookie.maxAge = remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
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
                    id: user._id, name: user.name, gamerTag: user.gamerTag,
                    email: user.email, role: user.role
                }
            });
        });
    } catch (error) {
        console.log("Login error:", error);
        res.status(500).json({ message: "Something went wrong while logging in." });
    }
}

async function me(req, res) {
    try {
        if (!req.session.userId) return res.json({ user: null });

        const user = await User.findById(req.session.userId).select("name gamerTag college email role");
        if (!user) return res.json({ user: null });

        res.json({
            user: {
                id: user._id, name: user.name, gamerTag: user.gamerTag,
                college: user.college, email: user.email, role: user.role
            }
        });
    } catch (error) {
        console.log("Session check error:", error);
        res.status(500).json({ message: "Could not check the login status." });
    }
}

function logout(req, res) {
    req.session.destroy(function (error) {
        if (error) {
            console.log("Logout error:", error);
            return res.status(500).json({ message: "Could not log out. Please try again." });
        }
        res.clearCookie("campusarena.sid");
        res.json({ message: "Logged out successfully." });
    });
}

module.exports = { register, login, me, logout };
