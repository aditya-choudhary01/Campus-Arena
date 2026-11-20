// Main entry point for the Campus Arena backend.
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
 
const config = require("./config");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const teammateRoutes = require("./routes/teammateRoutes");
const tournamentRoutes = require("./routes/tournamentRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function startServer() {
    if (!config.SESSION_SECRET) {
        throw new Error("SESSION_SECRET is missing. Add it to your private .env file.");
    }

    await connectDB();

    const sessionStore = MongoStore.create({
        client: mongoose.connection.getClient(),
        dbName: "campusArena",
        collectionName: "sessions"
    });

    app.use(session({
        name: config.SESSION_COOKIE_NAME,
        secret: config.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: config.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000
        }
    }));

    app.use("/api/auth", authRoutes);
    app.use("/api/teammates", teammateRoutes);
    app.use("/api", tournamentRoutes);

    // Only files inside public/ are available to website visitors.
    app.use(express.static(config.PUBLIC_DIR));

    app.listen(config.PORT, function () {
        console.log("Campus Arena is running at http://localhost:" + config.PORT);
    });
}

startServer().catch(function (error) {
    console.log("Could not start the server:", error);
    process.exit(1);
});
