// Campus Arena - Post a Teammate Request form
// This page checks the form and sends a teammate request to the Express API.

const teammateForm = document.getElementById("teammate-form");
const teammateMessage = document.getElementById("form-message");
const teammateBlurb = document.getElementById("blurb");
const teammateCharCount = document.getElementById("char-count");
const teammateFields = ["name", "gamer-tag", "college", "email", "game", "role", "looking-for", "availability", "blurb"];
let loggedInUser = null;

function setTeammateError(fieldId, message) {
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

function isTeammateEmailValid(email) {
    const parts = email.split("@");
    return parts.length === 2 && parts[0].length > 0 &&
        parts[1].includes(".") && parts[1][0] !== "." &&
        parts[1][parts[1].length - 1] !== ".";
}

function showTeammateMessage(message, type) {
    teammateMessage.innerText = message;
    teammateMessage.className = "form-message " + type;
    teammateMessage.hidden = false;
}

function updateTeammateCharacterCount() {
    const maxLength = teammateBlurb.maxLength;
    const currentLength = teammateBlurb.value.length;

    teammateCharCount.innerText = currentLength + " / " + maxLength + " characters";
    teammateCharCount.classList.toggle("near-limit", currentLength >= maxLength * 0.8);
}

teammateBlurb.addEventListener("input", updateTeammateCharacterCount);
updateTeammateCharacterCount();

// Fill the personal details from the account that is currently logged in.
async function loadTeammateAccount() {
    try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!data.user) {
            showTeammateMessage("Please log in before posting a teammate request.", "error");
            document.getElementById("post-submit").disabled = true;
            return;
        }

        loggedInUser = data.user;

        document.getElementById("name").value = data.user.name;
        document.getElementById("gamer-tag").value = data.user.gamerTag;
        document.getElementById("college").value = data.user.college;
        document.getElementById("email").value = data.user.email;

        document.getElementById("name").readOnly = true;
        document.getElementById("gamer-tag").readOnly = true;
        document.getElementById("college").readOnly = true;
        document.getElementById("email").readOnly = true;
    } catch (error) {
        showTeammateMessage("Could not check your login. Please refresh the page.", "error");
        document.getElementById("post-submit").disabled = true;
    }
}

loadTeammateAccount();

teammateForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    let isFormValid = true;
    teammateMessage.hidden = true;

    if (!loggedInUser) {
        showTeammateMessage("Please log in before posting a teammate request.", "error");
        return;
    }

    for (let fieldId of teammateFields) {
        const value = document.getElementById(fieldId).value.trim();
        let errorMessage = value === "" ? "Please enter this field." : "";

        if (fieldId === "email" && value !== "" && !isTeammateEmailValid(value)) {
            errorMessage = "Please enter a valid email address.";
        }

        if (fieldId === "blurb" && value !== "" && value.length < 10) {
            errorMessage = "Please write at least 10 characters.";
        }

        setTeammateError(fieldId, errorMessage);
        if (errorMessage !== "") isFormValid = false;
    }

    if (!isFormValid) {
        showTeammateMessage("Please correct the highlighted fields and try again.", "error");
        return;
    }

    const submitButton = document.getElementById("post-submit");
    submitButton.disabled = true;
    submitButton.textContent = "Posting request...";

    try {
        const response = await fetch("/api/teammates", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                game: document.getElementById("game").value,
                role: document.getElementById("role").value.trim(),
                lookingFor: document.getElementById("looking-for").value.trim(),
                availability: document.getElementById("availability").value.trim(),
                blurb: teammateBlurb.value.trim()
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not post your request.");
        }

        showTeammateMessage("Your request has been posted successfully!", "success");
        window.location.href = "teammates.html";
    } catch (error) {
        showTeammateMessage(error.message, "error");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Post request";
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
