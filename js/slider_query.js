document.addEventListener("DOMContentLoaded", function() {
    const performanceSwitch = document.querySelector(".performance_switch input");
    const fonctionnaliteSwitch = document.querySelector(".fonctionnalite_switch input");
    const marketingSwitch = document.querySelector(".marketing_switch input");
    const othersSwitch = document.querySelector(".others_switch input");

    function updateTextColor(switchElement, textElement) {
        if (!switchElement.checked) {
            textElement.classList.remove("text-red");
            textElement.classList.add("text-green");
        } else {
            textElement.classList.remove("text-green");
            textElement.classList.add("text-red");
        }
    }

    performanceSwitch.addEventListener("change", function() {
        const performanceText = document.querySelector(".cookie_performance");
        updateTextColor(performanceSwitch, performanceText);
    });

    fonctionnaliteSwitch.addEventListener("change", function() {
        const fonctionnaliteText = document.querySelector(".cookie_fonctionnalite");
        updateTextColor(fonctionnaliteSwitch, fonctionnaliteText);
    });

    marketingSwitch.addEventListener("change", function() {
        const marketingText = document.querySelector(".cookie_marketing");
        updateTextColor(marketingSwitch, marketingText);
    });

    othersSwitch.addEventListener("change", function() {
        const othersText = document.querySelector(".cookie_others");
        updateTextColor(othersSwitch, othersText);
    });

    // Initial state
    updateTextColor(performanceSwitch, document.querySelector(".cookie_performance"));
    updateTextColor(fonctionnaliteSwitch, document.querySelector(".cookie_fonctionnalite"));
    updateTextColor(marketingSwitch, document.querySelector(".cookie_marketing"));
    updateTextColor(othersSwitch, document.querySelector(".cookie_others"));
});