var form = document.getElementById("teammate-form");
var blurbInput = document.getElementById("blurb");
var counter = document.getElementById("char-count");
var MAX = 200;

function updateCount() {
    counter.textContent = (MAX - blurbInput.value.length) + " characters left";
}

blurbInput.addEventListener("input", updateCount);
updateCount();

form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = requiredValue(document.getElementById("name"), "Name");
    var gamerTag = requiredValue(document.getElementById("gamer-tag"), "Gamer tag");
    var college = requiredValue(document.getElementById("college"), "College");
    var emailInput = document.getElementById("email");
    var email = emailInput.value.trim();
    var game = requiredValue(document.getElementById("game"), "Game");
    var role = requiredValue(document.getElementById("role"), "Role");
    var lookingFor = requiredValue(document.getElementById("looking-for"), "Looking for");
    var availability = requiredValue(document.getElementById("availability"), "Availability");
    var blurb = blurbInput.value.trim();
    var valid = true;

    if (!name || !gamerTag || !college || !game || !role || !lookingFor || !availability) {
        valid = false;
    }

    if (!email) {
        setFieldError(emailInput, "College email is required.");
        valid = false;
    } else if (!isCollegeEmail(email)) {
        setFieldError(emailInput, "Use a college email ending in .edu or .ac.in");
        valid = false;
    } else {
        setFieldError(emailInput, "");
    }

    if (blurb.length < 10) {
        setFieldError(blurbInput, "Write a short intro (at least 10 characters).");
        valid = false;
    } else {
        setFieldError(blurbInput, "");
    }

    if (!valid) {
        showFormMessage("Please fix the errors above.", true);
        return;
    }

    var submitBtn = document.getElementById("post-submit");
    setBusy(submitBtn, true);

    saveToJsonFile("teammate-posts.json", {
        name: name,
        gamerTag: gamerTag,
        college: college,
        email: email.toLowerCase(),
        game: game,
        role: role,
        lookingFor: lookingFor,
        availability: availability,
        blurb: blurb
    }).then(function (data) {
        setBusy(submitBtn, false);
        if (!data.ok) {
            showFormMessage(data.message, true);
            return;
        }
        showFormMessage("Post saved. You will see it on Find Teammates after this save.", false);
        form.reset();
        updateCount();
        setTimeout(function () {
            window.location.href = "teammates.html";
        }, 900);
    });
});
