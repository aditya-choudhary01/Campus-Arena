// Simple beginner server for CampusArena
// Run it with: node server.js
// Then open: http://localhost:3000

var http = require("http");
var fs = require("fs");
var path = require("path");
var url = require("url");

var PORT = 3000;
var ROOT = __dirname;

// Only these JSON files can be written to
var ALLOWED_FILES = {
    "users.json": true,
    "contacts.json": true,
    "registrations.json": true,
    "teammate-posts.json": true,
    "password-resets.json": true
};

var TYPES = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
};

function send(res, code, body, type) {
    res.writeHead(code, {
        "Content-Type": type || "text/plain",
        "Access-Control-Allow-Origin": "*"
    });
    res.end(body);
}

function sendJson(res, code, data) {
    send(res, code, JSON.stringify(data), "application/json");
}

function readBody(req, callback) {
    var raw = "";
    req.on("data", function (chunk) {
        raw += chunk;
        if (raw.length > 1000000) {
            req.destroy();
        }
    });
    req.on("end", function () {
        callback(raw);
    });
}

function readJsonFile(fileName) {
    var filePath = path.join(ROOT, "data", fileName);
    if (!fs.existsSync(filePath)) {
        return [];
    }
    var text = fs.readFileSync(filePath, "utf8").trim();
    if (!text) {
        return [];
    }
    return JSON.parse(text);
}

function writeJsonFile(fileName, data) {
    var filePath = path.join(ROOT, "data", fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function serveFile(reqPath, res) {
    if (reqPath === "/") {
        reqPath = "/index.html";
    }

    var safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, "");
    var filePath = path.join(ROOT, safePath);

    if (filePath.indexOf(ROOT) !== 0) {
        send(res, 403, "Not allowed");
        return;
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        send(res, 404, "File not found");
        return;
    }

    var ext = path.extname(filePath).toLowerCase();
    var type = TYPES[ext] || "application/octet-stream";
    var content = fs.readFileSync(filePath);
    send(res, 200, content, type);
}

var server = http.createServer(function (req, res) {
    var parsed = url.parse(req.url, true);
    var pathname = parsed.pathname;

    if (req.method === "OPTIONS") {
        res.writeHead(204, {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        });
        res.end();
        return;
    }

    if (req.method === "POST" && pathname === "/api/save") {
        readBody(req, function (raw) {
            var body;
            try {
                body = JSON.parse(raw);
            } catch (err) {
                sendJson(res, 400, { ok: false, message: "Invalid JSON" });
                return;
            }

            var fileName = body.file;
            var item = body.item;

            if (!ALLOWED_FILES[fileName] || !item || typeof item !== "object") {
                sendJson(res, 400, { ok: false, message: "Invalid save request" });
                return;
            }

            item.id = Date.now();
            item.savedAt = new Date().toISOString();

            var list = readJsonFile(fileName);
            list.push(item);
            writeJsonFile(fileName, list);

            sendJson(res, 200, { ok: true, message: "Saved", id: item.id });
        });
        return;
    }

    if (req.method === "POST" && pathname === "/api/login") {
        readBody(req, function (raw) {
            var body;
            try {
                body = JSON.parse(raw);
            } catch (err) {
                sendJson(res, 400, { ok: false, message: "Invalid JSON" });
                return;
            }

            var email = (body.email || "").toLowerCase().trim();
            var password = body.password || "";
            var users = readJsonFile("users.json");
            var found = null;

            for (var i = 0; i < users.length; i++) {
                if (users[i].email === email && users[i].password === password) {
                    found = users[i];
                    break;
                }
            }

            if (!found) {
                sendJson(res, 401, { ok: false, message: "Email or password is wrong." });
                return;
            }

            sendJson(res, 200, {
                ok: true,
                message: "Welcome back, " + found.gamerTag + "!",
                user: {
                    name: found.name,
                    gamerTag: found.gamerTag,
                    email: found.email,
                    role: found.role
                }
            });
        });
        return;
    }

    if (req.method === "GET" && pathname.indexOf("/data/") === 0) {
        serveFile(pathname, res);
        return;
    }

    if (req.method === "GET") {
        serveFile(pathname, res);
        return;
    }

    send(res, 405, "Method not allowed");
});

server.listen(PORT, function () {
    console.log("CampusArena is running at http://localhost:" + PORT);
});
