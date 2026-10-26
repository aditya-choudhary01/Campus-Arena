var form = document.getElementById("forgot-form");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    var emailInput = document.getElementById("email");
    var email = emailInput.value.trim();

    if (!email) {
        setFieldError(emailInput, "College email is required.");
        showFormMessage("Please fix the errors above.", true);
        return;
    }

    if (!isCollegeEmail(email)) {
        setFieldError(emailInput, "Use a college email ending in .edu or .ac.in");
        showFormMessage("Please fix the errors above.", true);
        return;
    }

    setFieldError(emailInput, "");
    var submitBtn = document.getElementById("forgot-submit");
    setBusy(submitBtn, true);

    saveToJsonFile("password-resets.json", {
        email: email.toLowerCase()
    }).then(function (data) {
        setBusy(submitBtn, false);
        if (!data.ok) {
            showFormMessage(data.message, true);
            return;
        }
        showFormMessage("Reset request saved to data/password-resets.json. You can now return to login.", false);
        form.reset();
    });
});
