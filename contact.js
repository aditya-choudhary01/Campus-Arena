// Campus Arena - Contact form
// This page validates the message in the browser. It does not send an email.

const contactForm = document.getElementById("contact-form");
const contactMessage = document.getElementById("form-message");
const contactText = document.getElementById("message");
const contactCharCount = document.getElementById("char-count");
const contactFields = ["name", "email", "topic", "message"];

function setContactError(fieldId, message) {
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

function isContactEmailValid(email) {
    const parts = email.split("@");
    return parts.length === 2 && parts[0].length > 0 &&
        parts[1].includes(".") && parts[1][0] !== "." &&
        parts[1][parts[1].length - 1] !== ".";
}

function showContactMessage(message, type) {
    contactMessage.innerText = message;
    contactMessage.className = "form-message " + type;
    contactMessage.hidden = false;
}

function updateContactCharacterCount() {
    const maxLength = contactText.maxLength;
    const currentLength = contactText.value.length;

    contactCharCount.innerText = currentLength + " / " + maxLength + " characters";
    contactCharCount.classList.toggle("near-limit", currentLength >= maxLength * 0.8);
}

contactText.addEventListener("input", updateContactCharacterCount);
updateContactCharacterCount();

contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let isFormValid = true;
    contactMessage.hidden = true;

    for (let fieldId of contactFields) {
        const value = document.getElementById(fieldId).value.trim();
        let errorMessage = value === "" ? "Please enter or select this field." : "";

        if (fieldId === "email" && value !== "" && !isContactEmailValid(value)) {
            errorMessage = "Please enter a valid email address.";
        }

        if (fieldId === "message" && value !== "" && value.length < 10) {
            errorMessage = "Please write at least 10 characters.";
        }

        setContactError(fieldId, errorMessage);
        if (errorMessage !== "") isFormValid = false;
    }

    if (isFormValid) {
        showContactMessage("Your message looks good! This static demo does not send or save messages.", "success");
    } else {
        showContactMessage("Please correct the highlighted fields and try again.", "error");
    }
});
