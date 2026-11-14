// Campus Arena - Find Teammates page
// Loads sample players from a JSON API and new requests from MongoDB.

const playerSearch = document.getElementById("player-search");
const playerFilters = document.getElementsByName("mate-filter");
const playerGrid = document.getElementById("player-grid");
const playerCount = document.getElementById("player-count");
const playerEmpty = document.getElementById("player-empty");

let databasePlayers = {};

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

    if (player.id) {
        card.setAttribute("data-listing-id", player.id);
        databasePlayers[player.id] = player;
    }

    const playerHead = document.createElement("div");
    playerHead.className = "player-head";

    const initials = player.initials || player.gamerTag.substring(0, 2).toUpperCase();
    playerHead.appendChild(createPlayerTextElement("div", "avatar", initials));

    const playerIdentity = document.createElement("div");
    playerIdentity.appendChild(createPlayerTextElement("h3", "", player.gamerTag));
    playerIdentity.appendChild(createPlayerTextElement("p", "college", player.college));

    playerHead.appendChild(playerIdentity);
    playerHead.appendChild(createPlayerTextElement("span", "game", player.gameName || player.game));

    card.appendChild(playerHead);
    card.appendChild(createPlayerTextElement("p", "role", "Role: " + player.role));
    card.appendChild(createPlayerTextElement("p", "blurb", player.blurb));

    const details = document.createElement("ul");
    const needs = player.needs || [player.lookingFor];
    details.appendChild(createPlayerTextElement("li", "", "Needs: " + needs.join(", ")));
    details.appendChild(createPlayerTextElement("li", "", "Available: " + player.availability));
    card.appendChild(details);

    card.appendChild(createPlayerFavoriteButton());

    // Only the person who created a MongoDB listing sees Edit and Delete.
    if (player.id && player.isOwner) {
        const actions = document.createElement("div");
        actions.className = "listing-actions";

        const editButton = createPlayerTextElement("button", "listing-action-btn edit-listing", "Edit listing");
        editButton.type = "button";
        editButton.setAttribute("data-id", player.id);

        const deleteButton = createPlayerTextElement("button", "listing-action-btn delete-listing", "Delete listing");
        deleteButton.type = "button";
        deleteButton.setAttribute("data-id", player.id);

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);
        card.appendChild(actions);
    }

    const inviteLink = createPlayerTextElement("a", "card-cta", "Invite to squad");
    inviteLink.href = "/pages/contact.html";
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
    databasePlayers = {};

    for (let player of players) {
        const card = createPlayerCard(player);
        playerGrid.appendChild(card);
    }

    filterPlayers();
}

async function loadPlayerCards() {
    try {
        const playerResponse = await fetch("/api/players");

        if (!playerResponse.ok) {
            throw new Error("Could not load sample players.");
        }

        const samplePlayers = await playerResponse.json();

        const teammateResponse = await fetch("/api/teammates");
        let savedTeammates = [];

        if (teammateResponse.ok) {
            savedTeammates = await teammateResponse.json();
        }

        const mongoPlayers = savedTeammates.map(function (item) {
            return {
                id: item.id,
                gamerTag: item.gamerTag,
                initials: item.initials,
                college: item.college,
                game: item.game,
                gameName: item.gameName,
                role: item.role,
                blurb: item.blurb,
                needs: [item.lookingFor],
                availability: item.availability,
                isOwner: item.isOwner
            };
        });

        showPlayerCards(samplePlayers.concat(mongoPlayers));
    } catch (error) {
        console.log(error);
        console.log("Showing the player cards already present in the HTML.");
        filterPlayers();
    }
}

async function editPlayerListing(id) {
    const player = databasePlayers[id];

    if (!player) {
        return;
    }

    const role = prompt("Update your role:", player.role);
    if (role === null) return;

    const lookingFor = prompt("What type of teammate are you looking for?", player.lookingFor || player.needs.join(", "));
    if (lookingFor === null) return;

    const availability = prompt("Update your availability:", player.availability);
    if (availability === null) return;

    const blurb = prompt("Update your short intro (at least 10 characters):", player.blurb);
    if (blurb === null) return;

    try {
        const response = await fetch("/api/teammates/" + id, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                role: role,
                lookingFor: lookingFor,
                availability: availability,
                blurb: blurb
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not update the listing.");
        }

        alert(data.message);
        loadPlayerCards();
    } catch (error) {
        alert(error.message);
    }
}

async function deletePlayerListing(id) {
    const confirmed = confirm("Are you sure you want to delete this teammate listing?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch("/api/teammates/" + id, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not delete the listing.");
        }

        alert(data.message);
        loadPlayerCards();
    } catch (error) {
        alert(error.message);
    }
}

function handlePlayerClick(event) {
    const target = event.target;

    if (target.classList.contains("favorite-btn")) {
        target.classList.toggle("favorite-active");

        const isFavorite = target.classList.contains("favorite-active");
        target.setAttribute("aria-pressed", isFavorite);
        target.innerText = isFavorite ? "♥ Saved" : "♡ Favorite";
    }

    if (target.classList.contains("edit-listing")) {
        editPlayerListing(target.getAttribute("data-id"));
    }

    if (target.classList.contains("delete-listing")) {
        deletePlayerListing(target.getAttribute("data-id"));
    }
}

for (let filter of playerFilters) {
    filter.addEventListener("change", filterPlayers);
}

playerSearch.addEventListener("input", filterPlayers);
playerGrid.addEventListener("click", handlePlayerClick);

// The existing HTML cards are kept as a fallback if the API cannot load.
filterPlayers();
loadPlayerCards();


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
