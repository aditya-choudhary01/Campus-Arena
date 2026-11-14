const mongoose = require("mongoose");
const config = require("./index");

// Connect to the Campus Arena database in MongoDB Atlas.
async function connectDB() {
    if (!config.MONGODB_URI) {
        throw new Error("MONGODB_URI is missing. Add it to your private .env file.");
    }

    await mongoose.connect(config.MONGODB_URI, {
        dbName: "campusArena"
    });

    console.log("Connected to MongoDB.");
}

module.exports = connectDB;
