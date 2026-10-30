// Campus Arena - Create Account page
// This page validates the form in the browser. It does not create or save an account.

const registerForm = document.getElementById("register-form");
const registerMessage = document.getElementById("form-message");
const registerPassword = document.getElementById("password");
const registerPasswordToggle = document.getElementById("toggle-password");
const registerFields = ["name", "gamer-tag", "college", "email", "role", "password", "confirm-password"];

function setRegisterError(fieldId, message) {
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

function isRegisterEmailValid(email) {
    const parts = email.split("@");
    return parts.length === 2 && parts[0].length > 0 &&
        parts[1].includes(".") && parts[1][0] !== "." &&
        parts[1][parts[1].length - 1] !== ".";
}

function showRegisterMessage(message, type) {
    registerMessage.innerText = message;
    registerMessage.className = "form-message " + type;
    registerMessage.hidden = false;
}

registerPasswordToggle.addEventListener("click", function () {
    if (registerPassword.getAttribute("type") === "password") {
        registerPassword.setAttribute("type", "text");
        registerPasswordToggle.innerText = "Hide";
    } else {
        registerPassword.setAttribute("type", "password");
        registerPasswordToggle.innerText = "Show";
    }
});

registerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    registerMessage.hidden = true;

    let isFormValid = true;

    for (let fieldId of registerFields) {
        const value = document.getElementById(fieldId).value.trim();
        let errorMessage = value === "" ? "Please enter or select this field." : "";

        if (fieldId === "email" && value !== "" && !isRegisterEmailValid(value)) {
            errorMessage = "Please enter a valid email address.";
        }

        if (fieldId === "password" && value !== "" && value.length < 6) {
            errorMessage = "Password must be at least 6 characters.";
        }

        if (fieldId === "confirm-password" && value !== "" && document.getElementById("confirm-password").value !== registerPassword.value) {
            errorMessage = "Passwords do not match.";
        }

        setRegisterError(fieldId, errorMessage);
        if (errorMessage !== "") isFormValid = false;
    }

    if (isFormValid) {
        showRegisterMessage("Your details look valid! This static demo does not create or save accounts.", "success");
    } else {
        showRegisterMessage("Please correct the highlighted fields and try again.", "error");
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
