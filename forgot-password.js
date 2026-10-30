// Campus Arena - Forgot Password page
// This page checks the email format. It does not send a password reset email.

const forgotForm = document.getElementById("forgot-form");
const forgotMessage = document.getElementById("form-message");
const forgotEmail = document.getElementById("email");

function isForgotEmailValid(email) {
    const parts = email.split("@");
    return parts.length === 2 && parts[0].length > 0 &&
        parts[1].includes(".") && parts[1][0] !== "." &&
        parts[1][parts[1].length - 1] !== ".";
}

function showForgotMessage(message, type) {
    forgotMessage.innerText = message;
    forgotMessage.className = "form-message " + type;
    forgotMessage.hidden = false;
}

forgotForm.addEventListener("submit", function (event) {
    event.preventDefault();
    forgotMessage.hidden = true;

    const email = forgotEmail.value.trim();
    let errorMessage = "";

    if (email === "") {
        errorMessage = "Please enter your email.";
    } else if (!isForgotEmailValid(email)) {
        errorMessage = "Please enter a valid email address.";
    }

    const emailError = document.getElementById("email-error");
    emailError.innerText = errorMessage;

    if (errorMessage !== "") {
        forgotEmail.classList.add("invalid");
        forgotEmail.setAttribute("aria-invalid", "true");
        showForgotMessage("Please correct the highlighted field and try again.", "error");
    } else {
        forgotEmail.classList.remove("invalid");
        forgotEmail.removeAttribute("aria-invalid");
        showForgotMessage("The email format looks valid. This static demo does not send reset emails.", "success");
    }
});
