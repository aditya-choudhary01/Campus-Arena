// Campus Arena - Login page
// The browser checks the form, then asks Express to log the user in.

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("form-message");
const loginEmail = document.getElementById("email");
const loginPassword = document.getElementById("password");
const loginRole = document.getElementById("role");
const passwordToggle = document.getElementById("toggle-password");
const studentTab = document.getElementById("tab-student");
const organizerTab = document.getElementById("tab-organizer");

function setLoginError(fieldId, message) {
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

function isLoginEmailValid(email) {
    const parts = email.split("@");
    return parts.length === 2 && parts[0].length > 0 &&
        parts[1].includes(".") && parts[1][0] !== "." &&
        parts[1][parts[1].length - 1] !== ".";
}

function showLoginMessage(message, type) {
    loginMessage.innerText = message;
    loginMessage.className = "form-message " + type;
    loginMessage.hidden = false;
}

studentTab.addEventListener("click", function () {
    loginRole.value = "Student Player";
    studentTab.classList.add("active");
    organizerTab.classList.remove("active");
});

organizerTab.addEventListener("click", function () {
    loginRole.value = "Club Organizer";
    organizerTab.classList.add("active");
    studentTab.classList.remove("active");
});

passwordToggle.addEventListener("click", function () {
    if (loginPassword.getAttribute("type") === "password") {
        loginPassword.setAttribute("type", "text");
        passwordToggle.innerText = "Hide";
    } else {
        loginPassword.setAttribute("type", "password");
        passwordToggle.innerText = "Show";
    }
});

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    loginMessage.hidden = true;

    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    let isFormValid = true;

    let emailError = email === "" ? "Please enter your email." : "";
    if (email !== "" && !isLoginEmailValid(email)) {
        emailError = "Please enter a valid email address.";
    }

    setLoginError("email", emailError);

    if (emailError !== "") {
        isFormValid = false;
    }

    const passwordError = password.trim() === "" ? "Please enter your password." : "";
    setLoginError("password", passwordError);

    if (passwordError !== "") {
        isFormValid = false;
    }

    if (!isFormValid) {
        showLoginMessage("Please correct the highlighted fields and try again.", "error");
        return;
    }

    const submitButton = document.getElementById("login-submit");
    submitButton.disabled = true;
    submitButton.textContent = "Logging in...";

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password,
                role: loginRole.value,
                remember: document.getElementById("remember").checked
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not log in.");
        }

        showLoginMessage("Login successful. Opening Campus Arena...", "success");
        window.location.href = "/index.html";
    } catch (error) {
        showLoginMessage(error.message || "Could not connect to the server. Please try again.", "error");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Login to CampusArena";
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
