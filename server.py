# Simple beginner server for CampusArena
# Run it with: python3 server.py
# Then open: http://localhost:3000

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from datetime import datetime, timezone
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 3000
ALLOWED_FILES = {
    "users.json",
    "contacts.json",
    "registrations.json",
    "teammate-posts.json",
    "password-resets.json",
}


def read_json_file(file_name):
    file_path = os.path.join(ROOT, "data", file_name)
    if not os.path.exists(file_path):
        return []
    with open(file_path, "r", encoding="utf-8") as file:
        text = file.read().strip()
        if not text:
            return []
        return json.loads(text)


def write_json_file(file_name, data):
    file_path = os.path.join(ROOT, "data", file_name)
    with open(file_path, "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2)
        file.write("\n")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def send_json(self, code, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_body(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw)

    def do_POST(self):
        path = urlparse(self.path).path

        try:
            body = self.read_body()
        except Exception:
            self.send_json(400, {"ok": False, "message": "Invalid JSON"})
            return

        if path == "/api/save":
            file_name = body.get("file")
            item = body.get("item")
            if file_name not in ALLOWED_FILES or not isinstance(item, dict):
                self.send_json(400, {"ok": False, "message": "Invalid save request"})
                return

            item["id"] = int(datetime.now().timestamp() * 1000)
            item["savedAt"] = datetime.now(timezone.utc).isoformat()
            records = read_json_file(file_name)
            records.append(item)
            write_json_file(file_name, records)
            self.send_json(200, {"ok": True, "message": "Saved", "id": item["id"]})
            return

        if path == "/api/login":
            email = str(body.get("email", "")).lower().strip()
            password = body.get("password", "")
            users = read_json_file("users.json")
            found = None
            for user in users:
                if user.get("email") == email and user.get("password") == password:
                    found = user
                    break

            if not found:
                self.send_json(401, {"ok": False, "message": "Email or password is wrong."})
                return

            self.send_json(200, {
                "ok": True,
                "message": "Welcome back, " + found.get("gamerTag", "player") + "!",
                "user": {
                    "name": found.get("name"),
                    "gamerTag": found.get("gamerTag"),
                    "email": found.get("email"),
                    "role": found.get("role"),
                },
            })
            return

        self.send_error(405, "Method not allowed")

    def log_message(self, format, *args):
        print("%s - %s" % (self.address_string(), format % args))


if __name__ == "__main__":
    os.chdir(ROOT)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print("CampusArena is running at http://localhost:" + str(PORT))
    server.serve_forever()
