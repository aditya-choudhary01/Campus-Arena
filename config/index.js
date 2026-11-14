require("dotenv").config();

const path = require("path");

module.exports = {
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NODE_ENV: process.env.NODE_ENV || "development",
    SESSION_COOKIE_NAME: "campusarena.sid",
    PUBLIC_DIR: path.join(__dirname, "..", "public")
};
