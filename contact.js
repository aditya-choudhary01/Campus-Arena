// Campus Arena - Contact form
// This page validates the message and saves it through the Express API.

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

contactForm.addEventListener("submit", async function (event) {
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

    if (!isFormValid) {
        showContactMessage("Please correct the highlighted fields and try again.", "error");
        return;
    }

    const submitButton = document.getElementById("contact-submit");
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
        const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: document.getElementById("name").value.trim(),
                email: document.getElementById("email").value.trim(),
                topic: document.getElementById("topic").value,
                message: contactText.value.trim()
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not save your message.");
        }

        showContactMessage(data.message, "success");
        contactForm.reset();
        updateContactCharacterCount();
    } catch (error) {
        showContactMessage(error.message || "Could not connect to the server.", "error");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Send message";
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
