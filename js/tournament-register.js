var form = document.getElementById("tournament-form");
var eventSelect = document.getElementById("event-name");
var requestedEvent = getQueryValue("event");

if (requestedEvent) {
    eventSelect.value = requestedEvent;
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = requiredValue(document.getElementById("name"), "Full name");
    var gamerTag = requiredValue(document.getElementById("gamer-tag"), "Gamer tag");
    var college = requiredValue(document.getElementById("college"), "College");
    var emailInput = document.getElementById("email");
    var email = emailInput.value.trim();
    var eventName = requiredValue(eventSelect, "Tournament");
    var teamName = requiredValue(document.getElementById("team-name"), "Team name");
    var rulesBox = document.getElementById("agree-rules");
    var valid = true;

    if (!name || !gamerTag || !college || !eventName || !teamName) {
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

    if (!rulesBox.checked) {
        setFieldError(rulesBox, "You must agree to the rules.");
        valid = false;
    } else {
        setFieldError(rulesBox, "");
    }

    if (!valid) {
        showFormMessage("Please fix the errors above.", true);
        return;
    }

    var submitBtn = document.getElementById("register-submit");
    setBusy(submitBtn, true);

    saveToJsonFile("registrations.json", {
        name: name,
        gamerTag: gamerTag,
        college: college,
        email: email.toLowerCase(),
        eventName: eventName,
        teamName: teamName
    }).then(function (data) {
        setBusy(submitBtn, false);
        if (!data.ok) {
            showFormMessage(data.message, true);
            return;
        }
        showFormMessage("Registered for " + eventName + ". Saved to data/registrations.json.", false);
        form.reset();
        if (requestedEvent) {
            eventSelect.value = requestedEvent;
        }
    });
});
