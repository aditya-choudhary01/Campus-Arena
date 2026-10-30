// Campus Arena - Tournament Registration form
// This page validates the form in the browser. It does not submit a real registration.

const tournamentForm = document.getElementById("tournament-form");
const tournamentFormMessage = document.getElementById("form-message");
const tournamentFormFields = ["name", "gamer-tag", "college", "email", "event-name", "team-name"];

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

function isTournamentEmailValid(email) {
    const parts = email.split("@");
    return parts.length === 2 && parts[0].length > 0 &&
        parts[1].includes(".") && parts[1][0] !== "." &&
        parts[1][parts[1].length - 1] !== ".";
}

function showTournamentFormMessage(message, type) {
    tournamentFormMessage.innerText = message;
    tournamentFormMessage.className = "form-message " + type;
    tournamentFormMessage.hidden = false;
}

tournamentForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let isFormValid = true;
    tournamentFormMessage.hidden = true;

    for (let fieldId of tournamentFormFields) {
        const value = document.getElementById(fieldId).value.trim();
        let errorMessage = value === "" ? "Please enter or select this field." : "";

        if (fieldId === "email" && value !== "" && !isTournamentEmailValid(value)) {
            errorMessage = "Please enter a valid email address.";
        }

        setTournamentError(fieldId, errorMessage);
        if (errorMessage !== "") isFormValid = false;
    }

    const rulesCheckbox = document.getElementById("agree-rules");
    const rulesError = rulesCheckbox.checked ? "" : "Please agree to the tournament rules.";
    setTournamentError("agree-rules", rulesError);
    if (rulesError !== "") isFormValid = false;

    if (isFormValid) {
        showTournamentFormMessage("Your details look valid! This static demo does not save a registration.", "success");
    } else {
        showTournamentFormMessage("Please correct the highlighted fields and try again.", "error");
    }
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
