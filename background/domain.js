//Project Consentomatique
//STI INSA Centre-Val de Loire, 2024-2025.
//Titouan GODARD, Léopold MOSSER, Julian HOURNON, Léandro DOS SANTOS.

//domain.js

function returnDomain() {
    //function that will we injected into a tab to get the current domain.
    return window.location.host;
}

async function getDomain(tabID) {
    //async function to get the domain of a tab
    var tmp = await chrome.scripting.executeScript({
        target: {tabId: tabID},
        func : returnDomain
    });
    return tmp[0].result;
}