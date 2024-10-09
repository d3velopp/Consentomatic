document.addEventListener("DOMContentLoaded", function() {
    const modeButton = document.getElementById("modeButton");
    const cookieContainers = document.querySelectorAll(".cookie-container");

    modeButton.addEventListener("click", function() {
        if (modeButton.classList.contains("mode-auto")) {
            modeButton.classList.remove("mode-auto");
            modeButton.classList.add("mode-manual");
            modeButton.textContent = "Mode Manuel";
            cookieContainers.forEach(container => {
                container.classList.add("disabled");
            });
        } else {
            modeButton.classList.remove("mode-manual");
            modeButton.classList.add("mode-auto");
            modeButton.textContent = "Mode Auto";
            cookieContainers.forEach(container => {
                container.classList.remove("disabled");
            });
        }
    });
});