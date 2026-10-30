// Campus Arena - Post a Teammate Request form
// This page checks the form in the browser. It does not save or publish a request.

const teammateForm = document.getElementById("teammate-form");
const teammateMessage = document.getElementById("form-message");
const teammateBlurb = document.getElementById("blurb");
const teammateCharCount = document.getElementById("char-count");
const teammateFields = ["name", "gamer-tag", "college", "email", "game", "role", "looking-for", "availability", "blurb"];

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

teammateForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let isFormValid = true;
    teammateMessage.hidden = true;

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

    if (isFormValid) {
        showTeammateMessage("Your form looks good! This static demo does not save or publish requests.", "success");
    } else {
        showTeammateMessage("Please correct the highlighted fields and try again.", "error");
    }
});
