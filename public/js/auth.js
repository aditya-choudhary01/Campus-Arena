// This file checks the login status on every page.
async function updateAccountNavigation() {
    try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();

        if (!data.user) {
            return;
        }

        const nav = document.querySelector("header nav");

        if (!nav) {
            return;
        }

        // Replace the Login link with the user's name.
        const accountLinks = document.querySelectorAll(
            'header a[href="/pages/login.html"], header a[href="/pages/register.html"]'
        );

        let nameLink = null;

        accountLinks.forEach(function (link) {
            if (!nameLink && link.closest("nav")) {
                nameLink = link;
            } else {
                link.remove();
            }
        });

        if (nameLink) {
            nameLink.textContent = data.user.name;
            nameLink.href = "#";
            nameLink.addEventListener("click", function (event) {
                event.preventDefault();
            });
        }

        // Add a Logout button to the navigation.
        const logoutButton = document.createElement("button");
        logoutButton.type = "button";
        logoutButton.className = "theme-toggle";
        logoutButton.textContent = "Logout";

        logoutButton.addEventListener("click", async function () {
            try {
                const logoutResponse = await fetch("/api/auth/logout", {
                    method: "POST"
                });

                if (!logoutResponse.ok) {
                    throw new Error("Logout failed.");
                }

                window.location.href = "/index.html";
            } catch (error) {
                alert("Could not log out. Please try again.");
            }
        });

        nav.appendChild(logoutButton);
    } catch (error) {
        // The page can still be viewed if the backend is not running.
        console.log("Login status is not available. Start the backend to use accounts.");
    }
}

updateAccountNavigation();
