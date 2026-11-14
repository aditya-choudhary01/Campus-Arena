# Campus Arena Backend Guide

This project uses beginner-friendly Node.js, Express and MongoDB code.

## Start the project

1. Open the Campus-Arena folder in VS Code.
2. Create a private .env file from .env.example.
3. Add your MongoDB Atlas connection string and a session secret to .env.
4. In the VS Code terminal, run:

```bash
npm install
npm run dev
```

Open the website at http://localhost:3000.

Never upload the .env file to GitHub.

## Project folders

- config/: project settings and MongoDB connection.
- controllers/: code that handles API requests.
- routes/: API URL definitions, separated by feature.
- middleware/: the login check for protected routes.
- models/: MongoDB User and Teammate structures.
- utils/: shared helpers for local JSON files.
- data/: tournament, player and registration data. This folder is not served publicly.
- public/index.html: the homepage.
- public/pages/: the other website pages.
- public/css/: all stylesheets.
- public/js/: browser-side JavaScript.
- server.js: connects the parts and starts Express.

## Where backend code lives

- Authentication routes: routes/authRoutes.js and controllers/authController.js.
- Teammate routes: routes/teammateRoutes.js and controllers/teammateController.js.
- Tournament and player routes: routes/tournamentRoutes.js and controllers/tournamentController.js.

## Where data is stored

### MongoDB database: campusArena

- users: registered accounts. Passwords are stored as bcrypt hashes.
- sessions: login sessions.
- teammates: teammate requests created by users.

### Local JSON files

- data/tournaments.json: tournament information.
- data/players.json: sample player information.
- data/tournament-registrations.json: registrations submitted for eligible upcoming tournaments.

Contact messages are not sent or stored.

## Express API endpoints

| Method | Endpoint | What it does |
| --- | --- | --- |
| POST | /api/auth/register | Create an account |
| POST | /api/auth/login | Log in |
| GET | /api/auth/me | Check the current user |
| POST | /api/auth/logout | Log out |
| GET | /api/tournaments | Read tournaments from JSON |
| GET | /api/players | Read sample players from JSON |
| GET | /api/open-tournaments | Read only eligible upcoming tournaments |
| POST | /api/tournament-registrations | Save a registration to local JSON (login required) |
| GET | /api/tournament-registrations | Read saved registrations (Club Organizer login required) |
| GET | /api/teammates | Read teammate requests from MongoDB |
| POST | /api/teammates | Create a teammate request (login required) |
| PUT | /api/teammates/:id | Edit your own teammate request |
| DELETE | /api/teammates/:id | Delete your own teammate request |

## Opening registration for a new tournament

Add a new tournament object to data/tournaments.json with:

- section set to upcoming
- name set to the tournament name
- date set to a future date such as Dec 10, 2026
- The remaining display fields such as game, gameName, status, statusClass, time, entry, prize and format

The server checks the section and date before accepting a registration. Past and completed events are rejected even if someone manually changes the browser form.

Only a logged-in user can submit a registration. The user's name, gamer tag, college and email are read from their account, not trusted from the browser form. A user can register only once for the same tournament.

## External APIs

No third-party API key is currently required by the existing Campus Arena features. The external API evaluation item is conditional ("if required"). Do not add an unrelated API just to add one.
