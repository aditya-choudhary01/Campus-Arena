// Campus Arena - Tournament Registration form
// The page gets account details and upcoming events from Express.
// The server saves registrations in data/tournament-registrations.json.

const tournamentForm = document.getElementById("tournament-form");
const tournamentFormMessage = document.getElementById("form-message");
const tournamentFormFields = ["name", "gamer-tag", "college", "email", "event-name", "team-name"];
const eventSelect = document.getElementById("event-name");
const submitButton = document.getElementById("register-submit");
const eventFromUrl = new URLSearchParams(window.location.search).get("event");

let loggedInUser = null;
let registrationIsOpen = false;

function setTournamentError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + "-error");

    error.innerText = message;

    if (message !== "") {
        field.classList.add("invalid");
        field.setAttribute("aria-invalid", "true");
    } else {
        field.classList.remove("invalid");
        field.removeAttribute("aria-invalid");
    }
}

function showTournamentFormMessage(message, type) {
    tournamentFormMessage.innerText = message;
    tournamentFormMessage.className = "form-message " + type;
    tournamentFormMessage.hidden = false;
}

// Fill the user's details from their account.
async function loadLoggedInUser() {
    const response = await fetch("/api/auth/me");
    const data = await response.json();

    if (!data.user) {
        showTournamentFormMessage("Please log in before registering for a tournament.", "error");
        return false;
    }

    loggedInUser = data.user;

    document.getElementById("name").value = loggedInUser.name;
    document.getElementById("gamer-tag").value = loggedInUser.gamerTag;
    document.getElementById("college").value = loggedInUser.college;
    document.getElementById("email").value = loggedInUser.email;

    return true;
}

// Load only future tournaments that the server says are open.
async function loadOpenTournaments() {
    const response = await fetch("/api/open-tournaments");

    if (!response.ok) {
        throw new Error("Could not load upcoming tournaments.");
    }

    const tournaments = await response.json();

    eventSelect.innerHTML = "";

    const firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = "Select an upcoming tournament";
    eventSelect.appendChild(firstOption);

    for (let tournament of tournaments) {
        const option = document.createElement("option");
        option.value = tournament.name;
        option.textContent = tournament.name + " — " + tournament.date;
        eventSelect.appendChild(option);
    }

    if (eventFromUrl) {
        eventSelect.value = eventFromUrl;
    }

    if (tournaments.length === 0) {
        firstOption.textContent = "No upcoming tournaments are open";
        registrationIsOpen = false;
        submitButton.disabled = true;
        submitButton.textContent = "Registration closed";
        showTournamentFormMessage(
            "There are currently no upcoming tournaments open for registration. Past events cannot be registered for.",
            "error"
        );
        return;
    }

    registrationIsOpen = true;
    submitButton.disabled = false;
    submitButton.textContent = "Submit registration";
    tournamentFormMessage.hidden = true;
}

async function loadRegistrationPage() {
    try {
        const isLoggedIn = await loadLoggedInUser();

        if (!isLoggedIn) {
            submitButton.disabled = true;
            submitButton.textContent = "Login required";
            eventSelect.innerHTML = '<option value="">Log in to view upcoming tournaments</option>';
            return;
        }

        await loadOpenTournaments();
    } catch (error) {
        console.log(error);
        submitButton.disabled = true;
        submitButton.textContent = "Unavailable";
        showTournamentFormMessage(error.message, "error");
    }
}

function isTournamentEmailValid(email) {
    const parts = email.split("@");
    return parts.length === 2 && parts[0].length > 0 &&
        parts[1].includes(".") && parts[1][0] !== "." &&
        parts[1][parts[1].length - 1] !== ".";
}

loadRegistrationPage();

tournamentForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    tournamentFormMessage.hidden = true;

    if (!loggedInUser || !registrationIsOpen) {
        showTournamentFormMessage(
            "You must be logged in and select an upcoming tournament.",
            "error"
        );
        return;
    }

    let isFormValid = true;

    for (let fieldId of tournamentFormFields) {
        const value = document.getElementById(fieldId).value.trim();
        let errorMessage = value === "" ? "Please enter or select this field." : "";

        if (fieldId === "email" && value !== "" && !isTournamentEmailValid(value)) {
            errorMessage = "Please use a valid account email.";
        }

        setTournamentError(fieldId, errorMessage);

        if (errorMessage !== "") {
            isFormValid = false;
        }
    }

    const rulesCheckbox = document.getElementById("agree-rules");
    const rulesError = rulesCheckbox.checked ? "" : "Please agree to the tournament rules.";
    setTournamentError("agree-rules", rulesError);

    if (rulesError !== "") {
        isFormValid = false;
    }

    if (!isFormValid) {
        showTournamentFormMessage("Please correct the highlighted fields and try again.", "error");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Saving registration...";

    try {
        const response = await fetch("/api/tournament-registrations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                eventName: eventSelect.value,
                teamName: document.getElementById("team-name").value.trim()
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not save your registration.");
        }

        showTournamentFormMessage(data.message, "success");
        tournamentForm.reset();
        document.getElementById("name").value = loggedInUser.name;
        document.getElementById("gamer-tag").value = loggedInUser.gamerTag;
        document.getElementById("college").value = loggedInUser.college;
        document.getElementById("email").value = loggedInUser.email;
        eventSelect.value = "";
    } catch (error) {
        showTournamentFormMessage(error.message, "error");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Submit registration";
    }
});

// Theme toggle.
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
