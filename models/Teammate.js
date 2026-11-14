const mongoose = require("mongoose");

// This is the structure of a teammate request stored in MongoDB.
const teammateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    gamerTag: {
        type: String,
        required: true
    },
    college: {
        type: String,
        required: true
    },
    game: {
        type: String,
        required: true
    },
    gameName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    lookingFor: {
        type: String,
        required: true
    },
    availability: {
        type: String,
        required: true
    },
    blurb: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

const Teammate = mongoose.model("Teammate", teammateSchema);

module.exports = Teammate;
