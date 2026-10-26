// Shared helper functions used by all forms

function isCollegeEmail(email) {
    email = email.toLowerCase();
    return email.endsWith(".edu") || email.endsWith(".ac.in");
}

function setFieldError(input, message) {
    var errorBox = document.getElementById(input.id + "-error");
    if (message) {
        input.classList.add("invalid");
        if (errorBox) {
            errorBox.textContent = message;
        }
    } else {
        input.classList.remove("invalid");
        if (errorBox) {
            errorBox.textContent = "";
        }
    }
}

function showFormMessage(text, isError) {
    var box = document.getElementById("form-message");
    if (!box) {
        return;
    }
    box.hidden = false;
    box.textContent = text;
    box.className = isError ? "form-message error" : "form-message success";
}

function getQueryValue(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
}

function requiredValue(input, label) {
    var value = input.value.trim();
    if (!value) {
        setFieldError(input, label + " is required.");
        return "";
    }
    setFieldError(input, "");
    return value;
}

function saveToJsonFile(fileName, item) {
    return fetch("/api/save", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            file: fileName,
            item: item
        })
    }).then(function (res) {
        return res.json().then(function (data) {
            data.status = res.status;
            return data;
        });
    }).catch(function () {
        return {
            ok: false,
            message: "Could not save. Start the site with: python3 server.py then open http://localhost:3000"
        };
    });
}

function setBusy(button, busy) {
    if (!button) {
        return;
    }
    button.disabled = busy;
    button.dataset.label = button.dataset.label || button.textContent;
    button.textContent = busy ? "Saving..." : button.dataset.label;
}
