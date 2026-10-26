var form = document.getElementById("contact-form");
var messageInput = document.getElementById("message");
var counter = document.getElementById("char-count");
var MAX = 500;

function updateCount() {
    var left = MAX - messageInput.value.length;
    counter.textContent = left + " characters left";
}

messageInput.addEventListener("input", updateCount);
updateCount();

form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = requiredValue(document.getElementById("name"), "Name");
    var emailInput = document.getElementById("email");
    var email = emailInput.value.trim();
    var topic = requiredValue(document.getElementById("topic"), "Topic");
    var message = messageInput.value.trim();
    var valid = true;

    if (!name || !topic) {
        valid = false;
    }

    if (!email) {
        setFieldError(emailInput, "Email is required.");
        valid = false;
    } else if (email.indexOf("@") === -1) {
        setFieldError(emailInput, "Enter a valid email.");
        valid = false;
    } else {
        setFieldError(emailInput, "");
    }

    if (message.length < 10) {
        setFieldError(messageInput, "Please write at least 10 characters.");
        valid = false;
    } else {
        setFieldError(messageInput, "");
    }

    if (!valid) {
        showFormMessage("Please fix the errors above.", true);
        return;
    }

    var submitBtn = document.getElementById("contact-submit");
    setBusy(submitBtn, true);

    saveToJsonFile("contacts.json", {
        name: name,
        email: email,
        topic: topic,
        message: message
    }).then(function (data) {
        setBusy(submitBtn, false);
        if (!data.ok) {
            showFormMessage(data.message, true);
            return;
        }
        showFormMessage("Message saved. An organizer can read it in data/contacts.json.", false);
        form.reset();
        updateCount();
    });
});
