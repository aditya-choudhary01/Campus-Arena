var form = document.getElementById("register-form");
var passwordInput = document.getElementById("password");
var confirmInput = document.getElementById("confirm-password");
var togglePassword = document.getElementById("toggle-password");

togglePassword.addEventListener("click", function () {
    var nextType = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = nextType;
    confirmInput.type = nextType;
    togglePassword.textContent = nextType === "password" ? "Show" : "Hide";
});

form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = requiredValue(document.getElementById("name"), "Full name");
    var gamerTag = requiredValue(document.getElementById("gamer-tag"), "Gamer tag");
    var college = requiredValue(document.getElementById("college"), "College");
    var emailInput = document.getElementById("email");
    var email = emailInput.value.trim();
    var role = requiredValue(document.getElementById("role"), "Account type");
    var password = passwordInput.value;
    var confirmPassword = confirmInput.value;
    var valid = true;

    if (!name || !gamerTag || !college || !role) {
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

    if (password.length < 6) {
        setFieldError(passwordInput, "Password must be at least 6 characters.");
        valid = false;
    } else {
        setFieldError(passwordInput, "");
    }

    if (confirmPassword !== password) {
        setFieldError(confirmInput, "Passwords do not match.");
        valid = false;
    } else if (!confirmPassword) {
        setFieldError(confirmInput, "Please confirm your password.");
        valid = false;
    } else {
        setFieldError(confirmInput, "");
    }

    if (!valid) {
        showFormMessage("Please fix the errors above.", true);
        return;
    }

    var submitBtn = document.getElementById("register-submit");
    setBusy(submitBtn, true);

    saveToJsonFile("users.json", {
        name: name,
        gamerTag: gamerTag,
        college: college,
        email: email.toLowerCase(),
        role: role,
        password: password
    }).then(function (data) {
        setBusy(submitBtn, false);
        if (!data.ok) {
            showFormMessage(data.message, true);
            return;
        }
        showFormMessage("Account created. You can now log in.", false);
        form.reset();
        setTimeout(function () {
            window.location.href = "login.html";
        }, 1000);
    });
});
