// Campus Arena - Find Teammates page interactions
// Concepts used: variables, functions, loops, strings, collections and DOM events.

const playerSearch = document.getElementById("player-search");
const playerFilters = document.getElementsByName("mate-filter");
const playerCards = document.getElementsByClassName("player-card");
const playerCount = document.getElementById("player-count");
const playerEmpty = document.getElementById("player-empty");

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

    for (let card of playerCards) {
        const cardGame = card.getAttribute("data-game");
        const cardText = card.innerText.toLowerCase();
        const matchesGame = selectedGame === "all" || cardGame === selectedGame;
        const matchesSearch = cardText.includes(searchText);
        const shouldShow = matchesGame && matchesSearch;

        card.classList.toggle("hidden-by-search", !shouldShow);
        totalPlayers++;

        if (shouldShow) visiblePlayers++;
    }

    playerCount.innerText = "Showing " + visiblePlayers + " of " + totalPlayers + " players";
    playerEmpty.hidden = visiblePlayers !== 0;
}

for (let filter of playerFilters) {
    filter.addEventListener("change", filterPlayers);
}

playerSearch.addEventListener("input", filterPlayers);
filterPlayers();

// Favourite buttons only change the current page. They are not saved after refresh.
const playerFavoriteButtons = document.getElementsByClassName("favorite-btn");

for (let button of playerFavoriteButtons) {
    button.addEventListener("click", function () {
        button.classList.toggle("favorite-active");

        const isFavorite = button.classList.contains("favorite-active");
        button.setAttribute("aria-pressed", isFavorite);
        button.innerText = isFavorite ? "â¥ Saved" : "â¡ Favorite";
    });
}
