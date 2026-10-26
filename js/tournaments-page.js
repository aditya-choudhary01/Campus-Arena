var searchInput = document.getElementById("tournament-search");
var cards = document.querySelectorAll(".tournament-card");

if (searchInput) {
    searchInput.addEventListener("input", function () {
        var query = searchInput.value.toLowerCase().trim();
        for (var i = 0; i < cards.length; i++) {
            var text = cards[i].textContent.toLowerCase();
            if (!query || text.indexOf(query) !== -1) {
                cards[i].classList.remove("hidden-by-search");
            } else {
                cards[i].classList.add("hidden-by-search");
            }
        }
    });
}
