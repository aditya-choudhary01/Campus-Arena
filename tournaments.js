// Campus Arena - Tournament page interactions
// Concepts used: variables, functions, loops, strings, arrays/collections and DOM events.

const tournamentSearch = document.getElementById("tournament-search");
const tournamentFilters = document.getElementsByName("game-filter");
const tournamentCards = document.getElementsByClassName("tournament-card");
const upcomingCount = document.getElementById("upcoming-count");
const completedCount = document.getElementById("completed-count");
const upcomingEmpty = document.getElementById("upcoming-empty");
const completedEmpty = document.getElementById("completed-empty");

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

function filterTournaments() {
    const searchText = tournamentSearch.value.toLowerCase().trim();
    const selectedGame = getSelectedTournamentGame();

    let upcomingShown = 0;
    let upcomingTotal = 0;
    let completedShown = 0;
    let completedTotal = 0;

    for (let card of tournamentCards) {
        const cardGame = card.getAttribute("data-game");
        const cardText = card.innerText.toLowerCase();
        const matchesGame = selectedGame === "all" || cardGame === selectedGame;
        const matchesSearch = cardText.includes(searchText);
        const shouldShow = matchesGame && matchesSearch;

        card.classList.toggle("hidden-by-search", !shouldShow);

        if (card.classList.contains("closed")) {
            completedTotal++;
            if (shouldShow) completedShown++;
        } else {
            upcomingTotal++;
            if (shouldShow) upcomingShown++;
        }
    }

    upcomingCount.innerText = "Showing " + upcomingShown + " of " + upcomingTotal + " upcoming";
    completedCount.innerText = "Showing " + completedShown + " of " + completedTotal + " completed";

    upcomingEmpty.hidden = upcomingShown !== 0;
    completedEmpty.hidden = completedShown !== 0;
}

for (let filter of tournamentFilters) {
    filter.addEventListener("change", filterTournaments);
}

tournamentSearch.addEventListener("input", filterTournaments);
filterTournaments();

// Favourite buttons only change the current page. They are not saved after refresh.
const tournamentFavoriteButtons = document.getElementsByClassName("favorite-btn");

for (let button of tournamentFavoriteButtons) {
    button.addEventListener("click", function () {
        button.classList.toggle("favorite-active");

        const isFavorite = button.classList.contains("favorite-active");
        button.setAttribute("aria-pressed", isFavorite);
        button.innerText = isFavorite ? "â¥ Saved" : "â¡ Favorite";
    });
}
