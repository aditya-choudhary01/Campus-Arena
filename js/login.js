var studentTab = document.getElementById("tab-student");
var organizerTab = document.getElementById("tab-organizer");
var roleInput = document.getElementById("role");
var loginForm = document.getElementById("login-form");
var togglePassword = document.getElementById("toggle-password");
var passwordInput = document.getElementById("password");
var emailInput = document.getElementById("email");
var rememberBox = document.getElementById("remember");

if (localStorage.getItem("campusarena-email")) {
    emailInput.value = localStorage.getItem("campusarena-email");
    rememberBox.checked = true;
}

studentTab.addEventListener("click", function () {
    studentTab.classList.add("active");
    organizerTab.classList.remove("active");
    roleInput.value = "Student Player";
});

organizerTab.addEventListener("click", function () {
    organizerTab.classList.add("active");
    studentTab.classList.remove("active");
    roleInput.value = "Club Organizer";
});

togglePassword.addEventListener("click", function () {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.textContent = "Hide";
    } else {
        passwordInput.type = "password";
        togglePassword.textContent = "Show";
    }
});

emailInput.addEventListener("blur", function () {
    var email = emailInput.value.trim();
    if (!email) {
        setFieldError(emailInput, "College email is required.");
    } else if (!isCollegeEmail(email)) {
        setFieldError(emailInput, "Use a college email ending in .edu or .ac.in");
    } else {
        setFieldError(emailInput, "");
    }
});

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var email = emailInput.value.trim();
    var password = passwordInput.value;
    var valid = true;

    if (!email) {
        setFieldError(emailInput, "College email is required.");
        valid = false;
    } else if (!isCollegeEmail(email)) {
        setFieldError(emailInput, "Use a college email ending in .edu or .ac.in");
        valid = false;
    } else {
        setFieldError(emailInput, "");
    }

    if (!password) {
        setFieldError(passwordInput, "Password is required.");
        valid = false;
    } else if (password.length < 6) {
        setFieldError(passwordInput, "Password must be at least 6 characters.");
        valid = false;
    } else {
        setFieldError(passwordInput, "");
    }

    if (!valid) {
        showFormMessage("Please fix the errors above.", true);
        return;
    }

    if (rememberBox.checked) {
        localStorage.setItem("campusarena-email", email);
    } else {
        localStorage.removeItem("campusarena-email");
    }

    var submitBtn = document.getElementById("login-submit");
    setBusy(submitBtn, true);

    fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password,
            role: roleInput.value
        })
    }).then(function (res) {
        return res.json();
    }).then(function (data) {
        setBusy(submitBtn, false);
        if (!data.ok) {
            showFormMessage(data.message || "Login failed.", true);
            return;
        }

        localStorage.setItem("campusarena-user", JSON.stringify(data.user));
        showFormMessage(data.message + " Redirecting to tournaments...", false);
        setTimeout(function () {
            window.location.href = "tournaments.html";
        }, 900);
    }).catch(function () {
        setBusy(submitBtn, false);
        showFormMessage("Could not reach the server. Run python3 server.py and open http://localhost:3000", true);
    });
});
