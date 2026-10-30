// Campus Arena - Find Teammates page
// Loads player cards from data/players.json.
// Concepts: fetch, JSON, promises, functions, arrays, loops, DOM and events.

const playerSearch = document.getElementById("player-search");
const playerFilters = document.getElementsByName("mate-filter");
const playerGrid = document.getElementById("player-grid");
const playerCount = document.getElementById("player-count");
const playerEmpty = document.getElementById("player-empty");

function createPlayerTextElement(tagName, className, text) {
    const element = document.createElement(tagName);
    element.className = className;
    element.innerText = text;
    return element;
}

function createPlayerFavoriteButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "favorite-btn";
    button.setAttribute("aria-pressed", "false");
    button.innerText = "♡ Favorite";
    return button;
}

function createPlayerCard(player) {
    const card = document.createElement("article");
    card.className = "player-card";
    card.setAttribute("data-game", player.game);

    const playerHead = document.createElement("div");
    playerHead.className = "player-head";

    playerHead.appendChild(createPlayerTextElement("div", "avatar", player.initials));

    const playerIdentity = document.createElement("div");
    playerIdentity.appendChild(createPlayerTextElement("h3", "", player.gamerTag));
    playerIdentity.appendChild(createPlayerTextElement("p", "college", player.college));

    playerHead.appendChild(playerIdentity);
    playerHead.appendChild(createPlayerTextElement("span", "game", player.gameName));

    card.appendChild(playerHead);
    card.appendChild(createPlayerTextElement("p", "role", "Role: " + player.role));
    card.appendChild(createPlayerTextElement("p", "blurb", player.blurb));

    const details = document.createElement("ul");
    details.appendChild(createPlayerTextElement("li", "", "Needs: " + player.needs.join(", ")));
    details.appendChild(createPlayerTextElement("li", "", "Available: " + player.availability));
    card.appendChild(details);

    card.appendChild(createPlayerFavoriteButton());

    const inviteLink = createPlayerTextElement("a", "card-cta", "Invite to squad");
    inviteLink.href = "contact.html";
    card.appendChild(inviteLink);

    return card;
}

function getSelectedPlayerGame() {
    let selectedGame = "all";

    for (let filter of playerFilters) {
        if (filter.checked) {
            selectedGame = filter.id.replace("mate-", "");
            break;
        }
    }

    return selectedGame;
}

function filterPlayers() {
    const searchText = playerSearch.value.toLowerCase().trim();
    const selectedGame = getSelectedPlayerGame();
    let visiblePlayers = 0;
    let totalPlayers = 0;

    for (let card of playerGrid.children) {
        const cardGame = card.getAttribute("data-game");
        const cardText = card.innerText.toLowerCase();
        const matchesGame = selectedGame === "all" || cardGame === selectedGame;
        const matchesSearch = cardText.includes(searchText);
        const shouldShow = matchesGame && matchesSearch;

        card.classList.toggle("hidden-by-search", !shouldShow);
        totalPlayers++;

        if (shouldShow) {
            visiblePlayers++;
        }
    }

    playerCount.innerText = "Showing " + visiblePlayers + " of " + totalPlayers + " players";
    playerEmpty.hidden = visiblePlayers !== 0;
}

function showPlayerCards(players) {
    playerGrid.innerHTML = "";

    for (let player of players) {
        const card = createPlayerCard(player);
        playerGrid.appendChild(card);
    }

    filterPlayers();
}

function handlePlayerFavorite(event) {
    if (event.target.classList.contains("favorite-btn")) {
        const button = event.target;
        button.classList.toggle("favorite-active");

        const isFavorite = button.classList.contains("favorite-active");
        button.setAttribute("aria-pressed", isFavorite);
        button.innerText = isFavorite ? "♥ Saved" : "♡ Favorite";
    }
}

for (let filter of playerFilters) {
    filter.addEventListener("change", filterPlayers);
}

playerSearch.addEventListener("input", filterPlayers);
playerGrid.addEventListener("click", handlePlayerFavorite);

// The HTML cards remain as a fallback if the JSON request cannot be loaded.
filterPlayers();

fetch("data/players.json")
    .then((response) => {
        if (!response.ok) {
            throw new Error("Could not load player data.");
        }
        return response.json();
    })
    .then((data) => {
        showPlayerCards(data);
    })
    .catch((error) => {
        console.log(error);
        console.log("Showing the player cards already present in the HTML.");
        filterPlayers();
    });


// Theme toggle: the choice is temporary and is not saved after refresh.
const themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("click", function () {
    const isLightMode = document.body.classList.toggle("light-mode");

    themeToggle.innerText = isLightMode ? "☾ Dark mode" : "☀ Light mode";
    themeToggle.setAttribute("aria-pressed", isLightMode);
    themeToggle.setAttribute(
        "aria-label",
        isLightMode ? "Switch to dark mode" : "Switch to light mode"
    );
});
