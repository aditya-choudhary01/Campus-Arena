var searchInput = document.getElementById("player-search");
var extraList = document.getElementById("player-grid");

function applySearch() {
    if (!searchInput) {
        return;
    }
    var query = searchInput.value.toLowerCase().trim();
    var cards = document.querySelectorAll(".player-card");
    for (var i = 0; i < cards.length; i++) {
        var text = cards[i].textContent.toLowerCase();
        if (!query || text.indexOf(query) !== -1) {
            cards[i].classList.remove("hidden-by-search");
        } else {
            cards[i].classList.add("hidden-by-search");
        }
    }
}

if (searchInput) {
    searchInput.addEventListener("input", applySearch);
}

function gameKey(gameName) {
    var name = (gameName || "").toLowerCase();
    if (name.indexOf("valorant") !== -1) {
        return "valorant";
    }
    if (name.indexOf("bgmi") !== -1) {
        return "bgmi";
    }
    if (name.indexOf("cs") !== -1) {
        return "cs2";
    }
    if (name.indexOf("fc") !== -1 || name.indexOf("fifa") !== -1) {
        return "fc";
    }
    return "other";
}

fetch("/data/teammate-posts.json")
    .then(function (res) {
        return res.json();
    })
    .then(function (posts) {
        if (!extraList || !posts.length) {
            return;
        }

        for (var i = posts.length - 1; i >= 0; i--) {
            var post = posts[i];
            var card = document.createElement("article");
            card.className = "player-card";
            card.setAttribute("data-game", gameKey(post.game));
            card.innerHTML =
                "<div class=\"player-head\">" +
                    "<div class=\"avatar\">NEW</div>" +
                    "<div>" +
                        "<h3></h3>" +
                        "<p class=\"college\"></p>" +
                    "</div>" +
                    "<span class=\"game\"></span>" +
                "</div>" +
                "<p class=\"role\"></p>" +
                "<p class=\"blurb\"></p>" +
                "<ul>" +
                    "<li></li>" +
                    "<li></li>" +
                "</ul>" +
                "<a href=\"contact.html\" class=\"card-cta\">Invite to squad</a>";

            card.querySelector("h3").textContent = post.gamerTag || post.name;
            card.querySelector(".college").textContent = post.college || "";
            card.querySelector(".game").textContent = post.game || "";
            card.querySelector(".role").textContent = "Role: " + (post.role || "");
            card.querySelector(".blurb").textContent = post.blurb || "";
            card.querySelectorAll("li")[0].textContent = "Needs: " + (post.lookingFor || "");
            card.querySelectorAll("li")[1].textContent = "Available: " + (post.availability || "");

            extraList.appendChild(card);
        }
    })
    .catch(function () {
        // Server is not running yet. The static cards still work.
    });
