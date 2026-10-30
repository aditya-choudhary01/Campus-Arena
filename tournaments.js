// Campus Arena - Tournaments page
// Loads tournament cards from data/tournaments.json.
// Concepts: fetch, JSON, promises, functions, arrays, loops, DOM and events.

const tournamentSearch = document.getElementById("tournament-search");
const tournamentFilters = document.getElementsByName("game-filter");
const upcomingGrid = document.getElementById("upcoming-tournament-grid");
const completedGrid = document.getElementById("completed-tournament-grid");
const upcomingCount = document.getElementById("upcoming-count");
const completedCount = document.getElementById("completed-count");
const upcomingEmpty = document.getElementById("upcoming-empty");
const completedEmpty = document.getElementById("completed-empty");

function createTextElement(tagName, className, text) {
    const element = document.createElement(tagName);
    element.className = className;
    element.innerText = text;
    return element;
}

function createFavoriteButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "favorite-btn";
    button.setAttribute("aria-pressed", "false");
    button.innerText = "♡ Favorite";
    return button;
}

function createTournamentCard(tournament) {
    const card = document.createElement("article");
    card.className = "tournament-card";
    card.setAttribute("data-game", tournament.game);

    if (tournament.section === "completed") {
        card.classList.add("closed");
    }

    const cardTop = document.createElement("div");
    cardTop.className = "card-top";
    cardTop.appendChild(createTextElement("span", "game", tournament.gameName));
    cardTop.appendChild(createTextElement("span", "status " + tournament.statusClass, tournament.status));

    card.appendChild(cardTop);
    card.appendChild(createFavoriteButton());
    card.appendChild(createTextElement("h3", "", tournament.name));

    if (tournament.section === "upcoming") {
        card.appendChild(createTextElement("p", "", "📅 Date: " + tournament.date));
        card.appendChild(createTextElement("p", "", "🕕 Time: " + tournament.time));
        card.appendChild(createTextElement("p", "", "🎟️ Entry: " + tournament.entry));
        card.appendChild(createTextElement("p", "", "🏆 Prize Pool: " + tournament.prize));
        card.appendChild(createTextElement("p", "", "👥 Format: " + tournament.format));

        const registerLink = createTextElement("a", "card-cta", "Register");
        registerLink.href = "register-tournament.html?event=" + encodeURIComponent(tournament.name);
        card.appendChild(registerLink);
    } else {
        card.appendChild(createTextElement("p", "", "📅 Date: " + tournament.date));
        card.appendChild(createTextElement("p", "", "🏆 Champion: " + tournament.champion));
        card.appendChild(createTextElement("p", "", "🥈 Runner-up: " + tournament.runnerUp));
        card.appendChild(createTextElement("p", "", "Prize Pool: " + tournament.prize));

        const rulesLink = createTextElement("a", "card-cta ghost", "View format");
        rulesLink.href = "rules.html";
        card.appendChild(rulesLink);
    }

    return card;
}

function getSelectedTournamentGame() {
    let selectedGame = "all";

    for (let filter of tournamentFilters) {
        if (filter.checked) {
            selectedGame = filter.id.replace("filter-", "");
            break;
        }
    }

    return selectedGame;
}

function filterOneTournamentGroup(grid, selectedGame, searchText) {
    let shown = 0;
    let total = 0;

    for (let card of grid.children) {
        const cardGame = card.getAttribute("data-game");
        const cardText = card.innerText.toLowerCase();
        const matchesGame = selectedGame === "all" || cardGame === selectedGame;
        const matchesSearch = cardText.includes(searchText);
        const shouldShow = matchesGame && matchesSearch;

        card.classList.toggle("hidden-by-search", !shouldShow);
        total++;

        if (shouldShow) {
            shown++;
        }
    }

    return { shown: shown, total: total };
}

function filterTournaments() {
    const searchText = tournamentSearch.value.toLowerCase().trim();
    const selectedGame = getSelectedTournamentGame();

    const upcomingResult = filterOneTournamentGroup(upcomingGrid, selectedGame, searchText);
    const completedResult = filterOneTournamentGroup(completedGrid, selectedGame, searchText);

    upcomingCount.innerText = "Showing " + upcomingResult.shown + " of " + upcomingResult.total + " upcoming";
    completedCount.innerText = "Showing " + completedResult.shown + " of " + completedResult.total + " completed";

    upcomingEmpty.hidden = upcomingResult.shown !== 0;
    completedEmpty.hidden = completedResult.shown !== 0;
}

function showTournamentCards(tournaments) {
    upcomingGrid.innerHTML = "";
    completedGrid.innerHTML = "";

    for (let tournament of tournaments) {
        const card = createTournamentCard(tournament);

        if (tournament.section === "completed") {
            completedGrid.appendChild(card);
        } else {
            upcomingGrid.appendChild(card);
        }
    }

    filterTournaments();
}

function handleTournamentFavorite(event) {
    if (event.target.classList.contains("favorite-btn")) {
        const button = event.target;
        button.classList.toggle("favorite-active");

        const isFavorite = button.classList.contains("favorite-active");
        button.setAttribute("aria-pressed", isFavorite);
        button.innerText = isFavorite ? "♥ Saved" : "♡ Favorite";
    }
}

for (let filter of tournamentFilters) {
    filter.addEventListener("change", filterTournaments);
}

tournamentSearch.addEventListener("input", filterTournaments);
upcomingGrid.addEventListener("click", handleTournamentFavorite);
completedGrid.addEventListener("click", handleTournamentFavorite);

// The HTML cards remain as a fallback if the JSON request cannot be loaded.
filterTournaments();

fetch("data/tournaments.json")
    .then((response) => {
        if (!response.ok) {
            throw new Error("Could not load tournament data.");
        }
        return response.json();
    })
    .then((data) => {
        showTournamentCards(data);
    })
    .catch((error) => {
        console.log(error);
        console.log("Showing the tournament cards already present in the HTML.");
        filterTournaments();
    });
